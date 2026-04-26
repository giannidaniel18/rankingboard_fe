import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import GroupSidebar from '@/components/dashboard/GroupSidebar'
import MobileNav from '@/components/layout/MobileNav'
import ProfileCard from '@/components/user/ProfileCard'
import { auth } from '@/lib/auth'
import { getUser } from '@/lib/actions/users'
import { getDictionary, getLocale } from '@/lib/i18n'

export const metadata = { title: 'Profile — RankingBoard' }

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) return null

  const [user, locale] = await Promise.all([
    getUser(session.user.id, {
      name:  session.user.name  ?? '',
      email: session.user.email ?? '',
      image: session.user.image ?? undefined,
    }),
    getLocale(),
  ])
  if (!user) notFound()

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

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-xl w-full">
            <div className="mb-6">
              <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
                {dict.profile.title}
              </h1>
            </div>

            <ProfileCard user={user} />
          </div>
        </main>
      </div>
    </div>
  )
}
