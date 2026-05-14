'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMatches } from '@/hooks/domain/useMatches'
import type { MatchDetail, MatchParticipantDetail } from '@/types'

type PlacementTier = 1 | 2 | 3 | 'other'
type TypeFilter = 'all' | 'tournament' | 'casual'

function getTier(placement: number): PlacementTier {
  if (placement <= 3) return placement as PlacementTier
  return 'other'
}

// 1224 rule: rank = index of first participant sharing the same placement + 1
function computeRank(sorted: MatchParticipantDetail[], participant: MatchParticipantDetail): number {
  const firstIndex = sorted.findIndex(p => p.placement === participant.placement)
  return firstIndex + 1
}

const PLACEMENT_LABEL: Record<PlacementTier, string> = {
  1: '#1',
  2: '#2',
  3: '#3',
  other: '#—',
}

const PLACEMENT_CLASS: Record<PlacementTier, string> = {
  1: 'text-amber-400 dark:text-amber-400 font-bold',
  2: 'text-neutral-400 dark:text-neutral-300 font-semibold',
  3: 'text-amber-700 dark:text-amber-600 font-semibold',
  other: 'text-neutral-400 font-normal',
}

const ROW_ACCENT: Record<PlacementTier, string> = {
  1: 'border-l-2 border-amber-500/60 pl-2',
  2: 'border-l-2 border-neutral-400/25 pl-2',
  3: 'border-l-2 border-amber-700/25 pl-2',
  other: 'pl-[10px]',
}

function relativeDate(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  const w = Math.floor(d / 7)
  const mo = Math.floor(d / 30)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  if (w < 5) return `${w}w ago`
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

function formatMatchDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function MatchCard({ match }: { match: MatchDetail }) {
  const sorted = [...match.participants].sort((a, b) => a.placement - b.placement)
  const isTournament = Boolean(match.tournamentId)
  const allScoresZero = sorted.every(p => p.score === 0)
  const hasScores = !isTournament && !allScoresZero && sorted.some(p => p.score !== undefined)

  return (
    <div className={`border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 px-5 py-4 hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors ${isTournament ? 'border-l-2 border-l-amber-500/50' : ''}`}>
      {/* Match meta row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-heading text-[10px] font-bold tracking-[0.18em] uppercase text-amber-500 dark:text-amber-400">
            {match.gameName}
          </span>
          {isTournament && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold tracking-[0.1em] uppercase bg-amber-500/10 text-amber-400 border-amber-500/20">
              🏆 Torneo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 hidden sm:inline">
            {formatMatchDate(match.date)}
          </span>
          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-500">
            {relativeDate(match.date)}
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-1">
        {sorted.map(p => {
          const rank = computeRank(sorted, p)
          const tier = getTier(rank)
          const label = tier === 'other' ? `#${rank}` : PLACEMENT_LABEL[tier]
          return (
            <div key={p.userId} className={`flex items-center gap-2 ${ROW_ACCENT[tier]}`}>
              <span className={`font-mono text-[10px] w-6 shrink-0 tabular-nums ${PLACEMENT_CLASS[tier]}`}>
                {label}
              </span>
              <span className={`text-[13px] leading-snug truncate ${
                tier === 1
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 font-normal'
              }`}>
                {p.name}
              </span>
              {hasScores && p.score !== undefined && (
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 ml-auto shrink-0 tabular-nums">
                  {p.score}pts
                </span>
              )}
            </div>
          )
        })}
      </div>

      {match.comments && (
        <p className="mt-2 text-[11px] text-neutral-400 dark:text-neutral-500 font-mono italic truncate">
          {match.comments}
        </p>
      )}
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden animate-pulse">
      <div className="h-11 border-b border-black/[0.08] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-20 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
            <div className="h-3 w-16 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
            <div className="h-3.5 w-24 rounded bg-black/[0.03] dark:bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message = 'Aún no hay partidas' }: { message?: string }) {
  return (
    <div className="px-5 py-10 flex flex-col items-center gap-2 text-center">
      <span className="font-mono text-2xl text-neutral-300 dark:text-neutral-700">◇</span>
      <p className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
        {message}
      </p>
    </div>
  )
}

export default function MatchHistoryFeed({ groupId }: { groupId: string }) {
  const { matchesByGroup, isLoadingMatches, loadGroupMatches } = useMatches()
  const matches = matchesByGroup[groupId]
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [gameFilter, setGameFilter] = useState<string>('all')

  useEffect(() => {
    void loadGroupMatches(groupId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  const availableGames = useMemo(() => {
    if (!matches) return []
    const seen = new Set<string>()
    const games: { id: string; name: string }[] = []
    for (const m of matches) {
      if (!seen.has(m.game_id)) {
        seen.add(m.game_id)
        games.push({ id: m.game_id, name: m.gameName })
      }
    }
    return games.sort((a, b) => a.name.localeCompare(b.name))
  }, [matches])

  const filteredMatches = useMemo(() => {
    if (!matches) return []
    return matches.filter(m => {
      if (typeFilter === 'tournament' && !m.tournamentId) return false
      if (typeFilter === 'casual' && m.tournamentId) return false
      if (gameFilter !== 'all' && m.game_id !== gameFilter) return false
      return true
    })
  }, [matches, typeFilter, gameFilter])

  if (isLoadingMatches && !matches) return <FeedSkeleton />

  const hasMatches = Boolean(matches && matches.length > 0)

  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline justify-between px-5 py-3.5 border-b border-black/[0.08] dark:border-white/[0.07]">
        <h2 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
          Historial
        </h2>
        <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {matches?.length ?? 0} partidas
        </span>
      </div>

      {/* Filters — only shown when there are matches to filter */}
      {hasMatches && (
        <div className="px-5 py-3 border-b border-black/[0.08] dark:border-white/[0.07] space-y-3">
          {/* Type pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5">
            {([
              { value: 'all'        as TypeFilter, label: 'Todas'    },
              { value: 'tournament' as TypeFilter, label: 'Torneos'  },
              { value: 'casual'     as TypeFilter, label: 'Casuales' },
            ]).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTypeFilter(value)}
                className={`shrink-0 px-4 py-2 rounded-full border text-[10px] font-bold tracking-[0.12em] uppercase transition-all min-h-[36px] ${
                  typeFilter === value
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'border-black/[0.08] dark:border-white/[0.08] text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Game dropdown — only when more than one game exists */}
          {availableGames.length > 1 && (
            <div className="relative">
              <select
                value={gameFilter}
                onChange={e => setGameFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-surface text-[11px] font-mono text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-amber-500/50 transition-colors appearance-none cursor-pointer min-h-[36px]"
              >
                <option value="all">Todos los juegos</option>
                {availableGames.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {!hasMatches ? (
        <EmptyState />
      ) : filteredMatches.length === 0 ? (
        <EmptyState message="No hay partidas que coincidan con estos filtros" />
      ) : (
        filteredMatches.map(match => <MatchCard key={match.id} match={match} />)
      )}
    </div>
  )
}
