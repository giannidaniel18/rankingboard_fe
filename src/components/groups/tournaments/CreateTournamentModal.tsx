'use client'

import { useState, useEffect, useMemo, useRef, Fragment } from 'react'
import {
  X, Trophy, GitBranch, RefreshCw, Shuffle, Check,
  ChevronRight, ChevronLeft, Loader2, Users, Award,
} from 'lucide-react'
import type { Game, User, TournamentTeam, TournamentFormat, TournamentPrizePool } from '@/types'
import { generateBracket, generateRoundRobin } from '@/lib/utils/tournamentGenerator'
import tournamentService from '@/services/tournamentService'
import gamesService from '@/services/gamesService'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  groupId: string
  groupGameIds: string[]
  activeMembers: User[]
  onClose: () => void
  onCreated: (id: string) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const TEAM_PALETTE = [
  { border: 'border-primary/40',   bg: 'bg-primary/10',   text: 'text-primary',   badge: 'bg-primary/20 text-amber-300 border-primary/40'   },
  { border: 'border-sky-500/40',     bg: 'bg-sky-500/10',     text: 'text-sky-400',     badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40'         },
  { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { border: 'border-rose-500/40',    bg: 'bg-rose-500/10',    text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'       },
  { border: 'border-violet-500/40',  bg: 'bg-violet-500/10',  text: 'text-violet-400',  badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  { border: 'border-orange-500/40',  bg: 'bg-orange-500/10',  text: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
] as const

const STEP_META = [
  { label: 'Setup',   Icon: Trophy },
  { label: 'Equipos', Icon: Users  },
  { label: 'Premios', Icon: Award  },
]

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center px-6 py-4">
      {STEP_META.map(({ label }, i) => {
        const s = (i + 1) as 1 | 2 | 3
        const done   = step > s
        const active = step === s
        return (
          <Fragment key={s}>
            {i > 0 && (
              <div className={`h-px flex-1 mx-2 transition-colors duration-300 ${step > i ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
            )}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                done   ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' :
                active ? 'bg-primary text-secondary shadow-lg shadow-primary/30' :
                         'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400'
              }`}>
                {done ? <Check className="w-3 h-3" /> : s}
              </div>
              <span className={`text-[9px] font-bold tracking-[0.12em] uppercase leading-none ${
                active ? 'text-primary' : 'text-neutral-400 dark:text-neutral-500'
              }`}>
                {label}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreateTournamentModal({
  groupId,
  groupGameIds,
  activeMembers,
  onClose,
  onCreated,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSaving, setIsSaving] = useState(false)

  // ── Step 1 ──
  const [games, setGames]   = useState<Game[]>([])
  const [name, setName]     = useState('')
  const [gameId, setGameId] = useState('')
  const [format, setFormat] = useState<TournamentFormat>('bracket')

  // ── Step 2 ──
  const [playersPerTeam, setPlayersPerTeam] = useState<1 | 2 | 3>(1)
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(
    new Set(activeMembers.map(m => m.id))
  )
  const [memberTeamIdx, setMemberTeamIdx] = useState<Map<string, number>>(new Map())
  const [numTeams, setNumTeams]           = useState(0)
  const [hasGenerated, setHasGenerated]   = useState(false)

  // ── Step 3 ──
  const [bonus, setBonus] = useState({ first: 50, second: 25, third: 10 })
  const [prizeEnabled, setPrizeEnabled]         = useState(false)
  const [prizeTotal, setPrizeTotal]             = useState<number>(0)
  const [prizeTotalDisplay, setPrizeTotalDisplay] = useState('')
  const prizeTotalInputRef                      = useRef<HTMLInputElement>(null)
  const [prizeCurrency, setPrizeCurrency]       = useState('ARS')

  const PRIZE_PRESETS = [
    { label: 'Winner Takes All', pct: { first: 1, second: 0, third: 0 } },
    { label: '70 / 30',          pct: { first: 0.7, second: 0.3, third: 0 } },
    { label: '60 / 30 / 10',     pct: { first: 0.6, second: 0.3, third: 0.1 } },
  ] as const

  const [activePrizePreset, setActivePrizePreset] = useState<number | null>(null)
  const [prizeDistribution, setPrizeDistribution] = useState({ first: 0, second: 0, third: 0 })

  function applyPrizePreset(idx: number) {
    const preset = PRIZE_PRESETS[idx]!
    setActivePrizePreset(idx)
    const total = prizeTotal || 0
    setPrizeDistribution({
      first:  Math.round(total * preset.pct.first),
      second: Math.round(total * preset.pct.second),
      third:  Math.round(total * preset.pct.third),
    })
  }

  function handlePrizeTotalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cursorPos          = e.target.selectionStart ?? 0
    const digitsBeforeCursor = e.target.value.slice(0, cursorPos).replace(/\D/g, '').length

    const raw       = e.target.value.replace(/\D/g, '')
    const num       = raw ? parseInt(raw, 10) : 0
    const formatted = num > 0 ? new Intl.NumberFormat('es-AR').format(num) : ''

    setPrizeTotal(num)
    setPrizeTotalDisplay(formatted)

    if (activePrizePreset !== null) {
      const preset = PRIZE_PRESETS[activePrizePreset]!
      setPrizeDistribution({
        first:  Math.round(num * preset.pct.first),
        second: Math.round(num * preset.pct.second),
        third:  Math.round(num * preset.pct.third),
      })
    }

    // Restore cursor position after React re-render, accounting for added separators
    requestAnimationFrame(() => {
      const input = prizeTotalInputRef.current
      if (!input) return
      let digitCount = 0
      let newPos = formatted.length
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i]!)) {
          digitCount++
          if (digitCount === digitsBeforeCursor) { newPos = i + 1; break }
        }
      }
      input.setSelectionRange(newPos, newPos)
    })
  }

  const buildPrizePool = (): TournamentPrizePool | undefined => {
    if (!prizeEnabled || prizeTotal <= 0) return undefined
    return { total: prizeTotal, currency: prizeCurrency, distribution: prizeDistribution }
  }

  // Load group games on mount
  useEffect(() => {
    gamesService.getAllGames().then(all => {
      const filtered = all.filter(g => groupGameIds.includes(g.id))
      setGames(filtered)
      if (filtered[0]) setGameId(filtered[0].id)
    })
  }, [groupGameIds])

  // ── Step 2 derived state ──

  const selectedList = useMemo(
    () => activeMembers.filter(m => selectedIds.has(m.id)),
    [activeMembers, selectedIds]
  )

  const computedTeams = useMemo((): TournamentTeam[] => {
    if (!hasGenerated) return []
    const map = new Map<number, string[]>()
    for (const [memberId, idx] of memberTeamIdx.entries()) {
      if (!selectedIds.has(memberId)) continue
      if (!map.has(idx)) map.set(idx, [])
      map.get(idx)!.push(memberId)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([idx, playerIds]) => {
        const letter = TEAM_LETTERS[idx] ?? String(idx + 1)
        const teamName = playersPerTeam === 1
          ? (activeMembers.find(m => m.id === playerIds[0])?.name ?? `Equipo ${letter}`)
          : `Equipo ${letter}`
        return { id: `tt_${idx}`, name: teamName, playerIds }
      })
  }, [hasGenerated, memberTeamIdx, selectedIds, playersPerTeam, activeMembers])

  function handleAutoGenerate() {
    const members = [...selectedList]
    for (let i = members.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[members[i], members[j]] = [members[j]!, members[i]!]
    }
    const total = Math.floor(members.length / playersPerTeam)
    setNumTeams(total)
    const newMap = new Map<string, number>()
    for (let i = 0; i < total * playersPerTeam; i++) {
      newMap.set(members[i]!.id, Math.floor(i / playersPerTeam))
    }
    setMemberTeamIdx(newMap)
    setHasGenerated(true)
  }

  function cycleTeam(memberId: string) {
    setMemberTeamIdx(prev => {
      const cur  = prev.get(memberId) ?? 0
      const next = (cur + 1) % numTeams
      return new Map([...prev, [memberId, next]])
    })
  }

  // ── Validation ──

  const canGoNext =
    step === 1 ? name.trim().length > 0 && gameId !== '' :
    step === 2 ? hasGenerated && computedTeams.length >= 2 :
    true

  // ── Submit ──

  async function handleSubmit() {
    if (isSaving) return
    setIsSaving(true)
    try {
      const rounds = format === 'bracket'
        ? generateBracket(computedTeams)
        : generateRoundRobin(computedTeams)

      const id = await tournamentService.createTournament({
        groupId,
        gameId,
        name: name.trim(),
        format,
        status: 'in_progress',
        teams: computedTeams,
        rounds,
        bonusPoints: bonus,
        prizePool: buildPrizePool(),
        createdAt: new Date().toISOString(),
      })
      onCreated(id)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-surface border border-black/[0.10] dark:border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/80 flex flex-col max-h-[92dvh]">
        {/* Amber accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-heading text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
              Crear Torneo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <StepIndicator step={step} />

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mx-5 shrink-0" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Step 1: Setup ── */}
          {step === 1 && (
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Nombre del torneo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Copa Libertadores de Pool"
                  autoFocus
                  className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.10] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/[0.13] focus:border-primary/70 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 font-medium outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                  Juego
                </label>
                {games.length === 0 ? (
                  <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs py-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Cargando juegos…
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {games.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGameId(g.id)}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all ${
                          gameId === g.id
                            ? 'bg-primary text-secondary'
                            : 'bg-black/[0.05] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-300 border border-black/[0.08] dark:border-white/[0.08] hover:border-primary/50'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                  Formato
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'bracket'     as const, label: 'Bracket',     sub: 'Eliminación directa',  Icon: GitBranch },
                    { value: 'round_robin' as const, label: 'Round Robin', sub: 'Todos contra todos',   Icon: RefreshCw },
                  ]).map(({ value, label, sub, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormat(value)}
                      className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border transition-all text-left ${
                        format === value
                          ? 'border-primary/60 bg-primary/10'
                          : 'border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/[0.14] bg-black/[0.02] dark:bg-white/[0.02]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${format === value ? 'text-primary' : 'text-neutral-400'}`} />
                      <div>
                        <p className={`text-[11px] font-bold tracking-[0.08em] uppercase ${format === value ? 'text-primary' : 'text-neutral-700 dark:text-neutral-200'}`}>
                          {label}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {sub}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Equipos ── */}
          {step === 2 && (
            <div className="p-5 space-y-4">
              {/* Players per team */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                  Jugadores por equipo
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => { setPlayersPerTeam(n); setHasGenerated(false); setMemberTeamIdx(new Map()) }}
                      className={`w-12 h-10 rounded-xl text-[11px] font-bold border tracking-[0.05em] transition-all ${
                        playersPerTeam === n
                          ? 'bg-primary text-secondary border-primary'
                          : 'bg-black/[0.04] dark:bg-white/[0.05] border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-300 hover:border-primary/50'
                      }`}
                    >
                      {n}v{n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Member selection (before auto-gen) */}
              {!hasGenerated && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400">
                      Participantes ({selectedIds.size})
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedIds(
                        selectedIds.size === activeMembers.length
                          ? new Set()
                          : new Set(activeMembers.map(m => m.id))
                      )}
                      className="text-[10px] font-bold tracking-[0.1em] uppercase text-primary hover:text-primary transition-colors"
                    >
                      {selectedIds.size === activeMembers.length ? 'Ninguno' : 'Todos'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {activeMembers.map(member => {
                      const selected = selectedIds.has(member.id)
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            const next = new Set(selectedIds)
                            selected ? next.delete(member.id) : next.add(member.id)
                            setSelectedIds(next)
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            selected
                              ? 'border-primary/30 bg-primary/[0.06]'
                              : 'border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.10]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 transition-all ${
                            selected
                              ? 'bg-primary text-secondary'
                              : 'bg-black/[0.08] dark:bg-white/[0.08] text-neutral-500 dark:text-neutral-400'
                          }`}>
                            {selected
                              ? <Check className="w-3.5 h-3.5" />
                              : member.name[0]?.toUpperCase()
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate leading-tight">
                              {member.name}
                            </p>
                            <p className="font-mono text-[11px] text-primary dark:text-primary truncate leading-tight">
                              {member.alias}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Warnings + auto-gen button */}
              {!hasGenerated && (
                <div className="space-y-2">
                  {selectedIds.size > 0 && selectedIds.size % playersPerTeam !== 0 && (
                    <p className="text-[11px] font-mono text-primary/80 px-1">
                      {selectedIds.size} jugadores / {playersPerTeam} por equipo —{' '}
                      {selectedIds.size % playersPerTeam} quedarán sin equipo.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleAutoGenerate}
                    disabled={selectedIds.size < 2}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-custom-light-orange active:bg-custom-light-orange disabled:opacity-40 disabled:cursor-not-allowed text-black text-[11px] font-bold tracking-[0.15em] uppercase transition-all"
                  >
                    <Shuffle className="w-4 h-4" />
                    Generar Equipos Aleatorios
                  </button>
                </div>
              )}

              {/* Teams view (after auto-gen) */}
              {hasGenerated && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400">
                      {computedTeams.length} equipos
                    </p>
                    <button
                      type="button"
                      onClick={() => { setHasGenerated(false); setMemberTeamIdx(new Map()) }}
                      className="flex items-center gap-1 text-[10px] font-bold tracking-[0.1em] uppercase text-neutral-400 hover:text-primary transition-colors"
                    >
                      <Shuffle className="w-3 h-3" />
                      Reorganizar
                    </button>
                  </div>

                  <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                    Toca el badge de equipo para mover al jugador al siguiente.
                  </p>

                  {/* Member → team assignment list */}
                  <div className="space-y-1.5">
                    {selectedList
                      .filter(m => memberTeamIdx.has(m.id))
                      .map(member => {
                        const teamIdx = memberTeamIdx.get(member.id) ?? 0
                        const palette = TEAM_PALETTE[teamIdx % TEAM_PALETTE.length]!
                        const letter  = TEAM_LETTERS[teamIdx] ?? String(teamIdx + 1)
                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.06]"
                          >
                            <div className="w-7 h-7 rounded-full bg-black/[0.08] dark:bg-white/[0.08] flex items-center justify-center font-bold text-[11px] text-neutral-600 dark:text-neutral-300 shrink-0">
                              {member.name[0]?.toUpperCase()}
                            </div>
                            <p className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 min-w-0 truncate">
                              {member.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => cycleTeam(member.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.08em] uppercase border transition-all ${palette.badge}`}
                            >
                              Eq {letter}
                            </button>
                          </div>
                        )
                      })}
                  </div>

                  {/* Teams summary grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {computedTeams.map((team, idx) => {
                      const palette = TEAM_PALETTE[idx % TEAM_PALETTE.length]!
                      return (
                        <div key={team.id} className={`p-3 rounded-xl border ${palette.border} ${palette.bg}`}>
                          <p className={`text-[10px] font-bold tracking-[0.1em] uppercase mb-1.5 ${palette.text}`}>
                            {team.name}
                          </p>
                          {team.playerIds.map(pid => {
                            const u = activeMembers.find(m => m.id === pid)
                            return (
                              <p key={pid} className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate font-mono leading-relaxed">
                                {u?.name ?? pid}
                              </p>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Premios ── */}
          {step === 3 && (
            <div className="p-5 space-y-5">
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                Puntos de bonificación otorgados al finalizar el torneo.
              </p>

              {/* Quick presets */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                  Presets rápidos
                </label>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { label: '50/25/10',  values: { first: 50,  second: 25, third: 10 } },
                    { label: '100/50/25', values: { first: 100, second: 50, third: 25 } },
                    { label: '30/15/5',   values: { first: 30,  second: 15, third: 5  } },
                  ]).map(p => {
                    const active = bonus.first === p.values.first && bonus.second === p.values.second && bonus.third === p.values.third
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setBonus(p.values)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-[0.08em] uppercase transition-all border ${
                          active
                            ? 'bg-primary/15 border-primary/40 text-primary'
                            : 'bg-black/[0.04] dark:bg-white/[0.05] border-black/[0.08] dark:border-white/[0.08] text-neutral-500 dark:text-neutral-400 hover:border-primary/40'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Bonus inputs */}
              <div className="space-y-3">
                {([
                  { label: '1.° Puesto', emoji: '🥇', key: 'first'  as const, color: 'text-primary'                       },
                  { label: '2.° Puesto', emoji: '🥈', key: 'second' as const, color: 'text-neutral-400'                     },
                  { label: '3.° Puesto', emoji: '🥉', key: 'third'  as const, color: 'text-amber-700 dark:text-primary'   },
                ]).map(({ label, emoji, key, color }) => (
                  <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]">
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div className="flex-1">
                      <p className={`text-[11px] font-bold tracking-[0.08em] uppercase ${color}`}>
                        {label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setBonus(b => ({ ...b, [key]: Math.max(0, b[key] - 5) }))}
                        className="w-7 h-7 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/[0.10] dark:hover:bg-white/[0.10] transition-colors font-bold"
                      >
                        −
                      </button>
                      <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 w-10 text-center tabular-nums">
                        +{bonus[key]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBonus(b => ({ ...b, [key]: b[key] + 5 }))}
                        className="w-7 h-7 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/[0.10] dark:hover:bg-white/[0.10] transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary callout */}
              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-primary/[0.06] border border-primary/20">
                <Trophy className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  El ganador obtendrá{' '}
                  <span className="text-primary font-bold">+{bonus.first} pts</span>{' '}
                  de bonus al completar el torneo.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

              {/* ── Prize Pool ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400">
                      Pozo Monetario
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Premio en dinero para los ganadores
                    </p>
                  </div>
                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prizeEnabled}
                    onClick={() => setPrizeEnabled(v => !v)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 ${
                      prizeEnabled ? 'bg-emerald-500' : 'bg-black/[0.12] dark:bg-white/[0.12]'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      prizeEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {prizeEnabled && (
                  <div className="space-y-3">
                    {/* Total + currency */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                          Monto Total
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-neutral-400 dark:text-neutral-500 pointer-events-none select-none">
                            $
                          </span>
                          <input
                            ref={prizeTotalInputRef}
                            type="text"
                            inputMode="numeric"
                            value={prizeTotalDisplay}
                            onChange={handlePrizeTotalChange}
                            placeholder="15.000"
                            className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.10] dark:border-white/[0.08] hover:border-emerald-500/40 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 rounded-xl pl-7 pr-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 font-mono font-bold outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                          />
                        </div>
                      </div>
                      <div className="w-20">
                        <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                          Moneda
                        </label>
                        <select
                          value={prizeCurrency}
                          onChange={e => setPrizeCurrency(e.target.value)}
                          className="w-full bg-white dark:bg-white/[0.04] border border-black/[0.10] dark:border-white/[0.08] hover:border-emerald-500/40 focus:border-emerald-500/60 rounded-xl px-2 py-2 text-[11px] font-bold text-neutral-900 dark:text-neutral-100 outline-none transition-all"
                        >
                          <option value="ARS">ARS</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    {/* Distribution presets */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                        Distribución
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {PRIZE_PRESETS.map((p, idx) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => applyPrizePreset(idx)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-[0.06em] uppercase transition-all border ${
                              activePrizePreset === idx
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                : 'bg-black/[0.04] dark:bg-white/[0.05] border-black/[0.08] dark:border-white/[0.08] text-neutral-500 dark:text-neutral-400 hover:border-emerald-500/40'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calculated amounts */}
                    {activePrizePreset !== null && prizeTotal > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { emoji: '🥇', label: '1.°', amount: prizeDistribution.first  },
                          { emoji: '🥈', label: '2.°', amount: prizeDistribution.second },
                          { emoji: '🥉', label: '3.°', amount: prizeDistribution.third  },
                        ]).map(({ emoji, label, amount }) => (
                          <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                            <span className="text-base">{emoji}</span>
                            <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-emerald-500/70">{label}</span>
                            <span className="font-mono font-bold text-[11px] text-emerald-400 tabular-nums">
                              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: prizeCurrency, maximumFractionDigits: 0 }).format(amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-black/[0.08] dark:border-white/[0.07] flex items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/[0.10] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-300 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Atrás
            </button>
          ) : (
            <div />
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <button
              type="button"
              onClick={() => { if (canGoNext) setStep(s => (s + 1) as 2 | 3) }}
              disabled={!canGoNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-custom-light-orange active:bg-custom-light-orange disabled:opacity-40 disabled:cursor-not-allowed text-black text-[11px] font-bold tracking-[0.15em] uppercase transition-all"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { void handleSubmit() }}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-custom-light-orange active:bg-custom-light-orange disabled:opacity-40 disabled:cursor-not-allowed text-black text-[11px] font-bold tracking-[0.15em] uppercase transition-all"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
              {isSaving ? 'Creando…' : 'Crear Torneo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
