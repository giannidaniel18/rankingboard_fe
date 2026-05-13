import useMatchesStore from '@/store/useMatchesStore'
import type { MatchDetail } from '@/types'

export type MatchResult = 'win' | 'loss' | 'tie'

export interface HeadToHeadStats {
  totalMatches: number
  winsA: number
  winsB: number
  ties: number
  winRateA: number
  winRateB: number
  avgPlacementA: number
  avgPlacementB: number
}

export interface PlayerTrends {
  last5: MatchResult[]
  nemesisId: string | null
  nemesisName: string | null
  favoriteVictimId: string | null
  favoriteVictimName: string | null
}

export function useAnalytics() {
  const { matchesByGroup } = useMatchesStore()
  const allMatches: MatchDetail[] = Object.values(matchesByGroup).flat()

  function getHeadToHead(playerAId: string, playerBId: string): HeadToHeadStats {
    const shared = allMatches.filter(
      m =>
        m.participants.some(p => p.userId === playerAId) &&
        m.participants.some(p => p.userId === playerBId),
    )

    let winsA = 0
    let winsB = 0
    let ties = 0
    let totalPlacementA = 0
    let totalPlacementB = 0

    for (const match of shared) {
      const pA = match.participants.find(p => p.userId === playerAId)
      const pB = match.participants.find(p => p.userId === playerBId)
      if (!pA || !pB) continue

      totalPlacementA += pA.placement
      totalPlacementB += pB.placement

      const aFirst = pA.placement === 1
      const bFirst = pB.placement === 1

      if (aFirst && bFirst) {
        ties++
      } else if (aFirst) {
        winsA++
      } else if (bFirst) {
        winsB++
      }
    }

    const total = shared.length
    return {
      totalMatches: total,
      winsA,
      winsB,
      ties,
      winRateA: total > 0 ? winsA / total : 0,
      winRateB: total > 0 ? winsB / total : 0,
      avgPlacementA: total > 0 ? totalPlacementA / total : 0,
      avgPlacementB: total > 0 ? totalPlacementB / total : 0,
    }
  }

  function getPlayerTrends(playerId: string): PlayerTrends {
    const playerMatches = allMatches
      .filter(m => m.participants.some(p => p.userId === playerId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const last5: MatchResult[] = playerMatches.slice(0, 5).map(match => {
      const self = match.participants.find(p => p.userId === playerId)
      if (!self || self.placement !== 1) return 'loss'
      const sharedFirst = match.participants.some(
        p => p.userId !== playerId && p.placement === 1,
      )
      return sharedFirst ? 'tie' : 'win'
    })

    const lossesAgainst: Record<string, { count: number; name: string }> = {}
    const winsAgainst: Record<string, { count: number; name: string }> = {}

    for (const match of playerMatches) {
      const self = match.participants.find(p => p.userId === playerId)
      if (!self) continue

      const selfFirst = self.placement === 1
      const isTied =
        selfFirst &&
        match.participants.some(p => p.userId !== playerId && p.placement === 1)

      if (isTied) continue

      if (selfFirst) {
        for (const opp of match.participants) {
          if (opp.userId === playerId) continue
          if (!winsAgainst[opp.userId])
            winsAgainst[opp.userId] = { count: 0, name: opp.name }
          winsAgainst[opp.userId].count++
        }
      } else {
        for (const winner of match.participants) {
          if (winner.userId === playerId || winner.placement !== 1) continue
          if (!lossesAgainst[winner.userId])
            lossesAgainst[winner.userId] = { count: 0, name: winner.name }
          lossesAgainst[winner.userId].count++
        }
      }
    }

    let nemesisId: string | null = null
    let nemesisName: string | null = null
    let maxLosses = 0
    for (const [id, data] of Object.entries(lossesAgainst)) {
      if (data.count > maxLosses) {
        maxLosses = data.count
        nemesisId = id
        nemesisName = data.name
      }
    }

    let favoriteVictimId: string | null = null
    let favoriteVictimName: string | null = null
    let maxWins = 0
    for (const [id, data] of Object.entries(winsAgainst)) {
      if (data.count > maxWins) {
        maxWins = data.count
        favoriteVictimId = id
        favoriteVictimName = data.name
      }
    }

    return { last5, nemesisId, nemesisName, favoriteVictimId, favoriteVictimName }
  }

  return { getHeadToHead, getPlayerTrends }
}
