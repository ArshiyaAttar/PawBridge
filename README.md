# PawBridge

PawBridge is a MERN-based pet adoption and animal rescue management platform. It connects adopters, shelters, rescuers, and administrators through pet listings, adoption applications, rescue reporting, dashboards, and shelter conversations.

## Project links

- GitHub: https://github.com/ArshiyaAttar/PawBridge
- Live frontend: https://paw-bridge-eta.vercel.app
- Live backend: https://pawbridge-mjpz.onrender.com
- Backend health check: https://pawbridge-mjpz.onrender.com/api/health

## Technology stack

- Frontend: React, Vite, React Router, Bootstrap 5, Lucide icons
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt
- Security: Helmet, CORS restrictions, rate limiting, protected role-based routes
- Deployment: Vercel frontend and Render backend

## Repository structure

```text
PawBridge/
├── backend/
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Request handlers and business logic
│   ├── middleware/          # Authentication and authorization
│   ├── models/              # Mongoose schemas
│   ├── routes/              # REST API routes
│   ├── scripts/             # Admin and demo data setup scripts
│   ├── tests/               # Backend automated tests
│   ├── utils/               # Shared validation helpers
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/components/      # Shared navigation, footer, guards
│   ├── src/context/         # Authentication state
│   ├── src/pages/           # Public, adopter, shelter, rescuer, admin pages
│   ├── src/services/        # Axios API client
│   ├── src/App.jsx          # Lazy-loaded route configuration
│   ├── src/index.css        # Application design system
│   └── package.json
├── DEMO_GUIDE.md
└── README.md
```

## Main features

### Adopters

- Register and log in securely
- Browse, search, and filter available pets
- View pet age, breed, gender, location, health, and vaccination details
- Submit and track adoption applications
- View application status and history
- Ask questions through pet-specific shelter conversations
- Manage profile and password

### Shelters

- Add, edit, and deactivate pet listings
- Review adoption applications for their own pets
- Approve, reject, or place applications under review
- Communicate with prospective adopters
- View shelter dashboard statistics

### Rescuers

- View assigned rescue cases
- Update rescue progress and notes
- Track pending, in-progress, and resolved reports

### Administrators

- View platform statistics
- Manage users and roles
- Activate or deactivate accounts
- Review rescue cases and adoption activity
- Access pet and application management areas

## Local setup

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ArshiyaAttar/PawBridge.git
cd PawBridge
```

### 2. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/pawbridge
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Configure the frontend

In a second terminal:

```bash
cd frontend
npm install
```

For local development, the default API URL is `http://localhost:5000/api`. To use another backend, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at the Vite-provided local URL, normally `http://localhost:5173`.

## Demo data setup

Demo data is never inserted automatically. To create demo users, pets, and adoption applications, add these variables to `backend/.env`:

```env
DEMO_PASSWORD=use_a_local_password_at_least_12_chars
ALLOW_DEMO_SEED=true
NODE_ENV=development
```

Then run:

```bash
cd backend
npm run seed:demo
```

The seed creates four demo roles, sixteen fictional sample pets across puppy, adult, kitten, senior, bird, and special-care categories, and pending, approved, and rejected applications. It is repeat-safe, preserves existing records, and is intended for development databases only. See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for the complete procedure.

## Testing and quality checks

Backend tests:

```bash
cd backend
npm test
```

Backend syntax validation:

```bash
for file in $(find . -path './node_modules' -prune -o -name '*.js' -print); do node --check "$file"; done
```

Frontend lint and production build:

```bash
cd frontend
npm run lint
npm run build
```

The frontend uses lazy-loaded routes to keep the initial JavaScript bundle smaller.

## Important API areas

- `POST /api/auth/register` — adopter registration
- `POST /api/auth/login` — login
- `GET /api/auth/me` — current authenticated user
- `GET /api/pets` — pet listing and filters
- `GET /api/pets/:id` — pet details
- `POST /api/adoptions/:petId/apply` — submit adoption application
- `GET /api/adoptions/my` — adopter applications
- `GET /api/adoptions/manage` — shelter/admin application management
- `PATCH /api/adoptions/:id/review` — review an application
- `GET /api/messages/pet/:petId` — authenticated pet conversation
- `POST /api/messages/pet/:petId` — adopter message to a shelter
- `GET /api/health` — backend health check

## Security notes

- Never commit `.env` files.
- Never place MongoDB credentials, JWT secrets, or demo passwords in frontend source code.
- Public registration can create adopter accounts only.
- Shelter and admin permissions are enforced on the backend.
- Demo seeding requires explicit opt-in and is blocked in production mode.
- Use a separate database for demonstrations and testing.

## Current limitations

- Full MongoDB integration and authenticated end-to-end flows require a configured database and valid test accounts.
- Demo records must be seeded explicitly after deployment.
- The frontend build is split into route chunks, but the shared vendor chunk can still be optimized further if the application grows significantly.

## License

This project is intended for academic demonstration, portfolio presentation, and future development. Add a project-specific license before distributing it publicly.
