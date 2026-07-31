FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 snapbin

COPY --from=builder --chown=snapbin:nodejs /app/dist ./dist
COPY --from=builder --chown=snapbin:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=snapbin:nodejs /app/src/prisma ./src/prisma
COPY --from=builder --chown=snapbin:nodejs /app/package.json ./package.json

USER snapbin

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "dist/index.js"]
