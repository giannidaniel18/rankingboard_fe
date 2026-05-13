/**
 * Mock NextAuth configuration.
 *
 * To activate real auth:
 *   npm install next-auth
 *
 * Required env vars:
 *   NEXTAUTH_SECRET=<random string>
 *   GOOGLE_CLIENT_ID=<from Google Console>
 *   GOOGLE_CLIENT_SECRET=<from Google Console>
 *   EMAIL_SERVER=smtp://...
 *   EMAIL_FROM=noreply@yourdomain.com
 *
 * Then replace this file with:
 *   import Google from 'next-auth/providers/google'
 *   import Resend from 'next-auth/providers/resend' // or EmailProvider
 *   export const { handlers, auth, signIn, signOut } = NextAuth({ providers: [...] })
 */

export type MockSession = {
  user: {
    id: string
    email: string
    name: string
    image?: string
  }
  expires: string
}

// Active session used throughout the app while auth is mocked
export const MOCK_SESSION: MockSession = {
  user: {
    id: 'u_daniel',
    email: 'giannidaniel92@gmail.com',
    name: 'Daniel',
  },
  expires: '2099-01-01',
}

export function getSession(): MockSession {
  return MOCK_SESSION
}
