# ---- Stage 1: install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ---- Stage 2: build the Next.js app ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public

# Pull the Railway build-time variable into the build so it gets baked
# into the client bundle (NEXT_PUBLIC_ vars must be present at build time).
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Stage 3: minimal runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk update && apk upgrade --no-cache
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Only copy the standalone output + static assets, not the full build tree
# or devDependencies — this is what next.config.js's output:'standalone' enables.
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static

USER appuser

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://localhost:3000/" || exit 1

# standalone output ships its own server.js entrypoint
CMD ["node", "server.js"]
