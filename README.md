# User Service (Fullstack Node.js + TypeScript)

User management service for the assignment: registration, authentication, roles, status, profile management, and admin access. The project is a fullstack app and includes:
- backend on Node.js + Express + TypeScript + MongoDB
- frontend on Vite + TypeScript (HTML / CSS / JS)

## Implemented Features
- User model: **full name**, **birth date**, **email (unique)**, **password**, **role (admin/user)**, **status (active)**.
- Endpoints:
  - `POST /api/auth/register` — register
  - `POST /api/auth/login` — login
  - `GET /api/users/:id` — get a user (admin or self)
  - `GET /api/users` — list users (admin only)
  - `PATCH /api/users/:id/block` — block user (admin or self)
  - `PATCH /api/users/:id/unblock` — unblock user (admin or self)
- Additional:
  - `GET /api/auth/profile` — current user profile
  - `PUT /api/auth/update-profile` — update profile
  - `POST /api/auth/logout` — logout
  - `GET /api/dashboard` — protected route

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Mongoose, JWT (httpOnly cookies), CORS, Helmet, Rate Limiting
- **Frontend:** Vite, TypeScript, plain HTML/CSS/JS
- **Database:** MongoDB
- **Docker:** docker-compose (node:20 for frontend and backend)

## Project Structure
- `backend/` — API, models, middleware, migrations
- `frontend/` — static pages + JS
- `docker-compose.yml` — infra startup

## User Model
```json
{
  "fullName": "Ivan Ivanov",
  "birthDate": "1995-04-12",
  "email": "user@example.com",
  "username": "ivan95",
  "password": "hashed",
  "role": "user | admin",
  "isActive": true
}
```

## Auth (Important)
- JWT is stored in **httpOnly cookies** (no localStorage).
- All protected requests use `credentials: "include"`.
- Blocked users cannot log in or access data.

## Environment Variables
File: `backend/.env`
```
JWT_SECRET=super_long_random_value
MONGO_URI=mongodb://root:password@mongo:27017/auth-demo?authSource=admin
ADMIN_KEY=change_me_admin_key
```

## Quick Start (Docker)
```bash
docker compose up --build
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

### Migrate Existing Users
```bash
docker compose exec web npm run migrate:users
```

## Run Without Docker
```bash
cd backend
npm install
npm run dev
```
```bash
cd frontend
npm install
npm run dev
```

## Request Examples
### Register
`POST /api/auth/register`
```json
{
  "fullName": "Ivan Ivanov",
  "birthDate": "1995-04-12",
  "email": "user@example.com",
  "username": "ivan95",
  "password": "secret123",
  "adminKey": "optional_admin_key"
}
```

### Login
`POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### Get User by ID (admin or self)
`GET /api/users/:id`

### List Users (admin)
`GET /api/users`

### Block User (admin or self)
`PATCH /api/users/:id/block`

### Unblock User (admin or self)
`PATCH /api/users/:id/unblock`

## Admin Panel (Frontend)
- On the login page you can check **“Go to admin panel after login”**.
- If the user role is **admin**, it redirects to `admin-dashboard`.
- If the user is not admin, it shows a notice and goes to the regular dashboard.

## Security
- `helmet()` for basic headers
- `express-rate-limit` (200 requests / 15 min)
- `httpOnly` cookie for JWT

## Docker Image (Optional)
Dockerfiles for backend and frontend:
- `backend/Dockerfile`
- `frontend/Dockerfile`

Build images:
```bash
docker build -t user-service-backend ./backend
docker build -t user-service-frontend ./frontend
```

Run images (without compose):
```bash
docker run -p 3000:3000 --env-file ./backend/.env user-service-backend
docker run -p 5173:5173 user-service-frontend
```

## Deployment (Short)
**Option 1: Docker Compose**
```bash
docker compose up -d --build
```

**Option 2: Docker images**
1. Build images as above
2. Set environment variables (`JWT_SECRET`, `MONGO_URI`, `ADMIN_KEY`)
3. Run containers

For production, recommended:
- HTTPS
- `sameSite: "none"` and `secure: true` for cookies
- separate MongoDB (managed or self-hosted)
