'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState, useCallback, useRef } from 'react'
import { JobStatus } from './job-status'
import type { BatchImageSnapshotResponse } from '@/types'
import Image from 'next/image'
import { Upload, X, Copy, FileImage } from 'lucide-react'

interface ImageFile {
    id: string
    file: File
    preview: string
    name: string
    size: number
}

export function ImageSnapshotTester() {
    const [images, setImages] = useState<ImageFile[]>([])
    const [stylePreferences, setStylePreferences] = useState('')
    const [errors, setErrors] = useState<string[]>([])
    const [jobIds, setJobIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Helper: Validate images
    const validateImages = (images: ImageFile[]) => {
        const errors: string[] = []
        if (images.length === 0) {
            errors.push('At least one image is required')
        }
        if (images.length > 3) {
            errors.push('Maximum 3 images allowed')
        }

        images.forEach((image, idx) => {
            const maxSize = 10 * 1024 * 1024 // 10MB
            if (image.size > maxSize) {
                errors.push(`Image ${idx + 1} is too large (max 10MB)`)
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(image.file.type)) {
                errors.push(`Image ${idx + 1} has unsupported format (use JPEG, PNG, or WebP)`)
            }
        })

        return errors
    }

    // File handling functions
    const addImage = useCallback((file: File) => {
        if (images.length >= 3) {
            setErrors(['Maximum 3 images allowed'])
            return
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setErrors(['Unsupported file format. Use JPEG, PNG, or WebP'])
            return
        }

        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            setErrors(['File too large (max 10MB)'])
            return
        }

        const imageFile: ImageFile = {
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size
        }

        setImages(prev => [...prev, imageFile])
        setErrors([])
    }, [images.length])

    const removeImage = useCallback((id: string) => {
        setImages(prev => {
            const image = prev.find(img => img.id === id)
            if (image) {
                URL.revokeObjectURL(image.preview)
            }
            return prev.filter(img => img.id !== id)
        })
    }, [])

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                addImage(file)
            }
        })
    }, [addImage])

    // Clipboard paste handler
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = Array.from(e.clipboardData.items)
        items.forEach(item => {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile()
                if (file) {
                    addImage(file)
                }
            }
        })
    }, [addImage])

    // File input handler
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        files.forEach(file => addImage(file))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [addImage])

    // Submit handler
    const handleSubmit = async () => {
        const validation = validateImages(images)
        setErrors(validation)
        if (validation.length > 0) return

        setIsSubmitting(true)
        try {
            // Convert images to base64
            const imageData = await Promise.all(
                images.map(async (image) => {
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader()
                        reader.onload = () => {
                            const result = reader.result as string
                            resolve(result.split(',')[1] ?? '') // Remove data:image/...;base64, prefix
                        }
                        reader.readAsDataURL(image.file)
                    })

                    return {
                        id: image.id,
                        name: image.name,
                        data: base64,
                        type: image.file.type
                    }
                })
            )

            const res = await fetch('/api/batch-image-snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    images: imageData,
                    stylePreferences
                }),
            })

            const data = await res.json() as BatchImageSnapshotResponse
            if (!res.ok) throw new Error(data.error ?? 'Failed to start batch')
            setJobIds(data.jobIds)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setErrors([errorMessage])
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">AI Image Portfolio Snapshot Tester</h1>
                <p className="text-muted-foreground">Generate portfolio snapshots from your images using AI analysis</p>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Image Input & Configuration</h2>
                <div className="space-y-6">

                    {/* Image Upload Area */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Images (max 3)</label>

                        {/* Drag & Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onPaste={handlePaste}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                Drop images here or paste from clipboard
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Supports JPEG, PNG, WebP (max 10MB each)
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!!jobIds.length}
                            >
                                <FileImage className="w-4 h-4 mr-2" />
                                Choose Files
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Image Previews */}
                    {images.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium mb-3">Selected Images ({images.length}/3)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {images.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                            <Image
                                                src={image.preview}
                                                alt={image.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black/5  group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeImage(image.id)}
                                                disabled={!!jobIds.length}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium truncate">{image.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Style Preferences */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Style Preferences (Optional)
                        </label>
                        <Textarea
                            placeholder="e.g., 'Create professional portfolio with 16:9 aspect ratio, modern design, high quality'"
                            value={stylePreferences}
                            onChange={(e) => setStylePreferences(e.target.value)}
                            className="w-full"
                            rows={3}
                            disabled={!!jobIds.length}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Describe your preferred style, aspect ratio, quality, or any specific requirements
                        </p>
                    </div>

                    {/* Error Display */}
                    {errors.length > 0 && (
                        <div className="space-y-1">
                            {errors.map((err, idx) => (
                                <p key={idx} className="text-red-500 text-sm">{err}</p>
                            ))}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !!jobIds.length || images.length === 0}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Processing Images...' : 'Generate AI Snapshots'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Job Status */}
            {jobIds.length > 0 && (
                <Card className="p-6 mt-4">
                    <h2 className="text-xl font-semibold mb-4">Processing Status</h2>
                    <div className="space-y-4">
                        {jobIds.map((jobId, idx) => (
                            <JobStatus
                                key={jobId}
                                jobId={jobId}
                                url={images[idx]?.name ?? `Image ${idx + 1}`}
                            />
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
} 