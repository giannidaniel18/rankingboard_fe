import Link from 'next/link'
import { getGroups } from '@/lib/actions/groups'
import { getDictionary, getLocale } from '@/lib/i18n'

export default async function GroupSidebar({ activeGroupId }: { activeGroupId?: string }) {
  const [groups, locale] = await Promise.all([getGroups(), getLocale()])
  const dict = await getDictionary(locale)

  return (
    <aside className="hidden md:flex w-56 shrink-0 bg-canvas min-h-screen flex-col border-r border-black/[0.08] dark:border-white/[0.07]">
      <div className="px-4 py-5 border-b border-black/[0.08] dark:border-white/[0.07]">
        <span className="font-heading text-[10px] font-bold tracking-[0.25em] uppercase text-amber-500">
          {dict.app.name}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-px">
        {/* Section label — structural, not primary content */}
        <p className="px-2 mb-3 text-[10px] font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-[0.2em]">
          {dict.nav.groups}
        </p>
        {groups.map(group => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className={`flex items-center gap-2.5 px-2 py-2 rounded-sm text-sm transition-colors ${
              activeGroupId === group.id
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
              activeGroupId === group.id
                ? 'bg-amber-500 text-black'
                : 'bg-black/10 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
            }`}>
              {group.name[0].toUpperCase()}
            </span>
            <span className="truncate">{group.name}</span>
            {/* Member count — metadata, caption level */}
            <span className="ml-auto text-[10px] font-mono text-neutral-400 dark:text-neutral-400">
              {group.members.length}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
