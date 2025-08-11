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
        console.log(`🚀 [TEMP-STORAGE] Initializing TempImageStorage...`)
        this.storageDir = join(process.cwd(), 'temp', 'images')
        this.baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        console.log(`📁 [TEMP-STORAGE] Storage directory set to: ${this.storageDir}`)
        console.log(`🌐 [TEMP-STORAGE] Base URL set to: ${this.baseUrl}`)
        console.log(`🏠 [TEMP-STORAGE] Current working directory: ${process.cwd()}`)

        void this.ensureStorageDir()
        this.startCleanupInterval()
        console.log(`✅ [TEMP-STORAGE] TempImageStorage initialized successfully`)
    }

    async ensureStorageDir() {
        try {
            console.log(`📂 [TEMP-STORAGE] Checking if storage directory exists: ${this.storageDir}`)
            if (!existsSync(this.storageDir)) {
                console.log(`📂 [TEMP-STORAGE] Storage directory does not exist, creating...`)
                await mkdir(this.storageDir, { recursive: true })
                console.log(`✅ [TEMP-STORAGE] Successfully created storage directory: ${this.storageDir}`)
            } else {
                console.log(`✅ [TEMP-STORAGE] Storage directory already exists: ${this.storageDir}`)
            }
        } catch (error) {
            console.error(`❌ [TEMP-STORAGE] Error creating storage directory:`, error)
            console.error(`❌ [TEMP-STORAGE] Directory path: ${this.storageDir}`)
            console.error(`❌ [TEMP-STORAGE] Error details:`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace'
            })
        }
    }

    /**
 * Save a base64 image to temporary storage
 */
    async saveBase64Image(base64Data: string, filename?: string): Promise<TempImageInfo> {
        try {
            console.log(`🖼️ [TEMP-STORAGE] Starting to save base64 image...`)
            console.log(`📁 [TEMP-STORAGE] Storage directory: ${this.storageDir}`)
            console.log(`🌐 [TEMP-STORAGE] Base URL: ${this.baseUrl}`)

            // Remove data URL prefix if present
            const base64Content = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
            console.log(`📊 [TEMP-STORAGE] Base64 content length: ${base64Content.length} characters`)

            // Generate unique ID
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            const extension = this.getImageExtension(base64Data)
            const fileName = filename ? `${filename}-${id}.${extension}` : `${id}.${extension}`
            const filePath = join(this.storageDir, fileName)

            console.log(`🆔 [TEMP-STORAGE] Generated ID: ${id}`)
            console.log(`📄 [TEMP-STORAGE] File name: ${fileName}`)
            console.log(`📍 [TEMP-STORAGE] Full file path: ${filePath}`)

            // Ensure storage directory exists
            console.log(`📂 [TEMP-STORAGE] Ensuring storage directory exists...`)
            await this.ensureStorageDir()

            // Write file
            console.log(`💾 [TEMP-STORAGE] Writing file to disk...`)
            await writeFile(filePath, Buffer.from(base64Content, 'base64'))
            console.log(`✅ [TEMP-STORAGE] File successfully written to disk`)

            const imageInfo: TempImageInfo = {
                id,
                url: `${this.baseUrl}/api/temp-images/${fileName}`,
                filePath,
                createdAt: new Date()
            }

            console.log(`🎯 [TEMP-STORAGE] Image info created:`)
            console.log(`   - ID: ${imageInfo.id}`)
            console.log(`   - URL: ${imageInfo.url}`)
            console.log(`   - File Path: ${imageInfo.filePath}`)
            console.log(`   - Created At: ${imageInfo.createdAt.toISOString()}`)

            console.log(`✅ [TEMP-STORAGE] Successfully saved temporary image: ${imageInfo.url} (${fileName})`)
            return imageInfo
        } catch (error) {
            console.error(`❌ [TEMP-STORAGE] Error saving temporary image:`, error)
            console.error(`❌ [TEMP-STORAGE] Error details:`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace',
                storageDir: this.storageDir,
                baseUrl: this.baseUrl
            })
            throw new Error('Failed to save temporary image')
        }
    }

    /**
 * Save multiple base64 images and return their info
 */
    async saveMultipleImages(images: Record<string, string>): Promise<Record<string, TempImageInfo>> {
        console.log(`🖼️ [TEMP-STORAGE] Starting to save multiple images...`)
        console.log(`📊 [TEMP-STORAGE] Number of images to save: ${Object.keys(images).length}`)
        console.log(`🔑 [TEMP-STORAGE] Image keys: ${Object.keys(images).join(', ')}`)

        const results: Record<string, TempImageInfo> = {}

        for (const [key, base64Data] of Object.entries(images)) {
            if (base64Data) {
                console.log(`🔄 [TEMP-STORAGE] Processing image key: ${key}`)
                results[key] = await this.saveBase64Image(base64Data, key)
                console.log(`✅ [TEMP-STORAGE] Completed processing image key: ${key}`)
            } else {
                console.log(`⚠️ [TEMP-STORAGE] Skipping image key: ${key} (no base64 data)`)
            }
        }

        console.log(`🎯 [TEMP-STORAGE] Successfully saved ${Object.keys(results).length} images`)
        return results
    }

    /**
     * Delete a temporary image
     */
    async deleteImage(imageInfo: TempImageInfo): Promise<void> {
        try {
            console.log(`🗑️ [TEMP-STORAGE] Attempting to delete temporary image: ${imageInfo.url}`)
            console.log(`📍 [TEMP-STORAGE] File path to delete: ${imageInfo.filePath}`)

            await unlink(imageInfo.filePath)
            console.log(`✅ [TEMP-STORAGE] Successfully deleted temporary image: ${imageInfo.url}`)
        } catch (error) {
            console.error(`❌ [TEMP-STORAGE] Error deleting temporary image:`, error)
            console.error(`❌ [TEMP-STORAGE] Failed to delete: ${imageInfo.url}`)
            console.error(`❌ [TEMP-STORAGE] File path: ${imageInfo.filePath}`)
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
            console.log(`🧹 [TEMP-STORAGE] Cleanup interval triggered`)
            console.log(`📁 [TEMP-STORAGE] Storage directory: ${this.storageDir}`)
            // This would require reading the directory and checking file timestamps
            // For now, we'll implement this in the API route
            console.log(`ℹ️ [TEMP-STORAGE] Cleanup logic implemented in API route`)
        } catch (error) {
            console.error(`❌ [TEMP-STORAGE] Error during cleanup:`, error)
            console.error(`❌ [TEMP-STORAGE] Cleanup failed for directory: ${this.storageDir}`)
        }
    }

    /**
     * Start cleanup interval (runs every 30 minutes)
     */
    private startCleanupInterval(): void {
        console.log(`⏰ [TEMP-STORAGE] Starting cleanup interval (every 30 minutes)`)
        this.cleanupInterval = setInterval(() => {
            console.log(`⏰ [TEMP-STORAGE] Cleanup interval triggered at ${new Date().toISOString()}`)
            void this.cleanupOldImages()
        }, 30 * 60 * 1000) // 30 minutes
        console.log(`✅ [TEMP-STORAGE] Cleanup interval started successfully`)
    }

    /**
     * Stop cleanup interval
     */
    stopCleanupInterval(): void {
        if (this.cleanupInterval) {
            console.log(`⏹️ [TEMP-STORAGE] Stopping cleanup interval`)
            clearInterval(this.cleanupInterval)
            this.cleanupInterval = null
            console.log(`✅ [TEMP-STORAGE] Cleanup interval stopped successfully`)
        } else {
            console.log(`ℹ️ [TEMP-STORAGE] No cleanup interval to stop`)
        }
    }

    /**
     * Get image extension from base64 data URL
     */
    private getImageExtension(base64Data: string): string {
        const match = /^data:image\/([a-z]+);base64,/.exec(base64Data)
        const extension = match?.[1]
        if (extension) {
            console.log(`🔍 [TEMP-STORAGE] Extracted image extension: ${extension}`)
            return extension
        }
        console.log(`🔍 [TEMP-STORAGE] No extension found in base64 data, defaulting to: png`)
        return 'png'
    }
}

// Export singleton instance
console.log(`📦 [TEMP-STORAGE] Creating and exporting singleton instance...`)
export const tempImageStorage = new TempImageStorage()
console.log(`📦 [TEMP-STORAGE] Singleton instance exported successfully`)

// Cleanup on process exit
process.on('exit', () => {
    console.log(`🛑 [TEMP-STORAGE] Process exit detected, cleaning up...`)
    tempImageStorage.stopCleanupInterval()
})

process.on('SIGINT', () => {
    console.log(`🛑 [TEMP-STORAGE] SIGINT received, cleaning up...`)
    tempImageStorage.stopCleanupInterval()
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log(`🛑 [TEMP-STORAGE] SIGTERM received, cleaning up...`)
    tempImageStorage.stopCleanupInterval()
    process.exit(0)
}) 