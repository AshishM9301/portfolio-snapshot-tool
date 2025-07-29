"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { FaDownload, FaEye, FaExpand } from 'react-icons/fa'
import type { GeneratedSnapshot } from '@/types'

interface SnapshotPreviewProps {
    snapshot: GeneratedSnapshot
    onDownload?: (snapshot: GeneratedSnapshot) => void
    onPreview?: (snapshot: GeneratedSnapshot) => void
    className?: string
}

export function SnapshotPreview({
    snapshot,
    onDownload,
    onPreview,
    className = ""
}: SnapshotPreviewProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setIsLoading(true)
        setError(null)
    }, [snapshot.htmlContent])

    const handleIframeLoad = () => {
        setIsLoading(false)
    }

    const handleIframeError = () => {
        setError('Failed to load preview')
        setIsLoading(false)
    }

    return (
        <Card className={`snapshot-preview ${className}`}>
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{snapshot.style}</Badge>
                        <Badge variant="secondary">{snapshot.aspectRatio}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        {onPreview && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPreview(snapshot)}
                            >
                                <FaEye className="w-3 h-3 mr-1" />
                                Preview
                            </Button>
                        )}
                        {onDownload && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDownload(snapshot)}
                            >
                                <FaDownload className="w-3 h-3 mr-1" />
                                Download
                            </Button>
                        )}
                    </div>
                </div>

                {/* Preview Container */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                <p className="text-sm text-gray-600">Loading preview...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                            <div className="text-center">
                                <p className="text-sm text-red-600 mb-2">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* HTML Preview */}
                    <div className="relative w-full h-96 overflow-hidden">
                        <iframe
                            srcDoc={snapshot.htmlContent}
                            className="w-full h-full border-0"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            sandbox="allow-scripts"
                            title={`Preview of ${snapshot.title}`}
                        />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {snapshot.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {snapshot.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(snapshot.timestamp).toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

// Fullscreen Preview Modal
interface FullscreenPreviewProps {
    snapshot: GeneratedSnapshot
    isOpen: boolean
    onClose: () => void
}

export function FullscreenPreview({ snapshot, isOpen, onClose }: FullscreenPreviewProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{snapshot.title}</h2>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <FaExpand className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <iframe
                        srcDoc={snapshot.htmlContent}
                        className="w-full h-[70vh] border rounded-lg"
                        sandbox="allow-scripts"
                        title={`Fullscreen preview of ${snapshot.title}`}
                    />
                </div>
            </div>
        </div>
    )
} 