import { getServerSession } from '@/lib/auth/session'
import ProfilePageClient from '@/components/user/ProfilePageClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Profile — RankingBoard`, description: `Player profile ${id}` }
}

export default async function ProfileDynamicPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession().catch(() => null)

  return <ProfilePageClient profileId={id} sessionUserId={session?.user.id} />
}
