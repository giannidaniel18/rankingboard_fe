'use client'

import { useState } from 'react'
import SideNavBar from './SideNavBar'
import MobileBottomNav from './MobileBottomNav'
import MatchModal from './MatchModal'

interface Props {
  userId: string | null
  userName: string | null
}

export default function NavigationShell({ userId, userName }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <SideNavBar onOpenModal={() => setIsModalOpen(true)} />
      <MobileBottomNav onOpenModal={() => setIsModalOpen(true)} />
      <MatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        userName={userName}
      />
    </>
  )
}
