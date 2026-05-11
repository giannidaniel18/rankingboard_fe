'use server'

import { store } from '@/lib/store'
import type { FriendUser, Group, RankedMember } from '@/types'

export async function getGroups(): Promise<Group[]> {
  return [...store.groups.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export async function getGroup(id: string): Promise<Group | undefined> {
  return store.groups.get(id)
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  return store.getUserGroups(userId)
}

export async function createGroup(name: string, adminId: string): Promise<Group> {
  if (!adminId) throw new Error('adminId is required')
  return store.createGroup(name, adminId)
}

export async function updateGroup(
  id: string,
  data: Partial<Omit<Group, 'id' | 'createdAt'>>
): Promise<Group> {
  const group = store.groups.get(id)
  if (!group) throw new Error(`Group ${id} not found`)
  const updated = { ...group, ...data }
  store.groups.set(id, updated)
  return updated
}

export async function deleteGroup(id: string): Promise<void> {
  store.groups.delete(id)
}

export async function addMemberToGroup(groupId: string, userId: string): Promise<Group> {
  return store.addMemberToGroup(groupId, userId)
}

export async function getAvailableFriendsForGroup(groupId: string, currentUserId: string): Promise<FriendUser[]> {
  return store.getAvailableFriendsForGroup(groupId, currentUserId)
}

export async function getGroupRankings(groupId: string): Promise<RankedMember[]> {
  return store.getGroupRankings(groupId)
}

export async function getGroupMembers(groupId: string, excludeUserId?: string): Promise<FriendUser[]> {
  return store.getGroupMembers(groupId, excludeUserId)
}
