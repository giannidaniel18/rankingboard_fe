'use client'

import { useState, useEffect } from 'react'
import SideNavBar from './SideNavBar'
import MobileBottomNav from './MobileBottomNav'
import MatchModal from './MatchModal'
import { useAuth } from '@/hooks/domain/useAuth'
import type { User } from '@/types'

interface Props {
  sessionUser: User | null
}

export default function NavigationShell({ sessionUser }: Props) {
  const { hydrateAuth } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (sessionUser) hydrateAuth(sessionUser)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id])

  return (
    <>
      <SideNavBar onOpenModal={() => setIsModalOpen(true)} />
      <MobileBottomNav onOpenModal={() => setIsModalOpen(true)} />
      <MatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={sessionUser?.id ?? null}
        userName={sessionUser?.name ?? null}
      />
    </>
  )
}
