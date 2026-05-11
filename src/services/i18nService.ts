import { setLocale } from '@/lib/actions/locale'
import type { Locale } from '@/lib/i18n'

const i18nService = {
  async changeLanguage(locale: Locale): Promise<void> {
    await setLocale(locale)
  },
}

export default i18nService
