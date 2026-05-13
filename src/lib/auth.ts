import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { store, generateAlias } from '@/lib/store'

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user']
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase()
        if (!email || !credentials?.password) return null
        const user = [...store.users.values()].find(u => u.email.toLowerCase() === email)
        if (!user) return null
        return { id: user.id, name: user.name, email: user.email, image: user.image ?? null }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id && user.email) {
        // Swap any placeholder whose email matches the real Google account.
        // Must run before the has(user.id) check so the bridged ID is found.
        store.bridgeIdentity(user.id, user.email)

        if (!store.users.has(user.id)) {
          const name = user.name ?? user.email.split('@')[0]
          store.users.set(user.id, {
            id: user.id,
            email: user.email,
            name,
            alias: generateAlias(name),
            image: user.image ?? undefined,
            friends: [],
            profile: {
              stats: {
                totalMatches: 0, wins: 0, losses: 0,
                winRate: 0, currentStreak: 0, bestStreak: 0, rankingPoints: 100,
              },
              achievements: [],
            },
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
