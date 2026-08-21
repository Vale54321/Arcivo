FROM node:24-trixie-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p src/client && npm run build

FROM node:24-trixie-slim

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils poppler-data tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/client ./dist/client

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main"]
