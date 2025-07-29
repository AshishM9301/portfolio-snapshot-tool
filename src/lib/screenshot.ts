import puppeteer from 'puppeteer'

export interface ScreenshotOptions {
    width?: number
    height?: number
    fullPage?: boolean
    quality?: number
    format?: 'png' | 'jpeg' | 'webp'
}

export async function captureWebsiteScreenshot(
    url: string,
    options: ScreenshotOptions = {}
): Promise<string> {
    const {
        width = 1920,
        height = 1080,
        fullPage = true,
        quality = 90,
        format = 'png'
    } = options

    let browser
    try {
        // Launch browser
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
            width,
            height,
            deviceScaleFactor: 1
        })

        // Set user agent to avoid detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        // Navigate to URL with timeout
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        })

        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Take screenshot
        const screenshot = await page.screenshot({
            type: format,
            quality: format === 'jpeg' ? quality : undefined,
            fullPage
        } as any)

        // Convert to base64
        const base64 = screenshot.toString('base64')
        return base64

    } catch (error) {
        console.error('Error capturing screenshot:', error)
        throw new Error(`Failed to capture screenshot of ${url}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

// Function to validate if a URL is accessible
export async function isUrlAccessible(url: string): Promise<boolean> {
    let browser
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()

        // Set a short timeout for validation
        await page.setDefaultNavigationTimeout(10000)

        const response = await page.goto(url, { waitUntil: 'domcontentloaded' })

        return response?.ok() ?? false
    } catch (error) {
        console.error('Error validating URL accessibility:', error)
        return false
    } finally {
        if (browser) {
            await browser.close()
        }
    }
} 