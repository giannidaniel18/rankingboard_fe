'use client'

import { X, Swords } from 'lucide-react'

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MatchModal({ isOpen, onClose }: MatchModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-surface border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Swords className="w-8 h-8 text-amber-500" />
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold tracking-[0.08em] uppercase text-neutral-900 dark:text-white mb-2">
              New Match
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Match registration is coming soon.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors border border-black/[0.06] dark:border-white/[0.06]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
