FROM node:24-trixie-slim AS base

RUN apt-get update && apt-get install -y \
    poppler-utils poppler-data \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY api-contracts/package*.json ./api-contracts/
RUN npm ci --prefix api-contracts
COPY api-contracts/src ./api-contracts/src
COPY api-contracts/tsconfig.json ./api-contracts/
RUN npm run build --prefix api-contracts

COPY backend/package*.json ./backend/
RUN npm ci --prefix backend

FROM base AS build

COPY backend ./backend
RUN npm run build --prefix backend --ignore-scripts

FROM base AS production

ENV NODE_ENV=production
RUN npm ci --omit=dev --prefix backend

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/src/client ./backend/dist/client

WORKDIR /app/backend
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main"]

FROM base AS dev

COPY backend ./backend
WORKDIR /app/backend
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start:dev"]
