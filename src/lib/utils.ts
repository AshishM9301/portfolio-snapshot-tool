import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL validation and extraction utilities
export interface UrlValidationResult {
  url: string
  isValid: boolean
  isAccessible: boolean
  status?: number
  error?: string
  isLoading: boolean
}

export function extractUrlsFromText(text: string): string[] {
  // More lenient regex to match various URL formats
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,})/g
  const matches = text.match(urlRegex) ?? []

  // Clean and normalize URLs
  return matches
    .map(url => {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`
      }
      return url
    })
    .filter((url, index, self) => self.indexOf(url) === index) // Remove duplicates
}

interface ValidationApiResponse {
  isAccessible: boolean
  status?: number
  error?: string
}

export async function validateUrl(url: string): Promise<Omit<UrlValidationResult, 'isLoading'>> {
  try {
    // Basic URL format validation
    const urlObj = new URL(url)

    // Check if it's a valid URL format
    if (!urlObj.hostname) {
      return {
        url,
        isValid: false,
        isAccessible: false,
        error: 'Invalid URL format'
      }
    }

    // Use the API to actually test if the URL is accessible
    const response = await fetch(`/api/validate-url?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      cache: 'no-cache'
    })

    console.log('API Response:', response)
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      return {
        url,
        isValid: true, // URL format is valid
        isAccessible: false,
        error: `Validation API error: ${response.status}`
      }
    }

    const result = await response.json() as ValidationApiResponse
    console.log('API Result:', result)

    return {
      url,
      isValid: true,
      isAccessible: result.isAccessible,
      status: result.status,
      error: result.error
    }
  } catch (error) {
    return {
      url,
      isValid: false,
      isAccessible: false,
      error: error instanceof Error ? error.message : 'Failed to validate URL'
    }
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
