import type { Group, User } from '@/types'
import { store } from '@/lib/store'

const groupService = {
  getGroupById(id: string): Promise<Group | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(store.groups.get(id)), 300)
    })
  },

  getGroupMemberUsers(groupId: string): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const group = store.groups.get(groupId)
        if (!group) { resolve([]); return }
        const users = group.members.flatMap(m => {
          const user = store.users.get(m.userId)
          return user ? [user] : []
        })
        resolve(users)
      }, 300)
    })
  },

  getUserGroups(userId: string): Promise<Group[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(store.getUserGroups(userId)), 300)
    })
  },

  addMemberToGroup(groupId: string, userId: string): Promise<Group> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(store.addMemberToGroup(groupId, userId))
        } catch (err) {
          reject(err)
        }
      }, 300)
    })
  },

  createGroup(name: string, adminId: string): Promise<Group> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(store.createGroup(name, adminId))
        } catch (err) {
          reject(err)
        }
      }, 300)
    })
  },
}

export default groupService
