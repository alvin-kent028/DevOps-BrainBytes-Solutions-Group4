## Start app locally: open [Start instructions](../README_START.md) in VS Code Markdown preview and click the launcher link

# ---- Stage 1: install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# ---- Stage 2: runtime image ----
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Run as a non-root user instead of the default root inside the container
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

USER appuser

# Backend listens on PORT (defaults to 5000), not 3000 — must match docker-compose
# and Railway's PORT env var, otherwise the platform's healthcheck can never reach it.
EXPOSE 5000

# Container-level healthcheck hits the real /health route added in app.js
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-5000}/health" || exit 1

CMD ["npm", "start"]
