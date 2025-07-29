// HTML validation and optimization functions
export function validateHTML(htmlContent: string): string {
    let validatedHTML = htmlContent.trim()

    // Remove markdown formatting and code blocks
    validatedHTML = removeMarkdownFormatting(validatedHTML)

    // Basic HTML validation and structure fixes
    validatedHTML = ensureProperHTMLStructure(validatedHTML)
    validatedHTML = ensureViewportMeta(validatedHTML)
    validatedHTML = ensureProperDimensions(validatedHTML)
    validatedHTML = ensureScreenshotIntegration(validatedHTML)
    validatedHTML = optimizeCSS(validatedHTML)
    validatedHTML = enhanceProfessionalStyling(validatedHTML)

    return validatedHTML
}

// Ensure proper HTML structure
function ensureProperHTMLStructure(html: string): string {
    // Add DOCTYPE if missing
    if (!html.includes('<!DOCTYPE html>')) {
        html = `<!DOCTYPE html>\n${html}`
    }

    // Ensure html tag exists
    if (!html.includes('<html')) {
        html = `<html lang="en">\n${html}\n</html>`
    }

    // Ensure head and body tags exist
    if (!html.includes('<head>')) {
        html = html.replace('<html', '<html>\n<head>\n</head>\n<body>')
        if (!html.includes('</body>')) {
            html += '\n</body>'
        }
    }

    return html
}

// Remove markdown formatting and code blocks
function removeMarkdownFormatting(html: string): string {
    // Remove markdown code blocks
    html = html.replace(/```html\s*/g, '')
    html = html.replace(/```\s*$/g, '')

    // Remove any remaining markdown formatting
    html = html.replace(/^\s*```.*$/gm, '')
    html = html.replace(/^\s*`.*`\s*$/gm, '')

    // Remove any explanatory text that might be included
    html = html.replace(/This HTML creates.*$/s, '')
    html = html.replace(/The card maintains.*$/s, '')

    return html.trim()
}

// Enhance professional styling
function enhanceProfessionalStyling(html: string): string {
    // Add professional CSS variables and styling
    const professionalCSS = `
    :root {
        --primary: #2563eb;
        --primary-dark: #1d4ed8;
        --text: #1f2937;
        --text-light: #6b7280;
        --bg: #ffffff;
        --border: #e5e7eb;
        --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        color: var(--text);
        background: var(--bg);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    .portfolio-card {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        position: relative;
    }
    
    .card-image {
        position: relative;
        height: 400px;
        overflow: hidden;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .card-content {
        padding: 2.5rem;
    }
    
    .project-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 1rem;
        line-height: 1.2;
    }
    
    .project-description {
        color: var(--text-light);
        margin-bottom: 1.5rem;
        font-size: 1.1rem;
        line-height: 1.6;
    }
    
    .tech-stack {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }
    
    .tech-tag {
        background: #f3f4f6;
        color: var(--text);
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        border: 1px solid var(--border);
    }
    
    .project-link {
        display: inline-flex;
        align-items: center;
        background: var(--primary);
        color: white;
        padding: 0.875rem 1.75rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.2s ease;
        box-shadow: var(--shadow);
    }
    
    .project-link:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-lg);
    }
    
    .device-previews {
        display: flex;
        gap: 2rem;
        margin-top: 2rem;
        justify-content: center;
        align-items: flex-start;
    }
    
    .device-frame {
        border: 12px solid #e5e7eb;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        background: white;
    }
    
    .device-frame.mobile {
        width: 280px;
        height: 500px;
    }
    
    .device-frame.tablet {
        width: 400px;
        height: 600px;
    }
    
    .device-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    
    @media (max-width: 768px) {
        .portfolio-card {
            margin: 1rem;
            border-radius: 12px;
        }
        
        .card-image {
            height: 300px;
        }
        
        .card-content {
            padding: 1.5rem;
        }
        
        .device-previews {
            flex-direction: column;
            align-items: center;
        }
        
        .device-frame.mobile,
        .device-frame.tablet {
            width: 100%;
            max-width: 320px;
        }
    }
    `

    // Check if professional CSS already exists
    if (!html.includes('--primary: #2563eb')) {
        if (html.includes('<style>')) {
            // Add to existing style tag
            html = html.replace('<style>', `<style>${professionalCSS}`)
        } else if (html.includes('</head>')) {
            // Add new style tag
            html = html.replace('</head>', `<style>${professionalCSS}</style>\n</head>`)
        } else {
            // Add head with style tag
            html = html.replace('<html', '<html>\n<head>\n<style>' + professionalCSS + '</style>\n</head>\n<body>')
            if (!html.includes('</body>')) {
                html += '\n</body>'
            }
        }
    }

    return html
}

// Ensure viewport meta tag exists
function ensureViewportMeta(html: string): string {
    if (!html.includes('viewport')) {
        const viewportMeta = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'

        if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>\n${viewportMeta}`)
        } else {
            // If no head tag, add one with viewport
            html = html.replace('<html', '<html>\n<head>\n' + viewportMeta + '\n</head>\n<body>')
            if (!html.includes('</body>')) {
                html += '\n</body>'
            }
        }
    }

    return html
}

// Ensure proper dimensions for portfolio card
function ensureProperDimensions(html: string): string {
    const dimensionCSS = `
    body { 
      width: 1200px; 
      height: 675px; 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    html {
      width: 1200px;
      height: 675px;
      overflow: hidden;
    }
  `

    // Check if dimension CSS already exists
    if (!html.includes('width: 1200px') || !html.includes('height: 675px')) {
        if (html.includes('<style>')) {
            // Add to existing style tag
            html = html.replace('<style>', `<style>\n${dimensionCSS}`)
        } else if (html.includes('</head>')) {
            // Add new style tag
            html = html.replace('</head>', `<style>${dimensionCSS}</style>\n</head>`)
        } else {
            // Add head with style tag
            html = html.replace('<html', '<html>\n<head>\n<style>' + dimensionCSS + '</style>\n</head>\n<body>')
            if (!html.includes('</body>')) {
                html += '\n</body>'
            }
        }
    }

    return html
}

// Ensure screenshot is properly integrated
function ensureScreenshotIntegration(html: string): string {
    // Check if screenshot exists in the HTML
    if (html.includes('data:image/png;base64,')) {
        // Ensure screenshot has proper styling
        const screenshotCSS = `
      .screenshot, img[src*="data:image/png;base64"] {
        max-width: 100%;
        height: auto;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
    `

        if (html.includes('<style>')) {
            html = html.replace('<style>', `<style>\n${screenshotCSS}`)
        } else if (html.includes('</head>')) {
            html = html.replace('</head>', `<style>${screenshotCSS}</style>\n</head>`)
        }
    }

    return html
}

// Optimize CSS for better performance
function optimizeCSS(html: string): string {
    // Remove any duplicate CSS rules
    // This is a basic implementation - could be enhanced with a CSS parser

    // Ensure CSS is properly formatted
    if (html.includes('<style>')) {
        // Basic CSS formatting
        html = html.replace(/<style>([\s\S]*?)<\/style>/g, (match, css: string) => {
            const formattedCSS = css
                .replace(/\s+/g, ' ') // Remove extra whitespace
                .replace(/;\s*}/g, '}') // Remove trailing semicolons
                .trim()

            return `<style>\n${formattedCSS}\n</style>`
        })
    }

    return html
}

// Validate that the HTML meets our requirements
export function validateHTMLRequirements(html: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
} {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for required elements
    if (!html.includes('<!DOCTYPE html>')) {
        errors.push('Missing DOCTYPE declaration')
    }

    if (!html.includes('<html')) {
        errors.push('Missing HTML tag')
    }

    if (!html.includes('<head>')) {
        errors.push('Missing head tag')
    }

    if (!html.includes('<body>')) {
        errors.push('Missing body tag')
    }

    if (!html.includes('viewport')) {
        errors.push('Missing viewport meta tag')
    }

    // Check for dimensions
    if (!html.includes('width: 1200px') && !html.includes('width:1200px')) {
        warnings.push('No explicit 1200px width found')
    }

    if (!html.includes('height: 675px') && !html.includes('height:675px')) {
        warnings.push('No explicit 675px height found')
    }

    // Check for screenshot
    if (!html.includes('data:image/png;base64,')) {
        warnings.push('No base64 screenshot found')
    }

    // Check for overflow hidden
    if (!html.includes('overflow: hidden') && !html.includes('overflow:hidden')) {
        warnings.push('No overflow hidden found - may cause scrolling')
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

// Create a fallback HTML template
export function createFallbackHTML(
    title: string,
    url: string,
    screenshot?: string
): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { 
      width: 1200px; 
      height: 675px; 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
    }
    .title {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .url {
      font-size: 18px;
      opacity: 0.8;
      margin-bottom: 30px;
    }
    .screenshot {
      max-width: 60%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">${title}</h1>
    <p class="url">${url}</p>
    ${screenshot ? `<img src="data:image/png;base64,${screenshot}" alt="${title}" class="screenshot">` : ''}
  </div>
</body>
</html>`
} 