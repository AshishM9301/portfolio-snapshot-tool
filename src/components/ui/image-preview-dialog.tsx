"use client"

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaSearchMinus, FaSearchPlus, FaTimes } from 'react-icons/fa'

interface ImageData {
    src: string
    alt?: string
    name?: string
    size?: number
    width?: number
    height?: number
}

interface ImagePreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    images: ImageData[]
    currentIndex: number
    onIndexChange?: (index: number) => void
}

export function ImagePreviewDialog({
    open,
    onOpenChange,
    images,
    currentIndex,
    onIndexChange
}: ImagePreviewDialogProps) {
    const [scale, setScale] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    const currentImage = images[currentIndex]

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            onIndexChange?.(currentIndex - 1)
            setScale(1)
            setIsLoading(true)
            setImageError(false)
        }
    }, [currentIndex, onIndexChange])

    const handleNext = useCallback(() => {
        if (currentIndex < images.length - 1) {
            onIndexChange?.(currentIndex + 1)
            setScale(1)
            setIsLoading(true)
            setImageError(false)
        }
    }, [currentIndex, images.length, onIndexChange])

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.2, 5))
    }, [])

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev / 1.2, 0.1))
    }, [])

    const handleResetZoom = useCallback(() => {
        setScale(1)
    }, [])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (e.deltaY < 0) {
                handleZoomIn()
            } else {
                handleZoomOut()
            }
        }
    }, [handleZoomIn, handleZoomOut])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!open) return

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault()
                handlePrevious()
                break
            case 'ArrowRight':
                e.preventDefault()
                handleNext()
                break
            case 'Escape':
                e.preventDefault()
                onOpenChange(false)
                break
            case '+':
            case '=':
                e.preventDefault()
                handleZoomIn()
                break
            case '-':
                e.preventDefault()
                handleZoomOut()
                break
            case '0':
                e.preventDefault()
                handleResetZoom()
                break
        }
    }, [open, handlePrevious, handleNext, handleZoomIn, handleZoomOut, handleResetZoom, onOpenChange])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])

    useEffect(() => {
        if (open) {
            setScale(1)
            setIsLoading(true)
            setImageError(false)
        }
    }, [open])

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return ''
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    if (!currentImage) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-0">
                <DialogTitle className="sr-only">
                    Image Preview - {currentImage.name ?? 'Image'}
                </DialogTitle>
                {/* Header */}
                <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                            aria-label="Close"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>

                        {/* Image Info */}
                        <div className="text-white text-sm">
                            {currentImage.name && (
                                <div className="font-medium">{currentImage.name}</div>
                            )}
                            {currentImage.size && (
                                <div className="text-gray-300">{formatFileSize(currentImage.size)}</div>
                            )}
                            {currentImage.width && currentImage.height && (
                                <div className="text-gray-300">{currentImage.width} × {currentImage.height}</div>
                            )}
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                            aria-label="Zoom out"
                        >
                            <FaSearchMinus className="w-4 h-4" />
                        </button>
                        <span className="text-white text-sm min-w-[60px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                            aria-label="Zoom in"
                        >
                            <FaSearchPlus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                                aria-label="Previous image"
                            >
                                <FaChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        {currentIndex < images.length - 1 && (
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                                aria-label="Next image"
                            >
                                <FaChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                        {currentIndex + 1} of {images.length}
                    </div>
                )}

                {/* Image Container */}
                <div
                    className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                    onWheel={handleWheel}
                >
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                    )}

                    {imageError ? (
                        <div className="text-white text-center">
                            <div className="text-2xl mb-2">⚠️</div>
                            <div>Failed to load image</div>
                        </div>
                    ) : (
                        <div
                            className="relative transition-transform duration-200 ease-out"
                            style={{ transform: `scale(${scale})` }}
                        >
                            <Image
                                src={currentImage.src}
                                alt={currentImage.alt ?? 'Preview'}
                                width={currentImage.width ?? 800}
                                height={currentImage.height ?? 600}
                                className="max-w-none max-h-none object-contain"
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                    setIsLoading(false)
                                    setImageError(true)
                                }}
                                priority
                            />
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 z-50 text-white/70 text-xs">
                    <div>Use mouse wheel to zoom • Arrow keys to navigate • ESC to close</div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 