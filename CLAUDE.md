# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React frontend client for CPIC Tracker — an MVP for tracking a town's comprehensive plan implementation progress. Strategies are assigned to implementers, organized under focus areas/policies, and tracked with status, timelines, comments, and metrics.

## Commands

- `npm run dev` — Start Webpack dev server with hot reload (port 3000, proxies `/api/*` to `localhost:3500`)
- `npm run build` — Development build to `dist/`
- `npm run build-prod` — Production build (minified, tree-shaken)
- No test framework is configured yet

## Commit Conventions

Husky pre-commit runs Prettier via lint-staged on all staged files. Commits are validated by commitlint with conventional commit format (`feat:`, `fix:`, `refactor:`, `chore:`, etc.).

## Architecture

**Stack:** React 18 (JSX, no TypeScript) + Webpack 5 + Babel + Tailwind CSS 4

**State management:** Redux Toolkit with RTK Query. The store (`src/app/store.js`) has slices for `auth`, `strategy`, `user`, `implementers`, plus the RTK Query `api` reducer.

**Feature module pattern:** Each feature in `src/features/` has:

- `*Slice.js` — Redux state slice (local state, selectors, actions)
- `*ApiSlice.js` — RTK Query endpoint definitions injected into the base API (`src/app/api/apiSlice.js`)
- Component files — UI for that feature

Feature domains: `auth`, `strategies`, `users`, `implementers`, `focus_areas`, `policies`, `comments`, `invites`, `metrics`, `faq`, `maps`, `weather`.

**API layer:** RTK Query with `fetchBaseQuery`. Base URL is `localhost:3500/api` in dev, `process.env.API_URL` in production. Includes automatic 401 → token refresh → retry logic in `baseQueryWithReauth`.

**Routing:** React Router v6 with nested routes in `src/Routes.js`. Routes are wrapped in `PersistAuth` for session persistence. Protected routes use `ProtectRoute` (role-gated) and `AnonymousOnly` (login/register pages).

**Roles:** Guest, Viewer, Implementer, CPIC Member, CPIC Admin, Admin. Role checks happen in `ProtectRoute` with an `allowedRoles` prop.

**Auth:** JWT tokens stored in Redux (not localStorage). Multiple auth methods: email/password, passkeys (WebAuthn via `@simplewebauthn/browser`), Google OAuth. Token refresh uses a `persist` duration value from localStorage.

**Forms:** React Hook Form with Yup (and some Zod) validation via `@hookform/resolvers`.

**UI components:** Three tiers:

- `src/components/ui/` — Radix UI primitives (shadcn-style)
- `src/components/catalyst/` — Higher-level design system components
- `src/components/` — App-specific shared components (DataTable, Multiselect, layout)

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
