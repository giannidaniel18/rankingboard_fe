import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDictionary, getLocale } from '@/lib/i18n'

import SocialManager from '@/components/social/SocialManager'
import { getUser } from '@/lib/actions/users'

export const metadata = { title: 'Social — RankingBoard' }

export default async function SocialPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [locale, user] = await Promise.all([
    getLocale(),
    getUser(session.user.id, {
      name:  session.user.name  ?? '',
      email: session.user.email ?? '',
      image: session.user.image ?? undefined,
    }),
  ])
  const dict = await getDictionary(locale)

  return (
    <div className="flex min-h-screen bg-canvas">
     

      <div className="flex-1 flex flex-col min-w-0">
      

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-2xl w-full">
            <div className="mb-6">
              <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
                {dict.social.title}
              </h1>
            </div>

            <SocialManager
              userId={session.user.id}
              userAlias={user?.alias ?? ''}
              dict={dict.social}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
