'use client'

import { useEffect } from 'react'
import { useMatches } from '@/hooks/domain/useMatches'
import { useAuth } from '@/hooks/domain/useAuth'
import { useI18n } from '@/components/providers/I18nProvider'
import type { GameType, MatchDetail } from '@/types'

const GAME_TYPE_STYLES: Record<GameType, string> = {
  Board:  'text-amber-600  dark:text-amber-500  bg-amber-500/10  border-amber-500/20',
  eSport: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  Sports: 'text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
}

function MatchCard({ match }: { match: MatchDetail }) {
  const sorted = [...match.participants].sort((a, b) => a.placement - b.placement)

  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
            {match.gameName}
          </span>
          {match.groupName && (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-400 font-mono shrink-0">
              {match.groupName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {match.gameType && (
            <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-semibold tracking-wide uppercase ${GAME_TYPE_STYLES[match.gameType]}`}>
              {match.gameType}
            </span>
          )}
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-400">
            {new Date(match.date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Player results */}
      <ol className="px-4 py-2 space-y-0.5">
        {sorted.map(mp => {
          const isWinner = mp.placement === 1
          return (
            <li
              key={mp.userId}
              className={`flex items-center gap-3 text-sm px-2 py-1.5 rounded-sm ${isWinner ? 'bg-amber-500/[0.08]' : ''}`}
            >
              <span className="w-4 font-mono text-[11px] text-neutral-400 dark:text-neutral-400 text-center shrink-0">
                {mp.placement}
              </span>
              <span className={`flex-1 truncate ${
                isWinner
                  ? 'font-semibold text-amber-600 dark:text-amber-400'
                  : 'text-neutral-700 dark:text-neutral-300'
              }`}>
                {mp.name}
              </span>
              <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-400 shrink-0 tabular-nums">
                {mp.score != null ? `${mp.score} pts` : '—'}
              </span>
            </li>
          )
        })}
      </ol>

      {match.comments && (
        <p className="px-4 pb-3 text-[11px] text-neutral-400 dark:text-neutral-400 italic">
          &ldquo;{match.comments}&rdquo;
        </p>
      )}
    </div>
  )
}

function RecentMatchesSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
          <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05] flex justify-between">
            <div className="h-4 w-24 rounded bg-black/[0.06] dark:bg-white/[0.06]" />
            <div className="h-4 w-20 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
          </div>
          <div className="px-4 py-2 space-y-1.5">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="h-8 rounded-sm bg-black/[0.03] dark:bg-white/[0.03]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RecentMatches() {
  const { recentMatches, isLoadingRecent, loadRecentMatches } = useMatches()
  const { currentUser } = useAuth()
  const { dict } = useI18n()

  useEffect(() => {
    if (!currentUser?.id) return
    void loadRecentMatches(currentUser.id, 8)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id])

  if (isLoadingRecent && recentMatches.length === 0) return <RecentMatchesSkeleton />

  if (recentMatches.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400 dark:text-neutral-400 text-sm">
        {dict.dashboard.noMatches}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {recentMatches.map(match => <MatchCard key={match.id} match={match} />)}
    </div>
  )
}
