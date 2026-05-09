'use server'

import { store } from '@/lib/store'
import type { Friendship, User, FriendRequestWithUser, FriendUser } from '@/lib/types'

export async function sendFriendRequest(from: string, to: string): Promise<Friendship> {
  return store.sendFriendRequest(from, to)
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  store.acceptFriendRequest(requestId)
}

export async function declineFriendRequest(requestId: string): Promise<void> {
  store.declineFriendRequest(requestId)
}

export async function searchUsers(query: string, currentUserId: string): Promise<User[]> {
  return store.searchUsers(query, currentUserId)
}

export async function getPendingRequests(userId: string): Promise<FriendRequestWithUser[]> {
  return store.getPendingIncoming(userId)
}

export async function getSentRequests(userId: string): Promise<FriendRequestWithUser[]> {
  return store.getPendingSent(userId)
}

export async function getFriends(userId: string): Promise<FriendUser[]> {
  return store.getFriends(userId)
}

export async function getPendingCount(userId: string): Promise<number> {
  return store.getPendingCount(userId)
}
