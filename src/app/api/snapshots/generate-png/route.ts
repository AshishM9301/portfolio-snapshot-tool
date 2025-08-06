import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generatePNGWithAspectRatio, validateHTML, optimizeHTMLForPNG } from '@/lib/png-generator'

interface PNGGenerationRequest {
    html: string
    aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2'
    format?: 'png' | 'jpeg'
    quality?: number
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as PNGGenerationRequest
        const { html, aspectRatio = '16:9', format = 'png', quality = 90 } = body

        // Validate input
        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 }
            )
        }

        if (!validateHTML(html)) {
            return NextResponse.json(
                { error: 'Invalid HTML content' },
                { status: 400 }
            )
        }

        // Optimize HTML for PNG generation
        const optimizedHTML = optimizeHTMLForPNG(html)

        // Generate PNG
        const result = await generatePNGWithAspectRatio(optimizedHTML, aspectRatio, {
            format,
            quality
        })

        // Return PNG as response
        return new NextResponse(result.buffer.buffer, {
            headers: {
                'Content-Type': `image/${format}`,
                'Content-Length': result.buffer.length.toString(),
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        })

    } catch (error) {
        console.error('Error generating PNG:', error)
        return NextResponse.json(
            { error: 'Failed to generate PNG' },
            { status: 500 }
        )
    }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    })
} 