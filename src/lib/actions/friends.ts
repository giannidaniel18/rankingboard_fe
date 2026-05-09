'use server'

import { store } from '@/lib/store'
import type { Friendship, User } from '@/lib/types'

export async function sendFriendRequest(from: string, to: string): Promise<Friendship> {
  return store.sendFriendRequest(from, to)
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  store.acceptFriendRequest(requestId)
}

export async function searchUsers(query: string, currentUserId: string): Promise<User[]> {
  return store.searchUsers(query, currentUserId)
}
