import { store } from '@/lib/store'
import type { User, FriendUser, FriendRequestWithUser } from '@/types'

const socialService = {
  getFriends(userId: string): Promise<FriendUser[]> {
    return new Promise(resolve =>
      setTimeout(() => resolve(store.getFriends(userId)), 300)
    )
  },

  getPendingRequests(userId: string): Promise<FriendRequestWithUser[]> {
    return new Promise(resolve =>
      setTimeout(() => resolve(store.getPendingIncoming(userId)), 300)
    )
  },

  getSentRequests(userId: string): Promise<FriendRequestWithUser[]> {
    return new Promise(resolve =>
      setTimeout(() => resolve(store.getPendingSent(userId)), 300)
    )
  },

  searchUsers(query: string, currentUserId: string): Promise<User[]> {
    return new Promise(resolve =>
      setTimeout(() => resolve(store.searchUsers(query, currentUserId)), 300)
    )
  },

  sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequestWithUser> {
    return new Promise(resolve =>
      setTimeout(() => {
        const friendship = store.sendFriendRequest(fromUserId, toUserId)
        const toUser = store.users.get(toUserId)
        resolve({
          id: friendship.id,
          user: {
            id: toUserId,
            name: toUser?.name ?? 'Unknown',
            email: toUser?.email ?? '',
            alias: toUser?.alias ?? '',
          },
        })
      }, 300)
    )
  },

  acceptRequest(requestId: string): Promise<void> {
    return new Promise(resolve =>
      setTimeout(() => { store.acceptFriendRequest(requestId); resolve() }, 300)
    )
  },

  rejectRequest(requestId: string): Promise<void> {
    return new Promise(resolve =>
      setTimeout(() => { store.declineFriendRequest(requestId); resolve() }, 300)
    )
  },

  cancelRequest(requestId: string): Promise<void> {
    return new Promise(resolve =>
      setTimeout(() => { store.declineFriendRequest(requestId); resolve() }, 300)
    )
  },
}

export default socialService
