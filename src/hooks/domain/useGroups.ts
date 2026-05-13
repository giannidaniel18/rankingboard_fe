import useGroupsStore from '@/store/useGroupsStore'
import useRankingsStore from '@/store/useRankingsStore'
import groupService from '@/services/groupService'
import rankingsService from '@/services/rankingsService'
import type { GroupRole, User } from '@/types'

export function useGroups() {
  const {
    groups, currentGroup, memberUsers, isLoading, error,
    setGroups, addGroup, setCurrentGroup, setMemberUsers, addMemberToCurrentGroup,
    updateCurrentGroup, removeMemberUser, setLoading, setError,
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
    return groupService.getGroupMemberUsers(groupId, true) // active members only for match participation
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

  async function updateGroupDetails(groupId: string, name: string, avatarUrl?: string): Promise<void> {
    setError(null)
    try {
      const group = await groupService.updateGroupDetails(groupId, name, avatarUrl)
      updateCurrentGroup(group)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group')
    }
  }

  async function updateMemberRole(groupId: string, userId: string, role: GroupRole): Promise<void> {
    setError(null)
    try {
      const group = await groupService.updateMemberRole(groupId, userId, role)
      updateCurrentGroup(group)
      const { setRankings, setLoading } = useRankingsStore.getState()
      setLoading(true)
      const rankings = await rankingsService.getGroupRankings(groupId)
      setRankings(groupId, rankings)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  async function removeMember(groupId: string, userId: string): Promise<void> {
    setError(null)
    try {
      const group = await groupService.removeMemberFromGroup(groupId, userId)
      updateCurrentGroup(group)
      removeMemberUser(userId)
      const { setRankings, setLoading } = useRankingsStore.getState()
      setLoading(true)
      const rankings = await rankingsService.getGroupRankings(groupId)
      setRankings(groupId, rankings)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  return {
    groups, currentGroup, memberUsers, isLoading, error,
    loadUserGroups, loadGroupById, fetchGroupMembers, addMember, createNewGroup,
    updateGroupDetails, updateMemberRole, removeMember,
  }
}
