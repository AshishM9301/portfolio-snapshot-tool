import { env } from '@/env';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();
const redisUrl = env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new IORedis(redisUrl);
const queue = new Queue('ai-snapshot-queue', { connection });

export async function POST(req: NextRequest) {
    try {
        const { urls } = await req.json() as { urls: string[] };
        if (!Array.isArray(urls) || urls.length === 0 || urls.length > 3) {
            return new Response(JSON.stringify({ error: 'Provide 1-3 URLs.' }), { status: 400 });
        }
        const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
        const jobIds: string[] = [];
        for (const url of urls) {
            if (!url || !urlPattern.test(url)) {
                return new Response(JSON.stringify({ error: `Invalid URL: ${url}` }), { status: 400 });
            }
            // Create Job in DB
            const job = await prisma.job.create({
                data: {
                    id: crypto.randomUUID(),
                    url,
                    status: 'queued',
                },
            });
            // Enqueue BullMQ job
            await queue.add('snapshot', { jobId: job.id, url });
            jobIds.push(job.id);
        }
        return new Response(JSON.stringify({ jobIds }), { status: 200 });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
} 