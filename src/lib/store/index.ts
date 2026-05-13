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

// ─── Users ───────────────────────────────────────────────────────────────────
// 6 friends — all mutual. “Daniel” is the local dev persona.
// Points reflect cumulative delta across 12 group matches (base 100).

const ALL_FRIENDS = ['u_daniel', 'u_gasti', 'u_nenuco', 'u_sonico', 'u_leo', 'u_felix']

const SEED_USERS: User[] = [
  {
    id: 'u_daniel',
    email: 'giannidaniel92@gmail.com',
    name: 'Daniel',
    alias: '#daniel_gg',
    friends: ALL_FRIENDS.filter(id => id !== 'u_daniel'),
    profile: { stats: makeStats(8, 5, 3, 1, 2, 190), achievements: [] },
  },
  {
    id: 'u_gasti',
    email: 'gasti@example.com',
    name: 'Gasti',
    alias: '#gasti_pro',
    friends: ALL_FRIENDS.filter(id => id !== 'u_gasti'),
    profile: { stats: makeStats(7, 3, 4, 1, 1, 135), achievements: [] },
  },
  {
    id: 'u_nenuco',
    email: 'nenuco@example.com',
    name: 'Nenuco',
    alias: '#nenuco_g',
    friends: ALL_FRIENDS.filter(id => id !== 'u_nenuco'),
    profile: { stats: makeStats(6, 2, 4, 0, 1, 110), achievements: [] },
  },
  {
    id: 'u_sonico',
    email: 'sonico@example.com',
    name: 'Sonico',
    alias: '#sonico_x',
    friends: ALL_FRIENDS.filter(id => id !== 'u_sonico'),
    profile: { stats: makeStats(5, 1, 4, 0, 1, 90), achievements: [] },
  },
  {
    id: 'u_leo',
    email: 'leo@example.com',
    name: 'Leo',
    alias: '#leo_zz',
    friends: ALL_FRIENDS.filter(id => id !== 'u_leo'),
    profile: { stats: makeStats(6, 2, 4, 1, 1, 110), achievements: [] },
  },
  {
    id: 'u_felix',
    email: 'felix@example.com',
    name: 'Felix',
    alias: '#felix_nh',
    friends: ALL_FRIENDS.filter(id => id !== 'u_felix'),
    profile: { stats: makeStats(5, 1, 4, 0, 1, 77), achievements: [] },
  },
]

// ─── Friendships (complete mesh — all 15 pairs) ───────────────────────────────
const SEED_FRIENDSHIPS: Friendship[] = [
  { id: 'fs01', fromId: 'u_daniel', toId: 'u_gasti',  status: 'accepted' },
  { id: 'fs02', fromId: 'u_daniel', toId: 'u_nenuco', status: 'accepted' },
  { id: 'fs03', fromId: 'u_daniel', toId: 'u_sonico', status: 'accepted' },
  { id: 'fs04', fromId: 'u_daniel', toId: 'u_leo',    status: 'accepted' },
  { id: 'fs05', fromId: 'u_daniel', toId: 'u_felix',  status: 'accepted' },
  { id: 'fs06', fromId: 'u_gasti',  toId: 'u_nenuco', status: 'accepted' },
  { id: 'fs07', fromId: 'u_gasti',  toId: 'u_sonico', status: 'accepted' },
  { id: 'fs08', fromId: 'u_gasti',  toId: 'u_leo',    status: 'accepted' },
  { id: 'fs09', fromId: 'u_gasti',  toId: 'u_felix',  status: 'accepted' },
  { id: 'fs10', fromId: 'u_nenuco', toId: 'u_sonico', status: 'accepted' },
  { id: 'fs11', fromId: 'u_nenuco', toId: 'u_leo',    status: 'accepted' },
  { id: 'fs12', fromId: 'u_nenuco', toId: 'u_felix',  status: 'accepted' },
  { id: 'fs13', fromId: 'u_sonico', toId: 'u_leo',    status: 'accepted' },
  { id: 'fs14', fromId: 'u_sonico', toId: 'u_felix',  status: 'accepted' },
  { id: 'fs15', fromId: 'u_leo',    toId: 'u_felix',  status: 'accepted' },
]

// ─── Groups ───────────────────────────────────────────────────────────────────
const SEED_GROUPS: Group[] = [
  {
    id: 'g_pibes',
    name: 'Los Pibes del Pool',
    groupTag: '#lospibesdelpool_2025',
    members: [
      { userId: 'u_daniel', role: 'admin' },
      { userId: 'u_gasti',  role: 'member' },
      { userId: 'u_nenuco', role: 'member' },
      { userId: 'u_sonico', role: 'member' },
      { userId: 'u_leo',    role: 'member' },
      { userId: 'u_felix',  role: 'member' },
    ],
    game_ids: ['game_pool8', 'game_cs2', 'game_catan', 'game_monopoly'],
    createdAt: new Date('2025-01-01'),
  },
]

// ─── Games ────────────────────────────────────────────────────────────────────
// Global catalog (no group_id). Group references via game_ids.
const SEED_GAMES: Game[] = [
  // The 4 group games
  { id: 'game_pool8',    name: 'Pool 8-Ball',         type: 'Sports', scoring_type: 'elimination' },
  { id: 'game_cs2',      name: 'Counter-Strike 2',    type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_catan',    name: 'Catan',                type: 'Board',  scoring_type: 'points'      },
  { id: 'game_monopoly', name: 'Monopoly',             type: 'Board',  scoring_type: 'points'      },
  // Extended global catalog
  { id: 'game_lol',      name: 'League of Legends',   type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_val',      name: 'Valorant',             type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_dota2',    name: 'Dota 2',               type: 'eSport', scoring_type: 'elimination' },
  { id: 'game_rl',       name: 'Rocket League',        type: 'eSport', scoring_type: 'points'      },
  { id: 'game_chess',    name: 'Ajedrez',              type: 'Board',  scoring_type: 'elimination' },
  { id: 'game_dnd',      name: 'Dungeons & Dragons',   type: 'Board',  scoring_type: 'points'      },
  { id: 'game_teg',      name: 'TEG',                  type: 'Board',  scoring_type: 'elimination' },
  { id: 'game_pool',     name: 'Pool (Billiards)',      type: 'Sports', scoring_type: 'points'      },
  { id: 'game_futbol',   name: 'Fútbol',               type: 'Sports', scoring_type: 'points'      },
  { id: 'game_padel',    name: 'Pádel',                type: 'Sports', scoring_type: 'points'      },
  { id: 'game_tenis',    name: 'Tenis',                type: 'Sports', scoring_type: 'points'      },
  { id: 'game_basquet',  name: 'Básquet',              type: 'Sports', scoring_type: 'points'      },
]

// ─── Matches ─────────────────────────────────────────────────────────────────
// 12 matches for group g_pibes.
// Placements use the 1224 rule (tied scores share the same placement, next rank skips).
// Cumulative point deltas (computePointsDelta, base 100) produce this final ranking:
//   Daniel 190 | Gasti 135 | Nenuco 110 | Leo 110 | Sonico 90 | Felix 77
const SEED_MATCHES: Match[] = [
  // ── Pool 8-Ball ──────────────────────────────────────────────────────────
  {
    id: 'mp01',
    group_id: 'g_pibes',
    game_id: 'game_pool8',
    participants: [
      { userId: 'u_daniel', placement: 1 },
      { userId: 'u_gasti',  placement: 2 },
    ],
    date: new Date('2025-01-05'),
    comments: 'Daniel rompe con una apertura perfecta.',
  },
  {
    id: 'mp02',
    group_id: 'g_pibes',
    game_id: 'game_pool8',
    participants: [
      { userId: 'u_gasti',  placement: 1 },
      { userId: 'u_daniel', placement: 2 },
    ],
    date: new Date('2025-01-12'),
    comments: 'Revancha — Gasti empata la serie.',
  },
  {
    // Empate: both placement 1 → both get WIN (+25 pts each) in rankings;
    // in H2H analytics: counted as tie (both placement === 1).
    id: 'mp03',
    group_id: 'g_pibes',
    game_id: 'game_pool8',
    participants: [
      { userId: 'u_nenuco', placement: 1 },
      { userId: 'u_sonico', placement: 1 },
    ],
    date: new Date('2025-01-19'),
    comments: 'Empate histórico — ambos meten la última bola a la vez.',
  },
  // ── Counter-Strike 2 ─────────────────────────────────────────────────────
  {
    // Team match: Daniel + Leo (placement 1) vs Gasti + Nenuco (placement 2).
    id: 'mcs01',
    group_id: 'g_pibes',
    game_id: 'game_cs2',
    participants: [
      { userId: 'u_daniel', placement: 1 },
      { userId: 'u_leo',    placement: 1 },
      { userId: 'u_gasti',  placement: 2 },
      { userId: 'u_nenuco', placement: 2 },
    ],
    date: new Date('2025-02-01'),
    comments: 'Clutch de Daniel en pistol round — 16-9.',
  },
  {
    id: 'mcs02',
    group_id: 'g_pibes',
    game_id: 'game_cs2',
    participants: [
      { userId: 'u_felix',  placement: 1 },
      { userId: 'u_sonico', placement: 2 },
      { userId: 'u_leo',    placement: 3 },
      { userId: 'u_daniel', placement: 4 },
    ],
    date: new Date('2025-04-05'),
    comments: 'Felix se luce con el AWP — sorpresa total.',
  },
  // ── Catan ─────────────────────────────────────────────────────────────────
  {
    // 1224 rule: Daniel 10pts → #1; Gasti 8pts → #2; Nenuco 8pts → #2 (tied);
    // Sonico 5pts → #4 (rank 3 is skipped because two players share #2).
    id: 'mca01',
    group_id: 'g_pibes',
    game_id: 'game_catan',
    participants: [
      { userId: 'u_daniel', placement: 1, score: 10 },
      { userId: 'u_gasti',  placement: 2, score: 8  },
      { userId: 'u_nenuco', placement: 2, score: 8  },
      { userId: 'u_sonico', placement: 4, score: 5  },
    ],
    date: new Date('2025-02-10'),
    comments: 'Daniel gana ciudades en el último turno. Empate Gasti/Nenuco en 8 puntos — Sonico cuarto por 1224.',
  },
  {
    id: 'mca02',
    group_id: 'g_pibes',
    game_id: 'game_catan',
    participants: [
      { userId: 'u_gasti',  placement: 1, score: 12 },
      { userId: 'u_daniel', placement: 2, score: 9  },
      { userId: 'u_felix',  placement: 3, score: 7  },
      { userId: 'u_leo',    placement: 4, score: 4  },
    ],
    date: new Date('2025-02-22'),
    comments: 'Gasti con carretera más larga en turno 14.',
  },
  {
    id: 'mca03',
    group_id: 'g_pibes',
    game_id: 'game_catan',
    participants: [
      { userId: 'u_nenuco', placement: 1, score: 11 },
      { userId: 'u_sonico', placement: 2, score: 9  },
      { userId: 'u_leo',    placement: 3, score: 6  },
      { userId: 'u_gasti',  placement: 4, score: 3  },
    ],
    date: new Date('2025-03-02'),
    comments: 'Nenuco con ejército más grande y carretera — nadie lo pudo frenar.',
  },
  // ── Monopoly ──────────────────────────────────────────────────────────────
  {
    // Large score gap tests ranking stability (points-mode).
    id: 'mmo01',
    group_id: 'g_pibes',
    game_id: 'game_monopoly',
    participants: [
      { userId: 'u_daniel', placement: 1, score: 15000 },
      { userId: 'u_leo',    placement: 2, score: 8000  },
      { userId: 'u_sonico', placement: 3, score: 3000  },
      { userId: 'u_felix',  placement: 4, score: -500  },
    ],
    date: new Date('2025-03-15'),
    comments: 'Daniel monopolizó las rojas y amarillas — partido rápido.',
  },
  {
    // 3-player session: Felix(2) receives -8 pts (computePointsDelta(2,3) = -round(0.5×15) = -8).
    id: 'mmo02',
    group_id: 'g_pibes',
    game_id: 'game_monopoly',
    participants: [
      { userId: 'u_gasti',  placement: 1, score: 20000 },
      { userId: 'u_felix',  placement: 2, score: 5000  },
      { userId: 'u_nenuco', placement: 3, score: -1000 },
    ],
    date: new Date('2025-03-22'),
    comments: 'Gasti arrasó — 20k en 90 minutos.',
  },
  // ── Pool 8-Ball (additional rounds) ─────────────────────────────────────
  {
    id: 'mp04',
    group_id: 'g_pibes',
    game_id: 'game_pool8',
    participants: [
      { userId: 'u_leo',   placement: 1 },
      { userId: 'u_felix', placement: 2 },
    ],
    date: new Date('2025-04-12'),
    comments: 'Leo cierra serie invicto en la jornada.',
  },
  {
    id: 'mp05',
    group_id: 'g_pibes',
    game_id: 'game_pool8',
    participants: [
      { userId: 'u_daniel', placement: 1 },
      { userId: 'u_nenuco', placement: 2 },
    ],
    date: new Date('2025-04-20'),
    comments: 'Daniel recupera forma — Nenuco sin respuesta.',
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
    let groups = Array.from(this.groups.values()).filter(g =>
      g.members.some(m => m.userId === userId)
    )
    if (groups.length > 0) return groups
    // Self-healing: if the caller's ID hasn't been bridged yet (client bundle
    // gets a fresh store), bridge by email then retry.
    const callerEmail = this.users.get(userId)?.email
    if (callerEmail) {
      this.bridgeIdentity(userId, callerEmail)
      groups = Array.from(this.groups.values()).filter(g =>
        g.members.some(m => m.userId === userId)
      )
    }
    return groups
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

  /**
   * Identity bridge — call this on every sign-in and on every cold session lookup.
   *
   * Finds a placeholder user whose email matches `email` but whose stored ID
   * differs from `realId`. Replaces the placeholder ID atomically across:
   * users, groups (memberships), matches (participants), and friendships.
   *
   * Idempotent: if `realId` already exists with this email, nothing happens.
   */
  bridgeIdentity(realId: string, email: string): void {
    if (!email) return

    const placeholder = Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.id !== realId,
    )
    if (!placeholder) return

    const oldId = placeholder.id

    // Groups — update memberships
    for (const [gid, group] of this.groups.entries()) {
      if (group.members.some(m => m.userId === oldId)) {
        this.groups.set(gid, {
          ...group,
          members: group.members.map(m =>
            m.userId === oldId ? { ...m, userId: realId } : m,
          ),
        })
      }
    }

    // Matches — update participants
    for (const [mid, match] of this.matches.entries()) {
      if (match.participants.some(p => p.userId === oldId)) {
        this.matches.set(mid, {
          ...match,
          participants: match.participants.map(p =>
            p.userId === oldId ? { ...p, userId: realId } : p,
          ),
        })
      }
    }

    // Friendships — update both sides
    for (const [fsid, fs] of this.friendships.entries()) {
      if (fs.fromId === oldId || fs.toId === oldId) {
        this.friendships.set(fsid, {
          ...fs,
          fromId: fs.fromId === oldId ? realId : fs.fromId,
          toId:   fs.toId   === oldId ? realId : fs.toId,
        })
      }
    }

    // Other users' friends arrays
    for (const [uid, user] of this.users.entries()) {
      if (uid !== oldId && user.friends.includes(oldId)) {
        this.users.set(uid, {
          ...user,
          friends: user.friends.map(f => (f === oldId ? realId : f)),
        })
      }
    }

    // Re-key the user entry: preserve all mock profile data, swap id
    this.users.delete(oldId)
    this.users.set(realId, { ...placeholder, id: realId })
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id)
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
