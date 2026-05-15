'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Tournament, TournamentMatch } from '@/types'
import TournamentMatchCard from './TournamentMatchCard'
import useGroupsStore from '@/store/useGroupsStore'

interface Props {
  tournament: Tournament
  isPrivileged: boolean
  onResolveMatch: (match: TournamentMatch) => void
  onResolveBye: (match: TournamentMatch) => void
}

export default function RoundRobinView({ tournament, isPrivileged, onResolveMatch, onResolveBye }: Props) {
  const { rounds, teams } = tournament
  const memberUsers = useGroupsStore(s => s.memberUsers)

  // Default expand the first round with a pending match
  const defaultOpen = rounds.find(r => r.matches.some(m => m.status === 'pending'))?.id
  const [openId, setOpenId] = useState<number | null>(defaultOpen ?? null)

  if (rounds.length === 0) return null

  // Standings: count wins per team across all completed matches
  const wins = new Map<string, number>()
  const played = new Map<string, number>()
  for (const t of teams) { wins.set(t.id, 0); played.set(t.id, 0) }
  for (const round of rounds) {
    for (const m of round.matches) {
      if (m.status !== 'completed' || !m.winnerTeamId) continue
      wins.set(m.winnerTeamId, (wins.get(m.winnerTeamId) ?? 0) + 1)
      if (m.teamAId) played.set(m.teamAId, (played.get(m.teamAId) ?? 0) + 1)
      if (m.teamBId) played.set(m.teamBId, (played.get(m.teamBId) ?? 0) + 1)
    }
  }

  const standings = [...teams]
    .map(t => ({ team: t, wins: wins.get(t.id) ?? 0, played: played.get(t.id) ?? 0 }))
    .sort((a, b) => b.wins - a.wins)

  const totalMatches = rounds.reduce((s, r) => s + r.matches.length, 0)
  const doneMatches  = rounds.reduce((s, r) => s + r.matches.filter(m => m.status === 'completed').length, 0)

  return (
    <div className="space-y-4">
      {/* Standings mini-table */}
      <div className="bg-surface border border-black/[0.08] dark:border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <h3 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-tx-primary">
            Tabla de Posiciones
          </h3>
          <span className="font-mono text-[10px] text-tx-caption">
            {doneMatches}/{totalMatches} partidos
          </span>
        </div>
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {standings.map(({ team, wins: w, played: p }, i) => {
            const playerNames = team.playerIds
              .map(id => memberUsers.find(u => u.id === id)?.alias)
              .filter((a): a is string => Boolean(a))
              .join(', ')
            return (
              <div key={team.id} className={`flex items-center gap-3 px-4 py-2.5 ${i === 0 && w > 0 ? 'bg-brand/[0.05]' : ''}`}>
                <span className={`font-mono text-[11px] font-bold w-4 shrink-0 ${
                  i === 0 ? 'text-brand' :
                  i === 1 ? 'text-tx-caption' :
                  i === 2 ? 'text-bronze' :
                            'text-tx-caption/60'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tx-primary truncate">
                    {team.name}
                  </p>
                  {playerNames && (
                    <p className="text-[10px] text-tx-caption font-normal mt-0.5 truncate">
                      {playerNames}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-tx-caption shrink-0">
                  <span className="tabular-nums">
                    <span className="text-win">{w}W</span>
                    <span className="text-tx-caption/40 mx-0.5">/</span>
                    <span className="text-loss">{p - w}L</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Round accordion */}
      <div className="space-y-2">
        {rounds.map(round => {
          const isOpen    = openId === round.id
          const roundDone = round.matches.every(m => m.status === 'completed')
          const hasPending = round.matches.some(m => m.status === 'pending' && m.teamAId && m.teamBId)

          return (
            <div key={round.id} className="border border-black/[0.08] dark:border-white/[0.07] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : round.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  roundDone   ? 'bg-win' :
                  hasPending  ? 'bg-brand animate-pulse' :
                                'bg-black/[0.15] dark:bg-white/[0.20]'
                }`} />
                <p className="flex-1 font-heading text-[11px] font-bold tracking-[0.15em] uppercase text-tx-primary">
                  {round.name}
                </p>
                <span className="font-mono text-[10px] text-tx-caption mr-2">
                  {round.matches.filter(m => m.status === 'completed').length}/{round.matches.length}
                </span>
                <ChevronDown className={`w-4 h-4 text-tx-caption transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-black/[0.05] dark:border-white/[0.04]">
                  {round.matches.map(match => {
                    const bothKnown = !!match.teamAId && !!match.teamBId
                    const isBye     = match.status === 'pending' && !bothKnown && (!!match.teamAId || !!match.teamBId)
                    const resolveHandler = match.status === 'pending'
                      ? isBye ? () => onResolveBye(match) : bothKnown ? () => onResolveMatch(match) : undefined
                      : undefined
                    return (
                      <div key={match.id}>
                        <p className="font-mono text-[9px] text-tx-caption mb-1.5 tracking-[0.1em] uppercase">
                          Partido {match.matchNumber}
                        </p>
                        <TournamentMatchCard
                          match={match}
                          teams={teams}
                          isPrivileged={isPrivileged}
                          onResolve={resolveHandler}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
