# Next.js production Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY web/package.json web/package-lock.json* ./
COPY web/prisma ./prisma

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY web ./web

# Build Next.js
WORKDIR /app/web
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./.next/static
COPY --from=builder /app/web/prisma ./prisma

# Copy Prisma client from deps
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Copy package.json for Prisma CLI (if needed for migrations)
COPY --from=builder /app/web/package.json ./package.json

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check - improved with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {r.on('error', () => process.exit(1)); r.on('data', () => {}); r.on('end', () => process.exit(r.statusCode === 200 ? 0 : 1))}).on('error', () => process.exit(1)).setTimeout(8000, () => process.exit(1))"

# Resource limits should be set in docker-compose.yml or Dokploy UI:
# memory: 512m (or 1g)
# cpus: '1.0'
# memory_reservation: 256m

CMD ["node", "server.js"]

