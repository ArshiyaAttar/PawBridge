# PawBridge Demo and Setup Guide

This guide explains how to prepare PawBridge for a college demonstration, project viva, or local presentation. It intentionally uses environment variables for passwords and database credentials so sensitive values are not committed to GitHub.

## 1. Demo prerequisites

Install:

- Node.js 18+
- npm
- MongoDB Atlas or local MongoDB
- Git

You need two terminals: one for the backend and one for the frontend.

## 2. Configure MongoDB

Create a database named `pawbridge` in MongoDB Atlas or use a local MongoDB database. Add the deployment IP address to the Atlas network access list if using Atlas.

Copy the environment template:

```bash
cd backend
cp .env.example .env
```

Set the backend values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/pawbridge
JWT_SECRET=generate_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Do not commit `backend/.env`.

## 3. Install and run the project

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend, in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL shown by Vite. The backend health endpoint should return a success response:

```text
http://localhost:5000/api/health
```

## 4. Create demonstration data

Demo seed data is explicit and repeat-safe. It does not run during application startup and is blocked in production mode.

Add a local demo password to `backend/.env`:

```env
DEMO_PASSWORD=use_a_local_password_at_least_12_chars
ALLOW_DEMO_SEED=true
NODE_ENV=development
```

Run:

```bash
cd backend
npm run seed:demo
```

The script creates these role accounts if they do not already exist. Existing adopter, shelter, and rescuer demo profiles are updated to the listed email addresses without changing their IDs:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pawbridge.demo` | Value of `DEMO_PASSWORD` |
| Adopter | `pawbridge.demo.adopter@gmail.com` | Value of `DEMO_PASSWORD` |
| Shelter | `pawbridge.demo.shelter@gmail.com` | Value of `DEMO_PASSWORD` |
| Rescuer | `pawbridge.demo.rescuer@gmail.com` | Value of `DEMO_PASSWORD` |

These are demo login identifiers only; the seed does not create or verify Gmail inboxes. Set `EMAIL_NOTIFICATIONS_ENABLED=false` in local `.env` during demonstrations unless you own the recipient addresses. Do not publish the password value in a public repository or production frontend.

## 5. Sample pets and applications

The seed script creates sixteen fictional sample pet profiles for local development: fourteen marked Available, one Pending, and one Adopted.

| Pet | Species | Status | Demo purpose |
|---|---|---|---|
| Luna | Dog | Available | Browse, details, questions, application |
| Milo | Cat | Available | Search and species filter |
| Coco | Dog | Available | Health and vaccination details |
| Rio | Bird | Available | Other species listing |
| Moti | Dog | Available | Solapur-area listing |
| Gauri | Cat | Available | Akkalkot-area listing |
| Bittu | Dog | Available | Barshi-area listing |
| Chiku | Cat | Available | Pandharpur-area listing |
| Bruno | Dog | Pending | Pending adoption workflow |
| Pepper | Cat | Adopted | Adopted status and history |
| Buddy | Dog | Available | Puppy category and training expectations |
| Simba | Cat | Available | Adult cat and quiet-home profile |
| Daisy | Dog | Available | Senior pet adoption scenario |
| Kiwi | Rabbit | Available | Other-species and enclosure guidance |
| Zoro | Dog | Available | Special-care and accessibility scenario |
| Sky | Bird | Available | Bird category and habitat guidance |

The browse page supports puppy, adult dog, kitten, adult cat, senior, bird, and special-care categories. Shelters can assign or edit these categories from the add-pet and edit-pet forms.

The homepage and Browse Pets page keep API-backed adoption listings separate from clearly labeled showcase profiles. Showcase cards cannot receive applications. Seeded profiles are fictional local-development data, not verified or live adoption offers. The seed command is blocked in production mode and should only be used with a development database.

It also creates three application records:

- Bruno: Pending
- Pepper: Approved
- Luna: Rejected

Existing records are preserved. Demo pets use internal demo keys so repeated seed runs do not duplicate them.

## 6. Suggested presentation flow

### Adopter flow

1. Log in as the adopter demo account.
2. Open **Adopt a Pet**.
3. Search for a pet by name or breed.
4. Filter by species.
5. Open a pet details page.
6. Review age, gender, location, health, and vaccination information.
7. Send a question to the shelter.
8. Complete the adoption application form.
9. Optionally request home delivery and provide the destination address.
10. Open **My Applications** and show the status, fee, and delivery decision.

### Shelter flow

1. Log in as the shelter demo account.
2. Open the shelter dashboard.
3. Review managed pets.
4. Open adoption applications.
5. Review applicant details.
6. Set an adoption fee on a pet listing; use ₹0 for a no-fee adoption.
7. Move an application under review, approve it, or reject it. For a delivery request, choose whether delivery is possible.
8. At handoff, record COD collection for an approved application with a fee.
9. Confirm that an approved pet becomes adopted and competing applications are rejected.

Any signed-in user can submit a pet listing with a JPEG, PNG, or WebP photo (up to 5 MB) and a contact phone number. Submissions and subsequent edits stay hidden until an admin approves them from **Pet listing requests**. Rejected listings include admin feedback and can be edited and resubmitted. Photos are stored with pet records in MongoDB.

### Rescuer flow

1. Log in as the rescuer demo account.
2. Open the rescuer dashboard.
3. Review assigned rescue cases.
4. Update progress and add rescue notes.
5. Mark a completed case as resolved.
6. Confirm collection of any pledged cash donation on an assigned case.

### Admin flow

1. Log in as the admin demo account.
2. Open the admin dashboard.
3. Review users, pets, applications, and rescue statistics.
4. Change user roles or account status where appropriate.
5. Review rescue management and platform activity.
6. Confirm collection of cash donation pledges when received.

## 7. Adoption workflow rules

- Only authenticated adopter accounts can submit applications.
- A user cannot submit duplicate applications for the same pet.
- Unavailable or adopted pets cannot receive new applications.
- Only the pet’s shelter or an administrator can review its applications.
- Approving an application changes the pet to `Adopted`.
- Other pending applications for an adopted pet are rejected automatically.
- Applicants can view only their own application history.
- Pet listings from any signed-in user are private until an admin approves them; edits to a listing return it to pending review.
- Adoption applications include a reachable phone number, household consent, and pet-care plan; a veterinarian reference is optional.
- Adoption fees are set per pet, snapshotted when an application is submitted, and recorded as COD only after shelter/admin confirmation at handoff. This records a cash collection; no online payment processor is integrated.
- Home delivery requests are considered case by case. A shelter must approve availability and confirm any delivery charges; no carrier or delivery charge is automatically arranged.
- Rescue donations are optional cash pledges, not online payments. An admin or the assigned rescuer records collection after receiving the cash.

## 8. Messaging workflow

On an available pet’s details page, an authenticated adopter can use **Chat with the shelter**. Messages are stored in MongoDB and limited to the adopter/shelter conversation for that pet. The API validates message length and requires authentication.

## 9. Verification commands

Run backend tests:

```bash
cd backend
npm test
```

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

Check the API health endpoint:

```bash
curl http://localhost:5000/api/health
```

## 10. Deployment notes

### Vercel frontend

Configure:

```env
VITE_API_URL=https://pawbridge-mjpz.onrender.com/api
```

The frontend is deployed at:

https://paw-bridge-eta.vercel.app

### Render backend

Configure these environment variables in Render:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://paw-bridge-eta.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sender@gmail.com
SMTP_PASSWORD=your-google-app-password
MAIL_FROM=your-sender@gmail.com
ADMIN_NOTIFICATION_EMAIL=your-admin-email@example.com
EMAIL_NOTIFICATIONS_ENABLED=true
EMAIL_NOTIFY_ADMIN=true
EMAIL_NOTIFY_SUBMITTER=true
EMAIL_NOTIFY_ADOPTION_STATUS=true
EMAIL_NOTIFY_RESCUE_ASSIGNMENT=true
EMAIL_NOTIFY_RESCUE_RESOLVED=true
```

Set these as individual environment variables in the Render backend service. For Gmail, enable 2-Step Verification on the sender account and create a Google App Password; use that App Password for `SMTP_PASSWORD`, never the account password. `SMTP_USER` and `MAIL_FROM` should be the sender account, while `ADMIN_NOTIFICATION_EMAIL` is the admin recipient address (comma-separated addresses are supported). Keep all credentials in Render, not in Git or frontend variables.

When enabled, new adoption applications and rescue reports notify the configured admin and send a confirmation to the submitting user's registered email. Adoption approval/rejection, rescue assignment, and rescue resolution send event-specific messages. Set `EMAIL_NOTIFICATIONS_ENABLED=false` to turn off all mail, or set an individual `EMAIL_NOTIFY_*` value to `false` to disable that category.

Email delivery is best-effort and idempotent: the database operation succeeds independently of SMTP, and a delivery ledger prevents duplicate sends for the same event and recipient. Failures are logged using notification type and sanitized error code only; delivery records can be inspected in the `emailnotifications` collection. If SMTP is unavailable, the request is still saved and the API response reports that the email notification was not sent.

Do not set `ALLOW_DEMO_SEED=true` in production unless you intentionally run the guarded seed once against a dedicated demo database. Prefer running the seed from a secure Render shell or a local machine connected to the demonstration database.

The backend is deployed at:

https://pawbridge-mjpz.onrender.com

## 11. Safe reset guidance

The demo seed is additive and does not delete existing records. Do not drop the database during a live demonstration. If a clean reset is required, use a separate demonstration database and reset it manually with an approved backup/restore process.

## 12. Known limitations

- An authenticated MongoDB environment is required to verify the full adoption workflow.
- Vercel and Render deployments may cold-start after inactivity.
- Demo data is not created automatically by the application.
- Do not use demo accounts or sample data for production operations.
