'use client'

import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import GroupDetails from '@/components/groups/GroupDetails'
import GroupSettingsModal from '@/components/groups/GroupSettingsModal'
import MemberRankings from '@/components/groups/MemberRankings'
import MatchHistoryFeed from '@/components/groups/MatchHistoryFeed'
import { useGroups } from '@/hooks/domain/useGroups'
import type { GroupRole } from '@/types'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

interface Props {
  id: string
  userId?: string
  dict: Dictionary
}

export default function GroupDetailClient({ id, userId, dict }: Props) {
  const {
    currentGroup, memberUsers, isLoading, error, loadGroupById,
    updateGroupDetails, updateMemberRole, removeMember,
  } = useGroups()

  const [settingsOpen, setSettingsOpen] = useState(false)

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

  const isAdmin = !!userId && currentGroup.members.some(
    m => m.userId === userId && m.role === 'admin'
  )

  const handleUpdateDetails = async (name: string, avatarUrl?: string) => {
    await updateGroupDetails(currentGroup.id, name, avatarUrl)
  }

  const handleUpdateRole = async (memberId: string, role: GroupRole) => {
    await updateMemberRole(currentGroup.id, memberId, role)
  }

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(currentGroup.id, memberId)
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentGroup.avatarUrl ? (
                <img
                  src={currentGroup.avatarUrl}
                  alt={currentGroup.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0 border border-black/[0.08] dark:border-white/[0.08]"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-base text-amber-500 dark:text-amber-400 shrink-0">
                  {currentGroup.name[0]?.toUpperCase() ?? '#'}
                </div>
              )}
              <div>
                <h1 className="font-heading text-lg font-bold tracking-[0.1em] uppercase text-neutral-900 dark:text-neutral-100">
                  {currentGroup.name}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                  {currentGroup.members.filter(m => m.isActive).length} {dict.group.members}
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-black/[0.15] dark:hover:border-white/[0.15] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all text-[10px] font-bold tracking-[0.12em] uppercase shrink-0"
                aria-label="Group settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
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

      {settingsOpen && userId && (
        <GroupSettingsModal
          group={currentGroup}
          memberUsers={memberUsers}
          currentUserId={userId}
          onClose={() => setSettingsOpen(false)}
          onUpdateDetails={handleUpdateDetails}
          onUpdateRole={handleUpdateRole}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 space-y-6 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded-sm bg-black/[0.06] dark:bg-white/[0.06]" />
              <div className="h-4 w-32 rounded-sm bg-black/[0.04] dark:bg-white/[0.04]" />
            </div>
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
