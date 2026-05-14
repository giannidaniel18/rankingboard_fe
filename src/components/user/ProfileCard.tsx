'use client'

import { useState, useTransition, useEffect } from 'react'
import { useAuth } from '@/hooks/domain/useAuth'
import { useI18n } from '@/components/providers/I18nProvider'
import type { AchievementId } from '@/types'

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
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden animate-pulse">
      <div className="px-6 py-5">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-sm bg-black/[0.08] dark:bg-white/[0.08]" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-32 rounded-sm bg-black/[0.06] dark:bg-white/[0.06]" />
            <div className="h-3.5 w-40 rounded-sm bg-black/[0.04] dark:bg-white/[0.04]" />
          </div>
        </div>
      </div>
      <div className="border-t border-black/[0.06] dark:border-white/[0.05] h-24" />
    </div>
  )
}

export default function ProfileCard() {
  const { currentUser, updateProfile } = useAuth()
  const { dict } = useI18n()
  const p = dict.profile
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setBio(currentUser.bio ?? '')
    }
  }, [currentUser?.id])

  if (!currentUser) return <ProfileSkeleton />

  const { stats, achievements } = currentUser.profile
  const winPct = Math.round(stats.winRate * 100)

  function handleCancel() {
    setName(currentUser!.name)
    setBio(currentUser!.bio ?? '')
    setEditing(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateProfile(name, bio)
      setEditing(false)
    })
  }

  return (
    <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      <div
        className={`h-0.5 w-full transition-colors duration-200 ${
          editing ? 'bg-primary' : 'bg-transparent'
        }`}
      />

      {/* Identity */}
      <div className="px-6 py-5">
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-14 h-14 rounded-sm bg-primary flex items-center justify-center select-none">
            <span className="font-heading font-bold text-2xl text-secondary">
              {(editing ? name : currentUser.name)[0]?.toUpperCase() ?? '?'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={p.namePlaceholder}
                    autoFocus
                    className="w-full font-heading font-bold text-lg tracking-wide bg-black/[0.04] dark:bg-black/20 text-neutral-900 dark:text-neutral-100 rounded-sm border border-black/[0.10] dark:border-white/[0.10] px-2.5 py-1 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                ) : (
                  <h2 className="font-heading font-bold text-lg tracking-[0.06em] uppercase text-neutral-900 dark:text-neutral-100 truncate">
                    {currentUser.name}
                  </h2>
                )}

                <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  {currentUser.email}
                </p>

                {editing ? (
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder={p.bioPlaceholder}
                    rows={2}
                    className="w-full text-sm bg-black/[0.04] dark:bg-black/20 text-neutral-900 dark:text-neutral-200 rounded-sm border border-black/[0.10] dark:border-white/[0.10] px-2.5 py-1.5 focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                ) : (
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                    {currentUser.bio || p.bioEmpty}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2 pt-0.5">
                {editing ? (
                  <>
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
                      className="px-3 py-1.5 bg-primary hover:bg-custom-light-orange text-secondary text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm disabled:opacity-40 transition-colors"
                    >
                      {isPending ? p.saving : p.saveBtn}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600 dark:text-neutral-400 hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {p.editBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Stats */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.05]">
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
            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {p.bestStreak}:{' '}
              <span className="text-primary font-semibold tabular-nums">
                🔥 {stats.bestStreak}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.05]">
        <div className="px-5 py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {p.achievementsTitle}
          </span>
        </div>

        <div className="px-5 py-4">
          {achievements.length === 0 ? (
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
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-primary/20 bg-primary/[0.07]"
                  >
                    <span className="text-sm leading-none">{meta?.emoji ?? '⭐'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-primary">
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
