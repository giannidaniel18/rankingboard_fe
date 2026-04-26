import Link from 'next/link'
import { getGroups } from '@/lib/actions/groups'
import { getDictionary, getLocale } from '@/lib/i18n'

export default async function MobileNav({ activeGroupId }: { activeGroupId?: string }) {
  const [groups, locale] = await Promise.all([getGroups(), getLocale()])
  const dict = await getDictionary(locale)

  const inactiveClass = 'text-neutral-500 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-white'

  return (
    <div className="md:hidden border-b border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-canvas">
      <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none">
        <Link
          href="/dashboard"
          className={`shrink-0 px-3 py-1.5 rounded-sm text-[11px] font-semibold tracking-wide uppercase transition-colors ${
            !activeGroupId ? 'bg-amber-500 text-black' : inactiveClass
          }`}
        >
          {dict.nav.dashboard}
        </Link>
        {groups.map(group => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className={`shrink-0 px-3 py-1.5 rounded-sm text-[11px] font-semibold tracking-wide uppercase transition-colors ${
              activeGroupId === group.id ? 'bg-amber-500 text-black' : inactiveClass
            }`}
          >
            {group.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
