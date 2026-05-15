'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Settings, Save, Trash2, Loader2, ChevronDown, UserX } from 'lucide-react'
import type { Group, GroupRole, User } from '@/types'

type Tab = 'general' | 'members'

interface MemberRow {
  userId: string
  name: string
  alias: string
  role: GroupRole
  isActive: boolean
  isCurrentUser: boolean
}

interface Props {
  group: Group
  memberUsers: User[]
  currentUserId: string
  onClose: () => void
  onUpdateDetails: (name: string, avatarUrl?: string) => Promise<void>
  onUpdateRole: (userId: string, role: GroupRole) => Promise<void>
  onRemoveMember: (userId: string) => Promise<void>
}

const ROLES: { value: GroupRole; label: string; description: string }[] = [
  { value: 'admin',      label: 'Admin',      description: 'Full control' },
  { value: 'maintainer', label: 'Maintainer', description: 'Can record matches' },
  { value: 'member',     label: 'Member',     description: 'Read only' },
]

const ROLE_LABEL: Record<GroupRole, string> = {
  admin:      'Admin',
  maintainer: 'Maintainer',
  member:     'Member',
}

interface RoleDropdownProps {
  value: GroupRole
  onChange: (role: GroupRole) => void
  loading?: boolean
}

function RoleDropdown({ value, onChange, loading = false }: RoleDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (loading) {
    return (
      <div className="w-[112px] h-7 flex items-center justify-center">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 w-[112px] px-2.5 py-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] hover:border-brand/40 focus:outline-none focus:border-brand/50 transition-colors"
      >
        <span className="flex-1 text-left text-[10px] font-bold tracking-[0.07em] uppercase text-tx-secondary truncate">
          {ROLE_LABEL[value]}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-tx-caption shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] w-[148px] bg-elevated border border-black/[0.10] dark:border-white/[0.10] rounded-xl shadow-2xl shadow-black/40 z-[70] overflow-hidden py-1">
          {ROLES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => { onChange(r.value); setOpen(false) }}
              className={`w-full text-left px-3 py-2 transition-colors ${
                value === r.value
                  ? 'bg-brand/10 dark:bg-brand/10'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
              }`}
            >
              <p className={`text-[10px] font-bold tracking-[0.07em] uppercase leading-none ${
                value === r.value
                  ? 'text-brand-text dark:text-brand'
                  : 'text-tx-secondary'
              }`}>
                {r.label}
              </p>
              <p className="text-[9px] font-mono text-tx-caption mt-0.5">
                {r.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GroupSettingsModal({
  group,
  memberUsers,
  currentUserId,
  onClose,
  onUpdateDetails,
  onUpdateRole,
  onRemoveMember,
}: Props) {
  const [tab, setTab]              = useState<Tab>('general')
  const [name, setName]            = useState(group.name)
  const [avatarUrl, setAvatarUrl]  = useState(group.avatarUrl ?? '')
  const [isSaving, setSaving]      = useState(false)
  const [roleLoading, setRoleLoad] = useState<string | null>(null)
  const [kickLoading, setKickLoad] = useState<string | null>(null)

  const memberList: MemberRow[] = group.members
    .filter(m => m.isActive !== false)
    .map(m => {
      const user = memberUsers.find(u => u.id === m.userId)
      return {
        userId: m.userId,
        name: user?.name ?? 'Unknown',
        alias: user?.alias ?? `#${m.userId}`,
        role: m.role,
        isActive: m.isActive,
        isCurrentUser: m.userId === currentUserId,
      }
    })

  const activeCount = memberList.length

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onUpdateDetails(name.trim(), avatarUrl.trim() || undefined)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (userId: string, role: GroupRole) => {
    setRoleLoad(userId)
    try { await onUpdateRole(userId, role) } finally { setRoleLoad(null) }
  }

  const handleKick = async (userId: string) => {
    setKickLoad(userId)
    try { await onRemoveMember(userId) } finally { setKickLoad(null) }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'members', label: `Members (${activeCount})` },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-surface border border-black/[0.10] dark:border-white/[0.07] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden flex flex-col max-h-[88dvh]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-heading text-[11px] font-bold tracking-[0.2em] uppercase text-tx-primary leading-none">
                Group Settings
              </h2>
              <p className="font-mono text-[10px] text-tx-caption mt-0.5 truncate max-w-[180px]">
                {group.groupTag}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-tx-caption hover:text-tx-primary hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/[0.08] dark:border-white/[0.07] px-6 shrink-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative pb-3 mr-6 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors ${
                tab === t.key
                  ? 'text-brand-text dark:text-brand'
                  : 'text-tx-caption hover:text-tx-secondary'
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {tab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-tx-caption mb-1.5">
                  Group Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Group name"
                  className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.10] dark:border-white/[0.08] hover:border-brand/30 dark:hover:border-brand/20 focus:border-brand/60 dark:focus:border-brand/40 focus:ring-1 focus:ring-brand/15 rounded-xl px-4 py-2.5 text-sm text-tx-primary font-medium transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-tx-caption mb-1.5">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.10] dark:border-white/[0.08] hover:border-brand/30 dark:hover:border-brand/20 focus:border-brand/60 dark:focus:border-brand/40 focus:ring-1 focus:ring-brand/15 rounded-xl px-4 py-2.5 text-sm text-tx-primary font-medium transition-all outline-none placeholder:text-tx-caption"
                />
                <p className="mt-1.5 text-[10px] font-mono text-tx-caption">
                  Avatar upload coming soon.
                </p>
              </div>
            </div>
          )}

          {tab === 'members' && (
            <ul className="space-y-2">
              {memberList.filter(m => m.isActive !== false).map(member => (
                <li
                  key={member.userId}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-opacity ${
                    member.isActive
                      ? 'border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]'
                      : 'border-black/[0.04] dark:border-white/[0.04] opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    member.isActive
                      ? 'bg-black/[0.08] dark:bg-white/[0.08] text-tx-secondary'
                      : 'bg-black/[0.08] dark:bg-white/[0.08] text-tx-caption grayscale'
                  }`}>
                    {member.name[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-tx-primary truncate leading-tight">
                        {member.name}
                      </p>
                      {member.isCurrentUser && (
                        <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-brand/70">you</span>
                      )}
                      {!member.isActive && (
                        <span className="flex items-center gap-0.5 text-[9px] font-mono text-tx-caption">
                          <UserX className="w-2.5 h-2.5" />
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-brand-text dark:text-brand truncate leading-tight">
                      {member.alias}
                    </p>
                  </div>

                  {member.isCurrentUser || !member.isActive ? (
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-tx-caption shrink-0">
                      {member.isActive ? member.role : '—'}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RoleDropdown
                        value={member.role}
                        onChange={role => { void handleRoleChange(member.userId, role) }}
                        loading={roleLoading === member.userId}
                      />
                      <button
                        onClick={() => { void handleKick(member.userId) }}
                        disabled={kickLoading === member.userId}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-tx-caption hover:text-loss hover:bg-loss/10 disabled:opacity-40 transition-colors"
                        aria-label={`Remove ${member.name}`}
                      >
                        {kickLoading === member.userId
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-black/[0.08] dark:border-white/[0.07] flex justify-end">
          <button
            onClick={() => { void handleSave() }}
            disabled={isSaving || !name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active disabled:opacity-40 disabled:cursor-not-allowed text-black text-[11px] font-bold tracking-[0.15em] uppercase transition-all"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
