'use client'

import { X } from 'lucide-react'
import { useAnalytics } from '@/hooks/domain/useAnalytics'
import type { RankedMember } from '@/types'

interface HeadToHeadCardProps {
  playerA: RankedMember
  playerB: RankedMember
  onClose: () => void
}

function Avatar({ name, colorClass }: { name: string; colorClass: string }) {
  return (
    <div
      className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}
    >
      {name[0].toUpperCase()}
    </div>
  )
}

export default function HeadToHeadCard({ playerA, playerB, onClose }: HeadToHeadCardProps) {
  const { getHeadToHead } = useAnalytics()
  const stats = getHeadToHead(playerA.userId, playerB.userId)

  const barA =
    stats.totalMatches > 0 ? Math.round((stats.winsA / stats.totalMatches) * 100) : 0
  const barB =
    stats.totalMatches > 0 ? Math.round((stats.winsB / stats.totalMatches) * 100) : 0

  const statGrid = [
    {
      label: 'Matches',
      value: stats.totalMatches > 0 ? String(stats.totalMatches) : '—',
    },
    {
      label: 'Win Rate',
      value:
        stats.totalMatches > 0
          ? `${Math.round(stats.winRateA * 100)}% / ${Math.round(stats.winRateB * 100)}%`
          : '—',
    },
    {
      label: 'Avg Rank',
      value:
        stats.totalMatches > 0
          ? `${stats.avgPlacementA.toFixed(1)} / ${stats.avgPlacementB.toFixed(1)}`
          : '—',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-xs bg-surface border border-black/[0.08] dark:border-white/[0.07] rounded shadow-2xl shadow-black/70 overflow-hidden">
        {/* Amber accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-primary/50" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-4 w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-black/[0.06] dark:border-white/[0.05]">
          <span className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
            Head to Head
          </span>
        </div>

        {/* Players + Versus Bar */}
        <div className="px-5 py-5 space-y-4">
          {/* Avatar row */}
          <div className="flex items-center gap-3">
            {/* Player A */}
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <Avatar
                name={playerA.name}
                colorClass="bg-primary text-secondary"
              />
              <p className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate w-full text-center leading-tight">
                {playerA.name}
              </p>
              <p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 truncate w-full text-center leading-tight">
                #{playerA.alias}
              </p>
            </div>

            {/* VS */}
            <div className="shrink-0 flex flex-col items-center gap-1 px-1">
              <span className="font-heading text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 dark:text-neutral-500">
                vs
              </span>
            </div>

            {/* Player B */}
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <Avatar
                name={playerB.name}
                colorClass="bg-sky-500 text-white dark:bg-sky-500"
              />
              <p className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate w-full text-center leading-tight">
                {playerB.name}
              </p>
              <p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 truncate w-full text-center leading-tight">
                #{playerB.alias}
              </p>
            </div>
          </div>

          {/* Win counts */}
          <div className="flex items-end justify-between">
            <span className="font-mono text-xl font-bold text-primary dark:text-primary tabular-nums leading-none">
              {stats.winsA}
            </span>
            {stats.ties > 0 && (
              <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                {stats.ties}T
              </span>
            )}
            <span className="font-mono text-xl font-bold text-sky-500 dark:text-sky-400 tabular-nums leading-none">
              {stats.winsB}
            </span>
          </div>

          {/* Versus bar */}
          <div className="relative h-1 w-full rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            {stats.totalMatches > 0 ? (
              <>
                <div
                  className="absolute left-0 top-0 bottom-0 bg-primary"
                  style={{ width: `${barA}%` }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 bg-sky-500"
                  style={{ width: `${barB}%` }}
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-neutral-300 dark:bg-neutral-700" />
            )}
          </div>

          {/* Win rate labels */}
          <div className="flex justify-between -mt-2">
            <span className="font-mono text-[10px] text-primary/80 dark:text-primary/70 tabular-nums">
              {Math.round(stats.winRateA * 100)}%
            </span>
            <span className="font-mono text-[10px] text-sky-500/80 dark:text-sky-400/70 tabular-nums">
              {Math.round(stats.winRateB * 100)}%
            </span>
          </div>
        </div>

        {/* Stat Grid */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.05] grid grid-cols-3 divide-x divide-black/[0.06] dark:divide-white/[0.05]">
          {statGrid.map(stat => (
            <div key={stat.label} className="px-3 py-3.5 flex flex-col items-center gap-1">
              <span className="font-heading text-[9px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 text-center">
                {stat.label}
              </span>
              <span className="font-mono text-[11px] font-bold text-neutral-900 dark:text-neutral-100 tabular-nums text-center">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {stats.totalMatches === 0 && (
          <div className="border-t border-black/[0.06] dark:border-white/[0.05] px-5 py-4 flex flex-col items-center gap-1.5">
            <span className="font-mono text-lg text-neutral-300 dark:text-neutral-700">◇</span>
            <p className="font-heading text-[9px] font-bold tracking-[0.18em] uppercase text-neutral-400 dark:text-neutral-500">
              No shared matches
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
