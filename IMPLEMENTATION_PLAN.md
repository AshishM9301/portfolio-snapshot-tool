# AI-Driven Portfolio Snapshot System - Implementation Plan

## Overview
Transform the existing template-based system into an AI-driven dynamic HTML generation system that creates custom portfolio cards based on website analysis and Puppeteer screenshots.

## Current Codebase Analysis

### Existing Infrastructure
- ✅ **Puppeteer Integration**: `src/lib/screenshot.ts` - Basic screenshot capture
- ✅ **Website Analysis**: `src/lib/website-analyzer.ts` - Data scraping and analysis
- ✅ **OpenRouter API**: `src/lib/openrouter.ts` - AI integration setup
- ✅ **tRPC Router**: `src/server/api/routers/snapshot.ts` - API endpoints
- ✅ **Type System**: `src/types/` - Well-defined interfaces
- ✅ **Template System**: `src/lib/templates/` - Current static templates

### Current Limitations
- Static template-based design
- Limited customization
- No AI-driven HTML generation
- Single screenshot approach
- Fixed design patterns

## Implementation Plan

### Phase 1: Enhanced Screenshot System
**Files to Create/Modify:**
- `src/lib/multi-device-screenshot.ts` (NEW)
- `src/lib/screenshot.ts` (ENHANCE)

**Implementation:**
```typescript
// Enhanced screenshot capture with multiple viewports
export async function captureMultiDeviceScreenshots(url: string) {
  return {
    desktop: await captureScreenshot(url, { width: 1200, height: 675 }),
    mobile: await captureScreenshot(url, { width: 375, height: 667 }),
    tablet: await captureScreenshot(url, { width: 768, height: 1024 })
  }
}
```

### Phase 2: AI HTML Generator
**Files to Create:**
- `src/lib/ai-html-generator.ts` (NEW)
- `src/lib/prompt-templates.ts` (NEW)
- `src/lib/html-validator.ts` (NEW)

**Implementation:**
```typescript
// AI-powered HTML generation
export async function generateAIPortfolioHTML(
  websiteData: WebsiteAnalysis,
  screenshots: MultiDeviceScreenshots
): Promise<string> {
  const prompt = buildAIPrompt(websiteData, screenshots)
  const htmlResponse = await callOpenRouterAPI(prompt)
  return validateAndOptimizeHTML(htmlResponse)
}
```

### Phase 3: Enhanced Data Processing
**Files to Modify:**
- `src/lib/website-analyzer.ts` (ENHANCE)
- `src/types/website.ts` (ENHANCE)

**Implementation:**
```typescript
// Enhanced website analysis with more comprehensive data
export interface EnhancedWebsiteAnalysis extends WebsiteAnalysis {
  visualElements: {
    colorScheme: string[]
    typography: string
    layoutStyle: string
    visualHierarchy: string
  }
  responsiveFeatures: {
    mobileOptimized: boolean
    tabletOptimized: boolean
    accessibilityScore: number
  }
}
```

### Phase 4: New API Endpoints
**Files to Modify:**
- `src/server/api/routers/snapshot.ts` (ENHANCE)

**New Endpoints:**
```typescript
// AI-driven snapshot generation
generateAISnapshot: publicProcedure
  .input(z.object({
    url: z.string().url(),
    includeMobile: z.boolean().optional(),
    includeTablet: z.boolean().optional()
  }))
  .mutation(async ({ input }) => {
    // 1. Capture multi-device screenshots
    // 2. Analyze website data
    // 3. Generate AI HTML
    // 4. Convert to PNG
    // 5. Return result
  })
```

### Phase 5: Enhanced Type System
**Files to Modify:**
- `src/types/snapshot.ts` (ENHANCE)
- `src/types/website.ts` (ENHANCE)

**New Types:**
```typescript
export interface AIGeneratedSnapshot {
  id: string
  htmlContent: string
  pngUrl: string
  screenshots: {
    desktop: string
    mobile?: string
    tablet?: string
  }
  websiteAnalysis: EnhancedWebsiteAnalysis
  generatedAt: Date
}
```

## Detailed Implementation Steps

### Step 1: Multi-Device Screenshot System
**File: `src/lib/multi-device-screenshot.ts`**
```typescript
export interface MultiDeviceScreenshots {
  desktop: string // base64
  mobile?: string // base64
  tablet?: string // base64
}

export async function captureMultiDeviceScreenshots(
  url: string,
  options: {
    includeMobile?: boolean
    includeTablet?: boolean
  } = {}
): Promise<MultiDeviceScreenshots> {
  const { includeMobile = false, includeTablet = false } = options
  
  const screenshots: MultiDeviceScreenshots = {
    desktop: await captureScreenshot(url, { width: 1200, height: 675 })
  }
  
  if (includeMobile) {
    screenshots.mobile = await captureScreenshot(url, { width: 375, height: 667 })
  }
  
  if (includeTablet) {
    screenshots.tablet = await captureScreenshot(url, { width: 768, height: 1024 })
  }
  
  return screenshots
}
```

### Step 2: AI Prompt Templates
**File: `src/lib/prompt-templates.ts`**
```typescript
export function buildAIPortfolioPrompt(
  websiteData: EnhancedWebsiteAnalysis,
  screenshots: MultiDeviceScreenshots
): string {
  return `
You are an expert web designer and developer. Create a beautiful, modern portfolio card HTML for a website with the following specifications:

**Website Data:**
- Title: ${websiteData.websiteData.title}
- URL: ${websiteData.websiteData.url}
- Category: ${websiteData.analysis.category}
- Purpose: ${websiteData.analysis.purpose}
- Description: ${websiteData.websiteData.description}
- Target Audience: ${websiteData.analysis.targetAudience}
- Technology Stack: ${websiteData.analysis.technologyIndicators.join(', ')}
- Design Style: ${websiteData.analysis.designStyle}
- Key Features: ${websiteData.analysis.keyFeatures.join(', ')}
- Value Proposition: ${websiteData.analysis.valueProposition}

**CRITICAL - Website Screenshots:**
- Desktop Screenshot: ${screenshots.desktop}
- Mobile Screenshot: ${screenshots.mobile || 'Not available'}
- Tablet Screenshot: ${screenshots.tablet || 'Not available'}

**Requirements - Screenshot-First Design:**
1. Create a 1200x675px portfolio card where the screenshot is the STAR
2. The Puppeteer-generated screenshot MUST be the HERO element that POPS
3. Design should make the screenshot look AMAZING - everything else supports it
4. Use the screenshot's colors and style to create a complementary design that enhances it
5. Incorporate the screenshot as the centerpiece with information flowing around it
6. Use modern CSS with dramatic shadows, glowing effects, and smooth animations to make the screenshot POP
7. Ensure all website data is strategically positioned to frame and enhance the screenshot
8. Make the screenshot the most visually striking element on the card
9. Use color schemes and backgrounds that make the screenshot colors more vibrant
10. Add effects that draw the eye directly to the screenshot
11. The screenshot should be the first thing people notice - make it impossible to ignore
12. **CRITICAL**: The entire design must fit within 675px height - NO scrolling, NO overflow
13. **CRITICAL**: All content must be visible within the fixed 1200x675px dimensions
14. Use compact, efficient layouts that maximize space utilization
15. Prioritize the most important information to fit within height constraints

**Screenshot Integration Guidelines - Make It POP:**
- Display the desktop screenshot prominently (minimum 50% of card width) as the HERO element
- Use proper aspect ratio and object-fit to maintain screenshot quality within height constraints
- Add dramatic shadows, glowing effects, or 3D transforms to make the screenshots POP
- Use contrasting backgrounds, gradients, or patterns that complement the screenshots
- Position website information strategically to frame and enhance the screenshots
- Ensure the desktop screenshot is the STAR of the design - everything else supports it
- Use color schemes that make the screenshot colors more vibrant
- Add subtle animations or hover effects that draw attention to the screenshots
- Consider using the desktop screenshot as a centerpiece with information flowing around it
- **CRITICAL**: All elements must fit within 675px height - use compact, efficient layouts
- **CRITICAL**: Screenshot size should be optimized to leave room for essential information
- **Optional Multi-Device Showcase**: If mobile/tablet screenshots are available, create a device showcase section
- **Responsive Design Display**: Show mobile/tablet screenshots in device frames to highlight responsive design
- **Device Comparison**: Use smaller device screenshots to complement the main desktop screenshot

**Output Format:**
Return ONLY the complete HTML document with embedded CSS, no explanations.
`
}
```

### Step 3: AI HTML Generator
**File: `src/lib/ai-html-generator.ts`**
```typescript
import { openai } from './openrouter'
import { buildAIPortfolioPrompt } from './prompt-templates'
import { validateHTML } from './html-validator'
import type { EnhancedWebsiteAnalysis, MultiDeviceScreenshots } from '@/types'

export async function generateAIPortfolioHTML(
  websiteData: EnhancedWebsiteAnalysis,
  screenshots: MultiDeviceScreenshots
): Promise<string> {
  try {
    if (!openai) {
      throw new Error('OpenRouter API key is not configured')
    }

    const prompt = buildAIPortfolioPrompt(websiteData, screenshots)

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })

    const htmlContent = response.choices[0]?.message?.content
    if (!htmlContent) {
      throw new Error('No HTML content generated by AI')
    }

    // Validate and optimize the generated HTML
    const validatedHTML = validateHTML(htmlContent)
    
    return validatedHTML
  } catch (error) {
    console.error('Error generating AI HTML:', error)
    throw new Error(`Failed to generate AI HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
```

### Step 4: HTML Validator
**File: `src/lib/html-validator.ts`**
```typescript
export function validateHTML(htmlContent: string): string {
  // Basic HTML validation
  if (!htmlContent.includes('<!DOCTYPE html>')) {
    htmlContent = `<!DOCTYPE html>\n${htmlContent}`
  }

  // Ensure proper structure
  if (!htmlContent.includes('<html')) {
    htmlContent = `<html lang="en">\n${htmlContent}\n</html>`
  }

  // Add viewport meta tag if missing
  if (!htmlContent.includes('viewport')) {
    htmlContent = htmlContent.replace(
      '<head>',
      '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    )
  }

  // Ensure body has proper dimensions
  if (!htmlContent.includes('width: 1200px') || !htmlContent.includes('height: 675px')) {
    // Add CSS to ensure proper dimensions
    const dimensionCSS = `
      body { 
        width: 1200px; 
        height: 675px; 
        margin: 0; 
        padding: 0; 
        overflow: hidden; 
      }
    `
    htmlContent = htmlContent.replace(
      '</head>',
      `<style>${dimensionCSS}</style>\n</head>`
    )
  }

  return htmlContent
}
```

### Step 5: Enhanced API Router
**File: `src/server/api/routers/snapshot.ts`**
```typescript
// Add new AI-driven endpoint
generateAISnapshot: publicProcedure
  .input(z.object({
    url: z.string().url(),
    includeMobile: z.boolean().optional().default(false),
    includeTablet: z.boolean().optional().default(false)
  }))
  .mutation(async ({ input }): Promise<AIGeneratedSnapshot> => {
    try {
      console.log(`Starting AI snapshot generation for: ${input.url}`)

      // Step 1: Capture multi-device screenshots
      console.log('Capturing screenshots...')
      const screenshots = await captureMultiDeviceScreenshots(input.url, {
        includeMobile: input.includeMobile,
        includeTablet: input.includeTablet
      })

      // Step 2: Analyze website data
      console.log('Analyzing website data...')
      const websiteData = await scrapeWebsiteData(input.url)
      const analysis = await analyzeWebsiteData(websiteData)

      // Step 3: Generate AI HTML
      console.log('Generating AI HTML...')
      const htmlContent = await generateAIPortfolioHTML(analysis, screenshots)

      // Step 4: Convert HTML to PNG
      console.log('Converting to PNG...')
      const pngBuffer = await convertHTMLToPNG(htmlContent)

      // Step 5: Return result
      const snapshot: AIGeneratedSnapshot = {
        id: `ai-snapshot-${Date.now()}`,
        htmlContent,
        pngUrl: `data:image/png;base64,${pngBuffer.toString('base64')}`,
        screenshots,
        websiteAnalysis: analysis,
        generatedAt: new Date()
      }

      console.log('AI snapshot generated successfully')
      return snapshot

    } catch (error) {
      console.error('Error in generateAISnapshot:', error)
      throw new Error(`Failed to generate AI snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
```

### Step 6: HTML to PNG Converter
**File: `src/lib/html-to-png.ts`**
```typescript
import puppeteer from 'puppeteer'

export async function convertHTMLToPNG(htmlContent: string): Promise<Buffer> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    })

    const page = await browser.newPage()
    
    // Set viewport to match our design dimensions
    await page.setViewport({
      width: 1200,
      height: 675,
      deviceScaleFactor: 2 // Higher quality
    })

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    })

    // Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false
    })

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
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Create multi-device screenshot system
- [ ] Enhance website analyzer with visual analysis
- [ ] Set up AI prompt templates

### Week 2: AI Integration
- [ ] Implement AI HTML generator
- [ ] Create HTML validator
- [ ] Build HTML to PNG converter

### Week 3: API & Types
- [ ] Enhance type system
- [ ] Create new API endpoints
- [ ] Update existing router

### Week 4: Testing & Polish
- [ ] Test with various websites
- [ ] Optimize prompts and generation
- [ ] Add error handling and fallbacks

## Benefits of This Approach

### For Users
- **Dynamic Designs**: Each card is uniquely tailored to the website
- **Professional Quality**: AI creates modern, visually appealing designs
- **Multi-Device Showcase**: Optional mobile/tablet screenshots
- **Screenshot-First**: Real website screenshots are the star of each design

### For Developers
- **Modular Architecture**: Easy to extend and modify
- **Type Safety**: Full TypeScript support
- **Error Handling**: Robust fallback mechanisms
- **Performance**: Optimized screenshot capture and processing

## Success Metrics
- AI generates visually appealing HTML consistently
- Screenshots are prominently featured and "POP"
- All designs fit within 1200x675px constraints
- Multi-device screenshots enhance portfolio value
- System handles various website types effectively

This implementation plan transforms the current template-based system into a dynamic, AI-driven portfolio snapshot generator that creates unique, professional designs for each website while maintaining the core requirement that the Puppeteer screenshot is the hero element. 