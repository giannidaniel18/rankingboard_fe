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
  image?: string
  bio?: string
  friends: string[]
  profile: UserProfile
}

export interface Group {
  id: string
  name: string
  members: string[]
  game_ids: string[]
  createdAt: Date
}

export interface Game {
  id: string
  name: string
  type: GameType
  scoring_type: ScoringType
  group_id: string
}

export interface MatchPlayer {
  user_id: string
  score: number
  rank: number
}

export interface Match {
  id: string
  group_id: string
  game_id: string
  players: MatchPlayer[]
  winner_id: string
  date: Date
  comments?: string
}
