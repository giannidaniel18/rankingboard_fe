export type GameType = 'Board' | 'eSport' | 'Sports'
export type ScoringType = 'points' | 'time' | 'elimination'
export type AchievementId = 'first_win' | 'win_streak_3' | 'win_streak_5' | 'veteran_10'

export interface Achievement {
  id: AchievementId
  name: string
  description: string
  unlockedAt: Date
}

export interface UserStats {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  currentStreak: number
  bestStreak: number
  rankingPoints: number
}

export interface UserProfile {
  stats: UserStats
  achievements: Achievement[]
}

export type FriendshipStatus = 'pending' | 'accepted'

export interface Friendship {
  id: string
  fromId: string
  toId: string
  status: FriendshipStatus
}

export interface User {
  id: string
  email: string
  name: string
  alias: string
  image?: string
  bio?: string
  friends: string[]
  profile: UserProfile
}

export type GroupRole = 'admin' | 'member'

export interface GroupMember {
  userId: string
  role: GroupRole
}

export interface Group {
  id: string
  name: string
  groupTag: string
  members: GroupMember[]
  game_ids: string[]
  createdAt: Date
}

export interface Game {
  id: string
  name: string
  type: GameType
  scoring_type: ScoringType
  group_id?: string
}

export interface MatchPlayer {
  user_id: string
  score: number
  rank: number
}

export interface MatchParticipant {
  userId: string
  placement: number
  score?: number
  team?: string
}

export interface Match {
  id: string
  group_id?: string
  game_id: string
  participants: MatchParticipant[]
  date: Date
  comments?: string
}

export interface MemberStats {
  wins: number
  losses: number
  totalMatches: number
  winRate: number
  points: number
  streak: number
}

export interface RankedMember {
  userId: string
  name: string
  alias: string
  image?: string
  stats: MemberStats
}

export interface FriendRequestWithUser {
  id: string
  user: { id: string; name: string; email: string; alias: string }
}

export interface FriendUser {
  id: string
  name: string
  email: string
  alias: string
}
