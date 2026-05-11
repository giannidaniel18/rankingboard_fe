import { create } from 'zustand'
import type { User, FriendUser, FriendRequestWithUser } from '@/types'

interface SocialState {
  friends: FriendUser[]
  incomingRequests: FriendRequestWithUser[]
  sentRequests: FriendRequestWithUser[]
  searchResults: User[]
  isLoading: boolean
  setFriends: (friends: FriendUser[]) => void
  setIncomingRequests: (requests: FriendRequestWithUser[]) => void
  setSentRequests: (requests: FriendRequestWithUser[]) => void
  setSearchResults: (results: User[]) => void
  setLoading: (isLoading: boolean) => void
}

const useSocialStore = create<SocialState>((set) => ({
  friends: [],
  incomingRequests: [],
  sentRequests: [],
  searchResults: [],
  isLoading: false,
  setFriends: (friends) => set({ friends }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests }),
  setSentRequests: (sentRequests) => set({ sentRequests }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setLoading: (isLoading) => set({ isLoading }),
}))

export default useSocialStore
