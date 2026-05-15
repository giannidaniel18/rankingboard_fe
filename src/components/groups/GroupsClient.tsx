'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useGroups } from '@/hooks/domain/useGroups'
import { useAuth } from '@/hooks/domain/useAuth'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import type { Group } from '@/types'

interface Props {
  dict: Dictionary
}

export default function GroupsClient({ dict }: Props) {
  const t = dict.groups
  const { currentUser } = useAuth()
  const { groups, isLoading, loadUserGroups, createNewGroup } = useGroups()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!currentUser) return
    loadUserGroups(currentUser.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  function handleCreate() {
    if (!name.trim() || isPending || !currentUser) return
    startTransition(async () => {
      await createNewGroup(name.trim(), currentUser.id)
      setName('')
      setOpen(false)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-tx-primary">
            {t.title}
          </h1>
          <p className="text-sm text-tx-caption mt-1">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-black text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm transition-all"
        >
          + {t.createGroup}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : groups.length === 0 ? (
        <EmptyState t={t} onCreateClick={() => setOpen(true)} />
      ) : (
        <GroupGrid groups={groups} t={t} />
      )}

      {/* Create modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-sm mx-4 bg-surface border border-black/[0.10] dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.08] dark:border-white/[0.07]">
              <h2 className="font-heading text-[11px] font-bold tracking-[0.2em] uppercase text-tx-primary">
                {t.createGroup}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-tx-caption hover:text-tx-primary text-xl leading-none transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-5">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.namePlaceholder}
                maxLength={48}
                className="w-full px-3 py-2.5 rounded-lg border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-tx-primary text-sm placeholder:text-tx-caption focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 border-t border-black/[0.08] dark:border-white/[0.07]">
              <button
                onClick={() => { setName(''); setOpen(false) }}
                className="text-[11px] font-semibold uppercase tracking-widest text-tx-caption hover:text-tx-secondary transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || isPending}
                className="px-4 py-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-black text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isPending ? t.creating : t.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-sm border border-black/[0.08] dark:border-white/[0.06] bg-black/[0.04] dark:bg-white/[0.04]"
        />
      ))}
    </div>
  )
}

function EmptyState({ t, onCreateClick }: { t: Dictionary['groups']; onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-14 h-14 rounded-sm border border-brand/20 bg-brand/[0.05] flex items-center justify-center">
        <span className="font-mono text-brand text-xl font-bold">#</span>
      </div>
      <div className="space-y-1">
        <p className="font-heading text-sm font-bold tracking-[0.1em] uppercase text-tx-secondary">
          {t.emptyTitle}
        </p>
        <p className="text-sm text-tx-caption max-w-xs">
          {t.emptySubtitle}
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="mt-2 px-5 py-2.5 bg-brand hover:bg-brand-hover active:bg-brand-active text-black text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm transition-all"
      >
        {t.createFirst}
      </button>
    </div>
  )
}

function GroupGrid({ groups, t }: { groups: Group[]; t: Dictionary['groups'] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map(group => (
        <GroupCard key={group.id} group={group} t={t} />
      ))}
    </div>
  )
}

function GroupCard({ group, t }: { group: Group; t: Dictionary['groups'] }) {
  const activeMemberCount = group.members.filter(m => m.isActive).length
  const initial = group.name[0]?.toUpperCase() ?? '#'

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group block bg-surface border border-black/[0.08] dark:border-white/[0.06] rounded-sm hover:border-brand/40 transition-all duration-200 hover:shadow-lg hover:shadow-brand/5"
    >
      {/* Brand top accent on hover */}
      <div className="h-0.5 bg-brand/0 group-hover:bg-brand/50 transition-all duration-300 rounded-t-sm" />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-1">
          {group.avatarUrl ? (
            <img
              src={group.avatarUrl}
              alt={group.name}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-black/[0.08] dark:border-white/[0.08]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-sm text-brand shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-sm font-bold tracking-[0.05em] text-tx-primary truncate">
              {group.name}
            </h2>
            <p className="font-mono text-[11px] text-brand-text dark:text-brand truncate">
              {group.groupTag}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.05]">
          <span className="font-mono text-[11px] text-tx-caption tabular-nums">
            {activeMemberCount} {t.members}
          </span>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-text dark:text-brand group-hover:translate-x-0.5 transition-transform duration-150">
            {t.viewGroup} →
          </span>
        </div>
      </div>
    </Link>
  )
}
