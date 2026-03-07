FROM node:24-trixie-slim AS base

RUN apt-get update && apt-get install -y \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci


FROM base AS dev

COPY . .
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start:dev"]
