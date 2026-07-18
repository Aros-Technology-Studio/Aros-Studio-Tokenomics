# AST core image — Node 20, TypeScript build
FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
COPY scripts ./scripts
COPY .github ./.github
COPY rules ./rules
COPY docs ./docs
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV AST_JOURNAL_ENGINE=file
ENV AST_JOURNAL_DIR=/data/journal
ENV AST_REQUIRE_CRYPTO=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY scripts ./scripts
COPY tsconfig.json ./
RUN mkdir -p /data/journal
VOLUME ["/data"]
EXPOSE 3000
# Default: show CLI help / health; override for tokenize demo
CMD ["node", "-e", "console.log('AST image ready. Override CMD for demo:tokenize or nest start.')"]
