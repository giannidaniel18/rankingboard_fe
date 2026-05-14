import GroupDetailClient from '@/components/groups/GroupDetailClient'
import { getDictionary, getLocale } from '@/lib/i18n'
import { getServerSession } from '@/lib/auth/session'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Group ${id} — RankingBoard` }
}

export default async function GroupPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const tab = sp['tab']
  const initialTab = tab === 'tournaments' ? 'torneos' as const : 'rankings' as const

  const [locale, session] = await Promise.all([
    getLocale(),
    getServerSession().catch(() => null),
  ])
  const dict = await getDictionary(locale)

  return <GroupDetailClient id={id} userId={session?.user.id} dict={dict} initialTab={initialTab} />
}
