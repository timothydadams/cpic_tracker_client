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

- `User.email` — omitted
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

Also sets refresh token cookie.

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
  "strategy_number": "int",
  "timeline_id": "int",
  "status_id": "int",
  "focus_area_id": "int",
  "last_comms_date": "ISO8601?"
}
```

**Behavior:** Automatically creates a `StrategyActivity` audit record with action `CREATE`.

**Response (200):** New strategy object.

---

### PUT `/api/strategies/:id`

Update a strategy. **Auth required** (Admin, CPIC Admin, or CPIC Member).

**Request:**

```json
{
  "content": "string?",
  "policy_id": "string?",
  "strategy_number": "int?",
  "timeline_id": "int?",
  "status_id": "int?",
  "focus_area_id": "int?",
  "last_comms_date": "ISO8601?",
  "implementers": {
    "add": [1, 2],
    "remove": [3]
  },
  "primary_implementer": "int?"
}
```

**Behavior:** Automatically creates a `StrategyActivity` audit record tracking field-level changes.

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

- **Unauthenticated:** `user: { id, username, profile_pic }`
- **Authenticated:** `user: { id, username, profile_pic, display_name, given_name, family_name, email }`

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "content": "string",
      "strategy_id": 1,
      "user_id": "uuid",
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

---

### GET `/api/strategies/:id/activities`

Get audit log for a strategy. **Auth required.**

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `skip` | `int` | `0` | Offset |
| `take` | `int` | `50` | Limit (max 100) |

**Auth-aware user fields:**

- **Unauthenticated:** `user: { id, username, profile_pic }`
- **Authenticated:** `user: { id, username, profile_pic, display_name, given_name, family_name, email }`

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
      "user_id": "uuid",
      "createdAt": "ISO8601",
      "user": { "id": "uuid", "username": "string", "profile_pic": "string?" }
    }
  ]
}
```

**Activity actions:** `CREATE`, `UPDATE`, `DELETE`, `ADD_COMMENT`, `UPDATE_COMMENT`

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
    "createdById": "uuid",
    "createdAt": "ISO8601",
    "createdBy": { "id": "uuid", "email": "string" }
  }
}
```

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

All **public** (no auth required).

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

## Data Models

### User

| Field                | Type      | Notes                                         |
| -------------------- | --------- | --------------------------------------------- |
| `id`                 | `uuid`    | Primary key                                   |
| `email`              | `string?` | Unique. Stripped for unauthenticated requests |
| `username`           | `string?` |                                               |
| `given_name`         | `string?` |                                               |
| `family_name`        | `string?` |                                               |
| `display_name`       | `string?` |                                               |
| `profile_pic`        | `string?` | URL                                           |
| `disabled`           | `boolean` | Default false                                 |
| `implementer_org_id` | `int?`    | FK to Implementer                             |
| `invitedById`        | `uuid?`   | FK to User who invited them                   |
| `createdAt`          | `ISO8601` |                                               |
| `updatedAt`          | `ISO8601` |                                               |

### Strategy

| Field             | Type       | Notes                 |
| ----------------- | ---------- | --------------------- |
| `id`              | `int`      | Auto-increment PK     |
| `content`         | `string`   | Strategy description  |
| `policy_id`       | `uuid`     | FK to Policies        |
| `strategy_number` | `int`      |                       |
| `focus_area_id`   | `int`      | FK to FocusArea       |
| `timeline_id`     | `int`      | FK to TimelineOptions |
| `status_id`       | `int`      | FK to StatusOptions   |
| `last_comms_date` | `ISO8601?` |                       |
| `createdAt`       | `ISO8601`  |                       |
| `updatedAt`       | `ISO8601`  |                       |

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

| Field         | Type      | Notes                                    |
| ------------- | --------- | ---------------------------------------- |
| `id`          | `int`     | Auto-increment PK                        |
| `content`     | `string`  |                                          |
| `user_id`     | `uuid`    | FK to User                               |
| `strategy_id` | `int`     | FK to Strategy                           |
| `parent_id`   | `int?`    | Self-referential FK for threaded replies |
| `createdAt`   | `ISO8601` |                                          |
| `updatedAt`   | `ISO8601` |                                          |

### StrategyActivity (audit log)

| Field         | Type      | Notes                                                         |
| ------------- | --------- | ------------------------------------------------------------- |
| `id`          | `int`     | Auto-increment PK                                             |
| `strategy_id` | `int`     | FK to Strategy                                                |
| `user_id`     | `uuid`    | FK to User                                                    |
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

| Field         | Type      | Notes              |
| ------------- | --------- | ------------------ |
| `id`          | `uuid`    | Primary key        |
| `code`        | `string`  | Unique invite code |
| `roleId`      | `uuid`    | FK to Role         |
| `createdById` | `uuid`    | FK to User         |
| `maxUses`     | `int`     | Default 1          |
| `useCount`    | `int`     | Default 0          |
| `used`        | `boolean` | Default false      |
| `expiresAt`   | `ISO8601` |                    |

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

| Resource        | Create            | Read               | Update                         | Delete                    |
| --------------- | ----------------- | ------------------ | ------------------------------ | ------------------------- |
| **Strategy**    | Admin, CPIC Admin | Public             | Admin, CPIC Admin, CPIC Member | Admin                     |
| **Policy**      | Admin, CPIC Admin | Public             | Admin, CPIC Admin, CPIC Member | Admin                     |
| **FocusArea**   | Admin             | Public             | Admin                          | Admin                     |
| **Implementer** | Admin, CPIC Admin | Public             | Admin, CPIC Admin              | Admin                     |
| **Comment**     | Any authenticated | Public             | Admin, author                  | Admin, CPIC Admin, author |
| **Role**        | Admin             | Any authenticated  | Admin                          | Admin                     |
| **User**        | N/A (via invite)  | Admin, self        | Admin, self                    | Admin, self               |
| **InviteCode**  | Any authenticated | Creator (my-codes) | N/A                            | N/A                       |

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
