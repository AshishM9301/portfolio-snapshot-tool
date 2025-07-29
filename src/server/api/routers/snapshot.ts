import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { generateSnapshots } from "@/lib/openrouter"
import { scrapeWebsiteData, analyzeWebsiteData, type WebsiteAnalysis } from "@/lib/website-analyzer"
import { generateSnapshotVariations, regenerateSnapshot } from "@/lib/snapshot-generator-v2"
import type { GeneratedSnapshot, SnapshotGenerationRequest, AIGeneratedSnapshot, AIGenerationOptions } from "@/types"
import { captureMultiDeviceScreenshots } from "@/lib/multi-device-screenshot"
import { generateAIPortfolioHTML } from "@/lib/ai-html-generator"
import { convertHTMLToPNG } from "@/lib/html-to-png"
import puppeteer from 'puppeteer'

// Schema for enhanced snapshot generation input
const enhancedSnapshotGenerationSchema = z.object({
    url: z.string().url(),
    style: z.enum(['portfolio-multi', 'portfolio-single', 'professional', 'creative']).optional(),
    aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:2']).optional(),
    customTitle: z.string().optional(),
    customDescription: z.string().optional(),
    model: z.string().optional()
})

// Schema for snapshot regeneration
const snapshotRegenerationSchema = z.object({
    snapshotId: z.string(),
    websiteAnalysis: z.object({
        websiteData: z.object({
            url: z.string(),
            title: z.string(),
            description: z.string(),
            keywords: z.array(z.string()),
            content: z.string(),
            purpose: z.string(),
            category: z.string(),
            features: z.array(z.string()),
            targetAudience: z.string(),
            screenshot: z.string(),
            metadata: z.object({
                ogTitle: z.string().optional(),
                ogDescription: z.string().optional(),
                ogImage: z.string().optional(),
                twitterCard: z.string().optional(),
                viewport: z.string().optional(),
                robots: z.string().optional()
            })
        }),
        analysis: z.object({
            purpose: z.string(),
            category: z.string(),
            keyFeatures: z.array(z.string()),
            targetAudience: z.string(),
            valueProposition: z.string(),
            technologyIndicators: z.array(z.string()),
            designStyle: z.string()
        })
    }),
    style: z.enum(['portfolio-multi', 'portfolio-single', 'professional', 'creative']).optional(),
    aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:2']).optional(),
    customTitle: z.string().optional(),
    customDescription: z.string().optional()
})

// Legacy schema for backward compatibility
const snapshotGenerationSchema = z.object({
    url: z.string().url(),
    style: z.enum(['professional', 'creative', 'minimal', 'modern']).optional(),
    model: z.string().optional()
})

// Function to capture website screenshot (legacy function)
async function captureWebsiteScreenshot(url: string): Promise<string> {
    let browser
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
                '--disable-gpu'
            ]
        })

        const page = await browser.newPage()

        // Set viewport
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        })

        // Set user agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        // Navigate to URL
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        })

        // Wait for page to load
        await new Promise<void>(resolve => setTimeout(() => resolve(), 2000))

        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true
        })

        // Convert to base64
        return screenshot.toString('base64')

    } catch (error) {
        console.error('Error capturing screenshot:', error)
        throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

export const snapshotRouter = createTRPCRouter({
    // Enhanced snapshot generation with website analysis
    generateEnhancedSnapshots: publicProcedure
        .input(enhancedSnapshotGenerationSchema)
        .mutation(async ({ input }): Promise<{ snapshots: GeneratedSnapshot[], analysis: WebsiteAnalysis }> => {
            try {
                console.log(`Starting enhanced snapshot generation for: ${input.url}`)

                // Step 1: Scrape website data
                console.log('Scraping website data...')
                const websiteData = await scrapeWebsiteData(input.url)

                // Step 2: Analyze website data
                console.log('Analyzing website data...')
                const analysis = await analyzeWebsiteData(websiteData)

                // Step 3: Generate snapshot variations
                console.log('Generating snapshot variations...')
                const request: SnapshotGenerationRequest = {
                    websiteAnalysis: analysis,
                    style: input.style,
                    aspectRatio: input.aspectRatio,
                    customTitle: input.customTitle,
                    customDescription: input.customDescription
                }

                const snapshots = generateSnapshotVariations(request)

                console.log(`Generated ${snapshots.length} enhanced snapshots`)
                return { snapshots, analysis }

            } catch (error) {
                console.error('Error in generateEnhancedSnapshots:', error)
                throw new Error(`Failed to generate enhanced snapshots: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }),

    // Regenerate a specific snapshot
    regenerateSnapshot: publicProcedure
        .input(snapshotRegenerationSchema)
        .mutation(async ({ input }): Promise<GeneratedSnapshot> => {
            try {
                console.log(`Regenerating snapshot: ${input.snapshotId}`)

                const request: SnapshotGenerationRequest = {
                    websiteAnalysis: input.websiteAnalysis,
                    style: input.style,
                    aspectRatio: input.aspectRatio,
                    customTitle: input.customTitle,
                    customDescription: input.customDescription
                }

                const snapshotResult = regenerateSnapshot(input.snapshotId, request)

                console.log('Snapshot regenerated successfully')
                return snapshotResult

            } catch (error) {
                console.error('Error in regenerateSnapshot:', error)
                throw new Error(`Failed to regenerate snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }),

    // Legacy snapshot generation (for backward compatibility)
    generateLegacySnapshots: publicProcedure
        .input(snapshotGenerationSchema)
        .mutation(async ({ input }): Promise<import('@/lib/openrouter').GeneratedSnapshot[]> => {
            try {
                // Step 1: Capture website screenshot
                console.log(`Capturing screenshot for: ${input.url}`)
                const screenshotBase64 = await captureWebsiteScreenshot(input.url)

                // Step 2: Generate AI snapshots
                console.log('Generating AI snapshots...')
                const snapshots = await generateSnapshots(
                    screenshotBase64,
                    input.url,
                    input.model as import('@/lib/openrouter').VisionModel,
                    input.style
                )

                console.log(`Generated ${snapshots.length} snapshots`)
                return snapshots

            } catch (error) {
                console.error('Error in generateSnapshots:', error)
                throw new Error(`Failed to generate snapshots: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }),

    validateUrl: publicProcedure
        .input(z.object({ url: z.string().url() }))
        .mutation(async ({ input }) => {
            let browser
            try {
                browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                })

                const page = await browser.newPage()
                await page.setDefaultNavigationTimeout(10000)

                const response = await page.goto(input.url, { waitUntil: 'domcontentloaded' })

                return {
                    isValid: response?.ok() ?? false,
                    status: response?.status(),
                    url: input.url
                }
            } catch (error) {
                return {
                    isValid: false,
                    status: 0,
                    url: input.url,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            } finally {
                if (browser) {
                    await browser.close()
                }
            }
        }),

    // AI-driven snapshot generation
    generateAISnapshot: publicProcedure
        .input(z.object({
            url: z.string().url(),
            includeMobile: z.boolean().optional().default(false),
            includeTablet: z.boolean().optional().default(false),
            quality: z.enum(['high', 'medium', 'low']).optional().default('high'),
            style: z.enum(['modern', 'professional', 'creative', 'minimal']).optional().default('modern')
        }))
        .mutation(async ({ input }): Promise<AIGeneratedSnapshot> => {
            const startTime = Date.now()

            try {
                console.log(`Starting AI snapshot generation for: ${input.url} with style: ${input.style}, quality: ${input.quality}`)

                // Step 1: Capture multi-device screenshots
                console.log('Capturing screenshots...')
                const screenshots = await captureMultiDeviceScreenshots(input.url, {
                    includeMobile: input.includeMobile,
                    includeTablet: input.includeTablet,
                    deviceScaleFactor: input.quality === 'high' ? 2 : 1
                })

                // Step 2: Analyze website data
                console.log('Analyzing website data...')
                const websiteData = await scrapeWebsiteData(input.url)
                const analysis = await analyzeWebsiteData(websiteData)

                // Step 3: Generate AI HTML with style and quality parameters
                console.log(`Generating AI HTML with style: ${input.style}, quality: ${input.quality}...`)
                const htmlContent = await generateAIPortfolioHTML(analysis, screenshots, {
                    style: input.style,
                    quality: input.quality,
                    includeMobile: input.includeMobile,
                    includeTablet: input.includeTablet
                })

                // Step 4: Convert HTML to PNG
                console.log('Converting to PNG...')
                const pngBuffer = await convertHTMLToPNG(htmlContent, {
                    deviceScaleFactor: input.quality === 'high' ? 2 : 1,
                    quality: input.quality === 'high' ? 95 : 85
                })

                const generationTime = Date.now() - startTime

                // Step 5: Return result
                const snapshot: AIGeneratedSnapshot = {
                    id: `ai-snapshot-${Date.now()}`,
                    htmlContent,
                    pngUrl: `data:image/png;base64,${pngBuffer.toString('base64')}`,
                    screenshots,
                    websiteAnalysis: analysis,
                    generatedAt: new Date(),
                    metadata: {
                        aiModel: 'anthropic/claude-3.5-sonnet',
                        generationTime,
                        quality: input.quality,
                        style: input.style,
                        promptTokens: htmlContent.length, // Approximate
                        responseTokens: htmlContent.length // Approximate
                    }
                }

                console.log(`AI snapshot generated successfully in ${generationTime}ms with style: ${input.style}`)
                return snapshot

            } catch (error) {
                console.error('Error in generateAISnapshot:', error)
                throw new Error(`Failed to generate AI snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }),

    // Test AI generation capabilities
    testAIGeneration: publicProcedure
        .mutation(async () => {
            try {
                const { testAIGeneration } = await import('@/lib/ai-html-generator')
                const { testHTMLToPNGConversion } = await import('@/lib/html-to-png')

                const aiTest = await testAIGeneration()
                const pngTest = await testHTMLToPNGConversion()

                return {
                    aiGeneration: aiTest,
                    pngConversion: pngTest,
                    overall: aiTest && pngTest
                }
            } catch (error) {
                console.error('Error testing AI generation:', error)
                return {
                    aiGeneration: false,
                    pngConversion: false,
                    overall: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            }
        })
}) 