"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Home, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface DataLostMessageProps {
    onRegenerate: () => void
    isRegenerating?: boolean
}

export function DataLostMessage({ onRegenerate, isRegenerating = false }: DataLostMessageProps) {
    const router = useRouter()

    const handleGoHome = () => {
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <Card className="w-full max-w-md border-2 border-orange-200 bg-orange-50">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-orange-800">
                        Snapshots Lost
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-orange-700 font-medium">
                            Your snapshots have been lost due to page refresh
                        </p>
                        <p className="text-sm text-orange-600">
                            Don&apos;t worry! You can easily regenerate them or go back to the home page.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
                        >
                            {isRegenerating ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate Snapshots
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleGoHome}
                            variant="outline"
                            className="w-full h-12 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Back to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 