import type { MatchParticipant, MatchDetail } from '@/types'
import { store } from '@/lib/store'
import { computePointsDelta } from '@/lib/engine/ranking'
import { checkAchievements, buildAchievement } from '@/lib/engine/achievements'

type ParticipantInput = Pick<MatchParticipant, 'userId' | 'placement' | 'score'>

const matchesService = {
  createMatch(
    gameId: string,
    groupId: string | undefined,
    participants: ParticipantInput[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const fullParticipants: MatchParticipant[] = participants.map(p => ({ ...p }))

          store.matches.set(crypto.randomUUID(), {
            id: crypto.randomUUID(),
            game_id: gameId,
            group_id: groupId,
            participants: fullParticipants,
            date: new Date(),
          })

          for (const participant of fullParticipants) {
            const user = store.users.get(participant.userId)
            if (!user) continue

            const isWinner = participant.placement === 1
            const delta = computePointsDelta(participant.placement, fullParticipants.length)
            const s = user.profile.stats

            s.totalMatches++
            if (isWinner) {
              s.wins++
              s.currentStreak++
              s.bestStreak = Math.max(s.bestStreak, s.currentStreak)
            } else {
              s.losses++
              s.currentStreak = 0
            }
            s.winRate = s.wins / s.totalMatches
            s.rankingPoints = Math.max(0, s.rankingPoints + delta)

            const newIds = checkAchievements(user)
            for (const id of newIds) {
              user.profile.achievements.push(buildAchievement(id))
            }

            store.users.set(user.id, user)
          }

          resolve()
        } catch (err) {
          reject(err)
        }
      }, 300)
    })
  },

  getMatchesByGroup(groupId: string): Promise<MatchDetail[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const matches = [...store.matches.values()]
          .filter(m => m.group_id === groupId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(m => {
            const game = store.games.get(m.game_id)
            return {
              id: m.id,
              group_id: m.group_id,
              game_id: m.game_id,
              gameName: game?.name ?? 'Unknown Game',
              gameType: game?.type,
              participants: m.participants.map(p => ({
                userId: p.userId,
                name: store.users.get(p.userId)?.name ?? 'Unknown',
                placement: p.placement,
                score: p.score,
              })),
              date: m.date,
              comments: m.comments,
            }
          })
        resolve(matches)
      }, 300)
    })
  },

  getUserRecentMatches(userId: string, limit = 10): Promise<MatchDetail[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const matches = [...store.matches.values()]
          .filter(m => m.participants.some(p => p.userId === userId))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit)
          .map(m => {
            const game = store.games.get(m.game_id)
            const group = m.group_id ? store.groups.get(m.group_id) : undefined
            return {
              id: m.id,
              group_id: m.group_id,
              game_id: m.game_id,
              gameName: game?.name ?? 'Unknown Game',
              gameType: game?.type,
              groupName: group?.name,
              participants: m.participants.map(p => ({
                userId: p.userId,
                name: store.users.get(p.userId)?.name ?? 'Unknown',
                placement: p.placement,
                score: p.score,
              })),
              date: m.date,
              comments: m.comments,
            }
          })
        resolve(matches)
      }, 300)
    })
  },
}

export default matchesService
