import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { env } from '@/env';
import { scrapeWebsiteData, analyzeWebsiteData } from '@/lib/website-analyzer';
import { generateAIPortfolioHTML } from '@/lib/ai-html-generator';
import { convertHTMLToPNG } from '@/lib/html-to-png';
import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';

const connection = new IORedis(env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});
const prisma = new PrismaClient();

const queueName = 'ai-snapshot-queue';

// Browser pool for concurrent processing
// eslint-disable-next-line prefer-const
let browserPool: Browser[] = [];
const MAX_CONCURRENT_BROWSERS = 3;

async function getBrowser(): Promise<Browser> {
    if (browserPool.length < MAX_CONCURRENT_BROWSERS) {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        });
        browserPool.push(browser);
        return browser;
    }
    const randomBrowser = browserPool[Math.floor(Math.random() * browserPool.length)];
    if (!randomBrowser) {
        throw new Error('No browser available in pool');
    }
    return randomBrowser;
}

async function captureScreenshotBase64(url: string): Promise<string> {
    const browser = await getBrowser();
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const screenshot = await page.screenshot({ type: 'png', fullPage: true });
        await page.close();
        return Buffer.from(screenshot).toString('base64');
    } catch (error) {
        throw error;
    }
}

const worker = new Worker(
    queueName,
    async (job) => {
        const { jobId, url } = job.data as { jobId: string; url: string };
        try {
            // Check if job exists in database before processing
            const existingJob = await prisma.job.findUnique({
                where: { id: jobId }
            });

            if (!existingJob) {
                console.log(`Job ${jobId} not found in database, skipping...`);
                return;
            }

            await prisma.job.update({ where: { id: jobId }, data: { status: 'processing' } });

            // Scrape and analyze
            const websiteData = await scrapeWebsiteData(url);
            const analysis = await analyzeWebsiteData(websiteData);

            // Puppeteer screenshot (base64)
            const screenshotBase64 = await captureScreenshotBase64(url);

            // Generate AI HTML
            const htmlContent = await generateAIPortfolioHTML(analysis, { desktop: screenshotBase64 }, { style: 'modern', quality: 'high' });

            // Convert HTML to PNG (buffer)
            const pngBuffer = await convertHTMLToPNG(htmlContent, { deviceScaleFactor: 2, quality: 95 });

            // Store PNG as data URL in DB
            const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
            await prisma.job.update({ where: { id: jobId }, data: { status: 'completed', resultUrl: dataUrl } });
        } catch (err: unknown) {
            console.error(`Error processing job ${jobId}:`, err);
            // Only update if job still exists
            try {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                await prisma.job.update({ where: { id: jobId }, data: { status: 'failed', error: errorMessage } });
            } catch (updateErr) {
                console.log(`Could not update job ${jobId} status:`, updateErr);
            }
        }
    },
    {
        connection,
        concurrency: 3, // Process up to 3 jobs simultaneously
        removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
        removeOnFail: { count: 50 }, // Keep last 50 failed jobs
        stalledInterval: 30000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 1, // Max number of times a job can be stalled
    }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down worker...');
    void worker.close();
    for (const browser of browserPool) {
        void browser.close();
    }
    void prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down worker...');
    void worker.close();
    for (const browser of browserPool) {
        void browser.close();
    }
    void prisma.$disconnect();
    process.exit(0);
});

console.log('AI Snapshot Worker started with concurrency: 3. Waiting for jobs...'); 