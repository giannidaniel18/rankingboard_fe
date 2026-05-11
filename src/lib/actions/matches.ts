'use server'

import { store } from '@/lib/store'
import { rankPlayers, computePointsDelta } from '@/lib/engine/ranking'
import { checkAchievements, buildAchievement } from '@/lib/engine/achievements'
import type { Match, MatchParticipant } from '@/types'

export type CreateMatchInput = {
  group_id: string
  game_id: string
  players: Array<{ user_id: string; score: number }>
  date: string
  comments?: string
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const rankedPlayers = rankPlayers(input.players)
  const participants: MatchParticipant[] = rankedPlayers.map(p => ({
    userId: p.user_id,
    placement: p.rank,
    score: p.score,
  }))

  const match: Match = {
    id: crypto.randomUUID(),
    group_id: input.group_id,
    game_id: input.game_id,
    participants,
    date: new Date(input.date),
    comments: input.comments,
  }

  store.matches.set(match.id, match)
  applyMatchResults(participants)

  return match
}

function applyMatchResults(participants: MatchParticipant[]): void {
  for (const participant of participants) {
    const user = store.users.get(participant.userId)
    if (!user) continue

    const isWinner = participant.placement === 1
    const delta = computePointsDelta(participant.placement, participants.length)
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
}

export async function createMultiplayerMatch(
  gameId: string,
  groupId: string | undefined,
  participants: Omit<MatchParticipant, 'score' | 'team'>[]
): Promise<Match> {
  const fullParticipants: MatchParticipant[] = participants.map(p => ({ ...p }))

  const match: Match = {
    id: crypto.randomUUID(),
    game_id: gameId,
    group_id: groupId,
    participants: fullParticipants,
    date: new Date(),
  }

  store.matches.set(match.id, match)
  applyMatchResults(fullParticipants)

  return match
}

export async function getMatchesByGroup(groupId: string): Promise<Match[]> {
  return [...store.matches.values()]
    .filter(m => m.group_id === groupId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getRecentMatches(limit = 10): Promise<Match[]> {
  return [...store.matches.values()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
