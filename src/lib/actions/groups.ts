'use server'

import { store } from '@/lib/store'
import type { Group } from '@/lib/types'

export async function getGroups(): Promise<Group[]> {
  return [...store.groups.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export async function getGroup(id: string): Promise<Group | undefined> {
  return store.groups.get(id)
}

export async function createGroup(
  data: Omit<Group, 'id' | 'createdAt'>
): Promise<Group> {
  const group: Group = { ...data, id: crypto.randomUUID(), createdAt: new Date() }
  store.groups.set(group.id, group)
  return group
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
  const group = store.groups.get(groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)
  if (group.members.includes(userId)) return group
  return updateGroup(groupId, { members: [...group.members, userId] })
}
