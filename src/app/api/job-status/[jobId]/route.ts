import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    // Extract jobId from the URL
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const jobId = segments[segments.length - 1];
    if (!jobId) {
        return new Response(JSON.stringify({ error: 'Missing jobId' }), { status: 400 });
    }
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({
        status: job.status,
        resultUrl: job.resultUrl,
        error: job.error,
        url: job.url,
    }), { status: 200 });
} 