import type { WebsiteAnalysis } from '@/lib/website-analyzer'
import type { MultiDeviceScreenshots } from './multi-device-screenshot'

// Helper function to get style-specific instructions
function getStyleInstructions(style: string, quality: string): string {
    switch (style) {
        case 'modern':
            return `
**Modern Style Design Requirements:**
- Clean, minimalist design with plenty of whitespace
- Use modern sans-serif typography (Inter, SF Pro, or similar)
- Implement subtle animations and micro-interactions
- Use a neutral color palette with one accent color
- Add glassmorphism effects and subtle shadows
- Focus on clean lines and geometric shapes
- Use modern CSS Grid and Flexbox layouts
- Implement smooth transitions and hover effects
- Keep the design sophisticated but approachable
- Use modern iconography and visual elements`

        case 'professional':
            return `
**Professional Style Design Requirements:**
- Corporate, formal layout with structured grid system
- Use professional typography (Roboto, Open Sans, or similar)
- Implement conservative color schemes (blues, grays, whites)
- Add subtle borders and structured spacing
- Use traditional card layouts with clear hierarchy
- Focus on readability and information clarity
- Implement minimal animations for professionalism
- Use professional iconography and business-focused elements
- Maintain consistent spacing and alignment
- Create a trustworthy, authoritative appearance`

        case 'creative':
            return `
**Creative Style Design Requirements:**
- Bold, artistic design with vibrant colors
- Use creative typography with varied font weights and styles
- Implement dynamic layouts with overlapping elements
- Add artistic effects, gradients, and creative patterns
- Use unconventional color combinations
- Focus on visual impact and artistic expression
- Implement creative animations and transitions
- Use artistic iconography and creative visual elements
- Break traditional design rules for artistic effect
- Create an inspiring, innovative appearance`

        case 'minimal':
            return `
**Minimal Style Design Requirements:**
- Ultra-clean design with maximum whitespace
- Use simple, readable typography (Helvetica, Arial, or similar)
- Implement monochromatic or limited color palette
- Remove all unnecessary decorative elements
- Focus on essential information only
- Use simple, clean layouts with clear hierarchy
- Implement minimal or no animations
- Use simple iconography and basic shapes
- Maintain consistent, generous spacing
- Create a calm, uncluttered appearance`

        default:
            return `
**Default Style Design Requirements:**
- Clean, modern design with good typography
- Use a balanced color palette
- Implement subtle animations and effects
- Focus on readability and visual hierarchy
- Use modern CSS layouts and styling`
    }
}

// Helper function to get device-specific instructions
function getDeviceInstructions(includeMobile: boolean, includeTablet: boolean, screenshots: MultiDeviceScreenshots): string {
    if (!includeMobile && !includeTablet) {
        return `
**Single Device Display:**
- Focus entirely on the desktop screenshot as the main hero element
- Use the full available space to showcase the desktop view
- Create a clean, focused layout around the single screenshot
- Ensure the desktop screenshot is prominently displayed and well-framed`
    }

    let instructions = `
**Multi-Device Showcase:**
- Create a device showcase section highlighting responsive design
- Display the desktop screenshot as the primary hero element
- Use device frames to showcase mobile and tablet screenshots
- Create a visual hierarchy: Desktop (main) > Tablet > Mobile
- Show the responsive design progression across devices`

    if (includeMobile && screenshots.mobile) {
        instructions += `
- Include mobile screenshot in a phone frame (375x667px scale)
- Position mobile screenshot to complement the desktop view
- Use the mobile screenshot to highlight mobile-specific features`
    }

    if (includeTablet && screenshots.tablet) {
        instructions += `
- Include tablet screenshot in a tablet frame (768x1024px scale)
- Position tablet screenshot between desktop and mobile
- Use the tablet screenshot to show intermediate responsive breakpoints`
    }

    return instructions
}

// Helper function to get quality-specific instructions
function getQualityInstructions(quality: string): string {
    switch (quality) {
        case 'high':
            return `
**High Quality Requirements:**
- Use sophisticated CSS with advanced features
- Implement detailed animations and micro-interactions
- Add premium visual effects and sophisticated styling
- Use high-quality typography with proper font loading
- Implement complex layouts with attention to detail
- Add subtle shadows, gradients, and depth effects
- Use advanced CSS Grid and Flexbox techniques
- Implement smooth transitions and polished interactions
- Focus on pixel-perfect design and premium aesthetics
- Create a high-end, professional appearance`

        case 'medium':
            return `
**Medium Quality Requirements:**
- Use good CSS practices with modern features
- Implement basic animations and hover effects
- Add standard visual effects and clean styling
- Use readable typography with good hierarchy
- Implement clean layouts with proper spacing
- Add subtle shadows and basic depth effects
- Use CSS Grid and Flexbox for layout
- Implement smooth transitions
- Focus on clean, professional design
- Create a balanced, polished appearance`

        case 'low':
            return `
**Low Quality Requirements:**
- Use simple CSS with basic styling
- Implement minimal animations if any
- Add basic visual effects and simple styling
- Use standard typography with clear readability
- Implement simple layouts with adequate spacing
- Add basic shadows and simple effects
- Use simple CSS layouts
- Implement basic transitions
- Focus on functionality over aesthetics
- Create a simple, clean appearance`

        default:
            return `
**Default Quality Requirements:**
- Use modern CSS with good practices
- Implement appropriate animations and effects
- Add clean styling and visual hierarchy
- Use readable typography
- Implement clean layouts with proper spacing`
    }
}

// Enhanced website analysis interface for AI prompts
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
}

// Build AI prompt for portfolio HTML generation
export function buildAIPortfolioPrompt(
    websiteData: EnhancedWebsiteAnalysis,
    screenshots: MultiDeviceScreenshots,
    options?: {
        style?: 'modern' | 'professional' | 'creative' | 'minimal'
        quality?: 'high' | 'medium' | 'low'
        includeMobile?: boolean
        includeTablet?: boolean
    }
): string {
    const { websiteData: data, analysis } = websiteData

    const style = options?.style ?? 'modern'
    const quality = options?.quality ?? 'high'
    const includeMobile = options?.includeMobile ?? false
    const includeTablet = options?.includeTablet ?? false

    // Style-specific design instructions
    const styleInstructions = getStyleInstructions(style, quality)

    // Device-specific instructions
    const deviceInstructions = getDeviceInstructions(includeMobile, includeTablet, screenshots)

    // Quality-specific instructions
    const qualityInstructions = getQualityInstructions(quality)

    return `
You are an expert web designer and developer. Create a beautiful, ${style} portfolio card HTML for a website with the following specifications:

**CRITICAL STYLE REQUIREMENT: You MUST create a ${style.toUpperCase()} style design. This is NOT optional.**

**CRITICAL DEVICE REQUIREMENT: ${includeMobile || includeTablet ? `You MUST include ${includeMobile ? 'mobile' : ''}${includeMobile && includeTablet ? ' and ' : ''}${includeTablet ? 'tablet' : ''} screenshots in the design.` : 'Focus on desktop screenshot only.'}**
- Title: ${data.title || 'Portfolio Website'}
- URL: ${data.url}
- Category: ${analysis.category || 'General'}
- Purpose: ${analysis.purpose || 'Professional website'}
- Description: ${data.description || 'Modern website with professional design'}
- Target Audience: ${analysis.targetAudience || 'General Users'}
- Technology Stack: ${analysis.technologyIndicators?.join(', ') || 'Modern Web Technologies'}
- Design Style: ${analysis.designStyle || 'Contemporary'}
- Key Features: ${analysis.keyFeatures?.join(', ') || 'Professional Design, Responsive Layout'}
- Value Proposition: ${analysis.valueProposition || 'Professional website with modern design and functionality'}

**CRITICAL - Website Screenshots:**
- Desktop Screenshot: ${screenshots.desktop}
- Mobile Screenshot: ${screenshots.mobile ?? 'Not available'}
- Tablet Screenshot: ${screenshots.tablet ?? 'Not available'}

${styleInstructions}

${deviceInstructions}

${qualityInstructions}

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
16. **CRITICAL**: Add CSS to prevent any scrolling: \`html, body { overflow: hidden !important; height: 675px !important; }\`
17. **CRITICAL**: Use \`max-height: 675px\` and \`overflow: hidden\` on all container elements
18. **CRITICAL**: Ensure all text and images are sized to fit within the 675px height constraint

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

**Design Inspiration:**
- Use modern CSS Grid and Flexbox for layout
- Implement glassmorphism effects for modern appeal
- Add subtle gradients and shadows for depth
- Use typography hierarchy to guide the eye
- Incorporate the website's color scheme into the design
- Make the screenshot the focal point with supporting elements

**Output Format:**
Return ONLY the complete HTML document with embedded CSS, no explanations.

**FINAL REMINDER:**
- Style: ${style.toUpperCase()} - Make this obvious in the design
- Quality: ${quality.toUpperCase()} - Use appropriate styling complexity
- Devices: ${includeMobile ? 'Include mobile screenshot' : 'Desktop only'}${includeTablet ? ', Include tablet screenshot' : ''}

The HTML should include:
- Complete DOCTYPE and HTML structure
- Embedded CSS in <style> tag
- Proper viewport meta tag
- All content within a 1200x675px container
- The desktop screenshot prominently displayed
- Website information strategically positioned
- ${style} styling that makes the screenshot POP
`
}

// Build a simpler prompt for fallback scenarios
export function buildSimplePortfolioPrompt(
    websiteData: WebsiteAnalysis,
    screenshotUrl: string,
    options?: {
        style?: 'modern' | 'professional' | 'creative' | 'minimal'
        quality?: 'high' | 'medium' | 'low'
        includeMobile?: boolean
        includeTablet?: boolean
    }
): string {
    const { websiteData: data, analysis } = websiteData

    const style = options?.style ?? 'modern'
    const quality = options?.quality ?? 'high'

    return `Create a 1200x675px ${style} portfolio card HTML for ${data.title || 'a website'}.

Website: ${data.url}
Description: ${data.description || 'Professional website'}
Category: ${analysis.category || 'General'}

Screenshot: ${screenshotUrl}

Style: ${style}
Quality: ${quality}

Requirements:
- 1200x675px dimensions
- Screenshot prominently displayed
- ${style} design style
- ${quality} quality level
- No scrolling or overflow

Return ONLY the complete HTML document with embedded CSS.`
}

// Build prompt for error scenarios
export function buildErrorFallbackPrompt(
    url: string,
    errorMessage: string
): string {
    return `Create a 1200x675px error card HTML.

Website: ${url}
Error: ${errorMessage}

Requirements:
- 1200x675px dimensions
- Professional error display
- Clean design

Return ONLY the complete HTML document with embedded CSS.`
}

// ===== AI TEXT ANALYSIS PROMPTS =====

// Text analysis prompt for extracting styling preferences and content
export const TEXT_ANALYSIS_PROMPT = `Analyze the following text input and extract key information for creating portfolio snapshots.

**Input Text:**
{text}

**Extract the following information:**

1. **Style Preferences:**
   - Look for style keywords: modern, professional, creative, minimal, portfolio, showcase
   - Determine if it's for a single project or multiple projects
   - Identify any specific design preferences

2. **Aspect Ratio Preferences:**
   - Look for ratio specifications: 16:9, 4:3, 1:1, 3:2
   - Identify landscape/portrait preferences
   - Look for device-specific mentions

3. **Quality Preferences:**
   - Look for quality indicators: high, medium, low, HD, premium, fast
   - Identify performance vs quality trade-offs

4. **Device Preferences:**
   - Look for mobile, tablet, desktop mentions
   - Identify responsive design requirements

5. **Custom Content:**
   - Extract titles from natural language (e.g., "Title - My Website" → "My Website")
   - Extract descriptions from natural language (e.g., "Description - A portfolio site" → "A portfolio site")
   - Identify project names, titles, or website names from context
   - Look for patterns like "Title:", "Name:", "Project:", "Website:", etc.
   - Understand variations like "with Title", "titled", "called", etc.

6. **URLs:**
   - Extract all valid URLs
   - Categorize URLs by type (portfolio, social, project, etc.)

**Return a JSON object with this structure:**
{
  "style": "portfolio-multi|portfolio-single|professional|creative|minimal",
  "aspectRatio": "16:9|4:3|1:1|3:2",
  "quality": "high|medium|low",
  "includeMobile": boolean,
  "includeTablet": boolean,
  "customTitle": "string or null",
  "customDescription": "string or null",
  "urls": ["array of URLs"],
  "confidence": {
    "style": 0-100,
    "aspectRatio": 0-100,
    "quality": 0-100,
    "title": 0-100,
    "description": 0-100
  }
}

**Confidence Scoring:**
- 90-100: Explicitly stated with clear keywords or exact patterns
- 70-89: Strongly implied with multiple related keywords or clear context
- 50-69: Moderately implied with some keywords or reasonable inference
- 30-49: Weakly implied with few keywords or uncertain context
- 0-29: No clear indication, use defaults

**Title/Description Extraction Examples:**
- "Modern with Title - My First Website" → title: "My First Website", style: "creative"
- "Title: Portfolio Site" → title: "Portfolio Site"
- "My project called Awesome App" → title: "Awesome App"
- "Website named Tech Blog" → title: "Tech Blog"
- "Description - A modern portfolio" → description: "A modern portfolio"

Return ONLY the JSON object, no additional text.`

// URL analysis prompt for extracting website information
export const URL_ANALYSIS_PROMPT = `Analyze the following URLs and extract information about the websites they represent.

**URLs to Analyze:**
{urls}

**For each URL, extract:**
1. Website type/category (portfolio, social media, business, etc.)
2. Likely content and purpose
3. Target audience
4. Technology stack indicators
5. Design style indicators

**Overall Analysis:**
1. **Suggested Style:** Based on the types of websites
2. **Suggested Title:** Generate an appropriate title for the collection
3. **Suggested Description:** Generate a description that captures the essence
4. **Suggested Aspect Ratio:** Based on content type
5. **Device Recommendations:** Based on website types

**Return a JSON object:**
{
  "suggestedStyle": "portfolio-multi|portfolio-single|professional|creative|minimal",
  "suggestedTitle": "string",
  "suggestedDescription": "string",
  "suggestedAspectRatio": "16:9|4:3|1:1|3:2",
  "includeMobile": boolean,
  "includeTablet": boolean,
  "confidence": {
    "style": 0-100,
    "title": 0-100,
    "description": 0-100,
    "aspectRatio": 0-100
  },
  "urlAnalysis": [
    {
      "url": "string",
      "type": "string",
      "category": "string",
      "purpose": "string"
    }
  ]
}

Return ONLY the JSON object, no additional text.`

// Image analysis prompt for extracting content from screenshots
export const IMAGE_ANALYSIS_PROMPT = `Analyze the following website screenshot(s) and extract key information.

**Image Content:**
{imageDescription}

**Extract the following information:**

1. **Website Type:** What type of website is this? (portfolio, e-commerce, blog, business, etc.)
2. **Content Analysis:** What is the main content/purpose?
3. **Design Style:** What design style is being used? (modern, professional, creative, minimal)
4. **Technology Indicators:** What technologies might be used? (React, WordPress, etc.)
5. **Target Audience:** Who is this website for?
6. **Key Features:** What are the main features visible?

**Generate:**
1. **Suggested Title:** Based on the website content
2. **Suggested Description:** Comprehensive description of the website
3. **Suggested Style:** Appropriate portfolio style for showcasing this
4. **Suggested Aspect Ratio:** Based on the layout and content

**Return a JSON object:**
{
  "websiteType": "string",
  "contentAnalysis": "string",
  "designStyle": "string",
  "technologyIndicators": ["array"],
  "targetAudience": "string",
  "keyFeatures": ["array"],
  "suggestedTitle": "string",
  "suggestedDescription": "string",
  "suggestedStyle": "portfolio-multi|portfolio-single|professional|creative|minimal",
  "suggestedAspectRatio": "16:9|4:3|1:1|3:2",
  "confidence": {
    "title": 0-100,
    "description": 0-100,
    "style": 0-100,
    "aspectRatio": 0-100
  }
}

Return ONLY the JSON object, no additional text.`

// Description generation prompt
export const DESCRIPTION_GENERATION_PROMPT = `Generate a compelling description for a portfolio snapshot based on the following information.

**Title:** {title}
**URLs:** {urls}
**Context:** {context}
**Style:** {style}

**Requirements:**
1. **Length:** 50-200 characters for concise, 200-500 characters for detailed
2. **Tone:** Professional but engaging
3. **Content:** Highlight key features, technologies, or achievements
4. **Style Match:** Match the tone to the specified style
5. **SEO Friendly:** Include relevant keywords naturally

**Style Guidelines:**
- **Professional:** Focus on achievements, technologies, business value
- **Creative:** Emphasize design, innovation, artistic elements
- **Portfolio:** Highlight projects, skills, experience
- **Minimal:** Keep it simple and clean

**Return a JSON object:**
{
  "description": "string",
  "confidence": 0-100,
  "length": "concise|detailed"
}

Return ONLY the JSON object, no additional text.` 