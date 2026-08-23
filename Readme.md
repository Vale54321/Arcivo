# Arcivo

Arcivo is a self-hosted document management system inspired by Immich. It uses
a NestJS backend, a SvelteKit frontend, PostgreSQL, Valkey, and Gotenberg.

## Development setup (Linux or WSL)

The backend runs directly in Node.js. Docker Compose only starts the supporting
services.

### Dependencies

- Node.js 24 and npm
- Docker Engine with the Docker Compose plugin, or Docker Desktop with WSL
  integration enabled
- Poppler command-line tools and data files

On Debian, Ubuntu, or an Ubuntu WSL distribution, install the native backend
packages with:

```sh
sudo apt update
sudo apt install poppler-utils poppler-data
```

Install Node.js 24 using your preferred Node version manager or distribution,
then verify the required tools:

```sh
node --version
npm --version
docker compose version
pdftotext -v
```

Run all commands below inside the Linux/WSL environment. When using WSL,
keeping the repository in the WSL filesystem gives file watching better
performance than working under `/mnt/c`.

### 1. Configure the environment

Create a `.env` file in the project root:

```env
DB_PASSWORD=<PASSWORD>
JWT_SECRET=<generate-with-openssl-rand-base64-48>
# Optional: automatically sign in as admin@example.com during local development.
DEV_AUTO_AUTH_DEFAULT_ADMIN=true
```

`JWT_SECRET` must be a unique random value with at least 32 characters. The
backend loads this root `.env` file when started from the `backend` directory.

Development defaults connect to PostgreSQL and Valkey on `localhost` and to
Gotenberg at `http://localhost:3001`. These can be overridden with `DB_HOST`,
`DB_PORT`, `REDIS_HOST`, `REDIS_PORT`, and `GOTENBERG_URL` in `.env`.

`DEV_AUTO_AUTH_DEFAULT_ADMIN` is disabled by default. Enable it only for local
development to automatically sign in as the seeded `admin@example.com` account.
It is unavailable when the backend runs with `NODE_ENV=production`.

### 2. Start the supporting services

```sh
docker compose up -d
```

This starts:

| Service    | Image                   | Host port |
| ---------- | ----------------------- | --------- |
| PostgreSQL | `postgres:16`           | `5432`    |
| Valkey     | `valkey/valkey:9`       | `6379`    |
| Gotenberg  | `gotenberg/gotenberg:8` | `3001`    |

Check their status or logs with:

```sh
docker compose ps
docker compose logs -f
```

### 3. Run the backend natively

```sh
cd apps/backend
npm ci
npm run start:dev
```

The API is available at `http://localhost:3000/api`, and nodemon restarts it
when backend source files change. Database migrations run automatically during
startup. Uploaded and generated files are written to `apps/backend/library` and
temporary uploads to `apps/backend/temp`; both directories are ignored by Git.

The initial migration creates a development administrator:

- Email: `admin@example.com`
- Password: `changeme`

Change this password before using the account outside local development.

### 4. Run the frontend (optional)

In another terminal:

```sh
cd apps/frontend
cp .env.example .env
npm ci
npm run dev
```

Stop the supporting containers with:

```sh
docker compose down
```

## Public website and UI playbook

`apps/website` is the static SvelteKit marketing site for `arcivo.de`. It reuses
the shared `@arcivo/ui-components` library and includes the same document-list
layout as the application with representative document data.

The interactive UI component playbook lives in `libs/ui-components/playground`
and is deployed separately at `playbook.arcivo.de`. The website links to both
the playbook and the protected technical demo at `arcivo.heiserer.de`.

Both are configured as Cloudflare Workers Static Assets projects. After
authenticating Wrangler to the Cloudflare account that manages the `arcivo.de`
zone, deploy them from the repository root:

```sh
npm install
npm run deploy:website
npm run deploy:ui-playbook
```

The source-controlled Wrangler configurations create the `arcivo.de` and
`playbook.arcivo.de` custom domains. Cloudflare must manage the zone, and the
target hostnames must not already have conflicting DNS records. For local
Workers previews, use `npm run dev:worker --workspace @arcivo/website` or
`npm run dev:worker --workspace @arcivo/ui-components` after building.

## Production Compose example

The production backend image is built from `apps/backend/Dockerfile`. Its
runtime image contains Poppler and only production npm dependencies.

```yaml
services:
  backend:
    container_name: arcivo_backend
    image: git.heiserer.de/arcivo/arcivo/backend:latest
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: database
      DB_PORT: 5432
      DB_PASSWORD: ${DB_PASSWORD}
      DB_USERNAME: arcivo
      DB_DATABASE: arcivo
      REDIS_HOST: redis
      REDIS_PORT: 6379
      GOTENBERG_URL: http://gotenberg:3000
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./data/library:/app/library
      - ./data/temp:/app/temp
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_started

  redis:
    container_name: arcivo_redis
    image: valkey/valkey:9
    healthcheck:
      test: redis-cli ping || exit 1
    restart: unless-stopped

  database:
    container_name: arcivo_postgres
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: arcivo
      POSTGRES_DB: arcivo
      POSTGRES_INITDB_ARGS: --data-checksums
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U arcivo -d arcivo']
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  gotenberg:
    image: gotenberg/gotenberg:8
```
