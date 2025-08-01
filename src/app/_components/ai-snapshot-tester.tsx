'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { JobStatus } from './job-status'
import type { BatchSnapshotResponse } from '@/types'

export function AISnapshotTester() {
    const [urls, setUrls] = useState([''])
    const [errors, setErrors] = useState<string[]>([])
    const [jobIds, setJobIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            if (!res.ok) throw new Error(data.error ?? 'Failed to start batch')
            setJobIds(data.jobIds)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setErrors([errorMessage])
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">AI Portfolio Snapshot Tester</h1>
                <p className="text-muted-foreground">Test the new AI-driven portfolio card generation system</p>
            </div>
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
                        <div className="mt-2 space-y-1">
                            {errors.map((err, idx) => err && (
                                <p key={idx} className="text-red-500 text-xs">{err}</p>
                            ))}
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