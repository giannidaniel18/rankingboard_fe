'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/lib/actions/auth'

export default function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-2.5">
      {error && (
        <p className="text-[11px] font-mono text-red-500 dark:text-red-400 px-0.5">{error}</p>
      )}
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder="Password"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-sm text-[11px] font-bold tracking-[0.15em] uppercase disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Signing in…' : 'Sign In'}
      </button>
      <p className="text-center text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
        No account?{' '}
        <Link href="/register" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
          Register
        </Link>
      </p>
    </form>
  )
}
