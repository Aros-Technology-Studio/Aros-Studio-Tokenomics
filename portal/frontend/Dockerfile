# AST Portal UI (Next.js standalone)
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_PORTAL_API_URL=http://localhost:3100
ENV NEXT_PUBLIC_PORTAL_API_URL=$NEXT_PUBLIC_PORTAL_API_URL
# Server-side rewrite target for /v1/*; baked into routes-manifest.json at build time
# (standalone output does not re-read this at runtime).
ARG PORTAL_EDGE_URL=http://127.0.0.1:3100
ENV PORTAL_EDGE_URL=$PORTAL_EDGE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3200
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
# Owner content packs (public page copy + blog) are read from ./content-packs at render time
COPY --from=build --chown=nextjs:nodejs /app/content-packs ./content-packs
USER nextjs
EXPOSE 3200
CMD ["node", "server.js"]
