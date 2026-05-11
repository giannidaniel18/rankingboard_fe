import useAuthStore from '@/store/useAuthStore'
import authService from '@/services/authService'
import userService from '@/services/userService'
import type { User } from '@/types'

export function useAuth() {
  const { currentUser, isAuthenticated, setCurrentUser } = useAuthStore()

  function hydrateAuth(user: User): void {
    setCurrentUser(user)
    void authService.syncUserToMockDB(user)
  }

  async function login(email: string, password: string): Promise<string | null> {
    return authService.login(email, password)
  }

  async function register(name: string, email: string, password: string): Promise<string | null> {
    return authService.register(name, email, password)
  }

  async function logout(): Promise<void> {
    setCurrentUser(null)
    await authService.logout()
  }

  async function loginWithGoogle(): Promise<void> {
    await authService.loginWithGoogle()
  }

  async function updateProfile(name: string, bio: string): Promise<void> {
    if (!currentUser) return
    const updated = await userService.updateProfile(currentUser, { name, bio })
    setCurrentUser(updated)
  }

  return { currentUser, isAuthenticated, hydrateAuth, login, register, logout, loginWithGoogle, updateProfile }
}
