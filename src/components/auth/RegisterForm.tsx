'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/domain/useAuth'

export default function RegisterForm() {
  const { register } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name     = fd.get('name')     as string
    const email    = fd.get('email')    as string
    const password = fd.get('password') as string

    setIsPending(true)
    setError(null)
    try {
      const err = await register(name, email, password)
      if (err) setError(err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && (
        <p className="text-[11px] font-mono text-loss px-0.5">{error}</p>
      )}
      <input
        type="text"
        name="name"
        required
        autoComplete="name"
        placeholder="Your name"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-tx-primary text-sm placeholder:text-tx-caption focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all"
      />
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-tx-primary text-sm placeholder:text-tx-caption focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all"
      />
      <input
        type="password"
        name="password"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="Password (min. 6 characters)"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-tx-primary text-sm placeholder:text-tx-caption focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-brand hover:bg-brand-hover active:bg-brand-active text-black rounded-sm text-[11px] font-bold tracking-[0.15em] uppercase disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        {isPending ? 'Creating account…' : 'Create Account'}
      </button>
      <p className="text-center text-[11px] text-tx-caption pt-1">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-text dark:text-brand hover:text-brand font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
