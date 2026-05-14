'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Swords, ChevronDown, Check, Loader2, Trophy, Hash, Target, Lock } from 'lucide-react'
import { useGroups } from '@/hooks/domain/useGroups'
import { useGames } from '@/hooks/domain/useGames'
import { useMatches } from '@/hooks/domain/useMatches'
import { useRankings } from '@/hooks/domain/useRankings'
import type { FriendUser } from '@/types'
import { useI18n } from '@/components/providers/I18nProvider'
import GameCombobox from '@/components/ui/GameCombobox'
import ParticipantMultiSelect from '@/components/ui/ParticipantMultiSelect'

type ResultMode = 'win_loss' | 'podium' | 'score'
type PlayerResult = { placement?: number; score?: number; tied?: boolean }

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  userName: string | null
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-tx-caption mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-elevated border border-white/[0.07] hover:border-white/[0.13] focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-2.5 pr-9 text-sm text-tx-primary font-medium transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tx-caption pointer-events-none" />
      </div>
    </div>
  )
}

export default function MatchModal({ isOpen, onClose, userId, userName }: MatchModalProps) {
  const { dict } = useI18n()
  const t = dict.match

  const { groups, isLoading: groupsLoading, loadUserGroups, fetchGroupMembers } = useGroups()
  const { games, isLoading: gamesLoading, loadAllGames } = useGames()
  const { isSubmitting, recordMatch, loadGroupMatches } = useMatches()
  const { loadRankings } = useRankings()

  const [groupMembers, setGroupMembers] = useState<FriendUser[]>([])
  const [isMembersLoading, setMembersLoading] = useState(false)

  const [selectedGroupId, setSelectedGroupId]           = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<FriendUser[]>([])
  const [selectedGameId, setSelectedGameId]             = useState('')
  const [resultMode, setResultMode]                     = useState<ResultMode>('win_loss')
  const [participantResults, setParticipantResults]     = useState<Record<string, PlayerResult>>({})
  const [success, setSuccess]                           = useState(false)

  const isBusy = groupsLoading || gamesLoading || isMembersLoading || isSubmitting

  // RBAC: only admin/maintainer can record matches
  const selectedGroup = groups.find(g => g.id === selectedGroupId)
  const currentUserRole = selectedGroup?.members.find(m => m.userId === userId)?.role
  const canRecordMatch = !selectedGroupId || currentUserRole === 'admin' || currentUserRole === 'maintainer'

  const allPlayers = selectedParticipants

  useEffect(() => {
    if (!isOpen || !userId) return
    setSelectedGroupId('')
    setSelectedParticipants([])
    setSelectedGameId('')
    setResultMode('win_loss')
    setParticipantResults({})
    setGroupMembers([])
    setSuccess(false)

    loadAllGames()
    loadUserGroups(userId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId])

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId)
    setSelectedParticipants([])
    setSelectedGameId('')
    setParticipantResults({})
    setGroupMembers([])
    if (!groupId || !userId) return
    setMembersLoading(true)
    try {
      const users = await fetchGroupMembers(groupId)
      setGroupMembers(users)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleParticipantsChange = (participants: FriendUser[]) => {
    setSelectedParticipants(participants)
    setParticipantResults({})
  }

  const handleResultModeChange = (mode: ResultMode) => {
    setResultMode(mode)
    setParticipantResults({})
  }

  const setPlayerResult = (playerId: string, result: PlayerResult) => {
    setParticipantResults(prev => ({ ...prev, [playerId]: result }))
  }

  // Win/Loss: clicking Win or Loss clears tied state from all players, then sets the individual result
  const handleWinLossSelect = (playerId: string, placement: number) => {
    setParticipantResults(prev => {
      const updated: Record<string, PlayerResult> = { ...prev }
      allPlayers.forEach(p => {
        if (p.id === playerId) {
          updated[p.id] = { placement }
        } else if (prev[p.id]?.tied) {
          updated[p.id] = {}
        }
      })
      return updated
    })
  }

  // EMPATE: sets ALL participants to tied (placement: 1, tied: true)
  const handleSetAllTied = () => {
    const tied: Record<string, PlayerResult> = {}
    allPlayers.forEach(p => { tied[p.id] = { placement: 1, tied: true } })
    setParticipantResults(tied)
  }

  const isResultComplete = (result: PlayerResult | undefined): boolean => {
    if (!result) return false
    if (resultMode === 'score') return result.score !== undefined && result.score >= 0
    return result.placement !== undefined && result.placement > 0
  }

  const allResultsComplete =
    allPlayers.length > 0 && allPlayers.every(p => isResultComplete(participantResults[p.id]))

  const canSubmit =
    !!selectedGroupId &&
    selectedParticipants.length >= 2 &&
    !!selectedGameId &&
    allResultsComplete &&
    !isBusy

  // Live rank preview for score mode using the 1224 rule
  const rankPreview = useMemo<Record<string, number>>(() => {
    if (resultMode !== 'score') return {}
    const withScores = allPlayers.filter(p => participantResults[p.id]?.score !== undefined)
    if (withScores.length === 0) return {}

    const sorted = [...withScores].sort(
      (a, b) => (participantResults[b.id]?.score ?? 0) - (participantResults[a.id]?.score ?? 0)
    )
    const preview: Record<string, number> = {}
    sorted.forEach(p => {
      const score = participantResults[p.id]?.score ?? 0
      const firstIdx = sorted.findIndex(x => (participantResults[x.id]?.score ?? 0) === score)
      preview[p.id] = firstIdx + 1
    })
    return preview
  }, [resultMode, allPlayers, participantResults])

  const handleSubmit = async () => {
    if (!userId || !selectedGameId || !canSubmit) return

    let finalParticipants: { userId: string; placement: number; score?: number }[]

    if (resultMode === 'score') {
      // 1224 ranking rule: tied scores share placement, next rank skips
      const sorted = [...allPlayers].sort(
        (a, b) => (participantResults[b.id]?.score ?? 0) - (participantResults[a.id]?.score ?? 0)
      )
      finalParticipants = sorted.map(p => {
        const score = participantResults[p.id]?.score ?? 0
        const firstIdx = sorted.findIndex(x => (participantResults[x.id]?.score ?? 0) === score)
        return {
          userId: p.id,
          placement: firstIdx + 1,
          score: participantResults[p.id]?.score,
        }
      })
    } else {
      // win_loss and podium: placement is stored directly (tied players already have placement: 1)
      finalParticipants = allPlayers.map(p => ({
        userId: p.id,
        placement: participantResults[p.id]?.placement ?? 0,
        score: participantResults[p.id]?.score,
      }))
    }

    await recordMatch(selectedGameId, selectedGroupId || undefined, finalParticipants)
    await loadRankings(selectedGroupId)
    await loadGroupMatches(selectedGroupId)
    setSuccess(true)
    setTimeout(onClose, 1800)
  }

  if (!isOpen) return null

  const modes: { key: ResultMode; label: string; icon: React.ReactNode }[] = [
    { key: 'win_loss', label: t.modeWinLoss, icon: <Trophy className="w-3 h-3" /> },
    { key: 'podium',   label: t.modePodium,  icon: <Hash    className="w-3 h-3" /> },
    { key: 'score',    label: t.modeScore,   icon: <Target  className="w-3 h-3" /> },
  ]

  const showResults = selectedParticipants.length > 0 && !!selectedGameId

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-sm bg-surface border border-white/[0.07] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/70 overflow-hidden">
        {/* Amber accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-tx-primary hover:bg-white/[0.06] transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {success ? (
          <div className="flex flex-col items-center text-center gap-4 px-8 py-14">
            <div className="w-14 h-14 rounded-full bg-win/10 border border-win/20 flex items-center justify-center">
              <Check className="w-7 h-7 text-win" />
            </div>
            <div>
              <p className="font-heading text-base font-bold tracking-[0.08em] uppercase text-tx-primary">
                {t.successTitle}
              </p>
              <p className="text-xs text-tx-caption font-mono mt-1">Closing…</p>
            </div>
          </div>
        ) : (
          <div className="px-6 pt-6 pb-7 sm:px-7 sm:pt-7 max-h-[90dvh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                {isBusy
                  ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  : <Swords  className="w-5 h-5 text-primary" />
                }
              </div>
              <div>
                <h2 className="font-heading text-sm font-bold tracking-[0.1em] uppercase text-tx-primary leading-none">
                  {t.title}
                </h2>
                <p className="text-[11px] text-tx-caption font-mono mt-1">Group match</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3 mb-5">
              {/* Step 1 — Group */}
              <SelectField
                label={t.selectGroup}
                value={selectedGroupId}
                onChange={groupId => { void handleGroupChange(groupId) }}
                disabled={groupsLoading || groups.length === 0}
              >
                <option value="" disabled className="bg-elevated text-tx-caption">
                  {groups.length === 0 ? t.noGroups : `— ${t.selectGroup} —`}
                </option>
                {groups.map(g => (
                  <option key={g.id} value={g.id} className="bg-elevated text-tx-primary">
                    {g.name}
                  </option>
                ))}
              </SelectField>

              {/* View-only notice for members */}
              {selectedGroupId && !canRecordMatch && (
                <div className="flex flex-col items-center text-center gap-3 py-8 px-4">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-300">
                      View Only
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-500 font-mono mt-1 leading-relaxed">
                      Only Admins and Maintainers<br />can record matches.
                    </p>
                  </div>
                </div>
              )}

              {/* Steps 2-4 — hidden for members */}
              {canRecordMatch && (
                <>
                  <ParticipantMultiSelect
                    label={t.selectPlayers}
                    members={groupMembers}
                    selected={selectedParticipants}
                    onChange={handleParticipantsChange}
                    disabled={!selectedGroupId || isMembersLoading || groupMembers.length === 0}
                    placeholder={
                      !selectedGroupId
                        ? `— ${t.selectGroup} first —`
                        : groupMembers.length === 0
                          ? t.noMembers
                          : 'Add players…'
                    }
                  />

                  <GameCombobox
                    label={t.selectGame}
                    games={games}
                    value={selectedGameId}
                    onChange={setSelectedGameId}
                    disabled={selectedParticipants.length === 0 || gamesLoading || games.length === 0}
                    searchPlaceholder="Search game…"
                  />

                  {/* Step 4 — Result mode + player rows */}
                  {showResults && (
                    <div className="space-y-2">
                      {/* Mode toggle */}
                      <div className="flex gap-1 p-1 bg-elevated rounded-xl border border-white/[0.07]">
                    {modes.map(mode => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => handleResultModeChange(mode.key)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold tracking-[0.07em] uppercase rounded-lg transition-all duration-200 ${
                          resultMode === mode.key
                            ? 'bg-primary text-secondary shadow-sm'
                            : 'text-tx-caption hover:text-tx-primary'
                        }`}
                      >
                        {mode.icon}
                        <span className="hidden xs:inline">{mode.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Player rows */}
                  <div className="space-y-1.5">
                    {allPlayers.map(player => {
                      const result = participantResults[player.id]
                      const done   = isResultComplete(result)
                      const isTied = result?.tied === true
                      const isMe   = player.id === userId

                      return (
                        <div
                          key={player.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                            isTied
                              ? 'border-sky-500/25 bg-sky-500/[0.04]'
                              : done
                              ? 'border-primary/25 bg-primary/[0.04]'
                              : 'border-white/[0.07] bg-elevated'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-primary uppercase leading-none">
                              {player.name.slice(0, 2)}
                            </span>
                          </div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-tx-primary truncate">
                              {player.name}
                              {isMe && (
                                <span className="ml-1.5 text-[9px] font-bold tracking-[0.1em] uppercase text-primary/60">
                                  you
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Win / Loss / Tie buttons */}
                          {resultMode === 'win_loss' && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleWinLossSelect(player.id, 1)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.06em] uppercase transition-all duration-150 ${
                                  result?.placement === 1 && !isTied
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-white/[0.05] text-tx-caption hover:text-tx-primary hover:bg-white/[0.09]'
                                }`}
                              >
                                {t.winner}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleWinLossSelect(player.id, 2)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.06em] uppercase transition-all duration-150 ${
                                  result?.placement === 2
                                    ? 'bg-rose-500/80 text-white'
                                    : 'bg-white/[0.05] text-tx-caption hover:text-tx-primary hover:bg-white/[0.09]'
                                }`}
                              >
                                {t.loser}
                              </button>
                              <button
                                type="button"
                                onClick={handleSetAllTied}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.06em] uppercase transition-all duration-150 ${
                                  isTied
                                    ? 'bg-sky-500/70 text-white'
                                    : 'bg-white/[0.05] text-tx-caption hover:text-tx-primary hover:bg-white/[0.09]'
                                }`}
                              >
                                {t.tie}
                              </button>
                            </div>
                          )}

                          {/* Podium position input */}
                          {resultMode === 'podium' && (
                            <input
                              type="number"
                              min={1}
                              placeholder={t.position.slice(0, 3)}
                              value={result?.placement ?? ''}
                              onChange={e => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val > 0) setPlayerResult(player.id, { placement: val })
                                else setPlayerResult(player.id, {})
                              }}
                              className="w-16 bg-white/[0.04] border border-white/[0.08] focus:border-primary/40 focus:ring-1 focus:ring-primary/15 rounded-lg px-2 py-1 text-xs text-tx-primary text-center font-mono outline-none transition-all placeholder:text-tx-caption/40 shrink-0"
                            />
                          )}

                          {/* Score input + live rank preview */}
                          {resultMode === 'score' && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {rankPreview[player.id] !== undefined && (
                                <span className="text-[9px] font-bold font-mono text-primary/70 w-5 text-right leading-none">
                                  #{rankPreview[player.id]}
                                </span>
                              )}
                              <input
                                type="number"
                                min={0}
                                placeholder={t.points.slice(0, 3)}
                                value={result?.score ?? ''}
                                onChange={e => {
                                  const val = parseFloat(e.target.value)
                                  if (!isNaN(val) && val >= 0) setPlayerResult(player.id, { score: val })
                                  else setPlayerResult(player.id, {})
                                }}
                                className="w-16 bg-white/[0.04] border border-white/[0.08] focus:border-primary/40 focus:ring-1 focus:ring-primary/15 rounded-lg px-2 py-1 text-xs text-tx-primary text-center font-mono outline-none transition-all placeholder:text-tx-caption/40"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Progress pills — hidden for members */}
            {canRecordMatch && (
              <div className="flex gap-1.5 mb-5">
                {[
                  !!selectedGroupId,
                  selectedParticipants.length > 0,
                  !!selectedGameId,
                  allResultsComplete,
                ].map((done, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                      done ? 'bg-primary' : 'bg-white/[0.08]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Submit — hidden for members */}
            {canRecordMatch && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 rounded-xl bg-primary hover:bg-custom-light-orange active:bg-custom-light-orange disabled:opacity-35 disabled:cursor-not-allowed text-black text-sm font-bold tracking-[0.07em] uppercase font-heading transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/15 hover:shadow-primary/25 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  t.saveMatch
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
