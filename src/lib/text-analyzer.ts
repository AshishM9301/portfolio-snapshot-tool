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
    // AI-specific confidence metrics
    aiStyle?: number
    aiTitle?: number
    aiDescription?: number
    aiOverall?: number
    urlImageConsistency?: number
    contentQuality?: number
  }
}

// New interfaces for AI analysis results
export interface AIAnalysisResult {
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
    aiStyle: number
    aiTitle: number
    aiDescription: number
    aiOverall: number
    urlImageConsistency: number
    contentQuality: number
  }
}

export interface URLAnalysisResult {
  suggestedStyle: string
  suggestedTitle: string
  suggestedDescription: string
  suggestedAspectRatio: string
  includeMobile: boolean
  includeTablet: boolean
  confidence: {
    style: number
    title: number
    description: number
    aspectRatio: number
  }
  urlAnalysis: Array<{
    url: string
    type: string
    category: string
    purpose: string
  }>
}

export interface ImageAnalysisResult {
  websiteType: string
  contentAnalysis: string
  designStyle: string
  technologyIndicators: string[]
  targetAudience: string
  keyFeatures: string[]
  suggestedTitle: string
  suggestedDescription: string
  suggestedStyle: string
  suggestedAspectRatio: string
  confidence: {
    title: number
    description: number
    style: number
    aspectRatio: number
  }
}

export interface DescriptionGenerationResult {
  description: string
  confidence: number
  length: 'concise' | 'detailed'
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
  customTitle?: string
  customDescription?: string
}

/**
 * LEGACY: Original analyzeTextInput function (backup)
 * @deprecated Use the enhanced version below
 */
// export function analyzeTextInputLegacy(text: string): TextAnalysisResult {
//   const result: TextAnalysisResult = {
//     urls: [],
//     confidence: {
//       style: 0,
//       aspectRatio: 0,
//       quality: 0,
//       title: 0,
//       description: 0
//     }
//   }

//   const lowerText = text.toLowerCase()
//   const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

//   // Extract URLs
//   result.urls = extractUrlsFromText(text)

//   // Extract styling preferences
//   const styling = extractStylingPreferences(lowerText)
//   Object.assign(result, styling)

//   // Extract custom content
//   const content = extractCustomContent(lines)
//   Object.assign(result, content)

//   // Calculate confidence scores
//   result.confidence = calculateConfidenceScores(lowerText, lines, result)

//   return result
// }

/**
 * Analyze text input to extract URLs and styling preferences
 * Enhanced version with better title/description detection
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

  // Extract custom content with enhanced pattern detection
  const content = extractCustomContentEnhanced(text, lines)
  Object.assign(result, content)

  // Calculate confidence scores
  result.confidence = calculateConfidenceScores(lowerText, lines, result)

  return result
}

/**
 * Enhanced text analysis with AI capabilities
 * Maintains backward compatibility while adding AI intelligence
 */
export async function analyzeTextInputEnhanced(
  text: string,
  images: File[] = []
): Promise<TextAnalysisResult> {

  // Step 1: Try AI analysis first
  try {
    const aiResult = await enhanceWithAI(text, images)

    // Step 2: If AI analysis was successful and has good confidence, use it
    if (aiResult.confidence.aiOverall > 50 ||
      (aiResult.customTitle && aiResult.customDescription) ||
      images.length > 0) {
      return aiResult
    }
  } catch (error) {
    console.warn('AI analysis failed, falling back to pattern analysis:', error)
  }

  // Step 3: Fallback to pattern-based analysis
  const patternResult = analyzeTextInput(text)
  return patternResult
}

/**
 * Enhanced AI analysis that handles text, URLs, and images
 */
async function enhanceWithAI(
  text: string,
  images: File[],
  patternResult?: TextAnalysisResult
): Promise<AIAnalysisResult> {

  // Extract URLs from text if not provided
  const urls = patternResult?.urls ?? extractUrlsFromText(text)

  const aiResult: AIAnalysisResult = {
    urls,
    confidence: {
      style: 0,
      aspectRatio: 0,
      quality: 0,
      title: 0,
      description: 0,
      aiStyle: 0,
      aiTitle: 0,
      aiDescription: 0,
      aiOverall: 0,
      urlImageConsistency: 0,
      contentQuality: 0
    }
  }

  // Priority 1: Text analysis with AI
  if (text.trim()) {
    try {
      const textAnalysis = await analyzeTextWithAI(text)
      Object.assign(aiResult, textAnalysis)
    } catch (error) {
      console.warn('AI text analysis failed:', error)
    }
  }

  // Priority 2: URL analysis with AI (if we have URLs and need enhancement)
  if (urls.length > 0 && (!aiResult.customTitle || !aiResult.customDescription)) {
    try {
      const urlAnalysis = await analyzeURLsWithAI(urls)

      // Use URL analysis to fill gaps
      if (!aiResult.customTitle && urlAnalysis.suggestedTitle) {
        aiResult.customTitle = urlAnalysis.suggestedTitle
        aiResult.confidence.aiTitle = urlAnalysis.confidence.title
      }

      if (!aiResult.customDescription && urlAnalysis.suggestedDescription) {
        aiResult.customDescription = urlAnalysis.suggestedDescription
        aiResult.confidence.aiDescription = urlAnalysis.confidence.description
      }

      if (!aiResult.style && urlAnalysis.suggestedStyle) {
        aiResult.style = urlAnalysis.suggestedStyle as 'portfolio-multi' | 'portfolio-single' | 'professional' | 'creative'
        aiResult.confidence.aiStyle = urlAnalysis.confidence.style
      }

      if (!aiResult.aspectRatio && urlAnalysis.suggestedAspectRatio) {
        aiResult.aspectRatio = urlAnalysis.suggestedAspectRatio as '16:9' | '4:3' | '1:1' | '3:2'
        aiResult.confidence.aspectRatio = urlAnalysis.confidence.aspectRatio
      }

      aiResult.includeMobile = urlAnalysis.includeMobile
      aiResult.includeTablet = urlAnalysis.includeTablet
    } catch (error) {
      console.warn('AI URL analysis failed:', error)
    }
  }

  // Priority 3: Image analysis with AI (if we have images)
  if (images.length > 0) {
    try {
      const imageAnalysis = await analyzeImagesWithAI(images)

      // Use image analysis to fill gaps
      if (!aiResult.customTitle && imageAnalysis.suggestedTitle) {
        aiResult.customTitle = imageAnalysis.suggestedTitle
        aiResult.confidence.aiTitle = imageAnalysis.confidence.title
      }

      if (!aiResult.customDescription && imageAnalysis.suggestedDescription) {
        aiResult.customDescription = imageAnalysis.suggestedDescription
        aiResult.confidence.aiDescription = imageAnalysis.confidence.description
      }

      if (!aiResult.style && imageAnalysis.suggestedStyle) {
        aiResult.style = imageAnalysis.suggestedStyle as 'portfolio-multi' | 'portfolio-single' | 'professional' | 'creative'
        aiResult.confidence.aiStyle = imageAnalysis.confidence.style
      }

      if (!aiResult.aspectRatio && imageAnalysis.suggestedAspectRatio) {
        aiResult.aspectRatio = imageAnalysis.suggestedAspectRatio as '16:9' | '4:3' | '1:1' | '3:2'
        aiResult.confidence.aspectRatio = imageAnalysis.confidence.aspectRatio
      }
    } catch (error) {
      console.warn('AI image analysis failed:', error)
    }
  }

  // Priority 4: Generate description if still missing
  if (!aiResult.customDescription && aiResult.customTitle) {
    try {
      const descResult = await generateDescriptionWithAI(
        aiResult.customTitle,
        urls,
        text,
        aiResult.style ?? 'professional'
      )

      aiResult.customDescription = descResult.description
      aiResult.confidence.aiDescription = descResult.confidence
    } catch (error) {
      console.warn('AI description generation failed:', error)
    }
  }

  // Calculate final confidence scores
  aiResult.confidence.aiOverall = calculateAIOverallConfidence(aiResult.confidence)
  aiResult.confidence.contentQuality = calculateContentQuality(aiResult)

  // Calculate URL-image consistency if we have both
  if (urls.length > 0 && images.length > 0) {
    aiResult.confidence.urlImageConsistency = 85 // Placeholder - would be calculated based on content similarity
  }

  return aiResult
}

/**
 * Extract styling preferences from text
 */
function extractStylingPreferences(text: string): StylingPreferences {
  const preferences: StylingPreferences = {}

  // Extract style preferences (check modern first, then others)
  if (text.includes('modern') || text.includes('contemporary')) {
    preferences.style = 'creative'
  } else if (text.includes('portfolio') || text.includes('showcase')) {
    if (text.includes('multi') || text.includes('multiple') || text.includes('various') || text.includes('several')) {
      preferences.style = 'portfolio-multi'
    } else {
      preferences.style = 'portfolio-single'
    }
  } else if (text.includes('professional') || text.includes('business') || text.includes('corporate') || text.includes('formal')) {
    preferences.style = 'professional'
  } else if (text.includes('creative') || text.includes('artistic') || text.includes('design')) {
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
    const titleMatch = /^(title|name|project):\s*(.+)$/i.exec(line)
    if (titleMatch && !content.customTitle) {
      content.customTitle = titleMatch[2]?.trim() ?? ''
    }

    const descMatch = /^(description|desc|about|summary):\s*(.+)$/i.exec(line)
    if (descMatch && !content.customDescription) {
      content.customDescription = descMatch[2]?.trim() ?? ''
    }
  }

  // If no explicit title/description found, try to extract from context
  if (!content.customTitle && lines.length > 0) {
    // Use first line as title if it doesn't contain a URL and looks like a title
    const firstLine = lines[0] ?? ''
    if (!firstLine.includes('http') && !firstLine.includes('www') && firstLine.length < 100) {
      content.customTitle = firstLine
    }
  }

  if (!content.customDescription && lines.length > 1) {
    // Use second line as description if it doesn't contain a URL
    const secondLine = lines[1] ?? ''
    if (!secondLine.includes('http') && !secondLine.includes('www') && secondLine.length < 200) {
      content.customDescription = secondLine
    }
  }

  return content
}

/**
 * Enhanced custom content extraction with better pattern detection
 * Detects various natural language patterns for titles and descriptions
 */
function extractCustomContentEnhanced(text: string, lines: string[]): CustomContent {
  const content: CustomContent = {}

  // Multiple pattern detection for titles
  const titlePatterns = [
    /Title'([^']+)'/gi,                    // Title'...'
    /Title:\s*([^\n]+)/gi,                 // Title: ...
    /Title\s*-\s*([^\n]+)/gi,              // Title - ...
    /with\s+Title\s*-\s*([^\n]+)/gi,       // with Title - ...
    /titled\s+([^\n]+)/gi,                 // titled ...
    /called\s+([^\n]+)/gi,                 // called ...
    /named\s+([^\n]+)/gi,                  // named ...
    /Name:\s*([^\n]+)/gi,                  // Name: ...
    /Project:\s*([^\n]+)/gi,               // Project: ...
    /Website:\s*([^\n]+)/gi                // Website: ...
  ]

  // Multiple pattern detection for descriptions
  const descPatterns = [
    /Description'([^']+)'/gi,              // Description'...'
    /Description:\s*([^\n]+)/gi,           // Description: ...
    /Description\s*-\s*([^\n]+)/gi,        // Description - ...
    /Desc:\s*([^\n]+)/gi,                  // Desc: ...
    /About:\s*([^\n]+)/gi,                 // About: ...
    /Summary:\s*([^\n]+)/gi                // Summary: ...
  ]

  // Extract title using multiple patterns
  for (const pattern of titlePatterns) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0 && matches[0]?.[1]) {
      content.customTitle = matches[0][1].trim()
      break
    }
  }

  // Extract description using multiple patterns
  for (const pattern of descPatterns) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0 && matches[0]?.[1]) {
      content.customDescription = matches[0][1].trim()
      break
    }
  }

  // If enhanced patterns didn't find anything, fall back to original method
  if (!content.customTitle || !content.customDescription) {
    const fallbackContent = extractCustomContent(lines)
    if (!content.customTitle && fallbackContent.customTitle) {
      content.customTitle = fallbackContent.customTitle
    }
    if (!content.customDescription && fallbackContent.customDescription) {
      content.customDescription = fallbackContent.customDescription
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
      'creative': ['creative', 'artistic', 'design', 'modern', 'contemporary']
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

  // Title confidence - higher for pattern-matched titles
  if (result.customTitle) {
    const titleText = result.customTitle.toLowerCase()
    // Check if title was extracted using patterns (higher confidence)
    const hasPatternMatch = text.includes('title') || text.includes('name') || text.includes('project') || text.includes('website')
    confidence.title = hasPatternMatch ? 85 : 70
  }

  // Description confidence - higher for pattern-matched descriptions
  if (result.customDescription) {
    const descText = result.customDescription.toLowerCase()
    // Check if description was extracted using patterns (higher confidence)
    const hasPatternMatch = text.includes('description') || text.includes('desc') || text.includes('about') || text.includes('summary')
    confidence.description = hasPatternMatch ? 80 : 65
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
export function validateTextAnalysis(result: TextAnalysisResult, hasImages = false): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const cleanedResult = { ...result }

  // Check if URLs are present (only required if no images)
  if (result.urls.length === 0 && !hasImages) {
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
    customTitle: analysis.customTitle ?? undefined,
    customDescription: analysis.customDescription ?? undefined,
    includeMobile: analysis.includeMobile ?? defaults.includeMobile,
    includeTablet: analysis.includeTablet ?? defaults.includeTablet
  }
}

// ===== AI ANALYSIS FUNCTIONS =====

import { openai } from './openrouter'
import {
  TEXT_ANALYSIS_PROMPT,
  URL_ANALYSIS_PROMPT,
  IMAGE_ANALYSIS_PROMPT,
  DESCRIPTION_GENERATION_PROMPT
} from './prompt-templates'

/**
 * Analyze text input using AI to extract styling preferences and content
 */
export async function analyzeTextWithAI(text: string): Promise<AIAnalysisResult> {
  try {
    if (!openai) {
      throw new Error('OpenRouter API key is not configured')
    }

    const prompt = TEXT_ANALYSIS_PROMPT.replace('{text}', text)

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI model')
    }

    // Parse JSON response
    const aiResult = JSON.parse(content) as AIAnalysisResult

    // Ensure confidence scores are present
    aiResult.confidence = {
      style: aiResult.confidence?.style ?? 0,
      aspectRatio: aiResult.confidence?.aspectRatio ?? 0,
      quality: aiResult.confidence?.quality ?? 0,
      title: aiResult.confidence?.title ?? 0,
      description: aiResult.confidence?.description ?? 0,
      aiStyle: aiResult.confidence?.aiStyle ?? aiResult.confidence?.style ?? 0,
      aiTitle: aiResult.confidence?.aiTitle ?? aiResult.confidence?.title ?? 0,
      aiDescription: aiResult.confidence?.aiDescription ?? aiResult.confidence?.description ?? 0,
      aiOverall: calculateAIOverallConfidence(aiResult.confidence),
      urlImageConsistency: 0, // Will be calculated when merging
      contentQuality: calculateContentQuality(aiResult)
    }

    return aiResult
  } catch (error) {
    console.error('Error in AI text analysis:', error)
    throw new Error('Failed to analyze text with AI')
  }
}

/**
 * Analyze URLs using AI to extract website information and suggest defaults
 */
export async function analyzeURLsWithAI(urls: string[]): Promise<URLAnalysisResult> {
  try {
    if (!openai) {
      throw new Error('OpenRouter API key is not configured')
    }

    const prompt = URL_ANALYSIS_PROMPT.replace('{urls}', urls.join('\n'))

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI model')
    }

    const urlResult = JSON.parse(content) as URLAnalysisResult
    return urlResult
  } catch (error) {
    console.error('Error in AI URL analysis:', error)
    throw new Error('Failed to analyze URLs with AI')
  }
}

/**
 * Analyze images using AI to extract content and suggest defaults
 */
export async function analyzeImagesWithAI(images: File[]): Promise<ImageAnalysisResult> {
  try {
    if (!openai) {
      throw new Error('OpenRouter API key is not configured')
    }

    // For now, we'll create a text description of the images
    // In a full implementation, you'd use vision models to analyze the actual images
    const imageDescription = `Analyzing ${images.length} website screenshot(s) for portfolio creation`

    const prompt = IMAGE_ANALYSIS_PROMPT.replace('{imageDescription}', imageDescription)

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI model')
    }

    const imageResult = JSON.parse(content) as ImageAnalysisResult
    return imageResult
  } catch (error) {
    console.error('Error in AI image analysis:', error)
    throw new Error('Failed to analyze images with AI')
  }
}

/**
 * Generate description using AI based on title, URLs, and context
 */
export async function generateDescriptionWithAI(
  title: string,
  urls: string[],
  context: string,
  style: string
): Promise<DescriptionGenerationResult> {
  try {
    if (!openai) {
      throw new Error('OpenRouter API key is not configured')
    }

    const prompt = DESCRIPTION_GENERATION_PROMPT
      .replace('{title}', title)
      .replace('{urls}', urls.join(', '))
      .replace('{context}', context)
      .replace('{style}', style)

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI model')
    }

    const descResult = JSON.parse(content) as DescriptionGenerationResult
    return descResult
  } catch (error) {
    console.error('Error in AI description generation:', error)
    throw new Error('Failed to generate description with AI')
  }
}

/**
 * Calculate overall AI confidence score
 */
function calculateAIOverallConfidence(confidence: {
  aiStyle?: number
  style?: number
  aiTitle?: number
  title?: number
  aiDescription?: number
  description?: number
  aspectRatio?: number
  quality?: number
}): number {
  const scores = [
    confidence.aiStyle ?? confidence.style ?? 0,
    confidence.aiTitle ?? confidence.title ?? 0,
    confidence.aiDescription ?? confidence.description ?? 0,
    confidence.aspectRatio ?? 0,
    confidence.quality ?? 0
  ]

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

/**
 * Calculate content quality score
 */
function calculateContentQuality(result: AIAnalysisResult): number {
  let quality = 0

  // Title quality
  if (result.customTitle && result.customTitle.length > 0) {
    quality += 20
    if (result.customTitle.length > 10) quality += 10
  }

  // Description quality
  if (result.customDescription && result.customDescription.length > 0) {
    quality += 20
    if (result.customDescription.length > 50) quality += 10
  }

  // Style confidence
  if (result.confidence?.aiStyle && result.confidence.aiStyle > 70) {
    quality += 20
  }

  // URL count (more URLs = higher quality)
  if (result.urls && result.urls.length > 0) {
    quality += Math.min(20, result.urls.length * 5)
  }

  return Math.min(100, quality)
}

/**
 * Check if AI enhancement is needed
 */
export function needsAIEnhancement(result: TextAnalysisResult): boolean {
  return (
    !result.customTitle ||
    !result.customDescription ||
    result.confidence.style < 30 ||
    result.confidence.aspectRatio < 30 ||
    result.confidence.quality < 30
  )
}

/**
 * Merge pattern-based results with AI results
 */
export function mergeResults(
  patternResult: TextAnalysisResult,
  aiResult: AIAnalysisResult
): TextAnalysisResult {
  return {
    ...patternResult,
    // Use AI results if confidence is higher
    style: aiResult.confidence.aiStyle > patternResult.confidence.style ? aiResult.style : patternResult.style,
    aspectRatio: aiResult.confidence.aspectRatio > patternResult.confidence.aspectRatio ? aiResult.aspectRatio : patternResult.aspectRatio,
    quality: aiResult.confidence.quality > patternResult.confidence.quality ? aiResult.quality : patternResult.quality,
    customTitle: aiResult.customTitle ?? patternResult.customTitle,
    customDescription: aiResult.customDescription ?? patternResult.customDescription,
    includeMobile: aiResult.includeMobile ?? patternResult.includeMobile,
    includeTablet: aiResult.includeTablet ?? patternResult.includeTablet,
    confidence: {
      ...patternResult.confidence,
      aiStyle: aiResult.confidence.aiStyle,
      aiTitle: aiResult.confidence.aiTitle,
      aiDescription: aiResult.confidence.aiDescription,
      aiOverall: aiResult.confidence.aiOverall,
      urlImageConsistency: aiResult.confidence.urlImageConsistency,
      contentQuality: aiResult.confidence.contentQuality
    }
  }
} 