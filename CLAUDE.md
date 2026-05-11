@AGENTS.md
# RankingBoard - Project Rules

## Tech Stack
- **Frontend/Backend:** Next.js 16+ (App Router).
- **Language:** TypeScript (Strict mode).
- **Styling:** Tailwind CSS v4 — mobile-first, `dark:` classes everywhere.
- **Theming:** `next-themes` — default dark mode, class-based (`attribute="class"`).
- **I18n:** Dictionary-based (`src/lib/i18n/`). Locale stored in cookie.
- **State Management:** Zustand EXCLUSIVELY for global business state. Independent slices in `src/store/` (e.g., `useAuthStore.ts`). Forbidden to use Context for domain data. Zero prop drilling.
- **HTTP / Fetching:** Axios. Configured through a base instance in `src/services/axiosInstance.ts` (global interceptors and headers handling). 
  - *Infrastructure Note:* The Base URL for the Production (PRD) environment is `apps` (replaces the old APIM-PRD-GS nomenclature).
- **Forms:** React Hook Form for form handling and validation.

## Architecture and Folder Structure (Hexagonal)
Strict structure to separate UI, Business Logic, and External Services:
```
src/
  app/           ← Pages and layouts (Next.js App Router)
  components/    ← Pure UI components (No logic)
  hooks/
    domain/      ← Business logic (e.g., useGroups.ts)
    infra/       ← Reusable primitives (e.g., useLocalStorage.ts)
    ui/          ← Visual behavior (e.g., useModal.ts)
  services/      ← Isolated HTTP calls (axiosInstance.ts, authService.ts)
  store/         ← Zustand slices by concept
  types/         ← Unique and shared interfaces and types
```

## Code Style & Rules
- **DRY & Clean:** Prioritize reusable components and logic.
- **Naming:** PascalCase for components, camelCase for functions/variables.
- **Type Safety:** Always define interfaces in `src/types/index.ts`. No `any`.
- **API Pattern:** Use `src/lib/actions` for server-side logic (Server Actions).
- **UI:** Minimalist, dark-mode first. Mobile-first layouts (`flex-col` → `md:flex-row`). Sidebar hidden on mobile (`hidden md:flex`), `MobileNav` shown instead (`flex md:hidden`). Tables wrapped in `overflow-x-auto` with `min-w-*` column constraints.
- **Tone:** Concise technical responses. Skip greetings or long explanations.

## Domain Models
- **User:** Auth, profile stats, achievements.
- **Group:** Management of members and their associated games.
- **Game:** Definition of game types and scoring logic.
- **Match:** The core record of a session (Players, scores, winner, date).
- **Ranking:** Dynamic calculation based on Match history.

## Data & API Abstraction
- **API-first mindset:** All entities, constants, and data mocks must be defined assuming they will eventually be replaced by an external API response. Never hardcode data directly into components, hooks, or services.
- **Decoupled layers:** Components, hooks, services, and utility functions must be abstract from the data source. They should receive data via props, hook return values, or service calls — never import mocks or constants directly.
- **Service layer:** Data fetching and transformation logic lives in `src/lib/actions` or a dedicated `src/lib/services` layer. Components never fetch or transform data themselves.
- **Mock shape parity:** Mocks and constants must mirror the exact shape of the expected API response so that swapping to a real API requires zero changes in consumers.

## Skills
- **UI Design:** Always invoke the `frontend-design` skill when designing or implementing any layout, component, view, or UI-related element.

## Development Workflow
- **Validation:** Always run `tsc --noEmit` before finishing a task to ensure strict type safety across the hexagonal layers.
- **Git:** Use descriptive Conventional Commits (e.g., "feat(groups): implement domain hooks" or "refactor(matches): migrate to zustand store").
- **Dependencies:** Ask for explicit approval before adding any new npm packages.
- **UI Design:** Apply a minimalist, dark-mode first, and mobile-first approach. Always invoke the `frontend-design` skill when designing or implementing any layout, component, view, or UI-related element.