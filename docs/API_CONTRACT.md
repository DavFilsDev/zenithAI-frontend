# API Contract v1

> **This contract is shared with the backend repository and describes the TARGET state. Both repositories must keep an identical copy. Any change must be made in both.**

Contract version: `v1`
Status: target state, not yet implemented. The currently deployed API is documented in `docs/api/api-documentation.md` in the backend repository.

## 1. Product

- Product name: **Zenith AI**. The name ChatGPT / chatgpt must not appear anywhere in the code, the documentation, or the payloads.
- The product is 100% free and open to everyone: no credits, no premium tier, no payment.
- Target infrastructure cost: **0 €**. Only free technologies and free services are allowed.

## 2. Environments

| | Value |
|---|---|
| Frontend (dev) | `http://localhost:5173` |
| Backend (dev) | `http://localhost:8000` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |
| API base path | `/api/v1/` |
| Swagger UI | `/api/v1/docs/` |
| ReDoc | `/api/v1/redoc/` |
| OpenAPI schema | `/api/v1/schema/` |

## 3. Endpoints

Status legend: **Implemented** = available today, **Planned** = described by this contract, not built yet.
Usage legend: **Used by frontend** = the current frontend code exercises this endpoint, at its contract path or at the legacy path it serves today.

| Method | Path | Auth | Status | Currently served at | Used by frontend |
|---|---|---|---|---|---|
| POST | `/auth/register/` | No | Implemented | `POST /api/auth/register/` | Yes |
| POST | `/auth/token/` | No | Implemented | `POST /api/auth/token/` | Yes |
| POST | `/auth/token/refresh/` | No | Implemented | `POST /api/auth/token/refresh/` | Yes |
| POST | `/auth/logout/` | Yes | Planned | — | No |
| GET | `/auth/profile/` | Yes | Implemented | `GET /api/auth/profile/` | Yes |
| PATCH | `/auth/profile/` | Yes | Implemented | `PATCH /api/auth/profile/` | No |
| GET | `/conversations/` | Yes | Implemented | `GET /api/chat/conversations/` (unpaginated) | Yes |
| POST | `/conversations/` | Yes | Implemented | `POST /api/chat/conversations/` | No |
| GET | `/conversations/{uuid}/` | Yes | Implemented | `GET /api/chat/conversations/{id}/` (integer id) | Yes |
| PATCH | `/conversations/{uuid}/` | Yes | Implemented | `PATCH /api/chat/conversations/{id}/` | No |
| DELETE | `/conversations/{uuid}/` | Yes | Implemented | `DELETE /api/chat/conversations/{id}/` | Yes |
| GET | `/conversations/{uuid}/messages/` | Yes | Planned | — (only inside the conversation payload today) | No |
| POST | `/conversations/{uuid}/messages/` | Yes | Planned | `POST /api/chat/chat/{id}/` | Yes |
| POST | `/conversations/{uuid}/messages/stream/` | Yes | Planned | — | No |
| GET | `/health/` | No | Planned | — | No |

### 3.1 Method set

- `/auth/profile/`: only `GET` and `PATCH`. `PUT` is not part of the contract.
- `/conversations/{uuid}/`: only `GET`, `PATCH` and `DELETE`. `PUT` is not part of the contract.
- `PUT` and `PATCH` on conversations are limited to the `title` field.

### 3.2 Conversation creation

Creating a conversation explicitly is supported. Sending a message to a conversation that does not exist yet is **not** part of the contract: the frontend creates the conversation first, then posts the first message.

### 3.3 Where the frontend calls each endpoint today

A `Yes` above does not mean the contract path is already used. These are the real call sites in `src/`, all of them on the legacy `/api` base and none of them on `/api/v1`:

| Contract endpoint | Called from | Path actually requested |
|---|---|---|
| `POST /auth/register/` | `src/services/auth.ts:42` | `/auth/register/` |
| `POST /auth/token/` | `src/services/auth.ts:9` | `/auth/token/` |
| `POST /auth/token/refresh/` | `src/services/refreshTokenService.ts:15` | `/auth/token/refresh/` |
| `GET /auth/profile/` | `src/services/auth.ts:18`, `src/services/auth.ts:47`, `src/services/auth.ts:70` | `/auth/profile/` |
| `GET /conversations/` | `src/services/chat.ts:6` | `/chat/conversations/` |
| `GET /conversations/{uuid}/` | `src/services/chat.ts:11` | `/chat/conversations/{id}/`, integer id |
| `POST /conversations/{uuid}/messages/` | `src/services/chat.ts:17` | `/chat/chat/{conversation_id}/` |
| `DELETE /conversations/{uuid}/` | `src/services/chat.ts:25` | `/chat/conversations/{id}/` |

The five rows marked `No` have no call site at all: logout clears tokens locally, profile updates are `console.log` stubs, conversation creation is never called explicitly, `PATCH` is never issued, and there is no streaming or health call.

## 4. Public identifiers

- All public ids are **UUIDs**, exposed as strings. Integer primary keys are internal only.
- Conversations and messages returned by the API always carry their `uuid`.

## 5. Pagination

All list endpoints are paginated with the standard DRF envelope and a page size of **20**.

```json
{
  "count": 42,
  "next": "http://localhost:8000/api/v1/conversations/?page=2",
  "previous": null,
  "results": []
}
```

The frontend reads `results`, and uses `count`, `next` and `previous` for navigation only.

## 6. Authentication

- JWT is carried in the request body as JSON, never in a query string or a cookie.
- Access token lifetime: **15 minutes**.
- Refresh token lifetime: **7 days**, with rotation, and the rotated token is blacklisted.
- Header: `Authorization: Bearer <token>`.
- Logout blacklists the refresh token presented in the body.

| Endpoint | Request | Response |
|---|---|---|
| `POST /auth/register/` | `{"email", "username", "password", "password2"}` | `201` user object |
| `POST /auth/token/` | `{"email", "password"}` | `{"access", "refresh"}` |
| `POST /auth/token/refresh/` | `{"refresh"}` | `{"access", "refresh"}` |
| `POST /auth/logout/` | `{"refresh"}` | `204` |
| `GET /auth/profile/` | — | `200` user object |
| `PATCH /auth/profile/` | partial user object | `200` user object |

## 7. Streaming

Streaming is **SSE only** (`text/event-stream`). WebSocket is not used anywhere.

| Event | Payload |
|---|---|
| `token` | `data: {"content":"<fragment>"}` |
| `done` | `data: {"message_id":"<uuid>","conversation_id":"<uuid>"}` |
| `error` | `data: {"code":"<code>","message":"<text>"}` |

A non-streaming message post returns the complete assistant message.

## 8. Error format

Every error response, without exception, uses this envelope:

```json
{
  "error": {
    "code": "<code>",
    "message": "<text>",
    "details": {}
  }
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `validation_error` | 400 | Invalid payload |
| `unauthorized` | 401 | Missing, invalid or expired token |
| `forbidden` | 403 | Authenticated but not allowed |
| `not_found` | 404 | Unknown resource, or not owned by the caller |
| `rate_limited` | 429 | Per-IP or per-user throttling |
| `quota_exhausted` | 429 | Global daily cap reached |
| `llm_unavailable` | 503 | Provider unreachable, errored or rate limited |
| `server_error` | 500 | Unexpected failure |

A resource that exists but belongs to someone else returns `404 not_found`, never `403`, so that ids cannot be probed.

## 9. Usage limits

- Throttling per IP and per user.
- A global daily cap shared by all users.
- Exceeding a limit returns `429` with a `Retry-After` header and the code `rate_limited` or `quota_exhausted`.
- There are no credits and no billing state on the user.

## 10. LLM

- One free provider key, server-side only, read from the environment.
- The key is accessed through a single provider interface. No API key is ever stored per user.
- Users never send their own provider key.

## 11. Environment variables

Backend:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django signing key |
| `DEBUG` | `True` in dev, `False` in prod |
| `ALLOWED_HOSTS` | Comma-separated host list |
| `DATABASE_URL` or `DB_*` | Database connection |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins |
| `LLM_PROVIDER` | Active provider (`gemini`, `groq`) |
| `LLM_API_KEY` | Free provider key |
| `LLM_MODEL` | Model id |

Frontend:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` |

`VITE_WS_URL` does not exist: streaming is SSE, not WebSocket.
