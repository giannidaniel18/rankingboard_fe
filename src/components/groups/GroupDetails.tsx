'use client'

import { useState } from 'react'
import { UserPlus, Users, Shield } from 'lucide-react'
import InviteMemberModal from '@/components/groups/InviteMemberModal'
import { useGroups } from '@/hooks/domain/useGroups'
import { useAuth } from '@/hooks/domain/useAuth'
import type { Group, GroupRole, User } from '@/types'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

type MemberRow = { userId: string; name: string; alias: string; role: GroupRole }

interface Props {
  group: Group
  memberUsers: User[]
  currentUserId?: string
  dict: Dictionary
}

export default function GroupDetails({ group, memberUsers, currentUserId, dict }: Props) {
  const t = dict.group
  const { addMember } = useGroups()
  const { currentUser } = useAuth()

  const [modalOpen, setModalOpen] = useState(false)

  // Derive from store state on every render — no local domain state.
  // Union: existing members (with their roles) + any user in memberUsers not yet
  // reflected in group.members (newly added, defaults to 'member').
  const memberList: MemberRow[] = [
    ...group.members.map(m => {
      const user =
        memberUsers.find(u => u.id === m.userId) ||
        (m.userId === currentUser?.id ? currentUser : null)
      return {
        userId: m.userId,
        name: user?.name || 'Unknown User',
        alias: user?.alias || `#${m.userId}`,
        role: m.role,
      }
    }),
    ...memberUsers
      .filter(u => !group.members.some(m => m.userId === u.id))
      .map(u => ({ userId: u.id, name: u.name, alias: u.alias, role: 'member' as GroupRole })),
  ]

  const isAdmin = !!currentUserId && memberList.some(m => m.userId === currentUserId && m.role === 'admin')
  const isMember = !!currentUserId && memberList.some(m => m.userId === currentUserId)
  const canInvite = isAdmin || isMember

  const handleMemberAdded = async (user: User): Promise<void> => {
    await addMember(group.id, user)
  }

  return (
    <>
      <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.08] dark:border-white/[0.07]">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            <h2 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
              {t.membersTitle}
            </h2>
            <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 tabular-nums">
              {memberList.length}
            </span>
          </div>
          {canInvite && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold tracking-[0.15em] uppercase transition-colors"
            >
              <UserPlus className="w-3 h-3" />
              {t.inviteFriends}
            </button>
          )}
        </div>

        <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {memberList.map(member => (
            <li
              key={member.userId}
              className="flex items-center gap-3 px-5 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
            >
              <div className="w-7 h-7 rounded-sm bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-[11px] text-neutral-600 dark:text-neutral-300 shrink-0">
                {member.name[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate leading-tight">
                  {member.name}
                </p>
                <p className="font-mono text-[11px] text-amber-500 dark:text-amber-400 truncate leading-tight">
                  {member.alias}
                </p>
              </div>
              {member.role === 'admin' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold tracking-[0.1em] uppercase shrink-0">
                  <Shield className="w-2.5 h-2.5" />
                  {t.admin}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {modalOpen && currentUserId && (
        <InviteMemberModal
          groupId={group.id}
          currentUserId={currentUserId}
          existingMemberIds={memberList.map(m => m.userId)}
          dict={dict}
          onClose={() => setModalOpen(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </>
  )
}
