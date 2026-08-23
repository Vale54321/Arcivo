FROM node:24-trixie-slim AS base

RUN apt-get update && apt-get install -y \
    poppler-utils poppler-data \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY libs/api-contracts/package*.json ./libs/api-contracts/
RUN npm ci --prefix libs/api-contracts
COPY libs/api-contracts/src ./libs/api-contracts/src
COPY libs/api-contracts/tsconfig.json ./libs/api-contracts/
RUN npm run build --prefix libs/api-contracts

COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --prefix apps/backend

FROM base AS build

COPY apps/backend ./apps/backend
RUN npm run build --prefix apps/backend --ignore-scripts

FROM base AS production

ENV NODE_ENV=production
RUN npm ci --omit=dev --prefix apps/backend

COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/src/client ./apps/backend/dist/client

WORKDIR /app/apps/backend
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main"]

FROM base AS dev

COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start:dev"]
