'use client'

import { useState } from 'react'
import type { Tournament, TournamentMatch } from '@/types'
import TournamentMatchCard from './TournamentMatchCard'

interface Props {
  tournament: Tournament
  isPrivileged: boolean
  onResolveMatch: (match: TournamentMatch) => void
  onResolveBye: (match: TournamentMatch) => void
}

export default function BracketView({ tournament, isPrivileged, onResolveMatch, onResolveBye }: Props) {
  const { rounds, teams } = tournament

  const defaultRoundId = (
    rounds.find(r => r.matches.some(m => m.status === 'pending')) ?? rounds[rounds.length - 1]
  )?.id ?? 1

  const [activeId, setActiveId] = useState(defaultRoundId)
  const activeRound = rounds.find(r => r.id === activeId)

  if (rounds.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Round tabs */}
      <div className="flex gap-0 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.07] dark:border-white/[0.07] rounded-xl p-1 overflow-x-auto">
        {rounds.map(round => {
          const done    = round.matches.every(m => m.status === 'completed')
          const hasTbd  = round.matches.every(m => !m.teamAId && !m.teamBId)
          const isActive = round.id === activeId

          return (
            <button
              key={round.id}
              onClick={() => setActiveId(round.id)}
              className={`relative flex-1 shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold tracking-[0.12em] uppercase transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-surface text-tx-primary shadow-sm shadow-black/10'
                  : 'text-tx-caption hover:text-tx-secondary'
              }`}
            >
              {round.name}
              <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                done    ? 'bg-win' :
                hasTbd  ? 'bg-black/[0.15] dark:bg-white/[0.20]' :
                          'bg-brand animate-pulse'
              }`} />
            </button>
          )
        })}
      </div>

      {activeRound && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-tx-caption">
              {activeRound.name}
            </h3>
            <span className="font-mono text-[10px] text-tx-caption">
              {activeRound.matches.filter(m => m.status === 'completed').length}/{activeRound.matches.length} completados
            </span>
          </div>

          {activeRound.matches.map(match => {
            const bothKnown = !!match.teamAId && !!match.teamBId
            const isBye     = match.status === 'pending' && !bothKnown && (!!match.teamAId || !!match.teamBId)

            const resolveHandler = match.status === 'pending'
              ? isBye
                ? () => onResolveBye(match)
                : bothKnown
                  ? () => onResolveMatch(match)
                  : undefined
              : undefined

            return (
              <div key={match.id}>
                <p className="font-mono text-[9px] text-tx-caption mb-1.5 px-0.5 tracking-[0.1em] uppercase">
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
}
