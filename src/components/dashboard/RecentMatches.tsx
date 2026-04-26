import { getRecentMatches } from '@/lib/actions/matches'
import { getUsersByIds } from '@/lib/actions/users'
import { getGame } from '@/lib/actions/games'
import { getGroup } from '@/lib/actions/groups'
import { getDictionary, getLocale } from '@/lib/i18n'

const GAME_TYPE_STYLES = {
  Board:  'text-amber-600  dark:text-amber-500  bg-amber-500/10  border-amber-500/20',
  eSport: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  Sports: 'text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
}

export default async function RecentMatches() {
  const [matches, locale] = await Promise.all([getRecentMatches(8), getLocale()])
  const dict = await getDictionary(locale)

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400 dark:text-neutral-400 text-sm">
        {dict.dashboard.noMatches}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {await Promise.all(
        matches.map(async match => {
          const [game, group, players] = await Promise.all([
            getGame(match.game_id),
            getGroup(match.group_id),
            getUsersByIds(match.players.map(p => p.user_id)),
          ])
          const userMap = Object.fromEntries(players.map(u => [u.id, u]))
          const sorted = [...match.players].sort((a, b) => a.rank - b.rank)

          return (
            <div
              key={match.id}
              className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden"
            >
              {/* Card header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                    {game?.name ?? '—'}
                  </span>
                  {group && (
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-400 font-mono shrink-0">
                      {group.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {game && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-semibold tracking-wide uppercase ${GAME_TYPE_STYLES[game.type]}`}>
                      {game.type}
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
                  const user = userMap[mp.user_id]
                  const isWinner = mp.user_id === match.winner_id
                  return (
                    <li
                      key={mp.user_id}
                      className={`flex items-center gap-3 text-sm px-2 py-1.5 rounded-sm ${
                        isWinner ? 'bg-amber-500/8' : ''
                      }`}
                    >
                      <span className="w-4 font-mono text-[11px] text-neutral-400 dark:text-neutral-400 text-center shrink-0">
                        {mp.rank}
                      </span>
                      <span className={`flex-1 truncate ${
                        isWinner
                          ? 'font-semibold text-amber-600 dark:text-amber-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {user?.name ?? mp.user_id}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-400 shrink-0 tabular-nums">
                        {mp.score} pts
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
        })
      )}
    </div>
  )
}
