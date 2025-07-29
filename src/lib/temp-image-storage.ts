import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface TempImageInfo {
    id: string
    url: string
    filePath: string
    createdAt: Date
}

class TempImageStorage {
    private storageDir: string
    private baseUrl: string
    private cleanupInterval: NodeJS.Timeout | null = null

    constructor() {
        this.storageDir = join(process.cwd(), 'temp', 'images')
        this.baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        void this.ensureStorageDir()
        this.startCleanupInterval()
    }

    async ensureStorageDir() {
        try {
            if (!existsSync(this.storageDir)) {
                await mkdir(this.storageDir, { recursive: true })
                console.log(`Created storage directory: ${this.storageDir}`)
            }
        } catch (error) {
            console.error('Error creating storage directory:', error)
        }
    }

    /**
 * Save a base64 image to temporary storage
 */
    async saveBase64Image(base64Data: string, filename?: string): Promise<TempImageInfo> {
        try {
            // Remove data URL prefix if present
            const base64Content = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')

            // Generate unique ID
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            const extension = this.getImageExtension(base64Data)
            const fileName = filename ? `${filename}-${id}.${extension}` : `${id}.${extension}`
            const filePath = join(this.storageDir, fileName)

            // Ensure storage directory exists
            await this.ensureStorageDir()

            // Write file
            await writeFile(filePath, Buffer.from(base64Content, 'base64'))

            const imageInfo: TempImageInfo = {
                id,
                url: `${this.baseUrl}/api/temp-images/${fileName}`,
                filePath,
                createdAt: new Date()
            }

            console.log(`Saved temporary image: ${imageInfo.url} (${fileName})`)
            return imageInfo
        } catch (error) {
            console.error('Error saving temporary image:', error)
            throw new Error('Failed to save temporary image')
        }
    }

    /**
 * Save multiple base64 images and return their info
 */
    async saveMultipleImages(images: Record<string, string>): Promise<Record<string, TempImageInfo>> {
        const results: Record<string, TempImageInfo> = {}

        for (const [key, base64Data] of Object.entries(images)) {
            if (base64Data) {
                results[key] = await this.saveBase64Image(base64Data, key)
            }
        }

        return results
    }

    /**
     * Delete a temporary image
     */
    async deleteImage(imageInfo: TempImageInfo): Promise<void> {
        try {
            await unlink(imageInfo.filePath)
            console.log(`Deleted temporary image: ${imageInfo.url}`)
        } catch (error) {
            console.error('Error deleting temporary image:', error)
        }
    }

    /**
     * Delete multiple temporary images
     */
    async deleteMultipleImages(imageInfos: TempImageInfo[]): Promise<void> {
        await Promise.all(imageInfos.map(info => this.deleteImage(info)))
    }

    /**
     * Clean up old temporary images (older than 1 hour)
     */
    async cleanupOldImages(): Promise<void> {
        try {
            // This would require reading the directory and checking file timestamps
            // For now, we'll implement this in the API route
            console.log('Cleanup interval triggered')
        } catch (error) {
            console.error('Error during cleanup:', error)
        }
    }

    /**
     * Start cleanup interval (runs every 30 minutes)
     */
    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            void this.cleanupOldImages()
        }, 30 * 60 * 1000) // 30 minutes
    }

    /**
     * Stop cleanup interval
     */
    stopCleanupInterval(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
            this.cleanupInterval = null
        }
    }

    /**
     * Get image extension from base64 data URL
     */
    private getImageExtension(base64Data: string): string {
        const match = /^data:image\/([a-z]+);base64,/.exec(base64Data)
        return match?.[1] ?? 'png'
    }
}

// Export singleton instance
export const tempImageStorage = new TempImageStorage()

// Cleanup on process exit
process.on('exit', () => {
    tempImageStorage.stopCleanupInterval()
})

process.on('SIGINT', () => {
    tempImageStorage.stopCleanupInterval()
    process.exit(0)
})

process.on('SIGTERM', () => {
    tempImageStorage.stopCleanupInterval()
    process.exit(0)
}) 