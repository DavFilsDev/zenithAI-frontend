# Architecture

This document describes the target architecture. P2 implemented the tree, the layers, the query ownership and the streaming flow below; the remaining differences are called out where they matter, most notably token storage, which P4.3 changes.

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
├── index.css                    the only stylesheet
├── assets/
├── app/
│   ├── App.tsx                  providers and routes, no data fetching
│   ├── router.tsx               routes, lazy, guards
│   ├── providers.tsx            QueryClient, Theme, ProfileBootstrap
│   ├── ChatShell.tsx            authenticated shell, owns the profile modal
│   └── ProfileBootstrap.tsx     session bootstrap from GET /auth/profile/
├── features/
│   ├── auth/
│   │   ├── api/authApi.ts       register, token, logout, profile
│   │   ├── api/queryKeys.ts
│   │   ├── model/useLogin.ts    react-hook-form + mutation
│   │   ├── model/useRegister.ts
│   │   ├── model/useProfile.ts  useProfileQuery and useUpdateProfile
│   │   ├── model/useLogout.ts
│   │   ├── pages/LoginPage.tsx
│   │   ├── pages/RegisterPage.tsx
│   │   └── components/UserProfileModal.tsx
│   ├── chat/
│   │   ├── api/conversationsApi.ts
│   │   ├── api/messagesApi.ts
│   │   ├── api/streamMessage.ts the SSE adapter
│   │   ├── api/queryKeys.ts
│   │   ├── api/types.ts
│   │   ├── model/useConversations.ts
│   │   ├── model/useConversation.ts
│   │   ├── model/useSendMessage.ts
│   │   ├── model/chatUiStore.ts sidebar, draft, streaming flag
│   │   ├── pages/ChatPage.tsx
│   │   └── components/          Sidebar, ConversationList, ChatWindow,
│   │                            MessageList, MessageBubble, Composer,
│   │                            SidebarHeader, SettingsDropdown, UserButton
│   └── home/
│       ├── pages/HomePage.tsx
│       └── components/          AnimatedBackground, GlassButton, Typewriter
└── shared/
    ├── api/
    │   ├── apiClient.ts         instance, base URL, timeout
    │   ├── authInterceptor.ts   request header, single-flight refresh
    │   ├── apiError.ts          ApiError with code and details
    │   ├── api.generated.ts     generated from the backend schema
    │   ├── env.ts               typed, validated import.meta.env
    │   ├── tokenManager.ts      token storage; P4.3 moves access to memory
    │   ├── userCache.ts         cached profile, no conversation data
    │   └── types.ts             shared request and response types
    ├── auth/
    │   ├── sessionStore.ts      Zustand session slice: user, status
    │   └── useSession.ts
    ├── ui/                      Button, Input, CardHeader, ThemeToggle,
    │                            ThemeProvider, Spinner, RateLimitToast,
    │                            notify, toastConfig
    ├── hooks/useOnClickOutside.ts
    └── lib/                     logger, parseRetryAfter
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
                 └─ POST /auth/token/  { access, refresh, user_id, email, username }
                      ├─ tokenManager.setTokens()
                      │    ├─ access  → memory
                      │    └─ refresh → sessionStorage
                      └─ userCache.write(user)
       └─ onSuccess
            ├─ sessionStore.setUser(user)
            ├─ queryClient.setQueryData(authKeys.profile, user)
            └─ invalidate conversations
```

The target is an access token in a module-level variable, never in `localStorage`, and a refresh token in `sessionStorage` so the session does not outlive the tab. That is P4.3. Today `tokenManager` still writes both tokens to `localStorage`, which is the defect P4.3 closes; the flow above is otherwise the implemented one.

### Attaching the token

`shared/api/authInterceptor.ts` reads the access token on the way out and sets `Authorization: Bearer <token>`. No caller ever sets a header.

### Expiry and refresh

On a `401`, and only on a `401`:

```
apiClient receives 401
  └─ is this an auth or profile endpoint? → reject, no refresh
  └─ is this a retry of the same request? → endSession() on a 401
  └─ otherwise → refreshAccessToken()
       └─ an in-flight promise exists? → await the same promise
       └─ otherwise                    → start one refresh
            └─ POST /auth/token/refresh/  { refresh } → { access, refresh }
                 ├─ success → store the new pair, replay the original request
                 └─ failure → endSession() on a 401
```

One refresh at a time. Without this, five concurrent requests produce five refresh calls, and rotation makes the last writer win while earlier replays carry a superseded token. The in-flight promise is shared, not a counter, and it is cleared when it settles so a later `401` starts a fresh refresh.

The refresh request itself bypasses the interceptor, otherwise it recurses. `/auth/token/`, `/auth/register/`, `/auth/profile/` and `/auth/logout/` never trigger a refresh: the first two are unauthenticated, the profile call is the session bootstrap, and logout must not refresh a session that is ending. A retried request or a failed refresh ends the session only on a `401`; a `500` or network error is returned to the caller with the session intact.

### Rate limits

`ApiError` carries `retryAfter`, parsed from the `Retry-After` header. A `rate_limited` or `quota_exhausted` failure is shown through `notify.rateLimit`, which renders the wait and a retry action that repeats the failed operation. `quota_exhausted` says the daily limit was reached; neither message mentions a purchase.

### Development logging

In development, every failed request is logged with its HTTP status and contract code, and `main.tsx` logs unhandled promise rejections and window errors. Production stays quiet.

### Sign out

```
useLogout
  └─ authApi.logout()      captures the refresh token, clears tokens and cached profile
  └─ sessionStore.clear()  clears the user and marks the session anonymous
  └─ queryClient.clear()   drops every cached conversation and message
  └─ navigate('/login')
```

The server call is best effort: a failed blacklist must not trap the user in a session they asked to leave. The local clear happens whatever the server answers, in `onSettled`, so a failed logout still clears the cache and the route guard sends the user to `/login`.

### Bootstrap

On boot, `ProfileBootstrap` restores the cached profile and calls `GET /auth/profile/` once, inside a pending state, then refreshes the session from the answer. A transient `500` or network failure keeps the cached session and the tokens; only a `401` or `403` calls `endSession()`, because a transient failure must not look like a logout.

## 5. Streaming flow

`POST /conversations/{uuid}/messages/stream/`, consumed with `fetch` and a `ReadableStream`. Not `EventSource`, because the request needs an `Authorization` header and an `AbortSignal`.

```
Composer
  └─ useSendMessage
       ├─ conversationsApi.create()               only when the route has no uuid
       └─ AbortController                        one per in-flight stream
            └─ streamMessage(uuid, content, { signal, onToken })
                 └─ fetch(POST ..., { signal, headers })
                      └─ response.body.getReader()
                           └─ TextDecoder + buffer split on "\n\n"
                                └─ parse "event:" and "data:" lines
                                     ├─ token  → onToken(content), append to the assistant message
                                     ├─ done   → stop, invalidate messages, detail and list
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

The optimistic user message and the streamed assistant message live in the query cache under the conversation's message list, not in a component. `useSendMessage` owns the lifecycle: create the conversation if needed, add the optimistic pair, append each token, then on `done` invalidate the messages, the conversation detail and the list. A component that unmounts mid-stream leaves no orphan state behind, because the state was never in the component; the composer draft is restored only when the failure is `rate_limited` or `quota_exhausted`.

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
| `ErrorBoundary` (P4.8) | a render crash, nothing else |

A mutation hook maps codes to outcomes, once, next to the mutation: `validation_error` to field errors, `unauthorized` to a sign-out, `rate_limited` and `quota_exhausted` to a banner carrying `Retry-After`, `llm_unavailable` to a retry affordance, `not_found` to a redirect.

### Rate limits

`429` is a normal outcome, not a failure to apologise for. The response carries `Retry-After`, parsed by `parseRetryAfter` into a duration, and the UI shows when the user can try again. A `quota_exhausted` says the service is at its daily cap and comes back tomorrow. Neither offers a purchase, because there is nothing to buy.

### Last resort

P4.8 adds `app/ErrorBoundary.tsx` to catch a render crash, show a recoverable screen, and offer a reload. Network failures never reach it, because they are values by then.

## 7. Rendering and routes

| Route | Component | Guard | Loaded |
|---|---|---|---|
| `/` | `HomePage` | public | lazily |
| `/login` | `LoginPage` | public, redirect if signed in | lazily |
| `/register` | `RegisterPage` | public, redirect if signed in | lazily |
| `/chat/:uuid?` | `ChatShell` → `ChatPage` | authenticated | after the guard resolves |
| `*` | redirect to `/` | public | eagerly |

`HomePage`, `LoginPage` and `RegisterPage` are behind `React.lazy` with a shared `Suspense` fallback. The authenticated shell is one route with an optional `uuid`, so creating the first conversation changes the URL without remounting `ChatPage` or cancelling the stream. The guard is a layout route rendering an `Outlet`, so a new protected route costs one line.

`BrowserRouter` is used, not the data router: there is no loader, and the server state is TanStack Query's job. The consequence is that every host must rewrite unknown paths to `index.html`, which is a deployment requirement, not a code one.

## 8. Build and configuration

| Concern | Mechanism |
|---|---|
| API base URL | `VITE_API_URL`, validated once in `shared/api/env.ts` |
| App name | `VITE_APP_NAME`, injected into the document title |
| Default theme | `VITE_DEFAULT_THEME`, applied before first paint |
| Design tokens | `@theme` in CSS, no `tailwind.config.js` |
| Dark mode | class-based `@custom-variant dark`, toggled by `ThemeProvider` |
| Markdown | `@plugin "@tailwindcss/typography"` in `index.css` |
| Type safety | `strict` today; P3.1 makes `tsc -b` the gate and P3.2 adds `noUncheckedIndexedAccess` |

An unset or malformed variable is a startup error with a readable message, never an `undefined` that surfaces later as a 404 on an unknown host.
