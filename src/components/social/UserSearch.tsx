'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { searchUsers, sendFriendRequest } from '@/lib/actions/friends'
import type { User, FriendRequestWithUser } from '@/lib/types'

interface UserSearchProps {
  currentUserId: string
  sentRequests: FriendRequestWithUser[]
  onRequestSent: (req: FriendRequestWithUser) => void
}

const AVATAR_PALETTE = [
  'bg-cyan-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
]

function avatarColor(name: string): string {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{pct}%</span>
    </div>
  )
}

export function UserSearch({ currentUserId, sentRequests, onRequestSent }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const users = await searchUsers(value, currentUserId)
        setResults(users)
      })
    }, 200)
  }

  const handleAddFriend = (user: User) => {
    startTransition(async () => {
      const friendship = await sendFriendRequest(currentUserId, user.id)
      onRequestSent({
        id: friendship.id,
        user: { id: user.id, name: user.name, email: user.email, alias: user.alias },
      })
    })
  }

  return (
    <div className="w-full max-w-md">
      {/* Search input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-neutral-500 group-focus-within:text-cyan-400 transition-colors duration-200"
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
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 font-mono outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200"
        />
        {isPending && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          {results.map(user => {
            const alreadySent = sentRequests.some(r => r.user.id === user.id)
            const initials = user.name.slice(0, 2).toUpperCase()

            return (
              <li
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors duration-150"
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white select-none ${avatarColor(user.name)}`}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                    <span className="text-xs font-mono text-amber-400/70 truncate">{user.alias}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs font-mono text-amber-400">
                      {user.profile.stats.rankingPoints} pts
                    </span>
                    <WinRateBar rate={user.profile.stats.winRate} />
                  </div>
                </div>

                {alreadySent ? (
                  <span className="flex-shrink-0 text-[10px] font-mono text-amber-600 border border-amber-600/30 dark:border-amber-900/60 px-2 py-0.5 rounded-sm">
                    Pending
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddFriend(user)}
                    disabled={isPending}
                    className="flex-shrink-0 px-3 py-1 rounded-md text-xs font-semibold border border-cyan-600 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 disabled:opacity-50"
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
      {query.trim() && !isPending && results.length === 0 && (
        <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          No players found for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  )
}
