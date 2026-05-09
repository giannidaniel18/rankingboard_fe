'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { UserPlus, Users, X, Search, Check } from 'lucide-react'
import { addMemberToGroup } from '@/lib/actions/groups'
import { searchUsers, sendFriendRequest, getFriends } from '@/lib/actions/friends'
import type { FriendUser, User } from '@/lib/types'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

interface Props {
  groupId: string
  currentUserId: string
  existingMemberIds: string[]
  dict: Dictionary
  onClose: () => void
  onMemberAdded: (friend: FriendUser) => void
}

export default function InviteMemberModal({
  groupId,
  currentUserId,
  existingMemberIds,
  dict,
  onClose,
  onMemberAdded,
}: Props) {
  const t = dict.group
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set())
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set(existingMemberIds))
  const [toast, setToast] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getFriends(currentUserId).then(friends => {
      setFriendIds(new Set(friends.map(f => f.id)))
    })
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [currentUserId])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(() => {
      searchUsers(value, currentUserId).then(users => {
        setResults(users.filter(u => !memberIds.has(u.id)))
        setSearching(false)
      })
    }, 250)
  }

  const handleAdd = (user: User) => {
    if (isPending) return
    const isFriend = friendIds.has(user.id)
    startTransition(async () => {
      await addMemberToGroup(groupId, user.id)
      if (!isFriend) {
        // sendFriendRequest is idempotent — returns existing if already pending
        await sendFriendRequest(currentUserId, user.id).catch(() => {})
      }
      setMemberIds(prev => new Set([...prev, user.id]))
      setResults(prev => prev.filter(u => u.id !== user.id))
      onMemberAdded({ id: user.id, name: user.name, email: user.email, alias: user.alias })
      if (!isFriend) {
        setToast(t.addedWithFriendRequest)
        setTimeout(() => setToast(null), 3500)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm mx-4 bg-surface border border-black/[0.10] dark:border-white/[0.10] rounded-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.08] dark:border-white/[0.07]">
          <h2 className="font-heading text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
            {t.inviteFriends}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast — slides in when a non-friend is added */}
        {toast && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">{toast}</p>
          </div>
        )}

        {/* Search input */}
        <div className="px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && onClose()}
              placeholder={t.searchByAlias}
              className="w-full pl-8 pr-8 py-2 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500/60 transition-colors"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Users className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">{t.searchToInvite}</p>
            </div>
          ) : results.length === 0 && !searching ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">{t.noUsersFound}</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {results.map(user => {
                const isFriend = friendIds.has(user.id)
                return (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-sm bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-[11px] text-neutral-600 dark:text-neutral-300 shrink-0">
                      {user.name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate leading-tight">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono text-[11px] text-amber-500 dark:text-amber-400 truncate leading-tight">
                          {user.alias}
                        </p>
                        {!isFriend && (
                          <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                            · {t.notAFriend}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(user)}
                      disabled={isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold tracking-[0.1em] uppercase transition-colors disabled:opacity-40 shrink-0 ${
                        isFriend
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/[0.15] text-neutral-800 dark:text-neutral-100'
                      }`}
                    >
                      <UserPlus className="w-3 h-3" />
                      {isFriend ? t.addToGroup : t.addAndRequest}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
