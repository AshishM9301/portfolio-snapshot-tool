"use client"

import { UploadDialog } from '@/app/_components/upload-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { FaBolt, FaCamera, FaLink } from 'react-icons/fa'
import { IoFilterOutline } from 'react-icons/io5'
import { ManualFormDialog } from '../_components/manual-form-dialog'

const HomePage = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [manualFormDialogOpen, setManualFormDialogOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [projectDetails, setProjectDetails] = useState<{ title: string; description: string } | null>(null)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleImageConfirm = (files: File[]) => {
    setSelectedImages(files)
    console.log('Images confirmed:', files.map(f => f.name))
  }

  const removeImage = (fileToRemove?: File) => {
    if (fileToRemove) {
      setSelectedImages(prev => prev.filter(file => file !== fileToRemove))
    } else {
      setSelectedImages([])
    }
  }

  const handleManualFormSubmit = (data: { title: string; description: string }) => {
    setProjectDetails(data)
    console.log('Manual form submitted:', data)
  }

  const removeProjectDetails = () => {
    setProjectDetails(null)
  }

  const getImageDisplayText = () => {
    if (selectedImages.length === 0) return ''
    if (selectedImages.length === 1) return selectedImages[0]?.name ?? ''
    return `${selectedImages.length} images selected`
  }

  const getTotalSize = () => {
    return selectedImages.reduce((total, file) => total + file.size, 0)
  }

  const getTotalSizeMB = () => {
    return (getTotalSize() / 1024 / 1024).toFixed(2)
  }

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index)
    setImagePreviewOpen(true)
  }, [])

  return (
    <div className="min-h-screen bg-white flex justify-center px-4 py-16">
      <Card className="w-full max-w-2xl border-0 shadow-none">
        <CardContent className="p-8 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-32">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaCamera className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900">
              Portfolio Snapshot Tool
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 w-2/3 mx-auto">
              Create professional portfolio snapshots in seconds
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            {/* Images Display */}
            {selectedImages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600">📎</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-blue-800 font-medium">
                      {getImageDisplayText()}
                    </span>
                    <span className="text-xs text-blue-600 ml-2">
                      • {getTotalSizeMB()} MB
                    </span>
                  </div>
                  <button
                    onClick={() => removeImage()}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                    title="Remove all images"
                  >
                    ✕
                  </button>
                </div>

                {/* Image Previews Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {selectedImages.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="relative group">
                      <div
                        className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(index)}
                      >
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="w-full h-full object-cover border border-gray-200 rounded-lg"
                        />
                      </div>

                      {/* Remove Individual Image Button */}
                      <button
                        onClick={() => removeImage(file)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        aria-label={`Remove ${file.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Details Display */}
            {projectDetails && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600">📋</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-green-800 font-medium truncate">
                    {projectDetails.title || 'Project Details'}
                  </div>
                  {projectDetails.description && (
                    <div className="text-xs text-green-600 truncate">
                      {projectDetails.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={removeProjectDetails}
                  className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                  title="Remove project details"
                >
                  ✕
                </button>
              </div>
            )}

            <div className='flex items-center gap-4'>
              <div className="relative flex-1">
                <Input
                  type="url"
                  placeholder={selectedImages.length > 0 ? "Images attached - Enter portfolio URL..." : "Enter portfolio URL..."}
                  className="w-full h-12 pl-4 pr-12 text-lg border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <FaLink
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => setUploadDialogOpen(true)}
                  />
                </div>
              </div>
              <IoFilterOutline onClick={() => setManualFormDialogOpen(true)} className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          {/* Action Section */}
          <div className="flex justify-center">
            <Button
              className="w-full max-w-md h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FaBolt className="w-5 h-5 mr-2" />
              Generate Snapshot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onImageConfirm={handleImageConfirm}
        maxFiles={10}
        maxSize={50} // 50MB total limit
      />

      {/* Manual Form Dialog */}
      <ManualFormDialog
        open={manualFormDialogOpen}
        onOpenChange={setManualFormDialogOpen}
        onSubmit={handleManualFormSubmit}
      />

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={imagePreviewOpen}
        onOpenChange={setImagePreviewOpen}
        images={selectedImages.map((file, index) => ({
          src: URL.createObjectURL(file),
          alt: `Preview ${index + 1}`,
          name: file.name,
          size: file.size,
        }))}
        currentIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
      />
    </div>
  )
}

export default HomePage