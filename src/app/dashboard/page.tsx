import { Suspense } from 'react'
import GroupSidebar from '@/components/dashboard/GroupSidebar'
import MobileNav from '@/components/layout/MobileNav'
import RecentMatches from '@/components/dashboard/RecentMatches'
import { getDictionary, getLocale } from '@/lib/i18n'

export const metadata = { title: 'Dashboard — RankingBoard' }

export default async function DashboardPage() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="flex min-h-screen bg-canvas">
      <Suspense fallback={<div className="hidden md:block w-56 bg-canvas border-r border-white/[0.07]" />}>
        <GroupSidebar />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>

        <main className="flex-1 p-4 md:p-8 max-w-2xl w-full">
          <div className="mb-6">
            <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
              {dict.dashboard.title}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {dict.dashboard.subtitle}
            </p>
          </div>

          <Suspense fallback={<p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">…</p>}>
            <RecentMatches />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
