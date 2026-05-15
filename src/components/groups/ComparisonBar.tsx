'use client'

import { X } from 'lucide-react'
import type { RankedMember } from '@/types'

interface ComparisonBarProps {
  playerA: RankedMember
  onCancel: () => void
}

export default function ComparisonBar({ playerA, onCancel }: ComparisonBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 animate-bar-enter"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Brand top border */}
      <div className="h-px bg-brand/50" />

      <div className="bg-canvas/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 h-16">

          {/* Player A — selected */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-sm bg-brand text-black flex items-center justify-center font-bold text-sm shrink-0">
              {playerA.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-[13px] text-tx-primary truncate leading-tight">
                {playerA.name}
              </p>
              <p className="font-mono text-[10px] text-tx-caption leading-tight tabular-nums">
                #{playerA.alias}
              </p>
            </div>
          </div>

          {/* VS label */}
          <span className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-brand/80 shrink-0">
            vs
          </span>

          {/* Player B placeholder */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-sm border-2 border-dashed border-tx-primary/15 flex items-center justify-center">
              <span className="font-heading text-[11px] font-bold text-tx-caption/50">?</span>
            </div>
            <p className="font-mono text-[10px] text-tx-caption hidden sm:block">
              Pick opponent
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Cancel */}
          <button
            onClick={onCancel}
            aria-label="Cancel comparison"
            className="w-8 h-8 flex items-center justify-center rounded text-tx-caption hover:text-tx-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
