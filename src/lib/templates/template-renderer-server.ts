import React from 'react'
import type { TemplateProps, Template } from '@/types'
import { getTemplateComponent, getTemplate } from './template-registry'

// CSS for all portfolio templates
const PORTFOLIO_CSS = `
  /* Reset and base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background: #ffffff;
  }

  /* Multi-Website Portfolio Template */
  .portfolio-multi {
    width: 1200px;
    height: 675px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .portfolio-multi .header {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 40px;
    text-align: center;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }

  .portfolio-multi .title {
    font-size: 36px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .portfolio-multi .subtitle {
    font-size: 18px;
    color: #6b7280;
  }

  .portfolio-multi .content {
    flex: 1;
    display: flex;
    padding: 30px 40px;
    gap: 30px;
    overflow: hidden;
    min-height: 0;
  }

  .portfolio-multi .screenshot-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-width: 0;
  }

  .portfolio-multi .website-screenshot {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    max-width: 100%;
    overflow: hidden;
    display: block;
  }

  .portfolio-multi .screenshot-placeholder {
    width: 100%;
    height: 300px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .portfolio-multi .info-section {
    flex: 1;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .portfolio-multi .website-title {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .portfolio-multi .website-url {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 20px;
  }

  .portfolio-multi .features-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 15px;
  }

  .portfolio-multi .features-list {
    list-style: none;
  }

  .portfolio-multi .feature-item {
    font-size: 16px;
    color: #374151;
    margin-bottom: 8px;
    padding-left: 10px;
  }

  .portfolio-multi .footer {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 40px;
    text-align: center;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
  }

  .portfolio-multi .footer-title {
    font-size: 20px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .portfolio-multi .footer-description {
    font-size: 16px;
    color: #6b7280;
  }

  .portfolio-multi .badges {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    gap: 10px;
  }

  .portfolio-multi .badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    color: white;
  }

  .portfolio-multi .portfolio-badge {
    background: #6366f1;
  }

  .portfolio-multi .aspect-badge {
    background: #06b6d4;
  }

  /* Single Website Portfolio Template */
  .portfolio-single {
    width: 1200px;
    height: 675px;
    background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .portfolio-single .header {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 40px;
    text-align: center;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }

  .portfolio-single .title {
    font-size: 32px;
    font-weight: bold;
    color: #1f2937;
  }

  .portfolio-single .content {
    flex: 1;
    display: flex;
    padding: 30px 40px;
    gap: 30px;
  }

  .portfolio-single .screenshot-section {
    flex: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .portfolio-single .main-screenshot {
    width: 100%;
    height: 350px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .portfolio-single .details-section {
    flex: 1;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .portfolio-single .website-url {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 15px;
  }

  .portfolio-single .category {
    font-size: 20px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 10px;
  }

  .portfolio-single .purpose {
    font-size: 18px;
    color: #7c3aed;
    margin-bottom: 20px;
  }

  .portfolio-single .features-title {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 15px;
  }

  .portfolio-single .features-list {
    list-style: none;
  }

  .portfolio-single .feature-item {
    font-size: 16px;
    color: #374151;
    margin-bottom: 8px;
    padding-left: 10px;
  }

  .portfolio-single .footer {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 40px;
  }

  .portfolio-single .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .portfolio-single .info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .portfolio-single .info-label {
    font-size: 14px;
    font-weight: bold;
    color: #6b7280;
  }

  .portfolio-single .info-value {
    font-size: 16px;
    color: #1f2937;
  }

  .portfolio-single .badges {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    gap: 10px;
  }

  .portfolio-single .badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    color: white;
  }

  .portfolio-single .single-badge {
    background: #059669;
  }

  .portfolio-single .aspect-badge {
    background: #7c3aed;
  }

  /* Creative Portfolio Template */
  .portfolio-creative {
    width: 1200px;
    height: 675px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .portfolio-creative .creative-header {
    padding: 30px 40px;
    text-align: center;
  }

  .portfolio-creative .creative-title h1 {
    font-size: 42px;
    font-weight: bold;
    color: white;
    margin-bottom: 10px;
  }

  .portfolio-creative .creative-accent {
    width: 60px;
    height: 4px;
    background: #06b6d4;
    margin: 0 auto;
    border-radius: 2px;
  }

  .portfolio-creative .creative-content {
    flex: 1;
    display: flex;
    padding: 0 40px 30px;
    gap: 30px;
    align-items: center;
  }

  .portfolio-creative .creative-screenshot {
    flex: 1;
    position: relative;
  }

  .portfolio-creative .screenshot {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  }

  .portfolio-creative .creative-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
    border-radius: 16px;
  }

  .portfolio-creative .creative-info {
    flex: 1;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }

  .portfolio-creative .creative-subtitle {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 15px;
  }

  .portfolio-creative .creative-description {
    font-size: 16px;
    color: #6b7280;
    margin-bottom: 25px;
    line-height: 1.6;
  }

  .portfolio-creative .creative-features {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .portfolio-creative .creative-feature {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .portfolio-creative .feature-icon {
    font-size: 20px;
    color: #8b5cf6;
  }

  .portfolio-creative .feature-text {
    font-size: 16px;
    color: #374151;
    font-weight: 500;
  }

  .portfolio-creative .creative-footer {
    padding: 20px 40px;
    text-align: center;
  }

  .portfolio-creative .creative-badges {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  .portfolio-creative .creative-badge {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.9);
    color: #8b5cf6;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
  }

  /* Professional Template */
  .portfolio-professional {
    width: 1200px;
    height: 675px;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .portfolio-professional .professional-header {
    background: rgba(255, 255, 255, 0.95);
    padding: 25px 40px;
    text-align: center;
    border-bottom: 3px solid rgba(37, 99, 235, 0.2);
  }

  .portfolio-professional .professional-title {
    font-size: 38px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .portfolio-professional .professional-subtitle {
    font-size: 18px;
    color: #6b7280;
  }

  .portfolio-professional .professional-content {
    flex: 1;
    display: flex;
    padding: 30px 40px;
    gap: 30px;
  }

  .portfolio-professional .professional-screenshot {
    flex: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .portfolio-professional .screenshot {
    width: 100%;
    height: 320px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }

  .portfolio-professional .professional-details {
    flex: 1;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .portfolio-professional .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .portfolio-professional .detail-item:last-child {
    border-bottom: none;
  }

  .portfolio-professional .detail-item label {
    font-weight: bold;
    color: #374151;
    font-size: 14px;
  }

  .portfolio-professional .detail-item span {
    color: #1f2937;
    font-size: 14px;
  }

  .portfolio-professional .professional-features {
    margin-top: 20px;
  }

  .portfolio-professional .professional-features h3 {
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 15px;
  }

  .portfolio-professional .professional-features ul {
    list-style: none;
  }

  .portfolio-professional .professional-features li {
    font-size: 14px;
    color: #374151;
    margin-bottom: 8px;
    padding-left: 15px;
    position: relative;
  }

  .portfolio-professional .professional-features li:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #2563eb;
  }

  .portfolio-professional .professional-footer {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px 40px;
  }

  .portfolio-professional .professional-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .portfolio-professional .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #6b7280;
  }
`

export function renderTemplateToHTML(
    templateId: string,
    data: TemplateProps
): string {
    const template = getTemplate(templateId)
    if (!template) {
        throw new Error(`Template not found: ${templateId}`)
    }

    const Component = getTemplateComponent(templateId)
    if (!Component) {
        throw new Error(`Template component not found: ${templateId}`)
    }

    // Create HTML string without react-dom/server
    const componentHTML = createHTMLFromComponent(Component, data)

    // Wrap with full HTML document
    return wrapWithFullHTML(componentHTML, template)
}

/**
 * Create HTML string from component without react-dom/server
 * This is a simplified approach that generates basic HTML structure
 */
function createHTMLFromComponent(Component: React.ComponentType<TemplateProps>, data: TemplateProps): string {
    // Generate a simple HTML structure based on the template data
    // This is a basic implementation - you might want to enhance this
    const { title, screenshot, features, category, targetAudience, technology, designStyle, url, description, purpose, valueProposition } = data



    // Create a placeholder if no screenshot is available
    const screenshotHtml = screenshot
        ? `<img src="data:image/png;base64,${screenshot}" alt="${title}" class="website-screenshot" style="max-width: 100%; height: auto; object-fit: cover;" />`
        : `<div class="screenshot-placeholder" style="width: 100%; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; border-radius: 12px;">Screenshot not available</div>`

    return `
        <div class="portfolio-template">
            <div class="header">
                <h1 class="title">${title || 'Portfolio Snapshot'}</h1>
                ${description ? `<p class="subtitle">${description}</p>` : ''}
            </div>
            <div class="content">
                <div class="screenshot-section">
                    ${screenshotHtml}
                </div>
                <div class="info-section">
                    <div class="website-url">${url}</div>
                    ${category ? `<div class="category">${category}</div>` : ''}
                    ${purpose ? `<div class="purpose">${purpose}</div>` : ''}
                    ${features && features.length > 0 ? `
                        <div class="features-title">Key Features</div>
                        <ul class="features-list">
                            ${features.map(feature => `<li class="feature-item">${feature}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${technology && technology.length > 0 ? `
                        <div class="tech-title">Technologies</div>
                        <div class="tech-list">
                            ${technology.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `
}

function wrapWithFullHTML(componentHTML: string, template: Template): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.name}</title>
        <style>
          ${PORTFOLIO_CSS}
        </style>
      </head>
      <body>
        ${componentHTML}
      </body>
    </html>
  `
}

export function renderTemplateToHTMLString(
    templateId: string,
    data: TemplateProps
): string {
    try {
        return renderTemplateToHTML(templateId, data)
    } catch (error) {
        console.error('Error rendering template to HTML:', error)
        throw new Error(`Failed to render template ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
} 