"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataLostMessage } from "@/components/ui/data-lost-message"
import { FullscreenPreview, SnapshotPreview } from "@/components/ui/snapshot-preview"
import { downloadSnapshotAsPNG } from "@/lib/download-utils"
import { useSnapshotStore } from "@/lib/stores/snapshot-store"
import { api } from "@/trpc/react"
import type { GeneratedSnapshot } from "@/types"
import { ArrowLeft, Download, Home, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SnapshotsPage() {
    const router = useRouter()
    const { snapshots, currentUrl, hasGenerated, setSnapshots, setIsGenerating } = useSnapshotStore()
    const [selectedSnapshot, setSelectedSnapshot] = useState<GeneratedSnapshot | null>(null)
    const [fullscreenOpen, setFullscreenOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Check if data is lost on page load
    const [isDataLost, setIsDataLost] = useState(false)

    console.log(isDownloading)

    useEffect(() => {
        // Check if we have snapshots in store
        if (!hasGenerated || snapshots.length === 0) {
            setIsDataLost(true)
        }
    }, [hasGenerated, snapshots.length, setIsDataLost])

    // Enhanced AI Snapshot generation mutation
    const generateEnhancedSnapshotsMutation = api.snapshot.generateEnhancedSnapshots.useMutation({
        onSuccess: (result) => {
            setSnapshots(result.snapshots)
            setIsGenerating(false)
            setIsDataLost(false)
        },
        onError: (error) => {
            console.error('Failed to generate enhanced snapshots:', error)
            setIsGenerating(false)
        }
    })

    const handleRegenerate = async () => {
        if (!currentUrl) {
            router.push('/')
            return
        }

        setIsGenerating(true)
        generateEnhancedSnapshotsMutation.mutate({
            url: currentUrl,
            style: 'portfolio-multi',
            aspectRatio: '16:9'
        })
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
                            {currentUrl && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Generated from: {currentUrl}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleRegenerate}
                            disabled={false}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate
                        </Button>
                    </div>
                </div>

                {/* Snapshots Grid */}
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
                </div>

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