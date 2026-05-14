'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/domain/useAuth'
import { useMatches } from '@/hooks/domain/useMatches'
import { useAnalytics } from '@/hooks/domain/useAnalytics'
import { store } from '@/lib/store'

interface Props {
  profileId: string
  sessionUserId?: string
}

const AVATAR_COLORS = [
  'bg-primary text-secondary',
  'bg-sky-500 text-white',
  'bg-emerald-500 text-white',
  'bg-violet-500 text-white',
  'bg-rose-500 text-white',
]

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function StatCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-5 gap-1.5">
      <span className="font-mono font-bold text-2xl text-neutral-900 dark:text-neutral-100 tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </div>
  )
}

export default function ProfilePageClient({ profileId, sessionUserId }: Props) {
  const { currentUser } = useAuth()
  const { loadGroupMatches } = useMatches()
  const { getHeadToHead } = useAnalytics()

  const profileUser = store.getUserById(profileId)
  const resolvedCurrentId = currentUser?.id ?? sessionUserId
  const isOwnProfile = resolvedCurrentId === profileId

  useEffect(() => {
    if (!profileUser || isOwnProfile) return
    const groups = store.getUserGroups(profileId)
    groups.forEach(g => {
      void loadGroupMatches(g.id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, isOwnProfile])

  if (!profileUser) {
    return (
      <div className="flex min-h-screen bg-canvas">
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center gap-4 text-center">
            <span className="font-mono text-4xl text-neutral-300 dark:text-neutral-700">◇</span>
            <div className="space-y-1.5">
              <p className="font-heading text-sm font-bold tracking-[0.15em] uppercase text-neutral-900 dark:text-neutral-100">
                User Not Found
              </p>
              <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                No player with ID{' '}
                <span className="text-primary dark:text-primary">{profileId}</span> exists.
              </p>
            </div>
            <Link
              href="/social"
              className="mt-2 px-4 py-2 rounded-sm border border-black/[0.10] dark:border-white/[0.10] text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600 dark:text-neutral-300 hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-colors"
            >
              ← Back to Social
            </Link>
          </main>
        </div>
      </div>
    )
  }

  const { stats } = profileUser.profile
  const winPct = Math.round(stats.winRate * 100)

  const h2h =
    !isOwnProfile && currentUser
      ? getHeadToHead(profileId, currentUser.id)
      : null

  const barA = h2h && h2h.totalMatches > 0 ? Math.round((h2h.winsA / h2h.totalMatches) * 100) : 0
  const barB = h2h && h2h.totalMatches > 0 ? Math.round((h2h.winsB / h2h.totalMatches) * 100) : 0

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-xl w-full space-y-6">

            {/* Page header */}
            <div className="flex items-center gap-3">
              <Link
                href="/social"
                aria-label="Back to Social"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-base leading-none"
              >
                ←
              </Link>
              <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
                {isOwnProfile ? 'My Profile' : 'Player Profile'}
              </h1>
            </div>

            {/* Own-profile banner */}
            {isOwnProfile && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-sm border border-primary/20 bg-primary/[0.05]">
                <span className="font-mono text-[10px] text-primary dark:text-primary flex-1">
                  You are viewing your own profile.
                </span>
                <Link
                  href="/profile"
                  className="shrink-0 px-3 py-1 rounded-sm border border-primary/30 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary dark:text-primary hover:bg-primary/10 transition-colors"
                >
                  Edit
                </Link>
              </div>
            )}

            {/* Identity card */}
            <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
              <div className="h-px bg-primary/30" />

              <div className="px-6 py-5">
                <div className="flex items-start gap-5">
                  <div
                    className={`shrink-0 w-14 h-14 rounded-sm flex items-center justify-center select-none ${avatarColor(profileUser.name)}`}
                  >
                    <span className="font-heading font-bold text-2xl">
                      {profileUser.name[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h2 className="font-heading font-bold text-lg tracking-[0.06em] uppercase text-neutral-900 dark:text-neutral-100 truncate">
                      {profileUser.name}
                    </h2>
                    <p className="font-mono text-[11px] text-primary/80 dark:text-primary/70">
                      {profileUser.alias}
                    </p>
                    {profileUser.bio && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                        {profileUser.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Career Stats */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.05]">
                <div className="px-5 py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    Career Stats
                  </span>
                </div>

                <div className="grid grid-cols-4 divide-x divide-black/[0.06] dark:divide-white/[0.05]">
                  <StatCell value={stats.totalMatches} label="Played" />
                  <StatCell value={stats.wins} label="Wins" />
                  <StatCell value={`${winPct}%`} label="Win %" />
                  <StatCell value={stats.rankingPoints} label="Pts" />
                </div>

                {stats.bestStreak > 0 && (
                  <div className="px-5 pb-3 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                      Best streak:{' '}
                      <span className="text-primary font-semibold tabular-nums">
                        🔥 {stats.bestStreak}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Head-to-Head (public profiles only) */}
            {!isOwnProfile && currentUser && h2h && (
              <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
                <div className="px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    Head to Head
                  </span>
                </div>

                <div className="px-5 py-5 space-y-4">
                  {/* Avatars */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor(profileUser.name)}`}
                      >
                        {profileUser.name[0].toUpperCase()}
                      </div>
                      <p className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate w-full text-center leading-tight">
                        {profileUser.name}
                      </p>
                    </div>

                    <span className="shrink-0 font-heading text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 dark:text-neutral-500">
                      vs
                    </span>

                    <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor(currentUser.name)}`}
                      >
                        {currentUser.name[0].toUpperCase()}
                      </div>
                      <p className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate w-full text-center leading-tight">
                        {currentUser.name}{' '}
                        <span className="font-mono text-[9px] text-primary dark:text-primary">
                          (You)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Win counts */}
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-xl font-bold text-primary dark:text-primary tabular-nums leading-none">
                      {h2h.winsA}
                    </span>
                    {h2h.ties > 0 && (
                      <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                        {h2h.ties}T
                      </span>
                    )}
                    <span className="font-mono text-xl font-bold text-sky-500 dark:text-sky-400 tabular-nums leading-none">
                      {h2h.winsB}
                    </span>
                  </div>

                  {/* Win bar */}
                  <div className="relative h-1 w-full rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    {h2h.totalMatches > 0 ? (
                      <>
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-primary"
                          style={{ width: `${barA}%` }}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-sky-500"
                          style={{ width: `${barB}%` }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-neutral-300 dark:bg-neutral-700" />
                    )}
                  </div>

                  {/* Win rate labels */}
                  <div className="flex justify-between -mt-2">
                    <span className="font-mono text-[10px] text-primary/80 dark:text-primary/70 tabular-nums">
                      {Math.round(h2h.winRateA * 100)}%
                    </span>
                    <span className="font-mono text-[10px] text-sky-500/80 dark:text-sky-400/70 tabular-nums">
                      {Math.round(h2h.winRateB * 100)}%
                    </span>
                  </div>
                </div>

                {/* Stat grid */}
                <div className="border-t border-black/[0.06] dark:border-white/[0.05] grid grid-cols-3 divide-x divide-black/[0.06] dark:divide-white/[0.05]">
                  {[
                    {
                      label: 'Matches',
                      value: h2h.totalMatches > 0 ? String(h2h.totalMatches) : '—',
                    },
                    {
                      label: 'Win Rate',
                      value:
                        h2h.totalMatches > 0
                          ? `${Math.round(h2h.winRateA * 100)}% / ${Math.round(h2h.winRateB * 100)}%`
                          : '—',
                    },
                    {
                      label: 'Avg Rank',
                      value:
                        h2h.totalMatches > 0
                          ? `${h2h.avgPlacementA.toFixed(1)} / ${h2h.avgPlacementB.toFixed(1)}`
                          : '—',
                    },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="px-3 py-3.5 flex flex-col items-center gap-1"
                    >
                      <span className="font-heading text-[9px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 text-center">
                        {stat.label}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-neutral-900 dark:text-neutral-100 tabular-nums text-center">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {h2h.totalMatches === 0 && (
                  <div className="border-t border-black/[0.06] dark:border-white/[0.05] px-5 py-4 flex flex-col items-center gap-1.5">
                    <span className="font-mono text-lg text-neutral-300 dark:text-neutral-700">◇</span>
                    <p className="font-heading text-[9px] font-bold tracking-[0.18em] uppercase text-neutral-400 dark:text-neutral-500">
                      No shared matches
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
