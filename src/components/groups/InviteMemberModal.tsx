'use client'

import { useState, useEffect, useRef } from 'react'
import { UserPlus, Users, X, Search, Check } from 'lucide-react'
import { useSocial } from '@/hooks/domain/useSocial'
import type { User } from '@/types'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

interface Props {
  groupId: string
  currentUserId: string
  existingMemberIds: string[]
  dict: Dictionary
  onClose: () => void
  onMemberAdded: (user: User) => Promise<void>
}

export default function InviteMemberModal({
  groupId: _groupId,
  currentUserId,
  existingMemberIds,
  dict,
  onClose,
  onMemberAdded,
}: Props) {
  const t = dict.group
  const [query, setQuery] = useState('')
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set(existingMemberIds))
  const [toast, setToast] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { friends, searchResults, loadFriends, search, sendReq } = useSocial()

  const friendIds = new Set(friends.map(f => f.id))
  const filteredResults = searchResults.filter(u => !memberIds.has(u.id))

  useEffect(() => {
    void loadFriends(currentUserId)
    const id = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  const handleSearch = (value: string) => {
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
    }, 250)
  }

  const handleAdd = async (user: User) => {
    if (isAdding) return
    setIsAdding(true)
    const isFriend = friendIds.has(user.id)
    try {
      await onMemberAdded(user)
      if (!isFriend) {
        await sendReq(currentUserId, user.id).catch(() => {})
      }
      setMemberIds(prev => new Set([...prev, user.id]))
      if (!isFriend) {
        setToast(t.addedWithFriendRequest)
        setTimeout(() => setToast(null), 3500)
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm mx-4 bg-surface border border-black/[0.10] dark:border-white/[0.10] rounded-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.08] dark:border-white/[0.07]">
          <h2 className="font-heading text-[11px] font-bold tracking-[0.2em] uppercase text-tx-primary">
            {t.inviteFriends}
          </h2>
          <button
            onClick={onClose}
            className="text-tx-caption hover:text-tx-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-win/10 border-b border-win/20">
            <Check className="w-3 h-3 text-win shrink-0" />
            <p className="text-[11px] font-mono text-win">{toast}</p>
          </div>
        )}

        {/* Search input */}
        <div className="px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tx-caption pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && onClose()}
              placeholder={t.searchByAlias}
              className="w-full pl-8 pr-8 py-2 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-sm text-tx-primary placeholder:text-tx-caption font-mono focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Users className="w-7 h-7 text-tx-caption" />
              <p className="text-xs text-tx-caption font-mono">{t.searchToInvite}</p>
            </div>
          ) : filteredResults.length === 0 && !isSearching ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-tx-caption font-mono">{t.noUsersFound}</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredResults.map(user => {
                const isFriend = friendIds.has(user.id)
                return (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-sm bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-[11px] text-tx-secondary shrink-0">
                      {user.name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-tx-primary truncate leading-tight">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono text-[11px] text-brand-text dark:text-brand truncate leading-tight">
                          {user.alias}
                        </p>
                        {!isFriend && (
                          <span className="text-[9px] font-mono text-tx-caption shrink-0">
                            · {t.notAFriend}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { void handleAdd(user) }}
                      disabled={isAdding}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold tracking-[0.1em] uppercase transition-all disabled:opacity-40 shrink-0 ${
                        isFriend
                          ? 'bg-brand hover:bg-brand-hover active:bg-brand-active text-black'
                          : 'bg-black/[0.06] hover:bg-black/[0.10] dark:bg-white/10 dark:hover:bg-white/[0.15] text-tx-secondary'
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
