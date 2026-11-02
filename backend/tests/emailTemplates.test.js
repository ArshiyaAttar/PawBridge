import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAdoptionStatusEmail,
  buildBrandedEmail,
  buildRescueAssignmentEmail,
  buildRescueResolvedEmail,
  buildSubmissionEmail,
  buildSubmitterConfirmationEmail,
} from "../services/emailTemplates.js";

test("escapes untrusted content in branded HTML while preserving text content", () => {
  const email = buildBrandedEmail({
    title: "<script>alert(1)</script>",
    preheader: "Test & preview",
    paragraphs: ["<img src=x onerror=alert(1)>"],
    details: [{ label: "Name", value: "<b>Pet</b>" }],
  });

  assert.equal(email.html.includes("<script>"), false);
  assert.equal(email.html.includes("<img src=x"), false);
  assert.ok(email.html.includes("&lt;script&gt;"));
  assert.ok(email.html.includes("&lt;b&gt;Pet&lt;/b&gt;"));
  assert.ok(email.text.includes("<img src=x onerror=alert(1)>"));
});

test("builds a PawBridge-branded email for every notification workflow", () => {
  const templates = [
    buildSubmissionEmail({ kind: "adoption", details: [] }),
    buildSubmissionEmail({ kind: "rescue", details: [] }),
    buildSubmitterConfirmationEmail({ kind: "adoption", name: "Alex", details: [] }),
    buildSubmitterConfirmationEmail({ kind: "rescue", name: "Alex", details: [] }),
    buildAdoptionStatusEmail({ name: "Alex", petName: "Milo", status: "Approved" }),
    buildAdoptionStatusEmail({ name: "Alex", petName: "Milo", status: "Rejected" }),
    buildRescueAssignmentEmail({
      rescuerName: "Sam",
      animalType: "Dog",
      location: "Solapur",
      reportId: "report-1",
    }),
    buildRescueResolvedEmail({
      reporterName: "Alex",
      animalType: "Dog",
      location: "Solapur",
      reportId: "report-1",
    }),
  ];

  for (const template of templates) {
    assert.ok(template.html.includes("PAWBRIDGE"));
    assert.ok(template.html.includes("#203b2e"));
    assert.ok(template.text.includes("PawBridge"));
    assert.ok(template.html.includes("This is an automated notification"));
  }
});
