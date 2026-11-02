import test from "node:test";
import assert from "node:assert/strict";
import { createEmailService } from "../services/emailService.js";

const smtpEnvironment = {
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "587",
  SMTP_USER: "sender@example.com",
  SMTP_PASSWORD: "test-app-password",
  MAIL_FROM: "sender@example.com",
  ADMIN_NOTIFICATION_EMAIL: "admin@example.com",
  EMAIL_NOTIFICATIONS_ENABLED: "true",
  EMAIL_NOTIFY_ADMIN: "true",
  EMAIL_NOTIFY_SUBMITTER: "true",
  EMAIL_NOTIFY_ADOPTION_STATUS: "true",
  EMAIL_NOTIFY_RESCUE_ASSIGNMENT: "true",
  EMAIL_NOTIFY_RESCUE_RESOLVED: "true",
};

const createHarness = ({ sendMail, envOverrides = {}, deliveryModel: providedDeliveryModel } = {}) => {
  const records = providedDeliveryModel?.records || new Map();
  const messages = [];
  const logs = [];
  const transportOptions = [];
  const env = { ...smtpEnvironment, ...envOverrides };

  const deliveryModel = providedDeliveryModel || {
    records,
    async create(record) {
      if (records.has(record.dedupeKey)) {
        const error = new Error("duplicate");
        error.code = 11000;
        throw error;
      }

      records.set(record.dedupeKey, { ...record });
      return record;
    },
    findOne({ dedupeKey }) {
      return {
        lean: async () => {
          const record = records.get(dedupeKey);
          return record ? { status: record.status } : null;
        },
      };
    },
    async updateOne({ dedupeKey }, { $set }) {
      const record = records.get(dedupeKey);
      if (record) Object.assign(record, $set);
    },
  };

  const service = createEmailService({
    env,
    deliveryModel,
    logger: { error: (...args) => logs.push(args) },
    transportFactory: (options) => {
      transportOptions.push(options);
      return {
        sendMail: async (message) => {
          messages.push(message);
          if (sendMail) return sendMail(message);
          return { accepted: [message.to], rejected: [] };
        },
      };
    },
  });

  return { service, records, messages, logs, transportOptions, deliveryModel };
};

const notification = (overrides = {}) => ({
  eventKey: "adoption-submitted:application-123",
  type: "submitter_confirmation",
  to: "adopter@example.com",
  subject: "Application received",
  text: "We received your request.",
  html: "<p>We received your request.</p>",
  ...overrides,
});

test("sends one message per configured recipient using Gmail SMTP env settings", async () => {
  const { service, messages, transportOptions, records } = createHarness({
    envOverrides: {
      ADMIN_NOTIFICATION_EMAIL: "admin-one@example.com,admin-two@example.com",
    },
  });

  const result = await service.sendNotifications([
    notification({
      type: "admin_submission",
      to: undefined,
      subject: "New application",
    }),
    notification(),
  ]);

  assert.deepEqual(result, { sent: 3, failed: 0, skipped: 0, allSent: true });
  assert.deepEqual(
    messages.map(({ to }) => to).sort(),
    [
      "admin-one@example.com",
      "admin-two@example.com",
      "adopter@example.com",
    ]
  );
  assert.equal(transportOptions[0].host, "smtp.gmail.com");
  assert.equal(transportOptions[0].port, 587);
  assert.equal(transportOptions[0].secure, false);
  assert.equal(transportOptions[0].auth.pass, "test-app-password");
  assert.ok([...records.values()].every(({ status }) => status === "sent"));
});

test("deduplicates a previously delivered event across service instances", async () => {
  const first = createHarness();
  const firstResult = await first.service.sendNotifications([notification()]);
  assert.equal(firstResult.sent, 1);

  const service = createEmailService({
    env: { ...smtpEnvironment },
    deliveryModel: first.deliveryModel,
    transportFactory: () => ({
      sendMail: async () => {
        throw new Error("Duplicate send should not happen");
      },
    }),
  });

  const secondResult = await service.sendNotifications([notification()]);
  assert.deepEqual(secondResult, { sent: 1, failed: 0, skipped: 0, allSent: true });
});

test("rejects malformed recipients without contacting SMTP", async () => {
  const { service, messages, records, logs } = createHarness();
  const result = await service.sendNotifications([
    notification({ to: "not-an-email" }),
  ]);

  assert.deepEqual(result, { sent: 0, failed: 1, skipped: 0, allSent: false });
  assert.equal(messages.length, 0);
  assert.equal(records.size, 0);
  assert.equal(logs[0][1].errorCode, "INVALID_RECIPIENT");
});

test("records delivery failures and logs no recipient or SMTP secret", async () => {
  const { service, records, logs } = createHarness({
    sendMail: async () => {
      const error = new Error("failed with test-app-password");
      error.code = "ETIMEDOUT";
      throw error;
    },
  });

  const result = await service.sendNotifications([notification()]);

  assert.equal(result.failed, 1);
  assert.equal(result.allSent, false);
  assert.ok([...records.values()].every(
    ({ status, errorCode }) => status === "failed" && errorCode === "ETIMEDOUT"
  ));
  const logged = JSON.stringify(logs);
  assert.equal(logged.includes("test-app-password"), false);
  assert.equal(logged.includes("adopter@example.com"), false);
});

test("notification flags can disable mail without a send attempt", async () => {
  const { service, messages, records } = createHarness({
    envOverrides: { EMAIL_NOTIFY_SUBMITTER: "false" },
  });

  const result = await service.sendNotifications([notification()]);

  assert.deepEqual(result, { sent: 0, failed: 0, skipped: 1, allSent: false });
  assert.equal(messages.length, 0);
  assert.equal(records.size, 0);
});
