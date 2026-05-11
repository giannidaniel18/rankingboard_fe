import useGamesStore from '@/store/useGamesStore'
import gamesService from '@/services/gamesService'

export function useGames() {
  const { games, isLoading, setGames, setLoading } = useGamesStore()

  async function loadAllGames(): Promise<void> {
    setLoading(true)
    try {
      const data = await gamesService.getAllGames()
      setGames(data)
    } catch {
      // games list failures are non-critical; leave existing state
    } finally {
      setLoading(false)
    }
  }

  return { games, isLoading, loadAllGames }
}
