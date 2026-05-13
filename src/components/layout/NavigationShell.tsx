'use client'

import { useState, useEffect } from 'react'
import SideNavBar from './SideNavBar'
import MobileBottomNav from './MobileBottomNav'
import MatchModal from './MatchModal'
import { useAuth } from '@/hooks/domain/useAuth'
import { useGroups } from '@/hooks/domain/useGroups'
import type { User } from '@/types'

interface Props {
  sessionUser: User | null
}

export default function NavigationShell({ sessionUser }: Props) {
  const { hydrateAuth } = useAuth()
  const { groups, loadUserGroups } = useGroups()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!sessionUser) return
    hydrateAuth(sessionUser)
    void loadUserGroups(sessionUser.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id])

  // True while groups haven't loaded yet (avoids flash-of-hidden button).
  // Once loaded, show button only if the user is admin or maintainer in ≥1 group.
  const canRecordMatch =
    !sessionUser ||
    groups.length === 0 ||
    groups.some(g =>
      g.members.some(
        m => m.userId === sessionUser.id && m.isActive && (m.role === 'admin' || m.role === 'maintainer')
      )
    )

  return (
    <>
      <SideNavBar onOpenModal={() => setIsModalOpen(true)} canRecordMatch={canRecordMatch} />
      <MobileBottomNav onOpenModal={() => setIsModalOpen(true)} canRecordMatch={canRecordMatch} />
      <MatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={sessionUser?.id ?? null}
        userName={sessionUser?.name ?? null}
      />
    </>
  )
}
