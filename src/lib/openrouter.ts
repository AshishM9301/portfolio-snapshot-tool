import OpenAI from 'openai'

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// For development, allow missing API key with a warning
if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OPENROUTER_API_KEY environment variable is not set. AI features will not work.')
    console.warn('Get your API key from: https://openrouter.ai/keys')
}

// Initialize OpenAI client with OpenRouter configuration
export const openai = OPENROUTER_API_KEY ? new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Portfolio Snapshot Tool'
    }
}) : null

// Recommended models for vision tasks
export const VISION_MODELS = {
    CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
    GPT_4_VISION: 'openai/gpt-4-vision-preview',
    GEMINI_PRO_VISION: 'google/gemini-pro-vision'
} as const

export type VisionModel = typeof VISION_MODELS[keyof typeof VISION_MODELS]

// Interface for snapshot generation request
export interface SnapshotGenerationRequest {
    url: string
    model?: VisionModel
    style?: 'professional' | 'creative' | 'minimal' | 'modern'
    aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2'
}

// Interface for AI-generated snapshot
export interface GeneratedSnapshot {
    id: string
    imageUrl: string
    description: string
    style: string
    aspectRatio: string
    timestamp: Date
}

// Function to generate snapshots using AI
export async function generateSnapshots(
    screenshotBase64: string,
    url: string,
    model: VisionModel = VISION_MODELS.CLAUDE_3_5_SONNET,
    style = 'professional'
): Promise<GeneratedSnapshot[]> {
    try {
        if (!openai) {
            throw new Error('OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable.')
        }

        const prompt = `Analyze this website screenshot and create 4 different portfolio-ready snapshots with the following specifications:

Style: ${style}
Website URL: ${url}

Requirements:
1. Create 4 different variations with different compositions and styles
2. Each snapshot should be professional and portfolio-ready
3. Focus on the most important elements of the website
4. Ensure good visual hierarchy and composition
5. Make sure text is readable and elements are well-positioned
6. Use different aspect ratios: 16:9, 4:3, 1:1, and 3:2
7. Apply different visual styles: professional, creative, minimal, and modern

For each snapshot, provide:
- A descriptive name
- The style applied
- The aspect ratio used
- A brief description of what makes it portfolio-ready

Generate these as high-quality, professional portfolio snapshots that showcase the website effectively.`

        const response = await openai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${screenshotBase64}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        })

        // Parse the AI response and generate snapshot objects
        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from AI model')
        }

        // For now, we'll create placeholder snapshots
        // In a real implementation, you'd parse the AI response and generate actual images
        const snapshots: GeneratedSnapshot[] = [
            {
                id: `snapshot-${Date.now()}-1`,
                imageUrl: `data:image/png;base64,${screenshotBase64}`,
                description: 'Professional portfolio snapshot with clean layout',
                style: 'professional',
                aspectRatio: '16:9',
                timestamp: new Date()
            },
            {
                id: `snapshot-${Date.now()}-2`,
                imageUrl: `data:image/png;base64,${screenshotBase64}`,
                description: 'Creative snapshot with artistic composition',
                style: 'creative',
                aspectRatio: '4:3',
                timestamp: new Date()
            },
            {
                id: `snapshot-${Date.now()}-3`,
                imageUrl: `data:image/png;base64,${screenshotBase64}`,
                description: 'Minimal design focusing on essential elements',
                style: 'minimal',
                aspectRatio: '1:1',
                timestamp: new Date()
            },
            {
                id: `snapshot-${Date.now()}-4`,
                imageUrl: `data:image/png;base64,${screenshotBase64}`,
                description: 'Modern snapshot with contemporary styling',
                style: 'modern',
                aspectRatio: '3:2',
                timestamp: new Date()
            }
        ]

        return snapshots
    } catch (error) {
        console.error('Error generating snapshots:', error)
        throw new Error('Failed to generate snapshots with AI')
    }
} 