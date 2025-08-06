import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readFile, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params
        const filePath = join(process.cwd(), 'temp', 'images', filename)

        // Check if file exists
        if (!existsSync(filePath)) {
            return new NextResponse('Image not found', { status: 404 })
        }

        // Check file age (delete if older than 1 hour)
        const fileStats = await stat(filePath)
        const fileAge = Date.now() - fileStats.mtime.getTime()
        const maxAge = 60 * 60 * 1000 // 1 hour

        if (fileAge > maxAge) {
            // Delete old file
            try {
                await unlink(filePath)
                console.log(`Deleted old temporary image: ${filename}`)
            } catch (error) {
                console.error('Error deleting old file:', error)
            }
            return new NextResponse('Image expired', { status: 410 })
        }

        // Read and serve the file
        const fileBuffer = await readFile(filePath)

        // Determine content type based on file extension
        const extension = filename.split('.').pop()?.toLowerCase()
        let contentType = 'image/png'

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg'
                break
            case 'webp':
                contentType = 'image/webp'
                break
            case 'gif':
                contentType = 'image/gif'
                break
            default:
                contentType = 'image/png'
        }

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })

    } catch (error) {
        console.error('Error serving temporary image:', error)
        return new NextResponse('Internal server error', { status: 500 })
    }
} 