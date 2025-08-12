import { openai } from './openrouter'
import type {
    ManualPreferences,
    AnalyzedManualPreferences,
    StylePreferences,
    MergedPreferences
} from '@/types/manual-preferences'
import {
    isValidStyle,
    isValidQuality,
    isValidTheme,
    isValidLayout,
    isValidTypography,
    isValidColorScheme,
    isValidVisualElements
} from '@/types/manual-preferences'

/**
 * Analyze manual preferences using AI to extract styling and design preferences
 * @param preferences - User's manual input (title, description)
 * @returns Analyzed preferences with styling information
 */
export async function analyzeManualPreferences(
    preferences?: ManualPreferences
): Promise<AnalyzedManualPreferences> {
    // If no preferences provided, return defaults
    if (!preferences || (!preferences.title && !preferences.description)) {
        return getDefaultAnalyzedPreferences()
    }

    try {
        if (!openai) {
            console.warn('OpenRouter API not configured, using default preferences')
            return getDefaultAnalyzedPreferences()
        }

        console.log('Analyzing manual preferences with AI:', preferences)

        const prompt = `You are an expert design analyst. Analyze the following project details and extract styling preferences for a portfolio.

**Project Details:**
Title: ${preferences.title ?? 'Not provided'}
Description: ${preferences.description ?? 'Not provided'}

**Task:** Analyze the content and determine the most appropriate styling preferences for a portfolio card.

**Extract and return ONLY a JSON object with these fields:**
{
  "style": "modern|professional|creative|minimal",
  "quality": "high|medium|low", 
  "theme": "light|dark|colorful|neutral",
  "layout": "grid|card|hero|minimal",
  "typography": "serif|sans-serif|display|modern",
  "colorScheme": "blue|green|purple|warm|cool|monochrome",
  "visualElements": "gradients|shadows|borders|clean",
  "confidence": {
    "style": 0-100,
    "quality": 0-100,
    "theme": 0-100,
    "layout": 0-100,
    "typography": 0-100,
    "colorScheme": 0-100,
    "overall": 0-100
  }
}

**Analysis Guidelines:**
- Style: Choose based on content tone and purpose
- Quality: High for professional work, medium for casual, low for basic
- Theme: Light for clean/professional, dark for creative, colorful for vibrant
- Layout: Grid for multiple items, card for focused, hero for impactful
- Typography: Serif for traditional, sans-serif for modern, display for creative
- ColorScheme: Choose based on content mood and industry
- VisualElements: Gradients for modern, shadows for depth, borders for structure
- Confidence: Rate your confidence in each choice (0-100)

**Return ONLY the JSON object, no explanations.**`

        const response = await openai.chat.completions.create({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 800,
            temperature: 0.3
        })

        const content = response.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('No response from AI model')
        }

        // Try to extract JSON from the response
        const jsonRegex = /\{[\s\S]*\}/
        const jsonMatch = jsonRegex.exec(content)
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response')
        }

        const analyzedPreferences = JSON.parse(jsonMatch[0]) as AnalyzedManualPreferences

        // Validate and sanitize the response
        const validatedPreferences = validateAndSanitizePreferences(analyzedPreferences)

        console.log('AI analyzed preferences:', validatedPreferences)
        return validatedPreferences

    } catch (error) {
        console.error('Error analyzing manual preferences with AI:', error)
        console.log('Falling back to default preferences')
        return getDefaultAnalyzedPreferences()
    }
}

/**
 * Get default analyzed preferences when AI analysis fails or no preferences provided
 */
function getDefaultAnalyzedPreferences(): AnalyzedManualPreferences {
    return {
        style: 'modern',
        quality: 'high',
        theme: 'light',
        layout: 'card',
        typography: 'sans-serif',
        colorScheme: 'blue',
        visualElements: 'clean',
        confidence: {
            style: 80,
            quality: 80,
            theme: 80,
            layout: 80,
            typography: 80,
            colorScheme: 80,
            overall: 80
        }
    }
}

/**
 * Validate and sanitize AI response to ensure it matches expected format
 */
function validateAndSanitizePreferences(
    preferences: Partial<AnalyzedManualPreferences>
): AnalyzedManualPreferences {
    const defaults = getDefaultAnalyzedPreferences()

    // Validate style
    const style = isValidStyle(preferences.style) ? preferences.style : defaults.style

    // Validate quality
    const quality = isValidQuality(preferences.quality) ? preferences.quality : defaults.quality

    // Validate theme
    const theme = isValidTheme(preferences.theme) ? preferences.theme : defaults.theme

    // Validate layout
    const layout = isValidLayout(preferences.layout) ? preferences.layout : defaults.layout

    // Validate typography
    const typography = isValidTypography(preferences.typography) ? preferences.typography : defaults.typography

    // Validate colorScheme
    const colorScheme = isValidColorScheme(preferences.colorScheme) ? preferences.colorScheme : defaults.colorScheme

    // Validate visualElements
    const visualElements = isValidVisualElements(preferences.visualElements) ? preferences.visualElements : defaults.visualElements

    // Validate confidence scores (ensure they're numbers 0-100)
    const confidence = {
        style: Math.max(0, Math.min(100, preferences.confidence?.style ?? defaults.confidence.style)),
        quality: Math.max(0, Math.min(100, preferences.confidence?.quality ?? defaults.confidence.quality)),
        theme: Math.max(0, Math.min(100, preferences.confidence?.theme ?? defaults.confidence.theme)),
        layout: Math.max(0, Math.min(100, preferences.confidence?.layout ?? defaults.confidence.layout)),
        typography: Math.max(0, Math.min(100, preferences.confidence?.typography ?? defaults.confidence.typography)),
        colorScheme: Math.max(0, Math.min(100, preferences.confidence?.colorScheme ?? defaults.confidence.colorScheme)),
        overall: Math.max(0, Math.min(100, preferences.confidence?.overall ?? defaults.confidence.overall))
    }

    // Calculate overall confidence as average
    confidence.overall = Math.round(
        (confidence.style + confidence.quality + confidence.theme + confidence.layout + confidence.typography + confidence.colorScheme) / 6
    )

    return {
        style,
        quality,
        theme,
        layout,
        typography,
        colorScheme,
        visualElements,
        confidence
    }
}

/**
 * Merge manual preferences with existing style preferences
 * Manual preferences take priority when confidence is high
 */
export function mergeManualAndStylePreferences(
    manualPreferences: AnalyzedManualPreferences,
    stylePreferences?: StylePreferences
): MergedPreferences {
    const result: MergedPreferences = {
        style: 'modern',
        quality: 'high',
        includeMobile: false,
        includeTablet: false,
        theme: undefined,
        layout: undefined,
        typography: undefined,
        colorScheme: undefined,
        visualElements: undefined
    }

    // Use manual preferences if confidence is high (>70), otherwise fall back to style preferences
    if (manualPreferences.confidence.style > 70) {
        result.style = manualPreferences.style!
    } else if (stylePreferences?.style) {
        // Map style preferences to our format
        const styleMap: Record<string, 'modern' | 'professional' | 'creative' | 'minimal'> = {
            'portfolio-multi': 'modern',
            'portfolio-single': 'modern',
            'professional': 'professional',
            'creative': 'creative',
            'minimal': 'minimal'
        }
        const mappedStyle = styleMap[stylePreferences.style]
        if (mappedStyle) {
            result.style = mappedStyle
        }
    }

    if (manualPreferences.confidence.quality > 70) {
        result.quality = manualPreferences.quality!
    } else if (stylePreferences?.quality && isValidQuality(stylePreferences.quality)) {
        result.quality = stylePreferences.quality
    }

    // Device preferences from style preferences
    result.includeMobile = stylePreferences?.includeMobile ?? false
    result.includeTablet = stylePreferences?.includeTablet ?? false

    // Additional styling from manual preferences
    if (manualPreferences.confidence.theme > 70) {
        result.theme = manualPreferences.theme
    }

    if (manualPreferences.confidence.layout > 70) {
        result.layout = manualPreferences.layout
    }

    if (manualPreferences.confidence.typography > 70) {
        result.typography = manualPreferences.typography
    }

    if (manualPreferences.confidence.colorScheme > 70) {
        result.colorScheme = manualPreferences.colorScheme
    }

    if (manualPreferences.confidence.overall > 70) {
        result.visualElements = manualPreferences.visualElements
    }

    return result
}
