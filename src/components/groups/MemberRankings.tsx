'use client'

import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { useRankings } from '@/hooks/domain/useRankings'
import { useI18n } from '@/components/providers/I18nProvider'
import HeadToHeadCard from '@/components/groups/HeadToHeadCard'
import ComparisonBar from '@/components/groups/ComparisonBar'
import type { RankedMember } from '@/types'

type RankTier = 1 | 2 | 3 | 'other'

function getRankTier(rank: number): RankTier {
  if (rank <= 3) return rank as RankTier
  return 'other'
}

const RANK_NUM_CLASS: Record<RankTier, string> = {
  1:     'text-amber-500 dark:text-amber-400',
  2:     'text-neutral-400 dark:text-neutral-300',
  3:     'text-amber-700 dark:text-amber-600',
  other: 'text-neutral-400 dark:text-neutral-400',
}

const RANK_ACCENT: Record<RankTier, string> = {
  1:     'border-l-2 border-amber-500/70',
  2:     'border-l-2 border-neutral-400/30',
  3:     'border-l-2 border-amber-700/30',
  other: 'border-l-2 border-transparent',
}

const AVATAR_CLASS: Record<RankTier, string> = {
  1:     'bg-amber-500 text-black',
  2:     'bg-neutral-300 dark:bg-neutral-600 text-black dark:text-neutral-100',
  3:     'bg-amber-800/60 text-amber-200',
  other: 'bg-black/10 dark:bg-white/10 text-neutral-600 dark:text-neutral-300',
}

// Opaque sticky cell backgrounds — must not be transparent so scrolled content is hidden
const STICKY_BG          = 'bg-surface'
// Computed: amber-500/10 blended over #0E1520 (dark surface) → #25231E; light: amber-50
const STICKY_BG_SELECTED = 'bg-amber-50 dark:bg-[#25231E]'

// Right-edge separator on the last frozen column
const FROZEN_EDGE = 'border-r border-black/[0.06] dark:border-white/[0.07]'

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div className="h-full bg-amber-500 dark:bg-amber-400 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 w-8 text-right shrink-0 tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

function RankingsSkeleton() {
  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden animate-pulse">
      <div className="h-11 border-b border-black/[0.08] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 bg-black/[0.01] dark:bg-white/[0.01]" />
      ))}
    </div>
  )
}

export default function MemberRankings({ groupId }: { groupId: string }) {
  const { rankingsByGroup, isLoading, loadRankings } = useRankings()
  const { dict } = useI18n()
  const t = dict.table

  const [compareA, setCompareA] = useState<RankedMember | null>(null)
  const [compareB, setCompareB] = useState<RankedMember | null>(null)

  useEffect(() => {
    loadRankings(groupId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  const members = rankingsByGroup[groupId]

  function handleCompare(member: RankedMember) {
    if (!compareA) {
      setCompareA(member)
      return
    }
    if (compareA.userId === member.userId) {
      setCompareA(null)
      return
    }
    setCompareB(member)
  }

  function handleCancelCompare() {
    setCompareA(null)
  }

  function handleCloseH2H() {
    setCompareA(null)
    setCompareB(null)
  }

  if (isLoading && !members) return <RankingsSkeleton />
  if (!members) return null

  return (
    <>
    {compareA && compareB && (
      <HeadToHeadCard playerA={compareA} playerB={compareB} onClose={handleCloseH2H} />
    )}

    {compareA && !compareB && (
      <ComparisonBar playerA={compareA} onCancel={handleCancelCompare} />
    )}

    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline justify-between px-5 py-3.5 border-b border-black/[0.08] dark:border-white/[0.07]">
        <h2 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
          {dict.group.rankings}
        </h2>
        <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {members.length} players
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[620px]">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">

              {/* ── Frozen col 1: Rank # ── */}
              <th className={`px-4 py-2.5 w-[52px] pl-5 text-left sticky left-0 z-20 ${STICKY_BG}`}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
                  #
                </span>
              </th>

              {/* ── Frozen col 2: Member ── */}
              <th className={`px-4 py-2.5 min-w-[140px] text-left sticky left-[52px] z-20 ${STICKY_BG} ${FROZEN_EDGE}`}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
                  {t.player}
                </span>
              </th>

              {/* ── Scrollable headers ── */}
              {[
                { label: t.record,  cls: 'w-20 text-center' },
                { label: t.winRate, cls: 'min-w-[110px] text-left' },
                { label: t.points,  cls: 'min-w-[80px] text-right' },
                { label: t.streak,  cls: 'w-16 text-center' },
                { label: '',        cls: 'w-10 md:w-20 text-center' },
              ].map(col => (
                <th key={col.label || 'compare'} className={`px-4 py-2.5 ${col.cls}`}>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {members.map((member, index) => {
              const rank = index + 1
              const tier = getRankTier(rank)
              const { stats } = member
              const isSelectedA = compareA?.userId === member.userId

              // Override tier accent with solid amber border when selected
              const rowAccent = isSelectedA ? 'border-l-2 border-amber-500' : RANK_ACCENT[tier]
              const rowBg     = isSelectedA ? 'bg-amber-500/10' : tier === 1 ? 'bg-amber-500/[0.04]' : ''
              const stickyBg  = isSelectedA ? STICKY_BG_SELECTED : STICKY_BG

              return (
                <tr
                  key={member.userId}
                  className={`${rowAccent} ${rowBg} border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors`}
                >
                  {/* ── Frozen: Rank number ── */}
                  <td className={`pl-5 pr-4 py-3.5 sticky left-0 z-10 ${stickyBg}`}>
                    <span className={`font-mono font-bold text-sm ${RANK_NUM_CLASS[tier]}`}>
                      {rank}
                    </span>
                  </td>

                  {/* ── Frozen: Avatar + Name — tappable identity trigger ── */}
                  <td
                    onClick={() => handleCompare(member)}
                    className={`px-4 py-3.5 sticky left-[52px] z-10 ${stickyBg} ${FROZEN_EDGE} cursor-pointer select-none hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors`}
                  >
                    <div className="flex items-center gap-2.5 transition-all active:scale-[0.98]">
                      <div className={`w-6 h-6 rounded-sm flex items-center justify-center font-bold text-[11px] shrink-0 ${AVATAR_CLASS[tier]}`}>
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                          {member.name}
                        </p>
                        <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight tabular-nums">
                          {stats.totalMatches} {dict.group.played}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ── Scrollable: Record ── */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-mono text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-500">{stats.wins}W</span>
                      <span className="text-neutral-300 dark:text-neutral-600 mx-0.5">/</span>
                      <span className="text-red-500 dark:text-red-400">{stats.losses}L</span>
                    </span>
                  </td>

                  {/* ── Scrollable: Win rate ── */}
                  <td className="px-4 py-3.5">
                    <WinRateBar rate={stats.winRate} />
                  </td>

                  {/* ── Scrollable: Points ── */}
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono font-bold text-sm tabular-nums ${
                      tier === 1
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-neutral-600 dark:text-neutral-300'
                    }`}>
                      {stats.points}
                    </span>
                  </td>

                  {/* ── Scrollable: Streak ── */}
                  <td className="px-4 py-3.5 text-center">
                    {stats.streak > 0 ? (
                      <span className="font-mono text-[11px] font-semibold text-amber-500 tabular-nums">
                        🔥{stats.streak}
                      </span>
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-600 text-[11px] font-mono">—</span>
                    )}
                  </td>

                  {/* ── Adaptive action column: text on md+, icon on mobile ── */}
                  <td className="px-2 py-3.5 text-center md:px-4">
                    <button
                      onClick={() => handleCompare(member)}
                      className={`font-mono text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded transition-colors ${
                        isSelectedA
                          ? 'text-amber-500 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                          : compareA
                            ? 'text-sky-500 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20'
                            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="hidden md:inline">
                        {isSelectedA ? '× cancel' : compareA ? 'vs' : 'compare'}
                      </span>
                      <ArrowLeftRight className="md:hidden w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}
