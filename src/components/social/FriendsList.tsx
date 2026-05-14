'use client'

import Link from 'next/link'
import type { FriendUser } from '@/types'
import type { Dictionary } from '@/lib/i18n'

const AVATAR_PALETTE = ['bg-cyan-500', 'bg-primary', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500']

function avatarColor(name: string): string {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

interface Props {
  friends: FriendUser[]
  dict: Dictionary['social']
}

export function FriendsList({ friends, dict }: Props) {
  if (friends.length === 0) {
    return <p className="text-sm text-neutral-400 dark:text-neutral-600 font-mono">{dict.noFriends}</p>
  }

  return (
    <ul className="space-y-2">
      {friends.map(friend => (
        <li
          key={friend.id}
          className="flex items-center gap-3 px-4 py-3 rounded-sm border border-black/[0.08] dark:border-white/[0.10] bg-surface"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarColor(friend.name)}`}
          >
            {friend.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{friend.name}</p>
            <p className="text-xs font-mono text-primary/80 dark:text-primary/70 truncate">{friend.alias}</p>
          </div>
          <Link
            href={`/profile/${friend.id}`}
            className="shrink-0 px-3 py-1 rounded-sm text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          >
            {dict.viewProfile}
          </Link>
        </li>
      ))}
    </ul>
  )
}
