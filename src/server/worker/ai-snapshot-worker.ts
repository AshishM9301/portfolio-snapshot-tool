import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { env } from '@/env';
import { scrapeWebsiteData, analyzeWebsiteData } from '@/lib/website-analyzer';
import { generateAIPortfolioHTML } from '@/lib/ai-html-generator';
import { convertHTMLToPNG } from '@/lib/html-to-png';
import { analyzeManualPreferences, mergeManualAndStylePreferences } from '@/lib/manual-preferences-analyzer';
import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import packageJson from '../../../package.json';

if (!env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
}

const connection = new IORedis(env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});
const prisma = new PrismaClient();

const queueName = 'ai-snapshot-queue';
const workerId = process.env.WORKER_ID ?? 'unknown';

// Log worker startup with version info
console.log(`🤖 AI Snapshot Worker v${packageJson.version} (ID: ${workerId}) starting...`);
console.log(`📦 Package: ${packageJson.name}`);
console.log(`🕐 Build time: ${new Date().toISOString()}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Redis URL: ${env.REDIS_URL ?? 'redis://localhost:6379'}`);
console.log(`📋 Queue: ${queueName}`);

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

// NEW FUNCTION: Process image-based snapshots
async function processImageSnapshot(
    jobId: string,
    imageData: string,
    imageName: string,
    imageType: string,
    stylePreferences?: string,
    manualPreferences?: { title?: string; description?: string }
): Promise<void> {
    try {
        console.log(`🖼️ Worker ${workerId} starting image processing for job ${jobId}...`);

        // Check if job exists in database before processing
        const existingJob = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!existingJob) {
            console.log(`⚠️ Job ${jobId} not found in database, skipping...`);
            return;
        }

        console.log(`📝 Updating job ${jobId} status to 'processing'...`);
        await prisma.job.update({ where: { id: jobId }, data: { status: 'processing' } });

        // Parse style preferences to extract title and description
        let customTitle = `Portfolio from ${imageName}`
        let customDescription = 'AI-generated portfolio from uploaded image'

        if (stylePreferences) {
            const titleMatch = /Title:\s*([^|]+)/i.exec(stylePreferences)
            if (titleMatch?.[1]) {
                customTitle = titleMatch[1].trim()
            }

            const descMatch = /Description:\s*([^|]+)/i.exec(stylePreferences)
            if (descMatch?.[1]) {
                customDescription = descMatch[1].trim()
            }
        }

        console.log('Parsed custom title:', customTitle)
        console.log('Parsed custom description:', customDescription)

        // Create a mock website analysis from the image
        const mockAnalysis = {
            websiteData: {
                url: `image://${imageName}`,
                title: customTitle,
                description: customDescription,
                keywords: ['portfolio', 'design', 'creative'],
                content: 'Portfolio content generated from image analysis',
                purpose: 'portfolio',
                category: 'design',
                features: ['visual design', 'creative work'],
                targetAudience: 'clients and employers',
                screenshot: `data:${imageType};base64,${imageData}`,
                metadata: {}
            },
            analysis: {
                purpose: 'portfolio showcase',
                category: 'design portfolio',
                keyFeatures: ['visual design', 'creative work', 'professional presentation'],
                targetAudience: 'clients and employers',
                valueProposition: 'Professional portfolio showcasing creative work',
                technologyIndicators: ['design tools', 'creative software'],
                designStyle: 'modern'
            }
        };

        // Analyze manual preferences if provided
        const analyzedManualPreferences = await analyzeManualPreferences(manualPreferences);

        // Parse style preferences from job data for dynamic portfolio generation
        const parsedStylePreferences = {
            style: stylePreferences?.includes('professional') ? 'professional' :
                stylePreferences?.includes('creative') ? 'creative' :
                    stylePreferences?.includes('minimal') ? 'minimal' : 'modern',
            quality: stylePreferences?.includes('high') ? 'high' :
                stylePreferences?.includes('medium') ? 'medium' :
                    stylePreferences?.includes('low') ? 'low' : 'high',
            includeMobile: stylePreferences?.includes('mobile') ?? stylePreferences?.includes('responsive') ?? false,
            includeTablet: stylePreferences?.includes('tablet') ?? stylePreferences?.includes('responsive') ?? false
        };

        console.log('Parsed style preferences from job data:', parsedStylePreferences);

        // Merge manual and style preferences for intelligent portfolio generation
        const mergedPreferences = mergeManualAndStylePreferences(analyzedManualPreferences, parsedStylePreferences);

        console.log('Merged preferences for image portfolio generation:', mergedPreferences);

        // Generate AI HTML using the provided image with enhanced preferences
        const htmlContent = await generateAIPortfolioHTML(
            mockAnalysis,
            { desktop: imageData },
            mergedPreferences
        );

        // Convert HTML to PNG (buffer)
        const pngBuffer = await convertHTMLToPNG(htmlContent, { deviceScaleFactor: 2, quality: 95 });

        // Store PNG as data URL in DB
        const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
        await prisma.job.update({ where: { id: jobId }, data: { status: 'completed', resultUrl: dataUrl } });
    } catch (err: unknown) {
        console.error(`Error processing image job ${jobId}:`, err);
        // Only update if job still exists
        try {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            await prisma.job.update({ where: { id: jobId }, data: { status: 'failed', error: errorMessage } });
        } catch (updateErr) {
            console.log(`Could not update job ${jobId} status:`, updateErr);
        }
    }
}

const worker = new Worker(
    queueName,
    async (job) => {
        const { jobId, url, imageData, imageName, imageType, stylePreferences, manualPreferences } = job.data as {
            jobId: string;
            url?: string;
            imageData?: string;
            imageName?: string;
            imageType?: string;
            stylePreferences?: string;
            manualPreferences?: {
                title?: string;
                description?: string;
            }
        };

        console.log(`🔄 Worker ${workerId} processing job ${jobId}...`);
        console.log(`📋 Job type: ${imageData ? 'Image' : 'URL'}`);
        if (imageData) {
            console.log(`🖼️ Image: ${imageName} (${imageType})`);
        }
        if (url) {
            console.log(`🌐 URL: ${url}`);
        }
        if (stylePreferences) {
            console.log(`🎨 Style preferences: ${stylePreferences}`);
        }

        // Route to appropriate processing function based on job type
        if (imageData && imageName && imageType) {
            // Process image-based job
            await processImageSnapshot(jobId, imageData, imageName, imageType, stylePreferences, manualPreferences);
        } else if (url) {
            // Process URL-based job (existing functionality)
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
                const analyzedManualPreferences = await analyzeManualPreferences(manualPreferences);

                // Puppeteer screenshot (base64)
                const screenshotBase64 = await captureScreenshotBase64(url);

                // Parse style preferences from job data for dynamic portfolio generation
                const parsedStylePreferences = {
                    style: stylePreferences?.includes('professional') ? 'professional' :
                        stylePreferences?.includes('creative') ? 'creative' :
                            stylePreferences?.includes('minimal') ? 'minimal' : 'modern',
                    quality: stylePreferences?.includes('high') ? 'high' :
                        stylePreferences?.includes('medium') ? 'medium' :
                            stylePreferences?.includes('low') ? 'low' : 'high',
                    includeMobile: stylePreferences?.includes('mobile') ?? stylePreferences?.includes('responsive') ?? false,
                    includeTablet: stylePreferences?.includes('tablet') ?? stylePreferences?.includes('responsive') ?? false
                };

                console.log('Parsed style preferences from job data:', parsedStylePreferences);

                // Merge manual and style preferences for intelligent portfolio generation
                const mergedPreferences = mergeManualAndStylePreferences(analyzedManualPreferences, parsedStylePreferences);

                console.log('Merged preferences for portfolio generation:', mergedPreferences);

                // Generate AI HTML with enhanced preferences
                const htmlContent = await generateAIPortfolioHTML(analysis, { desktop: screenshotBase64 }, mergedPreferences);

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
        } else {
            throw new Error('Invalid job data: missing URL or image data');
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
    console.log(`✅ Worker ${workerId} completed job ${job.id}`);
});
worker.on('failed', (job, err) => {
    console.error(`❌ Worker ${workerId} failed job ${job?.id}:`, err);
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

console.log(`✅ AI Snapshot Worker v${packageJson.version} (ID: ${workerId}) started with concurrency: 3. Waiting for jobs...`); 