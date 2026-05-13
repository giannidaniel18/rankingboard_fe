'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users2, UserPlus, History, User, Plus } from 'lucide-react'
import { useI18n } from '@/components/providers/I18nProvider'

interface SideNavBarProps {
  onOpenModal: () => void
  canRecordMatch?: boolean
}

export default function SideNavBar({ onOpenModal, canRecordMatch = true }: SideNavBarProps) {
  const pathname = usePathname()
  const { dict } = useI18n()

  const isActive = (href: string) =>
    href === '/groups' ? pathname.startsWith('/groups') : pathname === href

  const navItems = [
    { href: '/groups',    icon: Users2,   label: dict.nav.groups  },
    { href: '/social',   icon: UserPlus,  label: dict.nav.social  },
    { href: '/dashboard', icon: History,  label: dict.nav.history },
    { href: '/profile',   icon: User,     label: dict.nav.profile },
  ]

  return (
    <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-56 flex-col bg-canvas border-r border-black/[0.08] dark:border-white/[0.07] z-30">
      {canRecordMatch && (
        <div className="p-3 border-b border-black/[0.08] dark:border-white/[0.07]">
          <button
            onClick={onOpenModal}
            className="group w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-heading text-[11px] font-bold tracking-[0.15em] uppercase transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" strokeWidth={3} />
            {dict.nav.newMatch}
          </button>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-500' : ''}`} />
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
