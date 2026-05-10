'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { FriendUser } from '@/lib/types'

interface ParticipantMultiSelectProps {
  members: FriendUser[]
  selected: FriendUser[]
  onChange: (participants: FriendUser[]) => void
  disabled?: boolean
  label: string
  placeholder?: string
}

export default function ParticipantMultiSelect({
  members,
  selected,
  onChange,
  disabled,
  label,
  placeholder = 'Add players…',
}: ParticipantMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedIds = new Set(selected.map(p => p.id))
  const available = members.filter(m => !selectedIds.has(m.id))
  const canOpen = !disabled && available.length > 0

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAdd = (member: FriendUser) => {
    onChange([...selected, member])
    if (available.length <= 1) setOpen(false)
  }

  const handleRemove = (id: string) => {
    onChange(selected.filter(p => p.id !== id))
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-tx-caption mb-1.5">
        {label}
      </label>

      <div
        role="button"
        tabIndex={canOpen ? 0 : -1}
        onClick={() => { if (canOpen) setOpen(v => !v) }}
        onKeyDown={e => { if (canOpen && (e.key === 'Enter' || e.key === ' ')) setOpen(v => !v) }}
        aria-expanded={open}
        className={`w-full min-h-[42px] flex items-center gap-2 bg-elevated border rounded-xl px-3 py-2 transition-all ${
          canOpen ? 'cursor-pointer' : 'cursor-default'
        } ${disabled ? 'opacity-40' : ''} ${
          open
            ? 'border-amber-500/40 ring-1 ring-amber-500/20'
            : 'border-white/[0.07] hover:border-white/[0.13]'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-sm text-tx-caption font-medium py-0.5">
              {disabled ? `— ${label} —` : placeholder}
            </span>
          ) : (
            selected.map(p => (
              <span
                key={p.id}
                className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold shrink-0"
              >
                {p.name}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemove(p.id) }}
                  disabled={disabled}
                  aria-label={`Remove ${p.name}`}
                  className="hover:text-amber-100 transition-colors disabled:opacity-40"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        {canOpen && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-tx-caption shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {open && available.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-elevated border border-white/[0.07] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="max-h-44 overflow-y-auto py-1">
            {available.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleAdd(m)}
                className="w-full text-left px-4 py-2 text-sm font-medium text-tx-primary hover:bg-white/[0.04] transition-colors flex items-center gap-2"
              >
                <span className="flex-1">{m.name}</span>
                <span className="text-[10px] font-mono text-tx-caption">#{m.alias}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
