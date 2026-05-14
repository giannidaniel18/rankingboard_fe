import type { Tournament, TournamentStatus } from '@/types'
import { store } from '@/lib/store'

const tournamentService = {
  getTournamentsByGroup(groupId: string): Promise<Tournament[]> {
    return new Promise(resolve =>
      setTimeout(() => resolve(store.getTournamentsByGroup(groupId)), 300)
    )
  },

  getTournamentById(id: string): Promise<Tournament | undefined> {
    return new Promise(resolve =>
      setTimeout(() => resolve(store.getTournamentById(id)), 300)
    )
  },

  createTournament(data: Partial<Tournament>): Promise<string> {
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        try { resolve(store.createTournament(data)) }
        catch (err) { reject(err) }
      }, 300)
    )
  },

  resolveTournamentMatch(
    tournamentId: string,
    matchId: string,
    winnerTeamId: string,
    referenceMatchId?: string,
  ): Promise<void> {
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        try {
          store.resolveTournamentMatch(tournamentId, matchId, winnerTeamId, referenceMatchId)
          resolve()
        } catch (err) {
          reject(err)
        }
      }, 300)
    )
  },

  updateTournamentStatus(id: string, status: TournamentStatus): Promise<void> {
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        try { store.updateTournamentStatus(id, status); resolve() }
        catch (err) { reject(err) }
      }, 300)
    )
  },

  deleteTournament(id: string): Promise<void> {
    return new Promise(resolve =>
      setTimeout(() => { store.deleteTournament(id); resolve() }, 300)
    )
  },

  finalizeTournament(id: string): Promise<void> {
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        try { store.finalizeTournament(id); resolve() }
        catch (err) { reject(err) }
      }, 300)
    )
  },
}

export default tournamentService
