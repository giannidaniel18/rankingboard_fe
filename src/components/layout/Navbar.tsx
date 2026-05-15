import Link from 'next/link'
import { getDictionary, getLocale } from '@/lib/i18n'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LanguageToggle from '@/components/ui/LanguageToggle'
import UserAvatar from '@/components/user/UserAvatar'

export default async function Navbar() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-5 border-b border-black/[0.08] dark:border-white/[0.06] bg-white/95 dark:bg-canvas/95 backdrop-blur-md">
      <Link
        href="/dashboard"
        className="font-heading text-[11px] font-bold tracking-[0.2em] uppercase text-tx-primary hover:text-brand-text dark:hover:text-brand transition-colors"
      >
        {dict.app.name}
      </Link>
      <div className="flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
        <UserAvatar />
      </div>
    </header>
  )
}
