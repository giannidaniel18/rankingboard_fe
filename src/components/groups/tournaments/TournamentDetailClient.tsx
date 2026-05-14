'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Trophy, ChevronLeft, CheckCircle2, Loader2,
  GitBranch, RefreshCw, Trash2,
} from 'lucide-react'
import type { Tournament, TournamentMatch, GroupRole, TournamentPrizePool } from '@/types'
import tournamentService from '@/services/tournamentService'
import useToastStore from '@/store/useToastStore'
import useGroupsStore from '@/store/useGroupsStore'
import BracketView from './BracketView'
import RoundRobinView from './RoundRobinView'
import ResolveMatchModal from './ResolveMatchModal'

// ─── Winner derivation (mirrors finalizeTournament in store) ──────────────────

interface WinnerSlot {
  teamId: string
  teamName: string
  playerNames: string[]
}

function deriveWinnerSlots(
  tournament: Tournament,
  memberUsers: { id: string; name: string; alias: string }[],
): [WinnerSlot | null, WinnerSlot | null, WinnerSlot[]] {
  const { format, rounds, teams } = tournament

  function teamToSlot(teamId: string | null | undefined): WinnerSlot | null {
    if (!teamId) return null
    const team = teams.find(t => t.id === teamId)
    if (!team) return null
    const playerNames = team.playerIds
      .map(id => memberUsers.find(u => u.id === id)?.name ?? memberUsers.find(u => u.id === id)?.alias ?? id)
      .filter(Boolean)
    return { teamId, teamName: team.name, playerNames }
  }

  if (format === 'bracket') {
    const sortedRounds = [...rounds].sort((a, b) => b.id - a.id)
    const finalMatch   = sortedRounds[0]?.matches.find(m => m.matchNumber === 1 && m.status === 'completed')
    if (!finalMatch?.winnerTeamId) return [null, null, []]

    const secondTeamId = finalMatch.teamAId === finalMatch.winnerTeamId
      ? finalMatch.teamBId
      : finalMatch.teamAId

    const thirds: WinnerSlot[] = []
    const semiFinalRound = sortedRounds[1]
    if (semiFinalRound) {
      for (const m of semiFinalRound.matches) {
        if (m.status === 'completed' && m.winnerTeamId) {
          const loserTeamId = m.teamAId === m.winnerTeamId ? m.teamBId : m.teamAId
          const slot = teamToSlot(loserTeamId)
          if (slot) thirds.push(slot)
        }
      }
    }

    return [teamToSlot(finalMatch.winnerTeamId), teamToSlot(secondTeamId), thirds]
  }

  // Round Robin
  const wins = new Map<string, number>()
  for (const team of teams) wins.set(team.id, 0)
  for (const round of rounds) {
    for (const m of round.matches) {
      if (m.status === 'completed' && m.winnerTeamId) {
        wins.set(m.winnerTeamId, (wins.get(m.winnerTeamId) ?? 0) + 1)
      }
    }
  }
  const sorted = [...teams].sort((a, b) => (wins.get(b.id) ?? 0) - (wins.get(a.id) ?? 0))
  const third = teamToSlot(sorted[2]?.id ?? null)
  return [teamToSlot(sorted[0]?.id ?? null), teamToSlot(sorted[1]?.id ?? null), third ? [third] : []]
}

// ─── Prize Summary Card ───────────────────────────────────────────────────────

function PrizeSummaryCard({
  tournament,
  memberUsers,
}: {
  tournament: Tournament
  memberUsers: { id: string; name: string; alias: string }[]
}) {
  const pool = tournament.prizePool as TournamentPrizePool
  const [first, second, thirds] = deriveWinnerSlots(tournament, memberUsers)
  const third = thirds[0] ?? null

  const fmt = (amount: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: pool.currency,
      maximumFractionDigits: 0,
    }).format(amount)

  const rows: Array<{ emoji: string; slot: WinnerSlot | null; amount: number; colorCls: string; amountCls: string }> = [
    {
      emoji: '🥇',
      slot: first,
      amount: pool.distribution.first,
      colorCls: 'text-primary',
      amountCls: 'text-emerald-300',
    },
    {
      emoji: '🥈',
      slot: second,
      amount: pool.distribution.second,
      colorCls: 'text-neutral-300',
      amountCls: 'text-emerald-400/80',
    },
    {
      emoji: '🥉',
      slot: third,
      amount: pool.distribution.third,
      colorCls: 'text-amber-700 dark:text-primary',
      amountCls: 'text-emerald-400/60',
    },
  ].filter(r => r.amount > 0 || r.slot !== null)

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/15">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">💰</span>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-500/70 leading-none mb-0.5">
              Premios Distribuidos
            </p>
            <p className="font-mono font-bold text-lg text-emerald-400 tabular-nums leading-none">
              {fmt(pool.total)}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          {pool.currency}
        </span>
      </div>

      {/* Winner rows */}
      <div className="divide-y divide-emerald-500/10">
        {rows.map(({ emoji, slot, amount, colorCls, amountCls }) => (
          <div
            key={emoji}
            className="flex items-center gap-4 px-5 py-3.5"
          >
            <span className="text-2xl shrink-0 leading-none">{emoji}</span>
            <div className="flex-1 min-w-0">
              {slot ? (
                <>
                  <p className={`text-sm font-bold truncate ${colorCls}`}>
                    {slot.teamName}
                  </p>
                  {slot.playerNames.length > 0 && slot.playerNames.join(', ') !== slot.teamName && (
                    <p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {slot.playerNames.join(', ')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-600 italic">
                  —
                </p>
              )}
            </div>
            <span className={`font-mono font-bold text-base tabular-nums shrink-0 ${amountCls}`}>
              {fmt(amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  tournamentId: string
  initialTournament: Tournament | null
  groupId: string
  userRole: GroupRole | null
}

const STATUS_CONFIG: Record<Tournament['status'], { label: string; cls: string }> = {
  draft:       { label: 'Borrador',    cls: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/25' },
  in_progress: { label: 'En curso',   cls: 'bg-primary/15 text-primary border-primary/25'       },
  completed:   { label: 'Completado', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
}

export default function TournamentDetailClient({
  tournamentId,
  initialTournament,
  groupId,
  userRole,
}: Props) {
  const router      = useRouter()
  const memberUsers = useGroupsStore(s => s.memberUsers)

  const [tournament, setTournament]     = useState<Tournament | null>(initialTournament)
  const [isLoading, setIsLoading]       = useState(initialTournament === null)
  const [resolveMatch, setResolveMatch] = useState<TournamentMatch | null>(null)
  const [isFinishing, setIsFinishing]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting]     = useState(false)

  useEffect(() => {
    if (initialTournament !== null) return
    setIsLoading(true)
    tournamentService.getTournamentById(tournamentId)
      .then(data => { setTournament(data ?? null); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId])

  async function refreshTournament() {
    const updated = await tournamentService.getTournamentById(tournamentId)
    if (updated) setTournament(updated)
  }

  async function handleResolve(winnerTeamId: string) {
    if (!resolveMatch || !tournament) return
    await tournamentService.resolveTournamentMatch(tournament.id, resolveMatch.id, winnerTeamId)
    setResolveMatch(null)
    await refreshTournament()
  }

  async function handleResolveBye(match: TournamentMatch) {
    if (!tournament) return
    const winnerTeamId = match.teamAId ?? match.teamBId
    if (!winnerTeamId) return
    await tournamentService.resolveTournamentMatch(tournament.id, match.id, winnerTeamId)
    await refreshTournament()
  }

  async function handleFinalize() {
    if (!tournament) return
    setIsFinishing(true)
    try {
      await tournamentService.finalizeTournament(tournament.id)
      await refreshTournament()
      useToastStore.getState().addToast('Torneo finalizado 🏆', 'success')
    } finally {
      setIsFinishing(false)
    }
  }

  async function handleDelete() {
    if (!tournament) return
    setIsDeleting(true)
    try {
      await tournamentService.deleteTournament(tournament.id)
      useToastStore.getState().addToast('Torneo eliminado', 'info')
      router.push(`/groups/${groupId}?tab=tournaments`)
    } finally {
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  const isAdmin      = userRole === 'admin'
  const isPrivileged = userRole === 'admin' || userRole === 'maintainer'

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-canvas items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen bg-canvas items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-primary/60" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Torneo no encontrado</p>
          <Link
            href={`/groups/${groupId}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase text-primary hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver al grupo
          </Link>
        </div>
      </div>
    )
  }

  const allDone = tournament.rounds.length > 0
    && tournament.rounds.every(r => r.matches.every(m => m.status === 'completed'))

  const status      = STATUS_CONFIG[tournament.status]
  const FormatIcon  = tournament.format === 'bracket' ? GitBranch : RefreshCw
  const formatLabel = tournament.format === 'bracket' ? 'Bracket' : 'Round Robin'

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">

          <Link
            href={`/groups/${groupId}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver al grupo
          </Link>

          {/* Tournament header */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-heading text-2xl font-bold text-neutral-900 dark:text-neutral-100 break-words leading-tight">
                  {tournament.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-[0.12em] uppercase ${status.cls}`}>
                    {status.label}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                    <FormatIcon className="w-3 h-3" />
                    {formatLabel}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                    {tournament.teams.length} equipos
                  </span>
                </div>
              </div>
            </div>

            {(isAdmin || (isPrivileged && allDone && tournament.status !== 'completed')) && (
              <div className="flex items-stretch gap-2 w-full">
                {isAdmin && !confirmDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold tracking-[0.12em] uppercase transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                )}

                {isAdmin && confirmDelete && (
                  <>
                    <button
                      type="button"
                      onClick={() => { void handleDelete() }}
                      disabled={isDeleting}
                      className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white text-[10px] font-bold tracking-[0.12em] uppercase transition-all"
                    >
                      {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex flex-1 items-center justify-center px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 text-[10px] font-bold tracking-[0.12em] uppercase transition-all"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {isPrivileged && allDone && tournament.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => { void handleFinalize() }}
                    disabled={isFinishing}
                    className="flex flex-1 items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-[10px] font-bold tracking-[0.12em] uppercase transition-all"
                  >
                    {isFinishing
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <CheckCircle2 className="w-3.5 h-3.5" />
                    }
                    Finalizar Torneo
                  </button>
                )}
              </div>
            )}
          </div>

          {tournament.status === 'in_progress' && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/[0.05] border border-primary/15">
                <Trophy className="w-4 h-4 text-primary shrink-0" />
                <div className="flex items-center gap-3 flex-wrap font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>🥇 <strong className="text-primary">+{tournament.bonusPoints.first}</strong></span>
                  <span>🥈 <strong className="text-neutral-400">+{tournament.bonusPoints.second}</strong></span>
                  <span>🥉 <strong className="text-amber-700 dark:text-primary">+{tournament.bonusPoints.third}</strong></span>
                </div>
              </div>

              {tournament.prizePool && tournament.prizePool.total > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5">
                    <span className="text-base shrink-0">💰</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-emerald-500/70 block leading-none mb-0.5">
                        Pozo
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-400 tabular-nums">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: tournament.prizePool.currency,
                          maximumFractionDigits: 0,
                        }).format(tournament.prizePool.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-emerald-400/80 tabular-nums shrink-0 flex-wrap justify-end">
                      {tournament.prizePool.distribution.first > 0 && (
                        <span>🥇 {new Intl.NumberFormat('es-AR', { style: 'currency', currency: tournament.prizePool.currency, maximumFractionDigits: 0 }).format(tournament.prizePool.distribution.first)}</span>
                      )}
                      {tournament.prizePool.distribution.second > 0 && (
                        <span>🥈 {new Intl.NumberFormat('es-AR', { style: 'currency', currency: tournament.prizePool.currency, maximumFractionDigits: 0 }).format(tournament.prizePool.distribution.second)}</span>
                      )}
                      {tournament.prizePool.distribution.third > 0 && (
                        <span>🥉 {new Intl.NumberFormat('es-AR', { style: 'currency', currency: tournament.prizePool.currency, maximumFractionDigits: 0 }).format(tournament.prizePool.distribution.third)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tournament.status === 'completed' && tournament.prizePool && tournament.prizePool.total > 0 && (
            <PrizeSummaryCard tournament={tournament} memberUsers={memberUsers} />
          )}

          {tournament.format === 'bracket' ? (
            <BracketView
              tournament={tournament}
              isPrivileged={isPrivileged}
              onResolveMatch={setResolveMatch}
              onResolveBye={(m) => { void handleResolveBye(m) }}
            />
          ) : (
            <RoundRobinView
              tournament={tournament}
              isPrivileged={isPrivileged}
              onResolveMatch={setResolveMatch}
              onResolveBye={(m) => { void handleResolveBye(m) }}
            />
          )}
        </main>
      </div>

      {resolveMatch && (
        <ResolveMatchModal
          match={resolveMatch}
          teams={tournament.teams}
          onResolve={(winnerId) => { void handleResolve(winnerId) }}
          onClose={() => setResolveMatch(null)}
        />
      )}
    </div>
  )
}
