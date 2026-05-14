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
        <p className="text-[11px] font-mono text-red-500 dark:text-red-400 px-0.5">{error}</p>
      )}
      <input
        type="text"
        name="name"
        required
        autoComplete="name"
        placeholder="Your name"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-primary/60 transition-colors"
      />
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-primary/60 transition-colors"
      />
      <input
        type="password"
        name="password"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="Password (min. 6 characters)"
        className="w-full px-3 py-2.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-neutral-900 dark:text-neutral-100 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-primary/60 transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-primary hover:bg-custom-light-orange text-black rounded-sm text-[11px] font-bold tracking-[0.15em] uppercase disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Creating account…' : 'Create Account'}
      </button>
      <p className="text-center text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-primary font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
