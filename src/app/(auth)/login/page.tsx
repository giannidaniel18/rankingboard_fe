import LoginForm from '@/components/auth/LoginForm'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

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
          <GoogleSignInButton />

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
