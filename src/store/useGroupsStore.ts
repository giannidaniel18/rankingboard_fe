import { create } from 'zustand'
import type { Group, User } from '@/types'

interface GroupsState {
  groups: Group[]
  currentGroup: Group | null
  memberUsers: User[]
  isLoading: boolean
  error: string | null
  setGroups: (groups: Group[]) => void
  addGroup: (group: Group) => void
  setCurrentGroup: (group: Group | null) => void
  setMemberUsers: (users: User[]) => void
  addMemberToCurrentGroup: (user: User) => void
  updateCurrentGroup: (group: Group) => void
  removeMemberUser: (userId: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

const useGroupsStore = create<GroupsState>((set) => ({
  groups: [],
  currentGroup: null,
  memberUsers: [],
  isLoading: false,
  error: null,
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  setCurrentGroup: (currentGroup) => set({ currentGroup }),
  setMemberUsers: (memberUsers) => set({ memberUsers }),
  addMemberToCurrentGroup: (user) => set((state) => ({ memberUsers: [...state.memberUsers, user] })),
  updateCurrentGroup: (group) => set((state) => ({
    currentGroup: group,
    groups: state.groups.map(g => g.id === group.id ? group : g),
  })),
  removeMemberUser: (userId) => set((state) => ({
    memberUsers: state.memberUsers.filter(u => u.id !== userId),
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

export default useGroupsStore
