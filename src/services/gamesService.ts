import type { Game } from '@/types'
import { store } from '@/lib/store'

const gamesService = {
  getAllGames(): Promise<Game[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(store.getAllGames()), 300)
    })
  },
}

export default gamesService
