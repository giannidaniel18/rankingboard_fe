import useGroupsStore from '@/store/useGroupsStore'
import groupService from '@/services/groupService'
import type { User } from '@/types'

export function useGroups() {
  const {
    groups, currentGroup, memberUsers, isLoading, error,
    setGroups, addGroup, setCurrentGroup, setMemberUsers, addMemberToCurrentGroup, setLoading, setError,
  } = useGroupsStore()

  async function loadUserGroups(userId: string): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const data = await groupService.getUserGroups(userId)
      setGroups(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  async function loadGroupById(id: string): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const [group, users] = await Promise.all([
        groupService.getGroupById(id),
        groupService.getGroupMemberUsers(id),
      ])
      if (!group) {
        setError('Group not found')
        setCurrentGroup(null)
      } else {
        setCurrentGroup(group)
        setMemberUsers(users)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group')
    } finally {
      setLoading(false)
    }
  }

  async function addMember(groupId: string, user: User): Promise<void> {
    setError(null)
    try {
      await groupService.addMemberToGroup(groupId, user.id)
      addMemberToCurrentGroup(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    }
  }

  async function fetchGroupMembers(groupId: string): Promise<User[]> {
    return groupService.getGroupMemberUsers(groupId)
  }

  async function createNewGroup(name: string, adminId: string): Promise<void> {
    setError(null)
    try {
      const group = await groupService.createGroup(name, adminId)
      addGroup(group)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
    }
  }

  return { groups, currentGroup, memberUsers, isLoading, error, loadUserGroups, loadGroupById, fetchGroupMembers, addMember, createNewGroup }
}
