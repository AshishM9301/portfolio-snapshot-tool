# Enhanced AI-Driven Portfolio Snapshot System

## Objective
Create an AI-powered system that dynamically generates custom HTML portfolio cards based on website analysis data and screenshots, replacing static templates with intelligent, context-aware designs.

## Context
Currently using predefined templates in `src/lib/templates/` with static CSS. Need to transition to AI-generated HTML that adapts to each website's unique characteristics, data, and visual elements.

## Instructions

### Core AI Prompt Structure
```
You are an expert web designer and developer. Create a beautiful, modern portfolio card HTML for a website with the following specifications:

**Website Data:**
- Title: [WEBSITE_TITLE]
- URL: [WEBSITE_URL]
- Category: [CATEGORY]
- Purpose: [PURPOSE]
- Description: [DESCRIPTION]
- Target Audience: [TARGET_AUDIENCE]
- Technology Stack: [TECHNOLOGY_LIST]
- Design Style: [DESIGN_STYLE]
- Key Features: [FEATURES_LIST]
- Value Proposition: [VALUE_PROPOSITION]

**CRITICAL - Website Screenshots:**
- **Desktop Screenshot**: [BASE64_ENCODED_DESKTOP_SCREENSHOT] - This is a REAL screenshot taken by Puppeteer from the actual website
- **Mobile Screenshot** (Optional): [BASE64_ENCODED_MOBILE_SCREENSHOT] - Mobile view screenshot (375px width)
- **Tablet Screenshot** (Optional): [BASE64_ENCODED_TABLET_SCREENSHOT] - Tablet view screenshot (768px width)
- You MUST include the desktop screenshot in your design - it's the core visual element
- If mobile/tablet screenshots are available, incorporate them to showcase responsive design
- The screenshots show the actual website appearance across devices and should be prominently displayed
- Use these screenshots to understand the website's visual style and color scheme

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
```

### Implementation Steps

1. **Multi-Device Screenshot Generation (Puppeteer)**
   - Use Puppeteer to capture high-quality screenshots from the provided URL
   - **Desktop Screenshot**: 1200px width (primary screenshot)
   - **Mobile Screenshot**: 375px width (optional, for responsive showcase)
   - **Tablet Screenshot**: 768px width (optional, for responsive showcase)
   - Ensure proper viewport settings and wait for page load
   - Convert all screenshots to base64 format for AI processing
   - Desktop screenshot is the foundation, mobile/tablet enhance the design

2. **Data Preparation Function**
   - Collect all website analysis data (title, category, features, etc.)
   - Combine with the Puppeteer-generated screenshot
   - Format data for AI prompt with emphasis on screenshot integration

3. **AI Integration**
   - Use OpenRouter API to generate HTML
   - Pass complete website context including the screenshot
   - Emphasize that the screenshot MUST be included in the design
   - Handle AI response and validation

4. **HTML Processing**
   - Validate generated HTML includes the screenshot
   - Extract and optimize CSS
   - Ensure proper structure and formatting
   - Verify screenshot is properly embedded and visible

5. **Final Image Generation**
   - Convert AI-generated HTML (with embedded screenshot) to PNG
   - Maintain 1200x675 aspect ratio
   - Optimize for download and sharing

### File Structure Updates
```
src/lib/
├── ai-html-generator.ts     # AI-powered HTML generation
├── prompt-templates.ts      # AI prompt templates
├── html-validator.ts        # HTML validation and optimization
└── screenshot-generator.ts  # Enhanced screenshot generation
```

### Key Features
- **Screenshot-First Design**: The Puppeteer desktop screenshot is the STAR - everything else makes it POP
- **Multi-Device Showcase**: Optional mobile/tablet screenshots highlight responsive design
- **Fixed Dimensions**: All designs fit perfectly within 1200x675px - no scrolling or overflow
- **Dynamic Design**: Each card is uniquely designed to showcase the specific website screenshots
- **Context-Aware**: AI considers website category, purpose, and visual style to enhance the screenshots
- **Hero Element Focus**: Desktop screenshot takes center stage with dramatic visual effects
- **Compact Layouts**: Efficient space utilization to fit all essential information
- **Professional Quality**: Modern design principles that make screenshots look amazing
- **Data-Driven**: All analysis data is strategically positioned to frame and enhance the screenshots
- **Scalable**: Easy to add new data fields or modify prompts while maintaining screenshot focus

### Error Handling
- Fallback to basic template if AI generation fails
- HTML validation before image generation
- Retry mechanism for AI API calls
- Graceful degradation for missing data

### Performance Considerations
- Cache AI-generated HTML for similar websites
- Optimize base64 image encoding
- Implement request rate limiting
- Monitor AI API usage and costs

## Verification
- Test with various website types (e-commerce, portfolio, blog, etc.)
- Verify HTML output quality and structure
- Ensure consistent 1200x675 output dimensions
- Validate all data fields are properly displayed
- Test with and without screenshots

## Preferences
- Use OpenRouter API for AI generation
- Maintain existing file structure where possible
- Focus on single URL → single image workflow
- Prioritize visual quality and professional appearance
- Keep implementation simple and maintainable 