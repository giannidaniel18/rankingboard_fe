import type { Achievement, AchievementId, User } from '@/lib/types'

const DEFINITIONS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
  first_win: {
    id: 'first_win',
    name: 'First Blood',
    description: 'Win your first match',
  },
  win_streak_3: {
    id: 'win_streak_3',
    name: 'On Fire',
    description: 'Win 3 matches in a row',
  },
  win_streak_5: {
    id: 'win_streak_5',
    name: 'Unstoppable',
    description: 'Win 5 matches in a row',
  },
  veteran_10: {
    id: 'veteran_10',
    name: 'Veteran',
    description: 'Play 10 matches',
  },
}

export function checkAchievements(user: User): AchievementId[] {
  const { stats, achievements } = user.profile
  const unlocked = new Set(achievements.map(a => a.id))
  const earned: AchievementId[] = []

  if (stats.wins >= 1 && !unlocked.has('first_win')) earned.push('first_win')
  if (stats.currentStreak >= 3 && !unlocked.has('win_streak_3')) earned.push('win_streak_3')
  if (stats.currentStreak >= 5 && !unlocked.has('win_streak_5')) earned.push('win_streak_5')
  if (stats.totalMatches >= 10 && !unlocked.has('veteran_10')) earned.push('veteran_10')

  return earned
}

export function buildAchievement(id: AchievementId): Achievement {
  return { ...DEFINITIONS[id], unlockedAt: new Date() }
}
