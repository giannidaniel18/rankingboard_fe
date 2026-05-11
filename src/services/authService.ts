import type { User } from '@/types'
import { store } from '@/lib/store'
import { loginAction, registerAction } from '@/lib/actions/auth'
import { signIn, signOut } from 'next-auth/react'

const authService = {
  syncUserToMockDB(user: User): Promise<void> {
    store.users.set(user.id, user)
    return Promise.resolve()
  },

  async login(email: string, password: string): Promise<string | null> {
    const fd = new FormData()
    fd.set('email', email)
    fd.set('password', password)
    return loginAction(null, fd)
  },

  async register(name: string, email: string, password: string): Promise<string | null> {
    const fd = new FormData()
    fd.set('name', name)
    fd.set('email', email)
    fd.set('password', password)
    return registerAction(null, fd)
  },

  async logout(): Promise<void> {
    await signOut({ redirectTo: '/login' })
  },

  async loginWithGoogle(): Promise<void> {
    await signIn('google', { redirectTo: '/dashboard' })
  },
}

export default authService
