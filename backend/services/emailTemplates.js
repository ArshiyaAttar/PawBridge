const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

export const buildBrandedEmail = ({
  title,
  preheader,
  paragraphs = [],
  details = [],
}) => {
  const safeTitle = escapeHtml(title);
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:24px;background:#f3f7f4;font-family:Arial,Helvetica,sans-serif;color:#26332d;">
    <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5eee7;border-radius:16px;">
      <tr><td style="padding:28px 32px;background:#203b2e;border-radius:16px 16px 0 0;">
        <p style="margin:0;color:#c4dfcc;font-size:13px;font-weight:bold;letter-spacing:2px;">PAWBRIDGE</p>
        <h1 style="margin:12px 0 0;color:#ffffff;font-size:25px;line-height:1.3;">${safeTitle}</h1>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        ${paragraphs.map((paragraph) => `<p style="margin:0 0 16px;line-height:1.65;">${escapeHtml(paragraph)}</p>`).join("")}
        ${details.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;border-collapse:collapse;">${details.map(({ label, value }) => `<tr><td style="padding:10px 0;border-bottom:1px solid #edf2ee;color:#65746b;font-size:13px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:10px 0 10px 16px;border-bottom:1px solid #edf2ee;color:#26332d;font-size:14px;line-height:1.5;vertical-align:top;">${escapeHtml(value)}</td></tr>`).join("")}</table>` : ""}
      </td></tr>
      <tr><td style="padding:18px 32px;background:#f7faf7;border-radius:0 0 16px 16px;color:#65746b;font-size:12px;line-height:1.6;">
        PawBridge · Compassion in action<br>
        This is an automated notification about activity on your PawBridge account.
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    "PAWBRIDGE",
    title,
    "",
    ...paragraphs,
    ...(details.length
      ? ["", ...details.map(({ label, value }) => `${label}: ${value}`)]
      : []),
    "",
    "PawBridge - Compassion in action",
    "This is an automated notification about activity on your PawBridge account.",
  ].join("\n");

  return { html, text };
};

export const buildSubmissionEmail = ({ kind, details }) =>
  buildBrandedEmail({
    title: kind === "adoption"
      ? "New adoption application"
      : "New animal rescue report",
    preheader: kind === "adoption"
      ? "A new adoption application needs review."
      : "A new rescue report needs review.",
    paragraphs: [
      kind === "adoption"
        ? "A new adoption application was submitted and is ready for review."
        : "A new animal rescue report was submitted and is ready for review.",
    ],
    details,
  });

export const buildSubmitterConfirmationEmail = ({ kind, name, details }) =>
  buildBrandedEmail({
    title: kind === "adoption"
      ? "We received your adoption application"
      : "We received your rescue report",
    preheader: "Your PawBridge request has been received.",
    paragraphs: [
      `Hello ${name},`,
      kind === "adoption"
        ? "Thank you for applying to adopt. The shelter will review your application, and you can follow its status from your PawBridge account."
        : "Thank you for reporting an animal in need. You can follow updates from your PawBridge account. If the animal is in immediate danger, contact local rescue services directly.",
    ],
    details,
  });

export const buildAdoptionStatusEmail = ({ name, petName, status }) =>
  buildBrandedEmail({
    title: `Your application was ${status.toLowerCase()}`,
    preheader: `There is an update about your application for ${petName}.`,
    paragraphs: [
      `Hello ${name},`,
      `The shelter has ${status.toLowerCase()} your adoption application for ${petName}.`,
      "Sign in to PawBridge to review the latest application details and any feedback from the shelter.",
    ],
    details: [{ label: "Pet", value: petName }, { label: "Status", value: status }],
  });

export const buildRescueAssignmentEmail = ({ rescuerName, animalType, location, reportId }) =>
  buildBrandedEmail({
    title: "A rescue case was assigned to you",
    preheader: "A new PawBridge rescue case needs your attention.",
    paragraphs: [
      `Hello ${rescuerName},`,
      "A rescue case has been assigned to you. Sign in to PawBridge to review the report and coordinate the next steps.",
    ],
    details: [
      { label: "Animal", value: animalType },
      { label: "Location", value: location },
      { label: "Report ID", value: reportId },
    ],
  });

export const buildRescueResolvedEmail = ({ reporterName, animalType, location, reportId }) =>
  buildBrandedEmail({
    title: "Your rescue report was resolved",
    preheader: "There is an update to your PawBridge rescue report.",
    paragraphs: [
      `Hello ${reporterName},`,
      "The rescue team has marked your report as resolved. Thank you for speaking up for an animal in need.",
    ],
    details: [
      { label: "Animal", value: animalType },
      { label: "Location", value: location },
      { label: "Report ID", value: reportId },
      { label: "Status", value: "Resolved" },
    ],
  });
