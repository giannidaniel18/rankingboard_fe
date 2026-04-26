import { auth } from '@/lib/auth'
import { store } from '@/lib/store'
import type { User } from '@/lib/types'

export type Session = { user: User }

export async function getServerSession(): Promise<Session | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = store.users.get(session.user.id)
  if (!user) return null
  return { user }
}
