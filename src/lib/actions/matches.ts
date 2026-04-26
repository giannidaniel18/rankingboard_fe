'use server'

import { store } from '@/lib/store'
import { rankPlayers, computePointsDelta, determineWinner } from '@/lib/engine/ranking'
import { checkAchievements, buildAchievement } from '@/lib/engine/achievements'
import type { Match, MatchPlayer } from '@/lib/types'

export type CreateMatchInput = {
  group_id: string
  game_id: string
  players: Array<{ user_id: string; score: number }>
  date: string
  comments?: string
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const rankedPlayers = rankPlayers(input.players)
  const winner_id = determineWinner(rankedPlayers)

  const match: Match = {
    id: crypto.randomUUID(),
    group_id: input.group_id,
    game_id: input.game_id,
    players: rankedPlayers,
    winner_id,
    date: new Date(input.date),
    comments: input.comments,
  }

  store.matches.set(match.id, match)
  applyMatchResults(rankedPlayers, winner_id)

  return match
}

function applyMatchResults(players: MatchPlayer[], winner_id: string): void {
  for (const player of players) {
    const user = store.users.get(player.user_id)
    if (!user) continue

    const isWinner = player.user_id === winner_id
    const delta = computePointsDelta(player.rank, players.length)
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
