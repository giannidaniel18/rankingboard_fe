'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/lib/actions/users'
import { useI18n } from '@/components/providers/I18nProvider'
import type { User, AchievementId } from '@/lib/types'

interface Props {
  user: User
}

const ACHIEVEMENT_META: Record<AchievementId, { emoji: string; label: string }> = {
  first_win:    { emoji: '🥇', label: 'First Win' },
  win_streak_3: { emoji: '🔥', label: 'Hot Streak' },
  win_streak_5: { emoji: '⚡', label: 'On Fire' },
  veteran_10:   { emoji: '🎖', label: 'Veteran' },
}

function StatCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-5 gap-1.5">
      <span className="font-mono font-bold text-2xl text-neutral-900 dark:text-neutral-100 tabular-nums leading-none">
        {value}
      </span>
      {/* Stat label — caption level (8:1 AAA) */}
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </div>
  )
}

export default function ProfileCard({ user }: Props) {
  const router = useRouter()
  const { dict } = useI18n()
  const p = dict.profile
  const [isPending, startTransition] = useTransition()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio ?? '')

  const { stats, achievements } = user.profile
  const winPct = Math.round(stats.winRate * 100)

  function handleCancel() {
    setName(user.name)
    setBio(user.bio ?? '')
    setEditing(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateUserProfile({ id: user.id, name, bio })
      router.refresh()
      setEditing(false)
    })
  }

  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      {/* Edit mode top accent — fades in on edit */}
      <div
        className={`h-0.5 w-full transition-colors duration-200 ${
          editing ? 'bg-amber-500' : 'bg-transparent'
        }`}
      />

      {/* ── Identity section ── */}
      <div className="px-6 py-5">
        <div className="flex items-start gap-5">
          {/* Player emblem */}
          <div className="shrink-0 w-14 h-14 rounded-sm bg-amber-500 flex items-center justify-center select-none">
            <span className="font-heading font-bold text-2xl text-black">
              {(editing ? name : user.name)[0]?.toUpperCase() ?? '?'}
            </span>
          </div>

          {/* Identity info + actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Name */}
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={p.namePlaceholder}
                    autoFocus
                    className="w-full font-heading font-bold text-lg tracking-wide bg-black/[0.04] dark:bg-black/20 text-neutral-900 dark:text-neutral-100 rounded-sm border border-black/[0.10] dark:border-white/[0.10] px-2.5 py-1 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                ) : (
                  <h2 className="font-heading font-bold text-lg tracking-[0.06em] uppercase text-neutral-900 dark:text-neutral-100 truncate">
                    {user.name}
                  </h2>
                )}

                {/* Email — caption level (always readable) */}
                <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </p>

                {/* Bio */}
                {editing ? (
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder={p.bioPlaceholder}
                    rows={2}
                    className="w-full text-sm bg-black/[0.04] dark:bg-black/20 text-neutral-900 dark:text-neutral-200 rounded-sm border border-black/[0.10] dark:border-white/[0.10] px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 transition-colors resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                ) : (
                  /* Bio — secondary level (12:1 AAA) */
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                    {user.bio || p.bioEmpty}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="shrink-0 flex items-center gap-2 pt-0.5">
                {editing ? (
                  <>
                    {/* Cancel — caption level, secondary action */}
                    <button
                      onClick={handleCancel}
                      disabled={isPending}
                      className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors disabled:opacity-40"
                    >
                      {p.cancelBtn}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isPending || !name.trim()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm disabled:opacity-40 transition-colors"
                    >
                      {isPending ? p.saving : p.saveBtn}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600 dark:text-neutral-400 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {p.editBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Career Stats ── */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.05]">
        {/* Section label — caption level */}
        <div className="px-5 py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {p.statsTitle}
          </span>
        </div>

        <div className="grid grid-cols-4 divide-x divide-black/[0.06] dark:divide-white/[0.05]">
          <StatCell value={stats.totalMatches} label={p.played} />
          <StatCell value={stats.wins}          label={p.wins} />
          <StatCell value={`${winPct}%`}        label={p.winPct} />
          <StatCell value={stats.rankingPoints} label={p.pts} />
        </div>

        {stats.bestStreak > 0 && (
          <div className="px-5 pb-3 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
            {/* Caption level */}
            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {p.bestStreak}:{' '}
              <span className="text-amber-500 font-semibold tabular-nums">
                🔥 {stats.bestStreak}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Achievements ── */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.05]">
        {/* Section label — caption level */}
        <div className="px-5 py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {p.achievementsTitle}
          </span>
        </div>

        <div className="px-5 py-4">
          {achievements.length === 0 ? (
            /* Empty state — caption level */
            <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {p.noAchievements}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {achievements.map(ach => {
                const meta = ACHIEVEMENT_META[ach.id]
                return (
                  <div
                    key={ach.id}
                    title={ach.description}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-amber-500/20 bg-amber-500/[0.07]"
                  >
                    <span className="text-sm leading-none">{meta?.emoji ?? '⭐'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                      {meta?.label ?? ach.name}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
