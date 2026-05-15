'use client'

import { useState } from 'react'
import { UserPlus, Users, Shield, Wrench } from 'lucide-react'
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

  const memberList: MemberRow[] = [
    ...group.members.filter(m => m.isActive).map(m => {
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
      <div className="bg-surface rounded border border-black/[0.08] dark:border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.08] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-tx-caption" />
            <h2 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-tx-primary">
              {t.membersTitle}
            </h2>
            <span className="font-mono text-[10px] text-tx-caption tabular-nums">
              {memberList.length}
            </span>
          </div>
          {canInvite && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand hover:bg-brand-hover active:bg-brand-active text-black text-[10px] font-bold tracking-[0.15em] uppercase transition-all"
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
              className="flex items-center gap-3 px-5 py-3 hover:bg-brand/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-[11px] text-tx-secondary shrink-0">
                {member.name[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-tx-primary truncate leading-tight">
                  {member.name}
                </p>
                <p className="font-mono text-[11px] text-brand-text dark:text-brand truncate leading-tight">
                  {member.alias}
                </p>
              </div>
              {member.role === 'admin' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-brand/10 text-brand-text dark:text-brand text-[9px] font-bold tracking-[0.1em] uppercase shrink-0">
                  <Shield className="w-2.5 h-2.5" />
                  {t.admin}
                </span>
              )}
              {member.role === 'maintainer' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-live/10 text-live text-[9px] font-bold tracking-[0.1em] uppercase shrink-0">
                  <Wrench className="w-2.5 h-2.5" />
                  Maintainer
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
