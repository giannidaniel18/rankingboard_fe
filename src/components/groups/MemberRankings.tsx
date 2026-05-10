import { getGroupRankings } from '@/lib/actions/groups'
import { getDictionary, getLocale } from '@/lib/i18n'

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

export default async function MemberRankings({ groupId }: { groupId: string }) {
  const [members, locale] = await Promise.all([getGroupRankings(groupId), getLocale()])
  const dict = await getDictionary(locale)
  const t = dict.table

  return (
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
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
              {[{ label: '#', cls: 'w-12 pl-5 text-left' },
                { label: t.player, cls: 'min-w-[140px] text-left' },
                { label: t.record, cls: 'w-20 text-center' },
                { label: t.winRate, cls: 'min-w-[110px] text-left' },
                { label: t.points, cls: 'min-w-[80px] text-right' },
                { label: t.streak, cls: 'w-16 text-center' },
              ].map(col => (
                <th key={col.label} className={`px-4 py-2.5 ${col.cls}`}>
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

              return (
                <tr
                  key={member.userId}
                  className={`${RANK_ACCENT[tier]} border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors ${tier === 1 ? 'bg-amber-500/[0.04]' : ''}`}
                >
                  {/* Rank number */}
                  <td className="pl-5 pr-4 py-3.5">
                    <span className={`font-mono font-bold text-sm ${RANK_NUM_CLASS[tier]}`}>
                      {rank}
                    </span>
                  </td>

                  {/* Player */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
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

                  {/* Record */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-mono text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-500">{stats.wins}W</span>
                      <span className="text-neutral-300 dark:text-neutral-600 mx-0.5">/</span>
                      <span className="text-red-500 dark:text-red-400">{stats.losses}L</span>
                    </span>
                  </td>

                  {/* Win Rate */}
                  <td className="px-4 py-3.5">
                    <WinRateBar rate={stats.winRate} />
                  </td>

                  {/* Points */}
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono font-bold text-sm tabular-nums ${
                      tier === 1
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-neutral-600 dark:text-neutral-300'
                    }`}>
                      {stats.points}
                    </span>
                  </td>

                  {/* Streak */}
                  <td className="px-4 py-3.5 text-center">
                    {stats.streak > 0 ? (
                      <span className="font-mono text-[11px] font-semibold text-amber-500 tabular-nums">
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
    </div>
  )
}
