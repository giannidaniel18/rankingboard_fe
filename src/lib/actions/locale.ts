'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Locale } from '@/lib/i18n'
import { LOCALES } from '@/lib/i18n'

export async function setLocale(locale: Locale): Promise<void> {
  if (!LOCALES.includes(locale)) return
  const store = await cookies()
  store.set('locale', locale, { maxAge: 60 * 60 * 24 * 365, path: '/' })
  revalidatePath('/', 'layout')
}
