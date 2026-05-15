'use client'

import { useState, useRef, useEffect } from 'react'
import { useSocial } from '@/hooks/domain/useSocial'
import type { User } from '@/types'

interface UserSearchProps {
  currentUserId: string
}

const AVATAR_PALETTE = ['bg-live', 'bg-brand text-black', 'bg-win', 'bg-violet-500', 'bg-loss']

function avatarColor(name: string): string {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 rounded-full bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-tx-caption">{pct}%</span>
    </div>
  )
}

export function UserSearch({ currentUserId }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { searchResults, sentRequests, search, sendReq } = useSocial()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      void search('', currentUserId)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(() => {
      void search(value, currentUserId).then(() => setIsSearching(false))
    }, 200)
  }

  const handleAddFriend = (user: User) => {
    void sendReq(currentUserId, user.id)
  }

  return (
    <div className="w-full max-w-md">
      {/* Search input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-tx-caption group-focus-within:text-brand transition-colors duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search by alias (e.g. #alice)…"
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-surface border border-black/[0.10] dark:border-white/[0.10] rounded-sm text-sm text-tx-primary placeholder:text-tx-caption font-mono outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all duration-200"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div className="w-3 h-3 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <ul className="mt-2 divide-y divide-black/[0.06] dark:divide-white/[0.05] rounded-sm border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-surface overflow-hidden">
          {searchResults.map(user => {
            const alreadySent = sentRequests.some(r => r.user.id === user.id)
            const initials = user.name.slice(0, 2).toUpperCase()

            return (
              <li
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors duration-150"
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white select-none ${avatarColor(user.name)}`}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-tx-primary truncate">{user.name}</p>
                    <span className="text-xs font-mono text-brand-text dark:text-brand truncate">{user.alias}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs font-mono text-brand">
                      {user.profile.stats.rankingPoints} pts
                    </span>
                    <WinRateBar rate={user.profile.stats.winRate} />
                  </div>
                </div>

                {alreadySent ? (
                  <span className="flex-shrink-0 text-[10px] font-mono text-brand-text dark:text-brand border border-brand/30 dark:border-brand/20 px-2 py-0.5 rounded-sm">
                    Pending
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddFriend(user)}
                    className="flex-shrink-0 px-3 py-1 rounded-sm text-xs font-semibold border border-brand/40 text-brand-text dark:text-brand hover:bg-brand/10 transition-all duration-200"
                  >
                    + Add
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Empty state */}
      {query.trim() && !isSearching && searchResults.length === 0 && (
        <p className="mt-3 text-center text-xs text-tx-caption font-mono">
          No players found for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  )
}
