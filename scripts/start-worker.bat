@echo off

REM Start worker locally for development
echo Starting worker locally...

REM Set environment variables
set REDIS_URL=redis://localhost:6379
set NUM_WORKERS=3
set NODE_ENV=development
set WORKER_MODE=true
set NEXT_PUBLIC_APP_URL=http://localhost:3000

REM Start the worker manager
bun run src/server/worker/worker-manager.ts 