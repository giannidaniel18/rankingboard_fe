import { auth } from '@/lib/auth'
import { store, generateAlias, makeStats } from '@/lib/store'
import type { User } from '@/types'

export type Session = { user: User }

export async function getServerSession(): Promise<Session | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  let user = store.users.get(session.user.id)

  if (!user) {
    // Bridge: if the session email matches a placeholder user in the mock store
    // (e.g., after a server restart cleared the in-memory state), swap its ID
    // for the real provider ID so all groups and matches remain visible.
    store.bridgeIdentity(session.user.id, session.user.email ?? '')
    user = store.users.get(session.user.id)
  }

  if (!user) {
    // Truly new user (no matching placeholder). Auto-provision a bare record.
    const name = session.user.name ?? session.user.email?.split('@')[0] ?? 'Player'
    user = {
      id: session.user.id,
      email: session.user.email ?? '',
      name,
      alias: generateAlias(name),
      image: session.user.image ?? undefined,
      friends: [],
      profile: {
        stats: makeStats(),
        achievements: [],
      },
    }
    store.users.set(user.id, user)
  }

  return { user }
}
