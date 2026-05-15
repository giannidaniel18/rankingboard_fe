'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import type { Game } from '@/types'

interface GameComboboxProps {
  games: Game[]
  value: string
  onChange: (gameId: string) => void
  disabled?: boolean
  label: string
  searchPlaceholder?: string
}

const TYPE_ORDER = ['Board', 'eSport', 'Sports'] as const

export default function GameCombobox({
  games,
  value,
  onChange,
  disabled,
  label,
  searchPlaceholder = 'Search…',
}: GameComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedGame = games.find(g => g.id === value)

  const filtered = query.trim()
    ? games.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
    : games

  const grouped = TYPE_ORDER.reduce<Record<string, Game[]>>((acc, type) => {
    const items = filtered.filter(g => g.type === type)
    if (items.length) acc[type] = items
    return acc
  }, {})

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleToggle = () => {
    if (disabled) return
    const next = !open
    setOpen(next)
    if (next) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleSelect = (gameId: string) => {
    onChange(gameId)
    setOpen(false)
    setQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-tx-caption mb-1.5">
        {label}
      </label>

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center gap-2 bg-elevated border rounded-xl px-4 py-2.5 text-sm transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed text-left ${
          open
            ? 'border-brand/50 ring-1 ring-brand/15'
            : 'border-white/[0.07] hover:border-white/[0.13]'
        }`}
      >
        <span className={`flex-1 truncate font-medium ${selectedGame ? 'text-tx-primary' : 'text-tx-caption'}`}>
          {selectedGame ? selectedGame.name : `— ${label} —`}
        </span>
        {selectedGame && !disabled ? (
          <X
            className="w-3.5 h-3.5 text-tx-caption hover:text-tx-primary shrink-0 transition-colors"
            onClick={handleClear}
          />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-tx-caption shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-elevated border border-white/[0.07] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.05]">
            <Search className="w-3.5 h-3.5 text-tx-caption shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-tx-primary placeholder:text-tx-caption outline-none font-medium"
            />
          </div>

          <div className="max-h-52 overflow-y-auto">
            {Object.keys(grouped).length === 0 ? (
              <p className="px-4 py-3 text-xs text-tx-caption font-mono text-center">No results</p>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <p className="px-3 pt-2.5 pb-1 text-[9px] font-bold tracking-[0.2em] uppercase text-brand/60">
                    {type}
                  </p>
                  {items.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelect(g.id)}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                        g.id === value
                          ? 'text-brand bg-brand/10'
                          : 'text-tx-primary hover:bg-white/[0.04]'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
