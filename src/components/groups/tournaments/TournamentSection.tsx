'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Plus, GitBranch, RefreshCw, ArrowRight } from 'lucide-react'
import type { Tournament } from '@/types'
import tournamentService from '@/services/tournamentService'

interface Props {
  groupId: string
  isAdmin: boolean
  refreshKey: number
  onCreateClick: () => void
}

const STATUS_CONFIG: Record<Tournament['status'], { label: string; cls: string }> = {
  draft:       { label: 'Borrador',    cls: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/25' },
  in_progress: { label: 'En curso',   cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25'       },
  completed:   { label: 'Completado', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
}

const FORMAT_ICON: Record<Tournament['format'], React.ElementType> = {
  bracket:     GitBranch,
  round_robin: RefreshCw,
}

const FORMAT_LABEL: Record<Tournament['format'], string> = {
  bracket:     'Bracket',
  round_robin: 'Round Robin',
}

function TournamentCard({ t, groupId }: { t: Tournament; groupId: string }) {
  const status = STATUS_CONFIG[t.status]
  const FormatIcon = FORMAT_ICON[t.format]

  const totalMatches = t.rounds.reduce((acc, r) => acc + r.matches.length, 0)
  const doneMatches  = t.rounds.reduce(
    (acc, r) => acc + r.matches.filter(m => m.status === 'completed').length, 0
  )
  const pct = totalMatches > 0 ? (doneMatches / totalMatches) * 100 : 0

  return (
    <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/[0.14] dark:hover:border-white/[0.11] transition-colors space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Trophy className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
            {t.name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-[0.1em] uppercase ${status.cls}`}>
              {status.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
              <FormatIcon className="w-2.5 h-2.5" />
              {FORMAT_LABEL[t.format]}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
              {t.teams.length} equipos
            </span>
          </div>
        </div>
      </div>

      {totalMatches > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
            <span>Progreso</span>
            <span>{doneMatches}/{totalMatches} partidos</span>
          </div>
          <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <Link
        href={`/groups/${groupId}/tournaments/${t.id}`}
        className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-amber-500 hover:text-amber-400 transition-colors"
      >
        Ver torneo
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

export default function TournamentSection({ groupId, isAdmin, refreshKey, onCreateClick }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    tournamentService.getTournamentsByGroup(groupId)
      .then(data => { setTournaments(data); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [groupId, refreshKey])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
            Torneos
          </h3>
          {!isLoading && (
            <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
              ({tournaments.length})
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black text-[10px] font-bold tracking-[0.12em] uppercase transition-all"
          >
            <Plus className="w-3 h-3" />
            Crear Torneo
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1].map(i => (
            <div key={i} className="h-24 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]" />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400/60" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              No hay torneos aún
            </p>
            <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
              {isAdmin ? 'Crea el primer torneo del grupo.' : 'El admin puede crear torneos.'}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={onCreateClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold tracking-[0.12em] uppercase transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear Torneo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map(t => <TournamentCard key={t.id} t={t} groupId={groupId} />)}
        </div>
      )}
    </div>
  )
}
