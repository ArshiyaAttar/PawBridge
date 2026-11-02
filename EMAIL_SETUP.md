# PawBridge Email Setup

PawBridge sends email notifications when an adoption application or rescue report is submitted.

## What emails are sent

When SMTP is configured:

- Active administrators receive a notification about the new adoption application or rescue report.
- The submitting user receives a confirmation email at their registered email address.
- If `ADMIN_NOTIFICATION_EMAIL` is set, it overrides the active admin accounts in MongoDB.

Email delivery is intentionally non-blocking. If SMTP is unavailable, the application record is still saved and the API reports that email delivery was unavailable.

## Required environment variables

Add these variables to `backend/.env` locally or to the Render service environment:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password-or-app-password
MAIL_FROM=PawBridge <verified-sender@example.com>
```

Optional administrator recipient override:

```env
ADMIN_NOTIFICATION_EMAIL=admin@example.com,second-admin@example.com
```

If the override is empty, PawBridge loads active users with the `admin` role from MongoDB.

## Recommended provider options

### Gmail with an app password

Use this only with a Google account that has two-step verification enabled:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASSWORD=your-16-character-app-password
MAIL_FROM=PawBridge <your-gmail-address@gmail.com>
```

Use a Google app password, not the normal account password. The sender address should match the authenticated Gmail account.

### Brevo SMTP relay

Brevo is suitable for application emails and provides SMTP credentials separately from the web dashboard password:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-login
SMTP_PASSWORD=your-brevo-smtp-key
MAIL_FROM=PawBridge <verified-sender@your-domain.com>
```

Verify the sender or domain in the provider dashboard before testing delivery.

## Local setup

1. Copy the backend environment template:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Add valid SMTP values to `backend/.env`.
3. Start MongoDB and the backend:

   ```bash
   npm run dev
   ```

4. Create or use an adopter account with a real email address.
5. Submit an adoption application or rescue report from the frontend.
6. Check the backend terminal for SMTP errors and check the configured inboxes.

Do not commit `backend/.env` and do not paste SMTP credentials into frontend files.

## Render setup

In the Render dashboard:

1. Open the PawBridge backend service.
2. Go to **Environment**.
3. Add the SMTP variables as secret environment values.
4. Use a verified sender address in `MAIL_FROM`.
5. Add `ADMIN_NOTIFICATION_EMAIL` if you want notifications delivered to a fixed address instead of active admin accounts.
6. Save the changes and redeploy the service.

Example Render values:

```env
NODE_ENV=production
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-login
SMTP_PASSWORD=your-smtp-key
MAIL_FROM=PawBridge <verified-sender@example.com>
ADMIN_NOTIFICATION_EMAIL=admin@example.com
```

Never enable demo seeding in the production environment merely to configure email.

## Troubleshooting

### Email notifications say SMTP is unavailable

Check that `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD` are present. Confirm that the backend service was redeployed after changing environment variables.

### Authentication fails

Use an app password for Gmail or the SMTP key supplied by your provider. Do not use the normal Gmail account password.

### Messages are accepted but not delivered

Check the provider's sender verification, spam folder, account limits, and delivery logs. Confirm that `MAIL_FROM` uses a verified address or domain.

### Admin does not receive the notification

Set `ADMIN_NOTIFICATION_EMAIL` explicitly, or confirm that an active MongoDB user has the `admin` role and a valid email address.

### The API request fails because of email

The notification helper is designed to preserve the underlying adoption or rescue record even when email delivery fails. Inspect the backend logs, correct SMTP settings, and retry only if a new notification is required.

## Verification

The backend includes a regression test confirming that missing SMTP configuration is handled safely:

```bash
cd backend
npm test
```
