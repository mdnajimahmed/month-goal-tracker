# Build stage (Node 24 LTS, Debian-based for Prisma compatibility)
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Ensure OpenSSL is available for Prisma engine
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Use npm install instead of npm ci so we don't depend on lockfile being in sync
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# Run stage (same base as builder)
FROM node:24-bookworm-slim

WORKDIR /app

# Ensure OpenSSL is available for Prisma engine at runtime
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=9559

COPY package.json package-lock.json ./
# Install only production dependencies in runtime image
RUN npm install --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 9559

# Apply schema (migrate if migrations exist, else db push) then start server
CMD ["sh", "-c", "(npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss) && node dist/index.js"]
