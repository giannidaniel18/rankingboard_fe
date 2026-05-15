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
    <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function HeadToHeadCard({ playerA, playerB, onClose }: HeadToHeadCardProps) {
  const { getHeadToHead } = useAnalytics()
  const stats = getHeadToHead(playerA.userId, playerB.userId)

  const barA = stats.totalMatches > 0 ? Math.round((stats.winsA / stats.totalMatches) * 100) : 0
  const barB = stats.totalMatches > 0 ? Math.round((stats.winsB / stats.totalMatches) * 100) : 0

  const statGrid = [
    { label: 'Matches', value: stats.totalMatches > 0 ? String(stats.totalMatches) : '—' },
    {
      label: 'Win Rate',
      value: stats.totalMatches > 0
        ? `${Math.round(stats.winRateA * 100)}% / ${Math.round(stats.winRateB * 100)}%`
        : '—',
    },
    {
      label: 'Avg Rank',
      value: stats.totalMatches > 0
        ? `${stats.avgPlacementA.toFixed(1)} / ${stats.avgPlacementB.toFixed(1)}`
        : '—',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xs bg-surface border border-black/[0.08] dark:border-white/[0.07] rounded shadow-2xl shadow-black/70 overflow-hidden animate-scale-in">
        {/* Brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-4 w-6 h-6 flex items-center justify-center text-tx-caption hover:text-tx-primary transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-black/[0.06] dark:border-white/[0.05]">
          <span className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-tx-primary">
            Head to Head
          </span>
        </div>

        {/* Players + Versus Bar */}
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <Avatar name={playerA.name} colorClass="bg-brand text-black" />
              <p className="font-medium text-xs text-tx-primary truncate w-full text-center leading-tight">
                {playerA.name}
              </p>
              <p className="font-mono text-[10px] text-tx-caption truncate w-full text-center leading-tight">
                #{playerA.alias}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-1 px-1">
              <span className="font-heading text-[10px] font-bold tracking-[0.18em] uppercase text-tx-caption">
                vs
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <Avatar name={playerB.name} colorClass="bg-live text-white" />
              <p className="font-medium text-xs text-tx-primary truncate w-full text-center leading-tight">
                {playerB.name}
              </p>
              <p className="font-mono text-[10px] text-tx-caption truncate w-full text-center leading-tight">
                #{playerB.alias}
              </p>
            </div>
          </div>

          {/* Win counts */}
          <div className="flex items-end justify-between">
            <span className="font-mono text-xl font-bold text-brand tabular-nums leading-none">
              {stats.winsA}
            </span>
            {stats.ties > 0 && (
              <span className="font-mono text-[10px] text-tx-caption tabular-nums">
                {stats.ties}T
              </span>
            )}
            <span className="font-mono text-xl font-bold text-live tabular-nums leading-none">
              {stats.winsB}
            </span>
          </div>

          {/* Versus bar */}
          <div className="relative h-1 w-full rounded-full overflow-hidden bg-black/[0.08] dark:bg-white/[0.08]">
            {stats.totalMatches > 0 ? (
              <>
                <div className="absolute left-0 top-0 bottom-0 bg-brand" style={{ width: `${barA}%` }} />
                <div className="absolute right-0 top-0 bottom-0 bg-live" style={{ width: `${barB}%` }} />
              </>
            ) : (
              <div className="absolute inset-0 bg-black/[0.08] dark:bg-white/[0.08]" />
            )}
          </div>

          {/* Win rate labels */}
          <div className="flex justify-between -mt-2">
            <span className="font-mono text-[10px] text-brand/80 tabular-nums">
              {Math.round(stats.winRateA * 100)}%
            </span>
            <span className="font-mono text-[10px] text-live/80 tabular-nums">
              {Math.round(stats.winRateB * 100)}%
            </span>
          </div>
        </div>

        {/* Stat Grid */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.05] grid grid-cols-3 divide-x divide-black/[0.06] dark:divide-white/[0.05]">
          {statGrid.map(stat => (
            <div key={stat.label} className="px-3 py-3.5 flex flex-col items-center gap-1">
              <span className="font-heading text-[9px] font-bold tracking-[0.18em] uppercase text-tx-caption text-center">
                {stat.label}
              </span>
              <span className="font-mono text-[11px] font-bold text-tx-primary tabular-nums text-center">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {stats.totalMatches === 0 && (
          <div className="border-t border-black/[0.06] dark:border-white/[0.05] px-5 py-4 flex flex-col items-center gap-1.5">
            <span className="font-mono text-lg text-tx-caption">◇</span>
            <p className="font-heading text-[9px] font-bold tracking-[0.18em] uppercase text-tx-caption">
              No shared matches
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
