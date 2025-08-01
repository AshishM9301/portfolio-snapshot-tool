"use client"

import { UploadDialog } from '@/app/_components/upload-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog'
import { Input } from '@/components/ui/input'
import { UrlChip } from '@/components/ui/url-chip'
import { useSnapshotStore } from '@/lib/stores/snapshot-store'
import { extractUrlsFromText, validateUrl, type UrlValidationResult } from '@/lib/utils'
import { api } from '@/trpc/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FaCamera, FaLink, FaMagic } from 'react-icons/fa'
import { IoFilterOutline } from 'react-icons/io5'
import { AISnapshotTester } from '../_components/ai-snapshot-tester'
import { ManualFormDialog } from '../_components/manual-form-dialog'

const HomePage = () => {
  const router = useRouter()
  const snapshotStore = useSnapshotStore()
  const { setSnapshots, setCurrentUrl, setIsGenerating, isGenerating } = snapshotStore
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [manualFormDialogOpen, setManualFormDialogOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [projectDetails, setProjectDetails] = useState<{ title: string; description: string } | null>(null)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // URL validation states
  const [urlInput, setUrlInput] = useState('')
  const [urlResults, setUrlResults] = useState<UrlValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  // Update URL results when input changes (only for display, not validation)
  useEffect(() => {
    if (urlInput.trim()) {
      const extractedUrls = extractUrlsFromText(urlInput)
      const newResults: UrlValidationResult[] = extractedUrls.map(url => ({
        url,
        isValid: false,
        isAccessible: false,
        isLoading: false
      }))
      setUrlResults(newResults)
    } else {
      setUrlResults([])
    }
    setHasValidated(false)
  }, [urlInput])

  // Validate URLs function
  const validateUrls = async () => {
    const extractedUrls = extractUrlsFromText(urlInput)
    if (extractedUrls.length === 0) {
      return false
    }

    setIsValidating(true)
    setHasValidated(true)

    // Create initial loading states
    const initialResults: UrlValidationResult[] = extractedUrls.map((url: string) => ({
      url,
      isValid: false,
      isAccessible: false,
      isLoading: true
    }))

    setUrlResults(initialResults)

    // Validate each URL
    const validationPromises = extractedUrls.map(async (url: string) => {
      const result = await validateUrl(url)
      return { ...result, isLoading: false }
    })

    try {
      const validatedResults = await Promise.all(validationPromises)
      console.log('Validation results:', validatedResults)
      setUrlResults(validatedResults)

      const allValid = validatedResults.every((result: UrlValidationResult) => {
        console.log(`URL ${result.url}: isValid=${result.isValid}, isAccessible=${result.isAccessible}`)
        return result.isValid && result.isAccessible
      })

      console.log('All URLs valid:', allValid)
      return allValid
    } catch (error) {
      console.error('URL validation error:', error)
      return false
    } finally {
      setIsValidating(false)
    }
  }

  // Remove a specific URL
  const removeUrl = (urlToRemove: string) => {
    setUrlResults(prev => prev.filter(result => result.url !== urlToRemove))
    // Also remove from input text
    const newInput = urlInput.replace(new RegExp(urlToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim()
    setUrlInput(newInput)
  }

  // Check if all URLs are valid and accessible (only after validation)
  const areAllUrlsValid = hasValidated && urlResults.length > 0 && urlResults.every(result => result.isValid && result.isAccessible && !result.isLoading)

  // Check if there are any invalid URLs (only after validation)
  const hasInvalidUrls = hasValidated && urlResults.some(result => !result.isLoading && (!result.isValid || !result.isAccessible))

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

  // Enhanced AI Snapshot generation mutation
  const generateEnhancedSnapshotsMutation = api.snapshot.generateEnhancedSnapshots.useMutation({
    onSuccess: (result) => {
      setSnapshots(result.snapshots)
      setIsGenerating(false)
      router.push('/snapshots')
    },
    onError: (error) => {
      console.error('Failed to generate enhanced snapshots:', error)
      setIsGenerating(false)
      // You can add toast notification here
    }
  })





  const handleGenerateSnapshot = async () => {
    console.log('Current URL input:', urlInput)
    console.log('Current URL results:', urlResults)
    console.log('Has validated:', hasValidated)

    // If no URLs are detected, try to extract them first
    if (urlResults.length === 0 && urlInput.trim()) {
      console.log('No URLs detected, extracting from input...')
      const extractedUrls = extractUrlsFromText(urlInput)
      console.log('Extracted URLs:', extractedUrls)

      if (extractedUrls.length === 0) {
        console.error('No URLs found in input')
        alert('Please enter a valid URL to generate snapshots. For example: "google.com" or "https://example.com"')
        return
      }

      // Set initial results for validation
      const initialResults = extractedUrls.map(url => ({
        url,
        isValid: false,
        isAccessible: false,
        isLoading: true
      }))
      setUrlResults(initialResults)
    }

    // If we haven't validated yet, validate first
    if (!hasValidated && urlResults.length > 0) {
      console.log('Validating URLs before generation...')
      const validationSuccess = await validateUrls()

      if (!validationSuccess) {
        console.log('URL validation failed, cannot generate snapshots')
        return
      }
    }

    // Get valid URLs (must be both valid and accessible)
    console.log('Current urlResults state:', urlResults)
    const validUrls = urlResults
      .filter(result => result.isValid && result.isAccessible)
      .map(result => result.url)

    console.log('Valid URLs found:', validUrls)

    // If no valid URLs found in state, try to extract and validate again
    if (validUrls.length === 0 && urlInput.trim()) {
      console.log('No valid URLs in state, extracting and validating again...')
      const extractedUrls = extractUrlsFromText(urlInput)

      if (extractedUrls.length > 0) {
        // Validate the extracted URLs
        const validationPromises = extractedUrls.map(async (url: string) => {
          const result = await validateUrl(url)
          return { ...result, isLoading: false }
        })

        try {
          const validatedResults = await Promise.all(validationPromises)
          console.log('Re-validated results:', validatedResults)

          const reValidatedUrls = validatedResults
            .filter(result => result.isValid && result.isAccessible)
            .map(result => result.url)

          console.log('Re-validated URLs:', reValidatedUrls)

          if (reValidatedUrls.length > 0) {
            const urlToProcess = reValidatedUrls[0]!
            console.log('Using re-validated URL:', urlToProcess)

            setCurrentUrl(urlToProcess)
            setIsGenerating(true)
            generateEnhancedSnapshotsMutation.mutate({
              url: urlToProcess,
              style: 'professional',
              aspectRatio: '16:9'
            })
            return
          }
        } catch (error) {
          console.error('Re-validation error:', error)
        }
      }
    }

    if (validUrls.length === 0) {
      console.error('No valid URLs to generate snapshots for')
      alert('Please fix the invalid URLs before generating snapshots.')
      return
    }

    // Generate snapshots for the first valid URL
    const urlToProcess = validUrls[0]!
    console.log('Generating AI snapshots for URL:', urlToProcess)

    setCurrentUrl(urlToProcess)
    setIsGenerating(true)
    generateEnhancedSnapshotsMutation.mutate({
      url: urlToProcess,
      style: 'portfolio-multi', // Use portfolio style by default
      aspectRatio: '16:9' // Default aspect ratio
    })
  }

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

            {/* URL Input and Validation */}
            <div className='flex items-center gap-4'>
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={selectedImages.length > 0 ? "Images attached - Enter portfolio URLs..." : "Enter portfolio URLs (e.g., 'I have www.google.com and youtube.com')..."}
                  className="w-full h-12 pl-4 pr-12 text-lg border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {isValidating && (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  )}
                  <FaLink
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => setUploadDialogOpen(true)}
                  />
                </div>
              </div>
              <IoFilterOutline onClick={() => setManualFormDialogOpen(true)} className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>

            {/* URL Validation Results */}
            {urlResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Detected URLs ({urlResults.length})
                  </span>
                  {hasValidated && (
                    <span className="text-xs text-gray-500">
                      {urlResults.filter(r => r.isValid && r.isAccessible).length} valid, {urlResults.filter(r => !r.isValid || !r.isAccessible).length} invalid
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {urlResults.map((urlResult) => (
                    <UrlChip
                      key={urlResult.url}
                      urlResult={urlResult}
                      onRemove={removeUrl}
                    />
                  ))}
                </div>
                {hasInvalidUrls && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    ⚠️ Some URLs are invalid or inaccessible. Please fix them before generating a snapshot.
                  </div>
                )}
                {!hasValidated && urlResults.length > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 Click &ldquo;Generate Snapshot&rdquo; to validate these URLs
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateSnapshot}
              disabled={((isValidating ?? false) ?? false) || ((isGenerating ?? false) ?? false) || !urlInput.trim() || (hasValidated && !areAllUrlsValid)}
              className="w-full max-w-md h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  AI Generating Snapshots...
                </>
              ) : (
                <>
                  <FaMagic className="w-5 h-5 mr-2" />
                  {isValidating ? 'Validating URLs...' : 'Validate & Generate Snapshots'}
                </>
              )}
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

      {/* AI Snapshot Tester */}
      <div className="mt-12">
        <AISnapshotTester />
      </div>

    </div>
  )
}

export default HomePage