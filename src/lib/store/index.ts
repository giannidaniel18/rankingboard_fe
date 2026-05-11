import type { User, Group, GroupMember, Game, Match, MatchParticipant, Friendship, FriendRequestWithUser, FriendUser, RankedMember } from '@/types'
import { computePointsDelta } from '@/lib/engine/ranking'


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
  // Group-specific games (kept for backward-compat with existing matches / group pages)
  { id: 'gm1', name: 'Catan',  type: 'Board',  scoring_type: 'points',      group_id: 'g1' },
  { id: 'gm2', name: 'FIFA',   type: 'eSport', scoring_type: 'points',      group_id: 'g1' },
  { id: 'gm3', name: 'Chess',  type: 'Board',  scoring_type: 'elimination', group_id: 'g2' },
  // Global game catalog (15 games â€” no group_id)
  { id: 'game_cs2',     name: 'Counter-Strike 2',    type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_lol',     name: 'League of Legends',   type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_val',     name: 'Valorant',             type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_dota2',   name: 'Dota 2',               type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_rl',      name: 'Rocket League',        type: 'eSport', scoring_type: 'points'      },
  { id: 'game_chess',   name: 'Ajedrez',              type: 'Board',  scoring_type: 'elimination' },
  { id: 'game_catan',   name: 'Catan',                type: 'Board',  scoring_type: 'points'      },
  { id: 'game_dnd',     name: 'Dungeons & Dragons',   type: 'Board',  scoring_type: 'points'      },
  { id: 'game_teg',     name: 'TEG',                  type: 'Board',  scoring_type: 'elimination' },
  { id: 'game_monopoly',name: 'Monopoly',             type: 'Board',  scoring_type: 'points'      },
  { id: 'game_pool',    name: 'Pool (Billiards)',      type: 'Sports', scoring_type: 'points'      },
  { id: 'game_futbol',  name: 'FÃºtbol',               type: 'Sports', scoring_type: 'points'      },
  { id: 'game_padel',   name: 'PÃ¡del',                type: 'Sports', scoring_type: 'points'      },
  { id: 'game_tenis',   name: 'Tenis',                type: 'Sports', scoring_type: 'points'      },
  { id: 'game_basquet', name: 'BÃ¡squet',              type: 'Sports', scoring_type: 'points'      },
]

const SEED_MATCHES: Match[] = [
  // --- Group g1: Friday Night Gamers ---
  {
    id: 'm1',
    group_id: 'g1',
    game_id: 'gm1',
    participants: [
      { userId: 'u1', placement: 1, score: 10 },
      { userId: 'u2', placement: 2, score: 8 },
      { userId: 'u3', placement: 3, score: 5 },
    ],
    date: new Date('2024-03-10'),
    comments: 'Close game!',
  },
  {
    id: 'm2',
    group_id: 'g1',
    game_id: 'gm2',
    participants: [
      { userId: 'u2', placement: 1, score: 3 },
      { userId: 'u4', placement: 2, score: 1 },
    ],
    date: new Date('2024-03-15'),
  },
  {
    id: 'm3',
    group_id: 'g1',
    game_id: 'gm1',
    participants: [
      { userId: 'u3', placement: 1, score: 12 },
      { userId: 'u1', placement: 2, score: 9 },
      { userId: 'u4', placement: 3, score: 4 },
    ],
    date: new Date('2024-03-22'),
    comments: 'Carol dominates!',
  },
  {
    id: 'm4',
    group_id: 'g1',
    game_id: 'gm2',
    participants: [
      { userId: 'u1', placement: 1, score: 2 },
      { userId: 'u3', placement: 2, score: 1 },
    ],
    date: new Date('2024-03-29'),
  },
  // --- Group g2: Chess Club ---
  {
    id: 'm5',
    group_id: 'g2',
    game_id: 'gm3',
    participants: [
      { userId: 'u1', placement: 1, score: 1 },
      { userId: 'u3', placement: 2, score: 0 },
    ],
    date: new Date('2024-04-05'),
    comments: 'Checkmate in 32 moves.',
  },
  {
    id: 'm6',
    group_id: 'g2',
    game_id: 'gm3',
    participants: [
      { userId: 'u3', placement: 1, score: 1 },
      { userId: 'u1', placement: 2, score: 0 },
    ],
    date: new Date('2024-04-12'),
    comments: 'Carol evens the score.',
  },
  // --- Global / Casual (no group) ---
  {
    id: 'm7',
    game_id: 'gm1',
    participants: [
      { userId: 'u2', placement: 1, score: 15 },
      { userId: 'u4', placement: 2, score: 10 },
    ],
    date: new Date('2024-04-20'),
    comments: 'Casual session, no group.',
  },
  {
    id: 'm8',
    game_id: 'gm2',
    participants: [
      { userId: 'u4', placement: 1, score: 3 },
      { userId: 'u1', placement: 2, score: 2 },
    ],
    date: new Date('2024-04-25'),
    comments: 'Dave upsets Alice.',
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

  getAllGames(): Game[] {
    const typeOrder: Record<string, number> = { Board: 0, eSport: 1, Sports: 2 }
    return [...this.games.values()]
      .filter(g => !g.group_id)
      .sort((a, b) => {
        const d = (typeOrder[a.type] ?? 0) - (typeOrder[b.type] ?? 0)
        return d !== 0 ? d : a.name.localeCompare(b.name)
      })
  }

  getGroupMembers(groupId: string, excludeUserId?: string): FriendUser[] {
    const group = this.groups.get(groupId)
    if (!group) return []
    return group.members
      .filter(m => m.userId !== excludeUserId)
      .map(m => {
        const user = this.users.get(m.userId)
        return { id: m.userId, name: user?.name ?? 'Unknown', email: user?.email ?? '', alias: user?.alias ?? '' }
      })
  }

  getGroupRankings(groupId: string): RankedMember[] {
    const group = this.groups.get(groupId)
    if (!group) return []

    const groupMatches = [...this.matches.values()]
      .filter(m => m.group_id === groupId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    type Acc = { wins: number; losses: number; totalMatches: number; points: number; streak: number }
    const acc = new Map<string, Acc>()
    for (const { userId } of group.members) {
      acc.set(userId, { wins: 0, losses: 0, totalMatches: 0, points: 100, streak: 0 })
    }

    for (const match of groupMatches) {
      const total = match.participants.length
      for (const participant of match.participants) {
        const s = acc.get(participant.userId)
        if (!s) continue
        const isWinner = participant.placement === 1
        const delta = computePointsDelta(participant.placement, total)
        s.totalMatches++
        s.points = Math.max(0, s.points + delta)
        if (isWinner) { s.wins++; s.streak++ }
        else { s.losses++; s.streak = 0 }
      }
    }

    return group.members
      .map(({ userId }) => {
        const user = this.users.get(userId)
        const s = acc.get(userId)!
        return {
          userId,
          name: user?.name ?? 'Unknown',
          alias: user?.alias ?? '',
          image: user?.image,
          stats: { ...s, winRate: s.totalMatches > 0 ? s.wins / s.totalMatches : 0 },
        }
      })
      .sort((a, b) => b.stats.points - a.stats.points)
  }
}

// Module-level singleton â€” persists across requests in the same Node.js process
export const store = new Store()
