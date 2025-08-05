import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { analyzeTextInputEnhanced } from '@/lib/text-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { text: string, urls: string[], hasImages: boolean }
    const { text, urls, hasImages } = body

    // Validate input
    if (!text && (!urls || urls.length === 0) && !hasImages) {
      return NextResponse.json(
        { error: 'Please provide text, URLs, or images to analyze' },
        { status: 400 }
      )
    }

    // Combine text and URLs for analysis
    const combinedText = [
      text || '',
      ...(urls || []).map((url: string) => url)
    ].filter(Boolean).join('\n')

    // For now, we'll simulate image analysis
    // In a full implementation, you'd handle actual image files
    const mockImages: File[] = hasImages ? [new File([''], 'mock-image.png')] : []

    // Perform AI-enhanced analysis
    const result = await analyzeTextInputEnhanced(combinedText, mockImages)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in text analysis API:', error)
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    )
  }
} 