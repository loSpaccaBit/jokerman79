# Optimized Dockerfile for Casino Microservice
FROM node:18-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory with proper permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    mkdir -p /app && \
    chown -R nextjs:nodejs /app

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies in production mode
FROM base AS deps
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Development stage
FROM base AS dev
RUN npm ci --no-audit --no-fund
COPY . .
USER nextjs
EXPOSE 4000
CMD ["dumb-init", "npm", "run", "dev"]

# Production build stage
FROM base AS prod
# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nextjs:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown nextjs:nodejs logs

# Remove development files
RUN rm -rf test/ *.md Dockerfile .dockerignore .git* || true

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Expose port
EXPOSE 4000

# Optimized Node.js startup
CMD ["dumb-init", "node", "--expose-gc", "--max-old-space-size=2048", "server.js"]