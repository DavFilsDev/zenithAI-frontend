# Zenith AI — Frontend

React frontend for Zenith AI: a free, open-to-everyone AI chat application with no credits, no premium tier, and no payment.

Target infrastructure cost: **0 €**. Only free technologies and free services are used.

- Backend repository: `zenithAI_django-backend`, served on `http://localhost:8000` in development
- Frontend: `http://localhost:5173` in development
- Shared API contract: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)

## Status

The application is functional but mid-refactor. It is honest about the gap between what it does and what the contract describes, and the gap is tracked rather than hidden.

**Implemented today:**

- Public landing page, login and registration
- JWT sign-in, session restore on reload, sign-out
- Conversation list, one chat per conversation, conversation deletion
- Markdown rendering of assistant answers
- Dark and light theme, persisted
- Responsive layout with a collapsible sidebar

**Not yet implemented, and documented as such:**

- **Streaming.** Answers arrive in one complete response. There is no token-by-token rendering, and there is no WebSocket code: the contract defines SSE only.
- **Profile editing.** The profile modal opens and the fields are editable, but the save handlers are stubs and nothing is sent. Until P1.1 lands, do not rely on it.
- **Conversations cannot be renamed**, and there is no explicit conversation creation: a new chat is currently a client-side draft.
- **No tests and no continuous integration.** Zero test files exist today.
- **No deployed instance yet.** See the roadmap below.
- **Not accessible.** The conversation list cannot be reached by keyboard, and the profile modal has no dialog semantics. Fixing this is phase P4, not a detail.

## Stack

| | |
|---|---|
| Framework | React 19, with React Router 7 |
| Language | TypeScript 5.9 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4, configured in CSS |
| Server state | Hand-rolled today; TanStack Query is phase P2 |
| UI state | Zustand, with two React contexts for theme and session |
| HTTP client | Axios |
| Forms | React Hook Form |
| Markdown | react-markdown |
| Notifications | react-hot-toast |
| Icons | react-icons and lucide-react, both in use |

Not installed, and therefore not used: React Query, Prism or any syntax highlighter, CSS Modules, any WebSocket library, any test runner.

## Requirements

- Node.js 20.19 or newer
- npm
- The backend running on `http://localhost:8000`

## Local setup

```bash
git clone https://github.com/DavFilsDev/zenithAI_react-typescript-frontend.git
cd zenithAI_react-typescript-frontend

npm install

cp .env.example .env.local
```

Edit `.env.local` if your backend is not on the default port, then start the dev server:

```bash
npm run dev
```

The frontend is on <http://localhost:5173>, the backend on <http://localhost:8000>. The backend must allow this origin, which in development is `CORS_ALLOWED_ORIGINS=http://localhost:5173`.

## Environment variables

`.env.example` lists every variable the project declares.

| Variable | Value | Read by |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | The Axios instance and the token refresh call |
| `VITE_APP_NAME` | `Zenith AI` | The document title |
| `VITE_DEFAULT_THEME` | `dark` | The theme applied before first paint |

Only `VITE_API_URL` affects where requests go. `VITE_APP_NAME` and `VITE_DEFAULT_THEME` are read at startup; until the phases in the roadmap land, the title and the initial theme are still hardcoded in `index.html` and `src/main.tsx`.

There is no `VITE_WS_URL`. Streaming is Server-Sent Events, not WebSocket.

On the free static hosts, `VITE_*` values are inlined at build time, so a different `VITE_API_URL` means a different build.

## Scripts

These five exist today. Anything else you may have read elsewhere does not.

```bash
npm run dev         # dev server on port 5173, opens a browser
npm run build       # production build into dist/
npm run preview     # serve the production build locally
npm run lint        # ESLint
npm run type-check  # TypeScript
```

Two caveats, both fixed in phase P3:

- `type-check` and the type step of `build` currently check nothing, because the root `tsconfig.json` compiles zero files. Do not treat a green build as proof that the types are correct.
- `lint` may fail on configuration warnings rather than on code.

There is no `test`, no `test:coverage`, no `test:e2e`, no `format` and no `deploy` script. Nothing runs tests, because nothing has been written yet.

## Project structure

```
src/
├── App.tsx          routes, providers
├── main.tsx         entry point
├── index.css        the only stylesheet
├── assets/
├── components/
│   ├── chat/        ChatInput, MessageBubble, MessageList
│   ├── layout/      ChatWindow, Sidebar
│   └── ui/          Button, Input, Modal, toasts, toggles
├── config/          toastConfig
├── contexts/        AuthContext, ThemeContext
├── hooks/           useToast, useChat (unused)
├── pages/           Home, Login, Register, Chat
├── services/        api, auth, chat, tokenManager, refreshTokenService
├── store/           chatStore
└── types/           auth, chat, user
```

There is no `public/` directory, no `src/utils/`, no `src/styles/`, and no test directory. The target structure, organised by feature, is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Known issues

Each of these is a defect found during the audit, tracked in [`docs/IMPROVEMENT_PLAN.md`](docs/IMPROVEMENT_PLAN.md).

- The frontend currently calls `/chat/conversations/` and `/chat/chat/{id}/`, on an `/api` base. The contract defines `/conversations/` and `/conversations/{uuid}/messages/` on `/api/v1`. Migration is P0.2.
- A new chat sends the literal id `'draft'` to the backend, which rejects it. Fixed by P0.3.
- Conversations, including message text, are cached in `localStorage` under `chat-storage` and are not cleared on sign-out. Fixed by P2.3.
- A failed profile request on load deletes the session, so a backend error looks like a logout. Fixed by P0.9.
- The token refresh is not single-flight, so several simultaneous failures trigger several refreshes. Fixed by P1.2.
- Signing out never calls the backend, so a refresh token stays valid until it expires. Fixed by P1.4.
- Assistant answers render without GFM support, without syntax highlighting, and with an inactive `prose` class, so a markdown table appears as raw text. Fixed by P4.2.
- `/privacy` and `/terms` on the landing page lead nowhere, and their labels are swapped. Fixed by P4.9.
- There is no route for an unknown path, so a bad URL renders nothing.

## Status & Roadmap

Phases, with effort, acceptance criteria and dependencies, are in [`docs/IMPROVEMENT_PLAN.md`](docs/IMPROVEMENT_PLAN.md).

| Phase | Scope |
|---|---|
| P0 | Consistency with the contract: base URL, conversation paths, environment validation, dead code removal |
| P1 | The API layer: profile editing, single-flight refresh, real logout, generated types, rate-limit UX |
| P2 | Streaming over SSE, TanStack Query for server state, the feature-based structure |
| P3 | Quality: a type-check that works, stricter linting, Prettier, husky, Vitest, Playwright |
| P4 | Security and accessibility: sanitization, token storage, keyboard access, dialogs, Lighthouse |
| P5 | Continuous integration, free deployment, and a showcase |

- [`docs/IMPROVEMENT_PLAN.md`](docs/IMPROVEMENT_PLAN.md) — audit findings, roadmap, token storage, free hosting, zero-cost rules
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — the API contract shared with the backend repository
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the target architecture
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — workflow rules and code conventions

## Contributing

One branch per subject, and only the maintainer commits. Full rules in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).

```bash
git switch -c docs/short-description
git switch -c feat/short-description
git switch -c fix/short-description
git switch -c chore/short-description
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## Security

Report a vulnerability privately by email to <miharisoadavidfils@gmail.com>. Do not open a public issue for it, and do not disclose it in a pull request or a discussion.

## License

MIT, see [`LICENSE`](LICENSE).

## Author

Fanampinirina Miharisoa David Fils RATIANDRAIBE — <miharisoadavidfils@gmail.com> — <https://github.com/DavFilsDev>
