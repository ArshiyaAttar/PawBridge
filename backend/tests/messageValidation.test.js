import test from "node:test";
import assert from "node:assert/strict";
import { validateMessageBody } from "../utils/messageValidation.js";

test("accepts a trimmed shelter question within the allowed length", () => {
  assert.equal(validateMessageBody("  Is Luna comfortable around children?  "), null);
});

test("rejects missing or non-string message bodies", () => {
  assert.equal(validateMessageBody(undefined), "Message is required");
  assert.equal(validateMessageBody(null), "Message is required");
  assert.equal(validateMessageBody(42), "Message is required");
});

test("rejects messages shorter than two characters", () => {
  assert.equal(
    validateMessageBody("  "),
    "Message must contain at least 2 characters"
  );
  assert.equal(
    validateMessageBody("x"),
    "Message must contain at least 2 characters"
  );
});

test("rejects messages longer than 2000 characters", () => {
  assert.equal(
    validateMessageBody("x".repeat(2001)),
    "Message cannot exceed 2000 characters"
  );
});
