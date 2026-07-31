# SnapBin — Production-Grade PasteBin Clone

SnapBin is a full-stack, developer-focused pastebin application built for college DevOps club evaluation. It provides instant code snippet sharing with Monaco Editor syntax highlighting, burn-after-read pastes, custom expiration policies, dark mode support, and complete Docker orchestration.

---

## Technical Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Zod, Pino, Swagger/OpenAPI, Rate Limiting, Node-Cron.
- **Database**: PostgreSQL.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Framer Motion, Lucide Icons.
- **DevOps**: Docker, Docker Compose, Nginx reverse proxy, GitHub Actions CI.

---

## Directory Structure

```
snapbin/
├── backend/                # Node.js + Express + Prisma API server
│   ├── src/
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # Error handler, rate limiters, validation
│   │   ├── prisma/         # Prisma schema and singleton instance
│   │   ├── routes/         # Express route endpoints with OpenAPI docs
│   │   ├── services/       # Core business logic
│   │   └── utils/          # Logger, Swagger, Cron cleanup, Zod schemas
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React 18 + Vite + Tailwind SPA
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Footer, PasteCard, etc.)
│   │   ├── hooks/          # Custom Hooks (useTheme, usePaste)
│   │   ├── lib/            # Axios API client and utilities
│   │   ├── pages/          # Home, CreatePaste, ViewPaste, Browse
│   │   └── styles/         # Custom design tokens and CSS base
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docs/                   # System architecture and API documentation
│   ├── api.md
│   └── architecture.md
├── .github/workflows/ci.yml # GitHub Actions workflow
├── docker-compose.yml       # Production Compose file
└── README.md
```

---

## Environment Variables

### Backend (`/backend/.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://snapbin:snapbin_pass@postgres:5432/snapbin_db?schema=public` |
| `PORT` | API Port | `3001` |
| `NODE_ENV` | Environment mode | `production` / `development` |
| `LOG_LEVEL` | Pino logging level | `info` |
| `CORS_ORIGIN` | Allowed origin for CORS | `http://localhost:5173` or `*` |

---

## Setup & Running Locally

### Option 1: Docker Compose (Recommended)

Run the entire production stack (PostgreSQL, Express Backend, Nginx Frontend) with one command:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost`
- **Backend API**: `http://localhost:3001/api`
- **Swagger Documentation**: `http://localhost:3001/api/docs`

### Option 2: Local Development

1. **Start PostgreSQL Database**:
   ```bash
   docker run -d --name snapbin-pg -e POSTGRES_USER=snapbin -e POSTGRES_PASSWORD=snapbin_pass -e POSTGRES_DB=snapbin_db -p 5432:5432 postgres:16-alpine
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## CI/CD Pipeline

The included GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, typechecking, and build validation on push and pull requests for both `backend` and `frontend` services.
