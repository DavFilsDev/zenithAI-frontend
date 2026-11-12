# API Contract v1

> **This contract is shared with the backend repository and describes the TARGET state. Both repositories must keep an identical copy. Any change must be made in both.**

Contract version: `v1`
Status: implemented. Every endpoint in §3 is live, including SSE streaming, and the usage limits in §9 (per-IP and per-user throttling, and the global daily cap) are enforced. Repeated provider failures are absorbed by a circuit breaker, which keeps the API returning `503 llm_unavailable` and recovers automatically after a cool-down. The deployed API is documented in `docs/api/api-documentation.md` in the backend repository.

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
Usage legend: **Used by frontend** = the current frontend code exercises this endpoint.

| Method | Path | Auth | Status | Currently served at | Used by frontend |
|---|---|---|---|---|---|
| POST | `/auth/register/` | No | Implemented | `POST /api/v1/auth/register/` | Yes |
| POST | `/auth/token/` | No | Implemented | `POST /api/v1/auth/token/` | Yes |
| POST | `/auth/token/refresh/` | No | Implemented | `POST /api/v1/auth/token/refresh/` | Yes |
| POST | `/auth/logout/` | Yes | Implemented | `POST /api/v1/auth/logout/` | No |
| GET | `/auth/profile/` | Yes | Implemented | `GET /api/v1/auth/profile/` | Yes |
| PATCH | `/auth/profile/` | Yes | Implemented | `PATCH /api/v1/auth/profile/` | Yes |
| GET | `/conversations/` | Yes | Implemented | `GET /api/v1/chat/conversations/` (paginated) | Yes |
| POST | `/conversations/` | Yes | Implemented | `POST /api/v1/chat/conversations/` | Yes |
| GET | `/conversations/{uuid}/` | Yes | Implemented | `GET /api/v1/chat/conversations/{uuid}/` | Yes |
| PATCH | `/conversations/{uuid}/` | Yes | Implemented | `PATCH /api/v1/chat/conversations/{uuid}/` | No |
| DELETE | `/conversations/{uuid}/` | Yes | Implemented | `DELETE /api/v1/chat/conversations/{uuid}/` | Yes |
| GET | `/conversations/{uuid}/messages/` | Yes | Implemented | `GET /api/v1/chat/conversations/{uuid}/messages/` | No |
| POST | `/conversations/{uuid}/messages/` | Yes | Implemented | `POST /api/v1/chat/conversations/{uuid}/messages/` | Yes |
| POST | `/conversations/{uuid}/messages/stream/` | Yes | Implemented | `POST /api/v1/chat/conversations/{uuid}/messages/stream/` | No |
| GET | `/health/` | No | Implemented | `GET /api/v1/health/` | No |

### 3.1 Method set

- `/auth/profile/`: only `GET` and `PATCH`. `PUT` is not part of the contract.
- `/conversations/{uuid}/`: only `GET`, `PATCH` and `DELETE`. `PUT` is not part of the contract.
- `PUT` and `PATCH` on conversations are limited to the `title` field.

### 3.2 Conversation creation

Creating a conversation explicitly is supported. Sending a message to a conversation that does not exist yet is **not** part of the contract: the frontend creates the conversation first, then posts the first message.

### 3.3 Where the frontend calls each endpoint today

These are the real call sites in `src/`, all of them on the `/api/v1` base:

| Contract endpoint | Called from | Path actually requested |
|---|---|---|
| `POST /auth/register/` | `src/services/auth.ts:44` | `/auth/register/` |
| `POST /auth/token/` | `src/services/auth.ts:17` | `/auth/token/` |
| `POST /auth/token/refresh/` | `src/services/refreshTokenService.ts:14` | `/auth/token/refresh/` |
| `GET /auth/profile/` | `src/services/auth.ts:56` | `/auth/profile/` |
| `PATCH /auth/profile/` | `src/services/auth.ts:68` | `/auth/profile/` |
| `GET /conversations/` | `src/services/chat.ts:11` | `/chat/conversations/` |
| `POST /conversations/` | `src/services/chat.ts:21` | `/chat/conversations/` |
| `GET /conversations/{uuid}/` | `src/services/chat.ts:16` | `/chat/conversations/{uuid}/` |
| `POST /conversations/{uuid}/messages/` | `src/services/chat.ts:27` | `/chat/conversations/{uuid}/messages/` |
| `DELETE /conversations/{uuid}/` | `src/services/chat.ts:34` | `/chat/conversations/{uuid}/` |

The five rows marked `No` have no call site: logout clears tokens locally, conversation rename (`PATCH`) is never issued, messages are read from the conversation payload, and there is no streaming or health call.

## 4. Public identifiers

- All public ids are **UUIDs**, exposed as strings. Integer primary keys are internal only.
- Conversations and messages returned by the API always carry their `uuid`.

## 5. Pagination

All list endpoints are paginated with the standard DRF envelope and a page size of **20**.

```json
{
  "count": 42,
  "next": "http://localhost:8000/api/v1/chat/conversations/?page=2",
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

`src/services/apiError.ts` parses this envelope into a single `ApiError` that
carries `status`, `code`, `message` and `details`. Validation field messages are
available through `getFieldErrors()` and are mapped onto the registration form.
A response that is not this envelope — for example the HTML 404 returned for an
unknown route — falls back to a message chosen from the HTTP status.

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
