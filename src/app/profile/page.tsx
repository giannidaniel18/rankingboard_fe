import ProfileCard from '@/components/user/ProfileCard'
import { getDictionary, getLocale } from '@/lib/i18n'

export const metadata = { title: 'Profile — RankingBoard' }

export default async function ProfilePage() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-xl w-full">
            <div className="mb-6">
              <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
                {dict.profile.title}
              </h1>
            </div>

            <ProfileCard />
          </div>
        </main>
      </div>
    </div>
  )
}
