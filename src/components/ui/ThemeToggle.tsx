'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useI18n } from '@/components/providers/I18nProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { dict } = useI18n()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <span className="w-8 h-8" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={dict.theme.toggle}
      className="w-8 h-8 flex items-center justify-center rounded-sm text-tx-caption hover:text-tx-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.41-1.41l.7-.71zm-8.44 0l.7.71a1 1 0 11-1.41 1.41l-.71-.7a1 1 0 011.42-1.42zM10 6a4 4 0 100 8 4 4 0 000-8zm8 4a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm11.66 4.24l.7.71a1 1 0 11-1.41 1.41l-.71-.7a1 1 0 011.42-1.42zm-11.32 0a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.41-1.41l.7-.71zM10 17a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}
