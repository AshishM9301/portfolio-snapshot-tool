"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataLostMessage } from "@/components/ui/data-lost-message"
import { FullscreenPreview, SnapshotPreview } from "@/components/ui/snapshot-preview"
import { downloadSnapshotAsPNG } from "@/lib/download-utils"
import { useSnapshotStore } from "@/lib/stores/snapshot-store"
import { api } from "@/trpc/react"
import type { GeneratedSnapshot, JobStatusJson } from "@/types"
import { ArrowLeft, Download, Home, RefreshCw } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { JobStatus } from "../_components/job-status"


export default function SnapshotsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    </div>
                }>
                    <SnapshotsContent />
                </Suspense>
            </div>
        </div>
    )
}

function SnapshotsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { snapshots, currentUrl, hasGenerated, setSnapshots, setIsGenerating } = useSnapshotStore()
    const [selectedSnapshot, setSelectedSnapshot] = useState<GeneratedSnapshot | null>(null)
    const [fullscreenOpen, setFullscreenOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Job status states
    const [jobIds, setJobIds] = useState<string[]>([])
    const [isStartingJob, setIsStartingJob] = useState(false)

    // Check if data is lost on page load
    const [isDataLost, setIsDataLost] = useState(false)

    console.log(isDownloading)

    // Get job IDs from URL parameters
    useEffect(() => {
        const jobsParam = searchParams.get('jobs')
        if (jobsParam) {
            const jobIdsFromUrl = jobsParam.split(',').filter(id => id.trim())
            setJobIds(jobIdsFromUrl)
            // If we have job IDs, don't show data lost
            if (jobIdsFromUrl.length > 0) {
                setIsDataLost(false)
            }
        }
    }, [searchParams])

    useEffect(() => {
        // Check if we have snapshots in store (only if no active jobs)
        // Only show data lost if we have no jobs AND no snapshots
        console.log('Data lost check:', { jobIds: jobIds.length, snapshots: snapshots.length, isDataLost })
        if (jobIds.length === 0 && snapshots.length === 0) {
            setIsDataLost(true)
        } else {
            setIsDataLost(false)
        }
    }, [snapshots.length, jobIds.length])

    // Start batch job for snapshot generation
    const startBatchJob = async () => {
        if (!currentUrl) {
            router.push('/')
            return
        }

        setIsStartingJob(true)
        try {
            const res = await fetch('/api/batch-snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: [currentUrl] }),
            })
            const data = await res.json() as { error?: string; jobIds?: string[] }
            if (!res.ok) throw new Error(data.error ?? 'Failed to start batch')
            if (data.jobIds) {
                setJobIds(data.jobIds)
                setIsDataLost(false)
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Failed to start batch job:', errorMessage)
        } finally {
            setIsStartingJob(false)
        }
    }

    // Convert job result to snapshot when completed
    const convertJobResultToSnapshot = async (jobId: string, resultUrl: string) => {
        try {
            // Get the URL for this specific job
            const jobUrl = await getJobUrl(jobId)

            // Create a snapshot from the job result
            const snapshot: GeneratedSnapshot = {
                id: `job-${jobId}`,
                title: `Snapshot from ${jobUrl}`,
                description: 'AI-generated portfolio snapshot',
                htmlContent: `<img src="${resultUrl}" alt="Generated Snapshot" style="width: 100%; height: auto;" />`,
                pngUrl: resultUrl,
                style: 'professional',
                aspectRatio: '16:9',
                timestamp: new Date(),
                template: {
                    id: 'job-generated',
                    name: 'Job Generated Template',
                    description: 'AI-generated portfolio template from job',
                    style: 'professional',
                    aspectRatio: '16:9',
                    colors: {
                        primary: '#3B82F6',
                        secondary: '#1F2937',
                        accent: '#10B981',
                        background: '#FFFFFF',
                        text: '#1F2937'
                    }
                },
                data: {
                    title: `Snapshot from ${jobUrl}`,
                    description: 'AI-generated portfolio snapshot',
                    screenshot: resultUrl,
                    features: [],
                    category: '',
                    targetAudience: '',
                    technology: [],
                    designStyle: 'professional',
                    url: jobUrl,
                    timestamp: new Date(),
                    purpose: '',
                    valueProposition: ''
                }
            }

            // Add to existing snapshots instead of replacing
            setSnapshots([...snapshots, snapshot])
        } catch (error) {
            console.error('Failed to convert job result to snapshot:', error)
        }
    }

    // Helper function to get job URL
    const getJobUrl = async (jobId: string): Promise<string> => {
        try {
            const response = await fetch(`/api/job-status/${jobId}`)
            if (response.ok) {
                const data = await response.json() as { url?: string }
                return data.url ?? 'Unknown URL'
            }
        } catch (error) {
            console.error('Failed to get job URL:', error)
        }
        return 'Unknown URL'
    }

    const handleRegenerate = async () => {
        if (!currentUrl) {
            router.push('/')
            return
        }

        setIsGenerating(true)
        await startBatchJob()
    }

    const handleGoHome = () => {
        router.push('/')
    }

    // const handleSnapshotSelect = (snapshot: GeneratedSnapshot) => {
    //     setSelectedSnapshot(snapshot)
    // }

    const handleDownload = async (snapshot: GeneratedSnapshot) => {
        try {
            setIsDownloading(true)
            await downloadSnapshotAsPNG(snapshot)
        } catch (error) {
            console.error('Download failed:', error)
            // You could show a toast notification here
        } finally {
            setIsDownloading(false)
        }
    }

    const handlePreview = (snapshot: GeneratedSnapshot) => {
        setSelectedSnapshot(snapshot)
        setFullscreenOpen(true)
    }

    const handleCloseFullscreen = () => {
        setFullscreenOpen(false)
        setSelectedSnapshot(null)
    }

    if (isDataLost) {
        return (
            <DataLostMessage
                onRegenerate={handleRegenerate}
                isRegenerating={false}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGoHome}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Generated Snapshots</h1>
                            {jobIds.length > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Processing {jobIds.length} URL{jobIds.length > 1 ? 's' : ''}
                                    {currentUrl && jobIds.length === 1 && `: ${currentUrl}`}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleRegenerate}
                            disabled={isStartingJob || jobIds.length > 0}
                            className="flex items-center gap-2"
                        >
                            {isStartingJob ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Regenerate
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Job Status Section */}
                {jobIds.length > 0 && (
                    <Card className="p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Generation Progress</h2>
                        <div className="space-y-4">
                            {jobIds.map((jobId, idx) => (
                                <JobStatus
                                    key={jobId}
                                    jobId={jobId}
                                    url={`Job ${idx + 1}`} // Will be updated by JobStatus component
                                    onComplete={convertJobResultToSnapshot}
                                />
                            ))}
                        </div>
                    </Card>
                )}

                {/* Snapshots Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {snapshots.map((snapshot) => (
                        <SnapshotPreview
                            key={snapshot.id}
                            snapshot={snapshot}
                            onDownload={handleDownload}
                            onPreview={handlePreview}
                            className="h-full"
                        />
                    ))}
                </div> */}

                {/* Empty State */}
                {snapshots.length === 0 && !isDataLost && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Download className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        No Snapshots Generated
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        Generate some snapshots to see them here
                                    </p>
                                </div>
                                <Button onClick={handleGoHome}>
                                    <Home className="w-4 h-4 mr-2" />
                                    Go to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {false && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                <p className="text-gray-600">Generating snapshots...</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Fullscreen Preview */}
            {selectedSnapshot && (
                <FullscreenPreview
                    snapshot={selectedSnapshot}
                    isOpen={fullscreenOpen}
                    onClose={handleCloseFullscreen}
                />
            )}
        </div>
    )
} 