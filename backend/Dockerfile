FROM node:24-trixie-slim AS base

RUN apt-get update && apt-get install -y \
    poppler-utils poppler-data \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci


FROM base AS build

COPY . .
RUN npm run build


FROM base AS production

ENV NODE_ENV=production

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/client ./dist/client

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main"]


FROM base AS dev

COPY . .
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start:dev"]
