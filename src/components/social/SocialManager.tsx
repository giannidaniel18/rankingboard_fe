'use client'

import { useState, useTransition, useEffect } from 'react'
import { UserSearch } from '@/components/social/UserSearch'
import { PendingRequests } from '@/components/social/PendingRequests'
import { FriendsList } from '@/components/social/FriendsList'
import {
  getPendingRequests,
  getSentRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
} from '@/lib/actions/friends'
import type { FriendRequestWithUser, FriendUser } from '@/lib/types'
import type { Dictionary } from '@/lib/i18n'

type Tab = 'search' | 'pending' | 'friends'

interface Props {
  userId: string
  userAlias: string
  dict: Dictionary['social']
}

export default function SocialManager({ userId, userAlias, dict }: Props) {
  const [tab, setTab] = useState<Tab>('search')
  const [incoming, setIncoming] = useState<FriendRequestWithUser[]>([])
  const [sent, setSent] = useState<FriendRequestWithUser[]>([])
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const [inc, snt, frds] = await Promise.all([
        getPendingRequests(userId),
        getSentRequests(userId),
        getFriends(userId),
      ])
      setIncoming(inc)
      setSent(snt)
      setFriends(frds)
    })
  }, [userId])

  const handleAccept = (requestId: string) => {
    startTransition(async () => {
      await acceptFriendRequest(requestId)
      const accepted = incoming.find(r => r.id === requestId)
      setIncoming(prev => prev.filter(r => r.id !== requestId))
      if (accepted) setFriends(prev => [...prev, accepted.user])
    })
  }

  const handleDecline = (requestId: string) => {
    startTransition(async () => {
      await declineFriendRequest(requestId)
      setIncoming(prev => prev.filter(r => r.id !== requestId))
    })
  }

  const handleRequestSent = (req: FriendRequestWithUser) => {
    setSent(prev => [...prev, req])
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(userAlias).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'search',  label: dict.tabSearch },
    { id: 'pending', label: dict.tabPending, count: incoming.length },
    { id: 'friends', label: dict.tabFriends, count: friends.length },
  ]

  return (
    <div>
      {userAlias && (
        <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-sm border border-black/[0.08] dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 mb-0.5">
              {dict.myAlias}
            </p>
            <p className="text-sm font-mono font-semibold text-amber-500 dark:text-amber-400">{userAlias}</p>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-sm text-xs font-semibold border border-black/[0.10] dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors min-w-[4.5rem] text-center"
          >
            {copied ? dict.copied : dict.copyAlias}
          </button>
        </div>
      )}

      <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors ${
              tab === t.id
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  t.id === 'pending'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {t.count}
              </span>
            )}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 dark:bg-amber-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <UserSearch
          currentUserId={userId}
          sentRequests={sent}
          onRequestSent={handleRequestSent}
        />
      )}

      {tab === 'pending' && (
        <PendingRequests
          incoming={incoming}
          sent={sent}
          isPending={isPending}
          onAccept={handleAccept}
          onDecline={handleDecline}
          dict={dict}
        />
      )}

      {tab === 'friends' && (
        <FriendsList
          friends={friends}
          dict={dict}
        />
      )}
    </div>
  )
}
