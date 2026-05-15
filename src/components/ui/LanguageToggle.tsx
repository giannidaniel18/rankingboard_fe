'use client'

import { useTransition } from 'react'
import { useAppI18n } from '@/hooks/domain/useAppI18n'
import { useI18n } from '@/components/providers/I18nProvider'
import type { Locale } from '@/lib/i18n'

export default function LanguageToggle() {
  const { locale, dict } = useI18n()
  const { setLanguage } = useAppI18n()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next: Locale = locale === 'en' ? 'es' : 'en'
    startTransition(() => setLanguage(next))
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="w-8 h-8 flex items-center justify-center rounded-sm font-mono text-[10px] font-bold tracking-wider text-tx-caption hover:text-tx-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
    >
      {locale === 'en' ? dict.lang.es : dict.lang.en}
    </button>
  )
}
