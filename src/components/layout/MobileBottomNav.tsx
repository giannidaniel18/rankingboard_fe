'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users2, UserPlus, History, User, Plus } from 'lucide-react'
import { useI18n } from '@/components/providers/I18nProvider'

interface MobileBottomNavProps {
  onOpenModal: () => void
}

export default function MobileBottomNav({ onOpenModal }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { dict } = useI18n()

  const isActive = (href: string) =>
    href === '/groups' ? pathname.startsWith('/groups') : pathname === href

  const leftItems = [
    { href: '/groups', icon: Users2,   label: dict.nav.groups },
    { href: '/social', icon: UserPlus, label: dict.nav.social  },
  ]

  const rightItems = [
    { href: '/dashboard', icon: History, label: dict.nav.history },
    { href: '/profile',   icon: User,    label: dict.nav.profile },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="absolute inset-0 bg-white/85 dark:bg-[#080C12]/90 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.07]" />

      <div className="relative flex items-center justify-around h-16 px-2">
        {leftItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 min-w-[60px] py-1 transition-colors ${
                active ? 'text-amber-500' : 'text-neutral-500 dark:text-neutral-500'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[9px] font-semibold tracking-wider uppercase leading-none">
                {label}
              </span>
            </Link>
          )
        })}

        {/* Central FAB with label */}
        <div className="relative -top-4 flex flex-col items-center gap-1">
          <button
            onClick={onOpenModal}
            className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/40 transition-all active:scale-95 border-4 border-white dark:border-[#080C12]"
            aria-label={dict.nav.newMatch}
          >
            <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
          <span className="text-[8px] font-semibold tracking-wide uppercase leading-none text-amber-500 dark:text-amber-400 whitespace-nowrap">
            {dict.nav.newMatch}
          </span>
        </div>

        {rightItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 min-w-[60px] py-1 transition-colors ${
                active ? 'text-amber-500' : 'text-neutral-500 dark:text-neutral-500'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[9px] font-semibold tracking-wider uppercase leading-none">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
