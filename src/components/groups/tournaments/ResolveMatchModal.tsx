'use client'

import { useState } from 'react'
import { X, Trophy, Loader2, Check } from 'lucide-react'
import type { TournamentMatch, TournamentTeam } from '@/types'

interface Props {
  match: TournamentMatch
  teams: TournamentTeam[]
  onResolve: (winnerTeamId: string) => void
  onClose: () => void
}

const AVATAR_PALETTE = [
  'bg-amber-500 text-black',
  'bg-sky-500 text-white',
  'bg-emerald-500 text-white',
  'bg-rose-500 text-white',
  'bg-violet-500 text-white',
  'bg-orange-500 text-black',
  'bg-cyan-500 text-black',
  'bg-pink-500 text-white',
]

export default function ResolveMatchModal({ match, teams, onResolve, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const teamA = teams.find(t => t.id === match.teamAId)
  const teamB = teams.find(t => t.id === match.teamBId)
  const idxA  = teams.findIndex(t => t.id === match.teamAId)
  const idxB  = teams.findIndex(t => t.id === match.teamBId)

  async function handleConfirm() {
    if (!selected || isLoading) return
    setIsLoading(true)
    try {
      onResolve(selected)
    } finally {
      setIsLoading(false)
    }
  }

  function TeamButton({ team, idx }: { team: TournamentTeam; idx: number }) {
    const isSelected = selected === team.id
    const avatarCls  = AVATAR_PALETTE[idx % AVATAR_PALETTE.length] ?? 'bg-neutral-400 text-white'

    return (
      <button
        type="button"
        onClick={() => setSelected(team.id)}
        className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all w-full min-h-[110px] ${
          isSelected
            ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
            : 'border-black/[0.09] dark:border-white/[0.09] hover:border-black/20 dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02]'
        }`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${
          isSelected ? 'bg-amber-500 text-black' : avatarCls
        }`}>
          {team.name[0]?.toUpperCase()}
        </div>
        <div className="text-center">
          <p className={`text-sm font-bold tracking-[0.04em] transition-colors ${
            isSelected ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-800 dark:text-neutral-200'
          }`}>
            {team.name}
          </p>
          {team.playerIds.length > 1 && (
            <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              {team.playerIds.length} jugadores
            </p>
          )}
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-black" />
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-surface border border-black/[0.10] dark:border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-black/[0.07] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-heading text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100 leading-none">
                Cargar Resultado
              </h2>
              <p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Partido {match.matchNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 text-center">
            Seleccioná el ganador del partido
          </p>

          <div className="grid grid-cols-2 gap-3">
            {teamA && <TeamButton team={teamA} idx={idxA} />}
            {teamB && <TeamButton team={teamB} idx={idxB} />}
          </div>

          {/* VS divider label */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
            <span className="font-mono text-[9px] tracking-[0.2em] text-neutral-300 dark:text-neutral-600">VS</span>
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
          </div>

          {/* Confirm */}
          <button
            type="button"
            onClick={() => { void handleConfirm() }}
            disabled={!selected || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black text-[11px] font-bold tracking-[0.15em] uppercase transition-all"
          >
            {isLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trophy className="w-3.5 h-3.5" />
            }
            {isLoading ? 'Guardando…' : selected ? 'Confirmar Ganador' : 'Elegí un equipo'}
          </button>
        </div>
      </div>
    </div>
  )
}
