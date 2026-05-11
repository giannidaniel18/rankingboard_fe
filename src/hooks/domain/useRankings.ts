import useRankingsStore from '@/store/useRankingsStore'
import rankingsService from '@/services/rankingsService'

export function useRankings() {
  const { rankingsByGroup, isLoading, setRankings, setLoading } = useRankingsStore()

  async function loadRankings(groupId: string): Promise<void> {
    setLoading(true)
    try {
      const data = await rankingsService.getGroupRankings(groupId)
      setRankings(groupId, data)
    } finally {
      setLoading(false)
    }
  }

  return { rankingsByGroup, isLoading, loadRankings }
}
