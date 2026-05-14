'use client'

import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRankings } from '@/hooks/domain/useRankings'
import { useI18n } from '@/components/providers/I18nProvider'
import HeadToHeadCard from '@/components/groups/HeadToHeadCard'
import ComparisonBar from '@/components/groups/ComparisonBar'
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

function RankingsSkeleton() {
  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden animate-pulse">
      <div className="h-11 border-b border-black/[0.08] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 bg-black/[0.01] dark:bg-white/[0.01]" />
      ))}
    </div>
  )
}

interface CompactTableProps {
  members:   RankedMember[]
  dict:      Dictionary
  onCompare: (member: RankedMember) => void
  compareA:  RankedMember | null
}

function CompactTable({ members, dict, onCompare, compareA }: CompactTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
          <th className="pl-5 pr-2 py-2.5 w-10 text-left">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
              #
            </span>
          </th>
          <th className="px-2 py-2.5 text-left">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
              {dict.table.player}
            </span>
          </th>
          <th className="px-2 py-2.5 w-12 text-right">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
              Pts
            </span>
          </th>
          <th className="pl-2 pr-4 py-2.5 w-12 text-right">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
              %
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {members.map((member, index) => {
          const rank      = index + 1
          const tier      = getRankTier(rank)
          const { stats } = member
          const isInactive = !member.isActive
          const pct        = Math.round(stats.winRate * 100)
          const rowAccent  = RANK_ACCENT[tier]
          const rowBg      = tier === 1 ? 'bg-primary/[0.04]' : ''
          const isSelected = compareA?.userId === member.userId

          return (
            <tr
              key={member.userId}
              onClick={() => onCompare(member)}
              className={`${rowAccent} ${isSelected ? 'bg-primary/[0.08]' : rowBg} border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 cursor-pointer hover:bg-white/[0.05] active:bg-elevated/50 transition-colors ${isInactive ? 'opacity-50' : ''}`}
            >
              <td className="pl-5 pr-2 py-3">
                <span className={`font-mono font-bold text-xs ${RANK_NUM_CLASS[tier]}`}>
                  {rank}
                </span>
              </td>

              <td className="px-2 py-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${isInactive ? 'grayscale bg-black/10 dark:bg-white/10 text-neutral-500' : AVATAR_CLASS[tier]}`}>
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 flex items-center gap-1.5">
                    <p className="font-medium text-[13px] text-neutral-900 dark:text-neutral-100 leading-tight truncate">
                      {member.name}
                    </p>
                    {isInactive && (
                      <span className="px-1 py-0.5 rounded text-[8px] font-bold tracking-[0.08em] uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 leading-none shrink-0">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-2 py-3 text-right">
                <span className={`font-mono font-bold text-xs tabular-nums ${tier === 1 ? 'text-primary dark:text-primary' : 'text-neutral-600 dark:text-neutral-300'}`}>
                  {stats.points}
                </span>
              </td>

              <td className="pl-2 pr-4 py-3 text-right">
                <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                  {pct}%
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function MemberRankings({ groupId }: { groupId: string }) {
  const { rankingsByGroup, isLoading, loadRankings } = useRankings()
  const { dict } = useI18n()
  const router   = useRouter()

  const [compareA, setCompareA] = useState<RankedMember | null>(null)
  const [compareB, setCompareB] = useState<RankedMember | null>(null)
  const [showAll,  setShowAll]  = useState(false)

  useEffect(() => {
    loadRankings(groupId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  const members = rankingsByGroup[groupId]

  function handleCompare(member: RankedMember) {
    if (!compareA) { setCompareA(member); return }
    if (compareA.userId === member.userId) { setCompareA(null); return }
    setCompareB(member)
  }

  if (isLoading && !members) return <RankingsSkeleton />
  if (!members) return null

  const visibleMembers = showAll ? members : members.slice(0, 10)

  return (
    <>
      {compareA && compareB && (
        <HeadToHeadCard
          playerA={compareA}
          playerB={compareB}
          onClose={() => { setCompareA(null); setCompareB(null) }}
        />
      )}
      {compareA && !compareB && (
        <ComparisonBar playerA={compareA} onCancel={() => setCompareA(null)} />
      )}

      <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">

        {/* ── Header — strict single flex row, never wraps ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.08] dark:border-white/[0.07]">
          <h2 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100 shrink-0">
            {dict.rankings.compact}
          </h2>
          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 flex-1 tabular-nums">
            {members.length} {dict.rankings.members}
          </span>
          <button
            onClick={() => router.push(`/groups/${groupId}/rankings`)}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors shrink-0"
            aria-label={dict.rankings.detailedTitle}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Compact table — 4 columns, zero overflow ── */}
        <div className="w-full max-w-full overflow-hidden">
          <CompactTable members={visibleMembers} dict={dict} onCompare={handleCompare} compareA={compareA} />
        </div>

        {/* ── Show more / less ── */}
        {members.length > 10 && (
          <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-center">
            <button
              onClick={() => setShowAll(v => !v)}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors py-1 px-2"
            >
              {showAll ? (
                <><ChevronUp className="w-3 h-3" />Ver menos</>
              ) : (
                <><ChevronDown className="w-3 h-3" />Ver más</>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
