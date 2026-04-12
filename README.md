# TaskFlow

A minimal but production-quality task management system built as a full-stack engineering assignment. Users can register, log in, create projects, add tasks, assign them to team members, and track progress across a kanban-style board.

---

## 1. Overview

### What it does
- **Authentication** — register and login with JWT-based auth (24h expiry, bcrypt password hashing)
- **Projects** — create and manage projects; view projects you own or have tasks assigned in
- **Tasks** — create tasks with title, description, status, priority, assignee, and due date
- **Kanban board** — tasks grouped by status (Todo / In Progress / Done) with optimistic UI updates
- **Role-based access** — only project owners can create, edit, or delete tasks and projects

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken) + bcrypt (cost 12) |
| Migrations | node-pg-migrate (raw SQL) |
| Logging | pino + pino-http (structured JSON) |
| Validation | Zod |
| Frontend | React 18 + TypeScript |
| Routing | React Router v6 |
| State / Data | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Component Library | Radix UI primitives |
| HTTP Client | Axios |
| Containerisation | Docker + Docker Compose |

> **Note on language choice:** The spec prefers Go. I chose Node.js + TypeScript because I can write production-quality, reviewable code in it.

---

## 2. Architecture Decisions

### Backend structure — controllers / services / routes

I split the backend into three layers:

- **Routes** — declare HTTP method + path, apply middleware
- **Controllers** — parse and validate request, call service, return response
- **Services** — all business logic and database queries live here

This keeps each layer thin and focused. Controllers never touch the database. Services never touch `req`/`res`. This makes the code easy to read and easy to test independently.

### Raw SQL over ORM

The spec explicitly says "not auto-migrate or ORM magic." I used `node-pg-migrate` with plain `.sql` migration files. Every schema change is an explicit, versioned, reversible file. This is closer to how production teams manage schema than Prisma auto-migrate.

### Zod for validation

Zod schemas live in the controller layer. They validate incoming request bodies and produce structured error responses (`{ error: "validation failed", fields: { ... } }`). Using Zod also means TypeScript types are derived from the schema — no duplication.

### TanStack Query on the frontend

TanStack Query handles all server state — fetching, caching, invalidation, and loading/error states. This means components stay clean and I get cache invalidation for free when mutations succeed. It also made implementing optimistic UI for task status changes straightforward.

### Optimistic UI for task status

When a user changes a task status via the dropdown on a task card, the UI updates immediately before the API call completes. If the API call fails, the status reverts. This is implemented with `onMutate` / `onError` in TanStack Query's `useMutation`.

### Auth context + axios interceptor

Auth state (token + user) is stored in `localStorage` and loaded into a React context on app start — so it persists across page refreshes. An axios request interceptor automatically attaches the `Authorization` header to every API call. A response interceptor catches 401s from protected routes and redirects to `/login`, but deliberately ignores 401s from `/auth/*` routes to avoid a redirect loop on bad login credentials.

### Project visibility

A user sees a project if they own it **or** have at least one task assigned to them in it. This matches the spec's intent. Only the project owner can create, edit, or delete tasks and projects — non-owners can view tasks and see the kanban board, but all write actions are locked.

### Assignee UX decision

The spec defines `assignee_id` as a nullable UUID but doesn't specify how users discover each other. I chose to show all registered users in the assignee dropdown. This keeps the flow simple and testable without needing a separate invite/membership system. In a real product, you'd scope this to project members only.

### What I intentionally left out

- **Pagination** — list endpoints return all records. With the data volume of this assignment this is fine. Pagination would be the first thing I'd add for scale.
- **Refresh tokens** — JWT expiry is 24h with no refresh. For a longer-lived product I'd add refresh token rotation.
- **Rate limiting** — no per-IP rate limiting on auth endpoints. Easy to add with `express-rate-limit`.
- **Input sanitisation** — Zod validates types and structure but doesn't sanitise for XSS. A real product would add a sanitisation step.

---

## 3. Running Locally

The only requirement is **Docker Desktop**. No Node.js, no PostgreSQL, nothing else needed.

```bash
# 1. Clone the repo
git clone https://github.com/jayDevariya2027/taskflow-jay-devariya.git
cd taskflow-jay-devariya

# 2. Set up environment variables
cp .env.example .env
# The defaults in .env.example work out of the box — no edits needed

# 3. Start everything
docker compose up --build

# That's it. Three containers start:
# - PostgreSQL database
# - Node.js API server (runs migrations automatically on startup)
# - React frontend served via nginx

# Frontend:  http://localhost
# API:       http://localhost:3000
# Health:    http://localhost:3000/health
```

To stop:
```bash
docker compose down
```

To stop and wipe the database volume:
```bash
docker compose down -v
```

### Running locally without Docker (for development)

If you want to run the backend and frontend directly:

```bash
# Prerequisites: Node.js 20, PostgreSQL 16 running locally

# Backend
cd backend
cp .env.example .env
# Edit .env with your local DB credentials
npm install
npm run migrate:up
npm run dev
# API running at http://localhost:3000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 4. Running Migrations

**Migrations run automatically** when the Docker container starts. You do not need to run them manually.

The entrypoint script (`backend/entrypoint.sh`) runs `npm run migrate:up` before starting the server. Migrations are idempotent — already-applied migrations are skipped.

If you need to run migrations manually (local dev without Docker):
```bash
cd backend
npm run migrate:up

# To rollback the last migration:
npm run migrate:down
```

Migration files are in `backend/migrations/`. Each file has both an `up` and `down` block.

---

## 5. Test Credentials

A seed user is created automatically on first container start:

```
Email:    test@example.com
Password: password123
```

The seed also creates:
- 1 demo project called **"Demo Project"**
- 3 tasks with different statuses (todo, in_progress, done)

---

## 6. API Reference

All endpoints return `Content-Type: application/json`.
All protected endpoints require `Authorization: Bearer <token>`.

### Auth

#### POST /auth/register
```json
// Request
{
  "name": "Jay Devariya",
  "email": "jay@example.com",
  "password": "password123"
}

// Response 201
{
  "user": {
    "id": "uuid",
    "name": "Jay Devariya",
    "email": "jay@example.com",
    "created_at": "2026-04-12T10:00:00.000Z"
  }
}
```

#### POST /auth/login
```json
// Request
{
  "email": "jay@example.com",
  "password": "password123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Jay Devariya",
    "email": "jay@example.com"
  }
}
```

---

### Projects

#### GET /projects
Returns projects the current user owns or has tasks assigned in.
```json
// Response 200
{
  "projects": [
    {
      "id": "uuid",
      "name": "My Project",
      "description": "Project description",
      "owner_id": "uuid",
      "owner_name": "Jay Devariya",
      "task_count": "3",
      "created_at": "2026-04-12T10:00:00.000Z"
    }
  ]
}
```

#### POST /projects
```json
// Request
{
  "name": "My Project",
  "description": "Optional description"
}

// Response 201
{
  "project": {
    "id": "uuid",
    "name": "My Project",
    "description": "Optional description",
    "owner_id": "uuid",
    "created_at": "2026-04-12T10:00:00.000Z"
  }
}
```

#### GET /projects/:id
Returns project details including all tasks.
```json
// Response 200
{
  "project": {
    "id": "uuid",
    "name": "My Project",
    "description": "Optional description",
    "owner_id": "uuid",
    "created_at": "2026-04-12T10:00:00.000Z",
    "tasks": [...]
  }
}
```

#### PATCH /projects/:id
Owner only. All fields optional.
```json
// Request
{
  "name": "Updated Name",
  "description": "Updated description"
}

// Response 200
{
  "project": { ... }
}
```

#### DELETE /projects/:id
Owner only. Deletes project and all its tasks (cascade).
```
// Response 204 No Content
```

---

### Tasks

#### GET /projects/:id/tasks
Supports `?status=todo|in_progress|done` and `?assignee=<userId>` filters.
```json
// Response 200
{
  "tasks": [
    {
      "id": "uuid",
      "title": "My Task",
      "description": "Task description",
      "status": "todo",
      "priority": "high",
      "project_id": "uuid",
      "assignee_id": "uuid",
      "assignee_name": "Jay Devariya",
      "due_date": "2026-04-30",
      "created_at": "2026-04-12T10:00:00.000Z",
      "updated_at": "2026-04-12T10:00:00.000Z"
    }
  ]
}
```

#### POST /projects/:id/tasks
Project owner only.
```json
// Request
{
  "title": "My Task",
  "description": "Optional description",
  "status": "todo",
  "priority": "high",
  "assignee_id": "uuid",
  "due_date": "2026-04-30"
}

// Response 201
{
  "task": { ... }
}
```

#### PATCH /tasks/:id
Project owner only. All fields optional.
```json
// Request
{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "medium",
  "assignee_id": "",
  "due_date": "2026-05-01"
}

// Response 200
{
  "task": { ... }
}
```

> Note: Send `assignee_id: ""` to unassign a task.

#### DELETE /tasks/:id
Project owner only.
```
// Response 204 No Content
```

---

### Users

#### GET /users
Returns all registered users. Used to populate the assignee dropdown.
```json
// Response 200
{
  "users": [
    {
      "id": "uuid",
      "name": "Jay Devariya",
      "email": "jay@example.com"
    }
  ]
}
```

---

### Error Responses

```json
// 400 Validation error
{
  "error": "validation failed",
  "fields": {
    "email": "email is invalid",
    "password": "password must be at least 6 characters"
  }
}

// 401 Unauthenticated
{ "error": "unauthorized" }

// 403 Forbidden
{ "error": "forbidden" }

// 404 Not found
{ "error": "not found" }
```

---

## 7. What I'd Do With More Time

### Things I'd add

**API rate limiting** — The auth endpoints (`/auth/register`, `/auth/login`) and high-frequency endpoints like task status updates have no rate limiting right now. I'd add `express-rate-limit` with different thresholds per route — stricter on auth (5 req/min) and more lenient on task updates (60 req/min) to prevent both brute force attacks and accidental hammering from frontend bugs.

**Redis caching** — Project and task lists could be cached in Redis with cache invalidation on write. For the current scope this isn't needed, but at scale it would meaningfully reduce DB load.

**WebSocket / SSE for real-time updates** — If two users are looking at the same project, task changes aren't reflected in real time — you need to refresh. I'd add Server-Sent Events on the project detail endpoint so the kanban board updates live when a teammate moves a task.

**Push notifications for task assignment** — When a task is assigned to you, you should get notified. I'd implement this with WebSockets and an in-app notification bell, with a notifications table in the database to persist unread counts.

**Refresh token rotation** — Current JWTs are valid for 24 hours with no way to revoke them. I'd add refresh tokens stored in an httpOnly cookie with a short-lived access token (15 min). This means a stolen access token is only valid for 15 minutes instead of 24 hours.

**Argon2 instead of bcrypt** — bcrypt v5 has a transitive vulnerability in its native build tooling (`node-pre-gyp` → `tar`). It doesn't affect runtime security but I'd migrate to `argon2` which has no native dependencies and is the current OWASP recommendation.

**Integration tests** — I have no automated tests. I'd add at least 5 integration tests covering: register, login, create project, create task, and the 403 path for unauthorized task edits. I'd use `vitest` + `supertest`.

**Pagination** — List endpoints return all records. I'd add cursor-based pagination for projects and tasks.

**Project membership system** — Currently any registered user can be assigned to any task in any project. A proper membership model would have explicit invite/accept flows, member roles (owner, member, viewer), and scoped visibility. The assignee dropdown would only show project members rather than all users.

**Audit log** — For a team tool, knowing who changed what and when is valuable. I'd add a `task_history` table that records every status change, assignee change, and priority change with a timestamp and actor.

**File attachments on tasks** — Tasks often need supporting files. I'd add S3-backed file attachments with presigned upload URLs so files never pass through the API server.

### Shortcuts I took

- **No input sanitisation beyond type validation** — Zod validates types but doesn't strip HTML. A real product needs a sanitisation step on the backend to prevent stored XSS.
- **Assignee is any registered user** — In a real product, you'd have project membership with explicit invites. I chose all-users for simplicity and testability within the 72-hour scope.
- **No email verification** — Registration accepts any email without verification. A real product would send a verification email before activating the account.
- **Single `.env` for Docker** — A real deployment would use a secrets manager (AWS Secrets Manager, Vault) rather than a `.env` file committed to a repo.
- **No database connection pooling config** — I'm using `pg.Pool` with default settings. For production I'd tune `max`, `idleTimeoutMillis`, and `connectionTimeoutMillis` based on expected load.