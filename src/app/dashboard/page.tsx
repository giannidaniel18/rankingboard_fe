import RecentMatches from '@/components/dashboard/RecentMatches'
import { getDictionary, getLocale } from '@/lib/i18n'

export const metadata = { title: 'Dashboard — RankingBoard' }

export default async function DashboardPage() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 w-full">
          <div className="mb-6">
            <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-tx-primary">
              {dict.dashboard.title}
            </h1>
            <p className="text-sm text-tx-caption mt-1">
              {dict.dashboard.subtitle}
            </p>
          </div>

          <RecentMatches />
        </main>
      </div>
    </div>
  )
}
