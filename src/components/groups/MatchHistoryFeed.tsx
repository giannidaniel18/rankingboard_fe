'use client'

import { useEffect } from 'react'
import { useMatches } from '@/hooks/domain/useMatches'
import type { MatchDetail } from '@/types'

type PlacementTier = 1 | 2 | 3 | 'other'

function getTier(placement: number): PlacementTier {
  if (placement <= 3) return placement as PlacementTier
  return 'other'
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
  const hasScores = sorted.some(p => p.score !== undefined)

  return (
    <div className="border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 px-5 py-4 hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
      {/* Match meta row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-heading text-[10px] font-bold tracking-[0.18em] uppercase text-amber-500 dark:text-amber-400">
          {match.gameName}
        </span>
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
          const tier = getTier(p.placement)
          return (
            <div key={p.userId} className={`flex items-center gap-2 ${ROW_ACCENT[tier]}`}>
              <span className={`font-mono text-[10px] w-6 shrink-0 tabular-nums ${PLACEMENT_CLASS[tier]}`}>
                {PLACEMENT_LABEL[tier]}
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

function EmptyState() {
  return (
    <div className="px-5 py-10 flex flex-col items-center gap-2 text-center">
      <span className="font-mono text-2xl text-neutral-300 dark:text-neutral-700">◇</span>
      <p className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
        No matches yet
      </p>
    </div>
  )
}

export default function MatchHistoryFeed({ groupId }: { groupId: string }) {
  const { matchesByGroup, isLoadingMatches, loadGroupMatches } = useMatches()
  const matches = matchesByGroup[groupId]

  useEffect(() => {
    void loadGroupMatches(groupId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  if (isLoadingMatches && !matches) return <FeedSkeleton />

  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline justify-between px-5 py-3.5 border-b border-black/[0.08] dark:border-white/[0.07]">
        <h2 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
          Match History
        </h2>
        <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {matches?.length ?? 0} matches
        </span>
      </div>

      {!matches || matches.length === 0 ? (
        <EmptyState />
      ) : (
        matches.map(match => <MatchCard key={match.id} match={match} />)
      )}
    </div>
  )
}
