import type { TextAnalysisResult } from './text-analyzer'

export interface PriorityResult {
    title: string
    description: string
    source: 'text-input' | 'ai-text-analysis' | 'ai-image-analysis' | 'default'
}

export interface PriorityInputs {
    textInput: string
    textAnalysis: TextAnalysisResult | null
    uploadedImages: File[]
    manualPreferences?: {
        title?: string
        description?: string
    }
}

/**
 * Get prioritized title and description based on the 4 scenarios
 * Priority order: Text input custom title/desc > AI text analysis > AI image analysis > Defaults
 */
export function getPrioritizedTitleAndDescription(inputs: PriorityInputs): PriorityResult {
    const { textInput, textAnalysis, uploadedImages, manualPreferences } = inputs

    // 1. Check for manual preferences (from future manual form dialog)
    if (manualPreferences?.title || manualPreferences?.description) {
        return {
            title: manualPreferences.title ?? 'Portfolio Snapshot',
            description: manualPreferences.description ?? 'Professional portfolio snapshot',
            source: 'text-input'
        }
    }

    // 2. Check for custom title/description in text input (highest priority)
    if (textAnalysis?.customTitle || textAnalysis?.customDescription) {
        return {
            title: textAnalysis.customTitle ?? 'Portfolio Snapshot',
            description: textAnalysis.customDescription ?? 'Professional portfolio snapshot',
            source: 'text-input'
        }
    }

    // 3. Use AI text analysis results
    if (textAnalysis && (textAnalysis.customTitle || textAnalysis.customDescription)) {
        return {
            title: textAnalysis.customTitle ?? 'Portfolio Snapshot',
            description: textAnalysis.customDescription ?? 'Professional portfolio snapshot',
            source: 'ai-text-analysis'
        }
    }

    // 4. If we have uploaded images but no text input, analyze images (future implementation)
    if (uploadedImages.length > 0 && !textInput.trim()) {
        // TODO: Implement AI image analysis
        // For now, use defaults
        return {
            title: 'Image Portfolio Snapshot',
            description: 'AI-generated portfolio snapshot from uploaded images',
            source: 'ai-image-analysis'
        }
    }

    // 5. Fallback to defaults (lowest priority)
    return {
        title: 'Portfolio Snapshot',
        description: 'Professional portfolio snapshot',
        source: 'default'
    }
}

/**
 * Get default title and description based on context
 */
export function getDefaultTitleAndDescription(
    hasImages: boolean,
    hasUrls: boolean,
    urls: string[]
): { title: string; description: string } {
    if (hasImages && hasUrls) {
        return {
            title: 'Multi-Source Portfolio',
            description: `Portfolio snapshot combining images and ${urls.length} website${urls.length > 1 ? 's' : ''}`
        }
    } else if (hasImages) {
        return {
            title: 'Image Portfolio Snapshot',
            description: 'AI-generated portfolio snapshot from uploaded images'
        }
    } else if (hasUrls) {
        const domain = urls[0]?.replace(/^https?:\/\//, '').replace(/^www\./, '') ?? 'website'
        return {
            title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Portfolio`,
            description: `Professional portfolio snapshot of ${domain}`
        }
    }

    return {
        title: 'Portfolio Snapshot',
        description: 'Professional portfolio snapshot'
    }
} 