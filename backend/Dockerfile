# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npm run prisma:generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy prisma schema and migrations
COPY prisma ./prisma

# Copy Prisma Client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy application source
COPY src ./src
COPY index.js .
COPY public ./public
COPY scripts ./scripts
COPY prisma.config.ts ./

# Create uploads directory
RUN mkdir -p uploads/invoices

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]
