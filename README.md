# Team Task Manager

Full-stack Team Task Manager built for the assignment requirements: authentication, project and team management, task assignment, dashboard tracking, role-based access control, REST APIs, PostgreSQL, Prisma, and free-platform deployment.

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Deployment: Render backend, Vercel frontend, Neon/Supabase PostgreSQL

## Features

- Signup and login with JWT authentication
- Admin and Member roles
- Project creation and team member management
- Task creation, assignment, priority, due date, and status tracking
- Dashboard with project count, task status counts, recent tasks, and overdue tasks
- REST API with validation and centralized error handling

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

The backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Environment Variables

Backend:

```txt
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
PORT=
NODE_ENV=
```

Frontend:

```txt
VITE_API_URL=
```

## Main API Endpoints

```txt
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id

GET    /api/dashboard
```

## Deployment

### Database: Neon or Supabase

1. Create a free PostgreSQL database in Neon or Supabase.
2. Copy the PostgreSQL connection string.
3. Use that value as `DATABASE_URL` in Render.
4. For Neon, include `sslmode=require` if it is not already present.
5. For Supabase, use the session pooler or direct connection string for this Render web service.

### Backend: Render

1. Push this repository to GitHub.
2. In Render, create a new Web Service from the repo.
3. Use these settings:
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add backend environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
5. `render.yaml` is included for Blueprint-based setup.

The backend start command runs Prisma migrations before starting Express:

```bash
npm start
```

Internally, `npm start` runs:

```bash
prisma migrate deploy && node src/server.js
```

### Frontend: Vercel

1. In Vercel, import the same GitHub repository.
2. Set the project Root Directory to `frontend`.
3. Use these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add frontend environment variable:
   - `VITE_API_URL`
5. Set `VITE_API_URL` to the deployed backend API URL, for example:

```txt
https://team-task-manager-api.onrender.com/api
```

6. `frontend/vercel.json` is included so React Router routes load correctly on refresh.
7. After Vercel gives you a frontend URL, update Render `FRONTEND_URL` to that exact URL and redeploy the backend.

## Verification

With the backend running locally:

```bash
cd backend
npm run smoke:test
```

The smoke test verifies signup, protected routes, Admin/Member restrictions, project creation, member assignment, task creation, task status updates, dashboard counts, and cleanup.

## Role Rules

- Admin can create projects, manage members, create tasks, assign tasks, edit tasks, and delete projects/tasks.
- Member can view accessible projects/tasks and update task status.
