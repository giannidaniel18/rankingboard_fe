import { cookies } from 'next/headers'
import type { Dictionary } from './dictionaries/en'

export type { Dictionary }
export type Locale = 'en' | 'es'

export const LOCALES: Locale[] = ['en', 'es']
export const DEFAULT_LOCALE: Locale = 'en'

export async function getLocale(): Promise<Locale> {
  try {
    const store = await cookies()
    const val = store.get('locale')?.value as Locale | undefined
    return val && LOCALES.includes(val) ? val : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await import(`./dictionaries/${locale}`)
  return mod.default as Dictionary
}
