import { create } from 'zustand'
import type { MatchDetail } from '@/types'

interface MatchesState {
  isSubmitting: boolean
  matchesByGroup: Record<string, MatchDetail[]>
  isLoadingMatches: boolean
  recentMatches: MatchDetail[]
  isLoadingRecent: boolean
  setSubmitting: (isSubmitting: boolean) => void
  setGroupMatches: (groupId: string, matches: MatchDetail[]) => void
  setLoadingMatches: (isLoading: boolean) => void
  setRecentMatches: (matches: MatchDetail[]) => void
  setLoadingRecent: (isLoading: boolean) => void
}

const useMatchesStore = create<MatchesState>((set) => ({
  isSubmitting: false,
  matchesByGroup: {},
  isLoadingMatches: false,
  recentMatches: [],
  isLoadingRecent: false,
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setGroupMatches: (groupId, matches) =>
    set(state => ({ matchesByGroup: { ...state.matchesByGroup, [groupId]: matches } })),
  setLoadingMatches: (isLoadingMatches) => set({ isLoadingMatches }),
  setRecentMatches: (recentMatches) => set({ recentMatches }),
  setLoadingRecent: (isLoadingRecent) => set({ isLoadingRecent }),
}))

export default useMatchesStore
