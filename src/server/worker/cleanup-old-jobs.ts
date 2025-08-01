import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RETENTION_HOURS = 2;
const INTERVAL_MINUTES = 30;

async function cleanupOldJobs() {
    const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
    const deleted = await prisma.job.deleteMany({
        where: { createdAt: { lt: cutoff } },
    });
    console.log(`[Cleanup] Deleted ${deleted.count} jobs older than ${RETENTION_HOURS} hours.`);
}

async function main() {
    console.log(`[Cleanup] Starting job cleanup service. Retention: ${RETENTION_HOURS}h, Interval: ${INTERVAL_MINUTES}min`);
    while (true) {
        try {
            await cleanupOldJobs();
        } catch (err) {
            console.error('[Cleanup] Error during cleanup:', err);
        }
        await new Promise((res) => setTimeout(res, INTERVAL_MINUTES * 60 * 1000));
    }
}

void main(); 