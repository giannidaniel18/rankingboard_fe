import type { TournamentTeam, TournamentMatch, TournamentRound } from '@/types'

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function uid(tag: string): string {
  return `${tag}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function getRoundName(roundId: number, totalRounds: number): string {
  const fromEnd = totalRounds - roundId
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semifinales'
  if (fromEnd === 2) return 'Cuartos de Final'
  return `Ronda ${roundId}`
}

export function generateBracket(teams: TournamentTeam[]): TournamentRound[] {
  if (teams.length < 2) return []
  const seeded = shuffle(teams)
  const totalRounds = Math.ceil(Math.log2(seeded.length))
  const rounds: TournamentRound[] = []

  // Round 1: seed all teams
  const r1: TournamentMatch[] = []
  for (let i = 0; i < seeded.length; i += 2) {
    r1.push({
      id: uid(`tm_r1_m${i / 2 + 1}`),
      roundId: 1,
      matchNumber: i / 2 + 1,
      teamAId: seeded[i]?.id ?? null,
      teamBId: seeded[i + 1]?.id ?? null,
      status: 'pending',
    })
  }
  rounds.push({ id: 1, name: getRoundName(1, totalRounds), matches: r1 })

  // Rounds 2..N: pre-generate TBD slots so resolveTournamentMatch has a target to write into
  let prevCount = r1.length
  for (let r = 2; r <= totalRounds; r++) {
    const count = Math.ceil(prevCount / 2)
    const matches: TournamentMatch[] = Array.from({ length: count }, (_, i) => ({
      id: uid(`tm_r${r}_m${i + 1}`),
      roundId: r,
      matchNumber: i + 1,
      teamAId: null,
      teamBId: null,
      status: 'pending' as const,
    }))
    rounds.push({ id: r, name: getRoundName(r, totalRounds), matches })
    prevCount = count
  }

  return rounds
}

export function generateRoundRobin(teams: TournamentTeam[]): TournamentRound[] {
  if (teams.length < 2) return []

  const seeded = shuffle(teams)

  // Pad with null to make count even — standard circle method for odd team counts.
  // The null acts as a dummy "bye" opponent; pairings against it are skipped.
  const circle: (TournamentTeam | null)[] =
    seeded.length % 2 === 1 ? [...seeded, null] : [...seeded]

  const N = circle.length   // always even
  const rounds: TournamentRound[] = []

  for (let r = 0; r < N - 1; r++) {
    const matches: TournamentMatch[] = []
    let matchNum = 1

    for (let i = 0; i < N / 2; i++) {
      const teamA = circle[i]    ?? null
      const teamB = circle[N - 1 - i] ?? null

      // One side is the null dummy → bye week for the real team, skip
      if (!teamA || !teamB) continue

      matches.push({
        id: uid(`tm_rr_r${r + 1}_m${matchNum}`),
        roundId: r + 1,
        matchNumber: matchNum++,
        teamAId: teamA.id,
        teamBId: teamB.id,
        status: 'pending',
      })
    }

    rounds.push({ id: r + 1, name: `Fecha ${r + 1}`, matches })

    // Rotate: keep circle[0] fixed, bring last element to position 1
    const last = circle[N - 1] ?? null
    for (let i = N - 1; i > 1; i--) {
      circle[i] = circle[i - 1] ?? null
    }
    circle[1] = last
  }

  return rounds
}
