import type { GeneratedSnapshot } from '@/types'

/**
 * Download snapshot as PNG
 */
export async function downloadSnapshotAsPNG(snapshot: GeneratedSnapshot): Promise<void> {
    try {
        // Call the PNG generation API
        const response = await fetch('/api/snapshots/generate-png', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: snapshot.htmlContent,
                aspectRatio: snapshot.aspectRatio,
                format: 'png',
                quality: 90
            })
        })

        if (!response.ok) {
            throw new Error(`Failed to generate PNG: ${response.statusText}`)
        }

        // Get the PNG blob
        const blob = await response.blob()

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `snapshot-${snapshot.style}-${snapshot.aspectRatio}-${Date.now()}.png`

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(url)

    } catch (error) {
        console.error('Error downloading snapshot:', error)
        throw new Error(`Failed to download snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Download multiple snapshots individually
 */
export async function downloadMultipleSnapshots(snapshots: GeneratedSnapshot[]): Promise<void> {
    try {
        // Download each snapshot individually
        for (const snapshot of snapshots) {
            await downloadSnapshotAsPNG(snapshot)
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    } catch (error) {
        console.error('Error downloading multiple snapshots:', error)
        throw new Error(`Failed to download snapshots: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Get PNG URL for snapshot (for preview)
 */
export async function getSnapshotPNGUrl(snapshot: GeneratedSnapshot): Promise<string> {
    try {
        const response = await fetch('/api/snapshots/generate-png', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: snapshot.htmlContent,
                aspectRatio: snapshot.aspectRatio,
                format: 'png',
                quality: 90
            })
        })

        if (!response.ok) {
            throw new Error(`Failed to generate PNG: ${response.statusText}`)
        }

        const blob = await response.blob()
        return URL.createObjectURL(blob)

    } catch (error) {
        console.error('Error getting PNG URL:', error)
        throw new Error(`Failed to get PNG URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Share snapshot (copy to clipboard or social media)
 */
export async function shareSnapshot(snapshot: GeneratedSnapshot): Promise<void> {
    try {
        // Generate PNG first
        const pngUrl = await getSnapshotPNGUrl(snapshot)

        // Try to use native sharing API
        if (navigator.share) {
            await navigator.share({
                title: snapshot.title,
                text: snapshot.description,
                url: pngUrl
            })
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(pngUrl)
            // You could show a toast notification here
            console.log('PNG URL copied to clipboard')
        }

    } catch (error) {
        console.error('Error sharing snapshot:', error)
        throw new Error(`Failed to share snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
} 