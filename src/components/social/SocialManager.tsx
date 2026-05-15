'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { UserSearch } from '@/components/social/UserSearch'
import { PendingRequests } from '@/components/social/PendingRequests'
import { FriendsList } from '@/components/social/FriendsList'
import { useSocial } from '@/hooks/domain/useSocial'
import { useAuth } from '@/hooks/domain/useAuth'
import type { Dictionary } from '@/lib/i18n'

type Tab = 'search' | 'pending' | 'friends'

interface Props {
  userId: string
  dict: Dictionary['social']
}

export default function SocialManager({ userId, dict }: Props) {
  const [tab, setTab] = useState<Tab>('search')
  const [copied, setCopied] = useState(false)

  const { friends, incomingRequests, sentRequests, isLoading, loadSocialDashboard, acceptReq, rejectReq } = useSocial()
  const { currentUser } = useAuth()

  useEffect(() => {
    void loadSocialDashboard(userId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleAccept = (requestId: string) => { void acceptReq(requestId) }
  const handleDecline = (requestId: string) => { void rejectReq(requestId) }

  const handleCopy = () => {
    const alias = currentUser?.alias ?? ''
    if (!alias) return
    navigator.clipboard.writeText(alias).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const userAlias = currentUser?.alias ?? ''

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'search',  label: dict.tabSearch },
    { id: 'pending', label: dict.tabPending, count: incomingRequests.length },
    { id: 'friends', label: dict.tabFriends, count: friends.length },
  ]

  return (
    <div>
      {userAlias && (
        <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-sm border border-black/[0.08] dark:border-white/[0.07] bg-surface">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-tx-caption mb-0.5">
              {dict.myAlias}
            </p>
            <p className="text-sm font-mono font-semibold text-brand-text dark:text-brand">{userAlias}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border border-black/[0.10] dark:border-white/[0.10] text-tx-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors min-w-[4.5rem] justify-center"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-win" />
                {dict.copied}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                {dict.copyAlias}
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex border-b border-black/[0.08] dark:border-white/[0.07] mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors ${
              tab === t.id
                ? 'text-brand-text dark:text-brand'
                : 'text-tx-caption hover:text-tx-secondary'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  t.id === 'pending'
                    ? 'bg-loss/15 text-loss'
                    : 'bg-black/[0.06] dark:bg-white/[0.08] text-tx-caption'
                }`}
              >
                {t.count}
              </span>
            )}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <UserSearch currentUserId={userId} />
      )}

      {tab === 'pending' && (
        <PendingRequests
          incoming={incomingRequests}
          sent={sentRequests}
          isPending={isLoading}
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
