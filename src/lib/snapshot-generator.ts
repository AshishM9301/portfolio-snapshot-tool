import type { WebsiteAnalysis } from './website-analyzer'

export interface SnapshotTemplate {
    id: string
    name: string
    style: 'portfolio-multi' | 'portfolio-single' | 'professional' | 'creative' | 'minimal' | 'modern'
    aspectRatio: '16:9' | '4:3' | '1:1' | '3:2'
    description: string
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        text: string
    }
}

export interface SnapshotGenerationRequest {
    websiteAnalysis: WebsiteAnalysis
    style?: 'portfolio-multi' | 'portfolio-single' | 'professional' | 'creative' | 'minimal' | 'modern'
    aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2'
    customTitle?: string
    customDescription?: string
}

export interface GeneratedSnapshot {
    id: string
    title: string
    description: string
    imageUrl: string
    style: string
    aspectRatio: string
    timestamp: Date
    template: SnapshotTemplate
}

// Portfolio-style templates
const PORTFOLIO_TEMPLATES: SnapshotTemplate[] = [
    {
        id: 'portfolio-multi-16-9',
        name: 'Multi-Website Portfolio',
        style: 'portfolio-multi',
        aspectRatio: '16:9',
        description: 'Showcase multiple websites in a professional portfolio layout',
        colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#06b6d4',
            background: '#ffffff',
            text: '#1f2937'
        }
    },
    {
        id: 'portfolio-single-16-9',
        name: 'Single Website Portfolio',
        style: 'portfolio-single',
        aspectRatio: '16:9',
        description: 'Detailed view of one website with multiple page layouts',
        colors: {
            primary: '#059669',
            secondary: '#0d9488',
            accent: '#7c3aed',
            background: '#ffffff',
            text: '#1f2937'
        }
    }
]

// Legacy templates for backward compatibility
const LEGACY_TEMPLATES: SnapshotTemplate[] = [
    {
        id: 'professional-16-9',
        name: 'Professional Landscape',
        style: 'professional',
        aspectRatio: '16:9',
        description: 'Clean, corporate-style layout perfect for business presentations',
        colors: {
            primary: '#2563eb',
            secondary: '#1e40af',
            accent: '#3b82f6',
            background: '#ffffff',
            text: '#1f2937'
        }
    },
    {
        id: 'creative-16-9',
        name: 'Creative Landscape',
        style: 'creative',
        aspectRatio: '16:9',
        description: 'Vibrant, artistic layout with bold colors and modern typography',
        colors: {
            primary: '#8b5cf6',
            secondary: '#7c3aed',
            accent: '#06b6d4',
            background: '#f8fafc',
            text: '#1e293b'
        }
    },
    {
        id: 'minimal-16-9',
        name: 'Minimal Landscape',
        style: 'minimal',
        aspectRatio: '16:9',
        description: 'Simple, clean design focusing on content and readability',
        colors: {
            primary: '#374151',
            secondary: '#6b7280',
            accent: '#9ca3af',
            background: '#ffffff',
            text: '#111827'
        }
    },
    {
        id: 'modern-16-9',
        name: 'Modern Landscape',
        style: 'modern',
        aspectRatio: '16:9',
        description: 'Contemporary design with gradients and modern UI elements',
        colors: {
            primary: '#059669',
            secondary: '#0d9488',
            accent: '#7c3aed',
            background: '#ffffff',
            text: '#1f2937'
        }
    }
]

const ALL_TEMPLATES = [...PORTFOLIO_TEMPLATES, ...LEGACY_TEMPLATES]

// Function to generate portfolio-style snapshots
export function generateSnapshotVariations(
    request: SnapshotGenerationRequest
): GeneratedSnapshot[] {
    const { websiteAnalysis, style, aspectRatio } = request

    // Filter templates based on request
    let templates = ALL_TEMPLATES

    if (style) {
        templates = templates.filter(t => t.style === style)
    }

    if (aspectRatio) {
        templates = templates.filter(t => t.aspectRatio === aspectRatio)
    }

    // If no specific style requested, prefer portfolio templates
    if (!style) {
        templates = PORTFOLIO_TEMPLATES.length > 0 ? PORTFOLIO_TEMPLATES : templates
    }

    return templates.map(template =>
        generateSnapshotFromTemplate(websiteAnalysis, template, request)
    )
}

function generateSnapshotFromTemplate(
    websiteAnalysis: WebsiteAnalysis,
    template: SnapshotTemplate,
    request: SnapshotGenerationRequest
): GeneratedSnapshot {
    const title = request.customTitle ?? websiteAnalysis.websiteData.title ?? 'Website Portfolio'
    const description = request.customDescription ?? template.description

    let imageUrl: string

    if (template.style.startsWith('portfolio-')) {
        // Generate portfolio-style layout with actual screenshots
        imageUrl = generatePortfolioLayout(template, websiteAnalysis, title, description)
    } else {
        // Generate legacy placeholder layout
        const content = generateSnapshotContent(websiteAnalysis.analysis, template)
        imageUrl = generatePlaceholderImage(template, title, description, content)
    }

    return {
        id: `${template.id}-${Date.now()}`,
        title,
        description,
        imageUrl,
        style: template.style,
        aspectRatio: template.aspectRatio,
        timestamp: new Date(),
        template
    }
}

// Generate portfolio-style layout with actual website screenshots
function generatePortfolioLayout(
    template: SnapshotTemplate,
    websiteAnalysis: WebsiteAnalysis,
    title: string,
    description: string
): string {
    const [width, height] = getDimensionsFromAspectRatio(template.aspectRatio)
    const screenshot = websiteAnalysis.websiteData.screenshot

    if (template.style === 'portfolio-multi') {
        return generateMultiWebsiteLayout(template, websiteAnalysis, title, description, width, height)
    } else {
        return generateSingleWebsiteLayout(template, websiteAnalysis, title, description, width, height)
    }
}

// Generate multi-website portfolio layout
function generateMultiWebsiteLayout(
    template: SnapshotTemplate,
    websiteAnalysis: WebsiteAnalysis,
    title: string,
    description: string,
    width: number,
    height: number
): string {
    const screenshot = websiteAnalysis.websiteData.screenshot
    const websiteTitle = websiteAnalysis.websiteData.title
    const websiteUrl = websiteAnalysis.websiteData.url

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <!-- Background -->
    <rect width="100%" height="100%" fill="${template.colors.background}"/>
    
    <!-- Header Section -->
    <rect x="0" y="0" width="100%" height="${height * 0.15}" fill="${template.colors.primary}" opacity="0.1"/>
    
    <!-- Header Title -->
    <text x="50%" y="${height * 0.08}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="36" font-family="Arial, sans-serif" font-weight="bold">
        ${title}
    </text>
    
    <!-- Header Subtitle -->
    <text x="50%" y="${height * 0.12}" text-anchor="middle" fill="${template.colors.secondary}" 
          font-size="18" font-family="Arial, sans-serif">
        Portfolio Collection
    </text>
    
    <!-- Main Content Area -->
    <rect x="${width * 0.05}" y="${height * 0.18}" width="${width * 0.9}" height="${height * 0.75}" 
          fill="white" opacity="0.95" rx="15" stroke="${template.colors.primary}" stroke-width="2" opacity="0.2"/>
    
    <!-- Website Screenshot -->
    <image href="data:image/png;base64,${screenshot}" 
           x="${width * 0.1}" y="${height * 0.25}" 
           width="${width * 0.35}" height="${height * 0.4}" 
           preserveAspectRatio="xMidYMid slice"/>
    
    <!-- Website Info -->
    <rect x="${width * 0.5}" y="${height * 0.25}" width="${width * 0.35}" height="${height * 0.4}" 
          fill="${template.colors.primary}" opacity="0.05" rx="10"/>
    
    <!-- Website Title -->
    <text x="${width * 0.675}" y="${height * 0.32}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="24" font-family="Arial, sans-serif" font-weight="bold">
        ${websiteTitle}
    </text>
    
    <!-- Website URL -->
    <text x="${width * 0.675}" y="${height * 0.38}" text-anchor="middle" fill="${template.colors.secondary}" 
          font-size="14" font-family="Arial, sans-serif">
        ${websiteUrl}
    </text>
    
    <!-- Website Features -->
    ${websiteAnalysis.analysis.keyFeatures.slice(0, 4).map((feature, index) => `
        <text x="${width * 0.675}" y="${height * (0.45 + index * 0.06)}" text-anchor="middle" 
              fill="${template.colors.accent}" font-size="16" font-family="Arial, sans-serif">
            • ${feature}
        </text>
    `).join('')}
    
    <!-- Bottom Section -->
    <rect x="${width * 0.1}" y="${height * 0.7}" width="${width * 0.8}" height="${height * 0.2}" 
          fill="${template.colors.secondary}" opacity="0.1" rx="10"/>
    
    <!-- Portfolio Description -->
    <text x="50%" y="${height * 0.78}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="20" font-family="Arial, sans-serif" font-weight="bold">
        Professional Web Portfolio
    </text>
    
    <text x="50%" y="${height * 0.85}" text-anchor="middle" fill="${template.colors.secondary}" 
          font-size="16" font-family="Arial, sans-serif">
        ${description}
    </text>
    
    <!-- Style Badge -->
    <rect x="20" y="20" width="120" height="30" rx="15" fill="${template.colors.primary}" opacity="0.9"/>
    <text x="80" y="40" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif" font-weight="bold">
        Portfolio
    </text>
    
    <!-- Aspect Ratio Badge -->
    <rect x="160" y="20" width="80" height="30" rx="15" fill="${template.colors.accent}" opacity="0.9"/>
    <text x="200" y="40" text-anchor="middle" fill="white" font-size="12" font-family="Arial, sans-serif" font-weight="bold">
        ${template.aspectRatio}
    </text>
</svg>`

    const base64 = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64}`
}

// Generate single website portfolio layout
function generateSingleWebsiteLayout(
    template: SnapshotTemplate,
    websiteAnalysis: WebsiteAnalysis,
    title: string,
    description: string,
    width: number,
    height: number
): string {
    const screenshot = websiteAnalysis.websiteData.screenshot
    const websiteTitle = websiteAnalysis.websiteData.title
    const websiteUrl = websiteAnalysis.websiteData.url

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <!-- Background -->
    <rect width="100%" height="100%" fill="${template.colors.background}"/>
    
    <!-- Header Section -->
    <rect x="0" y="0" width="100%" height="${height * 0.12}" fill="${template.colors.primary}" opacity="0.1"/>
    
    <!-- Header Title -->
    <text x="50%" y="${height * 0.06}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="32" font-family="Arial, sans-serif" font-weight="bold">
        ${websiteTitle}
    </text>
    
    <!-- Main Screenshot -->
    <image href="data:image/png;base64,${screenshot}" 
           x="${width * 0.05}" y="${height * 0.15}" 
           width="${width * 0.4}" height="${height * 0.5}" 
           preserveAspectRatio="xMidYMid slice"/>
    
    <!-- Website Details -->
    <rect x="${width * 0.5}" y="${height * 0.15}" width="${width * 0.45}" height="${height * 0.5}" 
          fill="${template.colors.secondary}" opacity="0.05" rx="15"/>
    
    <!-- Website URL -->
    <text x="${width * 0.725}" y="${height * 0.22}" text-anchor="middle" fill="${template.colors.secondary}" 
          font-size="16" font-family="Arial, sans-serif">
        ${websiteUrl}
    </text>
    
    <!-- Category -->
    <text x="${width * 0.725}" y="${height * 0.28}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="20" font-family="Arial, sans-serif" font-weight="bold">
        ${websiteAnalysis.analysis.category}
    </text>
    
    <!-- Purpose -->
    <text x="${width * 0.725}" y="${height * 0.35}" text-anchor="middle" fill="${template.colors.accent}" 
          font-size="18" font-family="Arial, sans-serif">
        ${websiteAnalysis.analysis.purpose}
    </text>
    
    <!-- Features Section -->
    <text x="${width * 0.725}" y="${height * 0.42}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="16" font-family="Arial, sans-serif" font-weight="bold">
        Key Features:
    </text>
    
    ${websiteAnalysis.analysis.keyFeatures.slice(0, 5).map((feature, index) => `
        <text x="${width * 0.725}" y="${height * (0.48 + index * 0.04)}" text-anchor="middle" 
              fill="${template.colors.secondary}" font-size="14" font-family="Arial, sans-serif">
            • ${feature}
        </text>
    `).join('')}
    
    <!-- Bottom Info -->
    <rect x="${width * 0.05}" y="${height * 0.7}" width="${width * 0.9}" height="${height * 0.25}" 
          fill="${template.colors.primary}" opacity="0.05" rx="10"/>
    
    <!-- Target Audience -->
    <text x="50%" y="${height * 0.78}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="18" font-family="Arial, sans-serif" font-weight="bold">
        Target Audience: ${websiteAnalysis.analysis.targetAudience}
    </text>
    
    <!-- Technology -->
    <text x="50%" y="${height * 0.85}" text-anchor="middle" fill="${template.colors.secondary}" 
          font-size="16" font-family="Arial, sans-serif">
        Technology: ${websiteAnalysis.analysis.technologyIndicators.join(', ')}
    </text>
    
    <!-- Design Style -->
    <text x="50%" y="${height * 0.92}" text-anchor="middle" fill="${template.colors.accent}" 
          font-size="16" font-family="Arial, sans-serif">
        Design: ${websiteAnalysis.analysis.designStyle}
    </text>
    
    <!-- Style Badge -->
    <rect x="20" y="20" width="120" height="30" rx="15" fill="${template.colors.primary}" opacity="0.9"/>
    <text x="80" y="40" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif" font-weight="bold">
        Single Site
    </text>
    
    <!-- Aspect Ratio Badge -->
    <rect x="160" y="20" width="80" height="30" rx="15" fill="${template.colors.accent}" opacity="0.9"/>
    <text x="200" y="40" text-anchor="middle" fill="white" font-size="12" font-family="Arial, sans-serif" font-weight="bold">
        ${template.aspectRatio}
    </text>
</svg>`

    const base64 = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64}`
}

// Legacy placeholder image generation (for backward compatibility)
function generatePlaceholderImage(
    template: SnapshotTemplate,
    title: string,
    description: string,
    content: string[]
): string {
    const [width, height] = getDimensionsFromAspectRatio(template.aspectRatio)

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <!-- Background -->
    <rect width="100%" height="100%" fill="${template.colors.background}"/>
    
    <!-- Gradient overlay -->
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${template.colors.primary};stop-opacity:0.15" />
            <stop offset="50%" style="stop-color:${template.colors.secondary};stop-opacity:0.08" />
            <stop offset="100%" style="stop-color:${template.colors.accent};stop-opacity:0.05" />
        </linearGradient>
    </defs>
    
    <!-- Gradient background -->
    <rect width="100%" height="100%" fill="url(#grad)"/>
    
    <!-- Main content area -->
    <rect x="${width * 0.1}" y="${height * 0.15}" width="${width * 0.8}" height="${height * 0.7}" 
          fill="white" opacity="0.95" rx="20"/>
    
    <!-- Title -->
    <text x="50%" y="${height * 0.35}" text-anchor="middle" fill="${template.colors.text}" 
          font-size="48" font-family="Arial, sans-serif" font-weight="bold">
        ${title}
    </text>
    
    <!-- Description -->
    <text x="50%" y="${height * 0.5}" text-anchor="middle" fill="${template.colors.secondary}" 
          font-size="24" font-family="Arial, sans-serif">
        ${description}
    </text>
    
    <!-- Content items -->
    ${content.map((item, index) => `
        <text x="50%" y="${height * (0.6 + index * 0.08)}" text-anchor="middle" 
              fill="${template.colors.accent}" font-size="18" font-family="Arial, sans-serif">
            ${item}
        </text>
    `).join('')}
    
    <!-- Style badge -->
    <rect x="20" y="20" width="120" height="30" rx="15" fill="${template.colors.primary}" opacity="0.9"/>
    <text x="80" y="40" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif" font-weight="bold">
        ${template.style}
    </text>
    
    <!-- Aspect ratio badge -->
    <rect x="160" y="20" width="80" height="30" rx="15" fill="${template.colors.accent}" opacity="0.9"/>
    <text x="200" y="40" text-anchor="middle" fill="white" font-size="12" font-family="Arial, sans-serif" font-weight="bold">
        ${template.aspectRatio}
    </text>
</svg>`

    const base64 = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64}`
}

function generateSnapshotContent(analysis: WebsiteAnalysis['analysis'], template: SnapshotTemplate): string[] {
    const content: string[] = []

    // Add key features
    if (analysis.keyFeatures.length > 0) {
        content.push(...analysis.keyFeatures.slice(0, 2))
    }

    // Add category and target audience
    if (analysis.category) {
        content.push(analysis.category)
    }

    if (analysis.targetAudience) {
        content.push(analysis.targetAudience)
    }

    // Add technology indicators if available
    if (analysis.technologyIndicators.length > 0) {
        content.push(...analysis.technologyIndicators.slice(0, 2))
    }

    return content
}

// Helper function to get dimensions from aspect ratio
function getDimensionsFromAspectRatio(aspectRatio: string): [number, number] {
    switch (aspectRatio) {
        case '16:9':
            return [1200, 675]
        case '4:3':
            return [1200, 900]
        case '1:1':
            return [1200, 1200]
        case '3:2':
            return [1200, 800]
        default:
            return [1200, 675]
    }
}

// Function to regenerate a specific snapshot
export function regenerateSnapshot(
    snapshotId: string,
    request: SnapshotGenerationRequest
): GeneratedSnapshot {
    // Find the template based on the snapshot ID
    const templateId = snapshotId.split('-').pop()
    const template = ALL_TEMPLATES.find(t => t.id === templateId)

    if (!template) {
        throw new Error('Template not found for snapshot')
    }

    return generateSnapshotFromTemplate(request.websiteAnalysis, template, request)
} 