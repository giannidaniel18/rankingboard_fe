'use client'

import type { FriendRequestWithUser } from '@/lib/types'
import type { Dictionary } from '@/lib/i18n'

const AVATAR_PALETTE = ['bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500']

function avatarColor(name: string): string {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
}

interface Props {
  incoming: FriendRequestWithUser[]
  sent: FriendRequestWithUser[]
  isPending: boolean
  onAccept: (requestId: string) => void
  onDecline: (requestId: string) => void
  dict: Dictionary['social']
}

export function PendingRequests({ incoming, sent, isPending, onAccept, onDecline, dict }: Props) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 mb-3">
          {dict.incoming}
        </h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-600 font-mono">{dict.noIncoming}</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map(req => (
              <li
                key={req.id}
                className="flex items-center gap-3 px-4 py-3 rounded-sm border border-black/[0.08] dark:border-neutral-800 bg-white dark:bg-neutral-900"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarColor(req.user.name)}`}
                >
                  {req.user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{req.user.name}</p>
                  <p className="text-xs font-mono text-amber-500/80 dark:text-amber-500/70 truncate">{req.user.alias}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAccept(req.id)}
                    disabled={isPending}
                    className="px-3 py-1 rounded-sm text-xs font-semibold border border-emerald-600/50 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  >
                    {dict.accept}
                  </button>
                  <button
                    onClick={() => onDecline(req.id)}
                    disabled={isPending}
                    className="px-3 py-1 rounded-sm text-xs font-semibold border border-black/[0.10] dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    {dict.decline}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 mb-3">
          {dict.sent}
        </h2>
        {sent.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-600 font-mono">{dict.noSent}</p>
        ) : (
          <ul className="space-y-2">
            {sent.map(req => (
              <li
                key={req.id}
                className="flex items-center gap-3 px-4 py-3 rounded-sm border border-black/[0.06] dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/50"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white/70 shrink-0 opacity-60 ${avatarColor(req.user.name)}`}
                >
                  {req.user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{req.user.name}</p>
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-600 truncate">{req.user.alias}</p>
                </div>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-600 border border-amber-600/30 dark:border-amber-900/60 px-2 py-0.5 rounded-sm">
                  Pending
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
