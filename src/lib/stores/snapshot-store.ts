import { create } from 'zustand'
import type { GeneratedSnapshot } from '@/types'

interface SnapshotState {
    snapshots: GeneratedSnapshot[]
    currentUrl: string
    isGenerating: boolean
    hasGenerated: boolean

    // Actions
    setSnapshots: (snapshots: GeneratedSnapshot[]) => void
    setCurrentUrl: (url: string) => void
    setIsGenerating: (isGenerating: boolean) => void
    setHasGenerated: (hasGenerated: boolean) => void
    clearSnapshots: () => void
    reset: () => void
}

export const useSnapshotStore = create<SnapshotState>((set) => ({
    snapshots: [],
    currentUrl: '',
    isGenerating: false,
    hasGenerated: false,

    setSnapshots: (snapshots) => set({ snapshots, hasGenerated: true }),
    setCurrentUrl: (currentUrl) => set({ currentUrl }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setHasGenerated: (hasGenerated) => set({ hasGenerated }),
    clearSnapshots: () => set({ snapshots: [], hasGenerated: false }),
    reset: () => set({ snapshots: [], currentUrl: '', isGenerating: false, hasGenerated: false })
})) 