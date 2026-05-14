// Standard envelope returned by the backend for every response.
// The response interceptor unwraps this so services always receive T directly.
export interface ApiResponse<T> {
  isSuccess: boolean
  data: T
  error: string | null
  timestamp: string
}

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

export type GroupRole = 'admin' | 'maintainer' | 'member'

export interface GroupMember {
  userId: string
  role: GroupRole
  joinedAt: string
  isActive: boolean
}

export interface Group {
  id: string
  name: string
  groupTag: string
  avatarUrl?: string
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
  tournamentId?: string
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
  isActive: boolean
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

export interface MatchParticipantDetail {
  userId: string
  name: string
  placement: number
  score?: number
}

export interface MatchDetail {
  id: string
  group_id?: string
  game_id: string
  gameName: string
  gameType?: GameType
  groupName?: string
  participants: MatchParticipantDetail[]
  date: Date
  comments?: string
  tournamentId?: string
}

export type TournamentFormat = 'bracket' | 'round_robin'
export type TournamentStatus = 'draft' | 'in_progress' | 'completed'
export type TournamentMatchStatus = 'pending' | 'completed'

export interface TournamentTeam {
  id: string
  name: string
  playerIds: string[]
}

export interface TournamentMatch {
  id: string
  roundId: number
  matchNumber: number
  teamAId: string | null
  teamBId: string | null
  status: TournamentMatchStatus
  winnerTeamId?: string
  referenceMatchId?: string
}

export interface TournamentRound {
  id: number
  name: string
  matches: TournamentMatch[]
}

export interface TournamentPrizePool {
  total: number
  currency: string
  distribution: {
    first: number
    second: number
    third: number
  }
}

export interface Tournament {
  id: string
  groupId: string
  gameId: string
  name: string
  format: TournamentFormat
  status: TournamentStatus
  teams: TournamentTeam[]
  rounds: TournamentRound[]
  bonusPoints: {
    first: number
    second: number
    third: number
  }
  prizePool?: TournamentPrizePool
  createdAt: string
  completedAt?: string
}
