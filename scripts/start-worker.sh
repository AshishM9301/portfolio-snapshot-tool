#!/bin/bash

# Start worker locally for development
echo "Starting worker locally..."

# Set environment variables
export REDIS_URL=redis://localhost:6379
export NUM_WORKERS=3
export NODE_ENV=development
export WORKER_MODE=true
export NEXT_PUBLIC_APP_URL=http://localhost:3000

# Start the worker manager
bun run src/server/worker/worker-manager.ts 