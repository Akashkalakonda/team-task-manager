# Team Task Manager

Full-stack Team Task Manager built for the assignment requirements: authentication, project and team management, task assignment, dashboard tracking, role-based access control, REST APIs, PostgreSQL, Prisma, and Railway deployment.

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Deployment: Railway

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

## Railway Deployment

1. Push the project to GitHub.
2. Create a Railway PostgreSQL database.
3. Create a Railway backend service from the `backend` folder.
4. Add backend variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
5. Set the backend start command to:

```bash
npm run prisma:deploy && npm start
```

6. Deploy the frontend from the `frontend` folder.
7. Set `VITE_API_URL` to the deployed backend API URL, for example:

```txt
https://your-backend.up.railway.app/api
```

## Role Rules

- Admin can create projects, manage members, create tasks, assign tasks, edit tasks, and delete projects/tasks.
- Member can view accessible projects/tasks and update task status.
