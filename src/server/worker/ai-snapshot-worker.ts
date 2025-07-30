import { Worker, Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { scrapeWebsiteData, analyzeWebsiteData } from '@/lib/website-analyzer';
import { generateAIPortfolioHTML } from '@/lib/ai-html-generator';
import { convertHTMLToPNG } from '@/lib/html-to-png';
import puppeteer from 'puppeteer';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});
const prisma = new PrismaClient();

const queueName = 'ai-snapshot-queue';

async function captureScreenshotBase64(url: string): Promise<string> {
    let browser;
    try {
        browser = await puppeteer.launch({
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
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const screenshot = await page.screenshot({ type: 'png', fullPage: true });
        return Buffer.from(screenshot).toString('base64');
    } finally {
        if (browser) await browser.close();
    }
}

const worker = new Worker(
    queueName,
    async (job) => {
        const { jobId, url } = job.data as { jobId: string; url: string };
        try {
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
        } catch (err: any) {
            await prisma.job.update({ where: { id: jobId }, data: { status: 'failed', error: err?.message || 'Unknown error' } });
        }
    },
    { connection }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

console.log('AI Snapshot Worker started. Waiting for jobs...'); 