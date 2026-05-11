import { create } from 'zustand'
import type { Game } from '@/types'

interface GamesState {
  games: Game[]
  isLoading: boolean
  setGames: (games: Game[]) => void
  setLoading: (isLoading: boolean) => void
}

const useGamesStore = create<GamesState>((set) => ({
  games: [],
  isLoading: false,
  setGames: (games) => set({ games }),
  setLoading: (isLoading) => set({ isLoading }),
}))

export default useGamesStore
