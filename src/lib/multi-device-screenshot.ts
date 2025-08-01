import puppeteer from 'puppeteer'

export interface MultiDeviceScreenshots {
    desktop: string // base64
    mobile?: string // base64
    tablet?: string // base64
}

export interface ScreenshotOptions {
    width: number
    height: number
    deviceScaleFactor?: number
    fullPage?: boolean
    quality?: number
    format?: 'png' | 'jpeg' | 'webp'
}

// Enhanced screenshot capture function
async function captureScreenshot(
    url: string,
    options: ScreenshotOptions
): Promise<string> {
    const {
        width,
        height,
        deviceScaleFactor = 1,
        fullPage = false,
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
            deviceScaleFactor
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
        })

        // Convert to base64
        const base64 = Buffer.from(screenshot).toString('base64')
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

// Main function to capture multi-device screenshots
export async function captureMultiDeviceScreenshots(
    url: string,
    options: {
        includeMobile?: boolean
        includeTablet?: boolean
        deviceScaleFactor?: number
    } = {}
): Promise<MultiDeviceScreenshots> {
    const {
        includeMobile = false,
        includeTablet = false,
        deviceScaleFactor = 1
    } = options

    console.log(`Starting multi-device screenshot capture for: ${url}`)

    const screenshots: MultiDeviceScreenshots = {
        desktop: await captureScreenshot(url, {
            width: 1200,
            height: 675,
            deviceScaleFactor,
            fullPage: false
        })
    }

    if (includeMobile) {
        console.log('Capturing mobile screenshot...')
        screenshots.mobile = await captureScreenshot(url, {
            width: 375,
            height: 667,
            deviceScaleFactor,
            fullPage: false
        })
    }

    if (includeTablet) {
        console.log('Capturing tablet screenshot...')
        screenshots.tablet = await captureScreenshot(url, {
            width: 768,
            height: 1024,
            deviceScaleFactor,
            fullPage: false
        })
    }

    console.log('Multi-device screenshots captured successfully')
    return screenshots
}

// Function to validate if a URL is accessible (reused from existing screenshot.ts)
export async function isUrlAccessible(url: string): Promise<boolean> {
    let browser
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()

        // Set a short timeout for validation
        page.setDefaultNavigationTimeout(10000)

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