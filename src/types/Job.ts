export type JobStatusJson = {
    status: 'queued' | 'processing' | 'completed' | 'failed'
    resultUrl?: string
    error?: string
}

export type JobType = 'url' | 'image'

export interface ImageJobData {
    id: string
    name: string
    data: string // base64 encoded image
    type: string // mime type
}

export interface BatchImageSnapshotRequest {
    images: ImageJobData[]
    stylePreferences?: string
    manualPreferences?: {
        title?: string
        description?: string
    }
}

export interface BatchImageSnapshotResponse {
    jobIds: string[]
    error?: string
}