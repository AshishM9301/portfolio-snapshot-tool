import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { JobStatusJson } from '@/types'
import Image from 'next/image'

interface JobStatusProps {
    jobId: string
    url: string
}

type Status = 'queued' | 'processing' | 'completed' | 'failed'

export function JobStatus({ jobId, url }: JobStatusProps) {
    const [status, setStatus] = useState<Status>('queued')
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        let stopped = false
        const poll = async () => {
            try {
                const res = await fetch(`/api/job-status/${jobId}`)
                const data = await res.json() as JobStatusJson
                setStatus(data.status as Status)
                setResultUrl(data.resultUrl ?? null)
                setError(data.error ?? null)
                if (data.status === 'completed' || data.status === 'failed') {
                    stopped = true
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage)
            }
        }
        void poll()
        // eslint-disable-next-line prefer-const
        interval = setInterval(() => {
            if (!stopped) void poll()
        }, 2000)
        return () => clearInterval(interval)
    }, [jobId])

    // console.log(status, resultUrl, error)

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 border rounded p-4">
            <div className="flex-1">
                <div className="font-mono text-xs text-muted-foreground break-all">{url}</div>
                <div className="mt-1">
                    <span className={
                        status === 'completed' ? 'text-green-600' :
                            status === 'failed' ? 'text-red-600' :
                                'text-blue-600'
                    }>
                        {status === 'queued' && 'Queued'}
                        {status === 'processing' && 'Processing...'}
                        {status === 'completed' && 'Completed'}
                        {status === 'failed' && 'Failed'}
                    </span>
                </div>
                {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
                {status === 'completed' && resultUrl && (
                    <div className="flex-1">
                        <Image src={resultUrl} alt="Snapshot" className="w-full h-auto" fill />
                    </div>
                )}
            </div>


            {status === 'completed' && resultUrl && (
                <Button
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = resultUrl;
                        link.download = 'portfolio-snapshot.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                    size="sm"
                >
                    Download Snapshot
                </Button>
            )}
        </div>
    )
} 