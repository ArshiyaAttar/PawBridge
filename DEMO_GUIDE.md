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

The script creates these role accounts if they do not already exist:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@pawbridge.demo` | Value of `DEMO_PASSWORD` |
| Adopter | `adopter@pawbridge.demo` | Value of `DEMO_PASSWORD` |
| Shelter | `shelter@pawbridge.demo` | Value of `DEMO_PASSWORD` |
| Rescuer | `rescuer@pawbridge.demo` | Value of `DEMO_PASSWORD` |

Do not publish the password value in a public repository or production frontend.

## 5. Demo pets and applications

The seed script creates six realistic sample pets:

| Pet | Species | Status | Demo purpose |
|---|---|---|---|
| Luna | Dog | Available | Browse, details, questions, application |
| Milo | Cat | Available | Search and species filter |
| Coco | Dog | Available | Health and vaccination details |
| Rio | Bird | Available | Other species listing |
| Bruno | Dog | Pending | Pending adoption workflow |
| Pepper | Cat | Adopted | Adopted status and history |

The homepage also includes three clearly labeled sample adoption listings (Luna, Milo, and Coco). These are illustrative previews; live availability and adoption applications are shown in the pet listings after demo data is seeded.

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
9. Open **My Applications** and show the status.

### Shelter flow

1. Log in as the shelter demo account.
2. Open the shelter dashboard.
3. Review managed pets.
4. Open adoption applications.
5. Review applicant details.
6. Move an application under review, approve it, or reject it.
7. Confirm that an approved pet becomes adopted and competing applications are rejected.

### Rescuer flow

1. Log in as the rescuer demo account.
2. Open the rescuer dashboard.
3. Review assigned rescue cases.
4. Update progress and add rescue notes.
5. Mark a completed case as resolved.

### Admin flow

1. Log in as the admin demo account.
2. Open the admin dashboard.
3. Review users, pets, applications, and rescue statistics.
4. Change user roles or account status where appropriate.
5. Review rescue management and platform activity.

## 7. Adoption workflow rules

- Only authenticated adopter accounts can submit applications.
- A user cannot submit duplicate applications for the same pet.
- Unavailable or adopted pets cannot receive new applications.
- Only the pet’s shelter or an administrator can review its applications.
- Approving an application changes the pet to `Adopted`.
- Other pending applications for an adopted pet are rejected automatically.
- Applicants can view only their own application history.

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
```

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
