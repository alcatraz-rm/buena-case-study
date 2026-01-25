## Buena Case Study

### Stack

- **Frontend**: Next.js (App Router) + React + Tailwind CSS
- **Backend**: NestJS (TypeScript)
- **DB**: Postgres
- **SQL access**: Kysely (+ `kysely-ctl` for migrations/seeds)
- **Shared types**: `@buena/types` (Zod schemas + inferred TS types)

### Scope notes

- **Accountants & managers**: out of scope for the UI, so they are not editable there; demo data includes pre-seeded entities from `seed.ts`.
- **PDF extraction**: demo-mode only; integrating the full flow requires additional UX/design work to make it usable.

### Walkthrough videos

- [Intro](https://www.loom.com/share/9424745bf0824f5a851be9f9bbac6c93)
- [Backend stack overview + DB](https://www.loom.com/share/0cd9688e353240bc85d4bf4bc0baa55e)
- [Backend modules overview](https://www.loom.com/share/dc6e3b52cfcc4c0bbcb37e6e17d1968e)
- [Frontend overview](https://www.loom.com/share/e3a4b08cec39406687bbf3028974a2f8)
- [Running the project](https://www.loom.com/share/9bc4aa0b6f194f2f97cee07f619b36ce)
- [UI demo](https://www.loom.com/share/4be3209bb73f476da15f3f4216ad2e56)

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
