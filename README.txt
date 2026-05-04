TEAM TASK MANAGER
=================

Built this for managing team projects without the usual chaos. You get a proper
kanban board, role-based access so not everyone can mess with everything, and a
dashboard that actually tells you what's going on.

---

WHAT IT DOES
------------

There are two roles - Admin and Member. Here's the difference:

Admin:
- Creates projects
- Creates tasks and assigns them to users
- Can drag tasks across the board freely
- Sees stats for everything they own on the dashboard

Member:
- Sees only projects where they've been assigned a task
- Can update the status of tasks assigned to them (that's it)
- Dashboard shows only their tasks

---

TECH USED
---------

Backend  → Node.js + Express + MongoDB (Mongoose)
Frontend → React (Vite) + plain CSS
Auth     → JWT tokens + bcrypt for passwords

No UI library. All CSS is written from scratch - dark theme, glassmorphism effect,
the whole thing.

---

HOW TO RUN LOCALLY
------------------

You'll need Node.js and MongoDB running locally before anything else.

1. Clone the repo

2. Set up the backend:
   cd server
   create a .env file with:
     PORT=5055
     MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
     JWT_SECRET=anythingYouWant
   npm install
   node index.js

3. Set up the frontend (new terminal):
   cd client
   npm install
   npm run dev

App runs at http://localhost:5173 (or 5174 if that port's taken)
Backend runs at http://localhost:5055

---

FOLDER STRUCTURE
----------------

team-task-manager/
├── server/
│   ├── controllers/     <- business logic
│   ├── middleware/      <- JWT auth + role checks
│   ├── models/          <- User, Project, Task schemas
│   ├── routes/          <- API endpoints
│   └── index.js         <- entry point
│
└── client/
    └── src/
        ├── components/  <- TaskModal, ProjectModal, Sidebar
        ├── context/     <- AuthContext (global user state)
        ├── pages/       <- Dashboard, Projects, Board, Login, Register
        └── services/    <- axios instance with token interceptor

---

API ROUTES
----------

POST   /api/auth/register     - create account
POST   /api/auth/login         - login
GET    /api/auth/me            - get current user
GET    /api/auth/users         - list all users (for assignee dropdown)

GET    /api/projects           - get your projects
POST   /api/projects           - create project (admin only)
GET    /api/projects/:id       - get single project
PUT    /api/projects/:id       - update project (admin only)
DELETE /api/projects/:id       - delete project (admin only)

GET    /api/tasks/project/:id  - get tasks for a project
POST   /api/tasks              - create task (admin only)
PUT    /api/tasks/:id          - update task (admin or assignee)
DELETE /api/tasks/:id          - delete task (admin only)

GET    /api/dashboard          - get stats for current user

---

ONE THING TO KNOW
-----------------

When an admin assigns a task to a user, that user automatically gets added to
the project's member list. So they'll see the project show up in their Projects
page without the admin having to manually add them. Handy.

---

NOTES
-----

- Passwords are hashed with bcrypt, never stored plain
- JWT tokens expire after 30 days
- MongoDB uses $addToSet so users don't get added to a project twice
- The kanban board drag-and-drop is native HTML5, no extra library needed

---

That's pretty much it. Nothing too complicated once you see how it's structured.
