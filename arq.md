 ---
  # RankingBoard — Technical Architecture Summary

  ## 1. Tech Stack

  | Layer | Technology | Version |
  |---|---|---|
  | Framework | Next.js (App Router, Server Actions) | 16.2.4 |
  | Runtime | React | 19.2.4 |
  | Language | TypeScript (strict mode) | 5 |
  | Styling | Tailwind CSS v4 | ^4 (PostCSS) |
  | Theming | next-themes (class-based, dark default) | ^0.4.6 |
  | Auth | next-auth | ^5.0.0-beta.31 |
  | Icons | lucide-react | ^1.14.0 |
  | Linting | ESLint 9 | — |

  **Note:** CLAUDE.md mentions Zustand, Axios, and React Hook Form, but none are currently
  installed or used. Architecture relies on Server Actions, `useTransition`, and
  component-level `useState`.

  ---

  ## 2. Project Structure

  ```
  src/
  ├── app/
  │   ├── (auth)/login/page.tsx
  │   ├── (auth)/register/page.tsx
  │   ├── api/auth/[...nextauth]/route.ts
  │   ├── dashboard/page.tsx
  │   ├── groups/page.tsx + [id]/page.tsx
  │   ├── social/page.tsx
  │   ├── profile/page.tsx
  │   └── layout.tsx              # Root layout with all Providers
  │
  ├── components/
  │   ├── auth/                   # LoginForm, RegisterForm
  │   ├── dashboard/              # RecentMatches
  │   ├── groups/                 # GroupsClient, GroupDetails, MemberRankings,
  InviteMemberModal
  │   ├── layout/                 # NavigationShell, SideNavBar, MobileBottomNav, Navbar,
  MatchModal
  │   ├── match/                  # MatchForm (4-step wizard)
  │   ├── providers/              # I18nProvider, NextAuthProvider, ThemeProvider
  │   ├── social/                 # SocialManager, UserSearch, PendingRequests, FriendsList
  │   ├── ui/                     # LanguageToggle, ThemeToggle
  │   └── user/                   # ProfileCard, UserAvatar
  │
  ├── lib/
  │   ├── actions/                # All Server Actions (7 files — see §7)
  │   ├── auth/
  │   │   ├── config.ts           # NextAuth config (placeholder, real config in
  lib/auth.ts)
  │   │   └── session.ts          # getServerSession() with JIT provisioning fallback
  │   ├── auth.ts                 # NextAuth export: handlers, auth, signIn, signOut
  │   ├── engine/
  │   │   ├── ranking.ts          # rankPlayers(), computePointsDelta(), determineWinner()
  │   │   └── achievements.ts     # checkAchievements(), buildAchievement()
  │   ├── i18n/
  │   │   ├── index.ts            # getLocale(), getDictionary(), LOCALES
  │   │   └── dictionaries/en.ts + es.ts
  │   ├── store/index.ts          # In-memory Map-based singleton DB
  │   └── types/index.ts          # All TypeScript interfaces
  │
  └── proxy.ts                    # Next.js middleware for auth-based route protection
  ```

  ---

  ## 3. Data Models (Types)

  **File:** `src/lib/types/index.ts`

  ```typescript
  // Enums / Literals
  type GameType = 'Board' | 'eSport' | 'Sports'
  type ScoringType = 'points' | 'time' | 'elimination'
  type AchievementId = 'first_win' | 'win_streak_3' | 'win_streak_5' | 'veteran_10'
  type FriendshipStatus = 'pending' | 'accepted'
  type GroupRole = 'admin' | 'member'

  interface User {
    id: string
    email: string
    name: string
    alias: string        // #username_1234 format, generated on creation
    image?: string
    bio?: string
    friends: string[]    // array of user IDs (accepted friends)
    profile: UserProfile
  }

  interface UserProfile {
    stats: UserStats
    achievements: Achievement[]
  }

  interface UserStats {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
    bestStreak: number
    rankingPoints: number  // Elo-like, starts at 100
  }

  interface Achievement {
    id: AchievementId
    name: string
    description: string
    unlockedAt: Date
  }

  interface Friendship {
    id: string
    fromId: string
    toId: string
    status: FriendshipStatus
  }

  interface Group {
    id: string
    name: string
    groupTag: string       // #groupname_5678 format
    members: GroupMember[]
    game_ids: string[]
    createdAt: Date
  }

  interface GroupMember {
    userId: string
    role: GroupRole
  }

  interface Game {
    id: string
    name: string
    type: GameType
    scoring_type: ScoringType
    group_id: string
  }

  interface Match {
    id: string
    group_id: string
    game_id: string
    players: MatchPlayer[]
    winner_id: string
    date: Date
    comments?: string
  }

  interface MatchPlayer {
    user_id: string
    score: number
    rank: number
  }
  ```

  ---

  ## 4. State Management — In-Memory Store

  **File:** `src/lib/store/index.ts`

  A module-level singleton class that persists across the Node.js process lifetime. All
  mutations are synchronous and in-memory — no database.

  ```typescript
  class Store {
    users      = new Map<string, User>(SEED_USERS.map(u => [u.id, u]))
    groups     = new Map<string, Group>(SEED_GROUPS.map(g => [g.id, g]))
    games      = new Map<string, Game>(SEED_GAMES.map(g => [g.id, g]))
    matches    = new Map<string, Match>(SEED_MATCHES.map(m => [m.id, m]))
    friendships = new Map<string, Friendship>(SEED_FRIENDSHIPS.map(f => [f.id, f]))

    // Friend methods
    sendFriendRequest(from, to): Friendship
    acceptFriendRequest(requestId): void
    declineFriendRequest(requestId): void
    searchUsers(query, currentUserId): User[]
    getPendingIncoming(userId): FriendRequestWithUser[]
    getPendingSent(userId): FriendRequestWithUser[]
    getFriends(userId): FriendUser[]
    getPendingCount(userId): number

    // Group methods
    createGroup(name, adminId): Group
    getUserGroups(userId): Group[]
    addMemberToGroup(groupId, userId): Group
    getAvailableFriendsForGroup(groupId, currentUserId): FriendUser[]
  }

  export const store = new Store()  // Singleton — imported by all Server Actions
  ```

  **Seeded data:**
  - 4 Users: Alice (u1), Bob (u2), Carol (u3), Dave (u4)
  - 2 Groups: "Friday Night Gamers" (g1, 4 members), "Chess Club" (g2, 2 members)
  - 3 Games: Catan (Board/points), FIFA (eSport/points), Chess (Board/elimination)
  - 2 Matches with pre-calculated rankings

  **Persistence caveat:** All state resets on server restart. Session survival depends on
  Next.js module caching. Production use requires a real database.

  ---

  ## 5. Core Features

  ### 5a. Auth — Google JIT Provisioning

  **File:** `src/lib/auth.ts`

  Providers: Google OAuth + Credentials (email/password lookup against store).

  ```typescript
  // In signIn callback — fires on every Google OAuth login
  async signIn({ user, account }) {
    if (account?.provider === 'google' && user.id && user.email) {
      if (!store.users.has(user.id)) {
        store.users.set(user.id, {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
          alias: generateAlias(name),
          image: user.image ?? undefined,
          friends: [],
          profile: { stats: makeStats(), achievements: [] },
        })
      }
    }
    return true
  }
  ```

  **File:** `src/lib/auth/session.ts` — `getServerSession()` wraps `auth()` and adds a
  second JIT provisioning layer for token-refresh cases where `signIn` callback doesn't
  re-fire:

  ```typescript
  export async function getServerSession(): Promise<Session | null> {
    const session = await auth()
    if (!session?.user?.id) return null

    let user = store.users.get(session.user.id)
    if (!user) {
      // Auto-provision for Credentials or token-refresh flows
      user = { id, email, name, alias, friends: [], profile: ... }
      store.users.set(user.id, user)
    }
    return { user }
  }
  ```

  **Middleware** (`src/proxy.ts`): Protects `/profile` and `/dashboard` (redirect to
  `/login`). Blocks `/login` and `/register` for authenticated users (redirect to
  `/profile`).

  ---

  ### 5b. Social — #PoolTags, Search, Friend Requests

  **Alias format:** `#username_XXXX` (4-digit random suffix, generated on user creation).

  **Search priority** (alias → name → email):
  ```typescript
  searchUsers(query, currentUserId) {
    const q = query.toLowerCase().trim()
    const qStripped = q.startsWith('#') ? q.slice(1) : q
    const all = [...this.users.values()].filter(u => u.id !== currentUserId)

    const aliasHits = all.filter(u =>
      u.alias.toLowerCase().includes(q) ||
  u.alias.slice(1).toLowerCase().includes(qStripped)
    )
    const nameHits  = all.filter(u => !aliasHits.includes(u) &&
  u.name.toLowerCase().includes(qStripped))
    const emailHits = all.filter(u => !aliasHits.includes(u) && !nameHits.includes(u) &&
  u.email.toLowerCase().includes(qStripped))

    return [...aliasHits, ...nameHits, ...emailHits]
  }
  ```

  **Request flow:** `sendFriendRequest` → `acceptFriendRequest` | `declineFriendRequest`

  **UI:** `SocialManager` tabs: Search / Pending (with badge count) / Friends

  ---

  ### 5c. Groups — Membership, Roles, Stats

  - **Roles:** `admin` (creator) | `member`
  - **Invite flow:** `InviteMemberModal` — searches friends, shows friend status. "Add" for
   existing friends, "Add + Friend" for strangers (adds to group AND sends friend request
  simultaneously).
  - **Group-scoped data:** Games are scoped to a group via `game_id: string` and `group_id:
   string`. Members are filtered in `getAvailableFriendsForGroup` to exclude existing
  members.

  **getGroupRankings (implicit — via `getRankedMembers`):**

  Rankings are not pre-computed per group. Instead:
  1. `getMatchesByGroup(groupId)` filters `store.matches` by `match.group_id === groupId`
  2. `applyMatchResults()` mutates `store.users` stats globally on every match creation
  3. `getRankedMembers(userIds)` fetches users by ID and sorts by `rankingPoints`
  descending

  **Implication:** Stats are global (across all groups), not group-scoped. A win in Group A
   raises your `rankingPoints` for Group B rankings too. This is a known current
  limitation.

  ---

  ### 5d. Navigation — Mobile Bottom Nav vs Desktop Sidebar

  **File:** `src/components/layout/NavigationShell.tsx` — Client component, renders
  conditionally.

  - **Desktop (`md:`):** `SideNavBar` — fixed left sidebar, 224px. Hidden on mobile
  (`hidden md:flex`).
  - **Mobile (`< md`):** `MobileBottomNav` — fixed bottom bar with central circular FAB for
   "+ New Match". Shown on mobile, hidden on desktop (`flex md:hidden`).

  **Nav routes:**
  - `/groups` — Groups
  - `/social` — Social
  - `/dashboard` — History / Dashboard
  - `/profile` — Profile

  **Header (`Navbar`):** App title, `ThemeToggle`, `LanguageToggle`, `UserAvatar`.

  ---

  ## 6. Critical Logic

  ### Ranking Engine — `src/lib/engine/ranking.ts`

  ```typescript
  // Sort players by score descending, assign ranks (ties share same rank)
  export function rankPlayers(players: Array<{user_id: string; score: number}>):
  MatchPlayer[]

  // Elo-style delta:
  // Rank 1 (winner): +25 points
  // Rank N: -(15 * (rank-1)/(totalPlayers-1)) points
  export function computePointsDelta(rank: number, totalPlayers: number): number {
    if (rank === 1) return 25
    if (totalPlayers === 1) return 0
    return -Math.round(((rank - 1) / (totalPlayers - 1)) * 15)
  }
  ```

  ### Achievement System — `src/lib/engine/achievements.ts`

  | ID | Trigger |
  |---|---|
  | `first_win` | wins >= 1 |
  | `win_streak_3` | currentStreak >= 3 |
  | `win_streak_5` | currentStreak >= 5 |
  | `veteran_10` | totalMatches >= 10 |

  Checked and awarded inside `applyMatchResults()` after every `createMatch` call.

  ### Match Creation — `src/lib/actions/matches.ts`

  ```typescript
  export async function createMatch(input: CreateMatchInput): Promise<Match> {
    const rankedPlayers = rankPlayers(input.players)
    const winner_id = determineWinner(rankedPlayers)  // user_id with rank === 1
    const match: Match = { id: crypto.randomUUID(), ...input, players: rankedPlayers,
  winner_id, date: new Date(input.date) }
    store.matches.set(match.id, match)
    applyMatchResults(rankedPlayers, winner_id)  // mutates store.users stats + awards
  achievements
    return match
  }
  ```

  ### i18n

  - Locale stored in cookie (`locale`, maxAge 365 days).
  - Server components: `getDictionary(await getLocale())` directly.
  - Client components: `useI18n()` from `<I18nProvider dict={dict} locale={locale}>` in
  root layout.
  - Supported: `en` | `es`. Default: `en`.

  ---

  ## 7. Server Actions Reference

  | File | Actions |
  |---|---|
  | `auth.ts` | `loginAction`, `registerAction`, `logoutAction`, `googleSignInAction` |
  | `friends.ts` | `sendFriendRequest`, `acceptFriendRequest`, `declineFriendRequest`,
  `searchUsers`, `getPendingRequests`, `getSentRequests`, `getFriends`, `getPendingCount` |
  | `games.ts` | `getGamesByGroup`, `getGame`, `createGame`, `updateGame`, `deleteGame` |
  | `groups.ts` | `getGroups`, `getGroup`, `getUserGroups`, `createGroup`, `updateGroup`,
  `deleteGroup`, `addMemberToGroup`, `getAvailableFriendsForGroup` |
  | `locale.ts` | `setLocale` |
  | `matches.ts` | `createMatch`, `getMatchesByGroup`, `getRecentMatches` |
  | `users.ts` | `getUser` (with JIT), `updateUserProfile`, `getUsersByIds`,
  `getRankedMembers` |

  ---

  ## 8. Known Gaps / Future Work

  - **No real DB:** All state in-memory. Needs Prisma/Drizzle + Postgres.
  - **Global stats, not group-scoped:** `rankingPoints` are not isolated per group.
  - **No Zustand:** CLAUDE.md lists it as a dependency but it's not installed.
  - **No Axios / React Hook Form:** Same — referenced in rules but not used.
  - **Credentials auth uses plaintext password matching** (no bcrypt) — demo only.
  - **No real-time updates:** UI refreshes via `router.refresh()` after mutations.