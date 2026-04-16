# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma files
COPY prisma ./prisma

# Generate Prisma client
RUN npm run prisma:generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy Prisma files from builder
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY prisma ./prisma

# Copy application files
COPY src ./src
COPY public ./public
COPY index.js .

# Create uploads directory
RUN mkdir -p uploads/invoices

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["node", "index.js"]
