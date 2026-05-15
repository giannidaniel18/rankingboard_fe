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
      <span className="font-mono font-bold text-2xl text-tx-primary tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-tx-caption">
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
          editing ? 'bg-brand' : 'bg-transparent'
        }`}
      />

      {/* Identity */}
      <div className="px-6 py-5">
        <div className="flex items-start gap-5">
          <div className="shrink-0 w-14 h-14 rounded-sm bg-brand flex items-center justify-center select-none">
            <span className="font-heading font-bold text-2xl text-black">
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
                    className="w-full font-heading font-bold text-lg tracking-wide bg-black/[0.04] dark:bg-black/20 text-tx-primary rounded-sm border border-black/[0.10] dark:border-white/[0.10] px-2.5 py-1 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all"
                  />
                ) : (
                  <h2 className="font-heading font-bold text-lg tracking-[0.06em] uppercase text-tx-primary truncate">
                    {currentUser.name}
                  </h2>
                )}

                <p className="font-mono text-[11px] text-tx-caption">
                  {currentUser.email}
                </p>

                {editing ? (
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder={p.bioPlaceholder}
                    rows={2}
                    className="w-full text-sm bg-black/[0.04] dark:bg-black/20 text-tx-primary rounded-sm border border-black/[0.10] dark:border-white/[0.10] px-2.5 py-1.5 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all resize-none placeholder:text-tx-caption"
                  />
                ) : (
                  <p className="text-sm text-tx-secondary italic leading-relaxed">
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
                      className="text-[10px] font-semibold uppercase tracking-widest text-tx-caption hover:text-tx-secondary transition-colors disabled:opacity-40"
                    >
                      {p.cancelBtn}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isPending || !name.trim()}
                      className="px-3 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-active text-black text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm disabled:opacity-40 transition-all"
                    >
                      {isPending ? p.saving : p.saveBtn}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] text-[10px] font-semibold uppercase tracking-[0.15em] text-tx-secondary hover:border-brand/40 hover:text-brand transition-colors"
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
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-tx-caption">
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
            <span className="font-mono text-[11px] text-tx-caption">
              {p.bestStreak}:{' '}
              <span className="text-brand font-semibold tabular-nums">
                🔥 {stats.bestStreak}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.05]">
        <div className="px-5 py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-tx-caption">
            {p.achievementsTitle}
          </span>
        </div>

        <div className="px-5 py-4">
          {achievements.length === 0 ? (
            <p className="font-mono text-[11px] text-tx-caption">
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
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-brand/20 bg-brand/[0.07]"
                  >
                    <span className="text-sm leading-none">{meta?.emoji ?? '⭐'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text dark:text-brand">
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
