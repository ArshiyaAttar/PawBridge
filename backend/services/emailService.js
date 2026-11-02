import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import EmailNotification from "../models/EmailNotification.js";

const EMAIL_PATTERN =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

const notificationFlags = {
  admin_submission: "EMAIL_NOTIFY_ADMIN",
  submitter_confirmation: "EMAIL_NOTIFY_SUBMITTER",
  adoption_status: "EMAIL_NOTIFY_ADOPTION_STATUS",
  rescue_assignment: "EMAIL_NOTIFY_RESCUE_ASSIGNMENT",
  rescue_resolution: "EMAIL_NOTIFY_RESCUE_RESOLVED",
};

const isValidEmail = (email) =>
  typeof email === "string" &&
  email.length <= 254 &&
  EMAIL_PATTERN.test(email.trim());

const errorCodeOf = (error) =>
  typeof error?.code === "string" && /^[A-Z0-9_]+$/i.test(error.code)
    ? error.code
    : "UNKNOWN";

const readBooleanSetting = (env, name, defaultValue = true) => {
  const value = env[name];
  if (value === undefined || value === "") return defaultValue;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return null;
};

const getSmtpConfig = (env) => {
  const port = Number(env.SMTP_PORT);
  const from = env.MAIL_FROM?.trim();
  const fromAddress = from?.match(/<([^<>]+)>$/)?.[1] || from;

  if (
    !env.SMTP_HOST?.trim() ||
    !isValidEmail(env.SMTP_USER?.trim()) ||
    !env.SMTP_PASSWORD ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !isValidEmail(fromAddress)
  ) {
    return null;
  }

  return {
    host: env.SMTP_HOST.trim(),
    port,
    secure: port === 465,
    user: env.SMTP_USER.trim(),
    password: env.SMTP_PASSWORD,
    from,
  };
};

const getAdminRecipients = (env) =>
  (env.ADMIN_NOTIFICATION_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

export const createEmailService = ({
  env = process.env,
  deliveryModel = EmailNotification,
  transportFactory = nodemailer.createTransport,
  logger = console,
} = {}) => {
  let cachedTransport;
  let cachedTransportKey;

  const getTransport = (config) => {
    const configKey = createHash("sha256")
      .update(`${config.host}\0${config.port}\0${config.user}\0${config.password}`)
      .digest("hex");

    if (!cachedTransport || cachedTransportKey !== configKey) {
      cachedTransport = transportFactory({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: config.password },
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      cachedTransportKey = configKey;
    }

    return cachedTransport;
  };

  const logFailure = (type, errorCode) => {
    logger.error("Email notification failed", { type, errorCode });
  };

  const sendOne = async ({ eventKey, type, to, subject, text, html }) => {
    const enabled = readBooleanSetting(env, "EMAIL_NOTIFICATIONS_ENABLED");
    const typeFlag = notificationFlags[type];
    const typeEnabled = typeFlag
      ? readBooleanSetting(env, typeFlag)
      : false;

    if (enabled === false || typeEnabled === false) {
      return { status: "skipped" };
    }
    if (enabled === null || typeEnabled === null) {
      logFailure(type, "INVALID_EMAIL_SETTING");
      return { status: "failed" };
    }

    if (!isValidEmail(to)) {
      logFailure(type, "INVALID_RECIPIENT");
      return { status: "failed" };
    }

    if (
      typeof eventKey !== "string" ||
      !eventKey.trim() ||
      eventKey.length > 200 ||
      !typeFlag ||
      typeof subject !== "string" ||
      subject.length > 200 ||
      /[\r\n]/.test(subject) ||
      typeof text !== "string" ||
      typeof html !== "string"
    ) {
      logFailure(type, "INVALID_NOTIFICATION");
      return { status: "failed" };
    }

    const smtpConfig = getSmtpConfig(env);
    if (!smtpConfig) {
      logFailure(type, "SMTP_CONFIGURATION_INVALID");
      return { status: "failed" };
    }

    const recipientHash = createHash("sha256")
      .update(to.trim().toLowerCase())
      .digest("hex");
    const dedupeKey = `${eventKey}:${type}:${recipientHash}`;

    try {
      await deliveryModel.create({
        dedupeKey,
        type,
        status: "pending",
      });
    } catch (error) {
      if (error?.code === 11000) {
        try {
          const existing = await deliveryModel.findOne({ dedupeKey }).lean();
          return {
            status: existing?.status === "sent" ? "sent" : "duplicate",
          };
        } catch (lookupError) {
          logFailure(type, errorCodeOf(lookupError));
          return { status: "failed" };
        }
      }

      logFailure(type, errorCodeOf(error));
      return { status: "failed" };
    }

    try {
      const transporter = getTransport(smtpConfig);
      const result = await transporter.sendMail({
        from: smtpConfig.from,
        to: to.trim(),
        subject,
        text,
        html,
      });
      const accepted = (result.accepted || []).some(
        (address) => String(address).toLowerCase() === to.trim().toLowerCase()
      );

      if (
        !accepted ||
        (result.rejected || []).some(
          (address) => String(address).toLowerCase() === to.trim().toLowerCase()
        )
      ) {
        const error = new Error("SMTP recipient was not accepted");
        error.code = "RECIPIENT_REJECTED";
        throw error;
      }

      try {
        await deliveryModel.updateOne(
          { dedupeKey },
          { $set: { status: "sent", sentAt: new Date(), errorCode: "" } }
        );
      } catch (error) {
        logFailure(type, errorCodeOf(error));
      }

      return { status: "sent" };
    } catch (error) {
      const errorCode = errorCodeOf(error);
      logFailure(type, errorCode);

      try {
        await deliveryModel.updateOne(
          { dedupeKey },
          { $set: { status: "failed", errorCode } }
        );
      } catch (updateError) {
        logFailure(type, errorCodeOf(updateError));
      }

      return { status: "failed" };
    }
  };

  const sendNotifications = async (notifications) => {
    const results = [];

    for (const notification of notifications) {
      const enabled = readBooleanSetting(env, "EMAIL_NOTIFICATIONS_ENABLED");
      const typeFlag = notificationFlags[notification.type];
      const typeEnabled = typeFlag
        ? readBooleanSetting(env, typeFlag)
        : false;

      if (enabled === false || typeEnabled === false) {
        results.push({ status: "skipped" });
        continue;
      }

      const recipients = notification.type === "admin_submission"
        ? (Array.isArray(notification.to)
          ? notification.to
          : getAdminRecipients(env))
        : [notification.to];

      if (recipients.length === 0) {
        logFailure(notification.type, "ADMIN_RECIPIENT_NOT_CONFIGURED");
        results.push({ status: "failed" });
        continue;
      }

      const recipientResults = await Promise.all(
        recipients.map((to) => sendOne({ ...notification, to }))
      );
      results.push(...recipientResults);
    }

    const sent = results.filter((result) => result.status === "sent").length;
    const failed = results.filter((result) => result.status === "failed").length;
    const skipped = results.filter(
      (result) => result.status === "skipped" || result.status === "duplicate"
    ).length;

    return {
      sent,
      failed,
      skipped,
      allSent: results.length > 0 && failed === 0 && skipped === 0,
    };
  };

  return { sendNotifications };
};

const emailService = createEmailService({
  transportFactory: (options) => nodemailer.createTransport(options),
});

export const sendEmailNotifications = async (notifications) => {
  try {
    return await emailService.sendNotifications(notifications);
  } catch (error) {
    console.error("Email notification processing failed", {
      errorCode: errorCodeOf(error),
    });
    return { sent: 0, failed: 1, skipped: 0, allSent: false };
  }
};
