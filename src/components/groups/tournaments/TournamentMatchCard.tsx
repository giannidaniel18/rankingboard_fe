'use client'

import type { TournamentMatch, TournamentTeam } from '@/types'
import useGroupsStore from '@/store/useGroupsStore'

interface Props {
  match: TournamentMatch
  teams: TournamentTeam[]
  isPrivileged: boolean
  onResolve?: () => void
}

const AVATAR_PALETTE = [
  'bg-brand text-black',
  'bg-live text-white',
  'bg-win text-white',
  'bg-loss text-white',
  'bg-violet-500 text-white',
  'bg-orange-500 text-black',
  'bg-bronze text-white',
  'bg-pink-500 text-white',
]

function TeamSlot({
  teamId,
  teams,
  isWinner,
  isLoser,
}: {
  teamId: string | null
  teams: TournamentTeam[]
  isWinner: boolean
  isLoser: boolean
}) {
  const memberUsers = useGroupsStore(s => s.memberUsers)
  const idx  = teams.findIndex(t => t.id === teamId)
  const team = teams[idx]

  if (!team) {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-5 h-5 rounded-full border border-dashed border-tx-caption/40 shrink-0" />
        <p className="text-sm font-mono text-tx-caption italic">TBD</p>
      </div>
    )
  }

  const avatarCls = AVATAR_PALETTE[idx % AVATAR_PALETTE.length] ?? 'bg-black/20 text-white'

  const playerNames = team.playerIds
    .map(id => memberUsers.find(u => u.id === id)?.alias)
    .filter((a): a is string => Boolean(a))
    .join(', ')

  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-all ${
      isWinner
        ? 'bg-brand/[0.07] dark:bg-brand/[0.09]'
        : isLoser
          ? 'opacity-40'
          : ''
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
        isLoser ? 'grayscale opacity-60' : avatarCls
      }`}>
        {team.name[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          isWinner
            ? 'text-brand font-semibold'
            : 'text-tx-primary'
        }`}>
          {team.name}
        </p>
        {playerNames && (
          <p className="text-[10px] text-tx-caption font-normal mt-0.5 truncate">
            {playerNames}
          </p>
        )}
      </div>
      {isWinner && (
        <span className="text-brand text-[13px] shrink-0">🏆</span>
      )}
    </div>
  )
}

export default function TournamentMatchCard({ match, teams, isPrivileged, onResolve }: Props) {
  const isDone    = match.status === 'completed'
  const isAWinner = isDone && match.winnerTeamId === match.teamAId
  const isBWinner = isDone && match.winnerTeamId === match.teamBId
  const bothKnown = !!match.teamAId && !!match.teamBId

  // Bye: exactly one team assigned, other is null
  const isBye     = !isDone && !bothKnown && (!!match.teamAId || !!match.teamBId)
  const showBye     = isBye && isPrivileged && !!onResolve
  const showResolve = isPrivileged && !isDone && bothKnown && !!onResolve

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isDone
        ? 'border-black/[0.06] dark:border-white/[0.06]'
        : isBye
          ? 'border-dashed border-brand/30 dark:border-brand/20'
          : bothKnown
            ? 'border-black/[0.10] dark:border-white/[0.09] shadow-sm shadow-black/5'
            : 'border-dashed border-black/[0.08] dark:border-white/[0.07]'
    }`}>
      <TeamSlot teamId={match.teamAId} teams={teams} isWinner={isAWinner} isLoser={isDone && !isAWinner} />

      <div className="flex items-center bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/[0.04] dark:border-white/[0.04]">
        <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.04]" />
        <span className="px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.2em] text-tx-caption">
          {isBye ? 'BYE' : 'VS'}
        </span>
        <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.04]" />
      </div>

      <TeamSlot teamId={match.teamBId} teams={teams} isWinner={isBWinner} isLoser={isDone && !isBWinner} />

      {showResolve && (
        <div className="px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.05] bg-black/[0.01] dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={onResolve}
            className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-black text-[10px] font-bold tracking-[0.15em] uppercase transition-all"
          >
            Cargar Resultado
          </button>
        </div>
      )}

      {showBye && (
        <div className="px-4 py-3 border-t border-brand/10 bg-brand/[0.03]">
          <button
            type="button"
            onClick={onResolve}
            className="w-full py-2.5 rounded-lg bg-brand/20 hover:bg-brand/30 border border-brand/30 text-brand-text dark:text-brand text-[10px] font-bold tracking-[0.15em] uppercase transition-all"
          >
            Avanzar (Pase Libre)
          </button>
        </div>
      )}
    </div>
  )
}
