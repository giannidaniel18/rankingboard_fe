'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRankings } from '@/hooks/domain/useRankings'
import type { Dictionary } from '@/lib/i18n'
import type { RankedMember } from '@/types'

type RankTier = 1 | 2 | 3 | 'other'

function getRankTier(rank: number): RankTier {
  if (rank <= 3) return rank as RankTier
  return 'other'
}

const RANK_NUM_CLASS: Record<RankTier, string> = {
  1:     'text-primary dark:text-primary',
  2:     'text-neutral-400 dark:text-neutral-300',
  3:     'text-amber-700 dark:text-primary',
  other: 'text-neutral-400 dark:text-neutral-400',
}

const RANK_ACCENT: Record<RankTier, string> = {
  1:     'border-l-2 border-primary/70',
  2:     'border-l-2 border-neutral-400/30',
  3:     'border-l-2 border-amber-700/30',
  other: 'border-l-2 border-transparent',
}

const AVATAR_CLASS: Record<RankTier, string> = {
  1:     'bg-primary text-secondary',
  2:     'bg-neutral-300 dark:bg-neutral-600 text-black dark:text-neutral-100',
  3:     'bg-amber-800/60 text-amber-200',
  other: 'bg-black/10 dark:bg-white/10 text-neutral-600 dark:text-neutral-300',
}

// Explicit hex values ensure fully opaque sticky backgrounds regardless of CSS variable resolution
const STICKY_BG = 'bg-white dark:bg-surface'

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-px bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
        <div className="h-full bg-primary dark:bg-custom-light-orange transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 w-8 text-right shrink-0 tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden animate-pulse">
      <div className="h-11 border-b border-black/[0.08] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 bg-black/[0.01] dark:bg-white/[0.01]" />
      ))}
    </div>
  )
}

interface DetailedTableProps {
  members: RankedMember[]
  dict: Dictionary
}

function DetailedTable({ members, dict }: DetailedTableProps) {
  const t = dict.table
  const r = dict.rankings

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[680px]">
        <thead>
          <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">

            {/* Frozen: rank */}
            <th className={`pl-5 pr-3 py-3 w-[52px] text-left sticky left-0 z-20 ${STICKY_BG}`}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
                {t.rank}
              </span>
            </th>

            {/* Frozen: player */}
            <th className={`px-3 py-3 min-w-[150px] text-left sticky left-[52px] z-20 ${STICKY_BG} border-r border-black/[0.06] dark:border-white/[0.07]`}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
                {t.player}
              </span>
            </th>

            {/* Scrollable headers */}
            {([
              { label: t.points,        cls: 'w-20 text-right'       },
              { label: t.matchesPlayed, cls: 'w-24 text-right'       },
              { label: 'W',             cls: 'w-12 text-center'      },
              { label: 'L',             cls: 'w-12 text-center'      },
              { label: r.colWinrate,    cls: 'min-w-[120px] text-left' },
              { label: t.streak,        cls: 'w-20 text-center'      },
            ] as const).map(col => (
              <th key={col.label} className={`px-3 py-3 ${col.cls}`}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
                  {col.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {members.map((member, index) => {
            const rank      = index + 1
            const tier      = getRankTier(rank)
            const { stats } = member
            const isInactive = !member.isActive
            const rowAccent  = RANK_ACCENT[tier]
            const rowBg      = tier === 1 ? 'bg-primary/[0.04]' : ''

            return (
              <tr
                key={member.userId}
                className={`${rowAccent} ${rowBg} border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors ${isInactive ? 'opacity-50' : ''}`}
              >
                {/* Frozen: rank number */}
                <td className={`pl-5 pr-3 py-3.5 sticky left-0 z-10 ${STICKY_BG}`}>
                  <span className={`font-mono font-bold text-sm ${RANK_NUM_CLASS[tier]}`}>
                    {rank}
                  </span>
                </td>

                {/* Frozen: avatar + name */}
                <td className={`px-3 py-3.5 sticky left-[52px] z-10 ${STICKY_BG} border-r border-black/[0.06] dark:border-white/[0.07]`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${isInactive ? 'grayscale bg-black/10 dark:bg-white/10 text-neutral-500' : AVATAR_CLASS[tier]}`}>
                      {member.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 leading-tight truncate max-w-[120px]">
                          {member.name}
                        </p>
                        {isInactive && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-[0.08em] uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 leading-none shrink-0">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 leading-tight truncate">
                        #{member.alias}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Points */}
                <td className="px-3 py-3.5 text-right">
                  <span className={`font-mono font-bold text-sm tabular-nums ${tier === 1 ? 'text-primary dark:text-primary' : 'text-neutral-600 dark:text-neutral-300'}`}>
                    {stats.points}
                  </span>
                </td>

                {/* Matches played */}
                <td className="px-3 py-3.5 text-right">
                  <span className="font-mono text-[12px] tabular-nums text-neutral-500 dark:text-neutral-400">
                    {stats.totalMatches}
                  </span>
                </td>

                {/* Wins */}
                <td className="px-3 py-3.5 text-center">
                  <span className="font-mono text-[12px] tabular-nums text-emerald-600 dark:text-emerald-500">
                    {stats.wins}
                  </span>
                </td>

                {/* Losses */}
                <td className="px-3 py-3.5 text-center">
                  <span className="font-mono text-[12px] tabular-nums text-red-500 dark:text-red-400">
                    {stats.losses}
                  </span>
                </td>

                {/* Winrate bar */}
                <td className="px-3 py-3.5">
                  <WinRateBar rate={stats.winRate} />
                </td>

                {/* Streak */}
                <td className="px-3 py-3.5 text-center">
                  {stats.streak > 0 ? (
                    <span className="font-mono text-[11px] font-semibold text-primary tabular-nums">
                      🔥{stats.streak}
                    </span>
                  ) : (
                    <span className="text-neutral-300 dark:text-neutral-600 text-[11px] font-mono">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface Props {
  groupId: string
  dict:    Dictionary
}

export default function RankingsPageClient({ groupId, dict }: Props) {
  const { rankingsByGroup, isLoading, loadRankings } = useRankings()

  useEffect(() => {
    loadRankings(groupId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  const members = rankingsByGroup[groupId]

  return (
    <main className="flex-1 p-4 md:p-8 space-y-6 max-w-5xl">

      {/* ── Back + page title ── */}
      <div className="space-y-1.5">
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {dict.rankings.back}
        </Link>
        <h1 className="font-heading text-xl font-bold tracking-[0.12em] uppercase text-neutral-900 dark:text-neutral-100">
          {dict.rankings.detailedTitle}
        </h1>
        {members && (
          <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
            {members.length} {dict.rankings.members}
          </p>
        )}
      </div>

      {/* ── Table card ── */}
      {isLoading && !members ? (
        <TableSkeleton />
      ) : members ? (
        <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
          <DetailedTable members={members} dict={dict} />
        </div>
      ) : null}
    </main>
  )
}
