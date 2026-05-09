import { getServerSession } from '@/lib/auth/session'
import { getUserGroups } from '@/lib/actions/groups'
import { getDictionary, getLocale } from '@/lib/i18n'
import GroupsClient from '@/components/groups/GroupsClient'

export const metadata = { title: 'Groups — RankingBoard' }

export default async function GroupsPage() {
  const session = await getServerSession()
  if (!session) return null

  const [groups, locale] = await Promise.all([
    getUserGroups(session.user.id),
    getLocale(),
  ])
  const dict = await getDictionary(locale)

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8">
          <GroupsClient groups={groups} userId={session.user.id} dict={dict} />
        </main>
      </div>
    </div>
  )
}
