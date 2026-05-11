import { getDictionary, getLocale } from '@/lib/i18n'
import type { Game } from '@/types'

const TYPE_STYLES: Record<Game['type'], string> = {
  Board:  'text-amber-600  dark:text-amber-500  bg-amber-500/10  border-amber-500/20',
  eSport: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  Sports: 'text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
}

const TYPE_ICONS: Record<Game['type'], string> = {
  Board:  'ðŸŽ²',
  eSport: 'ðŸŽ®',
  Sports: 'âš½',
}

export default async function GameList({ games, groupId: _ }: { games: Game[]; groupId: string }) {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      <div className="px-4 py-3 border-b border-black/[0.08] dark:border-white/[0.07]">
        <h2 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
          {dict.group.games}
        </h2>
      </div>

      {games.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-400 py-6 text-center">
          {dict.group.noGames}
        </p>
      ) : (
        <ul className="divide-y divide-black/[0.05] dark:divide-white/[0.04]">
          {games.map(game => (
            <li key={game.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-base leading-none shrink-0">{TYPE_ICONS[game.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {game.name}
                </p>
                <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-400 capitalize">
                  {game.scoring_type} {dict.group.scoring}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-sm border font-semibold tracking-wide uppercase ${TYPE_STYLES[game.type]}`}>
                {game.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
