import LoginForm from '@/components/auth/LoginForm'
import { googleSignInAction } from '@/lib/actions/auth'

export const metadata = { title: 'Sign In — RankingBoard' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand lockup */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-white mb-2">
            RankingBoard
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-amber-500/50" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Track your rankings
            </span>
            <div className="h-px w-8 bg-amber-500/50" />
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.08] p-7">
          {/* Google OAuth */}
          <form action={googleSignInAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-sm border border-black/[0.12] dark:border-white/[0.10] text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-black/[0.08] dark:bg-white/[0.06]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">or</span>
            <div className="flex-1 h-px bg-black/[0.08] dark:bg-white/[0.06]" />
          </div>

          <LoginForm />
        </div>

        <p className="mt-4 text-center text-[11px] text-neutral-400">
          Dev accounts: alice@example.com · bob@example.com
        </p>
      </div>
    </div>
  )
}
