import type { User, Group, GroupMember, Game, Match, Friendship, FriendRequestWithUser, FriendUser } from '@/lib/types'


export function generateAlias(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'user'
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `#${base}_${digits}`
}

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
    alias: '#alice_pool',
    friends: ['u2', 'u4'],
    profile: {
      stats: makeStats(8, 5, 3, 3, 3, 225),
      achievements: [],
    },
  },
  {
    id: 'u2',
    email: 'bob@example.com',
    name: 'Bob',
    alias: '#bob_pro',
    friends: ['u1', 'u3'],
    profile: {
      stats: makeStats(8, 3, 5, 0, 2, 155),
      achievements: [],
    },
  },
  {
    id: 'u3',
    email: 'carol@example.com',
    name: 'Carol',
    alias: '#carol_gg',
    friends: ['u2'],
    profile: {
      stats: makeStats(6, 2, 4, 1, 2, 120),
      achievements: [],
    },
  },
  {
    id: 'u4',
    email: 'dave@example.com',
    name: 'Dave',
    alias: '#dave_xyz',
    friends: ['u1'],
    profile: {
      stats: makeStats(),
      achievements: [],
    },
  },
]

const SEED_FRIENDSHIPS: Friendship[] = [
  { id: 'fs1', fromId: 'u1', toId: 'u2', status: 'accepted' },
  { id: 'fs2', fromId: 'u1', toId: 'u4', status: 'accepted' },
  { id: 'fs3', fromId: 'u2', toId: 'u3', status: 'accepted' },
]

const SEED_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Friday Night Gamers',
    groupTag: '#fridaynight_1234',
    members: [
      { userId: 'u1', role: 'admin' },
      { userId: 'u2', role: 'member' },
      { userId: 'u3', role: 'member' },
      { userId: 'u4', role: 'member' },
    ],
    game_ids: ['gm1', 'gm2'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'g2',
    name: 'Chess Club',
    groupTag: '#chessclub_5678',
    members: [
      { userId: 'u1', role: 'admin' },
      { userId: 'u3', role: 'member' },
    ],
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
  friendships = new Map<string, Friendship>(SEED_FRIENDSHIPS.map(f => [f.id, f]))

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

    const qStripped = q.startsWith('#') ? q.slice(1) : q
    const all = Array.from(this.users.values()).filter(u => u.id !== currentUserId)

    const aliasHits = all.filter(u =>
      u.alias.toLowerCase().includes(q) || u.alias.slice(1).toLowerCase().includes(qStripped)
    )
    const aliasIds = new Set(aliasHits.map(u => u.id))

    const nameHits = all.filter(u => !aliasIds.has(u.id) && u.name.toLowerCase().includes(qStripped))
    const nameIds = new Set(nameHits.map(u => u.id))

    const emailHits = all.filter(
      u => !aliasIds.has(u.id) && !nameIds.has(u.id) && u.email.toLowerCase().includes(qStripped)
    )

    return [...aliasHits, ...nameHits, ...emailHits]
  }

  getPendingIncoming(userId: string): FriendRequestWithUser[] {
    return Array.from(this.friendships.values())
      .filter(f => f.toId === userId && f.status === 'pending')
      .map(f => {
        const user = this.users.get(f.fromId)
        return {
          id: f.id,
          user: { id: f.fromId, name: user?.name ?? 'Unknown', email: user?.email ?? '', alias: user?.alias ?? '' },
        }
      })
  }

  getPendingSent(userId: string): FriendRequestWithUser[] {
    return Array.from(this.friendships.values())
      .filter(f => f.fromId === userId && f.status === 'pending')
      .map(f => {
        const user = this.users.get(f.toId)
        return {
          id: f.id,
          user: { id: f.toId, name: user?.name ?? 'Unknown', email: user?.email ?? '', alias: user?.alias ?? '' },
        }
      })
  }

  getFriends(userId: string): FriendUser[] {
    return Array.from(this.friendships.values())
      .filter(f => f.status === 'accepted' && (f.fromId === userId || f.toId === userId))
      .map(f => {
        const otherId = f.fromId === userId ? f.toId : f.fromId
        const user = this.users.get(otherId)
        return { id: otherId, name: user?.name ?? 'Unknown', email: user?.email ?? '', alias: user?.alias ?? '' }
      })
  }

  declineFriendRequest(requestId: string): void {
    this.friendships.delete(requestId)
  }

  getPendingCount(userId: string): number {
    return Array.from(this.friendships.values())
      .filter(f => f.toId === userId && f.status === 'pending')
      .length
  }

  createGroup(name: string, adminId: string): Group {
    if (!adminId) throw new Error('adminId is required to create a group')
    const base = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'group'
    const digits = Math.floor(1000 + Math.random() * 9000)
    const groupTag = `#${base}_${digits}`
    const group: Group = {
      id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      groupTag,
      members: [{ userId: adminId, role: 'admin' }],
      game_ids: [],
      createdAt: new Date(),
    }
    this.groups.set(group.id, group)
    return group
  }

  getUserGroups(userId: string): Group[] {
    return Array.from(this.groups.values()).filter(g =>
      g.members.some(m => m.userId === userId)
    )
  }

  addMemberToGroup(groupId: string, userId: string): Group {
    const group = this.groups.get(groupId)
    if (!group) throw new Error(`Group ${groupId} not found`)
    if (group.members.some(m => m.userId === userId)) return group
    const updated = { ...group, members: [...group.members, { userId, role: 'member' as const }] }
    this.groups.set(groupId, updated)
    return updated
  }

  getAvailableFriendsForGroup(groupId: string, currentUserId: string): FriendUser[] {
    const group = this.groups.get(groupId)
    if (!group) return []
    const memberIds = new Set(group.members.map(m => m.userId))
    return this.getFriends(currentUserId).filter(f => !memberIds.has(f.id))
  }
}

// Module-level singleton — persists across requests in the same Node.js process
export const store = new Store()
