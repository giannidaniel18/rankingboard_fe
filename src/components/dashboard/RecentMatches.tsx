'use client'

import { useEffect } from 'react'
import { useMatches } from '@/hooks/domain/useMatches'
import { useAuth } from '@/hooks/domain/useAuth'
import { useI18n } from '@/components/providers/I18nProvider'
import type { GameType, MatchDetail } from '@/types'

const GAME_TYPE_STYLES: Record<GameType, string> = {
  Board:  'text-brand-text dark:text-brand bg-brand/10 border-brand/20',
  eSport: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  Sports: 'text-win bg-win/10 border-win/20',
}

function MatchCard({ match }: { match: MatchDetail }) {
  const sorted = [...match.participants].sort((a, b) => a.placement - b.placement)

  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-medium text-sm text-tx-primary truncate">
            {match.gameName}
          </span>
          {match.groupName && (
            <span className="text-[11px] text-tx-caption font-mono shrink-0">
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
          <span className="text-[11px] font-mono text-tx-caption">
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
              className={`flex items-center gap-3 text-sm px-2 py-1.5 rounded-sm ${isWinner ? 'bg-brand/[0.08]' : ''}`}
            >
              <span className="w-4 font-mono text-[11px] text-tx-caption text-center shrink-0">
                {mp.placement}
              </span>
              <span className={`flex-1 truncate ${
                isWinner
                  ? 'font-semibold text-brand'
                  : 'text-tx-secondary'
              }`}>
                {mp.name}
              </span>
              <span className="font-mono text-[11px] text-tx-caption shrink-0 tabular-nums">
                {mp.score != null ? `${mp.score} pts` : '—'}
              </span>
            </li>
          )
        })}
      </ol>

      {match.comments && (
        <p className="px-4 pb-3 text-[11px] text-tx-caption italic">
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
      <div className="text-center py-16 text-tx-caption text-sm">
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
