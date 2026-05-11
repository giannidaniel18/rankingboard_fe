import { useRouter } from 'next/navigation'
import i18nService from '@/services/i18nService'
import type { Locale } from '@/lib/i18n'

export function useAppI18n() {
  const router = useRouter()

  async function setLanguage(locale: Locale): Promise<void> {
    await i18nService.changeLanguage(locale)
    router.refresh()
  }

  return { setLanguage }
}
