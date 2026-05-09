import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import GameList from '@/components/groups/GameList'
import MemberRankings from '@/components/groups/MemberRankings'
import MatchForm from '@/components/match/MatchForm'
import { getGroup } from '@/lib/actions/groups'
import { getGamesByGroup } from '@/lib/actions/games'
import { getUsersByIds } from '@/lib/actions/users'
import { getDictionary, getLocale } from '@/lib/i18n'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const group = await getGroup(id)
  return { title: group ? `${group.name} — RankingBoard` : 'Group — RankingBoard' }
}

export default async function GroupPage({ params }: Props) {
  const { id } = await params
  const [group, games, locale] = await Promise.all([
    getGroup(id),
    getGamesByGroup(id),
    getLocale(),
  ])

  if (!group) notFound()

  const [members, dict] = await Promise.all([
    getUsersByIds(group.members),
    getDictionary(locale),
  ])

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div>
            <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
              {group.name}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
              {group.members.length} {dict.group.members} · {games.length} {dict.group.gamesLabel}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-60 shrink-0 space-y-0">
              <GameList games={games} groupId={id} />
              <MatchForm groupId={id} games={games} members={members} />
            </div>

            <div className="flex-1 min-w-0">
              <Suspense fallback={<p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">…</p>}>
                <MemberRankings memberIds={group.members} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

