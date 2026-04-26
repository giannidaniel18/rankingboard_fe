'use client'

import { createContext, useContext } from 'react'
import type { Dictionary, Locale } from '@/lib/i18n'

type I18nContextValue = { locale: Locale; dict: Dictionary }

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale
  dictionary: Dictionary
  children: React.ReactNode
}) {
  return (
    <I18nContext.Provider value={{ locale, dict: dictionary }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
