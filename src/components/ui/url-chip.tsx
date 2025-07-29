import { cn } from '@/lib/utils'
import type { UrlValidationResult } from '@/lib/utils'
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa'

interface UrlChipProps {
    urlResult: UrlValidationResult
    onRemove: (url: string) => void
}

export function UrlChip({ urlResult, onRemove }: UrlChipProps) {
    const getStatusIcon = () => {
        if (urlResult.isLoading) {
            return <FaSpinner className="w-3 h-3 animate-spin" />
        }
        if (urlResult.isValid && urlResult.isAccessible) {
            return <FaCheck className="w-3 h-3" />
        }
        if (urlResult.isValid === false || urlResult.isAccessible === false) {
            return <FaTimes className="w-3 h-3" />
        }
        return null // No icon when not validated yet
    }

    const getStatusColor = () => {
        if (urlResult.isLoading) {
            return 'bg-gray-100 border-gray-300 text-gray-600'
        }
        if (urlResult.isValid && urlResult.isAccessible) {
            return 'bg-green-50 border-green-200 text-green-800'
        }
        if (urlResult.isValid === false || urlResult.isAccessible === false) {
            return 'bg-red-50 border-red-200 text-red-800'
        }
        return 'bg-gray-50 border-gray-200 text-gray-700' // Neutral state when not validated
    }

    const getStatusIconColor = () => {
        if (urlResult.isLoading) {
            return 'text-gray-500'
        }
        if (urlResult.isValid && urlResult.isAccessible) {
            return 'text-green-600'
        }
        if (urlResult.isValid === false || urlResult.isAccessible === false) {
            return 'text-red-600'
        }
        return 'text-gray-500'
    }

    return (
        <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium',
            getStatusColor()
        )}>
            {getStatusIcon() && (
                <span className={getStatusIconColor()}>
                    {getStatusIcon()}
                </span>
            )}
            <span className="truncate max-w-48">
                {urlResult.url.replace(/^https?:\/\//, '')}
            </span>
            {urlResult.error && (
                <span className="text-xs opacity-75 truncate max-w-32" title={urlResult.error}>
                    {urlResult.error}
                </span>
            )}
            <button
                onClick={() => onRemove(urlResult.url)}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                title="Remove URL"
            >
                ✕
            </button>
        </div>
    )
} 