import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  setCurrentUser: (user: User | null) => void
}

const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: user !== null }),
}))

export default useAuthStore
