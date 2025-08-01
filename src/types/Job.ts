export type JobStatusJson = {
    status: 'queued' | 'processing' | 'completed' | 'failed'
    resultUrl?: string
    error?: string
}