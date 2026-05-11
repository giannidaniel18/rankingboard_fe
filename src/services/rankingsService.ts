import type { RankedMember } from '@/types'
import { store } from '@/lib/store'

const rankingsService = {
  getGroupRankings(groupId: string): Promise<RankedMember[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(store.getGroupRankings(groupId)), 300)
    })
  },
}

export default rankingsService
