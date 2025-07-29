"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Download, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import Image from "next/image"
import { useState, useCallback, useEffect } from "react"
import type { GeneratedSnapshot } from "@/lib/openrouter"

interface FullscreenImageViewerProps {
    snapshot: GeneratedSnapshot | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FullscreenImageViewer({ snapshot, open, onOpenChange }: FullscreenImageViewerProps) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Reset zoom and position when image changes
    useEffect(() => {
        if (open) {
            setScale(1)
            setPosition({ x: 0, y: 0 })
        }
    }, [open, snapshot?.id])

    const handleDownload = useCallback(() => {
        if (!snapshot) return

        const link = document.createElement('a')
        link.href = snapshot.imageUrl
        link.download = `snapshot-${snapshot.style}-${snapshot.aspectRatio}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [snapshot])

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.2, 5))
    }, [])

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev / 1.2, 0.1))
    }, [])

    const handleReset = useCallback(() => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true)
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
        }
    }, [scale, position])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            })
        }
    }, [isDragging, scale, dragStart])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setScale(prev => Math.max(0.1, Math.min(5, prev * delta)))
    }, [])

    if (!snapshot) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
                <div className="relative w-full h-full flex flex-col">
                    {/* Header Controls */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleZoomOut}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                                disabled={scale <= 0.1}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>

                            <span className="text-white text-sm font-medium min-w-[60px] text-center">
                                {Math.round(scale * 100)}%
                            </span>

                            <Button
                                onClick={handleZoomIn}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                                disabled={scale >= 5}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>

                            <Button
                                onClick={handleReset}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                            >
                                <RotateCw className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleDownload}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                            >
                                <Download className="w-4 h-4" />
                            </Button>

                            <Button
                                onClick={() => onOpenChange(false)}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div
                        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                    >
                        <div
                            className="relative transition-transform duration-200 ease-out"
                            style={{
                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default'
                            }}
                        >
                            <Image
                                src={snapshot.imageUrl}
                                alt={snapshot.description}
                                width={1920}
                                height={1080}
                                className="max-w-none"
                                style={{
                                    maxWidth: 'none',
                                    width: 'auto',
                                    height: 'auto'
                                }}
                                priority
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white text-sm">
                            <h3 className="font-semibold">{snapshot.description}</h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-300">
                                <span>Style: {snapshot.style}</span>
                                <span>Aspect: {snapshot.aspectRatio}</span>
                                <span>Generated: {snapshot.timestamp.toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 