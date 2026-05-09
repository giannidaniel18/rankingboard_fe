'use client'

import { useState } from 'react'
import SideNavBar from './SideNavBar'
import MobileBottomNav from './MobileBottomNav'
import MatchModal from './MatchModal'

export default function NavigationShell() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <SideNavBar onOpenModal={() => setIsModalOpen(true)} />
      <MobileBottomNav onOpenModal={() => setIsModalOpen(true)} />
      <MatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
