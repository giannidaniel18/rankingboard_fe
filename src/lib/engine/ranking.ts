import type { MatchPlayer } from '@/types'

const WIN_POINTS = 25
const MAX_LOSS_POINTS = 15

/**
 * Assigns ranks to players sorted by score descending.
 * Tied scores share the same rank.
 */
export function rankPlayers(
  players: Array<{ user_id: string; score: number }>
): MatchPlayer[] {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  let currentRank = 1
  return sorted.map((player, i) => {
    if (i > 0 && player.score < sorted[i - 1].score) currentRank = i + 1
    return { ...player, rank: currentRank }
  })
}

/**
 * Point delta for a given rank position.
 * Rank 1 earns WIN_POINTS; lower ranks lose proportionally.
 */
export function computePointsDelta(rank: number, totalPlayers: number): number {
  if (rank === 1) return WIN_POINTS
  if (totalPlayers === 1) return 0
  const factor = (rank - 1) / (totalPlayers - 1)
  return -Math.round(factor * MAX_LOSS_POINTS)
}

export function determineWinner(players: MatchPlayer[]): string {
  return players.reduce((best, p) => (p.rank < best.rank ? p : best)).user_id
}
