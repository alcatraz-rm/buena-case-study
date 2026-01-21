## Buena Case Study

### Stack

- **Frontend**: Next.js (App Router) + React + Tailwind CSS
- **Backend**: NestJS (TypeScript)
- **DB**: Postgres
- **SQL access**: Kysely (+ `kysely-ctl` for migrations/seeds)
- **Shared types**: `@buena/shared` (Zod schemas + inferred TS types)

### Quick start

Prereqs:

- **Docker Desktop** (or `docker` + `docker compose`)

Create a backend env file:

```bash
cp .env.example .env
```

Start everything:

```bash
docker compose up
```

Endpoints:

- **Web**: `http://localhost:3000`
- **API**: `http://localhost:3001`
- **Postgres**: `localhost:6543` (db: `buena`, user/pass: `postgres`)

On startup the API runs:

- `kysely migrate:latest`
- `kysely seed:run` (demo data)

Stop:

```bash
docker compose down
```

### Local dev

Prereqs:

- Node.js + pnpm
- Postgres running locally

Set `DATABASE_URL` for the API (e.g. in `apps/api/.env.local` or root `.env`), then:

```bash
pnpm install
pnpm dev
```
