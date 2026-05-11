'use server'

import { store } from '@/lib/store'
import type { Game } from '@/types'

export async function getGamesByGroup(groupId: string): Promise<Game[]> {
  return [...store.games.values()].filter(g => g.group_id === groupId)
}

export async function getAllGames(): Promise<Game[]> {
  return store.getAllGames()
}

export async function getGame(id: string): Promise<Game | undefined> {
  return store.games.get(id)
}

export async function createGame(data: Omit<Game, 'id'>): Promise<Game> {
  const game: Game = { ...data, id: crypto.randomUUID() }
  store.games.set(game.id, game)

  if (data.group_id) {
    const group = store.groups.get(data.group_id)
    if (group && !group.game_ids.includes(game.id)) {
      group.game_ids.push(game.id)
      store.groups.set(group.id, group)
    }
  }

  return game
}

export async function updateGame(
  id: string,
  data: Partial<Omit<Game, 'id' | 'group_id'>>
): Promise<Game> {
  const game = store.games.get(id)
  if (!game) throw new Error(`Game ${id} not found`)
  const updated = { ...game, ...data }
  store.games.set(id, updated)
  return updated
}

export async function deleteGame(id: string): Promise<void> {
  const game = store.games.get(id)
  if (game) {
    if (game.group_id) {
      const group = store.groups.get(game.group_id)
      if (group) {
        group.game_ids = group.game_ids.filter(gid => gid !== id)
        store.groups.set(group.id, group)
      }
    }
  }
  store.games.delete(id)
}
