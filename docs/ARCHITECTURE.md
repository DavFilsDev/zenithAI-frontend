# Architecture

This document describes the **target** architecture. It is the state the roadmap in [`IMPROVEMENT_PLAN.md`](IMPROVEMENT_PLAN.md) converges to, not the state of the code today. Where the two differ, the plan says so with a file path.

The API this architecture is built against is described in [`API_CONTRACT.md`](API_CONTRACT.md). The rules that govern the code are in [`CONVENTIONS.md`](CONVENTIONS.md).

## 1. Principles

1. **One API client.** Every request leaves through the same Axios instance, so auth, refresh, error normalisation and timeouts are implemented once.
2. **Server state and UI state are different things.** Server state is fetched, cached and invalidated by TanStack Query. Zustand only holds what the user is doing right now.
3. **Streaming is a transport, not a state store.** A stream writes into the query cache through one adapter, and the components render from the cache like any other data.
4. **One path per feature.** A feature owns its components, hooks and services, and depends on `shared/`, never on another feature's internals.
5. **Errors are data.** A failure is a value with a `code` that a component can branch on, not an exception that escapes to a global handler.

## 2. Tree

```
src/
├── main.tsx                     entry point, no logic
├── app/
│   ├── App.tsx                  providers, no data fetching
│   ├── router.tsx               routes, lazy, guards
│   ├── providers.tsx            QueryClient, Auth, Theme
│   └── ErrorBoundary.tsx        last resort for a render crash
├── features/
│   ├── auth/
│   │   ├── api/authApi.ts       register, token, refresh, logout, profile
│   │   ├── model/authStore.ts   session slice: user, status
│   │   ├── model/useLogin.ts    react-hook-form + mutation
│   │   ├── model/useRegister.ts
│   │   ├── model/useProfile.ts  GET and PATCH /auth/profile/
│   │   ├── pages/LoginPage.tsx
│   │   ├── pages/RegisterPage.tsx
│   │   └── components/          AuthCard, PasswordField
│   └── chat/
│       ├── api/conversationsApi.ts
│       ├── api/messagesApi.ts
│       ├── api/streamMessage.ts the SSE adapter
│       ├── model/useConversations.ts
│       ├── model/useConversation.ts
│       ├── model/useSendMessage.ts
│       ├── model/chatUiStore.ts sidebar, draft, streaming flag
│       ├── pages/ChatPage.tsx
│       ├── pages/ConversationPage.tsx
│       └── components/          ConversationList, MessageList, MessageBubble, Composer
├── shared/
│   ├── api/
│   │   ├── apiClient.ts         instance, base URL, timeout
│   │   ├── authInterceptor.ts   request header, single-flight refresh
│   │   ├── apiError.ts          ApiError with code and details
│   │   ├── errorCodes.ts        the codes the contract defines
│   │   └── env.ts               typed, validated import.meta.env
│   ├── ui/                      Button, Input, Modal, Spinner, Toast
│   ├── hooks/                   useMediaQuery, useFocusTrap, useOnClickOutside
│   └── lib/                     formatDate, cn, parseRetryAfter
└── types/                       only cross-feature types
```

`shared/` is the only place a feature may import from outside itself. When a second feature needs something, it is promoted to `shared/` in the same commit, never imported across.

## 3. Layers

A dependency points in one direction only.

| Layer | Knows about | Never does |
|---|---|---|
| `app/` | every layer | fetch data itself |
| `features/*/pages` | its own feature, `shared/ui` | call `apiClient` directly |
| `features/*/model` | its own feature, `shared/api` | render |
| `features/*/api` | `shared/api` | import React state |
| `shared/api` | `env` | import a feature |
| `shared/ui` | nothing but React | call the API |

A page composes a feature's components and reads its hooks. It holds no `useState` of its own and issues no request.

## 4. Auth flow

### Sign in

```
LoginPage
  └─ useLogin (react-hook-form + zod)
       └─ useMutation
            └─ authApi.login({ email, password })
                 └─ POST /auth/token/          { access, refresh }
                      └─ tokenStore.setTokens()
                           ├─ access  → memory
                           └─ refresh → sessionStorage
```

The access token lives in a module-level variable, never in `localStorage`. The refresh token lives in `sessionStorage` so the session does not outlive the tab. Nothing is written to `localStorage`.

### Attaching the token

`shared/api/authInterceptor.ts` reads the access token on the way out and sets `Authorization: Bearer <token>`. No caller ever sets a header.

### Expiry and refresh

On a `401`, and only on a `401`:

```
apiClient receives 401
  └─ is this a retry of the same request? → give up, sign out
  └─ is a refresh already in flight?    → await it, then replay
  └─ otherwise                          → start one refresh
       └─ POST /auth/token/refresh/  { refresh } → { access, refresh }
            ├─ success → store the new pair, replay the original request
            └─ failure → clear both tokens, redirect to /login
```

One refresh at a time. Without this, five concurrent requests produce five refresh calls, and rotation makes the last writer win while earlier replays carry a superseded token. The in-flight promise is shared, not a counter.

The refresh request itself bypasses the interceptor, otherwise it recurses.

### Sign out

```
logout()
  └─ authApi.logout({ refresh })  → POST /auth/logout/, best effort
  └─ tokenStore.clear()
  └─ queryClient.clear()          every cached conversation goes with the user
  └─ navigate('/login')
```

The server call is best effort: a failed blacklist must not trap the user in a session they asked to leave. The local clear happens whatever the server answers.

### Bootstrap

On boot, if a refresh token exists, the app calls `GET /auth/profile/` once, inside a pending state, and builds the session from the answer. A network failure keeps the user signed out but shows a message; it never silently deletes tokens, because a transient 500 must not look like a logout.

## 5. Streaming flow

`POST /conversations/{uuid}/messages/stream/`, consumed with `fetch` and a `ReadableStream`. Not `EventSource`, because the request needs an `Authorization` header and an `AbortSignal`.

```
Composer
  └─ useSendMessage
       └─ AbortController                        one per in-flight stream
            └─ streamMessage({ conversationId, content, signal })
                 └─ fetch(POST ..., { signal, headers })
                      └─ response.body.getReader()
                           └─ TextDecoder + buffer split on "\n\n"
                                └─ parse "event:" and "data:" lines
                                     ├─ token  → append to the draft message
                                     ├─ done   → commit ids, stop, invalidate the list
                                     └─ error  → throw ApiError(code, message)
```

Rules the adapter must hold to:

- **A partial line is buffered, never parsed.** A chunk boundary can fall inside `data: {"content":"he`, so the buffer is only drained on a blank line.
- **The reader is always released**, in a `finally`, and the connection is aborted on unmount, on send of a second message, and on a route change.
- **`token` appends, it does not replace.** The whole draft stays in one place, so a React re-render mid-stream cannot lose the first fragment.
- **`done` is the only success.** A stream that closes without a `done` event is an error, not a truncated answer, and the draft is marked incomplete.
- **`error` carries a contract code**, so a `rate_limited` event is handled like a `rate_limited` response.
- **The network request is `fetch`, not Axios**, because Axios cannot hand back a live reader in the browser. This is the one place the two HTTP clients coexist, and the adapter is the only file that knows it.

### State during a stream

The draft lives in the query cache under the conversation's message list, not in a component. `useSendMessage` owns the lifecycle: optimistic user message, streamed assistant draft, then `done` triggers a refetch of the conversation and of the list. A component that unmounts mid-stream leaves no orphan state behind, because the state was never in the component.

## 6. Error handling

### One error type

`shared/api/apiError.ts`:

| Field | Type | Source |
|---|---|---|
| `code` | contract code union | `error.code` in the body |
| `message` | `string` | `error.message` in the body |
| `details` | `Record<string, string[]>` | `error.details` |
| `status` | `number` | HTTP status |

Every response failure and every thrown value passes through one constructor. A caller never sees a raw Axios error, and never branches on a status number when a code is available.

### Where errors are handled

| Layer | Responsibility |
|---|---|
| `apiClient` | transport: timeout, cancellation, refresh, normalisation |
| mutation hook | decides the user-visible outcome, per mutation |
| component | renders a state, never parses a message |
| `ErrorBoundary` | a render crash, nothing else |

A mutation hook maps codes to outcomes, once, next to the mutation: `validation_error` to field errors, `unauthorized` to a sign-out, `rate_limited` and `quota_exhausted` to a banner carrying `Retry-After`, `llm_unavailable` to a retry affordance, `not_found` to a redirect.

### Rate limits

`429` is a normal outcome, not a failure to apologise for. The response carries `Retry-After`, parsed by `parseRetryAfter` into a duration, and the UI shows when the user can try again. A `quota_exhausted` says the service is at its daily cap and comes back tomorrow. Neither offers a purchase, because there is nothing to buy.

### Last resort

`app/ErrorBoundary.tsx` catches a render crash, shows a recoverable screen, and offers a reload. Network failures never reach it, because they are values by then.

## 7. Rendering and routes

| Route | Component | Guard | Loaded |
|---|---|---|---|
| `/` | `HomePage` | public | lazily |
| `/login` | `LoginPage` | public, redirect if signed in | lazily |
| `/register` | `RegisterPage` | public, redirect if signed in | lazily |
| `/chat` | `ChatPage` | authenticated | lazily |
| `/chat/:uuid` | `ConversationPage` | authenticated | lazily |
| `*` | `NotFoundPage` | public | eagerly |

Every page component is behind `React.lazy` with a shared `Suspense` fallback, so the initial bundle carries the router and nothing else. The guard is a layout route rendering an `Outlet`, so a new protected route costs one line.

`BrowserRouter` is used, not the data router: there is no loader, and the server state is TanStack Query's job. The consequence is that every host must rewrite unknown paths to `index.html`, which is a deployment requirement, not a code one.

## 8. Build and configuration

| Concern | Mechanism |
|---|---|
| API base URL | `VITE_API_URL`, validated once in `shared/api/env.ts` |
| App name | `VITE_APP_NAME`, injected into the document title |
| Default theme | `VITE_DEFAULT_THEME`, applied before first paint |
| Design tokens | `@theme` in CSS, no `tailwind.config.js` |
| Type safety | `strict` plus `noUncheckedIndexedAccess`, enforced by a real `tsc -b` |

An unset or malformed variable is a startup error with a readable message, never an `undefined` that surfaces later as a 404 on an unknown host.
