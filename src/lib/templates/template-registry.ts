import type { Template } from '@/types'
import {
    MultiWebsiteTemplate,
    SingleWebsiteTemplate,
    CreativePortfolioTemplate,
    ProfessionalTemplate
} from './portfolio-templates'

export const TEMPLATES: Record<string, Template> = {
    'portfolio-multi': {
        id: 'portfolio-multi',
        name: 'Multi-Website Portfolio',
        description: 'Showcase multiple websites in a professional portfolio layout',
        style: 'portfolio-multi',
        aspectRatio: '16:9',
        colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#06b6d4',
            background: '#ffffff',
            text: '#1f2937'
        }
    },
    'portfolio-single': {
        id: 'portfolio-single',
        name: 'Single Website Portfolio',
        description: 'Detailed view of one website with comprehensive information',
        style: 'portfolio-single',
        aspectRatio: '16:9',
        colors: {
            primary: '#059669',
            secondary: '#0d9488',
            accent: '#7c3aed',
            background: '#ffffff',
            text: '#1f2937'
        }
    },
    'creative': {
        id: 'creative',
        name: 'Creative Portfolio',
        description: 'Modern creative design with artistic elements',
        style: 'creative',
        aspectRatio: '16:9',
        colors: {
            primary: '#8b5cf6',
            secondary: '#7c3aed',
            accent: '#06b6d4',
            background: '#f8fafc',
            text: '#1e293b'
        }
    },
    'professional': {
        id: 'professional',
        name: 'Professional Template',
        description: 'Clean, corporate-style layout for business presentations',
        style: 'professional',
        aspectRatio: '16:9',
        colors: {
            primary: '#2563eb',
            secondary: '#1e40af',
            accent: '#3b82f6',
            background: '#ffffff',
            text: '#1f2937'
        }
    }
}

export const TEMPLATE_COMPONENTS = {
    'portfolio-multi': MultiWebsiteTemplate,
    'portfolio-single': SingleWebsiteTemplate,
    'creative': CreativePortfolioTemplate,
    'professional': ProfessionalTemplate
}

export function getTemplate(id: string): Template | undefined {
    return TEMPLATES[id]
}

export function getTemplateComponent(id: string) {
    return TEMPLATE_COMPONENTS[id as keyof typeof TEMPLATE_COMPONENTS]
}

export function getAllTemplates(): Template[] {
    return Object.values(TEMPLATES)
}

export function getTemplatesByStyle(style: string): Template[] {
    return getAllTemplates().filter(template => template.style === style)
} 