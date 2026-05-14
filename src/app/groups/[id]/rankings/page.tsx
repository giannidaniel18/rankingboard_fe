import RankingsPageClient from '@/components/groups/RankingsPageClient'
import { getDictionary, getLocale } from '@/lib/i18n'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Rankings — Group ${id} — RankingBoard` }
}

export default async function GroupRankingsPage({ params }: Props) {
  const { id } = await params
  const locale = await getLocale()
  const dict   = await getDictionary(locale)

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <RankingsPageClient groupId={id} dict={dict} />
      </div>
    </div>
  )
}
