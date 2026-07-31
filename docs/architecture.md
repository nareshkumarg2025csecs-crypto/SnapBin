# System Architecture — SnapBin

SnapBin is designed using a decoupled client-server architecture containerized via Docker Compose.

```
[ Client Browser ]
       │
       ▼
[ Nginx Web Server / Frontend (Port 80) ]
       │ (Reverse Proxy /api/*)
       ▼
[ Node.js + Express API Server (Port 3001) ]
       │ (Prisma ORM)
       ▼
[ PostgreSQL Database (Port 5432) ]
```

## Core Components

1. **Frontend**: React 18 SPA built with Vite, Tailwind CSS, Monaco Editor, and Framer Motion. Served via Nginx multi-stage build.
2. **Backend**: Express.js server written in TypeScript. Features Pino logging, Zod validation, Rate Limiting, node-cron auto-expiry cleanup, and OpenAPI Swagger documentation.
3. **Database**: PostgreSQL storing paste metadata and contents. Managed via Prisma ORM schemas and migrations.
