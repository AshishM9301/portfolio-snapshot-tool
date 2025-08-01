"use client"

import type { GeneratedSnapshot } from '@/types/snapshot'
import { useState } from 'react'
import { FaDownload, FaEye, FaShare } from 'react-icons/fa'
import { IoRefresh } from 'react-icons/io5'
import { Badge } from './badge'
import { Button } from './button'
import { Card, CardContent } from './card'
import Image from 'next/image'

interface SnapshotSelectorProps {
    snapshots: GeneratedSnapshot[]
    selectedSnapshot?: GeneratedSnapshot
    onSnapshotSelect: (snapshot: GeneratedSnapshot) => void
    onSnapshotRegenerate?: (snapshotId: string) => void
    onSnapshotDownload?: (snapshot: GeneratedSnapshot) => void
    onSnapshotShare?: (snapshot: GeneratedSnapshot) => void
    isLoading?: boolean
}

export function SnapshotSelector({
    snapshots,
    selectedSnapshot,
    onSnapshotSelect,
    onSnapshotRegenerate,
    onSnapshotDownload,
    onSnapshotShare,
    isLoading = false
}: SnapshotSelectorProps) {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewSnapshot, setPreviewSnapshot] = useState<GeneratedSnapshot | null>(null)

    const handlePreview = (snapshot: GeneratedSnapshot) => {
        setPreviewSnapshot(snapshot)
        setPreviewOpen(true)
    }

    const handleRegenerate = (snapshotId: string) => {
        if (onSnapshotRegenerate) {
            onSnapshotRegenerate(snapshotId)
        }
    }

    const handleDownload = (snapshot: GeneratedSnapshot) => {
        if (onSnapshotDownload) {
            onSnapshotDownload(snapshot)
        }
    }

    const handleShare = (snapshot: GeneratedSnapshot) => {
        if (onSnapshotShare) {
            onSnapshotShare(snapshot)
        }
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

    const getAspectRatioLabel = (aspectRatio: string) => {
        switch (aspectRatio) {
            case '16:9':
                return 'Landscape'
            case '4:3':
                return 'Standard'
            case '1:1':
                return 'Square'
            case '3:2':
                return 'Photo'
            default:
                return aspectRatio
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating snapshot variations...</p>
                </div>
            </div>
        )
    }

    if (snapshots.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">No snapshots generated yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Generated Snapshots ({snapshots.length})
                    </h3>
                    <p className="text-sm text-gray-600">
                        Select your preferred snapshot or regenerate variations
                    </p>
                </div>
            </div>

            {/* Snapshots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snapshots.map((snapshot) => (
                    <Card
                        key={snapshot.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedSnapshot?.id === snapshot.id
                            ? 'ring-2 ring-blue-500 shadow-lg'
                            : 'hover:ring-1 hover:ring-gray-300'
                            }`}
                        onClick={() => onSnapshotSelect(snapshot)}
                    >
                        <CardContent className="p-4">
                            {/* Snapshot Preview */}
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                                {snapshot.pngUrl ? (
                                    <Image
                                        src={snapshot.pngUrl}
                                        alt={snapshot.description}
                                        className="w-full h-full object-cover"
                                        fill
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <span>Preview not available</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 hover:opacity-100 text-white"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePreview(snapshot)
                                        }}
                                    >
                                        <FaEye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Snapshot Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className={getStyleColor(snapshot.style)}>
                                        {snapshot.style}
                                    </Badge>
                                    <Badge variant="outline">
                                        {getAspectRatioLabel(snapshot.aspectRatio)}
                                    </Badge>
                                </div>

                                <p className="text-sm text-gray-700 line-clamp-2">
                                    {snapshot.description}
                                </p>

                                <div className="text-xs text-gray-500">
                                    {new Date(snapshot.timestamp).toLocaleString()}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRegenerate(snapshot.id)
                                    }}
                                >
                                    <IoRefresh className="w-3 h-3 mr-1" />
                                    Regenerate
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDownload(snapshot)
                                    }}
                                >
                                    <FaDownload className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleShare(snapshot)
                                    }}
                                >
                                    <FaShare className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Preview Modal */}
            {previewOpen && previewSnapshot && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Snapshot Preview</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPreviewOpen(false)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {previewSnapshot.pngUrl ? (
                                    <img
                                        src={previewSnapshot.pngUrl}
                                        alt={previewSnapshot.description}
                                        className="w-full rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg">
                                        <span>Preview not available</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStyleColor(previewSnapshot.style)}>
                                            {previewSnapshot.style}
                                        </Badge>
                                        <Badge variant="outline">
                                            {getAspectRatioLabel(previewSnapshot.aspectRatio)}
                                        </Badge>
                                    </div>

                                    <p className="text-gray-700">{previewSnapshot.description}</p>

                                    <div className="text-sm text-gray-500">
                                        Generated: {new Date(previewSnapshot.timestamp).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            onSnapshotSelect(previewSnapshot)
                                            setPreviewOpen(false)
                                        }}
                                    >
                                        Select This Snapshot
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownload(previewSnapshot)}
                                    >
                                        <FaDownload className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleShare(previewSnapshot)}
                                    >
                                        <FaShare className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 