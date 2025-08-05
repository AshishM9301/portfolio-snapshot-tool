'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { JobStatus } from './job-status'
import type { BatchSnapshotResponse } from '@/types'
import type { TextAnalysisResult } from '@/lib/text-analyzer'

export function AISnapshotTester() {
    const [urls, setUrls] = useState([''])
    const [textInput, setTextInput] = useState('')
    const [images, setImages] = useState<File[]>([])
    const [errors, setErrors] = useState<string[]>([])
    const [jobIds, setJobIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Helper: Validate URLs
    const validateUrls = (urls: string[]) => {
        const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/
        return urls.map((url, idx, arr) => {
            if (!url.trim()) return 'URL required'
            if (!urlPattern.test(url.trim())) return 'Invalid URL'
            if (arr.indexOf(url) !== idx) return 'Duplicate URL'
            return ''
        })
    }

    // Add/Remove URL handlers
    const handleAddUrl = () => {
        if (urls.length < 3) setUrls([...urls, ''])
    }
    const handleRemoveUrl = (idx: number) => {
        if (urls.length > 1) setUrls(urls.filter((_, i) => i !== idx))
    }
    const handleUrlChange = (idx: number, value: string) => {
        setUrls(urls.map((u, i) => (i === idx ? value : u)))
    }

    // Image upload handler
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        setImages(files)
    }

    // AI Text Analysis handler
    const handleAnalyzeText = async () => {
        if (!textInput.trim() && urls.every(url => !url.trim()) && images.length === 0) {
            setErrors(['Please provide text, URLs, or images to analyze'])
            return
        }

        setIsAnalyzing(true)
        setErrors([])
        
        try {
            const response = await fetch('/api/analyze-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: textInput,
                    urls: urls.filter(url => url.trim()),
                    hasImages: images.length > 0
                }),
            })
            
            if (!response.ok) {
                throw new Error('Failed to analyze text')
            }
            
            const result = await response.json() as TextAnalysisResult
            setAnalysisResult(result)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setErrors([errorMessage])
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Submit handler (call real API)
    const handleSubmit = async () => {
        const validation = validateUrls(urls)
        setErrors(validation)
        if (validation.some(e => e)) return
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/batch-snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls }),
            })
            const data = await res.json() as BatchSnapshotResponse
            if (!res.ok) throw new Error('Failed to start batch')
            setJobIds(data.jobIds)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setErrors([errorMessage])
        } finally {
            setIsSubmitting(false)
        }
    }

    // Confidence score display helper
    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800'
        if (score >= 60) return 'bg-yellow-100 text-yellow-800'
        if (score >= 40) return 'bg-orange-100 text-orange-800'
        return 'bg-red-100 text-red-800'
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">AI Portfolio Snapshot Tester</h1>
                <p className="text-muted-foreground">Test the new AI-driven portfolio card generation system with intelligent text analysis</p>
            </div>
            
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">AI Text Analysis</h2>
                <div className="space-y-4">
                    {/* Text Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Text Input (Optional)</label>
                        <Textarea
                            placeholder="Enter text with styling preferences, titles, descriptions, etc. Example: 'Title'My Portfolio' Description'Showcase my work' modern style high quality'"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="min-h-[100px]"
                            disabled={isAnalyzing}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Images (Optional)</label>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isAnalyzing}
                        />
                        {images.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {images.length} image(s) selected
                            </p>
                        )}
                    </div>

                    {/* Analyze Button */}
                    <Button
                        onClick={handleAnalyzeText}
                        disabled={isAnalyzing || (!textInput.trim() && urls.every(url => !url.trim()) && images.length === 0)}
                        className="w-full"
                    >
                        {isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
                    </Button>

                    {/* Error Display */}
                    {errors.length > 0 && (
                        <div className="space-y-1">
                            {errors.map((err, idx) => (
                                <p key={idx} className="text-red-500 text-sm">{err}</p>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">AI Analysis Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium mb-2">Extracted Information</h3>
                            <div className="space-y-2">
                                {analysisResult.customTitle && (
                                    <div>
                                        <span className="text-sm font-medium">Title:</span>
                                        <p className="text-sm">{analysisResult.customTitle}</p>
                                    </div>
                                )}
                                {analysisResult.customDescription && (
                                    <div>
                                        <span className="text-sm font-medium">Description:</span>
                                        <p className="text-sm">{analysisResult.customDescription}</p>
                                    </div>
                                )}
                                {analysisResult.style && (
                                    <div>
                                        <span className="text-sm font-medium">Style:</span>
                                        <Badge variant="outline">{analysisResult.style}</Badge>
                                    </div>
                                )}
                                {analysisResult.aspectRatio && (
                                    <div>
                                        <span className="text-sm font-medium">Aspect Ratio:</span>
                                        <Badge variant="outline">{analysisResult.aspectRatio}</Badge>
                                    </div>
                                )}
                                {analysisResult.quality && (
                                    <div>
                                        <span className="text-sm font-medium">Quality:</span>
                                        <Badge variant="outline">{analysisResult.quality}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Confidence Scores</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Style:</span>
                                    <Badge className={getConfidenceColor(analysisResult.confidence.style)}>
                                        {analysisResult.confidence.style}%
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Title:</span>
                                    <Badge className={getConfidenceColor(analysisResult.confidence.title)}>
                                        {analysisResult.confidence.title}%
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Description:</span>
                                    <Badge className={getConfidenceColor(analysisResult.confidence.description)}>
                                        {analysisResult.confidence.description}%
                                    </Badge>
                                </div>
                                {analysisResult.confidence.aiOverall && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">AI Overall:</span>
                                        <Badge className={getConfidenceColor(analysisResult.confidence.aiOverall)}>
                                            {analysisResult.confidence.aiOverall}%
                                        </Badge>
                                    </div>
                                )}
                                {analysisResult.confidence.contentQuality && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Content Quality:</span>
                                        <Badge className={getConfidenceColor(analysisResult.confidence.contentQuality)}>
                                            {analysisResult.confidence.contentQuality}%
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
                <div className="space-y-4">
                    {/* Multi-URL Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Website URLs (max 3)</label>
                        <div className="space-y-2">
                            {urls.map((url, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={e => handleUrlChange(idx, e.target.value)}
                                        className="w-full"
                                        disabled={!!jobIds.length}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveUrl(idx)}
                                        disabled={urls.length === 1 || !!jobIds.length}
                                    >
                                        -
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Button
                                type="button"
                                onClick={handleAddUrl}
                                disabled={urls.length >= 3 || !!jobIds.length}
                                variant="secondary"
                            >
                                Add URL
                            </Button>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !!jobIds.length}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Submitting...' : 'Start Batch'}
                        </Button>
                    </div>
                </div>
            </Card>
            {/* JobStatus Components */}
            {jobIds.length > 0 && (
                <Card className="p-6 mt-4">
                    <h2 className="text-xl font-semibold mb-4">Job Status</h2>
                    <div className="space-y-4">
                        {jobIds.map((jobId, idx) => (
                            <JobStatus key={jobId} jobId={jobId} url={urls[idx] ?? ''} />
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
} 