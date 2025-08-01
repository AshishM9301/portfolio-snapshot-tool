import { spawn } from 'child_process';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '@/env';

const connection = new IORedis(env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

const NUM_WORKERS = parseInt(process.env.NUM_WORKERS ?? '3');

console.log(`Starting ${NUM_WORKERS} worker instances...`);

// Start multiple worker processes
for (let i = 0; i < NUM_WORKERS; i++) {
    const workerProcess = spawn('bun', ['src/server/worker/ai-snapshot-worker.ts'], {
        stdio: 'inherit',
        env: { ...process.env, WORKER_ID: i.toString() }
    });

    workerProcess.on('error', (error) => {
        console.error(`Worker ${i} error:`, error);
    });

    workerProcess.on('exit', (code) => {
        console.log(`Worker ${i} exited with code ${code}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down worker manager...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down worker manager...');
    process.exit(0);
}); 