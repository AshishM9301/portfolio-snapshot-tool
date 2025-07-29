import puppeteer from 'puppeteer'

export interface PNGGenerationOptions {
    width?: number
    height?: number
    quality?: number
    format?: 'png' | 'jpeg'
    fullPage?: boolean
}

export interface PNGGenerationResult {
    buffer: Buffer
    width: number
    height: number
    format: string
}

/**
 * Generate PNG from HTML using Puppeteer
 */
export async function generatePNGFromHTML(
    html: string,
    options: PNGGenerationOptions = {}
): Promise<PNGGenerationResult> {
    const {
        width = 1200,
        height = 675,
        quality = 90,
        format = 'png',
        fullPage = false
    } = options

    let browser
    try {
        // Launch browser with optimized settings
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
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        })

        const page = await browser.newPage()

        // Set viewport
        await page.setViewport({
            width,
            height,
            deviceScaleFactor: 1
        })

        // Set user agent for consistent rendering
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        // Set content and wait for it to load
        await page.setContent(html, {
            waitUntil: ['networkidle0', 'domcontentloaded']
        })

        // Wait a bit for any animations or dynamic content
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Take screenshot
        const screenshot = await page.screenshot({
            type: format,
            quality: format === 'jpeg' ? quality : undefined,
            fullPage,
            omitBackground: false
        })

        return {
            buffer: screenshot as Buffer,
            width,
            height,
            format
        }

    } catch (error) {
        console.error('Error generating PNG from HTML:', error)
        throw new Error(`Failed to generate PNG: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

/**
 * Generate PNG from HTML with specific aspect ratio
 */
export async function generatePNGWithAspectRatio(
    html: string,
    aspectRatio: '16:9' | '4:3' | '1:1' | '3:2' = '16:9',
    options: PNGGenerationOptions = {}
): Promise<PNGGenerationResult> {
    const dimensions = getDimensionsFromAspectRatio(aspectRatio)

    return generatePNGFromHTML(html, {
        ...options,
        width: dimensions[0],
        height: dimensions[1]
    })
}

/**
 * Get dimensions based on aspect ratio
 */
function getDimensionsFromAspectRatio(aspectRatio: string): [number, number] {
    switch (aspectRatio) {
        case '16:9':
            return [1200, 675]
        case '4:3':
            return [1200, 900]
        case '1:1':
            return [1200, 1200]
        case '3:2':
            return [1200, 800]
        default:
            return [1200, 675]
    }
}

/**
 * Generate multiple PNGs from HTML templates
 */
export async function generateMultiplePNGs(
    htmlTemplates: Array<{ id: string; html: string; aspectRatio: string }>,
    options: PNGGenerationOptions = {}
): Promise<Array<{ id: string; result: PNGGenerationResult }>> {
    const results = []

    for (const template of htmlTemplates) {
        try {
            const result = await generatePNGWithAspectRatio(
                template.html,
                template.aspectRatio as '16:9' | '4:3' | '1:1' | '3:2',
                options
            )

            results.push({
                id: template.id,
                result
            })
        } catch (error) {
            console.error(`Error generating PNG for template ${template.id}:`, error)
            // Continue with other templates
        }
    }

    return results
}

/**
 * Validate HTML content before generation
 */
export function validateHTML(html: string): boolean {
    if (!html || typeof html !== 'string') {
        return false
    }

    // Basic HTML validation
    const hasDoctype = html.includes('<!DOCTYPE html>')
    const hasHtmlTag = html.includes('<html')
    const hasBodyTag = html.includes('<body')

    return hasDoctype && hasHtmlTag && hasBodyTag
}

/**
 * Optimize HTML for PNG generation
 */
export function optimizeHTMLForPNG(html: string): string {
    // Remove any script tags that might cause issues
    const optimizedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // Ensure proper DOCTYPE
    if (!optimizedHTML.includes('<!DOCTYPE html>')) {
        return `<!DOCTYPE html>${optimizedHTML}`
    }

    return optimizedHTML
} 