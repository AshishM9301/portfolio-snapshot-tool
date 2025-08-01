import puppeteer from 'puppeteer'

export interface WebsiteData {
    url: string
    title: string
    description: string
    keywords: string[]
    content: string
    purpose: string
    category: string
    features: string[]
    targetAudience: string
    screenshot: string
    metadata: {
        ogTitle?: string
        ogDescription?: string
        ogImage?: string
        twitterCard?: string
        viewport?: string
        robots?: string
    }
}

export interface WebsiteAnalysis {
    websiteData: WebsiteData
    analysis: {
        purpose: string
        category: string
        keyFeatures: string[]
        targetAudience: string
        valueProposition: string
        technologyIndicators: string[]
        designStyle: string
    }
}

// Function to scrape website data using Puppeteer
export async function scrapeWebsiteData(url: string): Promise<WebsiteData> {
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
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Extract website data
        const websiteData = await page.evaluate(() => {
            const getMetaContent = (name: string) => {
                const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
                return meta?.getAttribute('content') ?? ''
            }

            const getTextContent = (selector: string) => {
                const element = document.querySelector(selector)
                return element?.textContent?.trim() ?? ''
            }

            const getAllText = () => {
                const body = document.body
                if (!body) return ''

                // Remove script and style elements
                const scripts = body.querySelectorAll('script, style, noscript')
                scripts.forEach(script => script.remove?.())

                return body.textContent?.trim() ?? ''
            }

            const extractKeywords = () => {
                const keywords = getMetaContent('keywords')
                if (keywords) {
                    return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
                }
                return []
            }

            const extractFeatures = () => {
                const features: string[] = []

                // Look for common feature indicators
                const featureSelectors = [
                    'button', 'a[href*="signup"]', 'a[href*="login"]', 'a[href*="register"]',
                    '.feature', '.benefit', '.advantage', '[class*="feature"]', '[class*="benefit"]',
                    'h1', 'h2', 'h3', '.hero', '.cta', '.pricing', '.contact'
                ]

                featureSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector)
                    elements.forEach(element => {
                        const text = element.textContent?.trim()
                        if (text && text.length > 3 && text.length < 100) {
                            features.push(text)
                        }
                    })
                })

                return [...new Set(features)].slice(0, 10) // Remove duplicates and limit
            }

            return {
                title: document.title || '',
                description: getMetaContent('description') || getTextContent('p') || '',
                keywords: extractKeywords(),
                content: getAllText(),
                features: extractFeatures(),
                metadata: {
                    ogTitle: getMetaContent('og:title'),
                    ogDescription: getMetaContent('og:description'),
                    ogImage: getMetaContent('og:image'),
                    twitterCard: getMetaContent('twitter:card'),
                    viewport: getMetaContent('viewport'),
                    robots: getMetaContent('robots')
                }
            }
        })

        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true
        })

        return {
            url,
            title: websiteData.title,
            description: websiteData.description,
            keywords: websiteData.keywords,
            content: websiteData.content,
            purpose: '', // Will be filled by AI analysis
            category: '', // Will be filled by AI analysis
            features: websiteData.features,
            targetAudience: '', // Will be filled by AI analysis
            screenshot: Buffer.from(screenshot).toString('base64'),
            metadata: websiteData.metadata
        }

    } catch (error) {
        console.error('Error scraping website data:', error)
        throw new Error(`Failed to scrape website data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

// Function to analyze website data using AI
export async function analyzeWebsiteData(websiteData: WebsiteData): Promise<WebsiteAnalysis> {
    // This would typically call an AI service to analyze the data
    // For now, we'll create a basic analysis based on common patterns

    const analysis = {
        purpose: determinePurpose(websiteData),
        category: determineCategory(websiteData),
        keyFeatures: extractKeyFeatures(websiteData),
        targetAudience: determineTargetAudience(websiteData),
        valueProposition: extractValueProposition(websiteData),
        technologyIndicators: detectTechnology(websiteData),
        designStyle: determineDesignStyle(websiteData)
    }

    return {
        websiteData: {
            ...websiteData,
            purpose: analysis.purpose,
            category: analysis.category,
            targetAudience: analysis.targetAudience
        },
        analysis
    }
}

// Helper functions for analysis
function determinePurpose(data: WebsiteData): string {
    const content = data.content.toLowerCase()
    const title = data.title.toLowerCase()
    const description = data.description.toLowerCase()

    if (content.includes('shop') || content.includes('buy') || content.includes('cart') || content.includes('checkout')) {
        return 'E-commerce platform for selling products or services'
    }

    if (content.includes('portfolio') || content.includes('work') || content.includes('projects')) {
        return 'Portfolio showcase for creative work or projects'
    }

    if (content.includes('blog') || content.includes('article') || content.includes('post')) {
        return 'Blog or content publishing platform'
    }

    if (content.includes('saas') || content.includes('software') || content.includes('app') || content.includes('tool')) {
        return 'Software as a Service (SaaS) application'
    }

    if (content.includes('agency') || content.includes('services') || content.includes('consulting')) {
        return 'Business services or consulting agency'
    }

    if (content.includes('news') || content.includes('media') || content.includes('journalism')) {
        return 'News or media platform'
    }

    return 'General website or platform'
}

function determineCategory(data: WebsiteData): string {
    const purpose = determinePurpose(data)

    if (purpose.includes('E-commerce')) return 'E-commerce'
    if (purpose.includes('Portfolio')) return 'Portfolio'
    if (purpose.includes('Blog')) return 'Blog'
    if (purpose.includes('SaaS')) return 'SaaS'
    if (purpose.includes('Agency')) return 'Business Services'
    if (purpose.includes('News')) return 'Media'

    return 'General'
}

function extractKeyFeatures(data: WebsiteData): string[] {
    const features = [...data.features]

    // Add features based on content analysis
    const content = data.content.toLowerCase()

    if (content.includes('responsive') || content.includes('mobile')) {
        features.push('Responsive Design')
    }

    if (content.includes('secure') || content.includes('ssl') || content.includes('https')) {
        features.push('Security')
    }

    if (content.includes('fast') || content.includes('performance') || content.includes('optimized')) {
        features.push('Performance Optimized')
    }

    return [...new Set(features)].slice(0, 8) // Remove duplicates and limit
}

function determineTargetAudience(data: WebsiteData): string {
    const content = data.content.toLowerCase()

    if (content.includes('business') || content.includes('enterprise') || content.includes('corporate')) {
        return 'Businesses and Enterprises'
    }

    if (content.includes('developer') || content.includes('programmer') || content.includes('coder')) {
        return 'Developers and Programmers'
    }

    if (content.includes('designer') || content.includes('creative') || content.includes('artist')) {
        return 'Designers and Creatives'
    }

    if (content.includes('startup') || content.includes('entrepreneur')) {
        return 'Startups and Entrepreneurs'
    }

    if (content.includes('student') || content.includes('education') || content.includes('learn')) {
        return 'Students and Learners'
    }

    return 'General Users'
}

function extractValueProposition(data: WebsiteData): string {
    const title = data.title
    const description = data.description

    if (description && description.length > 10) {
        return description.length > 150 ? description.substring(0, 150) + '...' : description
    }

    if (title && title.length > 10) {
        return title
    }

    return 'Professional website with modern design and functionality'
}

function detectTechnology(data: WebsiteData): string[] {
    const technologies: string[] = []
    const content = data.content.toLowerCase()

    // Detect common technologies
    if (content.includes('react') || content.includes('vue') || content.includes('angular')) {
        technologies.push('Modern JavaScript Framework')
    }

    if (content.includes('node') || content.includes('express')) {
        technologies.push('Node.js Backend')
    }

    if (content.includes('python') || content.includes('django') || content.includes('flask')) {
        technologies.push('Python Backend')
    }

    if (content.includes('wordpress')) {
        technologies.push('WordPress CMS')
    }

    if (content.includes('shopify')) {
        technologies.push('Shopify E-commerce')
    }

    if (content.includes('cloud') || content.includes('aws') || content.includes('azure')) {
        technologies.push('Cloud Hosting')
    }

    return technologies
}

function determineDesignStyle(data: WebsiteData): string {
    const content = data.content.toLowerCase()

    if (content.includes('minimal') || content.includes('clean') || content.includes('simple')) {
        return 'Minimalist'
    }

    if (content.includes('modern') || content.includes('contemporary')) {
        return 'Modern'
    }

    if (content.includes('creative') || content.includes('artistic') || content.includes('bold')) {
        return 'Creative'
    }

    if (content.includes('professional') || content.includes('corporate') || content.includes('business')) {
        return 'Professional'
    }

    return 'Contemporary'
} 