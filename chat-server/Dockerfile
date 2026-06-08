# Use Node.js 18 LTS Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S chatserver -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ src/

# Create logs directory
RUN mkdir -p logs && chown -R chatserver:nodejs logs

# Copy environment template
COPY .env.example .env.example

# Set up health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Switch to non-root user
USER chatserver

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["node", "src/server.js"]
