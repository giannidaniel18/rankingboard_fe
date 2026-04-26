'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createMatch } from '@/lib/actions/matches'
import { useI18n } from '@/components/providers/I18nProvider'
import type { Game, User } from '@/lib/types'

type Step = 'game' | 'players' | 'scores' | 'confirm'
const STEPS: Step[] = ['game', 'players', 'scores', 'confirm']

interface Props {
  groupId: string
  games: Game[]
  members: User[]
}

export default function MatchForm({ groupId, games, members }: Props) {
  const router = useRouter()
  const { dict } = useI18n()
  const m = dict.match
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const [step, setStep] = useState<Step>('game')
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')
  const [success, setSuccess] = useState(false)

  const STEP_LABELS: Record<Step, string> = {
    game:    m.stepGame,
    players: m.stepPlayers,
    scores:  m.stepScores,
    confirm: m.stepConfirm,
  }

  function reset() {
    setStep('game')
    setSelectedGame('')
    setSelectedPlayers([])
    setScores({})
    setComments('')
    setSuccess(false)
  }

  function canAdvance() {
    if (step === 'game')    return selectedGame !== ''
    if (step === 'players') return selectedPlayers.length >= 2
    if (step === 'scores')  return selectedPlayers.every(id => scores[id] !== undefined)
    return true
  }

  function advance() {
    const i = STEPS.indexOf(step)
    if (i < STEPS.length - 1) setStep(STEPS[i + 1])
  }

  function back() {
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1])
  }

  function submit() {
    startTransition(async () => {
      await createMatch({
        group_id: groupId,
        game_id:  selectedGame,
        players:  selectedPlayers.map(id => ({ user_id: id, score: scores[id] ?? 0 })),
        date:     new Date().toISOString(),
        comments: comments || undefined,
      })
      setSuccess(true)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-3 py-2.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold tracking-[0.15em] uppercase transition-colors"
      >
        {m.register}
      </button>
    )
  }

  const currentStepIndex = STEPS.indexOf(step)

  return (
    <div className="mt-3 bg-surface rounded border border-black/[0.08] dark:border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.08] dark:border-white/[0.07]">
        <h3 className="font-heading text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
          {m.title}
        </h3>
        <button
          onClick={() => { reset(); setOpen(false) }}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg leading-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex border-b border-black/[0.08] dark:border-white/[0.07]">
        {STEPS.map((s, i) => {
          const isActive    = s === step
          const isCompleted = currentStepIndex > i
          return (
            <div
              key={s}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'border-b-2 border-amber-500'
                  : isCompleted
                  ? 'border-b-2 border-amber-500/30'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <div className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold transition-colors ${
                isActive
                  ? 'bg-amber-500 text-black'
                  : isCompleted
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-black/5 dark:bg-white/5 text-neutral-400 dark:text-neutral-400'
              }`}>
                {i + 1}
              </div>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-400 text-center leading-tight hidden sm:block uppercase tracking-wide">
                {STEP_LABELS[s]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="px-4 py-3 min-h-40">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-10 h-10 rounded-sm bg-amber-500/10 flex items-center justify-center text-2xl">
              🏆
            </div>
            <p className="font-heading text-[11px] font-bold tracking-[0.15em] uppercase text-neutral-900 dark:text-neutral-100">
              {m.successTitle}
            </p>
            <button
              onClick={() => { reset(); setOpen(false) }}
              className="text-[11px] text-amber-500 hover:text-amber-400 uppercase tracking-widest font-semibold transition-colors"
            >
              {m.close}
            </button>
          </div>
        ) : (
          <>
            {step === 'game' && (
              <div className="space-y-1.5">
                {games.map(game => (
                  <label key={game.id} className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                    selectedGame === game.id
                      ? 'border-amber-500/50 bg-amber-500/[0.07]'
                      : 'border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.12]'
                  }`}>
                    <input
                      type="radio"
                      name="game"
                      value={game.id}
                      checked={selectedGame === game.id}
                      onChange={() => setSelectedGame(game.id)}
                      className="accent-amber-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{game.name}</p>
                      <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-400">
                        {game.type} · {game.scoring_type}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {step === 'players' && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-neutral-400 dark:text-neutral-400 mb-2 font-mono">{m.minPlayers}</p>
                {members.map(user => (
                  <label key={user.id} className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                    selectedPlayers.includes(user.id)
                      ? 'border-amber-500/50 bg-amber-500/[0.07]'
                      : 'border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.12]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(user.id)}
                      onChange={() =>
                        setSelectedPlayers(prev =>
                          prev.includes(user.id)
                            ? prev.filter(p => p !== user.id)
                            : [...prev, user.id]
                        )
                      }
                      className="accent-amber-500"
                    />
                    <div className="w-6 h-6 rounded-sm bg-black/10 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{user.name}</p>
                  </label>
                ))}
              </div>
            )}

            {step === 'scores' && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-400 mb-2">
                  {m.stepScores}
                </p>
                {selectedPlayers.map(id => {
                  const user = members.find(u => u.id === id)
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-sm bg-black/10 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {user?.name[0].toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                        {user?.name ?? id}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={scores[id] ?? ''}
                        onChange={e => setScores(prev => ({ ...prev, [id]: Number(e.target.value) }))}
                        placeholder={m.scorePlaceholder}
                        className="w-24 px-2 py-1.5 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-neutral-900 dark:text-neutral-100 font-mono text-sm text-right focus:outline-none focus:border-amber-500/60 transition-colors"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-3">
                <div className="bg-black/[0.03] dark:bg-white/[0.03] rounded-sm border border-black/[0.06] dark:border-white/[0.06] p-3 text-sm space-y-2">
                  <p>
                    <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-400 uppercase tracking-wider">{m.gameLabel}: </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {games.find(g => g.id === selectedGame)?.name}
                    </span>
                  </p>
                  <div>
                    <p className="font-mono text-[11px] text-neutral-400 dark:text-neutral-400 uppercase tracking-wider mb-1">{m.scoresLabel}:</p>
                    <ul className="space-y-1">
                      {selectedPlayers.map(id => (
                        <li key={id} className="flex justify-between text-neutral-800 dark:text-neutral-200">
                          <span className="text-sm">{members.find(u => u.id === id)?.name ?? id}</span>
                          <span className="font-mono text-sm font-semibold tabular-nums">{scores[id]} pts</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder={m.commentsPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 rounded-sm border border-black/[0.10] dark:border-white/[0.10] bg-white dark:bg-white/5 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {!success && (
        <div className="flex justify-between px-4 py-3 border-t border-black/[0.08] dark:border-white/[0.07]">
          <button
            onClick={step === 'game' ? () => { reset(); setOpen(false) } : back}
            className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            {step === 'game' ? m.cancel : m.back}
          </button>
          {step === 'confirm' ? (
            <button
              onClick={submit}
              disabled={isPending}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm disabled:opacity-50 transition-colors"
            >
              {isPending ? m.saving : m.save}
            </button>
          ) : (
            <button
              onClick={advance}
              disabled={!canAdvance()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {m.next}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
