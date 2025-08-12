"use client"

import { UploadDialog } from '@/app/_components/upload-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UrlChip } from '@/components/ui/url-chip'
import { useSnapshotStore } from '@/lib/stores/snapshot-store'
import { extractUrlsFromText, validateUrl, type UrlValidationResult } from '@/lib/utils'
import { analyzeTextInput, validateTextAnalysis, mergeWithDefaults, getDefaultPreferences, type TextAnalysisResult } from '@/lib/text-analyzer'
import { getPrioritizedTitleAndDescription } from '@/lib/priority-manager'
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
  const [manualDialogOpen, setManualDialogOpen] = useState(false)

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [projectDetails, setProjectDetails] = useState<{ title: string; description: string } | null>(null)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // URL validation states
  const [urlInput, setUrlInput] = useState('')
  const [urlResults, setUrlResults] = useState<UrlValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  // Text analysis states
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysisResult | null>(null)
  const [analysisErrors, setAnalysisErrors] = useState<string[]>([])
  const [analysisWarnings, setAnalysisWarnings] = useState<string[]>([])

  // Update URL results when input changes (only for display, not validation)
  useEffect(() => {
    if (urlInput.trim()) {
      // Analyze text input for URLs and styling preferences
      const analysis = analyzeTextInput(urlInput)
      const validation = validateTextAnalysis(analysis, selectedImages.length > 0)
      const finalAnalysis = mergeWithDefaults(validation.cleanedResult)

      setTextAnalysis(finalAnalysis)
      setAnalysisErrors(validation.errors)
      setAnalysisWarnings(validation.warnings)

      const extractedUrls = finalAnalysis.urls
      const newResults: UrlValidationResult[] = extractedUrls.map(url => ({
        url,
        isValid: false,
        isAccessible: false,
        isLoading: false
      }))
      setUrlResults(newResults)
    } else {
      setUrlResults([])
      setTextAnalysis(null)
      setAnalysisErrors([])
      setAnalysisWarnings([])
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



  const handleGenerateSnapshot = async () => {
    console.log('Current URL input:', urlInput)
    console.log('Current text analysis:', textAnalysis)
    console.log('Current URL results:', urlResults)
    console.log('Has validated:', hasValidated)
    console.log('Selected images:', selectedImages.length)

    // Check for analysis errors first
    if (analysisErrors.length > 0) {
      console.error('Text analysis errors:', analysisErrors)
      alert(`Please fix the following issues:\n${analysisErrors.join('\n')}`)
      return
    }

    // Get prioritized title and description
    const priorityResult = getPrioritizedTitleAndDescription({
      textInput: urlInput,
      textAnalysis,
      uploadedImages: selectedImages,
      manualPreferences: projectDetails ?? undefined
    })

    console.log('Priority result:', priorityResult)

    // Scenario 1 & 2: Images only or Images + Text
    if (selectedImages.length > 0) {
      console.log('Processing images...')
      setCurrentUrl('Image Portfolio') // Set display name
      setIsGenerating(true)

      try {
        // Convert images to base64
        const imageData = await Promise.all(
          selectedImages.map(async (image) => {
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => {
                const result = reader.result as string
                resolve(result.split(',')[1] ?? '') // Remove data:image/...;base64, prefix
              }
              reader.readAsDataURL(image)
            })

            return {
              id: crypto.randomUUID(),
              name: image.name,
              data: base64,
              type: image.type
            }
          })
        )

        // Prepare style preferences from text analysis
        const stylePreferences = textAnalysis ?
          `${textAnalysis.style ? `Style: ${textAnalysis.style}` : ''} ${textAnalysis.aspectRatio ? `Aspect Ratio: ${textAnalysis.aspectRatio}` : ''} ${textAnalysis.quality ? `Quality: ${textAnalysis.quality}` : ''}`.trim() :
          ''

        // Add title and description from priority system
        const enhancedStylePreferences = [
          stylePreferences,
          priorityResult.title ? `Title: ${priorityResult.title}` : '',
          priorityResult.description ? `Description: ${priorityResult.description}` : ''
        ].filter(Boolean).join(' | ')

        console.log('Enhanced style preferences:', enhancedStylePreferences)
        console.log('Priority result being sent:', priorityResult)

        const res = await fetch('/api/batch-image-snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: imageData,
            stylePreferences: enhancedStylePreferences || undefined,
            manualPreferences: projectDetails ?? undefined
          }),
        })

        const data = await res.json() as { error?: string; jobIds?: string[] }
        if (!res.ok) throw new Error(data.error ?? 'Failed to start image batch')

        // Navigate to snapshots page with job IDs
        if (data.jobIds && data.jobIds.length > 0) {
          const jobIdsParam = data.jobIds.join(',')
          router.push(`/snapshots?jobs=${jobIdsParam}`)
        } else {
          router.push('/snapshots')
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to start image batch job:', errorMessage)
        setIsGenerating(false)
      }
      return
    }

    // Scenario 3 & 4: URLs only or URLs + Text
    if (urlInput.trim()) {
      // Extract and validate URLs
      const extractedUrls = extractUrlsFromText(urlInput)
      console.log('Extracted URLs:', extractedUrls)

      if (extractedUrls.length === 0) {
        console.error('No URLs found in input')
        alert('Please enter a valid URL to generate snapshots. For example: "google.com" or "https://example.com"')
        return
      }

      // Validate URLs
      setIsValidating(true)
      const validationPromises = extractedUrls.map(async (url: string) => {
        const result = await validateUrl(url)
        return { ...result, isLoading: false }
      })

      try {
        const validatedResults = await Promise.all(validationPromises)
        console.log('Validation results:', validatedResults)

        const validUrls = validatedResults
          .filter(result => result.isValid && result.isAccessible)
          .map(result => result.url)

        console.log('Valid URLs found:', validUrls)

        if (validUrls.length === 0) {
          console.error('No valid URLs to generate snapshots for')
          alert('Please fix the invalid URLs before generating snapshots.')
          setIsValidating(false)
          return
        }

        setCurrentUrl(validUrls[0]!) // Set first URL as current for display purposes
        setIsGenerating(true)

        // Use batch job system for URLs
        try {
          const res = await fetch('/api/batch-snapshots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: validUrls }),
          })
          const data = await res.json() as { error?: string; jobIds?: string[] }
          if (!res.ok) throw new Error(data.error ?? 'Failed to start batch')

          // Navigate to snapshots page with job IDs
          if (data.jobIds && data.jobIds.length > 0) {
            const jobIdsParam = data.jobIds.join(',')
            router.push(`/snapshots?jobs=${jobIdsParam}`)
          } else {
            router.push('/snapshots')
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('Failed to start batch job:', errorMessage)
          setIsGenerating(false)
        }
      } catch (error) {
        console.error('URL validation error:', error)
        setIsValidating(false)
      }
      return
    }

    // No input provided
    alert('Please provide either images or URLs to generate snapshots.')
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
                <Textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={selectedImages.length > 0 ? "Images attached - Enter portfolio URLs and preferences..." : "Enter URLs and preferences (e.g., 'Create professional portfolio for google.com with 16:9 aspect ratio, Title'My Portfolio', Description'This is my work')..."}
                  className="w-full min-h-[48px] max-h-[120px] pl-4 pr-12 text-lg border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={400}
                />
                <div className="absolute right-3 top-3 flex items-center space-x-2">
                  {isValidating && (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  )}
                  <FaLink
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => setUploadDialogOpen(true)}
                  />
                </div>
                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {urlInput.length}/400
                </div>
              </div>
              <IoFilterOutline className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setManualDialogOpen(true)} />
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

            {/* Text Analysis Results */}
            {textAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Detected Preferences
                  </span>
                  <span className="text-xs text-gray-500">
                    AI Analysis
                  </span>
                </div>

                {/* Style and Aspect Ratio */}
                <div className="flex flex-wrap gap-2">
                  {textAnalysis.style && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Style: {textAnalysis.style.replace('-', ' ')}
                      {textAnalysis.confidence.style > 50 && (
                        <span className="text-blue-600">({textAnalysis.confidence.style}%)</span>
                      )}
                    </div>
                  )}
                  {textAnalysis.aspectRatio && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {textAnalysis.aspectRatio}
                      {textAnalysis.confidence.aspectRatio > 50 && (
                        <span className="text-green-600">({textAnalysis.confidence.aspectRatio}%)</span>
                      )}
                    </div>
                  )}
                  {textAnalysis.quality && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      {textAnalysis.quality} quality
                      {textAnalysis.confidence.quality > 50 && (
                        <span className="text-purple-600">({textAnalysis.confidence.quality}%)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Title and Description */}
                {(textAnalysis.customTitle ?? textAnalysis.customDescription) && (
                  <div className="space-y-2">
                    {textAnalysis.customTitle && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-yellow-600">📝</span>
                        <div className="flex-1">
                          <div className="text-xs text-yellow-800 font-medium">Custom Title</div>
                          <div className="text-sm text-yellow-700">{textAnalysis.customTitle}</div>
                        </div>
                      </div>
                    )}
                    {textAnalysis.customDescription && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-yellow-600">📄</span>
                        <div className="flex-1">
                          <div className="text-xs text-yellow-800 font-medium">Custom Description</div>
                          <div className="text-sm text-yellow-700">{textAnalysis.customDescription}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Device Preferences */}
                {(textAnalysis.includeMobile ?? textAnalysis.includeTablet) && (
                  <div className="flex flex-wrap gap-2">
                    {textAnalysis.includeMobile && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        📱 Mobile
                      </div>
                    )}
                    {textAnalysis.includeTablet && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        📱 Tablet
                      </div>
                    )}
                  </div>
                )}

                {/* Analysis Warnings */}
                {analysisWarnings.length > 0 && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="font-medium mb-1">⚠️ Analysis Warnings:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisWarnings.map((warning, index) => (
                        <li key={index} className="text-xs">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateSnapshot}
              disabled={((isValidating ?? false) ?? false) || ((isGenerating ?? false) ?? false) || (!urlInput.trim() && selectedImages.length === 0)}
              className="w-full max-w-md h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  AI Generating Unique Snapshot...
                </>
              ) : (
                <>
                  <FaMagic className="w-5 h-5 mr-2" />
                  {isValidating ? 'Validating URLs...' : selectedImages.length > 0 ? 'Generate AI Image Snapshot' : 'Validate & Generate AI Snapshot'}
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

      {/* Manual Dialog */}
      <ManualFormDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        onSubmit={setProjectDetails}
      />

    </div>
  )
}

export default HomePage