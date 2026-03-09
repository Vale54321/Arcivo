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
docker compose -f compose.dev.yml up -d
```

This starts the following services:

| Service | Description | Port |
|---|---|---|
| `arcivo_postgres` | PostgreSQL database | `5432` |
| `arcivo_redis` | Valkey/Redis | `6379` |
| `arcivo_backend` | NestJS backend | `3000` |
| `gotenberg` | PDF conversion engine | internal only (`3000` in Docker network) |

#### Backend container

The backend service mounts `./backend/src` into the container and uses `nodemon` for automatic restarts on file changes.

#### Gotenberg container

Arcivo uses [Gotenberg](https://gotenberg.dev/) to convert office-like documents and regular PDFs to [PDF/A-2](https://en.wikipedia.org/wiki/PDF/A) during background processing.
