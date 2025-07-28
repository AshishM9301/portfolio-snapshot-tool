"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCloudUploadAlt, FaFolder } from 'react-icons/fa'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImageConfirm?: (file: File) => void
}

export function UploadDialog({ open, onOpenChange, onImageConfirm }: UploadDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isConfirming, setIsConfirming] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]
            setSelectedFile(file)
            setIsConfirming(true)
        }
    }, [])

    const handleConfirm = useCallback(() => {
        if (selectedFile) {
            onImageConfirm?.(selectedFile)
            setSelectedFile(null)
            setIsConfirming(false)
            onOpenChange(false)
        }
    }, [selectedFile, onImageConfirm, onOpenChange])

    const handleCancel = useCallback(() => {
        setSelectedFile(null)
        setIsConfirming(false)
        onOpenChange(false)
    }, [onOpenChange])

    const handleSelectNewFile = useCallback(() => {
        setSelectedFile(null)
        setIsConfirming(false)
    }, [])

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg']
        },
        maxFiles: 1,
        multiple: false
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 bg-white">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-center text-lg font-semibold text-gray-900">
                        Upload Image
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
                                        ? 'Drop your image here'
                                        : 'Drop your image here'
                                    }
                                </p>
                                <p className="text-sm text-gray-500">
                                    or click to browse files
                                </p>
                                {isDragReject && (
                                    <p className="text-sm text-red-500">
                                        Only image files are allowed
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Confirmation View
                        <div className="space-y-6">
                            {/* Image Preview */}
                            <div className="flex justify-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    {selectedFile && (
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* File Details */}
                            {selectedFile && (
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                                    </p>
                                </div>
                            )}

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
                                    Confirm
                                </Button>
                            </div>

                            {/* Select Different File */}
                            <div className="text-center">
                                <button
                                    onClick={handleSelectNewFile}
                                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                                >
                                    Select different file
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Browse Files Button - Only show in drop zone view */}
                    {!isConfirming && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={() => getRootProps().onClick?.()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                            >
                                <FaFolder className="w-4 h-4" />
                                Browse Files
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 