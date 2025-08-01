import { extractUrlsFromText } from './utils'

export interface TextAnalysisResult {
  urls: string[]
  style?: 'portfolio-multi' | 'portfolio-single' | 'professional' | 'creative'
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2'
  customTitle?: string
  customDescription?: string
  quality?: 'high' | 'medium' | 'low'
  includeMobile?: boolean
  includeTablet?: boolean
  confidence: {
    style: number
    aspectRatio: number
    quality: number
    title: number
    description: number
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  cleanedResult: TextAnalysisResult
}

export interface StylingPreferences {
  style?: 'portfolio-multi' | 'portfolio-single' | 'professional' | 'creative'
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2'
  quality?: 'high' | 'medium' | 'low'
  includeMobile?: boolean
  includeTablet?: boolean
}

export interface CustomContent {
  title?: string
  description?: string
}

/**
 * Analyze text input to extract URLs and styling preferences
 */
export function analyzeTextInput(text: string): TextAnalysisResult {
  const result: TextAnalysisResult = {
    urls: [],
    confidence: {
      style: 0,
      aspectRatio: 0,
      quality: 0,
      title: 0,
      description: 0
    }
  }

  const lowerText = text.toLowerCase()
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  // Extract URLs
  result.urls = extractUrlsFromText(text)

  // Extract styling preferences
  const styling = extractStylingPreferences(lowerText)
  Object.assign(result, styling)

  // Extract custom content
  const content = extractCustomContent(lines)
  Object.assign(result, content)

  // Calculate confidence scores
  result.confidence = calculateConfidenceScores(lowerText, lines, result)

  return result
}

/**
 * Extract styling preferences from text
 */
function extractStylingPreferences(text: string): StylingPreferences {
  const preferences: StylingPreferences = {}

  // Extract style preferences
  if (text.includes('portfolio') || text.includes('showcase')) {
    if (text.includes('multi') || text.includes('multiple') || text.includes('various') || text.includes('several')) {
      preferences.style = 'portfolio-multi'
    } else {
      preferences.style = 'portfolio-single'
    }
  } else if (text.includes('professional') || text.includes('business') || text.includes('corporate') || text.includes('formal')) {
    preferences.style = 'professional'
  } else if (text.includes('creative') || text.includes('artistic') || text.includes('design') || text.includes('modern')) {
    preferences.style = 'creative'
  }

  // Extract aspect ratio preferences
  if (text.includes('16:9') || text.includes('widescreen') || text.includes('landscape') || text.includes('wide')) {
    preferences.aspectRatio = '16:9'
  } else if (text.includes('4:3') || text.includes('standard') || text.includes('traditional')) {
    preferences.aspectRatio = '4:3'
  } else if (text.includes('1:1') || text.includes('square') || text.includes('instagram')) {
    preferences.aspectRatio = '1:1'
  } else if (text.includes('3:2') || text.includes('photo') || text.includes('camera')) {
    preferences.aspectRatio = '3:2'
  }

  // Extract quality preferences
  if (text.includes('high quality') || text.includes('hd') || text.includes('high resolution') || text.includes('premium')) {
    preferences.quality = 'high'
  } else if (text.includes('medium quality') || text.includes('standard quality') || text.includes('normal')) {
    preferences.quality = 'medium'
  } else if (text.includes('low quality') || text.includes('fast') || text.includes('quick') || text.includes('basic')) {
    preferences.quality = 'low'
  }

  // Extract device preferences
  if (text.includes('mobile') || text.includes('phone') || text.includes('responsive') || text.includes('smartphone')) {
    preferences.includeMobile = true
  }
  if (text.includes('tablet') || text.includes('ipad') || text.includes('touchscreen')) {
    preferences.includeTablet = true
  }

  return preferences
}

/**
 * Extract custom title and description from text
 */
function extractCustomContent(lines: string[]): CustomContent {
  const content: CustomContent = {}

  // Look for explicit patterns like "Title: ..." or "Description: ..."
  for (const line of lines) {
    const titleMatch = line.match(/^(title|name|project):\s*(.+)$/i)
    if (titleMatch && !content.title) {
      content.title = titleMatch[2].trim()
    }

    const descMatch = line.match(/^(description|desc|about|summary):\s*(.+)$/i)
    if (descMatch && !content.description) {
      content.description = descMatch[2].trim()
    }
  }

  // If no explicit title/description found, try to extract from context
  if (!content.title && lines.length > 0) {
    // Use first line as title if it doesn't contain a URL and looks like a title
    const firstLine = lines[0]
    if (!firstLine.includes('http') && !firstLine.includes('www') && firstLine.length < 100) {
      content.title = firstLine
    }
  }

  if (!content.description && lines.length > 1) {
    // Use second line as description if it doesn't contain a URL
    const secondLine = lines[1]
    if (!secondLine.includes('http') && !secondLine.includes('www') && secondLine.length < 200) {
      content.description = secondLine
    }
  }

  return content
}

/**
 * Calculate confidence scores for extracted preferences
 */
function calculateConfidenceScores(text: string, lines: string[], result: TextAnalysisResult) {
  const confidence = {
    style: 0,
    aspectRatio: 0,
    quality: 0,
    title: 0,
    description: 0
  }

  // Style confidence
  if (result.style) {
    const styleKeywords = {
      'portfolio-multi': ['portfolio', 'multi', 'multiple', 'various', 'several'],
      'portfolio-single': ['portfolio', 'single', 'one'],
      'professional': ['professional', 'business', 'corporate', 'formal'],
      'creative': ['creative', 'artistic', 'design', 'modern']
    }
    const keywords = styleKeywords[result.style] || []
    const matches = keywords.filter(keyword => text.includes(keyword)).length
    confidence.style = Math.min(100, (matches / keywords.length) * 100)
  }

  // Aspect ratio confidence
  if (result.aspectRatio) {
    const ratioKeywords = {
      '16:9': ['16:9', 'widescreen', 'landscape', 'wide'],
      '4:3': ['4:3', 'standard', 'traditional'],
      '1:1': ['1:1', 'square', 'instagram'],
      '3:2': ['3:2', 'photo', 'camera']
    }
    const keywords = ratioKeywords[result.aspectRatio] || []
    const matches = keywords.filter(keyword => text.includes(keyword)).length
    confidence.aspectRatio = Math.min(100, (matches / keywords.length) * 100)
  }

  // Quality confidence
  if (result.quality) {
    const qualityKeywords = {
      'high': ['high', 'hd', 'premium', 'best'],
      'medium': ['medium', 'standard', 'normal'],
      'low': ['low', 'fast', 'quick', 'basic']
    }
    const keywords = qualityKeywords[result.quality] || []
    const matches = keywords.filter(keyword => text.includes(keyword)).length
    confidence.quality = Math.min(100, (matches / keywords.length) * 100)
  }

  // Title confidence
  if (result.customTitle) {
    confidence.title = result.customTitle.length > 0 ? 80 : 0
  }

  // Description confidence
  if (result.customDescription) {
    confidence.description = result.customDescription.length > 0 ? 70 : 0
  }

  return confidence
}

/**
 * Get smart defaults based on context
 */
export function getDefaultPreferences(urls: string[]): TextAnalysisResult {
  const isMultipleUrls = urls.length > 1
  
  return {
    urls,
    style: isMultipleUrls ? 'portfolio-multi' : 'professional',
    aspectRatio: '16:9',
    quality: 'high',
    includeMobile: false,
    includeTablet: false,
    confidence: {
      style: 30, // Low confidence for defaults
      aspectRatio: 20,
      quality: 25,
      title: 0,
      description: 0
    }
  }
}

/**
 * Validate and clean the analysis result
 */
export function validateTextAnalysis(result: TextAnalysisResult): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const cleanedResult = { ...result }

  // Check if URLs are present
  if (result.urls.length === 0) {
    errors.push('No URLs found in the text')
  }

  // Validate URLs format
  const invalidUrls = result.urls.filter(url => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return false
    } catch {
      return true
    }
  })

  if (invalidUrls.length > 0) {
    errors.push(`Invalid URLs found: ${invalidUrls.join(', ')}`)
    cleanedResult.urls = result.urls.filter(url => !invalidUrls.includes(url))
  }

  // Clean up title and description
  if (cleanedResult.customTitle && cleanedResult.customTitle.length > 100) {
    cleanedResult.customTitle = cleanedResult.customTitle.substring(0, 100) + '...'
    warnings.push('Title was truncated to 100 characters')
  }

  if (cleanedResult.customDescription && cleanedResult.customDescription.length > 500) {
    cleanedResult.customDescription = cleanedResult.customDescription.substring(0, 500) + '...'
    warnings.push('Description was truncated to 500 characters')
  }

  // Add warnings for low confidence preferences
  if (result.confidence.style < 50 && result.style) {
    warnings.push(`Low confidence in detected style: ${result.style}`)
  }

  if (result.confidence.aspectRatio < 50 && result.aspectRatio) {
    warnings.push(`Low confidence in detected aspect ratio: ${result.aspectRatio}`)
  }

  return {
    isValid: errors.length === 0 && cleanedResult.urls.length > 0,
    errors,
    warnings,
    cleanedResult
  }
}

/**
 * Merge user input with defaults
 */
export function mergeWithDefaults(analysis: TextAnalysisResult): TextAnalysisResult {
  const defaults = getDefaultPreferences(analysis.urls)
  
  return {
    ...defaults,
    ...analysis,
    // Only use analysis values if confidence is high enough
    style: analysis.confidence.style > 50 ? analysis.style : defaults.style,
    aspectRatio: analysis.confidence.aspectRatio > 50 ? analysis.aspectRatio : defaults.aspectRatio,
    quality: analysis.confidence.quality > 50 ? analysis.quality : defaults.quality,
    customTitle: analysis.customTitle || undefined,
    customDescription: analysis.customDescription || undefined,
    includeMobile: analysis.includeMobile ?? defaults.includeMobile,
    includeTablet: analysis.includeTablet ?? defaults.includeTablet
  }
} 