import type { Metadata } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/providers/ThemeProvider'
import NextAuthProvider from '@/components/providers/NextAuthProvider'
import { I18nProvider } from '@/components/providers/I18nProvider'
import { getLocale, getDictionary } from '@/lib/i18n'
import Navbar from '@/components/layout/Navbar'
import NavigationShell from '@/components/layout/NavigationShell'
import { getServerSession } from '@/lib/auth/session'

const syne = Syne({ variable: '--font-syne', subsets: ['latin'], weight: ['600', '700', '800'] })
const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], weight: ['300', '400', '500', '600'] })
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'RankingBoard',
  description: 'Track rankings, matches, and achievements across your game groups',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, session] = await Promise.all([getLocale(), getServerSession().catch(() => null)])
  const dictionary = await getDictionary(locale)

  return (
    <html lang={locale} className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <NextAuthProvider>
          <ThemeProvider>
            <I18nProvider locale={locale} dictionary={dictionary}>
              <Navbar />
              <NavigationShell sessionUser={session?.user ?? null} />
              <div className="pt-14 md:pl-56 pb-20 md:pb-0">
                {children}
              </div>
            </I18nProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
