'use client'

import { useState, useEffect } from 'react'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Eye, Smartphone, Tablet, Monitor } from 'lucide-react'

export function AISnapshotTester() {
    const [url, setUrl] = useState('')
    const [includeMobile, setIncludeMobile] = useState(false)
    const [includeTablet, setIncludeTablet] = useState(false)
    const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high')
    const [style, setStyle] = useState<'modern' | 'professional' | 'creative' | 'minimal'>('modern')
    const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'configured' | 'missing'>('checking')

    // AI Snapshot generation mutation
    const generateAISnapshot = api.snapshot.generateAISnapshot.useMutation()

    // Test AI generation capabilities
    const testAIGeneration = api.snapshot.testAIGeneration.useMutation()

    const [isGenerating, setIsGenerating] = useState(false)
    const [isTesting, setIsTesting] = useState(false)

    // Check API key status on mount (only once)
    useEffect(() => {
        const checkApiKey = async () => {
            try {
                const result = await testAIGeneration.mutateAsync()
                setApiKeyStatus(result.overall ? 'configured' : 'missing')
            } catch {
                setApiKeyStatus('missing')
            }
        }
        // Only run if we haven't checked yet
        if (apiKeyStatus === 'checking') {
            void checkApiKey()
        }
    }, [apiKeyStatus])

    const handleGenerate = async () => {
        if (!url) return

        setIsGenerating(true)
        try {
            console.log('Starting AI generation with:', { url, includeMobile, includeTablet, quality, style })
            const result = await generateAISnapshot.mutateAsync({
                url,
                includeMobile,
                includeTablet,
                quality,
                style
            })
            console.log('AI generation result:', result)
        } catch (error) {
            console.error('Failed to generate AI snapshot:', error)
            // Show more detailed error information
            if (error instanceof Error) {
                console.error('Error details:', error.message)
                console.error('Error stack:', error.stack)
            }
        } finally {
            setIsGenerating(false)
        }
    }

    const handleTest = async () => {
        setIsTesting(true)
        try {
            const result = await testAIGeneration.mutateAsync()
            console.log('AI Test Result:', result)
        } catch (error) {
            console.error('Failed to test AI generation:', error)
        } finally {
            setIsTesting(false)
        }
    }

    const handleDownload = (pngUrl: string, title: string) => {
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `${title}-portfolio-card.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`
        return `${(ms / 1000).toFixed(1)}s`
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">AI Portfolio Snapshot Tester</h1>
                <p className="text-muted-foreground">
                    Test the new AI-driven portfolio card generation system
                </p>
                {apiKeyStatus === 'checking' && (
                    <p className="text-blue-600 text-sm mt-2">Checking API configuration...</p>
                )}
                {apiKeyStatus === 'missing' && (
                    <p className="text-red-600 text-sm mt-2">⚠️ OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.</p>
                )}
                {apiKeyStatus === 'configured' && (
                    <p className="text-green-600 text-sm mt-2">✅ AI system ready</p>
                )}
            </div>

            {/* Test Controls */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>

                <div className="space-y-4">
                    {/* URL Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Website URL</label>
                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Device Options */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Screenshot Options</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={includeMobile}
                                    onChange={(e) => setIncludeMobile(e.target.checked)}
                                />
                                <Smartphone className="w-4 h-4" />
                                Mobile
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={includeTablet}
                                    onChange={(e) => setIncludeTablet(e.target.checked)}
                                />
                                <Tablet className="w-4 h-4" />
                                Tablet
                            </label>
                        </div>
                    </div>

                    {/* Quality and Style */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Quality</label>
                            <select
                                value={quality}
                                onChange={(e) => setQuality(e.target.value as 'high' | 'medium' | 'low')}
                                className="w-full p-2 border rounded"
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Style</label>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value as 'modern' | 'professional' | 'creative' | 'minimal')}
                                className="w-full p-2 border rounded"
                            >
                                <option value="modern">Modern</option>
                                <option value="professional">Professional</option>
                                <option value="creative">Creative</option>
                                <option value="minimal">Minimal</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleGenerate}
                            disabled={!url || isGenerating}
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating AI Snapshot...
                                </>
                            ) : (
                                <>
                                    <Monitor className="w-4 h-4 mr-2" />
                                    Generate AI Snapshot
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleTest}
                            disabled={isTesting}
                            variant="outline"
                        >
                            {isTesting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test AI System'
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Test Results */}
            {testAIGeneration.data && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">AI System Test Results</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <Badge variant={testAIGeneration.data.aiGeneration ? "default" : "destructive"}>
                                {testAIGeneration.data.aiGeneration ? "✅ AI Generation" : "❌ AI Generation"}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <Badge variant={testAIGeneration.data.pngConversion ? "default" : "destructive"}>
                                {testAIGeneration.data.pngConversion ? "✅ PNG Conversion" : "❌ PNG Conversion"}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <Badge variant={testAIGeneration.data.overall ? "default" : "destructive"}>
                                {testAIGeneration.data.overall ? "✅ Overall System" : "❌ Overall System"}
                            </Badge>
                        </div>
                    </div>
                    {testAIGeneration.data.error && (
                        <p className="text-red-500 mt-2 text-sm">{testAIGeneration.data.error}</p>
                    )}
                </Card>
            )}

            {/* Auto-Generation Status */}
            {isGenerating && (
                <Card className="p-6 border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <div>
                            <h3 className="font-semibold text-blue-800">Auto-Generating AI Snapshot</h3>
                            <p className="text-sm text-blue-600">This may take 30-60 seconds for the first generation...</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Generated Snapshot */}
            {generateAISnapshot.data && (
                <Card className="p-6 border-green-200 bg-green-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h2 className="text-xl font-semibold text-green-800">✅ AI Snapshot Generated Successfully!</h2>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Generation Time</p>
                            <p className="font-medium">{formatTime(generateAISnapshot.data.metadata.generationTime)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">AI Model</p>
                            <p className="font-medium">{generateAISnapshot.data.metadata.aiModel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Quality</p>
                            <Badge variant="outline">{generateAISnapshot.data.metadata.quality}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Screenshots</p>
                            <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">Desktop</Badge>
                                {generateAISnapshot.data.screenshots.mobile && (
                                    <Badge variant="outline" className="text-xs">Mobile</Badge>
                                )}
                                {generateAISnapshot.data.screenshots.tablet && (
                                    <Badge variant="outline" className="text-xs">Tablet</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Website Info */}
                    <div className="mb-4">
                        <h3 className="font-semibold">{generateAISnapshot.data.websiteAnalysis.websiteData.title}</h3>
                        <p className="text-sm text-muted-foreground">{generateAISnapshot.data.websiteAnalysis.websiteData.url}</p>
                        <p className="text-sm">{generateAISnapshot.data.websiteAnalysis.analysis.category} • {generateAISnapshot.data.websiteAnalysis.analysis.purpose}</p>
                    </div>

                    {/* Generated Image */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleDownload(generateAISnapshot.data.pngUrl, generateAISnapshot.data.websiteAnalysis.websiteData.title)}
                                size="sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PNG
                            </Button>
                            <Button
                                onClick={() => window.open(generateAISnapshot.data.pngUrl, '_blank')}
                                size="sm"
                                variant="outline"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Full Size
                            </Button>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <img
                                src={generateAISnapshot.data.pngUrl}
                                alt="Generated Portfolio Card"
                                className="w-full h-auto"
                                style={{ maxHeight: '400px', objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Error Display */}
            {generateAISnapshot.error && (
                <Card className="p-6 border-red-200 bg-red-50">
                    <h2 className="text-xl font-semibold mb-2 text-red-800">Error</h2>
                    <p className="text-red-600">{generateAISnapshot.error.message}</p>
                </Card>
            )}
        </div>
    )
} 