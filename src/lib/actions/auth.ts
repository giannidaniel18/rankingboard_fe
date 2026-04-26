'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/lib/auth'
import { store } from '@/lib/store'

export async function loginAction(_: string | null, formData: FormData): Promise<string | null> {
  try {
    await signIn('credentials', {
      email:      formData.get('email'),
      password:   formData.get('password'),
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) return 'Invalid credentials.'
    throw error
  }
  return null
}

export async function registerAction(_: string | null, formData: FormData): Promise<string | null> {
  const name     = formData.get('name')?.toString().trim() ?? ''
  const email    = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!name || !email || !password) return 'All fields are required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'

  const existing = [...store.users.values()].find(u => u.email.toLowerCase() === email)
  if (existing) return 'An account with this email already exists.'

  const id = `u_${Date.now()}`
  store.users.set(id, {
    id,
    email,
    name,
    profile: {
      stats: {
        totalMatches: 0, wins: 0, losses: 0,
        winRate: 0, currentStreak: 0, bestStreak: 0, rankingPoints: 100,
      },
      achievements: [],
    },
  })

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) return 'Registration succeeded but sign-in failed. Try logging in.'
    throw error
  }
  return null
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}

export async function googleSignInAction(): Promise<void> {
  await signIn('google', { redirectTo: '/dashboard' })
}
