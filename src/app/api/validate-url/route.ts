import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json(
            { error: 'URL parameter is required' },
            { status: 400 }
        )
    }

    try {
        // Validate URL format
        const urlObj = new URL(url)

        if (!urlObj.hostname) {
            return NextResponse.json({
                isAccessible: false,
                error: 'Invalid URL format'
            })
        }

        // Actually test if the URL is accessible by making a request
        try {
            const response = await fetch(url, {
                method: 'HEAD', // Use HEAD request to avoid downloading full content
                cache: 'no-cache',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; PortfolioSnapshotTool/1.0)'
                },
                // Add timeout to avoid hanging requests
                signal: AbortSignal.timeout(10000) // 10 second timeout
            })

            return NextResponse.json({
                isAccessible: response.ok,
                status: response.status,
                error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
            })
        } catch (fetchError) {
            // If fetch fails, try a different approach - check DNS resolution
            try {
                const dnsResponse = await fetch(`https://dns.google/resolve?name=${urlObj.hostname}`)
                if (dnsResponse.ok) {
                    const dnsData = await dnsResponse.json() as { Answer?: unknown[] }
                    const hasValidRecords = dnsData.Answer && dnsData.Answer.length > 0

                    return NextResponse.json({
                        isAccessible: hasValidRecords,
                        status: hasValidRecords ? 200 : 404,
                        error: hasValidRecords ? undefined : 'Domain not found or not accessible'
                    })
                }
            } catch {
                // If DNS check also fails, return false
                return NextResponse.json({
                    isAccessible: false,
                    error: fetchError instanceof Error ? fetchError.message : 'Failed to validate URL'
                })
            }
        }

    } catch (error) {
        return NextResponse.json({
            isAccessible: false,
            error: error instanceof Error ? error.message : 'Failed to validate URL'
        })
    }
} 