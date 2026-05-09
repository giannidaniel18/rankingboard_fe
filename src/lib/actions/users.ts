'use server'

import { store, makeStats, generateAlias } from '@/lib/store'
import type { User } from '@/lib/types'

interface ProvisionData {
  name: string
  email: string
  image?: string
}

export async function getUser(id: string, provision?: ProvisionData): Promise<User | undefined> {
  const existing = store.users.get(id)
  if (existing) return existing
  if (!provision) return undefined

  const name = provision.name || provision.email.split('@')[0]
  const user: User = {
    id,
    email: provision.email,
    name,
    alias: generateAlias(name),
    image: provision.image,
    friends: [],
    profile: { stats: makeStats(), achievements: [] },
  }
  store.users.set(id, user)
  return user
}

export interface UpdateProfileInput {
  id: string
  name: string
  bio: string
}

export async function updateUserProfile(input: UpdateProfileInput): Promise<void> {
  const user = store.users.get(input.id)
  if (!user) return
  store.users.set(input.id, {
    ...user,
    name: input.name.trim() || user.name,
    bio: input.bio.trim(),
  })
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  return ids.flatMap(id => {
    const user = store.users.get(id)
    return user ? [user] : []
  })
}

export async function getRankedMembers(userIds: string[]): Promise<User[]> {
  const users = await getUsersByIds(userIds)
  return users.sort(
    (a, b) => b.profile.stats.rankingPoints - a.profile.stats.rankingPoints
  )
}
