import { auth } from '@/lib/auth'
import { store, generateAlias, makeStats } from '@/lib/store'
import type { User } from '@/types'

export type Session = { user: User }

export async function getServerSession(): Promise<Session | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  let user = store.users.get(session.user.id)

  if (!user) {
    // First-time sign-in via Credentials or any provider not covered by the
    // signIn callback (e.g., token refresh without re-triggering signIn).
    // Auto-provision a store record so the rest of the app can find this user.
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
