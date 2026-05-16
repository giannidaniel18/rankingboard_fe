# RankingBoard — Frontend Architecture

> Hexagonal Architecture (Ports & Adapters) on Next.js App Router.
> Every layer has a single responsibility. Crossing layer boundaries in the wrong direction is forbidden.
> This document is the single source of truth for the frontend team and the definitive API contract for the backend team.

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Layer Definitions](#2-layer-definitions)
3. [Core Domains & File Map](#3-core-domains--file-map)
4. [Data Flow Examples](#4-data-flow-examples)
5. [State Management Contract](#5-state-management-contract)
6. [Service Layer & API Contract](#6-service-layer--api-contract)
7. [Business Logic Engine](#7-business-logic-engine)
8. [UI/UX Semantic Token System](#8-uiux-semantic-token-system)
9. [Developer Guidelines & Anti-Patterns](#9-developer-guidelines--anti-patterns)

---

## 1. Architectural Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          UI LAYER                               │
│             src/app/  ·  src/components/                        │
│     "Dumb" components — consume data, emit user events          │
└──────────────────────────┬──────────────────────────────────────┘
                           │  calls (custom hooks only)
┌──────────────────────────▼──────────────────────────────────────┐
│                    DOMAIN HOOKS LAYER                           │
│                   src/hooks/domain/                             │
│    Orchestrators — business logic, async ops, store writes      │
└──────────┬────────────────────────────┬────────────────────────-┘
           │  reads/writes              │  calls
┌──────────▼───────────┐   ┌───────────▼────────────────────────┐
│    STATE LAYER       │   │         SERVICE LAYER               │
│    src/store/        │   │         src/services/               │
│    Zustand slices    │   │   HTTP adapters — axios wrappers    │
│    (reactive global  │   │   Today: mock · Tomorrow: real API  │
│     state)           │   └────────────────────────────────────┘
└──────────────────────┘
```

The architecture enforces a **strict one-way dependency rule**:

```
UI → Domain Hook → (Store + Service) → [External API / Mock]
```

No layer may skip a level or reverse the arrow.

---

## 2. Layer Definitions

### Layer 1 — UI Layer (`src/app/` & `src/components/`)

Pages and presentational components. Their only job is to render markup and forward user interactions upward to domain hooks.

**Responsibilities:**
- Render data received from domain hooks
- Dispatch user actions by calling functions returned by domain hooks
- Manage purely visual local state (e.g., modal open/close, hover, animation)

**Hard constraints:**
- No `import` from `src/services/`
- No `import` from `src/store/`
- No direct `fetch()` or `axios` calls
- No domain state duplicated in `useState`

---

### Layer 2 — Domain Hooks (`src/hooks/domain/`)

The **single entry point** for the UI to interact with business data. Each hook encapsulates all logic for its domain: calling services, updating the store, and exposing a clean async API.

**Responsibilities:**
- Orchestrate calls to the service layer
- Write results into the corresponding Zustand store
- Expose `isLoading`, `error`, and `data` derived from the store
- Contain all business-level conditional logic

**Hard constraints:**
- Must not contain JSX
- Must not be imported by other domain hooks (flat graph, no cross-domain coupling)
- Must not expose raw store setters to components

**Files:**

| Hook | Domain |
|---|---|
| `useAuth.ts` | Authentication, session hydration, profile update |
| `useGames.ts` | Game catalogue |
| `useGroups.ts` | Group CRUD, membership, role management |
| `useMatches.ts` | Match recording, group history, recent matches |
| `useRankings.ts` | Leaderboard computation per group |
| `useAnalytics.ts` | Head-to-head stats, player trends (pure client-side, no service call) |
| `useSocial.ts` | Friends list, friend requests, user search |
| `useAppI18n.ts` | Locale switching |

---

### Layer 3 — State Layer (`src/store/`)

Reactive global state managed exclusively by Zustand. Components read from it indirectly (via domain hooks); they never write to it directly.

**Responsibilities:**
- Hold the single source of truth for each domain's data
- Expose atomic setters used only by domain hooks
- Keep slices small and focused on one domain

**Files:**

| Store | Owned State |
|---|---|
| `useAuthStore.ts` | `currentUser: User \| null`, `isAuthenticated: boolean` |
| `useGamesStore.ts` | `games: Game[]`, `isLoading: boolean` |
| `useGroupsStore.ts` | `groups: Group[]`, `currentGroup: Group \| null`, `memberUsers: User[]`, `isLoading`, `error` |
| `useMatchesStore.ts` | `matchesByGroup: Record<string, MatchDetail[]>`, `recentMatches: MatchDetail[]`, `isSubmitting`, `isLoadingMatches`, `isLoadingRecent` |
| `useRankingsStore.ts` | `rankingsByGroup: Record<string, RankedMember[]>`, `isLoading` |
| `useSocialStore.ts` | `friends: FriendUser[]`, `incomingRequests: FriendRequestWithUser[]`, `sentRequests: FriendRequestWithUser[]`, `searchResults: User[]`, `isLoading` |
| `useToastStore.ts` | `toasts: Toast[]` — global notification queue, auto-dismissed at 3 s |

---

### Layer 4 — Service Layer / Adapters (`src/services/`)

Pure HTTP adapters. Each service file maps 1-to-1 to an API resource. They accept typed parameters, call `axiosInstance`, and return typed Promises. They have zero awareness of Zustand or React.

**Responsibilities:**
- Serialize/deserialize API payloads
- Own the URL construction for each endpoint
- Be the only place `axiosInstance` is imported

**Files:**

| Service | Resource |
|---|---|
| `axiosInstance.ts` | Base Axios instance — base URL, request/response interceptors, error handling |
| `authService.ts` | `/auth` — credential login, registration, Google OAuth, logout |
| `userService.ts` | `/users` — profile update |
| `gamesService.ts` | `/games` — full catalogue |
| `groupService.ts` | `/groups` — CRUD, membership, roles |
| `matchesService.ts` | `/matches` — record, group history, user recent matches |
| `rankingsService.ts` | `/rankings` — ranked leaderboard per group |
| `socialService.ts` | `/social` — friends, requests, user search |
| `tournamentService.ts` | `/tournaments` — full tournament lifecycle |
| `i18nService.ts` | Locale persistence (cookie/header) |

---

## 3. Core Domains & File Map

```
src/
├── app/                                    # Next.js App Router — pages & layouts
│   ├── layout.tsx                          # Root layout — providers, shell
│   ├── page.tsx                            # Root redirect
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx                  # Recent matches, quick stats
│   ├── groups/
│   │   ├── page.tsx                        # Groups list
│   │   └── [id]/
│   │       ├── page.tsx                    # Group detail (matches, rankings, members)
│   │       ├── rankings/page.tsx           # Detailed rankings + head-to-head
│   │       └── tournaments/
│   │           └── [tournamentId]/page.tsx # Tournament bracket / round-robin view
│   ├── profile/
│   │   ├── page.tsx                        # Own profile
│   │   └── [id]/page.tsx                   # Public profile (read-only)
│   └── social/page.tsx                     # Friends & friend requests
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── GoogleSignInButton.tsx
│   ├── dashboard/
│   │   └── RecentMatches.tsx
│   ├── groups/
│   │   ├── ComparisonBar.tsx               # Win-rate comparison visual
│   │   ├── GameList.tsx                    # Games available in group
│   │   ├── GroupDetailClient.tsx           # Client shell for group detail page
│   │   ├── GroupDetails.tsx                # Group metadata display
│   │   ├── GroupSettingsModal.tsx          # Edit name, avatar, manage members
│   │   ├── GroupsClient.tsx                # Groups list client
│   │   ├── HeadToHeadCard.tsx              # Head-to-head stats widget
│   │   ├── InviteMemberModal.tsx
│   │   ├── MatchHistoryFeed.tsx
│   │   ├── MemberRankings.tsx              # Compact leaderboard row
│   │   ├── RankingsPageClient.tsx          # Full rankings page with analytics
│   │   └── tournaments/
│   │       ├── BracketView.tsx             # Single-elimination bracket
│   │       ├── CreateTournamentModal.tsx   # Format, teams, prize pool config
│   │       ├── ResolveMatchModal.tsx       # Set winner for a match
│   │       ├── RoundRobinView.tsx          # Round-robin fixture table
│   │       ├── TournamentDetailClient.tsx  # Tournament page shell
│   │       ├── TournamentMatchCard.tsx     # Individual match card
│   │       └── TournamentSection.tsx       # Tournament list + create CTA
│   ├── layout/
│   │   ├── MatchModal.tsx                  # Record a new match (multi-player)
│   │   ├── MobileBottomNav.tsx
│   │   ├── Navbar.tsx
│   │   ├── NavigationShell.tsx             # Sidebar + mobile nav wrapper
│   │   └── SideNavBar.tsx
│   ├── social/
│   │   ├── FriendsList.tsx
│   │   ├── PendingRequests.tsx
│   │   ├── SocialManager.tsx               # Main social page coordinator
│   │   └── UserSearch.tsx
│   ├── ui/
│   │   ├── GameCombobox.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── ParticipantMultiSelect.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ToastContainer.tsx              # Global toast notification renderer
│   ├── user/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfilePageClient.tsx
│   │   └── UserAvatar.tsx
│   └── providers/
│       ├── I18nProvider.tsx
│       ├── NextAuthProvider.tsx
│       └── ThemeProvider.tsx
│
├── hooks/
│   └── domain/
│       ├── useAuth.ts
│       ├── useGames.ts
│       ├── useGroups.ts
│       ├── useMatches.ts
│       ├── useRankings.ts
│       ├── useAnalytics.ts                 # Pure client analytics (no service call)
│       ├── useSocial.ts
│       └── useAppI18n.ts
│
├── services/
│   ├── axiosInstance.ts
│   ├── authService.ts
│   ├── gamesService.ts
│   ├── groupService.ts
│   ├── matchesService.ts
│   ├── rankingsService.ts
│   ├── socialService.ts
│   ├── tournamentService.ts
│   ├── userService.ts
│   └── i18nService.ts
│
├── store/
│   ├── useAuthStore.ts
│   ├── useGamesStore.ts
│   ├── useGroupsStore.ts
│   ├── useMatchesStore.ts
│   ├── useRankingsStore.ts
│   ├── useSocialStore.ts
│   └── useToastStore.ts
│
├── lib/
│   ├── actions/                            # Server Actions (Server Components only)
│   │   ├── auth.ts
│   │   ├── friends.ts
│   │   ├── games.ts
│   │   ├── groups.ts
│   │   ├── locale.ts
│   │   ├── matches.ts
│   │   └── users.ts
│   ├── engine/                             # Pure business logic — no React, no HTTP
│   │   ├── ranking.ts                      # Point-delta computation, rank assignment
│   │   └── achievements.ts                # Achievement unlock conditions
│   ├── utils/
│   │   └── tournamentGenerator.ts          # Bracket & round-robin schedule builders
│   ├── i18n/
│   │   ├── index.ts
│   │   └── dictionaries/
│   │       ├── en.ts
│   │       └── es.ts
│   ├── auth/
│   │   ├── config.ts                       # NextAuth configuration
│   │   └── session.ts                      # Session helpers
│   └── store/index.ts                      # In-memory mock database (dev/mock only)
│
└── types/index.ts                          # All shared TypeScript interfaces & unions
```

---

## 4. Data Flow Examples

### 4a — Recording a Match

```
1. USER EVENT
   MatchModal.tsx (UI Layer)
   └─ User submits form
   └─ Calls: const { recordMatch } = useMatches()
              await recordMatch(gameId, groupId, participants)

2. DOMAIN HOOK  src/hooks/domain/useMatches.ts
   └─ Sets isSubmitting = true in useMatchesStore
   └─ Calls: await matchesService.createMatch(gameId, groupId, participants)

3. SERVICE ADAPTER  src/services/matchesService.ts
   └─ Builds POST /matches request via axiosInstance
   └─ Returns: Promise<void>

4. BACK IN DOMAIN HOOK
   └─ Sets isSubmitting = false
   └─ Caller optionally reloads rankings via useRankings.loadRankings(groupId)

5. REACTIVE RE-RENDER
   MemberRankings.tsx, MatchHistoryFeed.tsx
   └─ Reading from useMatches() / useRankings()
   └─ Zustand notifies → components re-render with new data
```

### 4b — Resolving a Tournament Match

```
1. USER EVENT
   ResolveMatchModal.tsx (UI Layer)
   └─ Admin selects winner, submits
   └─ Calls: tournamentService.resolveTournamentMatch(tournamentId, matchId, winnerTeamId)

2. SERVICE ADAPTER  src/services/tournamentService.ts
   └─ Builds POST /tournaments/:id/matches/:matchId/resolve
   └─ Returns: Promise<void>

3. TournamentDetailClient.tsx
   └─ Reloads tournament via tournamentService.getTournamentById(id)
   └─ Backend auto-advances winner into next round slot (or marks tournament complete)
   └─ Updated Tournament object triggers re-render of BracketView / RoundRobinView
```

### 4c — Social: Sending a Friend Request

```
1. USER EVENT
   UserSearch.tsx
   └─ User clicks "Add Friend"
   └─ Calls: const { sendReq } = useSocial()
              await sendReq(currentUserId, targetUserId)

2. DOMAIN HOOK  src/hooks/domain/useSocial.ts
   └─ Calls: await socialService.sendFriendRequest(fromUserId, toUserId)
   └─ On success: setSentRequests([...sentRequests, newRequest])

3. SERVICE ADAPTER  src/services/socialService.ts
   └─ Builds POST /social/requests
   └─ Returns: Promise<FriendRequestWithUser>
```

---

## 5. State Management Contract

### Rules for Zustand Stores

```typescript
// ✅ CORRECT — store slice pattern
interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  memberUsers: User[];
  isLoading: boolean;
  error: string | null;
  // Setters are fine-grained and atomic
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;
  setMemberUsers: (users: User[]) => void;
  addMemberToCurrentGroup: (user: User) => void;
  updateCurrentGroup: (group: Group) => void;
  removeMemberUser: (userId: string) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}
```

- Stores are **write-only from domain hooks** — UI components never call store setters
- No derived/computed state in the store — compute it in the hook or with `useMemo`
- Stores do not call services — that direction is forbidden
- One store per domain, never one mega-store

### Toast Store (Cross-Cutting)

`useToastStore` is the single exception to the "domain-only" rule. It is used directly by `axiosInstance` to surface backend errors without going through a domain hook.

```typescript
interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
  exiting: boolean; // true during the exit animation (280 ms before removal)
}
```

Toasts are auto-dismissed at 3 000 ms. `ToastContainer` renders them globally in the root layout.

### Reading State in Components

```typescript
// ✅ Via domain hook (correct)
const { groups, isLoading } = useGroups();

// ❌ Direct store access in component (forbidden)
const groups = useGroupsStore((s) => s.groups);
```

---

## 6. Service Layer & API Contract

### 6.1 `axiosInstance.ts` Configuration

```typescript
// Production base URL — MUST be 'apps'. The legacy alias 'APIM-PRD-GS' is
// permanently retired and must never appear in any new code or documentation.
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://apps/api'
    : 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

**Request interceptor:** Reserved for attaching `Authorization: Bearer <token>` headers once token-based auth is in place.

**Response interceptor — `ApiResponse<T>` envelope unwrapper:**

Every backend response **must** follow this envelope:

```typescript
interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: string | null;    // populated only when isSuccess === false
  timestamp: string;       // ISO 8601
}
```

The interceptor transparently unwraps `data` so that all service functions receive `T` directly. If `isSuccess` is `false`, the error message is piped to `useToastStore` and the promise is rejected.

**Error handling:**
- `401` — clears `useAuthStore` and redirects to `/login`
- `5xx` / network error — fires a `'Backend unavailable'` toast

---

### 6.2 Standard Response Envelope Examples

```json
// ✅ Success
{
  "isSuccess": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-05-14T12:00:00Z"
}

// ❌ Error
{
  "isSuccess": false,
  "data": null,
  "error": "Group not found",
  "timestamp": "2026-05-14T12:00:05Z"
}
```

---

### 6.3 Current Status: Mock Mode

All services currently resolve against the in-memory mock store at `src/lib/store/index.ts` with an artificial 300 ms delay to simulate network latency.

**To connect to a real backend:** Replace the mock body in each service function with the corresponding `axiosInstance` call. The domain hook and UI layers require **zero changes** — this is the hexagonal architecture's primary payoff.

---

### 6.4 Auth — `/auth`

```typescript
// POST /auth/login
// Request body:
{ email: string; password: string }
// Response: ApiResponse<{ user: User }>

// POST /auth/register
// Request body:
{ name: string; email: string; password: string }
// Response: ApiResponse<{ user: User }>

// POST /auth/logout
// Response: ApiResponse<void>

// POST /auth/google     (OAuth callback — handled by NextAuth)
// Response: redirect to /dashboard
```

---

### 6.5 Users — `/users`

```typescript
// PUT /users/:id
// Request body:
{ name: string; bio?: string }
// Response: ApiResponse<User>
```

**`User` shape:**

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  alias: string;
  image?: string;
  bio?: string;
  friends: string[];       // array of friend user IDs
  profile: UserProfile;
}

interface UserProfile {
  stats: UserStats;
  achievements: Achievement[];
}

interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;         // 0.0–1.0
  currentStreak: number;
  bestStreak: number;
  rankingPoints: number;
}

interface Achievement {
  id: 'first_win' | 'win_streak_3' | 'win_streak_5' | 'veteran_10';
  name: string;
  description: string;
  unlockedAt: Date;        // ISO 8601 string on the wire
}
```

---

### 6.6 Games — `/games`

```typescript
// GET /games
// Response: ApiResponse<Game[]>
```

**`Game` shape:**

```typescript
interface Game {
  id: string;
  name: string;
  type: 'Board' | 'eSport' | 'Sports';
  scoring_type: 'points' | 'time' | 'elimination';
  group_id?: string;       // null = global catalogue game
}
```

---

### 6.7 Groups — `/groups`

```typescript
// GET /groups?userId=:id
// Response: ApiResponse<Group[]>

// GET /groups/:id
// Response: ApiResponse<Group>

// GET /groups/:id/members               (activeOnly = false by default)
// GET /groups/:id/members?activeOnly=true
// Response: ApiResponse<User[]>

// POST /groups
// Request body:
{ name: string; adminId: string }
// Response: ApiResponse<Group>

// PUT /groups/:id
// Request body:
{ name: string; avatarUrl?: string }
// Response: ApiResponse<Group>

// POST /groups/:id/members
// Request body:
{ userId: string }
// Response: ApiResponse<Group>

// PUT /groups/:id/members/:userId/role
// Request body:
{ role: 'admin' | 'maintainer' | 'member' }
// Response: ApiResponse<Group>

// DELETE /groups/:id/members/:userId
// Response: ApiResponse<Group>
```

**`Group` shape:**

```typescript
interface Group {
  id: string;
  name: string;
  groupTag: string;
  avatarUrl?: string;
  members: GroupMember[];
  game_ids: string[];
  createdAt: Date;         // ISO 8601 string on the wire
}

interface GroupMember {
  userId: string;
  role: 'admin' | 'maintainer' | 'member';
  joinedAt: string;        // ISO 8601
  isActive: boolean;
}
```

---

### 6.8 Matches — `/matches`

```typescript
// POST /matches
// Request body:
{
  gameId: string;
  groupId?: string;
  participants: Array<{
    userId: string;
    placement: number;   // 1 = first place
    score?: number;
  }>;
}
// Response: ApiResponse<void>
// Side-effect on backend: update UserStats (wins, losses, winRate, rankingPoints, streak),
//                          unlock achievements, persist match record.

// GET /matches?groupId=:id
// Response: ApiResponse<MatchDetail[]>

// GET /matches?userId=:id&limit=:n    (default limit: 10)
// Response: ApiResponse<MatchDetail[]>
```

**`MatchDetail` shape** (enriched read model returned by GET endpoints):

```typescript
interface MatchDetail {
  id: string;
  group_id?: string;
  game_id: string;
  gameName: string;         // denormalized from Game
  gameType?: 'Board' | 'eSport' | 'Sports';
  groupName?: string;       // denormalized from Group (only in user recent-matches response)
  participants: MatchParticipantDetail[];
  date: Date;               // ISO 8601 string on the wire
  comments?: string;
  tournamentId?: string;    // present only for tournament-linked matches
}

interface MatchParticipantDetail {
  userId: string;
  name: string;             // denormalized from User
  placement: number;
  score?: number;
}
```

---

### 6.9 Rankings — `/rankings`

```typescript
// GET /rankings?groupId=:id
// Response: ApiResponse<RankedMember[]>
// Items are sorted by rankingPoints descending.
```

**`RankedMember` shape:**

```typescript
interface RankedMember {
  userId: string;
  name: string;
  alias: string;
  image?: string;
  isActive: boolean;
  stats: MemberStats;
}

interface MemberStats {
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;          // 0.0–1.0
  points: number;           // rankingPoints
  streak: number;           // currentStreak (positive = wins, 0 = broken)
}
```

---

### 6.10 Social — `/social`

```typescript
// GET /social/friends?userId=:id
// Response: ApiResponse<FriendUser[]>

// GET /social/requests/incoming?userId=:id
// Response: ApiResponse<FriendRequestWithUser[]>

// GET /social/requests/sent?userId=:id
// Response: ApiResponse<FriendRequestWithUser[]>

// GET /social/search?q=:query&excludeUserId=:currentUserId
// Response: ApiResponse<User[]>
// Searches by name, alias, or email. Excludes the requesting user and existing friends.

// POST /social/requests
// Request body:
{ fromUserId: string; toUserId: string }
// Response: ApiResponse<FriendRequestWithUser>

// POST /social/requests/:id/accept
// Response: ApiResponse<void>
// Side-effect: both users' `friends` arrays updated.

// POST /social/requests/:id/reject
// Response: ApiResponse<void>

// DELETE /social/requests/:id
// Response: ApiResponse<void>    (used to cancel an outgoing request)
```

**Social shapes:**

```typescript
interface FriendUser {
  id: string;
  name: string;
  email: string;
  alias: string;
}

interface FriendRequestWithUser {
  id: string;                         // Friendship / request ID
  user: {
    id: string;
    name: string;
    email: string;
    alias: string;
  };
}

type FriendshipStatus = 'pending' | 'accepted';

interface Friendship {
  id: string;
  fromId: string;
  toId: string;
  status: FriendshipStatus;
}
```

---

### 6.11 Tournaments — `/tournaments`

```typescript
// GET /tournaments?groupId=:id
// Response: ApiResponse<Tournament[]>

// GET /tournaments/:id
// Response: ApiResponse<Tournament>

// POST /tournaments
// Request body (CreateTournamentPayload):
{
  groupId: string;
  gameId: string;
  name: string;
  format: 'bracket' | 'round_robin';
  teams: TournamentTeam[];
  bonusPoints: { first: number; second: number; third: number };
  prizePool?: {
    total: number;
    currency: string;
    distribution: { first: number; second: number; third: number };
  };
}
// Response: ApiResponse<{ id: string }>
// Side-effect on backend: generate rounds and match schedule from `teams` list
//   using the same algorithm as src/lib/utils/tournamentGenerator.ts.

// PUT /tournaments/:id/status
// Request body:
{ status: 'draft' | 'in_progress' | 'completed' }
// Response: ApiResponse<void>

// POST /tournaments/:id/matches/:matchId/resolve
// Request body:
{
  winnerTeamId: string;
  referenceMatchId?: string;  // ID of the next-round match slot to advance the winner into
}
// Response: ApiResponse<void>
// Side-effect on backend: mark match as completed, advance winner to next round slot.

// POST /tournaments/:id/finalize
// Response: ApiResponse<void>
// Side-effect: award bonusPoints and prizePool distribution to winning teams.

// DELETE /tournaments/:id
// Response: ApiResponse<void>
```

**Tournament shapes:**

```typescript
type TournamentFormat = 'bracket' | 'round_robin';
type TournamentStatus = 'draft' | 'in_progress' | 'completed';
type TournamentMatchStatus = 'pending' | 'completed';

interface Tournament {
  id: string;
  groupId: string;
  gameId: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  teams: TournamentTeam[];
  rounds: TournamentRound[];
  bonusPoints: {
    first: number;
    second: number;
    third: number;
  };
  prizePool?: TournamentPrizePool;
  createdAt: string;    // ISO 8601
  completedAt?: string; // ISO 8601, set by finalize
}

interface TournamentTeam {
  id: string;
  name: string;
  playerIds: string[];
}

interface TournamentRound {
  id: number;           // 1-based round index
  name: string;         // e.g. "Final", "Semifinales", "Fecha 1"
  matches: TournamentMatch[];
}

interface TournamentMatch {
  id: string;
  roundId: number;
  matchNumber: number;
  teamAId: string | null;    // null = TBD slot (bracket) or bye (round-robin)
  teamBId: string | null;
  status: TournamentMatchStatus;
  winnerTeamId?: string;
  referenceMatchId?: string; // next-round match this winner feeds into
}

interface TournamentPrizePool {
  total: number;
  currency: string;          // ISO 4217 code, e.g. "USD", "ARS"
  distribution: {
    first: number;            // percentage 0–100
    second: number;
    third: number;
  };
}
```

---

## 7. Business Logic Engine

All ranking and achievement logic lives in `src/lib/engine/` as pure TypeScript functions with no React or HTTP dependencies.

### 7.1 Ranking — `src/lib/engine/ranking.ts`

| Constant | Value | Purpose |
|---|---|---|
| `WIN_POINTS` | `25` | Points awarded to 1st place |
| `MAX_LOSS_POINTS` | `15` | Max points deducted from last place |

```typescript
// Assign placement ranks to players sorted by score descending.
// Tied scores share the same rank.
function rankPlayers(players: Array<{ user_id: string; score: number }>): MatchPlayer[]

// Compute the point delta for a given placement.
//   rank 1   → +25
//   last     → proportional negative (up to -15)
//   single player match → 0 delta
function computePointsDelta(rank: number, totalPlayers: number): number

// Return the user_id of the player with rank === 1.
function determineWinner(players: MatchPlayer[]): string
```

**Delta formula:**
```
factor = (rank - 1) / (totalPlayers - 1)
delta  = rank === 1 ? WIN_POINTS : -round(factor * MAX_LOSS_POINTS)
```

### 7.2 Achievements — `src/lib/engine/achievements.ts`

Unlock conditions are evaluated server-side after every match. The frontend only renders achievement badges; it does not compute unlocks itself.

| Achievement ID | Trigger |
|---|---|
| `first_win` | `stats.wins >= 1` |
| `win_streak_3` | `stats.currentStreak >= 3` |
| `win_streak_5` | `stats.currentStreak >= 5` |
| `veteran_10` | `stats.totalMatches >= 10` |

### 7.3 Tournament Generator — `src/lib/utils/tournamentGenerator.ts`

The frontend generates the round/match schedule locally when creating a tournament (mock mode). The backend **must** reproduce the same schedule logic upon receiving the `POST /tournaments` payload.

**`generateBracket(teams)`:**
- Single-elimination format
- Teams are randomly seeded (shuffled)
- Total rounds = `⌈log₂(teams.length)⌉`
- Odd-count teams: the first unmatched team receives a bye (a match with `teamBId: null`). The frontend skips null-team matches in the UI.
- Subsequent rounds are pre-generated as TBD slots (`teamAId: null, teamBId: null`) so `resolveTournamentMatch` has a target slot to populate.

**`generateRoundRobin(teams)`:**
- Circle method: one fixed pivot + rotating elements
- Odd-count teams: a null dummy is appended to make the count even. Pairings involving the null dummy are skipped (bye week for the real team).
- Total rounds = `N - 1` (where N is the even-padded team count)
- Round names: `"Fecha 1"`, `"Fecha 2"`, …

---

## 8. UI/UX Semantic Token System

RankingBoard uses a **global semantic token system** (AWS-inspired premium dark theme). All color and surface references in components use semantic class names rather than hardcoded palette values.

### 8.1 Theme Architecture

- **Engine:** `next-themes` with `attribute="class"` and `defaultTheme="dark"`
- **CSS layer:** Tailwind CSS v4 with custom `@theme` tokens defined in the global stylesheet
- **Token scope:** All tokens are CSS custom properties (`--color-*`, `--surface-*`, etc.) redefined per theme class

The backend has **no responsibility** for theme state beyond storing the user's preferred theme string (e.g., `"dark"` or `"light"`) on the `User` object or as a cookie. The frontend resolves all visual output client-side.

### 8.2 Semantic Layer (frontend-only)

Tokens are grouped into semantic categories so that swapping themes requires changing only the CSS variable definitions, not component markup:

| Token Category | Examples | Purpose |
|---|---|---|
| `surface-*` | `surface-page`, `surface-card`, `surface-overlay` | Background layers |
| `border-*` | `border-subtle`, `border-strong` | Dividers and outlines |
| `text-*` | `text-primary`, `text-secondary`, `text-muted` | Typography hierarchy |
| `accent-*` | `accent-primary`, `accent-hover` | Interactive elements, CTAs |
| `status-*` | `status-success`, `status-error`, `status-warning` | Feedback states |

Components reference tokens via Tailwind utility classes (e.g., `bg-surface-card`, `text-text-primary`, `border-border-subtle`). No raw hex or `zinc`/`amber`/`neutral` palette classes appear in component markup.

### 8.3 Toast Notification Contract

Global toasts are surfaced via `useToastStore`. The backend must include human-readable error messages in the `error` field of `ApiResponse<T>` — the frontend pipes them directly into the toast system without transformation.

```typescript
type ToastType = 'error' | 'success' | 'info';
```

---

## 9. Developer Guidelines & Anti-Patterns

### Strictly Forbidden

| Anti-Pattern | Why It Breaks the Architecture |
|---|---|
| `import { fetchGroups } from '@/services/groupService'` inside a component | Bypasses domain hook; loading and error state become unmanaged |
| `import { useGroupsStore } from '@/store/useGroupsStore'` inside a component | Couples UI directly to state shape; kills testability |
| `import { getGroups } from '@/lib/actions/groups'` inside a Client Component | Server Actions are for Server Components only; causes hydration issues |
| `const [matches, setMatches] = useState([])` for domain data | Duplicates source of truth; breaks reactivity across the component tree |
| Cross-domain hook imports (e.g., `useGroups` calling `useSocial`) | Introduces hidden coupling; domain hooks must be independently usable |
| Hardcoded color palette classes (e.g., `bg-zinc-900`, `text-amber-400`) | Bypasses semantic token system; breaks theme switching |
| Adding a new npm package without explicit approval | Keeps the bundle auditable and dependencies intentional |
| Using `APIM-PRD-GS` as a base URL or env var name | Retired alias — the PRD base URL is exclusively `apps` |

### Required Patterns

```typescript
// ✅ Component consuming domain hook
'use client';
import { useGroups } from '@/hooks/domain/useGroups';

export function GroupsClient() {
  const { groups, isLoading, createNewGroup } = useGroups();
  // render only — no async logic, no store imports
}

// ✅ Domain hook wiring service + store
export function useGroups() {
  const { groups, setGroups, setLoading } = useGroupsStore();

  const loadUserGroups = async (userId: string) => {
    setLoading(true);
    const data = await groupService.getUserGroups(userId);
    setGroups(data);
    setLoading(false);
  };

  return { groups, isLoading, loadUserGroups, ... };
}

// ✅ Service — pure async, no React, no Zustand
export async function getUserGroups(userId: string): Promise<Group[]> {
  const { data } = await axiosInstance.get(`/groups?userId=${userId}`);
  return data; // envelope already unwrapped by the response interceptor
}
```

### TypeScript

- All types and interfaces live in `src/types/index.ts`
- **No `any`** — use `unknown` + type narrowing when the shape is genuinely uncertain
- Domain hook return types must be explicitly typed
- Run `tsc --noEmit` before every commit

### Commits

Follow Conventional Commits scoped to the affected domain:

```
feat(tournaments): add prize pool configuration to create modal
fix(rankings): correct head-to-head tie detection
refactor(social): migrate friend request state to useSocialStore
```
