"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Check } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { GeneratedSnapshot } from "@/lib/openrouter"

interface SnapshotGalleryProps {
    snapshots: GeneratedSnapshot[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSnapshotSelect?: (snapshot: GeneratedSnapshot) => void
}

export function SnapshotGallery({
    snapshots,
    open,
    onOpenChange,
    onSnapshotSelect
}: SnapshotGalleryProps) {
    const [selectedSnapshot, setSelectedSnapshot] = useState<GeneratedSnapshot | null>(null)
    const [previewSnapshot, setPreviewSnapshot] = useState<GeneratedSnapshot | null>(null)

    const handleSnapshotSelect = (snapshot: GeneratedSnapshot) => {
        setSelectedSnapshot(snapshot)
        onSnapshotSelect?.(snapshot)
    }

    const handleDownload = (snapshot: GeneratedSnapshot) => {
        // Create a download link for the base64 image
        const link = document.createElement('a')
        link.href = snapshot.imageUrl
        link.download = `snapshot-${snapshot.style}-${snapshot.aspectRatio}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const getStyleColor = (style: string) => {
        switch (style) {
            case 'professional':
                return 'bg-blue-100 text-blue-800'
            case 'creative':
                return 'bg-purple-100 text-purple-800'
            case 'minimal':
                return 'bg-gray-100 text-gray-800'
            case 'modern':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getAspectRatioLabel = (ratio: string) => {
        switch (ratio) {
            case '16:9':
                return 'Widescreen'
            case '4:3':
                return 'Standard'
            case '1:1':
                return 'Square'
            case '3:2':
                return 'Photo'
            default:
                return ratio
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">
                            AI-Generated Portfolio Snapshots
                        </DialogTitle>
                        <p className="text-gray-600 text-center">
                            Choose your favorite snapshot from the AI-generated options
                        </p>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {snapshots.map((snapshot) => (
                            <Card
                                key={snapshot.id}
                                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedSnapshot?.id === snapshot.id
                                        ? 'ring-2 ring-blue-500 shadow-lg'
                                        : 'hover:scale-[1.02]'
                                    }`}
                                onClick={() => handleSnapshotSelect(snapshot)}
                            >
                                <CardContent className="p-4">
                                    {/* Image Container */}
                                    <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={snapshot.imageUrl}
                                            alt={snapshot.description}
                                            fill
                                            className="object-cover"
                                        />

                                        {/* Selection Indicator */}
                                        {selectedSnapshot?.id === snapshot.id && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}

                                        {/* Preview Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setPreviewSnapshot(snapshot)
                                            }}
                                            className="absolute top-2 left-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* Download Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDownload(snapshot)
                                            }}
                                            className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Info Section */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                                            {snapshot.description}
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <Badge className={getStyleColor(snapshot.style)}>
                                                {snapshot.style}
                                            </Badge>
                                            <Badge variant="outline">
                                                {getAspectRatioLabel(snapshot.aspectRatio)}
                                            </Badge>
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            Generated on {snapshot.timestamp.toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-6 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        {selectedSnapshot && (
                            <Button
                                onClick={() => {
                                    onSnapshotSelect?.(selectedSnapshot)
                                    onOpenChange(false)
                                }}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Use Selected Snapshot
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={!!previewSnapshot} onOpenChange={() => setPreviewSnapshot(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Snapshot Preview</DialogTitle>
                    </DialogHeader>
                    {previewSnapshot && (
                        <div className="space-y-4">
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                    src={previewSnapshot.imageUrl}
                                    alt={previewSnapshot.description}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{previewSnapshot.description}</h3>
                                <div className="flex items-center gap-2">
                                    <Badge className={getStyleColor(previewSnapshot.style)}>
                                        {previewSnapshot.style}
                                    </Badge>
                                    <Badge variant="outline">
                                        {getAspectRatioLabel(previewSnapshot.aspectRatio)}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewSnapshot(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        handleDownload(previewSnapshot)
                                        setPreviewSnapshot(null)
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
} 