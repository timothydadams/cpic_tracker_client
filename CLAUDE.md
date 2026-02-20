# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React frontend client for CPIC Tracker — an MVP for tracking a town's comprehensive plan implementation progress. Strategies are assigned to implementers, organized under focus areas/policies, and tracked with status, timelines, comments, and metrics.

## Commands

- `npm run dev` — Start Webpack dev server with hot reload (port 3000, proxies `/api/*` to `localhost:3500`)
- `npm run build` — Development build to `dist/`
- `npm run build-prod` — Production build (minified, tree-shaken)
- `npx vitest run` — Run all tests once
- `npx vitest run src/features/metrics/__tests__/` — Run tests for a specific directory
- `npx vitest` — Run tests in watch mode

**Important: NODE_ENV** — The shell environment has `NODE_ENV=production` set globally. This causes `npm install` and `npm uninstall` to skip devDependencies (which includes webpack, babel, etc.). Always prefix npm commands with `NODE_ENV=development`:

```bash
NODE_ENV=development npm install <package> --save-dev
NODE_ENV=development npm uninstall <package>
NODE_ENV=development npm install   # restore all deps
```

## Commit Conventions

Husky pre-commit runs Prettier via lint-staged on all staged files. Commits are validated by commitlint with conventional commit format (`feat:`, `fix:`, `refactor:`, `chore:`, etc.).

## Architecture

**Stack:** React 18 (JSX, no TypeScript) + Webpack 5 + Babel + Tailwind CSS 4

**State management:** Redux Toolkit with RTK Query. The store (`src/app/store.js`) has slices for `auth`, `strategy`, `user`, `implementers`, plus the RTK Query `api` reducer. Selectors use `createSelector` for memoization. RTK Query endpoints use `keepUnusedDataFor` to retain cached data (3600s for static lookups like statuses/timeline options, 600s for entity lists).

**Feature module pattern:** Each feature in `src/features/` has:

- `*Slice.js` — Redux state slice (local state, memoized selectors via `createSelector`, actions)
- `*ApiSlice.js` — RTK Query endpoint definitions injected into the base API (`src/app/api/apiSlice.js`)
- Component files — UI for that feature

Feature domains: `auth`, `strategies`, `users`, `implementers`, `focus_areas`, `policies`, `comments`, `invites`, `metrics`, `faq`, `maps`, `weather`.

**API layer:** RTK Query with `fetchBaseQuery`. Base URL is `localhost:3500/api` in dev, `process.env.API_URL` in production. Includes automatic 401 → token refresh → retry logic in `baseQueryWithReauth`. Cache tag types: `FocusArea`, `Policy`, `Implementer`, `Strategy`, `Comment`, `Invite`.

**Routing:** React Router v6 with nested routes in `src/Routes.js`. All route components are lazy-loaded via `React.lazy()` with a shared `PageLoader` Suspense fallback. Since components use named exports, the lazy imports use `.then(m => ({ default: m.NamedExport }))`. Routes are wrapped in `PersistAuth` for session persistence. Protected routes use `ProtectRoute` (role-gated) and `AnonymousOnly` (login/register pages). The `/metrics` route uses nested child routes (`/metrics/overview`, `/metrics/focus-areas`, `/metrics/timelines`, `/metrics/implementers`) with a shared layout shell (`MetricsPage`) rendering `<Outlet />`.

**Roles:** Guest, Viewer, Implementer, CPIC Member, CPIC Admin, Admin. Role checks happen in `ProtectRoute` with an `allowedRoles` prop.

**Auth:** JWT tokens stored in Redux (not localStorage). Multiple auth methods: email/password, passkeys (WebAuthn via `@simplewebauthn/browser`), Google OAuth. Token refresh uses a `persist` duration value from localStorage.

**Forms:** React Hook Form with Yup (and some Zod) validation via `@hookform/resolvers`.

**UI components:** Three tiers:

- `src/components/ui/` — Radix UI primitives (shadcn-style)
- `src/components/catalyst/` — Higher-level design system components
- `src/components/` — App-specific shared components (DataTable, Multiselect, layout)

**Loading indicators** (`src/components/Spinners.js`):

- `Dots` — Pulsing dots animation, used for data-loading states (API fetches, list loading)
- `Spinner` — Loader2Icon spinner, used inside buttons for form submission states
- `PageLoader` — Defined in `Routes.js`, used as the `Suspense` fallback for lazy-loaded routes

**Performance patterns:**

- Route-level code splitting via `React.lazy()` + `Suspense` in `Routes.js`
- Webpack `splitChunks` separates vendor and common chunks in production builds
- `React.memo` on list-rendered components (e.g., `StrategyCard`, `StrategyCardMenu`, `CommentEntry`)
- `HybridTooltipProvider` wraps at the table level, not per-cell, to avoid provider proliferation
- `selectFromResult` on all RTK Query hooks to limit re-renders to only the destructured fields (prevents re-renders from internal metadata changes)

## Path Aliases

Configured in both `webpack.config.js` and `jsconfig.json`:

| Alias        | Path                       |
| ------------ | -------------------------- |
| `@/*`        | `src/*`                    |
| `components` | `src/components/`          |
| `features`   | `src/features/`            |
| `hooks`      | `src/Hooks/`               |
| `catalyst`   | `src/components/catalyst/` |
| `utils`      | `src/utils/`               |
| `ui`         | `src/components/ui/`       |
| `assets`     | `src/assets/`              |
| `lib`        | `src/lib/`                 |

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for the full backend API documentation.

## Environment Variables

See `.env-example`. Key vars: `GOOGLE_CLIENT_ID`, `NODE_ENV`, `API_URL`. In dev, Webpack uses `dotenv-webpack`; in production, values are injected via `DefinePlugin`.

## Formatting

Prettier: single quotes, JSX single quotes, trailing commas (es5), 2-space indent, 80 char width. Runs automatically on commit via lint-staged.

## Testing

**Stack:** Vitest + React Testing Library + MSW (Mock Service Worker)

- **Config:** `vitest.config.js` at project root, uses `jsdom` environment
- **Test utils:** `src/test/test-utils.jsx` — exports a custom `render` (aliased from `renderWithProviders`) that wraps components in `Provider` (Redux), `MemoryRouter`, and `SnackbarProvider`. Accepts `route` and `preloadedState` options.
- **MSW handlers:** `src/test/mocks/handlers.js` — mock API responses for all endpoints. Server setup in `src/test/mocks/server.js`, configured globally in `src/test/setup.js`.
- **Test location:** `src/features/<domain>/__tests__/` directories (e.g., `src/features/metrics/__tests__/`)
- **Auth presets:** `AUTH_STATES` object in test-utils provides preset auth states (`admin`, `cpicAdmin`, `cpicMember`, `implementer`, `viewer`, `guest`) for testing role-gated features.
- **Patterns:** Tests import `render`, `screen`, `waitFor` from `test-utils.jsx` (not directly from `@testing-library/react`). Use `waitFor` for async data loading. User interactions via `@testing-library/user-event`.

## Invites Feature

The invites feature (`src/features/invites/`) allows authenticated users to invite others via email or shareable link. It uses a two-mode UI with Radix Tabs:

- **Send Email** mode — `EmailInviteForm.js`: Dynamic email field array (`useFieldArray`) + role selector. Calls `POST /api/invites/send` which creates a code and emails recipients. `maxUses` is auto-set to `emails.length`.
- **Generate Link** mode — `ManualCodeForm.js`: Role selector + maxUses + expiresInDays fields. Calls `POST /api/invites/` and displays a copyable URL.

**Component structure:**

- `InviteUsersForm.js` — Parent component with Tabs, renders in the nav drawer via `navLists.js`
- `RoleSelector.js` — Shared role dropdown that filters options based on the invite hierarchy
- `ExistingCodeList.js` — Lists active invite codes with copy + resend actions
- `InviteCodeItem.js` — Single code display with copy-to-clipboard and resend toggle
- `ResendForm.js` — Inline form to resend an existing code to additional emails (`POST /api/invites/:code/send`)
- `CreateCodeForm.js` — Re-exports `InviteUsersForm` as `CreateCodeForm` for backward compatibility

**Invite role hierarchy** (enforced by both frontend `RoleSelector` and backend):

| User Role   | Can Invite                           |
| ----------- | ------------------------------------ |
| Admin       | All roles                            |
| CPIC Admin  | CPIC Admin, CPIC Member, Implementer |
| CPIC Member | CPIC Member, Implementer             |
| Implementer | Implementer only                     |

Role filtering uses a `ROLE_ALLOWLIST` map with `ROLE_PRIORITY` ordering, resolved via `useMemo` in `useFilteredRoles`.
