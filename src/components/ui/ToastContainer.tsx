'use client'

import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import useToastStore, { type ToastType } from '@/store/useToastStore'

const ACCENT: Record<ToastType, string> = {
  success: 'var(--color-win)',
  error:   'var(--color-loss)',
  info:    'var(--color-live)',
}

const ICON: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error:   AlertCircle,
  info:    Info,
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon = ICON[toast.type]

        return (
          <div
            key={toast.id}
            role="alert"
            style={{ '--accent': ACCENT[toast.type] } as React.CSSProperties}
            className={[
              'pointer-events-auto',
              'flex items-start gap-3',
              'w-80 max-w-[calc(100vw-3rem)]',
              'px-4 py-3 rounded-xl',
              'bg-[var(--rb-elevated)]',
              'border border-white/[0.06]',
              '[border-left-color:var(--accent)] [border-left-width:2px]',
              'shadow-xl shadow-black/50',
              toast.exiting ? 'animate-toast-exit' : 'animate-toast-enter',
            ].join(' ')}
          >
            <Icon
              size={15}
              className="mt-0.5 shrink-0 [color:var(--accent)]"
              aria-hidden
            />
            <p className="flex-1 text-sm text-tx-secondary leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 mt-0.5 text-tx-caption hover:text-tx-secondary transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
