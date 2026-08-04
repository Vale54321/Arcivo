# Arcivo

Arcivo is a self-hosted document management system inspired by Immich that focuses on high-performance media handling. It utilizes a modern tech stack consisting of a NestJS backend, a SvelteKit frontend, and a PostgreSQL database optimized for vector-based searches.

## Development Setup

### 1. Create a `.env` file

Create a `.env` file in the project root with the following variables:

```env
DB_PASSWORD=<PASSWORD>
```

### 2. Start the development stack

```sh
docker compose up -d
```

If `backend/package.json` or `backend/package-lock.json` changes, rebuild the backend image so the updated npm modules are installed:

```sh
docker compose build backend
docker compose up -d backend
```

To rebuild without using Docker's cached layers:

```sh
docker compose build --no-cache backend
docker compose up -d backend
```

### View backend logs

Follow the backend logs:

```sh
docker compose logs -f backend
```

Use `Ctrl+C` to stop following the logs without stopping the container. To show only the most recent 100 lines, run:

```sh
docker compose logs --tail=100 backend
```

This starts the following services:

| Service           | Description           | Port                                     |
| ----------------- | --------------------- | ---------------------------------------- |
| `arcivo_postgres` | PostgreSQL database   | `5432`                                   |
| `arcivo_redis`    | Valkey/Redis          | `6379`                                   |
| `arcivo_backend`  | NestJS backend        | `3000`                                   |
| `gotenberg`       | PDF conversion engine | internal only (`3000` in Docker network) |

#### Backend container

The backend service mounts `./backend/src` into the container and uses `nodemon` for automatic restarts on file changes.

#### Gotenberg container

Arcivo uses [Gotenberg](https://gotenberg.dev/) to convert office-like documents and regular PDFs to [PDF/A-2](https://en.wikipedia.org/wiki/PDF/A) during background processing.

## Production Compose Example

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
		volumes:
			- ./data/library:/app/library
			- ./data/temp:/app/temp

	redis:
		container_name: arcivo_redis
		image: valkey/valkey:9
		healthcheck:
			test: redis-cli ping || exit 1
		restart: unless-stopped

	database:
		container_name: arcivo_postgres
		image: git.heiserer.de/arcivo/arcivo/database:latest
		environment:
			POSTGRES_PASSWORD: ${DB_PASSWORD}
			POSTGRES_USER: arcivo
			POSTGRES_DB: arcivo
			POSTGRES_INITDB_ARGS: --data-checksums
			DB_STORAGE_TYPE: 'SSD'
		volumes:
			- ./data/postgres:/var/lib/postgresql/data
		restart: unless-stopped

	gotenberg:
		image: gotenberg/gotenberg:8
```
