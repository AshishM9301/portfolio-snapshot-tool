# App-Only Dockerfile - Optimized for production with limited resources
FROM oven/bun:latest

# Install minimal system dependencies (no Puppeteer needed for app)
RUN apt-get update -y && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and Prisma schema first for better caching
COPY package.json bun.lock ./
COPY prisma ./prisma/
RUN bun install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN bun run prisma generate

# Build the Next.js app
RUN bun run build

# Create temp directory for shared images
RUN mkdir -p /app/temp/images

# Set environment for app mode
ENV NODE_ENV=production
ENV WORKER_MODE=false

# Expose port
EXPOSE 3000

# Start Next.js in production mode
CMD ["bun", "run", "start"]