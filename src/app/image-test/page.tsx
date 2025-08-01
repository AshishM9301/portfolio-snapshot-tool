import { ImageSnapshotTester } from '../_components/image-snapshot-tester'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ImageTestPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">AI Testing Tools</h1>
                    <div className="flex gap-4">
                        <Link href="/ai-test">
                            <Button variant="outline">URL Testing</Button>
                        </Link>
                        <Link href="/image-test">
                            <Button variant="default">Image Testing</Button>
                        </Link>
                    </div>
                </div>
                <ImageSnapshotTester />
            </div>
        </div>
    )
} 