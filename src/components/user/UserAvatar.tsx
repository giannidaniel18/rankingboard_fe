'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/components/providers/I18nProvider'
import { useAuth } from '@/hooks/domain/useAuth'

interface Props {
  dropUp?: boolean
  pendingCount?: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()
}

export default function UserAvatar({ dropUp = false, pendingCount = 0 }: Props) {
  const { data: session, status } = useSession()
  const { dict } = useI18n()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  if (status === 'loading') {
    return <div className="w-7 h-7 rounded-sm bg-primary/30 animate-pulse" />
  }

  if (status === 'unauthenticated') {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors"
      >
        Sign In
      </Link>
    )
  }

  const name  = session?.user?.name  ?? 'User'
  const image = session?.user?.image ?? null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="User menu"
        aria-expanded={open}
        className="w-7 h-7 rounded-sm overflow-hidden flex items-center justify-center bg-primary text-secondary text-[10px] font-bold shrink-0 hover:bg-custom-light-orange focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
      >
        {image ? (
          <Image src={image} alt={name} width={28} height={28} className="object-cover w-full h-full" />
        ) : (
          getInitials(name)
        )}
      </button>

      {open && (
        <div
          className={`absolute ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-44 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-elevated shadow-lg py-1 z-50`}
        >
          <div className="px-3 py-2 border-b border-black/[0.08] dark:border-white/[0.07]">
            <p className="font-heading text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-900 dark:text-neutral-100 truncate">
              {name}
            </p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {dict.user.profile}
          </Link>
          <Link
            href="/social"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {dict.user.social}
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            )}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {dict.user.settings}
          </Link>

          <div className="border-t border-black/[0.08] dark:border-white/[0.07] mt-1 pt-1">
            <button
              type="button"
              onClick={() => { setOpen(false); void logout() }}
              className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {dict.user.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
