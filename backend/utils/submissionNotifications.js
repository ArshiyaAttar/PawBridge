import nodemailer from "nodemailer";
import User from "../models/User.js";

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  const port = Number(SMTP_PORT || 587);

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be configured.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

export const sendSubmissionNotifications = async ({
  adminSubject,
  adminText,
  senderSubject,
  senderText,
  senderEmail,
}) => {
  let transporter;
  try {
    transporter = createTransporter();
  } catch (error) {
    console.error("Email notifications are unavailable:", error.message);
    return false;
  }

  let adminEmails = [];
  let adminLookupFailed = false;
  try {
    adminEmails = process.env.ADMIN_NOTIFICATION_EMAIL
      ? process.env.ADMIN_NOTIFICATION_EMAIL.split(",").map((email) => email.trim()).filter(Boolean)
      : await User.find({ role: "admin", isActive: true }).distinct("email");
  } catch (error) {
    adminLookupFailed = true;
    console.error("Unable to find admin email recipients:", error.message);
  }

  if (adminEmails.length === 0) {
    adminLookupFailed = true;
    console.error("Email notification could not be sent: no admin recipient is configured.");
  }

  const deliveries = adminEmails.map((to) => ({
    recipientType: "admin",
    message: { to, subject: adminSubject, text: adminText },
  }));

  if (senderEmail) {
    deliveries.push({
      recipientType: "sender",
      message: { to: senderEmail, subject: senderSubject, text: senderText },
    });
  } else {
    adminLookupFailed = true;
    console.error("Email notification could not be sent: submitter has no email address.");
  }

  const results = await Promise.allSettled(
    deliveries.map(async ({ message }) => {
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        ...message,
      });

      if (info.rejected?.includes(message.to) || !info.accepted?.includes(message.to)) {
        throw new Error("SMTP server did not accept the recipient.");
      }
    })
  );

  let failed = adminLookupFailed;
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      failed = true;
      console.error(
        `Unable to send ${deliveries[index].recipientType} email notification:`,
        result.reason?.message || "Unknown email delivery error"
      );
    }
  });

  return !failed;
};
