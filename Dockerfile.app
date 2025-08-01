# App-Only Dockerfile - Optimized for Next.js production
FROM oven/bun:latest

# Install system dependencies for Puppeteer (if needed)
RUN apt-get update -y && apt-get install -y \
    openssl \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libgtk-3-0 \
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