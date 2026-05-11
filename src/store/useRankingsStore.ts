import { create } from 'zustand'
import type { RankedMember } from '@/types'

interface RankingsState {
  rankingsByGroup: Record<string, RankedMember[]>
  isLoading: boolean
  setRankings: (groupId: string, rankings: RankedMember[]) => void
  setLoading: (isLoading: boolean) => void
}

const useRankingsStore = create<RankingsState>((set) => ({
  rankingsByGroup: {},
  isLoading: false,
  setRankings: (groupId, rankings) =>
    set((state) => ({ rankingsByGroup: { ...state.rankingsByGroup, [groupId]: rankings } })),
  setLoading: (isLoading) => set({ isLoading }),
}))

export default useRankingsStore
