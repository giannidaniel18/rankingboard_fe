# RankingBoard — Frontend Architecture

> Hexagonal Architecture (Ports & Adapters) on Next.js App Router.  
> Every layer has a single responsibility. Crossing layer boundaries in the wrong direction is forbidden.

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Layer Definitions](#2-layer-definitions)
3. [Core Domains & File Map](#3-core-domains--file-map)
4. [Data Flow Example — Recording a Match](#4-data-flow-example--recording-a-match)
5. [State Management Contract](#5-state-management-contract)
6. [Service Layer & API Configuration](#6-service-layer--api-configuration)
7. [Developer Guidelines & Anti-Patterns](#7-developer-guidelines--anti-patterns)

---

## 1. Architectural Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI LAYER                             │
│           src/app/  ·  src/components/                      │
│   "Dumb" components — consume data, emit user events        │
└─────────────────────┬───────────────────────────────────────┘
                      │  calls (custom hooks only)
┌─────────────────────▼───────────────────────────────────────┐
│                   DOMAIN HOOKS LAYER                        │
│                  src/hooks/domain/                          │
│   Orchestrators — business logic, async ops, store writes   │
└──────────┬──────────────────────────┬───────────────────────┘
           │  reads/writes            │  calls
┌──────────▼──────────┐   ┌──────────▼───────────────────────┐
│   STATE LAYER       │   │       SERVICE LAYER               │
│   src/store/        │   │       src/services/               │
│   Zustand slices    │   │   HTTP adapters — axios wrappers  │
│   (reactive global  │   │   Today: mock · Tomorrow: real API│
│    state)           │   └───────────────────────────────────┘
└─────────────────────┘
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
- Manage purely visual local state (e.g., tooltip open/close, hover, animation)

**Hard constraints:**
- No `import` from `src/services/`
- No `import` from `src/store/`
- No `import` from `src/lib/actions/` (Server Actions) inside Client Components
- No direct `fetch()` or `axios` calls
- No domain state duplicated in `useState`

---

### Layer 2 — Domain Hooks (`src/hooks/domain/`)

The **single entry point** for the UI to interact with business data. Each hook encapsulates all logic for its domain: calling services, updating the store, and exposing a clean async API.

**Responsibilities:**
- Orchestrate calls to the service layer
- Write results into the corresponding Zustand store
- Expose `loading`, `error`, and `data` derived from the store
- Contain all business-level conditional logic

**Hard constraints:**
- Must not contain JSX
- Must not be imported by other domain hooks (flat graph, no cross-domain coupling)
- Must not expose raw store setters to components

**Files:**

| Hook | Domain |
|---|---|
| `useAuth.ts` | Authentication & session |
| `useGames.ts` | Game catalogue |
| `useGroups.ts` | Group CRUD & membership |
| `useMatches.ts` | Match recording & history |
| `useRankings.ts` | Leaderboard computation |
| `useSocial.ts` | Friends & friend requests |
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
| `useAuthStore.ts` | `currentUser`, `isAuthenticated` |
| `useGamesStore.ts` | `games`, `isLoading` |
| `useGroupsStore.ts` | `groups`, `currentGroup`, `members`, `isLoading`, `error` |
| `useMatchesStore.ts` | `matchesByGroup`, `recentMatches`, `isSubmitting` |
| `useRankingsStore.ts` | `rankingsByGroup` |
| `useSocialStore.ts` | `friends`, `incomingRequests`, `sentRequests`, `searchResults`, `isLoading` |

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
| `axiosInstance.ts` | Base Axios instance — interceptors, base URL |
| `authService.ts` | `/auth` — login, register, OAuth sync |
| `groupService.ts` | `/groups` — CRUD + membership |
| `gamesService.ts` | `/games` — catalogue |
| `matchesService.ts` | `/matches` — record, history |
| `rankingsService.ts` | `/rankings` — compute leaderboard |
| `socialService.ts` | `/social` — friends, requests, search |
| `userService.ts` | `/users` — profile update |
| `i18nService.ts` | Locale persistence |

---

## 3. Core Domains & File Map

```
src/
├── app/                          # Next.js App Router — pages & layouts
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   ├── dashboard/page.tsx
│   ├── groups/page.tsx
│   ├── groups/[id]/page.tsx
│   ├── profile/page.tsx
│   ├── social/page.tsx
│   └── layout.tsx
│
├── components/                   # Pure presentational components
│   ├── auth/                     # LoginForm, RegisterForm, GoogleSignInButton
│   ├── dashboard/                # RecentMatches
│   ├── groups/                   # GroupsClient, GroupDetails, MemberRankings,
│   │                             # MatchHistoryFeed, InviteMemberModal
│   ├── layout/                   # Navbar, SideNavBar, MobileBottomNav,
│   │                             # NavigationShell, MatchModal
│   ├── social/                   # FriendsList, PendingRequests,
│   │                             # SocialManager, UserSearch
│   ├── ui/                       # ThemeToggle, GameCombobox,
│   │                             # ParticipantMultiSelect, LanguageToggle
│   ├── user/                     # UserAvatar, ProfileCard
│   └── providers/                # NextAuthProvider, ThemeProvider, I18nProvider
│
├── hooks/
│   └── domain/                   # ← All business-logic hooks live here
│       ├── useAuth.ts
│       ├── useGames.ts
│       ├── useGroups.ts
│       ├── useMatches.ts
│       ├── useRankings.ts
│       ├── useSocial.ts
│       └── useAppI18n.ts
│
├── services/                     # ← HTTP adapters — import only in domain hooks
│   ├── axiosInstance.ts
│   ├── authService.ts
│   ├── gamesService.ts
│   ├── groupService.ts
│   ├── matchesService.ts
│   ├── rankingsService.ts
│   ├── socialService.ts
│   ├── userService.ts
│   └── i18nService.ts
│
├── store/                        # ← Zustand slices — written only by domain hooks
│   ├── useAuthStore.ts
│   ├── useGamesStore.ts
│   ├── useGroupsStore.ts
│   ├── useMatchesStore.ts
│   ├── useRankingsStore.ts
│   └── useSocialStore.ts
│
├── lib/
│   ├── actions/                  # Server Actions (called from Server Components only)
│   │   ├── auth.ts  groups.ts  matches.ts  friends.ts  games.ts  users.ts  locale.ts
│   ├── engine/                   # Pure business logic — no React, no HTTP
│   │   ├── ranking.ts            # ELO / point-based ranking algorithm
│   │   └── achievements.ts       # Achievement unlock conditions
│   ├── i18n/                     # Dictionary loader + locale types
│   │   └── dictionaries/en.ts  es.ts
│   ├── auth/                     # NextAuth config & session helpers
│   └── store/index.ts            # In-memory mock database (dev only)
│
└── types/index.ts                # All shared TypeScript interfaces & unions
```

---

## 4. Data Flow Example — Recording a Match

The following traces the exact path of the "Save Match" action from user click to UI re-render.

```
1. USER EVENT
   MatchModal.tsx (UI Layer)
   └─ User fills form and clicks "Save"
   └─ Calls: const { recordMatch } = useMatches()
              await recordMatch(formData)

2. DOMAIN HOOK
   src/hooks/domain/useMatches.ts
   └─ Validates / transforms formData
   └─ Sets isSubmitting = true in useMatchesStore
   └─ Calls: await matchesService.createMatch(payload)

3. SERVICE ADAPTER
   src/services/matchesService.ts
   └─ Builds POST /matches request via axiosInstance
   └─ (Currently: writes to lib/store + 300ms delay)
   └─ Returns: Promise<Match>

4. BACK IN DOMAIN HOOK
   src/hooks/domain/useMatches.ts
   └─ Calls useMatchesStore.addMatch(newMatch)
   └─ Calls useRankingsStore to trigger re-ranking (via useRankings)
   └─ Sets isSubmitting = false

5. REACTIVE RE-RENDER
   MemberRankings.tsx, MatchHistoryFeed.tsx (UI Layer)
   └─ Reading from useMatches() / useRankings()
   └─ Zustand notifies → components re-render with new data
```

**Key invariant:** `matchesService` never knows Zustand exists. `MatchModal` never knows the service exists. The domain hook is the only piece that knows both.

---

## 5. State Management Contract

### Rules for Zustand Stores

```typescript
// ✅ CORRECT — store slice pattern
interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  // Setters are fine-grained and atomic
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}
```

- Stores are **write-only from domain hooks** — UI components never call store setters
- No derived/computed state in the store — compute it in the hook or with `useMemo`
- Stores do not call services — that direction is forbidden
- One store per domain, never one mega-store

### Reading State in Components

```typescript
// ✅ Via domain hook (correct)
const { groups, isLoading } = useGroups();

// ❌ Direct store access in component (forbidden)
const groups = useGroupsStore((s) => s.groups);
```

---

## 6. Service Layer & API Configuration

### `axiosInstance.ts`

```typescript
// Base URL is always 'apps' for the PRD environment
const instance = axios.create({
  baseURL: 'apps',
  // ...
});
```

> **Critical:** The Production base URL is **`apps`**. The legacy name `APIM-PRD-GS` is retired and must never appear in new code.

### Current Status: Mock Mode

All services currently resolve against the in-memory mock store at `src/lib/store/index.ts` with an artificial 300 ms delay to simulate network latency.

```typescript
// Example pattern inside any service (matchesService.ts)
export async function createMatch(payload: CreateMatchPayload): Promise<Match> {
  await delay(300); // simulated network latency
  // write to lib/store ...
  return newMatch;
}
```

**To connect to a real backend:** Replace the mock body with `axiosInstance.post('/matches', payload)`. The domain hook and UI layers require **zero changes** — this is the hexagonal architecture's primary payoff.

### Service Anatomy

Each service file follows this contract:

```typescript
// src/services/groupService.ts

import axiosInstance from './axiosInstance';
import type { Group, CreateGroupPayload } from '@/types';

// One exported function per API operation
export async function fetchUserGroups(userId: string): Promise<Group[]> { ... }
export async function createGroup(payload: CreateGroupPayload): Promise<Group> { ... }
export async function addMember(groupId: string, userId: string): Promise<void> { ... }
```

---

## 7. Developer Guidelines & Anti-Patterns

### Strictly Forbidden

| Anti-Pattern | Why It Breaks the Architecture |
|---|---|
| `import { fetchGroups } from '@/services/groupService'` inside a component | Bypasses the domain hook; service errors and loading state become unmanaged |
| `import { useGroupsStore } from '@/store/useGroupsStore'` inside a component | Couples UI directly to state shape; kills testability |
| `import { getGroups } from '@/lib/actions/groups'` inside a Client Component | Server Actions are for Server Components only; mixing causes hydration issues |
| `const [matches, setMatches] = useState([])` for domain data in a component | Duplicates source of truth; breaks reactivity across the component tree |
| Cross-domain hook imports (e.g. `useGroups` calling `useSocial`) | Introduces hidden coupling; each domain hook must be independently usable |
| Adding a new npm package without explicit approval | Keeps the bundle auditable and dependencies intentional |

### Required Patterns

```typescript
// ✅ Component consuming domain hook
'use client';
import { useGroups } from '@/hooks/domain/useGroups';

export function GroupsClient() {
  const { groups, isLoading, createNewGroup } = useGroups();
  // render only — no async logic here
}

// ✅ Domain hook wiring service + store
export function useGroups() {
  const { groups, setGroups, setLoading } = useGroupsStore();

  const loadUserGroups = async (userId: string) => {
    setLoading(true);
    const data = await groupService.fetchUserGroups(userId);
    setGroups(data);
    setLoading(false);
  };

  return { groups, isLoading, loadUserGroups, createNewGroup, ... };
}

// ✅ Service — pure async, no React
export async function fetchUserGroups(userId: string): Promise<Group[]> {
  const { data } = await axiosInstance.get(`/groups?userId=${userId}`);
  return data;
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
feat(matches): add multi-player scoring support
fix(groups): resolve member deduplication on invite
refactor(auth): migrate session check to useAuth hook
```
