import puppeteer from 'puppeteer'

export interface PNGConversionOptions {
    width?: number
    height?: number
    deviceScaleFactor?: number
    quality?: number
    format?: 'png' | 'jpeg'
    waitTime?: number
}

// Default options for portfolio card generation
const DEFAULT_OPTIONS: PNGConversionOptions = {
    width: 1200,
    height: 675,
    deviceScaleFactor: 2, // Higher quality
    quality: 90,
    format: 'png',
    waitTime: 1000
}

// Convert HTML content to PNG buffer
export async function convertHTMLToPNG(
    htmlContent: string,
    options: PNGConversionOptions = {}
): Promise<Buffer> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    let browser
    try {
        console.log('Starting HTML to PNG conversion...')

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

        // Set viewport to match our design dimensions
        await page.setViewport({
            width: opts.width!,
            height: opts.height!,
            deviceScaleFactor: opts.deviceScaleFactor
        })

        // Set content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
        })

        // Wait for any animations or dynamic content to complete
        if (opts.waitTime && opts.waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, opts.waitTime))
        }

        // Take screenshot
        const screenshot = await page.screenshot({
            type: opts.format,
            quality: opts.format === 'jpeg' ? opts.quality : undefined,
            fullPage: false,
            omitBackground: false
        })

        console.log('HTML to PNG conversion completed successfully')
        return screenshot as Buffer

    } catch (error) {
        console.error('Error converting HTML to PNG:', error)
        throw new Error(`Failed to convert HTML to PNG: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

// Convert HTML content to base64 PNG string
export async function convertHTMLToBase64PNG(
    htmlContent: string,
    options: PNGConversionOptions = {}
): Promise<string> {
    const buffer = await convertHTMLToPNG(htmlContent, options)
    return buffer.toString('base64')
}

// Convert HTML content to data URL
export async function convertHTMLToDataURL(
    htmlContent: string,
    options: PNGConversionOptions = {}
): Promise<string> {
    const base64 = await convertHTMLToBase64PNG(htmlContent, options)
    return `data:image/png;base64,${base64}`
}

// Validate HTML content before conversion
export function validateHTMLForConversion(htmlContent: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
} {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for basic HTML structure
    if (!htmlContent.includes('<!DOCTYPE html>')) {
        errors.push('Missing DOCTYPE declaration')
    }

    if (!htmlContent.includes('<html')) {
        errors.push('Missing HTML tag')
    }

    if (!htmlContent.includes('<body>')) {
        errors.push('Missing body tag')
    }

    // Check for viewport meta tag
    if (!htmlContent.includes('viewport')) {
        warnings.push('Missing viewport meta tag - may affect rendering')
    }

    // Check for proper dimensions
    if (!htmlContent.includes('width: 1200px') && !htmlContent.includes('width:1200px')) {
        warnings.push('No explicit 1200px width found')
    }

    if (!htmlContent.includes('height: 675px') && !htmlContent.includes('height:675px')) {
        warnings.push('No explicit 675px height found')
    }

    // Check for overflow hidden
    if (!htmlContent.includes('overflow: hidden') && !htmlContent.includes('overflow:hidden')) {
        warnings.push('No overflow hidden found - may cause scrolling')
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

// Test HTML to PNG conversion with a simple HTML
export async function testHTMLToPNGConversion(): Promise<boolean> {
    try {
        const testHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test</title>
        <style>
          body { 
            width: 1200px; 
            height: 675px; 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }
          .test-content {
            text-align: center;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="test-content">
          <h1>Test Conversion</h1>
          <p>If you can see this, HTML to PNG conversion is working!</p>
        </div>
      </body>
      </html>
    `

        const buffer = await convertHTMLToPNG(testHTML, {
            width: 1200,
            height: 675,
            deviceScaleFactor: 1,
            waitTime: 500
        })

        // Check if we got a valid buffer
        return buffer.length > 0

    } catch (error) {
        console.error('HTML to PNG conversion test failed:', error)
        return false
    }
}

// Get conversion options info
export function getConversionOptionsInfo(): {
    defaultWidth: number
    defaultHeight: number
    defaultScaleFactor: number
    supportedFormats: string[]
} {
    return {
        defaultWidth: DEFAULT_OPTIONS.width!,
        defaultHeight: DEFAULT_OPTIONS.height!,
        defaultScaleFactor: DEFAULT_OPTIONS.deviceScaleFactor!,
        supportedFormats: ['png', 'jpeg']
    }
} 