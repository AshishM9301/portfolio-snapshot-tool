import { env } from '@/env';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { NextRequest } from 'next/server';
import type { BatchImageSnapshotRequest, BatchImageSnapshotResponse } from '@/types';

const prisma = new PrismaClient();
const redisUrl = env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new IORedis(redisUrl);
const queue = new Queue('ai-snapshot-queue', { connection });

export async function POST(req: NextRequest) {
    try {
        const { images, stylePreferences, manualPreferences } = await req.json() as BatchImageSnapshotRequest;

        if (!Array.isArray(images) || images.length === 0 || images.length > 3) {
            return new Response(
                JSON.stringify({ error: 'Provide 1-3 images.' }),
                { status: 400 }
            );
        }

        // Validate each image
        for (const image of images) {
            if (!image.id || !image.name || !image.data || !image.type) {
                return new Response(
                    JSON.stringify({ error: 'Invalid image data provided.' }),
                    { status: 400 }
                );
            }

            // Validate image type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(image.type)) {
                return new Response(
                    JSON.stringify({ error: `Unsupported image type: ${image.type}` }),
                    { status: 400 }
                );
            }

            // Validate base64 data size (max 10MB)
            const base64Size = Math.ceil((image.data.length * 3) / 4);
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (base64Size > maxSize) {
                return new Response(
                    JSON.stringify({ error: `Image ${image.name} is too large (max 10MB)` }),
                    { status: 400 }
                );
            }
        }

        const jobIds: string[] = [];

        for (const image of images) {
            // Create Job in DB with minimal metadata
            const job = await prisma.job.create({
                data: {
                    id: crypto.randomUUID(),
                    url: image.name,
                    jobType: 'image' as const,
                    status: 'queued',
                },
            });

            // Enqueue BullMQ job with image data (processed in memory, not stored)
            await queue.add('image-snapshot', {
                jobId: job.id,
                imageData: image.data,
                imageName: image.name,
                imageType: image.type,
                stylePreferences: stylePreferences ?? null,
                manualPreferences: manualPreferences ?? null
            });

            jobIds.push(job.id);
        }

        return new Response(JSON.stringify({ jobIds } as BatchImageSnapshotResponse), { status: 200 });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: errorMessage } as BatchImageSnapshotResponse),
            { status: 500 }
        );
    }
} 