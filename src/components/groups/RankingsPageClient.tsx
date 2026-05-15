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
  1:     'text-brand',
  2:     'text-tx-secondary',
  3:     'text-bronze',
  other: 'text-tx-caption',
}

const RANK_ACCENT: Record<RankTier, string> = {
  1:     'border-l-2 border-brand/60',
  2:     'border-l-2 border-tx-caption/30',
  3:     'border-l-2 border-bronze/30',
  other: 'border-l-2 border-transparent',
}

const AVATAR_CLASS: Record<RankTier, string> = {
  1:     'bg-brand text-black',
  2:     'bg-black/[0.12] dark:bg-white/[0.15] text-tx-primary',
  3:     'bg-bronze/60 text-white',
  other: 'bg-black/10 dark:bg-white/10 text-tx-secondary',
}

const STICKY_BG = 'bg-surface'

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-px bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden shrink-0">
        <div className="h-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-tx-caption w-8 text-right shrink-0 tabular-nums">
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
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-tx-caption">
                {t.rank}
              </span>
            </th>

            {/* Frozen: player */}
            <th className={`px-3 py-3 min-w-[150px] text-left sticky left-[52px] z-20 ${STICKY_BG} border-r border-black/[0.06] dark:border-white/[0.07]`}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-tx-caption">
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
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-tx-caption">
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
            const rowBg      = tier === 1 ? 'bg-brand/[0.04]' : ''

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
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${isInactive ? 'grayscale bg-black/10 dark:bg-white/10 text-tx-caption' : AVATAR_CLASS[tier]}`}>
                      {member.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-tx-primary leading-tight truncate max-w-[120px]">
                          {member.name}
                        </p>
                        {isInactive && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-[0.08em] uppercase bg-black/[0.06] dark:bg-white/[0.08] text-tx-caption leading-none shrink-0">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-tx-caption leading-tight truncate">
                        #{member.alias}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Points */}
                <td className="px-3 py-3.5 text-right">
                  <span className={`font-mono font-bold text-sm tabular-nums ${tier === 1 ? 'text-brand' : 'text-tx-secondary'}`}>
                    {stats.points}
                  </span>
                </td>

                {/* Matches played */}
                <td className="px-3 py-3.5 text-right">
                  <span className="font-mono text-[12px] tabular-nums text-tx-caption">
                    {stats.totalMatches}
                  </span>
                </td>

                {/* Wins */}
                <td className="px-3 py-3.5 text-center">
                  <span className="font-mono text-[12px] tabular-nums text-win">
                    {stats.wins}
                  </span>
                </td>

                {/* Losses */}
                <td className="px-3 py-3.5 text-center">
                  <span className="font-mono text-[12px] tabular-nums text-loss">
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
                    <span className="font-mono text-[11px] font-semibold text-brand tabular-nums">
                      🔥{stats.streak}
                    </span>
                  ) : (
                    <span className="text-tx-caption text-[11px] font-mono">—</span>
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
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-tx-caption hover:text-tx-secondary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {dict.rankings.back}
        </Link>
        <h1 className="font-heading text-xl font-bold tracking-[0.12em] uppercase text-tx-primary">
          {dict.rankings.detailedTitle}
        </h1>
        {members && (
          <p className="font-mono text-[11px] text-tx-caption tabular-nums">
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
