'use client'

import { useEffect } from 'react'
import GroupDetails from '@/components/groups/GroupDetails'
import MemberRankings from '@/components/groups/MemberRankings'
import MatchHistoryFeed from '@/components/groups/MatchHistoryFeed'
import { useGroups } from '@/hooks/domain/useGroups'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

interface Props {
  id: string
  userId?: string
  dict: Dictionary
}

export default function GroupDetailClient({ id, userId, dict }: Props) {
  const { currentGroup, memberUsers, isLoading, error, loadGroupById } = useGroups()

  useEffect(() => {
    loadGroupById(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (isLoading) return <LoadingSkeleton />

  if (!currentGroup) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <span className="font-mono text-3xl text-neutral-300 dark:text-neutral-700">#</span>
        <p className="font-heading text-sm font-bold tracking-[0.1em] uppercase text-neutral-600 dark:text-neutral-400">
          {error === 'Group not found' ? 'Group not found' : (error ?? 'Group not found')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div>
            <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
              {currentGroup.name}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
              {currentGroup.members.length} {dict.group.members}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-60 shrink-0 space-y-0" />

            <div className="flex-1 min-w-0 space-y-6">
              <GroupDetails
                group={currentGroup}
                memberUsers={memberUsers}
                currentUserId={userId}
                dict={dict}
              />
              <MemberRankings groupId={currentGroup.id} />
              <MatchHistoryFeed groupId={currentGroup.id} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 space-y-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-sm bg-black/[0.06] dark:bg-white/[0.06]" />
            <div className="h-4 w-32 rounded-sm bg-black/[0.04] dark:bg-white/[0.04]" />
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-60 shrink-0" />
            <div className="flex-1 min-w-0 space-y-4">
              <div className="h-48 rounded-sm border border-black/[0.08] dark:border-white/[0.07] bg-black/[0.03] dark:bg-white/[0.03]" />
              <div className="h-64 rounded-sm border border-black/[0.08] dark:border-white/[0.07] bg-black/[0.03] dark:bg-white/[0.03]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
