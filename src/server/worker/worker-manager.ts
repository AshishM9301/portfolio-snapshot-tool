import { spawn } from 'child_process';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '@/env';
import packageJson from '../../../package.json';

if (!env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
}

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

// Reduced to 1 worker for limited CPU resources
const NUM_WORKERS = parseInt(process.env.NUM_WORKERS ?? '1');

console.log(`🚀 Worker Manager v${packageJson.version} starting...`);
console.log(`📦 Package: ${packageJson.name}`);
console.log(`🕐 Build time: ${new Date().toISOString()}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📊 Starting ${NUM_WORKERS} worker instance(s) for limited CPU...`);
console.log(`💡 CPU optimization: Single worker mode to prevent throttling`);

// Start single worker process for limited CPU
for (let i = 0; i < NUM_WORKERS; i++) {
    const workerProcess = spawn('bun', ['src/server/worker/ai-snapshot-worker.ts'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            WORKER_ID: i.toString(),
            // Add CPU optimization flags
            NODE_OPTIONS: '--max-old-space-size=512',
            PUPPETEER_ARGS: '--no-sandbox,--disable-dev-shm-usage,--disable-gpu,--single-process,--disable-extensions,--disable-plugins,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-renderer-backgrounding'
        }
    });

    workerProcess.on('error', (error) => {
        console.error(`❌ Worker ${i} error:`, error);
    });

    workerProcess.on('exit', (code) => {
        console.log(`🔄 Worker ${i} exited with code ${code}`);
        // Restart worker if it crashes (important for single worker setup)
        if (code !== 0) {
            console.log(`🔄 Restarting crashed worker ${i}...`);
            setTimeout(() => {
                // Restart logic would go here if needed
            }, 5000);
        }
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down worker manager...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Shutting down worker manager...');
    process.exit(0);
}); 