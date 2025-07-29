// Main template renderer that exports functions from both client and server versions
// This avoids the react-dom/server import issue in client contexts

export {
    getTemplateCSS,
    getTemplateComponentForClient,
    getTemplateForClient
} from './template-renderer-client'

// Server-side functions are only exported when needed
export type { TemplateProps, Template } from '@/types' 