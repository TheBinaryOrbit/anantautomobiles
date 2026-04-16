# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

# Install dumb-init (for proper signal handling)
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install only production deps
RUN npm ci --omit=dev && npm cache clean --force

# Copy Prisma client + engines
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# Copy prisma schema (needed for migrations)
COPY prisma ./prisma

# Copy app code
COPY src ./src
COPY src ./tests
COPY public ./public
COPY index.js .

# Create uploads dir
RUN mkdir -p uploads/invoices

# Expose port
EXPOSE 3000

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# 🔥 IMPORTANT: run migrations before starting app
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]