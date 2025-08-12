export interface ManualPreferences {
    title?: string
    description?: string
}

export interface AnalyzedManualPreferences {
    style?: 'modern' | 'professional' | 'creative' | 'minimal'
    quality?: 'high' | 'medium' | 'low'
    theme?: 'light' | 'dark' | 'colorful' | 'neutral'
    layout?: 'grid' | 'card' | 'hero' | 'minimal'
    typography?: 'serif' | 'sans-serif' | 'display' | 'modern'
    colorScheme?: 'blue' | 'green' | 'purple' | 'warm' | 'cool' | 'monochrome'
    visualElements?: 'gradients' | 'shadows' | 'borders' | 'clean'
    confidence: {
        style: number
        quality: number
        theme: number
        layout: number
        typography: number
        colorScheme: number
        overall: number
    }
}

export interface StylePreferences {
    style?: string
    quality?: string
    includeMobile?: boolean
    includeTablet?: boolean
}

export interface MergedPreferences {
    style: 'modern' | 'professional' | 'creative' | 'minimal'
    quality: 'high' | 'medium' | 'low'
    includeMobile: boolean
    includeTablet: boolean
    theme?: string
    layout?: string
    typography?: string
    colorScheme?: string
    visualElements?: string
}

// Type guards for validation
export const isValidStyle = (style: unknown): style is 'modern' | 'professional' | 'creative' | 'minimal' => {
    return typeof style === 'string' && ['modern', 'professional', 'creative', 'minimal'].includes(style)
}

export const isValidQuality = (quality: unknown): quality is 'high' | 'medium' | 'low' => {
    return typeof quality === 'string' && ['high', 'medium', 'low'].includes(quality)
}

export const isValidTheme = (theme: unknown): theme is 'light' | 'dark' | 'colorful' | 'neutral' => {
    return typeof theme === 'string' && ['light', 'dark', 'colorful', 'neutral'].includes(theme)
}

export const isValidLayout = (layout: unknown): layout is 'grid' | 'card' | 'hero' | 'minimal' => {
    return typeof layout === 'string' && ['grid', 'card', 'hero', 'minimal'].includes(layout)
}

export const isValidTypography = (typography: unknown): typography is 'serif' | 'sans-serif' | 'display' | 'modern' => {
    return typeof typography === 'string' && ['serif', 'sans-serif', 'display', 'modern'].includes(typography)
}

export const isValidColorScheme = (colorScheme: unknown): colorScheme is 'blue' | 'green' | 'purple' | 'warm' | 'cool' | 'monochrome' => {
    return typeof colorScheme === 'string' && ['blue', 'green', 'purple', 'warm', 'cool', 'monochrome'].includes(colorScheme)
}

export const isValidVisualElements = (visualElements: unknown): visualElements is 'gradients' | 'shadows' | 'borders' | 'clean' => {
    return typeof visualElements === 'string' && ['gradients', 'shadows', 'borders', 'clean'].includes(visualElements)
}
