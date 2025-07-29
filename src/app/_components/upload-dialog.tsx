"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCheck, FaCloudUploadAlt, FaFolder, FaTimes } from 'react-icons/fa'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog'

interface UploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImageConfirm?: (files: File[]) => void
    maxFiles?: number
    maxSize?: number // in MB
}

export function UploadDialog({ open, onOpenChange, onImageConfirm, maxFiles = 10, maxSize }: UploadDialogProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isConfirming, setIsConfirming] = useState(false)
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    const calculateTotalSize = useCallback((files: File[]) => {
        return files.reduce((total, file) => total + file.size, 0)
    }, [])

    const isDuplicateFile = useCallback((newFile: File, existingFiles: File[]) => {
        return existingFiles.some(existing =>
            existing.name === newFile.name &&
            existing.size === newFile.size &&
            existing.lastModified === newFile.lastModified
        )
    }, [])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFiles(prevFiles => {
                // Filter out duplicates
                const newFiles = acceptedFiles.filter(newFile => !isDuplicateFile(newFile, prevFiles))

                // Check file count limit
                if (prevFiles.length + newFiles.length > maxFiles) {
                    const remainingSlots = maxFiles - prevFiles.length
                    newFiles.splice(remainingSlots)
                }

                // Check total size limit
                if (maxSize) {
                    const currentSize = calculateTotalSize(prevFiles)
                    const maxSizeBytes = maxSize * 1024 * 1024
                    let totalSize = currentSize
                    const validFiles = newFiles.filter(file => {
                        if (totalSize + file.size <= maxSizeBytes) {
                            totalSize += file.size
                            return true
                        }
                        return false
                    })
                    return [...prevFiles, ...validFiles]
                }

                return [...prevFiles, ...newFiles]
            })
            setIsConfirming(true)
        }
    }, [maxFiles, maxSize, calculateTotalSize, isDuplicateFile])

    const removeFile = useCallback((fileToRemove: File) => {
        setSelectedFiles(prevFiles => {
            const updatedFiles = prevFiles.filter(file => file !== fileToRemove)
            if (updatedFiles.length === 0) {
                setIsConfirming(false)
            }
            return updatedFiles
        })
    }, [])

    const handleConfirm = useCallback(() => {
        if (selectedFiles.length > 0) {
            onImageConfirm?.(selectedFiles)
            setSelectedFiles([])
            setIsConfirming(false)
            onOpenChange(false)
        }
    }, [selectedFiles, onImageConfirm, onOpenChange])

    const handleCancel = useCallback(() => {
        setSelectedFiles([])
        setIsConfirming(false)
        onOpenChange(false)
    }, [onOpenChange])

    const handleSelectNewFiles = useCallback(() => {
        setIsConfirming(false)
    }, [])

    const handleImageClick = useCallback((index: number) => {
        setSelectedImageIndex(index)
        setImagePreviewOpen(true)
    }, [])

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg']
        },
        multiple: true,
        maxFiles: maxFiles
    })

    const totalSize = calculateTotalSize(selectedFiles)
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)

    console.log(selectedFiles, isConfirming)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 bg-white">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-center text-lg font-semibold text-gray-900">
                        Upload Images
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    {!isConfirming ? (
                        // Drop Zone View
                        <div
                            {...getRootProps()}
                            className={`
                                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                                ${isDragActive
                                    ? 'border-blue-400 bg-blue-50'
                                    : isDragReject
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }
                            `}
                        >
                            <input {...getInputProps()} />

                            {/* Upload Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FaCloudUploadAlt className="w-8 h-8 text-gray-400" />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-gray-900">
                                    {isDragActive
                                        ? 'Drop your images here'
                                        : 'Drop your images here'
                                    }
                                </p>
                                <p className="text-sm text-gray-500">
                                    or click to browse files
                                </p>
                                <p className="text-xs text-gray-400">
                                    Up to {maxFiles} files {maxSize && `• Max ${maxSize}MB total`}
                                </p>
                                {isDragReject && (
                                    <p className="text-sm text-red-500">
                                        Only image files are allowed
                                    </p>
                                )}
                            </div>

                            {/* Current Files Summary */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected • {totalSizeMB} MB
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Confirmation View
                        <div className="space-y-6">
                            {/* Files Summary */}
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                                </p>
                                <p className="text-sm text-gray-500">
                                    {totalSizeMB} MB total
                                </p>
                            </div>

                            {/* Files Grid */}
                            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                {selectedFiles.map((file, index) => (
                                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="relative group">
                                        <div
                                            className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => handleImageClick(index)}
                                        >
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                fill
                                                className="w-full h-full object-cover border border-gray-200 rounded-lg"
                                            />
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFile(file)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>

                                        {/* File Info */}
                                        <div className="mt-2 text-center">
                                            <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCancel}
                                    className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Confirm ({selectedFiles.length})
                                </Button>
                            </div>

                            {/* Add More Files */}
                            <div className="text-center">
                                <button
                                    onClick={handleSelectNewFiles}
                                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                                >
                                    Add more files
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Browse Files Button - Only show in drop zone view */}
                    {!isConfirming && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    getRootProps().onClick?.(e)
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                            >
                                <FaFolder className="w-4 h-4" />
                                Browse Files
                            </Button>
                            {selectedFiles.length > 0 &&
                                (
                                    <div className=" ml-4 flex justify-center">
                                        <Button
                                            onClick={() => setIsConfirming(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                                        >
                                            <FaCheck className="w-4 h-4" />
                                            See Selected Files
                                        </Button>
                                    </div>
                                )
                            }
                        </div>
                    )}
                </div>
            </DialogContent>

            {/* Image Preview Dialog */}
            <ImagePreviewDialog
                open={imagePreviewOpen}
                onOpenChange={setImagePreviewOpen}
                images={selectedFiles.map((file, index) => ({
                    src: URL.createObjectURL(file),
                    alt: `Preview ${index + 1}`,
                    name: file.name,
                    size: file.size,
                }))}
                currentIndex={selectedImageIndex}
                onIndexChange={setSelectedImageIndex}
            />
        </Dialog>
    )
} 