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
    screenshot: string // base64 encoded
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