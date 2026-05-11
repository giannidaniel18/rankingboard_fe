import useMatchesStore from '@/store/useMatchesStore'
import matchesService from '@/services/matchesService'
import type { MatchParticipant } from '@/types'

type ParticipantInput = Pick<MatchParticipant, 'userId' | 'placement' | 'score'>

export function useMatches() {
  const {
    isSubmitting,
    matchesByGroup,
    isLoadingMatches,
    recentMatches,
    isLoadingRecent,
    setSubmitting,
    setGroupMatches,
    setLoadingMatches,
    setRecentMatches,
    setLoadingRecent,
  } = useMatchesStore()

  async function recordMatch(
    gameId: string,
    groupId: string | undefined,
    participants: ParticipantInput[],
  ): Promise<void> {
    setSubmitting(true)
    try {
      await matchesService.createMatch(gameId, groupId, participants)
    } finally {
      setSubmitting(false)
    }
  }

  async function loadGroupMatches(groupId: string): Promise<void> {
    setLoadingMatches(true)
    try {
      const matches = await matchesService.getMatchesByGroup(groupId)
      setGroupMatches(groupId, matches)
    } finally {
      setLoadingMatches(false)
    }
  }

  async function loadRecentMatches(userId: string, limit?: number): Promise<void> {
    setLoadingRecent(true)
    try {
      const matches = await matchesService.getUserRecentMatches(userId, limit)
      setRecentMatches(matches)
    } finally {
      setLoadingRecent(false)
    }
  }

  return {
    isSubmitting,
    matchesByGroup,
    isLoadingMatches,
    recentMatches,
    isLoadingRecent,
    recordMatch,
    loadGroupMatches,
    loadRecentMatches,
  }
}
