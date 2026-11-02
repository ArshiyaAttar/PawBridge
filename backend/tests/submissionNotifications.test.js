import test from "node:test";
import assert from "node:assert/strict";
import { sendSubmissionNotifications } from "../utils/submissionNotifications.js";

test("reports email delivery unavailable when SMTP is not configured", async () => {
  const envKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"];
  const originalValues = Object.fromEntries(
    envKeys.map((key) => [key, process.env[key]])
  );
  const originalConsoleError = console.error;
  console.error = () => {};

  envKeys.forEach((key) => delete process.env[key]);

  try {
    const sent = await sendSubmissionNotifications({
      adminSubject: "New request",
      adminText: "Request details",
      senderSubject: "Request received",
      senderText: "Confirmation details",
      senderEmail: "sender@example.com",
    });

    assert.equal(sent, false);
  } finally {
    envKeys.forEach((key) => {
      if (originalValues[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValues[key];
      }
    });
    console.error = originalConsoleError;
  }
});
