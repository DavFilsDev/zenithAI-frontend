# Improvement Plan

Audit of the current code, then the roadmap that brings it to the architecture in [`ARCHITECTURE.md`](ARCHITECTURE.md) and the contract in [`API_CONTRACT.md`](API_CONTRACT.md). The target architecture and the API contract are the reference; this document is the work list.

Nothing here has been implemented yet. Every checkbox is open. A box is ticked in the same commit that completes it, and a pull request that moves one says which one.

## 1. Audit findings

Read-only pass over `src/`, the config files, and every claim in the previous `README.md`. Findings are ordered by user impact, not by file.

### 1.1 The documentation described a product that does not exist

| Claim in the old README | Reality |
|---|---|
| "Real-time Chat: WebSocket support" (`:100`), "WebSocket: Native WebSocket API" (`:122`), "Check WebSocket URL" (`:220`) | No WebSocket, no `EventSource`, no `ReadableStream` anywhere in `src/`. Not one line. |
| "Code Highlighting: Prism.js" (`:121`) | `prismjs` is not a dependency. No highlighter is installed at all. |
| "Styling: Tailwind CSS + CSS Modules" (`:113`) | Zero `*.module.css` files. One stylesheet: `src/index.css`. |
| "Server state: React Query" (`:207`) | `@tanstack/react-query` is not in `package.json`. |
| "Framework: React 18" (`:110`) | `react` and `react-dom` are `^19.2.0` (`package.json:15-16`). |
| "Type Safety: Full TypeScript support" (`:106`) | `strict` is declared, and never enforced. See 1.7. |
| `npm run format` (`:95`), `test` (`:137`), `test:coverage` (`:140`), `test:e2e` (`:143`), `npm run deploy` (`:172`) | None of the five exists. `prettier` is not even a dependency. |
| "MIT License - see LICENSE file" (`:225`) | There was no `LICENSE` file. |
| `VITE_APP_NAME` set to a different product's name and a "Clone" suffix (`:71`) | Contradicted `.env.example:3`, read by no code, and the product name is forbidden by the contract. |
| `VITE_DEFAULT_THEME` (`:72`) | Existed in neither `.env.example` nor the code. |
| `public/`, `src/utils/`, `src/styles/` (`:45`, `:55`, `:57`) | None of the three directories exists. |
| "Settings - User preferences" (`:129`) | A dropdown holding a theme toggle and a logout. No page, no route. |
| "Profile - User profile management" (`:130`) | A modal, and its three save handlers are `console.log`. See 1.6. |
| "Icons: React Icons" (`:119`) | `react-icons` in 6 files and `lucide-react` in 4, in parallel. `date-fns` is used and was not listed at all. |
| "Email: miharisoadavidfils.com" (`:231`) | Not an address. |
| "Documentation: Check the Wiki" (`:230`) | No wiki. |
| "Start backend: `docker-compose up`" (`:249`) | The backend has no `docker-compose`. |
| "Not availible from now" (`:7`) | Typo, and a dead live-demo link. |

### 1.2 The API calls are on paths the contract does not describe

`VITE_API_URL` was `http://localhost:8000/api`. The contract base is `/api/v1`, and the conversation paths are flat. The real call sites:

| Contract endpoint | Call site | Path requested today |
|---|---|---|
| `POST /auth/register/` | `src/services/auth.ts:42` | `/auth/register/` |
| `POST /auth/token/` | `src/services/auth.ts:9` | `/auth/token/` |
| `POST /auth/token/refresh/` | `src/services/refreshTokenService.ts:15` | `/auth/token/refresh/` |
| `GET /auth/profile/` | `src/services/auth.ts:18`, `:47`, `:70` | `/auth/profile/` |
| `GET /conversations/` | `src/services/chat.ts:6` | `/chat/conversations/` |
| `GET /conversations/{uuid}/` | `src/services/chat.ts:11` | `/chat/conversations/{id}/` |
| `POST /conversations/{uuid}/messages/` | `src/services/chat.ts:17` | `/chat/chat/{conversation_id}/` |
| `DELETE /conversations/{uuid}/` | `src/services/chat.ts:25` | `/chat/conversations/{id}/` |

Five contract endpoints have no call site at all: `POST /auth/logout/`, `PATCH /auth/profile/`, `POST /conversations/`, `GET /conversations/{uuid}/messages/`, `GET /health/`. There is no `PUT` and no `PATCH` anywhere in `src/`.

The base URL appears in exactly two places, `src/services/api.ts:8` and `src/services/refreshTokenService.ts:12`. If `VITE_API_URL` is unset, the first becomes `undefined` and every request silently resolves against a relative path, which surfaces as a 404 rather than a clear error.

### 1.3 No streaming, and no WebSocket either

There is no streaming code at all. `src/services/chat.ts:20` awaits a complete `POST` and returns a whole message. The "assistant is typing" indicator at `src/components/chat/MessageList.tsx:41-51` is a three-dot CSS animation keyed off `isSending`, so it is a placeholder for a stream that was never built.

`VITE_WS_URL` in `.env.example:2` was the only trace of a WebSocket, and no file read it. The contract settles the question: SSE only.

### 1.4 Tokens

`localStorage`, in plaintext, both tokens, for the whole 7-day refresh lifetime. `src/services/tokenManager.ts:2-3` defines the keys and `:8-18` reads and writes them.

Three defects in the auth flow:

- **The refresh is not single-flight.** `src/services/api.ts:45-56` refreshes once per failing request. Five concurrent `401`s fire five refreshes, and because the response replaces the stored access token each time, the last write wins while earlier replays carry a superseded token.
- **`/auth/profile/` is missing from the no-refresh list.** `src/types/auth.ts:8` lists only `/auth/token/`, `/auth/register/` and `/auth/token/refresh/`. A `401` from `GET /auth/profile/` — the call made on every boot at `src/contexts/AuthContext.tsx:24` — therefore triggers a refresh and, on failure, a hard `window.location.href = '/login'`. Stale token on boot, redirect loop.
- **`AuthContext` bypasses `tokenManager`.** `src/contexts/AuthContext.tsx:21`, `:29` and `:30` hardcode the strings `'accessToken'` and `'refreshToken'`. Renaming a key in one file silently breaks the other.
- **Any profile failure logs the user out.** `src/contexts/AuthContext.tsx:28-31` catches everything, deletes both tokens, and reports nothing. A backend 500 or a dropped connection is indistinguishable from a revoked session.
- **Logout never reaches the server.** `src/services/auth.ts:80-82` is `void`: it clears local storage and returns. `POST /auth/logout/` is unused, so a refresh token stays valid server-side until it expires on its own.
- **Nothing checks expiry.** No JWT is decoded. `tokenManager.hasValidTokens()` (`src/services/tokenManager.ts:25-27`) only tests that both strings are non-empty, despite the name. Expiry is discovered by getting a `401`.
- **Both tokens are sent on the login request.** The request interceptor at `src/services/api.ts:15-24` attaches the `Authorization` header unconditionally, including to `/auth/token/` and `/auth/register/`.

### 1.5 The chat state is persisted to `localStorage` and never cleared

`src/store/chatStore.ts:165` persists under the key `chat-storage`, and `:166-168` keeps the whole `conversations` array, message bodies included. Logout does not clear it. On a shared browser the next person to sign in sees the previous user's conversation titles and message text.

The store also persists state that should not exist. `startNewChat` (`:150-161`) fabricates a conversation with the literal id `'draft'`, `src/pages/Chat.tsx:32` then sends that id, and `src/services/chat.ts:17` builds the URL `/chat/chat/draft/`. The backend routes that path through `<int:conversation_id>`, so a draft send is a 404.

Two more consequences: `addMessage` (`:38-48`) no-ops when `currentConversation` is null, so the first message of a new chat is dropped from the optimistic UI and only reappears after the refetch at `:119`; and `isDraft` is set true at `:160` and never cleared except by `clearCurrentConversation`, so the empty state at `src/pages/Chat.tsx:35` stays on screen after the first message.

### 1.6 Profile editing is fake

`src/components/layout/Sidebar.tsx:53-66` — `handleUpdateEmail`, `handleUpdateUsername` and `handleUpdatePassword` each contain a `// Implement API call` comment and a `console.log`. `src/components/ui/UserProfileModal.tsx:39`, `:51` and `:70` call `setEditingField(null)` regardless, so the field closes and looks like it saved. Nothing is sent, nothing changes. This is the second-largest file in the app and the most misleading behaviour in it.

Logout is wired from `Sidebar.tsx:47-51` but leaves the user on `/chat/:id`; the redirect to `/login` only happens because `setUser(null)` re-renders `PrivateRoute`.

### 1.7 The type checker is a no-op

`tsconfig.json:2` is `"files": []` with two project references, and neither referenced project sets `composite`. Plain `tsc` at the root compiles zero files.

- `package.json:11` `"type-check": "tsc --noEmit"` checks nothing.
- `package.json:8` `"build": "tsc && vite build"` gates the build on nothing; `vite build` strips types without checking them, so a build passes with type errors in it.

`strict`, `noUnusedLocals`, `noUnusedParameters` and `verbatimModuleSyntax` are all declared in `tsconfig.app.json:20-25` and none of them has ever run. The correct invocations are `tsc -b` or `tsc -p tsconfig.app.json --noEmit`.

`any` is otherwise rare: 7 tokens on 4 lines, all in `src/services/` (`apiError.ts:3`, `:5`, `:12` and `refreshTokenService.ts:29`). No component, page, hook, store or type file contains one. There is no `@ts-ignore` anywhere.

`package.json:9` passes `--ext` to a flat-config ESLint, where the flag is redundant, and combines it with `--max-warnings 0` while `eslint.config.js:11` scopes rules to `**/*.{ts,tsx}` only. The `.js` files that `eslint .` still traverses produce "no matching configuration" warnings, which `--max-warnings 0` turns into a failing exit code.

### 1.8 Tailwind

`tailwind.config.js` is never loaded. Tailwind 4 with `@tailwindcss/vite` (`vite.config.ts:3`, `:8`) is configured in CSS, and `src/index.css:1` is the only Tailwind directive in the project. The `content` array, the `primary` colour and `plugins: []` have no effect, and every component works around this with raw arbitrary values such as `bg-[rgb(var(--color-primary))]` — roughly 40 occurrences.

`@tailwindcss/typography` is installed (`package.json:30`) and never activated: no `@plugin` in `src/index.css`, and `plugins: []` in the dead config. So the `prose prose-sm dark:prose-invert` at `src/components/chat/MessageBubble.tsx:32` produces no styles at all, and assistant messages render as unstyled inline text.

Dark mode is a third inconsistency. `src/main.tsx:11` adds the `dark` class unconditionally after `render()`, the theme is stored in `localStorage` by `src/contexts/ThemeContext.tsx:14`, but the `dark:` utilities across about 20 components resolve through Tailwind's default, which is `prefers-color-scheme`. The app's toggle and the operating system can disagree. `src/contexts/ThemeContext.tsx:32` also updates a `<meta name="theme-color">` that `index.html` does not contain, so that branch never runs.

Dead CSS in `src/index.css`: `.btn-primary` (`:38-40`), `.glass` (`:42-44`), `.gradient-primary` (`:46-52`), the whole `.go-toast*` family (`:77-97`, written for `react-hot-toast` v1 while v2 is installed), `.sidebar-transition` (`:100-102`), `.sidebar-collapsed` (`:105-107`), `.sidebar-content` (`:110-112`), and two `@keyframes fadeIn` blocks (`:114-121` and `:124-131`) with identical bodies. Conversely `animate-slide-up`, used at `src/components/ui/SettingsDropdown.tsx:108`, is not defined anywhere.

### 1.9 Markdown

`react-markdown@^10.1.0` renders assistant text at `src/components/chat/MessageBubble.tsx:33`. User messages go through `whitespace-pre-wrap` (`:30`) and are escaped by React.

The good news first: `dangerouslySetInnerHTML` appears nowhere in `src/`, and v10 does not enable raw HTML without `rehype-raw`, so there is no live XSS sink. The hardening gap is real but not urgent: `rehype-sanitize` is absent, and link protocols are not filtered either.

The visible gaps are elsewhere. `remark-gfm` is not installed, so the tables, strikethrough and task lists that an assistant emits routinely render as literal text. No highlighter is installed, and `<ReactMarkdown>` is given no `components` prop, so code blocks are unstyled `<pre>`. The copy button at `:63` calls `navigator.clipboard.writeText` without awaiting or catching, and the edit button at `:66-76` has no `onClick` at all.

### 1.10 Accessibility is not implemented

`aria-*`: zero occurrences in `src/`. `role=`: zero. `tabIndex`, `autoFocus`, `.focus()`: zero. `htmlFor`: zero. `eslint-plugin-jsx-a11y` is not installed.

The defects that block a real user:

- The conversation list is a `<div onClick>` per row (`src/components/layout/Sidebar.tsx:216-236`) with no `tabIndex` and no `role`. Chat history is entirely unreachable by keyboard and by screen reader.
- `UserProfileModal` (266 lines) has no `role="dialog"`, no `aria-modal`, no focus trap, no `Escape`, no focus restoration, and no scroll lock. It is also mounted twice, at `Sidebar.tsx:151-162` and `:255-266`.
- `src/components/ui/Input.tsx:24` renders a `<label>` with no `htmlFor` and the input at `:26` has no `id`, so no label is associated with any field in Login, Register or the profile modal. Validation errors at `:55` are colour-only, with no `role="alert"` and no `aria-describedby`.
- The typing indicator (`MessageList.tsx:41-51`), the spinner (`MessageList.tsx:54-58`) and the full-screen loader (`Loader.tsx:1-7`) have no `aria-live` and no text alternative.
- Icon-only buttons with no accessible name: `Sidebar.tsx:91-98`, `SidebarHeader.tsx:19-29`, `MessageBubble.tsx:53-64` and `:66-76`, `ChatInput.tsx:72-93`, `Input.tsx:42-52`.
- Two keyboard handlers exist in the whole app: Enter to send (`ChatInput.tsx:53`) and Ctrl+B to toggle the sidebar (`Sidebar.tsx:76`).
- There is no `prefers-reduced-motion` handling, and `animate-pulse`, `animate-bounce`, `animate-spin` and `scrollIntoView({behavior:'smooth'})` are used unconditionally.

### 1.11 Error handling

`ApiError` (`src/services/apiError.ts`) reads `data.detail` then `data.message` (`:15`). The contract sends `{"error":{"code","message","details"}}`, so the code is never read, and a DRF field-error map is not read either. `src/pages/Register.tsx:44` therefore reports only "Registration failed".

There is no `ErrorBoundary` anywhere: a render crash blanks the screen with no recovery.

Fifteen errors are swallowed to the console. The two that matter to a user: `src/contexts/AuthContext.tsx:28-31` deletes the session on any failure, and `src/components/ui/UserProfileModal.tsx:40-42`, `:52-54` and `:71-73` report a failed save with `console.error` only, leaving the UI stuck in edit mode.

`src/pages/Login.tsx:39-54` is the one handler done properly — `catch (error: unknown)`, `instanceof ApiError`, branching on the status. It is the pattern the rest of the app should follow.

Three toast systems coexist: `<Toaster>` with inline styles at `src/App.tsx:53-101`, the `useToast` wrapper and `src/config/toastConfig.ts`, and direct `react-hot-toast` calls from `Register.tsx:41-44` and `chatStore.ts:62-146`, with two different durations for the same severity.

### 1.12 Dead and duplicated code

| Kind | Where |
|---|---|
| Whole files | `src/hooks/useChat.ts` (124 lines, a second full implementation of the chat domain in `useState`, imported nowhere), `src/components/ui/CustomToast.tsx` (44 lines, imported nowhere) |
| Exports | `refreshTokenService.refreshWithRetry` (`refreshTokenService.ts:29-39`, holds 3 of the 7 `any` tokens), `interface AuthError` (`types/auth.ts:1-5`), `ApiError.isNotFound()` (`apiError.ts:23-25`), `useChatStore.setConversations` / `setCurrentConversation` (`chatStore.ts:14-15`) |
| Duplication | `UserProfileModal` mounted twice, `SettingsDropdown` mounted twice, the sidebar collapse toggle written twice (`Sidebar.tsx:90-104` and `SidebarHeader.tsx:18-37`), the sun/moon icon taken from `react-icons` in `SettingsDropdown.tsx:67-72` and from `lucide-react` in `ThemeToggle.tsx:34-43` |
| Config | `VITE_WS_URL` and `VITE_APP_NAME` declared and never read, `tailwind.config.js` never loaded, `@tailwindcss/typography` installed and never activated |
| Routing | No `*` catch-all, so `src/pages/Home.tsx:74` and `:77` link to `/privacy` and `/terms`, which do not exist, with the two labels swapped. `GlassButton.tsx:25` renders a router destination as a plain `<a href>`, forcing a full page load. `index.html:5` points at `/vite.svg` with no `public/` directory. `ChatWindow.tsx:31-33` renders the literal string "title chat" as the conversation heading, and the real title is never shown. |

### 1.13 Tests and CI

Zero test files, zero test tooling, no `.github/`, no coverage. Nothing in the repository asserts that the app starts, that sign-in works, or that a message is sent.

### 1.14 What is genuinely solid

Worth keeping: `strict` is already declared everywhere it should be. The `ApiError` class exists and is already used by every interceptor. `react-markdown` is the right choice and no raw HTML is ever rendered. Form handling is already on `react-hook-form`. The single Axios instance with two interceptors is the right shape. `lucide-react@1.7.0` is a real published version, confirmed in `package-lock.json:3744-3747`, and it is the better icon library of the two installed.

## 2. Assumptions

Each of these was a decision rather than a question. Each is recorded here so it can be reversed deliberately.

1. **`node_modules` is not installed in this checkout**, so every finding is static: no build, no lint, no test was executed. Claims about scripts and about the type checker come from reading the configuration, and the `tsc` no-op is a structural consequence of `tsconfig.json:2`.
2. **`Used by frontend` in the contract means "the code exercises the endpoint at all"**, including on a legacy path. A `Yes` does not mean the contract path is already correct, which is why the contract carries a table of the real call sites.
3. **The backend copy of the contract wins.** `zenithAI_django-backend/docs/API_CONTRACT.md` was written first and is more precise than the summary it was derived from, so the frontend copy reproduces it rather than the summary. The only differences are the ones a shared file requires: the header names the other repository, the `Status:` line points at the backend's documentation instead of a relative path that does not resolve here, the endpoint table carries a `Used by frontend` column, and §3.3 lists the real call sites.
4. **`VITE_APP_NAME` and `VITE_DEFAULT_THEME` are deliberately absent from the contract.** They are presentational, they touch no endpoint, and the contract already states that `VITE_API_URL` is the only variable the two sides share. Adding them would have made the two copies differ for no benefit, so they live in `.env.example` and the README instead, and `.env.example` is where a change to them belongs.
5. **The backend is free to break its current paths.** The `/api` base, the `/chat/` prefix and the integer ids are all scheduled for removal on the backend side. The frontend does not preserve them, and does not build a compatibility layer for them.
6. **No commit will ever carry a private key.** The contract puts the LLM key on the server and forbids a user key. The frontend has no field for one and will not gain one.
7. **The author of record is Fanampinirina Miharisoa David Fils RATIANDRAIBE** (`README.md:242` in the previous README), with the address `miharisoadavidfils@gmail.com` as given in the backend README, and the current year, 2026.
8. **Node 20+ is the floor.** The README previously claimed "18+ or 20+", which is not a real statement; Vite 7 requires Node 20.19 or newer.
9. **Static hosting is enough.** The frontend is a client-rendered SPA with no server component, so no platform is needed that can run Node at request time. This is what makes the bandwidth difference between the free plans the deciding factor.
10. **CORS stays the backend's job.** The frontend calls the backend cross-origin, so `CORS_ALLOWED_ORIGINS` must list the deployed frontend origin. The same-origin proxy in section 6 is an alternative, not the plan.
11. **Vercel's Hobby plan is acceptable** even though its guidelines restrict it to personal, non-commercial use, because the project is a non-commercial open-source application with no revenue and no customer. If that ever stops being true, P5.1 must be revisited before any deployment.
12. **`ARCHITECTURE.md` describes the target, not the present.** The present is in section 1 of this document, with file paths.
13. **Accessibility is a requirement, not an enhancement.** The plan treats the keyboard-inaccessible conversation list and the modal without dialog semantics as defects to fix in P4, not as polish.

## 3. Roadmap

Effort: **S** under half a day, **M** one to three days, **L** more than three days.

### P0 — Consistency with the contract

Make the code match the contract's shape before adding anything. Nothing here changes behaviour for a user except that the app stops lying about what it does.

- [ ] **P0.1** Remove `VITE_WS_URL` from `.env.example` and from the README. The contract states there is no WebSocket. — *S* — no file references it any more, and `grep -r VITE_WS_URL` returns nothing. — Depends on: —
- [ ] **P0.2** Point `VITE_API_URL` at `/api/v1` and move every call site from `/chat/conversations/` to `/conversations/` and from `/chat/chat/{id}/` to `/conversations/{uuid}/messages/`. — *M* — no path outside the contract is requested by any file, and conversation ids are UUIDs. — Depends on: P0.1.
- [ ] **P0.3** Create the conversation explicitly with `POST /conversations/` before posting the first message, and delete the `'draft'` id hack. — *M* — no literal `'draft'` id is sent, and a new conversation gets a real UUID from the response. — Depends on: P0.2.
- [ ] **P0.4** Read the environment through one typed module, validate it with `zod`, and fail with a readable message when a variable is missing or malformed. — *M* — a bad `VITE_API_URL` stops the app at startup with a message naming the variable, instead of producing silent 404s. — Depends on: —
- [ ] **P0.5** Add `VITE_APP_NAME` to the document title and `VITE_DEFAULT_THEME` to the initial theme, replacing the hardcoded `<title>` in `index.html` and the unconditional `classList.add("dark")` in `src/main.tsx`. — *S* — the title reads "Zenith AI" and the initial theme follows the variable, with no flash of the wrong theme. — Depends on: P0.4.
- [ ] **P0.6** Parse the contract error envelope in `ApiError`, expose `code` and `details`, and map `validation_error` onto form fields. — *M* — a bad password shows the server's message, and no caller reads `data.detail`. — Depends on: —
- [ ] **P0.7** Delete the dead code found in 1.12: `src/hooks/useChat.ts`, `src/components/ui/CustomToast.tsx`, `refreshWithRetry`, `interface AuthError`, the unused store actions, the dead CSS rules, and the duplicate `@keyframes fadeIn`. — *S* — the files are gone, the build passes, and the dead CSS no longer ships. — Depends on: —
- [ ] **P0.8** Remove `tailwind.config.js` and the 11 dead `any` tokens, and activate `@tailwindcss/typography` or drop it. — *S* — no `tailwind.config.js` exists, `@plugin "@tailwindcss/typography"` is in `index.css`, and `grep -rn "any"` in `src/` returns only the two documented boundary types. — Depends on: —
- [ ] **P0.9** Replace the duplicated token keys in `AuthContext` with `tokenManager` calls, and stop deleting the session when a profile call fails for a transient reason. — *S* — a `500` on boot leaves the user signed in, and the string `'accessToken'` appears in one file only. — Depends on: —

### P1 — The API layer

One client, one refresh, one error shape. This is the foundation the streaming work in P2 sits on.

- [ ] **P1.1** Add `GET /auth/profile/` and `PATCH /auth/profile/` for real, replacing the three `console.log` stubs, and make the modal show a real success or failure. — *M* — editing the email persists through a reload, and a rejected save keeps the field open with a message. — Depends on: P0.6.
- [ ] **P1.2** Make the refresh single-flight: one in-flight promise shared by every waiting request, the refresh call itself bypassing the interceptor. — *M* — six concurrent `401`s produce exactly one `POST /auth/token/refresh/`, and all six requests replay successfully. — Depends on: P0.2.
- [ ] **P1.3** Add `/auth/profile/` to the no-refresh list, and stop hard-redirecting on a retried non-`401` failure. — *S* — a `500` on a retried request does not sign the user out. — Depends on: P1.2.
- [ ] **P1.4** Call `POST /auth/logout/` on sign-out, best effort, then clear the query cache so no conversation survives the session. — *M* — signing out removes the `chat-storage` entry, and a `401` at `/logout/` still signs the user out locally. — Depends on: P1.2.
- [ ] **P1.5** Generate the API types from the backend's OpenAPI schema with `openapi-typescript`, and commit the generated file with a script that regenerates it. — *M* — a payload field renamed on the backend breaks the type-check rather than production. — Depends on: P0.2.
- [ ] **P1.6** Read the `Retry-After` header and build the `429` experience: a clear message, the remaining time, and a retry affordance. — *M* — a `rate_limited` and a `quota_exhausted` response each produce a specific message with the wait, and no message anywhere offers a purchase. — Depends on: P0.6.
- [ ] **P1.7** Consolidate the three toast systems into one, with one duration per severity. — *S* — one `Toaster`, one call site pattern, one duration table. — Depends on: P0.7.
- [ ] **P1.8** Add a dev-only network panel, or at minimum log unhandled errors with the contract code, instead of discarding them. — *S* — a failed request is visible with its code in the console, and no `catch` block is empty. — Depends on: P1.6.

### P2 — Streaming chat, and the feature architecture

The phase that makes the product feel like the product.

- [ ] **P2.1** Add the `GET /conversations/{uuid}/messages/` client, and stop relying on messages embedded in the conversation payload. — *S* — opening a conversation fetches its messages from the contract endpoint. — Depends on: P0.2.
- [ ] **P2.2** Add TanStack Query and move all server state into it: conversations, conversation detail, messages, profile. — *L* — no `useEffect` in the codebase fetches data, and `QueryClientProvider` wraps the app. — Depends on: P1.5.
- [ ] **P2.3** Reduce Zustand to UI state only: sidebar, composer draft, streaming flag, theme. Remove `persist` from the chat store. — *M* — nothing conversation-related is in `localStorage`, and the `chat-storage` key is gone. — Depends on: P2.2.
- [ ] **P2.4** Build the SSE adapter: `fetch` plus `ReadableStream`, a buffer split on the blank line, `token` / `done` / `error` handled as declared. — *L* — a stream interrupted mid-chunk still renders every complete fragment received so far, and a stream that ends without `done` is reported as an error rather than a truncated answer. — Depends on: P1.2.
- [ ] **P2.5** Cancel properly: one `AbortController` per in-flight stream, aborted on unmount, on a second send, and on a route change. Always release the reader. — *M* — navigating away mid-answer leaves no open connection and no orphan draft, visible in the network panel. — Depends on: P2.4.
- [ ] **P2.6** Write the streamed answer into the query cache, and refetch the conversation and the list on `done`. — *M* — reloading during a stream loses nothing, and the conversation title appears in the sidebar as soon as it exists. — Depends on: P2.4, P2.2.
- [ ] **P2.7** Implement conversation creation, rename and delete against the contract, with `PATCH` limited to `title`. — *M* — a conversation can be created, renamed and deleted, and no `PUT` is ever issued. — Depends on: P0.3.
- [ ] **P2.8** Move to a feature-based tree: `app/`, `features/auth`, `features/chat`, `shared/`, as described in [`ARCHITECTURE.md`](ARCHITECTURE.md). — *L* — no feature imports another feature's internals, and the old `pages/`, `contexts/`, `services/`, `store/` and `types/` directories no longer exist. — Depends on: P2.2, P2.3, P2.7.
- [ ] **P2.9** Add pagination to the conversation list, reading `results` and using `count`, `next` and `previous` for navigation. — *M* — the list pages at 20 items and the backend's page size is respected. — Depends on: P2.7.

### P3 — Quality

Make the strict settings real, and add the tests that were never there.

- [ ] **P3.1** Fix the type-check: `tsc -b` in `type-check`, `composite` on the referenced projects, and the real gate in `build`. — *S* — a deliberate type error fails `npm run type-check` and `npm run build`. — Depends on: —
- [ ] **P3.2** Add `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`, and fix what they surface. — *M* — the build is clean with both on. — Depends on: P3.1.
- [ ] **P3.3** Turn on type-aware `typescript-eslint`, so the current `recommended` set becomes the checked one. — *M* — `no-floating-promises` and `no-misused-promises` are active and the codebase is clean. — Depends on: P3.1.
- [ ] **P3.4** Add `eslint-plugin-jsx-a11y` and fix the violations it reports. — *M* — the plugin is in the lint set and `npm run lint` passes with `--max-warnings 0`. — Depends on: P3.1.
- [ ] **P3.5** Repair the `lint` script: drop the redundant `--ext`, scope the flat config so no file is left unconfigured, and keep `--max-warnings 0` only once the config is exhaustive. — *S* — `npm run lint` exits 0 on a clean tree. — Depends on: —
- [ ] **P3.6** Add Prettier with `prettier-plugin-tailwindcss`, and a `format` script. — *S* — `npm run format` rewrites the tree, and a second run is a no-op. — Depends on: —
- [ ] **P3.7** Add husky and lint-staged, so a commit cannot carry a type error or a lint error. — *M* — a commit touching a `.tsx` file runs the linter and the type-check. — Depends on: P3.5.
- [ ] **P3.8** Add Vitest, Testing Library and MSW, with handlers generated from the OpenAPI schema. — *L* — a test renders a component against a mocked contract response, not a hand-written fixture. — Depends on: P1.5.
- [ ] **P3.9** Write the tests that matter: sign in, register, send a message, read a `429`, cancel a stream, sign out. — *L* — each of the six flows has a test, and coverage on `features/` and `shared/api/` is at least 80%. — Depends on: P3.8, P2.4.
- [ ] **P3.10** Add Playwright and two or three end-to-end journeys: sign in and hold a conversation, and hit a rate limit. — *M* — two journeys pass against a locally running stack. — Depends on: P3.9.

### P4 — Security and accessibility

- [ ] **P4.1** Keep raw HTML off, add `rehype-sanitize`, and filter link protocols, so the markdown path stays safe if raw HTML is ever enabled. — *S* — `rehype-sanitize` is in the pipeline and a `javascript:` link is neutralised. — Depends on: —
- [ ] **P4.2** Add `remark-gfm` and a syntax highlighter, and map the `code` and `pre` components. — *M* — a table renders as a table and a fenced block is highlighted. — Depends on: —
- [ ] **P4.3** Move the access token to memory and the refresh token to `sessionStorage`, following section 4 below. — *M* — no token is readable from `localStorage`, and a reload inside the tab keeps the session while the tab closing ends it. — Depends on: P1.2.
- [ ] **P4.4** Add a Content Security Policy, as a `<meta>` tag for the static hosts and a real header where the host allows it. — *M* — inline script execution is blocked in the deployed app, and the streaming path still works. — Depends on: —
- [ ] **P4.5** Make the whole app keyboard reachable: the conversation rows become buttons, the dropdowns take `aria-expanded` and close on `Escape`, every icon-only control gets an accessible name. — *M* — the application is fully navigable with `Tab` alone, including chat history. — Depends on: —
- [ ] **P4.6** Give the modal real dialog semantics: `role="dialog"`, `aria-modal`, a labelled title, a focus trap, `Escape` to close, focus restored to the trigger, and a scroll lock. Mount it once. — *M* — focus never escapes the modal, and it returns to the button that opened it. — Depends on: —
- [ ] **P4.7** Label every field, and link its error with `aria-describedby`; announce errors and the loading states with `aria-live`. — *M* — a screen reader announces a validation error and the streaming answer as they arrive. — Depends on: —
- [ ] **P4.8** Respect `prefers-reduced-motion` and add a route-level `Suspense` and an `ErrorBoundary`. — *M* — animation is off under reduced motion, and a render crash shows a recoverable screen instead of a blank one. — Depends on: —
- [ ] **P4.9** Fix the broken links: add a `*` catch-all, correct the swapped `/privacy` and `/terms` labels, drop the `<a href>` router navigation, and add a favicon. — *S* — no link in the app leads to a dead route, and a full page load no longer happens on internal navigation. — Depends on: —
- [ ] **P4.10** Lazy-load every route, and bring Lighthouse to 90 or better on performance, accessibility and best practices. — *M* — the initial bundle carries the router only, and the Lighthouse scores are at or above 90. — Depends on: P2.8, P4.5.

### P5 — Continuous integration, free deployment, showcase

- [ ] **P5.1** Deploy the frontend to a free static host, and record the choice, the build command, the output directory, the SPA rewrite and the environment variables in the README. — *M* — the deployed URL loads, a deep link such as `/chat` returns the app rather than a 404, and the URL is in the README. — Depends on: P4.9.
- [ ] **P5.2** Add the GitHub Actions workflow: lint, type-check, test, build, on pull requests and on `main`. — *M* — a pull request with a failing check cannot be merged, and the badge is in the README. — Depends on: P3.9, P2.8.
- [ ] **P5.3** Add `GET /health/` polling to a status indicator, so a sleeping backend is distinguishable from a broken one. — *S* — the app says the service is waking up rather than showing a bare error. — Depends on: P1.6.
- [ ] **P5.4** Write the showcase: screenshots, a short recording of a streamed answer, and a section stating the technical decisions and why they were made. — *M* — the README shows the product and explains its choices, with no claim that the code does not support. — Depends on: P5.1.
- [ ] **P5.5** Add the `/privacy` and `/terms` pages the landing page already links to, stating what is stored and that conversation content is sent to a third-party model provider on a free tier. — *M* — both links resolve, and the pages describe the actual behaviour. — Depends on: P4.9.

## 4. Token storage

### The decision

**The access token is held in memory only. The refresh token is held in `sessionStorage`. Nothing is written to `localStorage`.**

The current state is the opposite: both tokens sit in `localStorage` in plaintext (`src/services/tokenManager.ts:8-18`) for the full 7-day refresh lifetime, readable by any script on the page.

### Why

The contract fixes the transport: "JWT is carried in the request body as JSON, never in a query string or a cookie." That rules out the usual best answer. An httpOnly cookie is unreadable from JavaScript, which is precisely why it is safe against XSS, and it is unavailable here without breaking the contract on both sides. So the protection has to come from the storage medium rather than from the cookie.

That leaves three options, and they trade against each other on the same axis:

| Option | Survives a reload | Exposure window | Verdict |
|---|---|---|---|
| Both in `localStorage` | Yes, for 7 days | 7 days | Rejected. A single XSS, or any malicious browser extension, yields a week of impersonation. |
| Both in memory | No | Until the tab closes | Rejected. Every reload is a new login, which is a bad experience for a product meant to be used casually by anyone. |
| Access in memory, refresh in `sessionStorage` | Yes, within the tab | Access 15 min, refresh until the tab closes | **Chosen.** |

The access token is the credential every request carries, so keeping it out of persistent storage caps the damage from a script injection at 15 minutes, which is the contract's own access-token lifetime. The refresh token is the one worth persisting, and `sessionStorage` gives persistence across reloads and automatic destruction when the tab closes, which is a browser guarantee no JavaScript can talk the user out of.

The residual risk is stated plainly: an XSS in the running tab can still read the refresh token, and `sessionStorage` is not readable across tabs. This is a hardening improvement, not a fix, and the CSP in P4.4 plus the absence of raw HTML in P4.1 are the real mitigation for the XSS class itself.

### The alternative: a same-origin proxy

If the frontend and the API end up on the same origin, the token story changes again, and it is worth the comparison.

All three candidate static hosts can rewrite `/api/*` to the backend. Vercel and Netlify do it in configuration; on Cloudflare Pages a reverse proxy needs a Function, which counts against the Workers free quota. With a same-origin proxy, several things improve at once: CORS stops being a cross-origin problem and therefore stops being a deployment blocker; the deployment no longer needs `CORS_ALLOWED_ORIGINS` to track the frontend origin; and, if the backend were ever allowed to set the refresh token as an httpOnly cookie, the token would leave JavaScript's reach entirely.

The costs are real. A proxy is a component that can fail, time out, or buffer. Buffering is the specific danger: a proxy that does not stream defeats SSE, and the streaming answer in P2.4 is the core of the product. `VITE_API_URL` would become a relative `/api/v1`, which also means the backend's URL is baked into the host configuration rather than the environment, so switching environments is a host change, not a rebuild. And on Cloudflare Pages the proxy costs Worker quota that the project would otherwise not spend at all.

Decision: **cross-origin with CORS**, as the contract's `CORS_ALLOWED_ORIGINS` implies, and P0.4/P1.6 handle a waking or throttled backend. Revisit only if CORS on the free backend host turns out to be unreliable, and then prefer a host with a native rewrite over one that needs a Function.

## 5. Free UX, and what happens at the limit

The service is free, has no credits, no premium tier, and no payment. That removes the usual dark pattern of a paywall and replaces it with a real engineering problem: the shared free quota runs out, and the honest thing is to say so clearly.

### What the backend will return

Per the contract: `429` with a `Retry-After` header and the code `rate_limited` for per-IP or per-user throttling, or `quota_exhausted` for the global daily cap. And `503 llm_unavailable` when the provider is unreachable, has errored, or is itself rate limited.

### What the interface must do

- **Say what happened in plain language.** `rate_limited`: "You are sending messages too quickly. Try again in a moment." `quota_exhausted`: "Zenith AI has reached its free daily limit. It resets tomorrow." `llm_unavailable`: "The assistant is temporarily unavailable. Please try again shortly."
- **Show the remaining time**, parsed from `Retry-After` into a duration, and offer a retry that fires when the time is up. A raw HTTP date or a bare number is never shown to a user.
- **Never offer a purchase, a plan, a card, an upgrade or a waitlist-for-credits.** There is nothing to sell. A 429 that says "pay to continue" would be a lie about what the product is.
- **Keep the conversation intact.** A rejected message stays in the composer as a draft. Losing what someone wrote because a limit was reached is the worst outcome available here.
- **Do not auto-retry a `429`.** Retrying a rate limit makes the exhaustion worse and, with rotation, can invalidate the refresh token. The retry is the user's decision, on a button.
- **Be honest that it is free.** One line, on the empty state, saying the service is free and unlimited by credits but bounded by a shared daily cap. A user who understands the constraint is a user who does not feel cheated by it.

### Guest mode, to evaluate

A guest mode is worth evaluating, and it is not obvious that it should be built. For: it removes the signup wall from first use, which for a free public product is the single biggest conversion loss; and a guest session needs no refresh token at all, which removes the entire storage question in section 4 for the majority of users.

Against it: it needs a backend contract that does not exist yet, since the contract has no unauthenticated conversation endpoint and a guest conversation has to belong to someone; it makes the throttling story harder, because a guest is throttled by IP alone, which is the weakest signal; and it adds a second identity model to support and secure.

Recommendation: **do not build it until P2 is done and P1.6 has shown, in real use, whether a `429` is actually the top friction point.** If it is, guest mode is the cheapest possible answer to it, because it trades a signature problem for a rate-limit problem. It is not a free win, and adding it before the streaming chat works would be solving the wrong problem.

## 6. Free hosting

Verified on **2026-10-01**. Free tiers change without notice, so re-check the official pages before each deployment. Figures are per account and change as the vendors revise their plans.

The frontend is a client-rendered SPA with no server component, so only static hosting matters here, and the only two things that matter are how much traffic is included and whether deep links work.

| Platform | Free offer | Known limits | Verdict |
|---|---|---|---|
| **Cloudflare Pages** | Static hosting with **unmetered bandwidth**. 500 builds per month, one build at a time, 20-minute build timeout, 20,000 files per site, 25 MiB maximum file size, 100 projects per account, unlimited preview deployments, custom domains with TLS. | Pages Functions are billed on the Workers free plan, at 100,000 requests per day and 10 ms of CPU per request. A static SPA with a rewrite uses none of that, but a reverse proxy would, and it is the reason this host has no native `/api` proxy. Concurrent builds are limited to one. | **Recommended** |
| **Vercel Hobby** | 100 GB of fast data transfer per month, 1 million edge requests, 1 million function invocations, 4 hours of active CPU, 6,000 build minutes, 200 projects, unlimited deployments, 45-minute build timeout, 100 deployments per day. Vite is detected automatically. | The plan's fair-use guidelines restrict it to **personal, non-commercial** use, which is the clause to keep in mind (assumption 10). Transfer and function invocations are metered, so a viral week stops the site rather than billing it. Vercel Functions time out at 60 seconds, which is irrelevant here but fatal for an SSE proxy. | Viable fallback |
| **Netlify Free** | 300 credits per month, with a production deploy at 15 credits and bandwidth at 20 credits per GB. One concurrent build, unlimited deploy previews, custom domains with SSL. | Since the April 2026 change Netlify bills in credits rather than in bandwidth and build minutes, so the effective bandwidth is roughly 15 GB per month *after* the deploys have been paid for, and it moves with the number of deploys. The cap is hard: no overage, no auto-recharge, and the site is suspended for the rest of the calendar month when it runs out. Accounts created before September 2025 keep the older 100 GB and 300 build minutes. | Not recommended |

### The deciding factor

Bandwidth. A React bundle plus a handful of assets is a few hundred kilobytes, so a user costs a few hundred kilobytes of transfer, and even Netlify's effective 15 GB a month would serve tens of thousands of page loads. Under normal load all three are fine, and the honest conclusion is that none of them is the bottleneck for a hobby project.

What separates them is what happens on a spike. Cloudflare Pages does not meter static transfer, so a link on a front page costs nothing extra. Vercel stops the site when the meter runs out. Netlify stops the site when the credits run out, and does so on a calendar month boundary, so a spike in a bad week takes the site down for the rest of that month. For a product whose whole point is being free and open to everybody, "a link went viral and the site is down until the 1st" is the failure mode to design against. That is the recommendation, and it is a small margin rather than a decisive one.

### SPA rewrites

All three need the same rule, because the app uses `BrowserRouter`: a request for an unknown path must return `index.html` rather than a 404.

| Platform | Mechanism |
|---|---|
| Cloudflare Pages | A `_redirects` file with `/*  /index.html  200` |
| Vercel | Framework detection for Vite, or a `rewrites` rule in `vercel.json` that excludes `/assets` |
| Netlify | A `[[redirects]]` block in `netlify.toml` with `from = "/*"`, `to = "/index.html"`, `status = 200` |

Without it, a shared link to `/chat` returns 404 while the app works perfectly from the root. This is the single most common deployment mistake for this stack, and it is why P5.1 lists a deep link as an acceptance criterion.

### Environment variables

| Platform | How |
|---|---|
| Cloudflare Pages | Project settings, per environment: production and preview are set separately |
| Vercel | Project settings, per environment, with per-branch overrides |
| Netlify | Site configuration, per context |

`VITE_*` values are inlined at build time, so every environment that needs a different `VITE_API_URL` is a separate build. The preview deployments of the two Git-based hosts therefore build with production values unless they are configured explicitly, which is a trap worth documenting in the README.

### The backend cold start, and what the user sees

Static hosting has no cold start, so this is entirely about the backend. The free backend the backend plan settles on sleeps after inactivity, and the first request after a sleep pays the wake-up, measured on comparable free tiers at tens of seconds. Three consequences, all of them interface work rather than infrastructure work:

- **The wake-up must look like a wake-up.** A spinner labelled "starting the service" for up to 30 seconds, and never a generic "something went wrong". `GET /health/` is polled first, precisely so that "the backend is asleep" is distinguishable from "the backend is broken" (P5.3).
- **A cold start must not be charged to the user's quota.** A health check and a wake-up are not LLM calls, and the backend's quota accounting must exclude them. The backend is responsible; the frontend must not retry aggressively enough to turn one wake-up into several.
- **The timeout must be longer than the wake-up.** The current 30-second Axios timeout (`src/services/api.ts:12`) is a coin flip against a cold start. The read timeout for a normal call and the wake-up allowance are two different numbers, and the streaming call needs its own, longer one.

## 7. Zero-cost rules

1. No paid dependency, service, plan, card, or trial that requires a card, ever. A card attached to any provider turns a `429` into an invoice, and that is the single most likely way this project starts costing money.
2. A free tier that improves after a purchase stays unused. OpenRouter's larger daily cap is exactly that case, and the backend plan already excludes it.
3. Every candidate is checked against section 6 before adoption, and the check is written down in the README at deploy time.
4. When a limit is reached, the answer is a clear `429` with `Retry-After` and a machine-readable code, and a sentence in plain language. Never a silent empty response, never a suggestion to pay.
5. Anything that cannot run for 0 € is not adopted, however good it is.
