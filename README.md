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
- Conversation creation, list, rename, deletion and pagination
- Streaming SSE answers rendered token by token
- Profile editing
- Markdown rendering of assistant answers
- Dark and light theme, persisted
- Responsive layout with a collapsible sidebar
- Vitest, Testing Library, MSW and Playwright coverage for the main flows

**Not yet implemented, and documented as such:**

- **GFM and syntax highlighting.** Tables render as raw text and fenced code is not highlighted. Fixed by P4.2.
- **Full accessibility.** Keyboard access, dialog focus handling and reduced-motion coverage are phase P4 work.
- **No continuous integration and no deployed instance.** See the roadmap below.
- **No `/privacy` or `/terms` pages.** The catch-all route redirects both to `/`.

## Stack

|               |                                                                    |
| ------------- | ------------------------------------------------------------------ |
| Framework     | React 19, with React Router 7                                      |
| Language      | TypeScript 5.9                                                     |
| Build tool    | Vite 7                                                             |
| Styling       | Tailwind CSS 4, configured in CSS                                  |
| Server state  | TanStack Query                                                     |
| UI state      | Zustand for the session and chat UI, a React context for the theme |
| HTTP client   | Axios for JSON, `fetch` for the SSE stream                         |
| Forms         | React Hook Form                                                    |
| Markdown      | react-markdown                                                     |
| Notifications | react-hot-toast                                                    |
| Icons         | react-icons and lucide-react, both in use                          |
| Testing       | Vitest, Testing Library, MSW and Playwright                        |

Not installed, and therefore not used: Prism or any syntax highlighter, CSS Modules, any WebSocket library.

## Requirements

- Node.js 20.19 or newer
- npm
- The backend running on `http://localhost:8000` for development
- Chromium for Playwright, installed once with `npx playwright install chromium`

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

| Variable             | Value                          | Read by                                       |
| -------------------- | ------------------------------ | --------------------------------------------- |
| `VITE_API_URL`       | `http://localhost:8000/api/v1` | The Axios instance and the token refresh call |
| `VITE_APP_NAME`      | `Zenith AI`                    | The document title                            |
| `VITE_DEFAULT_THEME` | `dark`                         | The theme applied before first paint          |

Only `VITE_API_URL` affects where requests go. All three are validated at startup with `zod`: a missing or malformed value stops the app with a message naming the variable. `VITE_APP_NAME` sets the document title and `VITE_DEFAULT_THEME` sets the theme applied before the first paint; a theme saved in `localStorage` still wins over the default.

On the free static hosts, `VITE_*` values are inlined at build time, so a different `VITE_API_URL` means a different build.

## Scripts

These scripts exist today:

```bash
npm run dev                   # dev server on port 5173, opens a browser
npm run build                 # production build into dist/
npm run preview               # serve the production build locally
npm run lint                  # ESLint
npm run type-check            # TypeScript
npm run format                # rewrite the tree with Prettier
npm run format:check          # fail if the tree is not formatted
npm run test                  # Vitest, once
npm run test:coverage         # Vitest with the coverage gate
npm run test:e2e              # Playwright, starts Vite itself
npm run generate:api-types    # regenerate src/shared/api/api.generated.ts from the backend schema
npm run generate:msw-handlers # regenerate the MSW handlers from the vendored schema
```

`test:e2e` starts Vite on `127.0.0.1:5173` with `BROWSER=none`, uses Chromium, and intercepts `/api/v1` at the browser boundary. The journeys do not need the backend or an LLM key.

## Quality gates

Run these before committing:

```bash
npm run format:check
npm run type-check
npm run lint
npm run test:coverage
npm run test:e2e
npm run build
```

`type-check` and `build` share the same `tsc -b` gate with `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. `lint` runs the flat ESLint config with type-aware `typescript-eslint` rules, including `no-floating-promises` and `no-misused-promises`, plus the `jsx-a11y` recommended set, and `--max-warnings 0`. `test:coverage` enforces the 80% threshold on `features/` and `shared/api/`. All gates pass on the current tree; `build` still reports the pre-existing >500 kB chunk warning.

`lint-staged` runs ESLint and `tsc -b` on staged TS/TSX files, and Prettier on the rest, so a commit cannot carry a type or lint error.

## Project structure

```
src/
├── main.tsx         entry point
├── index.css        the only stylesheet
├── assets/
├── app/             providers, router, ChatShell, ProfileBootstrap
├── features/
│   ├── auth/        api, model, pages, components
│   ├── chat/        api, model, pages, components
│   └── home/        pages, components
├── shared/
│   ├── api/         client, interceptor, errors, env, tokens, generated types
│   ├── auth/        session store and useSession
│   ├── ui/          Button, Input, theme, toasts, Spinner
│   ├── hooks/       useOnClickOutside
│   └── lib/         logger, parseRetryAfter
└── test/            MSW server, generated handlers, render helpers
```

Unit tests sit next to their subject. Shared test support is in `src/test/`, and browser journeys are in `e2e/` with their API mock in `e2e/support/`. There is no `public/`, `src/utils/` or `src/styles/`. The full tree and the layer rules are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Known issues

Each of these is a defect found during the audit, tracked in [`docs/IMPROVEMENT_PLAN.md`](docs/IMPROVEMENT_PLAN.md).

- Assistant answers render without GFM support and without syntax highlighting, so a markdown table appears as raw text. Fixed by P4.2.
- `/privacy` and `/terms` on the landing page have no pages; the catch-all route redirects them to `/`. Fixed by P4.9.

## Status & Roadmap

Phases, with effort, acceptance criteria and dependencies, are in [`docs/IMPROVEMENT_PLAN.md`](docs/IMPROVEMENT_PLAN.md).

| Phase | Scope                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------ |
| P0    | Consistency with the contract: base URL, conversation paths, environment validation, dead code removal |
| P1    | The API layer: profile editing, single-flight refresh, real logout, generated types, rate-limit UX     |
| P2    | Streaming over SSE, TanStack Query for server state, the feature-based structure                       |
| P3    | Quality: a type-check that works, stricter linting, Prettier, husky, Vitest, Playwright                |
| P4    | Security and accessibility: sanitization, token storage, keyboard access, dialogs, Lighthouse          |
| P5    | Continuous integration, free deployment, and a showcase                                                |

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
