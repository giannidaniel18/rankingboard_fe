import type { User, Group, Game, Match, Friendship } from '@/lib/types'

export function makeStats(
  totalMatches = 0,
  wins = 0,
  losses = 0,
  currentStreak = 0,
  bestStreak = 0,
  rankingPoints = 100
) {
  return {
    totalMatches,
    wins,
    losses,
    winRate: totalMatches > 0 ? wins / totalMatches : 0,
    currentStreak,
    bestStreak,
    rankingPoints,
  }
}

const SEED_USERS: User[] = [
  {
    id: 'u1',
    email: 'alice@example.com',
    name: 'Alice',
    friends: [],
    profile: {
      stats: makeStats(8, 5, 3, 3, 3, 225),
      achievements: [],
    },
  },
  {
    id: 'u2',
    email: 'bob@example.com',
    name: 'Bob',
    friends: [],
    profile: {
      stats: makeStats(8, 3, 5, 0, 2, 155),
      achievements: [],
    },
  },
  {
    id: 'u3',
    email: 'carol@example.com',
    name: 'Carol',
    friends: [],
    profile: {
      stats: makeStats(6, 2, 4, 1, 2, 120),
      achievements: [],
    },
  },
  {
    id: 'u4',
    email: 'dave@example.com',
    name: 'Dave',
    friends: [],
    profile: {
      stats: makeStats(),
      achievements: [],
    },
  },
]

const SEED_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Friday Night Gamers',
    members: ['u1', 'u2', 'u3', 'u4'],
    game_ids: ['gm1', 'gm2'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'g2',
    name: 'Chess Club',
    members: ['u1', 'u3'],
    game_ids: ['gm3'],
    createdAt: new Date('2024-02-01'),
  },
]

const SEED_GAMES: Game[] = [
  { id: 'gm1', name: 'Catan', type: 'Board', scoring_type: 'points', group_id: 'g1' },
  { id: 'gm2', name: 'FIFA', type: 'eSport', scoring_type: 'points', group_id: 'g1' },
  { id: 'gm3', name: 'Chess', type: 'Board', scoring_type: 'elimination', group_id: 'g2' },
]

const SEED_MATCHES: Match[] = [
  {
    id: 'm1',
    group_id: 'g1',
    game_id: 'gm1',
    players: [
      { user_id: 'u1', score: 10, rank: 1 },
      { user_id: 'u2', score: 8, rank: 2 },
      { user_id: 'u3', score: 5, rank: 3 },
    ],
    winner_id: 'u1',
    date: new Date('2024-03-10'),
    comments: 'Close game!',
  },
  {
    id: 'm2',
    group_id: 'g1',
    game_id: 'gm2',
    players: [
      { user_id: 'u2', score: 3, rank: 1 },
      { user_id: 'u4', score: 1, rank: 2 },
    ],
    winner_id: 'u2',
    date: new Date('2024-03-15'),
  },
]

class Store {
  users = new Map<string, User>(SEED_USERS.map(u => [u.id, u]))
  groups = new Map<string, Group>(SEED_GROUPS.map(g => [g.id, g]))
  games = new Map<string, Game>(SEED_GAMES.map(g => [g.id, g]))
  matches = new Map<string, Match>(SEED_MATCHES.map(m => [m.id, m]))
  friendships = new Map<string, Friendship>()

  sendFriendRequest(from: string, to: string): Friendship {
    const existing = Array.from(this.friendships.values()).find(
      f => (f.fromId === from && f.toId === to) || (f.fromId === to && f.toId === from)
    )
    if (existing) return existing

    const id = `fr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const friendship: Friendship = { id, fromId: from, toId: to, status: 'pending' }
    this.friendships.set(id, friendship)
    return friendship
  }

  acceptFriendRequest(requestId: string): void {
    const friendship = this.friendships.get(requestId)
    if (!friendship) throw new Error(`Friend request ${requestId} not found`)

    friendship.status = 'accepted'

    const fromUser = this.users.get(friendship.fromId)
    const toUser = this.users.get(friendship.toId)

    if (fromUser && !fromUser.friends.includes(friendship.toId)) {
      fromUser.friends.push(friendship.toId)
    }
    if (toUser && !toUser.friends.includes(friendship.fromId)) {
      toUser.friends.push(friendship.fromId)
    }
  }

  searchUsers(query: string, currentUserId: string): User[] {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return Array.from(this.users.values()).filter(
      u =>
        u.id !== currentUserId &&
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    )
  }
}

// Module-level singleton — persists across requests in the same Node.js process
export const store = new Store()
