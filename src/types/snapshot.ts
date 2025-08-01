export interface TemplateProps {
    title: string
    screenshot: string // base64 encoded image
    features: string[]
    category: string
    targetAudience: string
    technology: string[]
    designStyle: string
    url: string
    timestamp: Date
    description?: string
    purpose?: string
    valueProposition?: string
}

export interface Template {
    id: string
    name: string
    description: string
    style: 'portfolio-multi' | 'portfolio-single' | 'creative' | 'professional'
    aspectRatio: '16:9' | '4:3' | '1:1' | '3:2'
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        text: string
    }
}

export interface GeneratedSnapshot {
    id: string
    title: string
    description: string
    htmlContent: string // Generated HTML for preview
    pngUrl?: string // URL to generated PNG (optional)
    style: string
    aspectRatio: string
    timestamp: Date
    template: Template
    data: TemplateProps
}

import type { WebsiteAnalysis } from './website'

export interface SnapshotGenerationRequest {
    websiteAnalysis: WebsiteAnalysis
    style?: 'portfolio-multi' | 'portfolio-single' | 'creative' | 'professional'
    aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2'
    customTitle?: string
    customDescription?: string
}

// New AI-generated snapshot interface
export interface AIGeneratedSnapshot {
    id: string
    htmlContent: string // AI-generated HTML
    pngUrl: string // Base64 encoded PNG
    screenshots: {
        desktop: string // base64
        mobile?: string // base64
        tablet?: string // base64
    }
    websiteAnalysis: WebsiteAnalysis
    generatedAt: Date
    metadata: {
        aiModel: string
        generationTime: number // in milliseconds
        promptTokens?: number
        responseTokens?: number
        quality: 'high' | 'medium' | 'low'
        style?: 'modern' | 'professional' | 'creative' | 'minimal'
    }
}

// Multi-device screenshots interface
export interface MultiDeviceScreenshots {
    desktop: string // base64
    mobile?: string // base64
    tablet?: string // base64
}

// AI generation options
export interface AIGenerationOptions {
    includeMobile?: boolean
    includeTablet?: boolean
    quality?: 'high' | 'medium' | 'low'
    style?: 'modern' | 'professional' | 'creative' | 'minimal'
    customPrompt?: string
}

// Enhanced website analysis for AI
export interface EnhancedWebsiteAnalysis extends WebsiteAnalysis {
    visualElements?: {
        colorScheme: string[]
        typography: string
        layoutStyle: string
        visualHierarchy: string
    }
    responsiveFeatures?: {
        mobileOptimized: boolean
        tabletOptimized: boolean
        accessibilityScore: number
    }
    aiInsights?: {
        designQuality: number // 0-100
        contentRelevance: number // 0-100
        visualAppeal: number // 0-100
        recommendedStyle: string
    }
}

// AI generation result with metadata
export interface AIGenerationResult {
    success: boolean
    snapshot?: AIGeneratedSnapshot
    error?: string
    warnings: string[]
    metadata: {
        generationTime: number
        aiModel: string
        promptLength: number
        responseLength: number
        validationPassed: boolean
    }
}

// Portfolio card dimensions
export interface PortfolioCardDimensions {
    width: number
    height: number
    aspectRatio: string
}

// Standard portfolio card dimensions
export const PORTFOLIO_DIMENSIONS: PortfolioCardDimensions = {
    width: 1200,
    height: 675,
    aspectRatio: '16:9'
}

// AI model configuration
export interface AIModelConfig {
    model: string
    maxTokens: number
    temperature: number
    topP: number
    frequencyPenalty: number
    presencePenalty: number
}

// Default AI model configuration
export const DEFAULT_AI_CONFIG: AIModelConfig = {
    model: 'anthropic/claude-3.5-sonnet',
    maxTokens: 4000,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
}


export interface BatchSnapshotRequest {
    urls: string[]
}

export interface BatchSnapshotResponse {
    jobIds: string[]
    error?: string
}

export interface BatchSnapshotJobStatus {
    status: 'queued' | 'processing' | 'completed' | 'failed'
    resultUrl?: string
    error?: string
}

export interface BatchSnapshotJob {
    id: string
    status: 'queued' | 'processing' | 'completed' | 'failed'
}