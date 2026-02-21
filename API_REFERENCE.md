# CPIC Tracker Backend — API Reference

> Place this file in the frontend repository root (or reference it from CLAUDE.md) so Claude Code has full backend API context.

## Base URL

```
Development: http://localhost:3500/api
Production:  https://<production-domain>/api
```

## Standard Response Format

All endpoints return:

```json
{
  "status": <http_status_code>,
  "message": "<human-readable message>",
  "data": <payload or null>
}
```

## Authentication

### Overview

The API supports three auth methods:

- **WebAuthn Passkeys** (FIDO2) via `@simplewebauthn/server`
- **Google OAuth 2.0** (redirect flow)
- **Email/Password** (bcrypt)

### Token System

- **Access Token**: Short-lived JWT in `Authorization: Bearer <token>` header. Contains `id`, `email`, `roles`, `display_name`, `given_name`, `family_name`, `profile_pic`.
- **Refresh Token**: Stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie named `jwt_cpic`. Contains only `id`. Rotated on each refresh (old token is blacklisted in Redis).

### Cookie Settings

```
httpOnly: true, sameSite: 'Strict', secure: true, path: '/'
```

### PII Stripping

Unauthenticated requests automatically have PII fields stripped from responses:

- `User.email`, `User.display_name`, `User.given_name`, `User.family_name` — omitted
- `Implementer.emails`, `Implementer.phone_numbers` — omitted

The system checks the access token first, then falls back to the refresh token cookie, so logged-in users see PII even on public endpoints where the frontend doesn't send an Authorization header.

---

## Auth Endpoints (`/api/auth`)

### POST `/api/auth/register`

Register a new user with an invite code.

**Rate limit:** 10 requests / 15 minutes

**Request:**

```json
{
  "user": {
    "email": "string (required)",
    "given_name": "string (required)",
    "family_name": "string (required)",
    "username": "string?",
    "password_hash": "string? (plain-text password, hashed server-side)",
    "profile_pic": "string?",
    "implementer_org_id": "int?",
    "assigned_implementers": "int[]? (implementer IDs)"
  },
  "inviteCode": "string (required)"
}
```

If `username` is not provided, one is auto-generated in the format `user_<hex>`.

**Response (200):**

```json
{
  "data": { "id": "uuid", "email": "string", "display_name": "string" }
}
```

Also sets refresh token cookie. Enqueues a welcome email (fire-and-forget) summarizing the user's assigned strategies. Implementer-role users receive a single-org template; all other roles receive a committee template grouped by implementer org.

---

### POST `/api/auth/get-auth-options`

Get available auth methods for an email address.

**Rate limit:** 10 requests / 15 minutes

**Request:**

```json
{ "email": "string" }
```

**Response (200):**

```json
{
  "socials": ["google"],
  "passkey": {
    /* SimpleWebAuthn PublicKeyCredentialRequestOptions */
  }
}
```

Returns `socials` array of linked OAuth providers and passkey challenge options (null if no passkeys registered).

---

### POST `/api/auth/self-sign-in`

Email/password sign-in.

**Rate limit:** 10 requests / 15 minutes

**Request:**

```json
{
  "email": "string",
  "password": "string",
  "duration": "SHORT | LONG"
}
```

**Response (200):**

```json
{ "accessToken": "string" }
```

Also sets refresh token cookie. `duration` controls cookie/refresh token lifespan.

**Error (409):** Invalid credentials.

---

### POST `/api/auth/generate-passkey-reg-options`

Get WebAuthn registration challenge for a user.

**Request:**

```json
{ "email": "string" }
```

**Response (200):** SimpleWebAuthn `PublicKeyCredentialCreationOptions` object.

---

### POST `/api/auth/passkey-reg-verification`

Complete passkey registration.

**Request:**

```json
{
  "email": "string",
  "duration": "SHORT | LONG",
  "webAuth": {
    /* SimpleWebAuthn RegistrationResponseJSON */
  }
}
```

**Response (200):**

```json
{ "verified": true, "accessToken": "string (if duration provided)" }
```

---

### POST `/api/auth/passkey-auth-verify`

Authenticate with a registered passkey.

**Rate limit:** 10 requests / 15 minutes

**Request:**

```json
{
  "email": "string",
  "duration": "SHORT | LONG",
  "webAuth": {
    /* SimpleWebAuthn AuthenticationResponseJSON */
  }
}
```

**Response (200):**

```json
{ "verified": true, "accessToken": "string" }
```

Also sets refresh token cookie.

---

### GET `/api/auth/google-callback/`

Google OAuth callback. Not called directly by the frontend — Google redirects here.

**Query params:** `code` (auth code), `state` (JSON: `{ persist: "SHORT"|"LONG", path: { pathname: string }, email?: string, isAuthed?: boolean }`)

**Behavior:** Sets refresh token cookie and redirects to `FRONTEND_DOMAIN + state.path.pathname` with access token as a query param.

---

### POST `/api/auth/logout`

Logout. Clears cookies and blacklists tokens in Redis.

**Request:** No body required. Uses cookies.

**Response (200):**

```json
{ "message": "cleared cookies" }
```

---

### POST `/api/auth/refresh`

Refresh the access token using the refresh token cookie.

**Rate limit:** 30 requests / 15 minutes

**Request:**

```json
{ "duration": "SHORT | LONG (optional)" }
```

**Response (200):**

```json
{ "accessToken": "string" }
```

Also sets new refresh token cookie (old token blacklisted).

**Error (401):** No token or invalid/expired/blacklisted token.

---

## User Endpoints (`/api/users`)

All require `Authorization: Bearer <token>`.

### GET `/api/users/`

List all users. Requires CPIC Admin or Global Admin role.

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "given_name": "string?",
      "family_name": "string?",
      "display_name": "string?",
      "username": "string?",
      "profile_pic": "string?",
      "disabled": false,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "userRoles": [{ "role": { "name": "string" } }]
    }
  ]
}
```

---

### GET `/api/users/:id`

Get a single user. Requires admin or own user.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `federated_idps` | `"true"/"false"` | Include linked OAuth providers |
| `passkeys` | `"true"/"false"` | Include registered passkeys |
| `implementer_details` | `"true"/"false"` | Include implementer org membership |
| `assigned_implementers` | `"true"/"false"` | Include assigned implementer orgs |

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "email": "string",
    "given_name": "string?",
    "family_name": "string?",
    "display_name": "string?",
    "username": "string?",
    "profile_pic": "string?",
    "roles": ["string"],
    "federated_idps": [{ "name": "google", "data": {} }],
    "passkeys": [],
    "implementer_org": {},
    "assigned_implementers": []
  }
}
```

---

### PUT `/api/users/:id`

Update a user. Requires admin or own user.

**Request:**

```json
{
  "family_name": "string?",
  "given_name": "string?",
  "display_name": "string?",
  "username": "string?",
  "assigned_implementers": "int[]?",
  "implementer_org_id": "int | null?"
}
```

**Response (200):** Updated user object.

---

### GET `/api/users/:id/roles`

Get roles for a user.

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "createdAt": "ISO8601"
    }
  ]
}
```

---

### POST `/api/users/:id/role`

Add a role to a user. Admin only.

**Request:**

```json
{ "roleId": "string (role UUID)" }
```

**Response (200):**

```json
{ "data": { "user_id": "uuid", "role_id": "uuid" } }
```

---

### DELETE `/api/users/:id/role`

Remove a role from a user. Admin only.

**Request:**

```json
{ "roleId": "string (role UUID)" }
```

---

### DELETE `/api/users/:id/passkey`

Delete a passkey. User can only delete their own.

**Request:**

```json
{ "pk_id": "string (passkey ID)" }
```

---

## Strategy Endpoints (`/api/strategies`)

### GET `/api/strategies/`

List all strategies. **Public** (no auth required).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `policy` | `int` | Filter by policy ID |
| `focus_area` | `int` | Filter by focus area ID |
| `include` | `string` | Comma-separated: `focus_area`, `stakeholders`, `comments`, `timeline`, `status`, `policy`, `implementers`, `activities` |
| `orderBy` | `JSON string` | e.g. `{"content":"asc"}` or `{"id":"desc"}` |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "content": "string",
      "policy_id": "uuid",
      "strategy_number": 1,
      "focus_area_id": 1,
      "timeline_id": 1,
      "status_id": 1,
      "last_comms_date": "ISO8601?",
      "initial_deadline": "ISO8601?",
      "current_deadline": "ISO8601?",
      "completed_at": "ISO8601?",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

With `include`, nested relations are added to each object.

---

### GET `/api/strategies/:id`

Get a single strategy. **Public**.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `implementers` | `"true"/"false"` | Include assigned implementers |
| `timeline` | `"true"/"false"` | Include timeline option |
| `policy` | `"true"/"false"` | Include parent policy |
| `status` | `"true"/"false"` | Include status option |

---

### GET `/api/strategies/:id/summary`

Comprehensive read-only summary of a single strategy. **Public** (no auth required). Returns the strategy with relations, computed metrics, counts, and sibling strategies under the same policy — all in one request.

**Response (200):**

```json
{
  "data": {
    "strategy": {
      "id": 1,
      "content": "string",
      "strategy_number": 1,
      "initial_deadline": "ISO8601 | null",
      "current_deadline": "ISO8601 | null",
      "completed_at": "ISO8601 | null",
      "last_comms_date": "ISO8601 | null",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "status": { "id": 1, "title": "In Progress" },
      "timeline": { "id": 1, "title": "Short-Term" },
      "policy": { "id": "uuid", "description": "string", "policy_number": 1 },
      "focus_area": { "id": 1, "name": "string" },
      "implementers": [
        {
          "implementer_id": 1,
          "is_primary": true,
          "name": "string",
          "cpic_smes": [
            {
              "id": "uuid",
              "display_name": "string?",
              "profile_pic": "string?",
              "username": "string?",
              "given_name": "string?",
              "family_name": "string?",
              "email": "string?"
            }
          ],
          "members": [
            {
              "id": "uuid",
              "display_name": "string?",
              "profile_pic": "string?",
              "username": "string?",
              "given_name": "string?",
              "family_name": "string?",
              "email": "string?"
            }
          ]
        }
      ]
    },
    "counts": {
      "comments": 12,
      "activities": 34
    },
    "metrics": {
      "days_until_deadline": 45,
      "is_overdue": false,
      "deadline_pushes": 3,
      "days_since_last_activity": 5,
      "days_since_last_comms": 12,
      "total_updates": 18,
      "completed_on_time": null
    },
    "siblings": [
      {
        "id": 2,
        "strategy_number": 2,
        "content": "string (truncated to ~100 chars)",
        "status": { "id": 1, "title": "Not Started" },
        "timeline": { "id": 1, "title": "Short-Term" }
      }
    ]
  }
}
```

**Metrics field definitions:**

| Field                      | Type           | Description                                                                |
| -------------------------- | -------------- | -------------------------------------------------------------------------- |
| `days_until_deadline`      | `int \| null`  | Positive = days remaining, negative = days overdue, null = no deadline set |
| `is_overdue`               | `bool`         | `current_deadline < now && completed_at == null`                           |
| `deadline_pushes`          | `int`          | Count of activity records where `changes` includes `current_deadline`      |
| `days_since_last_activity` | `int \| null`  | Days since most recent activity record (null if no activities)             |
| `days_since_last_comms`    | `int \| null`  | Days since `last_comms_date` (null if never set)                           |
| `total_updates`            | `int`          | Total activity record count                                                |
| `completed_on_time`        | `bool \| null` | null if not completed; `completed_at <= current_deadline` if completed     |

**Implementer user collections:** Each implementer includes `cpic_smes` (CPIC SME users assigned to the implementer) and `members` (users who belong to the implementer org). Both are arrays of User objects. For unauthenticated requests, PII fields are stripped: `email`, `display_name`, `given_name`, and `family_name`. Remaining visible fields: `id`, `profile_pic`, `username`.

**Siblings:** Other strategies under the same `policy_id`, excluding the current one. Content truncated to ~100 characters. Ordered by `strategy_number` ascending.

**Error (400):** Non-numeric `:id` parameter.
**Error (404):** Strategy not found.

---

### GET `/api/strategies/my-strategies`

Get strategies assigned to the current user's implementer org(s). **Auth required.**

**Response (200):** Shape varies:

- If user is an implementer: `{ implementer: {...}, strategies: [...] }`
- If user is admin/CPIC: `[{ details: implementer, strategies: [...] }]`

---

### GET `/api/strategies/statuses`

List available status options. **Public.**

**Response (200):**

```json
{ "data": [{ "id": 1, "title": "string", "enabled": true }] }
```

---

### GET `/api/strategies/timeline_options`

List available timeline options. **Public.**

**Response (200):**

```json
{ "data": [{ "id": 1, "title": "string", "enabled": true }] }
```

---

### GET `/api/strategies/policies`

List policies. **Public.** Alias for policy listing.

---

### GET `/api/strategies/focusareas`

List focus areas. **Public.** Alias for focus area listing.

---

### POST `/api/strategies/`

Create a strategy. **Auth required** (Admin or CPIC Admin).

**Request:**

```json
{
  "content": "string",
  "policy_id": "string",
  "strategy_number": "int? (auto-computed as MAX+1 per policy_id when omitted)",
  "timeline_id": "int",
  "status_id": "int",
  "focus_area_id": "int",
  "last_comms_date": "ISO8601?",
  "implementers": "int[] (implementer IDs)"
}
```

**Behavior:**

- The strategy record and its implementer associations are created atomically in a single transaction. If either fails, the entire operation rolls back.
- When `strategy_number` is omitted, it is auto-computed as `MAX(strategy_number) + 1` among strategies with the same `policy_id` (defaults to `1` when the policy has no existing strategies).
- Automatically computes `initial_deadline` and `current_deadline` from `timeline_id` (Short-Term → 2026-08-31, Mid-Term → 2030-08-31, Long-Term → 2034-08-31, Ongoing → null).
- Creates a `StrategyActivity` audit record with action `CREATE` (includes implementer names in the `changes` payload when implementers are provided).

**Response (200):** New strategy object (includes `initial_deadline`, `current_deadline`, `completed_at`).

---

### PUT `/api/strategies/:id`

Update a strategy. **Auth required** (Admin, CPIC Admin, CPIC Member, or Implementer).

**Request fields are restricted by role:**

| Field                 | Admin | CPIC Admin | CPIC Member | Implementer |
| --------------------- | ----- | ---------- | ----------- | ----------- |
| `content`             | Yes   | Yes        | Yes         | No          |
| `policy_id`           | Yes   | Yes        | No          | No          |
| `strategy_number`     | Yes   | Yes        | No          | No          |
| `timeline_id`         | Yes   | Yes        | No          | No          |
| `status_id`           | Yes   | Yes        | Yes         | Yes         |
| `focus_area_id`       | Yes   | Yes        | No          | No          |
| `last_comms_date`     | Yes   | Yes        | Yes         | No          |
| `current_deadline`    | Yes   | Yes        | Yes         | Yes         |
| `completed_at`        | Yes   | Yes        | Yes         | No          |
| `implementers`        | Yes   | Yes        | Yes         | No          |
| `primary_implementer` | Yes   | Yes        | Yes         | No          |

**Implementer scope:** Implementers can only update strategies they are assigned to (via `StrategyImplementer`). Attempting to update a non-assigned strategy returns 403.

**Request (Admin/CPIC Admin — all fields):**

```json
{
  "content": "string?",
  "policy_id": "string?",
  "strategy_number": "int?",
  "timeline_id": "int?",
  "status_id": "int?",
  "focus_area_id": "int?",
  "last_comms_date": "ISO8601?",
  "current_deadline": "ISO8601?",
  "completed_at": "ISO8601?",
  "implementers": {
    "add": [1, 2],
    "remove": [3]
  },
  "primary_implementer": "int | null (omit to leave unchanged, null to unset)"
}
```

Sending fields outside the caller's allowed set returns **403** with a message listing the denied fields.

**Behavior:**

- `initial_deadline` is **not updatable** — it is stripped from the request body.
- When `status_id` changes to "Completed" and `completed_at` is not provided, `completed_at` is auto-set to the current time. When status moves away from "Completed", `completed_at` is cleared to `null`.
- **`primary_implementer`**: Send an implementer ID to set, send `null` to unset, or omit the field entirely to leave unchanged.
- All mutations (implementer add/remove, primary set/unset, field update, activity logging) are wrapped in a single database transaction — if any step fails, the entire update rolls back.
- Creates a single `StrategyActivity` audit record combining field changes, implementer membership changes, and primary implementer changes into one `changes` object.

**Response (200):** Updated strategy object with included relations: `timeline`, `policy`, `status`, and `implementers` (with nested `implementer` details).

```json
{
  "data": {
    "id": 1,
    "content": "string",
    "policy_id": "uuid",
    "strategy_number": 1,
    "focus_area_id": 1,
    "timeline_id": 1,
    "status_id": 1,
    "last_comms_date": "ISO8601?",
    "initial_deadline": "ISO8601?",
    "current_deadline": "ISO8601?",
    "completed_at": "ISO8601?",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "timeline": { "id": 1, "title": "Short-Term", "enabled": true },
    "policy": {
      "id": "uuid",
      "description": "string",
      "policy_number": 1,
      "focus_area_id": 1
    },
    "status": { "id": 1, "title": "In Progress", "enabled": true },
    "implementers": [
      {
        "implementer_id": 1,
        "strategy_id": 1,
        "order_number": null,
        "is_primary": true,
        "implementer": { "id": 1, "name": "string", "...": "..." }
      }
    ]
  }
}
```

---

### DELETE `/api/strategies/:id`

Delete a strategy. **Auth required** (Admin only).

**Behavior:** Automatically creates a `StrategyActivity` audit record with action `DELETE` before removing the resource.

---

### POST `/api/strategies/:id/comments`

Create a comment on a strategy. **Auth required.**

**Request:**

```json
{
  "content": "string",
  "strategy_id": 1,
  "parent_id": "int? (for threaded replies)"
}
```

**Response (200):** New comment object.

---

### GET `/api/strategies/:id/comments`

Get comments for a strategy. **Public.** Returns a nested tree — all replies are recursively nested under their parent via `children` arrays.

**Auth-aware user fields:**

- **Unauthenticated:** `user: { id, username, profile_pic }` or `null` if the author was deleted
- **Authenticated:** `user: { id, username, profile_pic, display_name, given_name, family_name, email }` or `null` if the author was deleted

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "content": "string",
      "strategy_id": 1,
      "user_id": "uuid | null",
      "parent_id": null,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "user": { "id": "uuid", "username": "string", "profile_pic": "string?" },
      "children": [
        {
          "id": 2,
          "content": "string",
          "parent_id": 1,
          "user": { "..." },
          "children": []
        }
      ]
    }
  ]
}
```

> **Note:** `user_id` and `user` can be `null` when the comment author has been deleted. Display these as "Deleted User" or similar in the UI.

---

### GET `/api/strategies/:id/activities`

Get audit log for a strategy. **Auth required.**

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `skip` | `int` | `0` | Offset |
| `take` | `int` | `50` | Limit (max 100) |

**Auth-aware user fields:**

- **Unauthenticated:** `user: { id, username, profile_pic }` or `null` if the actor was deleted
- **Authenticated:** `user: { id, username, profile_pic, display_name, given_name, family_name, email }` or `null` if the actor was deleted

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "action": "UPDATE",
      "summary": "string",
      "changes": { "field": { "old": "...", "new": "..." } },
      "strategy_id": 1,
      "user_id": "uuid | null",
      "createdAt": "ISO8601",
      "user": { "id": "uuid", "username": "string", "profile_pic": "string?" }
    }
  ]
}
```

> **Note:** `user_id` and `user` can be `null` when the actor has been deleted. Display these as "Deleted User" or similar in the UI.

**Activity actions:** `CREATE`, `UPDATE`, `DELETE`, `ADD_COMMENT`, `UPDATE_COMMENT`, `UPDATE_IMPLEMENTERS`, `UPDATE_PRIMARY`

> **Note:** A single PUT request produces at most one activity record. When only one category changes, its specific action is used (`UPDATE`, `UPDATE_IMPLEMENTERS`, or `UPDATE_PRIMARY`). When multiple categories change in one request, the action is `UPDATE` with all changes combined in the `changes` JSON.

---

## Policy Endpoints (`/api/policies`)

### GET `/api/policies/`

List all policies. **Public.**

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `area` | `"true"/"false"` | Include parent focus area |
| `strategies` | `"true"/"false"` | Include child strategies |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "description": "string",
      "policy_number": 1,
      "focus_area_id": 1,
      "area": { "id": 1, "name": "string" },
      "strategies": []
    }
  ]
}
```

---

### GET `/api/policies/:id`

Get a single policy with area and strategies. **Public.**

---

### POST `/api/policies/`

Create a policy. **Auth required** (Admin or CPIC Admin).

**Request:**

```json
{
  "description": "string",
  "policy_number": "int",
  "focus_area_id": "int"
}
```

---

### PUT `/api/policies/:id`

Update a policy. **Auth required** (Admin, CPIC Admin, or CPIC Member).

**Request:**

```json
{
  "description": "string?",
  "policy_number": "int?",
  "focus_area_id": "int?"
}
```

---

### DELETE `/api/policies/:id`

Delete a policy. **Auth required** (Admin only).

---

## Focus Area Endpoints (`/api/focusareas`)

### GET `/api/focusareas/`

List all focus areas. **Public.**

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `policies` | `"true"/"false"` | Include child policies (ordered by policy_number asc) |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "string",
      "description": "string?",
      "state_goal": "string?",
      "policies": []
    }
  ]
}
```

---

### GET `/api/focusareas/:id`

Get a single focus area. **Public.** Same query params as list.

---

### POST `/api/focusareas/`

Create a focus area. **Auth required** (Admin only).

**Request:**

```json
{
  "name": "string",
  "description": "string",
  "state_goal": "string"
}
```

---

### PUT `/api/focusareas/:id`

Update a focus area. **Auth required** (Admin only).

---

### DELETE `/api/focusareas/:id`

Delete a focus area. **Auth required** (Admin only).

---

## Implementer Endpoints (`/api/implementers`)

### GET `/api/implementers/`

List all implementers. **Public.**

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `cpic_smes` | `"true"/"false"` | Include assigned SME users |
| `strategies` | `"true"/"false"` | Include assigned strategies |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "string",
      "emails": ["string"],
      "phone_numbers": ["string"],
      "is_board": false,
      "is_department": false,
      "is_school": false,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

Note: `emails` and `phone_numbers` are stripped for unauthenticated requests.

---

### GET `/api/implementers/:id`

Get a single implementer. **Public.** Same query params as list.

---

### POST `/api/implementers/:id`

Create an implementer. **Auth required** (Admin or CPIC Admin).

> Note: Route is `POST /:id` (quirk in backend routing).

**Request:**

```json
{
  "name": "string",
  "emails": ["string"],
  "phone_numbers": ["string"],
  "is_board": "boolean?",
  "is_department": "boolean?",
  "is_school": "boolean?"
}
```

---

### PUT `/api/implementers/:id`

Update an implementer. **Auth required** (Admin or CPIC Admin).

Same body shape as create (all fields optional).

---

### DELETE `/api/implementers/:id`

Delete an implementer. **Auth required** (Admin only).

---

## Comment Endpoints (`/api/comments`)

### GET `/api/comments/`

List all comments. **Auth required** (Admin or CPIC Admin).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `replies` | `"true"/"false"` | Include nested reply threads |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "content": "string",
      "strategy_id": 1,
      "user_id": "uuid",
      "parent_id": "int?",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "children": []
    }
  ]
}
```

---

### GET `/api/comments/:id`

Get a single comment. **Public.**

**Query params:** `replies` — same as above.

---

### POST `/api/comments/`

Create a comment. **Auth required** (any authenticated role).

**Request:**

```json
{
  "content": "string",
  "strategy_id": 1,
  "parent_id": "int? (for threaded replies)"
}
```

Creates a `StrategyActivity` with action `ADD_COMMENT`.

---

### PUT `/api/comments/:id`

Update a comment. **Auth required** (Admin or comment author).

**Request:**

```json
{ "content": "string" }
```

Creates a `StrategyActivity` with action `UPDATE_COMMENT`.

---

### DELETE `/api/comments/:id`

Delete a comment. **Auth required** (Admin, CPIC Admin, or comment author).

---

## Role Endpoints (`/api/roles`)

All require `Authorization: Bearer <token>`.

### GET `/api/roles/`

List all roles. Any authenticated user.

**Response (200):**

```json
{ "data": [{ "id": "uuid", "name": "string", "description": "string" }] }
```

---

### GET `/api/roles/:id`

Get a single role.

---

### POST `/api/roles/`

Create a role. **Admin only.**

**Request:**

```json
{ "name": "string", "description": "string" }
```

---

### PUT `/api/roles/:id`

Update a role. **Admin only.**

---

### DELETE `/api/roles/:id`

Delete a role. **Admin only.**

---

## Invite Endpoints (`/api/invites`)

### POST `/api/invites/`

Create an invite code. **Auth required.**

**Request:**

```json
{
  "roleId": "string (role UUID, required)",
  "maxUses": "int? (default 1)",
  "expiresInDays": "int? (default 7)"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "code": "string",
    "roleId": "uuid",
    "maxUses": 1,
    "useCount": 0,
    "used": false,
    "expiresAt": "ISO8601",
    "createdById": "uuid | null",
    "createdAt": "ISO8601",
    "createdBy": { "id": "uuid", "email": "string" }
  }
}
```

> **Note:** `createdById` and `createdBy` can be `null` when the invite creator has been deleted.

---

### POST `/api/invites/send`

Create a new invite code and email it to one or more recipients. **Auth required.** Role-scoped: users can only invite at or below their own role level (Admin → any, CPIC Admin → CPIC Admin/Member/Implementer, CPIC Member → Member/Implementer, Implementer → Implementer only).

**Request:**

```json
{
  "emails": ["string (required, non-empty array)"],
  "roleId": "string (role UUID, required)",
  "maxUses": "int? (default 1)",
  "expiresInDays": "int? (default 7)"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "code": "string",
    "roleId": "uuid",
    "maxUses": 1,
    "expiresAt": "ISO8601",
    "recipientEmails": ["string"],
    "role": { "name": "string" },
    "createdBy": { "id": "uuid", "email": "string", "display_name": "string?" }
  }
}
```

> **Note:** `createdBy` can be `null` when the invite creator has been deleted.

**Error (400):** Missing/invalid emails or roleId. **Error (403):** Insufficient role permissions.

Each recipient receives an email with a registration link and inline QR code (for passkey setup on a personal device).

---

### POST `/api/invites/:code/send`

Send an existing valid invite code to additional email addresses. **Auth required.** Must be the invite creator or a Global Admin. Subject to the same role-scoping rules as `POST /send`.

**Request:**

```json
{
  "emails": ["string (required, non-empty array)"]
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "code": "string",
    "recipientEmails": ["string (all recipients, including previously sent)"],
    "role": { "name": "string" },
    "createdBy": { "id": "uuid", "email": "string", "display_name": "string?" }
  }
}
```

> **Note:** `createdBy` can be `null` when the invite creator has been deleted.

**Error (400):** Missing/invalid emails. **Error (403):** Not the invite owner or insufficient role. **Error (404):** Code not found. **Error (410):** Code expired or fully used.

---

### GET `/api/invites/my-codes`

Get invite codes created by the current user. **Auth required.**

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `activeOnly` | `"true"/"false"` | Only return non-expired, non-fully-used codes |

**Response (200):** Array of invite codes with `usedBy` user list.

---

### GET `/api/invites/my-invites`

Get users the current user has invited. **Auth required.**

**Response (200):**

```json
{
  "data": {
    "count": 5,
    "users": [
      {
        "id": "uuid",
        "email": "string",
        "createdAt": "ISO8601",
        "inviteCodeUsed": { "code": "string", "createdAt": "ISO8601" }
      }
    ]
  }
}
```

---

### GET `/api/invites/:code/validate`

Validate an invite code. **Public.**

**Response (200):**

```json
{ "data": { "valid": true, "roleId": "uuid", "roleName": "string" } }
```

**Error (404):** Invalid code. **Error (410):** Expired or fully used.

---

### GET `/api/invites/:code/stats`

Get stats for an invite code. **Auth required** (Admin or CPIC Admin).

**Response (200):** Full invite code object with `createdBy` and `usedBy` details.

---

## Metrics Endpoints (`/api/metrics`)

All **public** (no auth required) unless noted otherwise.

### GET `/api/metrics/strategies-by-status`

**Response (200):**

```json
{ "data": [{ "status": "string", "count": 5 }] }
```

---

### GET `/api/metrics/strategies-by-timeline`

**Response (200):**

```json
{ "data": [{ "timeline": "string", "count": 5 }] }
```

---

### GET `/api/metrics/implementer-breakdown`

**Query params:** `primary` (`"true"/"false"`) — filter to primary implementers only.

**Response (200):**

```json
{ "data": [{ "implementer_id": 1, "implementer_name": "string", "count": 5 }] }
```

---

### GET `/api/metrics/strategy-stats-by-implementer`

**Query params:** `primary` (`"true"/"false"`) — filter to primary implementers only.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "string",
      "strategy_stats": { "total": 10, "inProgress": 3, "completed": 5 }
    }
  ]
}
```

---

### GET `/api/metrics/plan-overview`

Dashboard-level snapshot of the entire strategic plan.

**Response (200):**

```json
{
  "data": {
    "total_strategies": 85,
    "completed": 22,
    "in_progress": 40,
    "needs_updating": 23,
    "completion_rate": 25.9,
    "on_time_completions": 18,
    "late_completions": 4,
    "on_time_rate": 81.8,
    "overdue": 7,
    "avg_days_to_complete": 142.5
  }
}
```

---

### GET `/api/metrics/completion-by-focus-area`

Completion rates and overdue counts per focus area.

**Response (200):**

```json
{
  "data": [
    {
      "focus_area_id": 1,
      "focus_area_name": "Workforce Development",
      "total": 20,
      "completed": 8,
      "in_progress": 7,
      "needs_updating": 5,
      "completion_rate": 40.0,
      "overdue": 2,
      "avg_days_to_complete": 120.3
    }
  ]
}
```

---

### GET `/api/metrics/completion-by-timeline`

Progress vs. deadline for each timeline tier.

**Response (200):**

```json
{
  "data": [
    {
      "timeline_id": 2,
      "timeline_name": "Short-Term",
      "deadline_date": "2026-08-31T16:00:00.000Z",
      "total": 30,
      "completed": 15,
      "completion_rate": 50.0,
      "overdue": 3,
      "on_time_rate": 86.7,
      "days_remaining": 195,
      "avg_days_to_complete": 98.2
    }
  ]
}
```

Note: `days_remaining` is negative if the deadline has passed. `deadline_date` is `null` for "Ongoing".

---

### GET `/api/metrics/deadline-drift`

Measures how much strategy deadlines have been pushed from their original values.

**Response (200):**

```json
{
  "data": {
    "total_with_deadlines": 70,
    "pushed": 12,
    "push_rate": 17.1,
    "avg_drift_days": 87.3,
    "by_timeline": [
      {
        "timeline_id": 2,
        "timeline_name": "Short-Term",
        "total": 30,
        "pushed": 5,
        "push_rate": 16.7,
        "avg_drift_days": 45.2
      }
    ]
  }
}
```

---

### GET `/api/metrics/overdue-strategies`

Action-oriented list of strategies past their deadline and not yet completed.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `timeline_id` | `int` | Filter by timeline |
| `focus_area_id` | `int` | Filter by focus area |
| `implementer_id` | `int` | Filter by implementer |

**Response (200):**

```json
{
  "data": [
    {
      "strategy_id": 14,
      "content": "Develop teacher recruitment pipeline...",
      "focus_area": "Workforce Development",
      "policy": "Policy description",
      "timeline": "Short-Term",
      "status": "In Progress",
      "current_deadline": "2026-08-31T16:00:00.000Z",
      "days_overdue": 12,
      "primary_implementer": "HR Department"
    }
  ]
}
```

---

### GET `/api/metrics/implementer-scorecard`

Graded scorecard per implementer with per-timeline breakdown. Sorted by overall score descending. **Ongoing strategies are excluded** from all calculations (they have no deadline and never technically complete). Weights and grade thresholds are read from the scorecard config (see `GET /api/metrics/config/scorecard`).

**Query params:** `primary` (`"true"/"false"`) — grade only on strategies where implementer is primary.

**Response (200):**

```json
{
  "data": [
    {
      "implementer_id": 3,
      "implementer_name": "HR Department",
      "overall": {
        "total": 12,
        "completed": 5,
        "completion_rate": 41.7,
        "on_time": 4,
        "late": 1,
        "on_time_rate": 80.0,
        "overdue": 2,
        "avg_days_to_complete": 134.2,
        "score": 62.5,
        "grade": "D"
      },
      "by_timeline": [
        {
          "timeline_id": 2,
          "timeline_name": "Short-Term",
          "total": 5,
          "completed": 3,
          "completion_rate": 60.0,
          "on_time": 3,
          "late": 0,
          "on_time_rate": 100.0,
          "overdue": 1,
          "avg_days_to_complete": 98.0,
          "score": 79.0,
          "grade": "C"
        }
      ]
    }
  ]
}
```

See `METRICS_GUIDE.md` for the grading formula, weight definitions, and an explanation of why 100% on-time rate can coexist with overdue strategies.

---

### GET `/api/metrics/implementer-scorecard/:implementer_id`

Deep-dive scorecard for a single implementer. Includes focus area breakdown, recent completions, and overdue list. **Ongoing strategies are excluded** from all calculations. Weights and grade thresholds are read from the scorecard config.

**Query params:** `primary` (`"true"/"false"`) — grade only on strategies where implementer is primary.

**Response (200):**

```json
{
  "data": {
    "implementer_id": 3,
    "implementer_name": "HR Department",
    "overall": {
      "total": 12,
      "completed": 5,
      "completion_rate": 41.7,
      "on_time": 4,
      "late": 1,
      "on_time_rate": 80.0,
      "overdue": 2,
      "avg_days_to_complete": 134.2,
      "score": 62.5,
      "grade": "D"
    },
    "by_timeline": [
      {
        "timeline_id": 2,
        "timeline_name": "Short-Term",
        "total": 5,
        "completed": 3,
        "completion_rate": 60.0,
        "on_time": 3,
        "late": 0,
        "on_time_rate": 100.0,
        "overdue": 1,
        "avg_days_to_complete": 98.0,
        "score": 79.0,
        "grade": "C"
      }
    ],
    "by_focus_area": [
      {
        "focus_area_id": 1,
        "focus_area_name": "Workforce Development",
        "total": 4,
        "completed": 2,
        "completion_rate": 50.0,
        "on_time": 2,
        "late": 0,
        "on_time_rate": 100.0,
        "overdue": 0,
        "avg_days_to_complete": 110.0,
        "score": 82.5,
        "grade": "B"
      }
    ],
    "recent_completions": [
      {
        "strategy_id": 22,
        "content": "Strategy description...",
        "completed_at": "2025-11-15T00:00:00.000Z",
        "focus_area": "Workforce Development",
        "timeline": "Short-Term",
        "was_on_time": true
      }
    ],
    "overdue_strategies": [
      {
        "strategy_id": 14,
        "content": "Strategy description...",
        "current_deadline": "2026-01-15T00:00:00.000Z",
        "days_overdue": 33,
        "focus_area": "Workforce Development",
        "timeline": "Short-Term",
        "status": "In Progress"
      }
    ]
  }
}
```

**Error (400):** Non-numeric `implementer_id`.
**Error (404):** Implementer not found.

---

### GET `/api/metrics/completion-trend`

Monthly or quarterly completion velocity with cumulative running total.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | `string` | `"monthly"` | `"monthly"` or `"quarterly"` |
| `focus_area_id` | `int` | — | Filter by focus area |

**Response (200):**

```json
{
  "data": [
    { "period": "2025-06", "completed": 3, "cumulative": 10 },
    { "period": "2025-07", "completed": 5, "cumulative": 15 },
    { "period": "2025-08", "completed": 2, "cumulative": 17 }
  ]
}
```

When `period=quarterly`, periods are formatted as `"2025-Q1"`, `"2025-Q2"`, etc.

---

### GET `/api/metrics/focus-area-progress`

Hierarchical view: Focus Area → Policies → strategy completion counts per policy.

**Response (200):**

```json
{
  "data": [
    {
      "focus_area_id": 1,
      "name": "Workforce Development",
      "state_goal": "State Goal 1",
      "total_strategies": 20,
      "completion_rate": 40.0,
      "policies": [
        {
          "policy_id": "uuid",
          "description": "Policy description",
          "policy_number": 1,
          "total": 6,
          "completed": 3,
          "completion_rate": 50.0,
          "overdue": 0
        }
      ]
    }
  ]
}
```

---

### GET `/api/metrics/config/scorecard`

Get the current scorecard configuration (weights and grade thresholds). **Public.**

**Response (200):**

```json
{
  "data": {
    "weight_completion_rate": 0.4,
    "weight_on_time_rate": 0.35,
    "weight_overdue_penalty": 0.25,
    "grade_a_min": 90,
    "grade_b_min": 80,
    "grade_c_min": 70,
    "grade_d_min": 60
  }
}
```

---

### PUT `/api/metrics/config/scorecard`

Update scorecard configuration. **Auth required** (Admin or CPIC Admin). Supports partial updates — omitted fields retain their current values.

**Request:**

```json
{
  "weight_completion_rate": 0.5,
  "weight_on_time_rate": 0.3,
  "weight_overdue_penalty": 0.2
}
```

All fields are optional. Validation rules:

- Weights must each be between 0 and 1
- Weights must sum to 1.0 (±0.001 tolerance)
- Grade thresholds must be strictly descending integers: `grade_a_min > grade_b_min > grade_c_min > grade_d_min > 0`
- `grade_a_min` cannot exceed 100

**Response (200):** Full merged config object (same shape as GET).

**Error (400):** Validation failure (e.g., weights don't sum to 1.0, thresholds not descending).
**Error (401):** No auth token.
**Error (403):** Insufficient role (requires Admin or CPIC Admin).

---

## Notification Endpoints (`/api/notifications`)

All require `Authorization: Bearer <token>` and **Global Admin** role.

### GET `/api/notifications/thresholds`

List all notification thresholds.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "days": 90,
      "label": "90 days before deadline",
      "enabled": true,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

Ordered by `days` descending. Positive values = days before deadline, zero = day-of, negative = days after deadline (overdue).

---

### GET `/api/notifications/thresholds/:id`

Get a single threshold.

**Response (200):** Single threshold object.

**Error (404):** Threshold not found.

---

### POST `/api/notifications/thresholds`

Create a notification threshold.

**Request:**

```json
{
  "days": 60,
  "label": "60 days before deadline",
  "enabled": true
}
```

`days` must be unique. Positive = reminder before deadline, `0` = day-of (overdue), negative = days after deadline.

**Response (201):** Created threshold object.

**Error (409):** Duplicate `days` value.

---

### PUT `/api/notifications/thresholds/:id`

Update a threshold.

**Request:**

```json
{
  "days": "int?",
  "label": "string?",
  "enabled": "boolean?"
}
```

**Response (200):** Updated threshold object.

---

### DELETE `/api/notifications/thresholds/:id`

Delete a threshold.

**Response (200):** Success message.

---

### GET `/api/notifications/logs/strategy/:strategy_id`

View notification logs for a strategy. Shows sent/failed email history.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "strategy_id": 1,
      "threshold_id": 1,
      "recipient_email": "dept@org.com",
      "recipient_type": "implementer_org",
      "sent_at": "ISO8601",
      "status": "sent",
      "error_message": null,
      "job_id": "string?",
      "threshold": {
        "id": 1,
        "days": 90,
        "label": "90 days before deadline",
        "enabled": true
      }
    }
  ]
}
```

Ordered by `sent_at` descending. `recipient_type` values: `implementer_org`, `implementer_member`, `cpic_sme`.

---

### GET `/api/notifications/feature-flags`

List all feature flags controlling email notification categories.

**Response (200):**

```json
{
  "data": [
    {
      "key": "deadline_scheduler",
      "enabled": true,
      "description": "Enable daily deadline check cron job",
      "updatedAt": "ISO8601",
      "createdAt": "ISO8601"
    }
  ]
}
```

Ordered by `key` ascending. Three default flags: `deadline_scheduler` (master switch for the daily cron), `deadline_reminders` (upcoming deadline and day-of emails, thresholds with `days >= 0`), `overdue_notifications` (overdue emails, thresholds with `days < 0`). Invite emails are always-on and bypass flags.

---

### PUT `/api/notifications/feature-flags/:key`

Toggle a feature flag.

**Request:**

```json
{ "enabled": false }
```

**Response (200):** Updated flag object.

**Error (404):** Unknown flag key.

---

## Data Models

### User

| Field                | Type      | Notes                                                                           |
| -------------------- | --------- | ------------------------------------------------------------------------------- |
| `id`                 | `uuid`    | Primary key                                                                     |
| `email`              | `string?` | Unique. Stripped for unauthenticated requests                                   |
| `username`           | `string?` |                                                                                 |
| `given_name`         | `string?` | Stripped for unauthenticated requests                                           |
| `family_name`        | `string?` | Stripped for unauthenticated requests                                           |
| `display_name`       | `string?` | Stripped for unauthenticated requests                                           |
| `profile_pic`        | `string?` | URL                                                                             |
| `disabled`           | `boolean` | Default false                                                                   |
| `implementer_org_id` | `int?`    | FK to Implementer                                                               |
| `invitedById`        | `uuid?`   | FK to User who invited them. `null` when the inviter has been deleted (SetNull) |
| `createdAt`          | `ISO8601` |                                                                                 |
| `updatedAt`          | `ISO8601` |                                                                                 |

### Strategy

| Field              | Type       | Notes                                                                |
| ------------------ | ---------- | -------------------------------------------------------------------- |
| `id`               | `int`      | Auto-increment PK                                                    |
| `content`          | `string`   | Strategy description                                                 |
| `policy_id`        | `uuid`     | FK to Policies                                                       |
| `strategy_number`  | `int`      |                                                                      |
| `focus_area_id`    | `int`      | FK to FocusArea                                                      |
| `timeline_id`      | `int`      | FK to TimelineOptions                                                |
| `status_id`        | `int`      | FK to StatusOptions                                                  |
| `last_comms_date`  | `ISO8601?` |                                                                      |
| `initial_deadline` | `ISO8601?` | Immutable. Auto-computed from `timeline_id` on creation              |
| `current_deadline` | `ISO8601?` | Active deadline. Updatable by authorized users                       |
| `completed_at`     | `ISO8601?` | Auto-set when status → "Completed"; cleared when status changes away |
| `createdAt`        | `ISO8601`  |                                                                      |
| `updatedAt`        | `ISO8601`  |                                                                      |

### Policies

| Field           | Type     | Notes           |
| --------------- | -------- | --------------- |
| `id`            | `uuid`   | Primary key     |
| `description`   | `string` |                 |
| `policy_number` | `int`    |                 |
| `focus_area_id` | `int`    | FK to FocusArea |

### FocusArea

| Field         | Type      | Notes             |
| ------------- | --------- | ----------------- |
| `id`          | `int`     | Auto-increment PK |
| `name`        | `string`  |                   |
| `description` | `string?` |                   |
| `state_goal`  | `string?` |                   |

### Implementer

| Field           | Type       | Notes                                 |
| --------------- | ---------- | ------------------------------------- |
| `id`            | `int`      | Auto-increment PK                     |
| `name`          | `string`   |                                       |
| `emails`        | `string[]` | Stripped for unauthenticated requests |
| `phone_numbers` | `string[]` | Stripped for unauthenticated requests |
| `is_board`      | `boolean`  |                                       |
| `is_department` | `boolean`  |                                       |
| `is_school`     | `boolean`  |                                       |
| `createdAt`     | `ISO8601`  |                                       |
| `updatedAt`     | `ISO8601`  |                                       |

### StrategyImplementer (join table)

| Field            | Type      | Notes         |
| ---------------- | --------- | ------------- |
| `implementer_id` | `int`     | Composite PK  |
| `strategy_id`    | `int`     | Composite PK  |
| `order_number`   | `int?`    |               |
| `is_primary`     | `boolean` | Default false |

### Comment

| Field         | Type      | Notes                                                         |
| ------------- | --------- | ------------------------------------------------------------- |
| `id`          | `int`     | Auto-increment PK                                             |
| `content`     | `string`  |                                                               |
| `user_id`     | `uuid?`   | FK to User. `null` when the author has been deleted (SetNull) |
| `strategy_id` | `int`     | FK to Strategy                                                |
| `parent_id`   | `int?`    | Self-referential FK for threaded replies                      |
| `createdAt`   | `ISO8601` |                                                               |
| `updatedAt`   | `ISO8601` |                                                               |

### StrategyActivity (audit log)

| Field         | Type      | Notes                                                         |
| ------------- | --------- | ------------------------------------------------------------- |
| `id`          | `int`     | Auto-increment PK                                             |
| `strategy_id` | `int`     | FK to Strategy                                                |
| `user_id`     | `uuid?`   | FK to User. `null` when the actor has been deleted (SetNull)  |
| `action`      | `string`  | `CREATE`, `UPDATE`, `DELETE`, `ADD_COMMENT`, `UPDATE_COMMENT` |
| `summary`     | `string`  | Human-readable description                                    |
| `changes`     | `JSON`    | Field-level diff: `{ "field": { "old": ..., "new": ... } }`   |
| `createdAt`   | `ISO8601` |                                                               |

### Role

| Field         | Type     | Notes                                                                       |
| ------------- | -------- | --------------------------------------------------------------------------- |
| `id`          | `uuid`   | Primary key                                                                 |
| `name`        | `string` | Unique. Values: `"Admin"`, `"CPIC Admin"`, `"CPIC Member"`, `"Implementer"` |
| `description` | `string` |                                                                             |

### InviteCode

| Field             | Type       | Notes                                                          |
| ----------------- | ---------- | -------------------------------------------------------------- |
| `id`              | `uuid`     | Primary key                                                    |
| `code`            | `string`   | Unique invite code                                             |
| `roleId`          | `uuid`     | FK to Role                                                     |
| `createdById`     | `uuid?`    | FK to User. `null` when the creator has been deleted (SetNull) |
| `maxUses`         | `int`      | Default 1                                                      |
| `useCount`        | `int`      | Default 0                                                      |
| `used`            | `boolean`  | Default false                                                  |
| `recipientEmails` | `string[]` | Email addresses the invite was sent to. Default `[]`           |
| `expiresAt`       | `ISO8601`  |                                                                |

### StatusOptions

| Field     | Type      | Notes             |
| --------- | --------- | ----------------- |
| `id`      | `int`     | Auto-increment PK |
| `title`   | `string`  | Unique            |
| `enabled` | `boolean` | Default true      |

### TimelineOptions

| Field     | Type      | Notes             |
| --------- | --------- | ----------------- |
| `id`      | `int`     | Auto-increment PK |
| `title`   | `string`  | Unique            |
| `enabled` | `boolean` | Default true      |

### NotificationThreshold

| Field       | Type      | Notes                                                                     |
| ----------- | --------- | ------------------------------------------------------------------------- |
| `id`        | `int`     | Auto-increment PK                                                         |
| `days`      | `int`     | Unique. Positive = before deadline, 0 = day-of, negative = after deadline |
| `label`     | `string`  | Human-readable description (max 100 chars)                                |
| `enabled`   | `boolean` | Default true                                                              |
| `createdAt` | `ISO8601` |                                                                           |
| `updatedAt` | `ISO8601` |                                                                           |

### NotificationLog

| Field             | Type      | Notes                                                  |
| ----------------- | --------- | ------------------------------------------------------ |
| `id`              | `int`     | Auto-increment PK                                      |
| `strategy_id`     | `int`     | FK to Strategy                                         |
| `threshold_id`    | `int`     | FK to NotificationThreshold                            |
| `recipient_email` | `string`  |                                                        |
| `recipient_type`  | `string`  | `implementer_org`, `implementer_member`, or `cpic_sme` |
| `sent_at`         | `ISO8601` | Default now()                                          |
| `status`          | `string`  | `sent` or `failed`                                     |
| `error_message`   | `string?` | Error details (max 500 chars)                          |
| `job_id`          | `string?` | BullMQ job ID                                          |

Unique constraint on `(strategy_id, threshold_id, recipient_email)` for deduplication.

### FeatureFlag

| Field         | Type      | Notes                                                                                                   |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `key`         | `string`  | Primary key (max 50 chars). Values: `deadline_scheduler`, `deadline_reminders`, `overdue_notifications` |
| `enabled`     | `boolean` | Default true                                                                                            |
| `description` | `string`  | Human-readable description (max 200 chars)                                                              |
| `updatedAt`   | `ISO8601` |                                                                                                         |
| `createdAt`   | `ISO8601` |                                                                                                         |

### AppSetting

| Field       | Type      | Notes                                                                     |
| ----------- | --------- | ------------------------------------------------------------------------- |
| `key`       | `string`  | Primary key (max 100 chars). Current keys: `scorecard_config`             |
| `value`     | `JSON`    | JSONB column. Shape varies by key — see endpoint docs for per-key schemas |
| `updatedAt` | `ISO8601` |                                                                           |

**`scorecard_config` value schema:**

```json
{
  "weight_completion_rate": 0.4,
  "weight_on_time_rate": 0.35,
  "weight_overdue_penalty": 0.25,
  "grade_a_min": 90,
  "grade_b_min": 80,
  "grade_c_min": 70,
  "grade_d_min": 60
}
```

### Stakeholder

| Field               | Type       | Notes             |
| ------------------- | ---------- | ----------------- |
| `id`                | `int`      | Auto-increment PK |
| `name`              | `string`   |                   |
| `organization_name` | `string?`  |                   |
| `emails`            | `string[]` |                   |
| `phone_numbers`     | `string[]` |                   |
| `strategy_id`       | `int`      | FK to Strategy    |

---

## Role-Based Access Summary

| Resource                          | Create                      | Read               | Update                                                                         | Delete                    |
| --------------------------------- | --------------------------- | ------------------ | ------------------------------------------------------------------------------ | ------------------------- |
| **Strategy**                      | Admin, CPIC Admin           | Public             | Admin, CPIC Admin, CPIC Member, Implementer (restricted fields, assigned only) | Admin                     |
| **Policy**                        | Admin, CPIC Admin           | Public             | Admin, CPIC Admin, CPIC Member                                                 | Admin                     |
| **FocusArea**                     | Admin                       | Public             | Admin                                                                          | Admin                     |
| **Implementer**                   | Admin, CPIC Admin           | Public             | Admin, CPIC Admin                                                              | Admin                     |
| **Comment**                       | Any authenticated           | Public             | Admin, author                                                                  | Admin, CPIC Admin, author |
| **Role**                          | Admin                       | Any authenticated  | Admin                                                                          | Admin                     |
| **User**                          | N/A (via invite)            | Admin, self        | Admin, self                                                                    | Admin, self               |
| **Notification Threshold**        | Global Admin                | Global Admin       | Global Admin                                                                   | Global Admin              |
| **Notification Log**              | N/A (system-generated)      | Global Admin       | N/A                                                                            | N/A                       |
| **Feature Flag**                  | N/A (seeded)                | Global Admin       | Global Admin                                                                   | N/A                       |
| **AppSetting (scorecard config)** | N/A (seeded)                | Public             | Admin, CPIC Admin                                                              | N/A                       |
| **InviteCode**                    | Any authenticated           | Creator (my-codes) | N/A                                                                            | N/A                       |
| **Invite Send**                   | Role-scoped (see hierarchy) | N/A                | Creator or Admin (resend)                                                      | N/A                       |

---

## Error Responses

| Status | Meaning             | Common Causes                                                   |
| ------ | ------------------- | --------------------------------------------------------------- |
| 400    | Bad Request         | Invalid input, foreign key constraint (Prisma P2003)            |
| 401    | Unauthorized        | Missing/invalid/expired/blacklisted token                       |
| 403    | Forbidden           | Insufficient role permissions                                   |
| 404    | Not Found           | Resource not found (Prisma P2025)                               |
| 409    | Conflict            | Unique constraint violation (Prisma P2002), invalid credentials |
| 410    | Gone                | Expired or fully-used invite code                               |
| 429    | Too Many Requests   | Rate limit exceeded                                             |
| 503    | Service Unavailable | Redis unavailable during auth check                             |

Error response shape:

```json
{
  "status": 400,
  "message": "Human-readable error description"
}
```

---

## CORS

Allowed origins: `http://localhost:3000`, `http://127.0.0.1:3000`, `https://cpic.dev`, `https://web-client-lckc.onrender.com`

Credentials: enabled. Methods: `GET, POST, PUT, DELETE, OPTIONS`.
