import { store } from '@/lib/store'
import { getServerSession } from '@/lib/auth/session'
import TournamentDetailClient from '@/components/groups/tournaments/TournamentDetailClient'
import type { GroupRole } from '@/types'

interface Props {
  params: Promise<{ id: string; tournamentId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { tournamentId } = await params
  const t = store.getTournamentById(tournamentId)
  return { title: `${t?.name ?? 'Torneo'} — RankingBoard` }
}

export default async function TournamentPage({ params }: Props) {
  const { id: groupId, tournamentId } = await params
  const session = await getServerSession().catch(() => null)

  // May be undefined for client-created tournaments — client will fetch via useEffect
  const tournament = store.getTournamentById(tournamentId) ?? null

  const group    = store.groups.get(groupId)
  const member   = group?.members.find(m => m.userId === session?.user.id)
  const userRole = (member?.role ?? null) as GroupRole | null

  return (
    <TournamentDetailClient
      tournamentId={tournamentId}
      initialTournament={tournament}
      groupId={groupId}
      userRole={userRole}
    />
  )
}
