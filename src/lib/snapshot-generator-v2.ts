import type { WebsiteAnalysis } from './website-analyzer'
import type { TemplateProps, GeneratedSnapshot, Template, SnapshotGenerationRequest } from '@/types'
import { renderTemplateToHTMLString } from './templates/template-renderer-server'
import { getAllTemplates } from './templates/template-registry'

/**
 * Generate multiple snapshot variations using HTML templates
 */
export function generateSnapshotVariations(
    request: SnapshotGenerationRequest
): GeneratedSnapshot[] {
    const { websiteAnalysis, style, aspectRatio } = request

    // Get all available templates
    const allTemplates = getAllTemplates()

    // Filter templates based on request
    let selectedTemplates = allTemplates

    if (style) {
        selectedTemplates = selectedTemplates.filter(template => template.style === style)
    }

    if (aspectRatio) {
        selectedTemplates = selectedTemplates.filter(template => template.aspectRatio === aspectRatio)
    }

    // If no templates match, use all templates
    if (selectedTemplates.length === 0) {
        selectedTemplates = allTemplates
    }

    // Limit to 4 variations
    const templatesToUse = selectedTemplates.slice(0, 4)

    return templatesToUse.map(template =>
        generateSnapshotFromTemplate(websiteAnalysis, template, request)
    )
}

/**
 * Generate a single snapshot from template
 */
function generateSnapshotFromTemplate(
    websiteAnalysis: WebsiteAnalysis,
    template: Template,
    request: SnapshotGenerationRequest
): GeneratedSnapshot {
    const { customTitle, customDescription } = request

    // Prepare template data
    const templateData: TemplateProps = {
        title: customTitle ?? websiteAnalysis.websiteData.title,
        screenshot: websiteAnalysis.websiteData.screenshot,
        features: websiteAnalysis.websiteData.features,
        category: websiteAnalysis.websiteData.category,
        targetAudience: websiteAnalysis.websiteData.targetAudience,
        technology: websiteAnalysis.analysis.technologyIndicators ?? [],
        designStyle: websiteAnalysis.analysis.designStyle ?? 'Modern',
        url: websiteAnalysis.websiteData.url,
        timestamp: new Date(),
        description: customDescription ?? websiteAnalysis.websiteData.description,
        purpose: websiteAnalysis.websiteData.purpose,
        valueProposition: websiteAnalysis.analysis.valueProposition ?? ''
    }

    // Generate HTML content
    const htmlContent = renderTemplateToHTMLString(template.id, templateData)

    return {
        id: `${template.id}-${Date.now()}`,
        title: templateData.title,
        description: templateData.description ?? 'Portfolio snapshot',
        htmlContent,
        style: template.style,
        aspectRatio: template.aspectRatio,
        timestamp: new Date(),
        template,
        data: templateData
    } as GeneratedSnapshot
}

/**
 * Regenerate a specific snapshot
 */
export function regenerateSnapshot(
    snapshotId: string,
    request: SnapshotGenerationRequest
): GeneratedSnapshot {
    // Extract template ID from snapshot ID
    const templateId = snapshotId.split('-').slice(0, -1).join('-')

    // Find the template
    const allTemplates = getAllTemplates()
    const template = allTemplates.find(t => t.id === templateId)

    if (!template) {
        throw new Error(`Template not found: ${templateId}`)
    }

    return generateSnapshotFromTemplate(request.websiteAnalysis, template, request)
}

/**
 * Generate a single snapshot with specific template
 */
export function generateSingleSnapshot(
    request: SnapshotGenerationRequest,
    templateId?: string
): GeneratedSnapshot {
    const { websiteAnalysis } = request

    let template: Template

    if (templateId) {
        const allTemplates = getAllTemplates()
        template = allTemplates.find(t => t.id === templateId)!

        if (!template) {
            throw new Error(`Template not found: ${templateId}`)
        }
    } else {
        // Use first available template
        const allTemplates = getAllTemplates()
        template = allTemplates[0]!
    }

    return generateSnapshotFromTemplate(websiteAnalysis, template, request)
} 