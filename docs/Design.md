# Zenith AI — Design System & Refactor Rules

> **Status: MANDATORY.** Every agent and contributor MUST read this file in full before touching any UI code. If a rule here conflicts with existing code, **this file wins**. If a rule here conflicts with `docs/CONVENTIONS.md`, this file wins and `CONVENTIONS.md` must be updated.
>
> Stack: React 19, Vite 7, Tailwind CSS 4 (CSS-first `@theme`), TypeScript strict, CSS-only motion, `lucide-react` for icons.

---

## 0. How agents must work

1. Read this whole file before any change.
2. Work in the order defined in **Section 14 (Refactor order)**. Do not skip ahead.
3. Foundation first: tokens, fonts, primitives. No page work until Phase 1 and 2 are done.
4. Never hardcode a color, radius, shadow, duration, or font. Use tokens only.
5. Never introduce a new dependency without writing the reason in the PR description. Banned: `react-icons`, any gradient or "glass" UI kit, any animation library (see Section 10).
6. Before finishing any task, run the **Definition of Done** (Section 15).
7. If a requirement is ambiguous, choose the simpler, flatter, more restrained option. When in doubt, remove decoration.

---

## 1. Design intent

**One sentence:** a precise, quiet, technical tool for thinking, built for the general public but with the discipline of a developer product (Linear, Vercel, Geist).

| Principle               | Meaning in practice                                                  |
| ----------------------- | -------------------------------------------------------------------- |
| **Precision**           | Alignment on a strict grid. Every pixel has a reason.                |
| **Restraint**           | Neutral surfaces. One accent color, used rarely.                     |
| **Clarity**             | Content (the conversation) is the hero. Chrome disappears.           |
| **Honesty**             | No fake status indicators, no decorative pulses, no marketing fluff. |
| **Motion with purpose** | Animation explains change of state. It never decorates.              |

**Personality:** technical, calm, confident. Not playful, not futuristic, not "magical".

---

## 2. Anti-slop rules (hard bans)

These are **forbidden**. A PR containing any of them is rejected.

### 2.1 Visual bans

- Glassmorphism: no `backdrop-blur-*`, no `bg-white/10`-style translucent surfaces, no `border-white/10` glass borders. (Audit: ~17 occurrences to remove.)
- Gradients of any kind on UI surfaces, text, buttons, borders, or backgrounds. Exception: a single 1px hairline gradient divider is allowed on the landing page only.
- Glow, neon, or colored shadows. Blurred blobs, orbs, mesh backgrounds, floating decorative shapes.
- Mouse-follow or parallax backgrounds (`AnimatedBackground` is to be deleted).
- Shine / shimmer sweeps across buttons (the "New Chat" sweep is to be deleted).
- Shadows on cards, panels, or buttons. Shadows are allowed **only** on floating layers (dropdown, modal, toast) and must use the `--shadow-float` token.
- Radius above 4px on any rectangular component. `rounded-full` only for avatars and 6–8px status dots.
- Emojis anywhere in the UI.
- Sparkle, magic wand, robot, brain, or "AI" decorative icons. Never use icons to signal "AI".
- Purple, violet, indigo, pink, or cyan accents.
- Centered hero with gradient headline and two buttons.
- Three-column feature card grids with icon-in-circle tiles.
- Fake stats, fake testimonials, fake logo walls, "trusted by" strips.

### 2.2 Motion bans

- Bounce, spring overshoot, elastic easing, wobble.
- `hover:scale-*` and `active:scale-*` on buttons, cards, or rows. (Audit: Button, GlassButton, Sidebar.)
- Looping decorative animations (pulsing dots, bouncing typing dots, infinite shimmer on non-loading content).
- Typewriter effects on headings (the landing `Typewriter` component is to be deleted).
- Any animation longer than 400ms except the landing page entrance sequence (max 700ms total).
- Animating layout properties that cause jank (`width`, `height`, `top`, `left`) except the sidebar collapse, which is explicitly specified in Section 8.

### 2.3 Copy bans

Forbidden phrases and patterns: "supercharge", "unleash", "revolutionize", "next-generation", "like a pro", "smart companion", "most advanced", "seamless", "magic", "effortless", exclamation marks in UI copy, second-person hype.

Copy must be literal, short, and sentence case. Describe what the product does, not how it should feel.

### 2.4 Code bans

- Raw arbitrary color values in JSX: `bg-[rgb(var(--color-primary))]`, `text-gray-400`, `bg-slate-950`, `bg-green-400`, etc.
- Raw Tailwind palette colors (`gray-*`, `slate-*`, `red-*`, `green-*`, `yellow-*`, `amber-*`, `blue-*`). Use semantic tokens only.
- Inline `style={{}}` except for truly dynamic values (textarea height, CSS variable injection for stagger index).
- `window.confirm`, `window.alert`, `window.prompt`.
- `<div onClick>`; use `<button>`.
- Duplicated components. Before creating anything, check `shared/ui`.

---

## 3. Design tokens

All tokens live in **one place**: `src/index.css`, using Tailwind v4 `@theme`. Delete the old `:root` RGB-triplet tokens and the `bg-[rgb(var(--color-...))]` pattern entirely.

### 3.1 Color — Dark (default)

Neutral base with a single crimson accent. Surfaces are separated by **borders and lightness steps**, never by shadows or transparency.

| Token                    | Value                   | Use                                   |
| ------------------------ | ----------------------- | ------------------------------------- |
| `--color-canvas`         | `#0A0A0B`               | App background                        |
| `--color-surface`        | `#111113`               | Sidebar, panels, composer             |
| `--color-raised`         | `#17171A`               | Inputs, code blocks, user message     |
| `--color-hover`          | `#1D1D21`               | Hover state of rows and buttons       |
| `--color-border-subtle`  | `#232327`               | Dividers inside panels                |
| `--color-border`         | `#2E2E33`               | Default component border              |
| `--color-border-strong`  | `#3F3F46`               | Hover/active border, focus-adjacent   |
| `--color-text`           | `#EDEDEF`               | Primary text                          |
| `--color-text-secondary` | `#A1A1AA`               | Secondary text                        |
| `--color-text-tertiary`  | `#8B8B94`               | Hints, timestamps (AA on canvas)      |
| `--color-accent`         | `#D6303A`               | Solid accent fills (primary button)   |
| `--color-accent-hover`   | `#E03B45`               | Accent fill hover                     |
| `--color-accent-active`  | `#BC2A33`               | Accent fill pressed                   |
| `--color-accent-text`    | `#F0646B`               | Accent used as text/icon/link on dark |
| `--color-accent-subtle`  | `rgb(214 48 58 / 0.12)` | Selected row tint, focus tint         |
| `--color-on-accent`      | `#FFFFFF`               | Text on accent fill                   |
| `--color-success`        | `#3FB68B`               | Success status                        |
| `--color-warning`        | `#D9A441`               | Warning status                        |
| `--color-danger`         | `#FF7A59`               | Errors and destructive actions        |

> Crimson is the brand accent. Error states use `--color-danger` (orange-red) plus an icon and text, so the brand accent is never confused with an error. Never signal state by color alone.

### 3.2 Color — Light

| Token                    | Value                   |
| ------------------------ | ----------------------- |
| `--color-canvas`         | `#FFFFFF`               |
| `--color-surface`        | `#FAFAFA`               |
| `--color-raised`         | `#F4F4F5`               |
| `--color-hover`          | `#EDEDEF`               |
| `--color-border-subtle`  | `#EEEEF0`               |
| `--color-border`         | `#E4E4E7`               |
| `--color-border-strong`  | `#D1D1D6`               |
| `--color-text`           | `#0A0A0B`               |
| `--color-text-secondary` | `#52525B`               |
| `--color-text-tertiary`  | `#71717A`               |
| `--color-accent`         | `#C4222D`               |
| `--color-accent-hover`   | `#AE1E28`               |
| `--color-accent-active`  | `#981A23`               |
| `--color-accent-text`    | `#C4222D`               |
| `--color-accent-subtle`  | `rgb(196 34 45 / 0.08)` |
| `--color-on-accent`      | `#FFFFFF`               |
| `--color-success`        | `#1F8A66`               |
| `--color-warning`        | `#9A6700`               |
| `--color-danger`         | `#C2410C`               |

### 3.3 Accent usage budget

The accent is **scarce**. Allowed uses only:

1. The single primary button per view.
2. The focus ring.
3. Links inside prose.
4. Selected state in the sidebar (left 2px bar + `accent-subtle` background).
5. The streaming caret and active progress indicator.
6. Chart series 1 (Section 12).

Everything else is neutral. If more than ~5% of any screen is accent-colored, it is wrong.

### 3.4 Typography

Self-host fonts (no Google Fonts link, no layout shift). Use `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`, with `font-display: swap` and `preload` for the primary weight.

```css
--font-sans: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'Geist Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace;
```

**Where mono is used (technical feel, applied deliberately):** code blocks and inline code, timestamps, model/status labels, keyboard hints, small uppercase section labels in the sidebar, numeric data in charts, the service-status pill. Body copy and headings are sans.

**Type scale** (fixed, no ad hoc sizes):

| Token          | Size / line-height                           | Weight | Use                             |
| -------------- | -------------------------------------------- | ------ | ------------------------------- |
| `text-display` | 48 / 52 px, tracking -0.02em                 | 600    | Landing hero only               |
| `text-h1`      | 32 / 38 px, tracking -0.015em                | 600    | Page titles (legal, empty chat) |
| `text-h2`      | 22 / 28 px, tracking -0.01em                 | 600    | Section titles, modal titles    |
| `text-h3`      | 16 / 24 px                                   | 600    | Subsection titles               |
| `text-body`    | 15 / 24 px                                   | 400    | Messages, paragraphs            |
| `text-ui`      | 14 / 20 px                                   | 500    | Buttons, inputs, menu items     |
| `text-small`   | 13 / 18 px                                   | 400    | Secondary info                  |
| `text-label`   | 11 / 16 px, mono, uppercase, tracking 0.06em | 500    | Section labels, badges          |

Rules: only weights 400, 500, 600. Max line length for prose and messages is 68ch. Never use `font-bold`.

### 3.5 Spacing (spacious density)

4px base grid. Allowed steps: `4, 8, 12, 16, 24, 32, 48, 64, 96`. Use `--spacing` multiples only; no odd values (the `px-1` header bug is an example to fix).

- Component inner padding: 12–16px.
- Gap between sections: 32–48px.
- Page gutters: 16px mobile, 24px tablet, 32px desktop.
- Message vertical rhythm: 32px between turns, 8px between a message and its actions.
- Spacing is owned by **one** layer: the parent uses `gap`/`space-y`; children never add their own `mb-*` (fixes double spacing in MessageList/MessageBubble).

### 3.6 Shape, borders, depth

Sharp, flat, bordered.

| Token           | Value  | Use                                                   |
| --------------- | ------ | ----------------------------------------------------- |
| `--radius-none` | 0      | Layout containers, panels, sidebar                    |
| `--radius-sm`   | 2px    | Badges, kbd, inline code                              |
| `--radius`      | 4px    | Buttons, inputs, menus, modals, code blocks, messages |
| `--radius-full` | 9999px | Avatars and status dots only                          |

- Depth = 1px border + lightness step. **No shadows on in-flow elements.**
- One shadow token for floating layers only: `--shadow-float: 0 8px 24px rgb(0 0 0 / 0.35)` (dark), `0 8px 24px rgb(0 0 0 / 0.08)` (light).
- Borders are always 1px, `--color-border` by default.

### 3.7 Z-index scale

`base 0 · sticky 10 · dropdown 20 · overlay 30 · modal 40 · toast 50`. No other values.

---

## 4. Theme behavior

- **Dark is the default** for first-time visitors. Light is a user option. Persist in `localStorage` key `theme`; if no stored value, use dark (do not follow system).
- Keep the `.dark` class strategy and the `@custom-variant dark`. Define dark tokens in `@theme`/base and override for light via `.light` or invert so that tokens are defined once per mode, never per-component `dark:` overrides.
- **Target: zero `dark:` utilities in components.** Components consume semantic tokens only, which switch automatically. (Audit: 34 `dark:` overrides in 15 files to remove.)
- Update `meta[name=theme-color]` on change (already implemented; keep).
- The theme toggle uses neutral tokens: no red/yellow. Use `role="switch"` with `aria-checked`.

---

## 5. Iconography

- **One library: `lucide-react`.** Remove `react-icons` entirely and migrate every icon.
- Stroke width fixed at `1.5`. Sizes: 16px in UI, 20px for primary actions, 14px inline with small text.
- Icons inherit `currentColor`. Never colored independently except status.
- Icon-only buttons must have `aria-label` and a tooltip (Section 7).
- No decorative icons. Icons exist only to label an action or status.

Migration map: `FiPlus→Plus`, `FiSidebar→PanelLeft`, `FiSettings→Settings`, `FiSun/FiMoon→Sun/Moon`, `FiLogOut→LogOut`, `FiUser→User`, `FiMessageSquare→MessageSquare`, `FiTrash2→Trash2`, `FiEdit2→Pencil`, `FiCheck→Check`, `FiX→X`, `FiMail→Mail`, `IoSend→ArrowUp` (send) and add `Square` for stop.

---

## 6. Layout system

### 6.1 Breakpoints (mobile-first)

`sm 640 · md 768 · lg 1024 · xl 1280`. Use `sm:`, `md:`, `lg:` where needed. Currently only 4 responsive utilities exist; the chat must become fully responsive.

### 6.2 App shell (chat)

```
┌───────────┬──────────────────────────────────────────┐
│ Sidebar   │ Header (48px, border-b)                  │
│ 280 / 56  ├──────────────────────────────────────────┤
│ border-r  │        ┌───────────────────────┐         │
│           │        │ Centered column       │         │
│           │        │ max-w 720px           │         │
│           │        │ messages              │         │
│           │        └───────────────────────┘         │
│           │        Composer (sticky bottom, 720px)   │
└───────────┴──────────────────────────────────────────┘
```

- **Chat is a single centered column, max width 720px**, for header content, messages, and composer alike. All three share the same left edge (fixes the `max-w-3xl`/`max-w-4xl` mismatch).
- Use `<aside>`, `<header>`, and a real `<main id="main">` landmark. Add a skip-to-content link as the first focusable element.
- Use `100dvh`, not `h-screen`. Respect `env(safe-area-inset-*)` on the composer and header.
- **Sidebar:** 280px expanded, 56px collapsed (icon rail) on `lg+`. Below `lg`, it becomes an off-canvas drawer opened from a header button, with a scrim (`rgb(0 0 0 / 0.5)`, no blur), closed on route change, Escape, or scrim tap. Drawer width `min(320px, 85vw)`.
- Exactly **one** sidebar collapse control (remove the duplicate between `Sidebar.tsx` and `SidebarHeader.tsx`).

### 6.3 Pages never use `h-screen overflow-hidden` for content. Landing and legal pages scroll normally.

---

## 7. Component specifications

All primitives live in `src/shared/ui/`. Build these **before** refactoring pages. Pages may not restyle them.

### Button

Variants: `primary` (accent fill, `on-accent` text), `secondary` (surface + border), `ghost` (transparent, hover fill), `danger` (danger text + border; filled only in confirm dialogs).
Sizes: `sm` 28px, `md` 36px, `lg` 44px (touch). Radius `4px`. Text `text-ui`. States: hover (color step), active (one step darker), focus-visible (ring), disabled (50% opacity, `cursor-not-allowed`), loading (inline 14px spinner, label preserved, width stable). **No scale transforms.** `GlassButton` is deleted.

### IconButton

36px square (44px on touch), ghost by default, `aria-label` required by type, tooltip on hover/focus after 400ms.

### Input / Textarea

36px height, `raised` background, 1px `border`, radius 4px, label above (never placeholder-only). Focus: border `accent` + 2px ring. Error: border `danger` + icon + message below with `aria-describedby`. Keep the existing label/error association.

### Card / Panel

`surface` background, 1px border, radius 0 or 4px, padding 24px. No shadow, no blur, no hover lift. Used sparingly; prefer plain sections with dividers.

### Badge

Mono, uppercase `text-label`, radius 2px, 1px border, neutral by default; status variants use status color text + `*-subtle` background.

### Menu / Dropdown

Proper menu semantics (`role="menu"`, `menuitem`, arrow-key navigation, Home/End, Escape, type-ahead optional). 4px radius, 1px border, `--shadow-float`, item height 32px. Replaces `SettingsDropdown` markup duplication.

### Dialog

`role="dialog"`, `aria-modal`, focus trap, Escape, focus restore (keep the existing good implementation, extract as primitive). Max width 440px, radius 4px, border, `--shadow-float`. Scrim without blur. **Replaces every `window.confirm`** with a `ConfirmDialog` (title, one sentence of consequence, `Cancel` ghost + `Delete` danger).

### Tooltip

Mono `text-small`, `raised` background, 1px border, 4px radius, 150ms delay, never contains essential info.

### Avatar

24/32px, `radius-full`, neutral `raised` background, initials in mono.

### Skeleton

`raised` blocks, radius 4px, a single slow opacity pulse (1.6s, 0.5→0.8). Used for conversation list and message loading instead of spinners where the layout is known.

### Toast

Solid `surface` background, 1px border, `text` color, status icon on the left, 4px radius. Never white-on-translucent. Position bottom-center on mobile, bottom-right on desktop.

### Kbd

Mono, 2px radius, 1px border, for shortcut hints (`Enter`, `Shift+Enter`).

### Focus ring (global)

`:focus-visible { outline: 2px solid var(--color-accent-text); outline-offset: 2px; }` applied globally; components may not remove it. Every interactive element must show it.

---

## 8. Chat interface rules (core product)

**Empty state:** one `text-h1` line, a short single-sentence description, the composer, and up to 4 plain suggestion rows (bordered, radius 4px, left-aligned text, no icons). No illustration, no sparkles. Replace "What's on your mind?" with a neutral line such as "Start a conversation."

**Messages (no bubbles for the assistant):**

- _User message:_ right-aligned, `raised` background, 1px border, radius 4px, max width 80%, `text-body`.
- _Assistant message:_ **no container, no background, no border.** Plain prose on the canvas, full column width, so long answers read like a document. A small mono label (`ASSISTANT`) is optional; prefer none.
- Timestamps: mono `text-small` tertiary, shown on hover/focus **and** always accessible to screen readers.
- Turn spacing 32px.

**Actions row** (copy, and later regenerate/feedback): always visible at 60% opacity on touch devices, visible on hover **and** `focus-within` on desktop. Never hidden from touch users.

**Markdown/prose:** use the typography plugin restyled to tokens: headings per type scale, links `accent-text` with underline offset 2px, lists with 8px gaps, tables with 1px borders, blockquote with 2px left border `border-strong`.

**Code blocks:** `raised` background, 1px border, radius 4px, header bar (language label in mono left, copy button right), mono 13px/20px, horizontal scroll, `tabIndex=0` region with label. Syntax theme maps to tokens (neutral grays plus accent for keywords; no rainbow themes).

**Streaming:**

- Tokens append in place with no per-token animation on text.
- A 2px-wide accent caret blinks at the end of the streaming message (steps timing, 1s, respects reduced motion).
- Replace bouncing typing dots with a single static caret-style "pending" indicator.
- While streaming, `Send` becomes **Stop** (`Square` icon, secondary variant) wired to the existing abort. Esc also stops.
- Do **not** put `aria-live` on the whole log. Use `aria-live="off"` while tokens stream, and announce completion once through a visually hidden `role="status"` element ("Response complete").

**Composer:** sticky bottom, same 720px column, `surface` background, 1px border, radius 4px, auto-grow textarea (min 1 row, max 8 rows, then scroll), send/stop at the right, hint `Enter to send · Shift+Enter for newline` in mono `text-small`, below. Focus state: border `accent`, no glow.

**Sidebar:** brand wordmark top, `New chat` as a **secondary** button (no green dot, no shine, no pulse), conversation list grouped by `Today / Yesterday / Previous 7 days / Older` using mono `text-label` headings, row height 36px, selected row = 2px accent left bar + `accent-subtle`, row actions (rename, delete) visible on hover/focus **and always on touch**, user menu pinned bottom. Delete goes through `ConfirmDialog`.

**Service status pill:** neutral bordered badge, 6px status dot, mono label. Fix the undefined `--color-surface` usage.

---

## 9. Page specifications

### 9.1 Landing (`/`)

Left-aligned, asymmetric, content-first. **No typewriter, no animated background, no gradient.**

1. Header: wordmark left, `Log in` (ghost) and `Sign up` (primary) right, 56px, bottom border.
2. Hero: two-column on `lg+` (7/5 split), single column below. Left: mono `text-label` eyebrow (product name/status), `text-display` headline (literal, factual, max 12 words), one 18px supporting paragraph (max 2 lines), primary + secondary buttons left-aligned. Right: a **real, static product preview**, a rendered excerpt of the actual chat UI (message, code block, composer) in a bordered frame, not a stock illustration.
3. Capabilities: a plain 2-column definition list with hairline dividers (term in `text-h3`, description in `text-body` secondary). No icons-in-circles, no card grid.
4. Footer: links (Privacy, Terms), status pill, copyright, hairline top border.
   Rich motion is allowed here, within Section 10 limits.

### 9.2 Auth (`/login`, `/register`)

Two-pane on `lg+`: left 480px form column on `canvas`, right a flat `surface` pane with a short product statement and a static code-snippet preview (hidden below `lg`). Form: `text-h2` title, inputs, one primary button full width, one text link to the alternate page. No glass card, no `rounded-2xl`, no shadow. Both pages get identical gutters (`px-4` minimum) and share one `AuthLayout` component.

### 9.3 Chat (`/chat/:uuid?`)

As specified in Sections 6.2 and 8.

### 9.4 Legal (`/privacy`, `/terms`)

Single column, 68ch max, `text-h1` title, `last updated` in mono tertiary, sticky in-page table of contents on `lg+` (left), headings per type scale, hairline separators. Uses the same header and footer as landing.

### 9.5 Profile modal

Use the `Dialog` primitive. Deduplicate the email/username field blocks into one `EditableField` component. Labels above values, inline edit with Save/Cancel, no color-by-state other than error.

### 9.6 Error boundary / 404

Left-aligned, `text-h1`, one sentence, one primary button, optional mono error code. No illustration.

---

## 10. Motion system (CSS only)

**Library decision:** the project uses CSS only. Stay CSS only. Do **not** add Framer Motion/GSAP. If a case truly cannot be done in CSS (shared-element/layout transitions), propose it in the PR before adding anything.

**Feel:** smooth and measured. Rich, but every motion maps to a state change.

### 10.1 Tokens

```css
--ease-out: cubic-bezier(0.2, 0, 0, 1); /* default: entrances */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* moves/resizes */
--duration-instant: 100ms; /* color, border, opacity hover */
--duration-fast: 160ms; /* menus, tooltips, toggles */
--duration-base: 240ms; /* dialogs, drawers, route fades */
--duration-slow: 360ms; /* sidebar collapse, landing reveals */
```

No other durations. No `transition-all`; always list properties (`color, background-color, border-color, opacity, transform`).

### 10.2 Approved animations (complete list)

| Where                             | Animation                                                                                           | Duration         | Easing      |
| --------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| Hover/focus (all interactive)     | color/background/border change                                                                      | instant          | ease-out    |
| Route change                      | fade 0→1 + translateY 8px→0                                                                         | base             | ease-out    |
| Dropdown / tooltip                | fade + translateY 4px→0                                                                             | fast             | ease-out    |
| Dialog                            | fade + translateY 8px→0 (scrim fade only)                                                           | base             | ease-out    |
| Mobile drawer                     | translateX -100%→0 + scrim fade                                                                     | base             | ease-out    |
| Sidebar collapse (lg+)            | width 280↔56 + label fade                                                                           | slow             | ease-in-out |
| Conversation list / lists on load | stagger: fade + translateY 6px→0, 30ms per item, max 8 items                                        | base             | ease-out    |
| New message                       | fade + translateY 8px→0                                                                             | base             | ease-out    |
| Streaming caret                   | blink (steps)                                                                                       | 1s loop          | steps(1)    |
| Skeleton                          | opacity pulse                                                                                       | 1.6s loop        | ease-in-out |
| Toast                             | slide 12px + fade                                                                                   | base             | ease-out    |
| Landing sections                  | reveal on scroll: fade + translateY 16px→0, once, 60ms stagger within a group                       | slow             | ease-out    |
| Landing hero                      | sequenced entrance of eyebrow → headline → paragraph → buttons → preview, 80ms steps, total ≤ 700ms | slow             | ease-out    |
| Landing preview                   | simulated chat that plays once (message appears, code block appears, caret blinks)                  | ≤ 3s total, once | ease-out    |
| Links in prose                    | underline offset change on hover                                                                    | instant          | ease-out    |

Scroll reveals are implemented with `IntersectionObserver` plus a CSS class (`data-reveal`, `data-revealed`), or CSS `animation-timeline: view()` guarded by `@supports`. No scroll-jacking, no parallax.

Stagger implementation: set `--i` via inline style and use `animation-delay: calc(var(--i) * 30ms)`.

### 10.3 Rules

- Animate only `opacity` and `transform` (plus the one sidebar width exception).
- Entrances ease-out, exits are shorter (about 60% of the entrance) and ease-in-out.
- Every `@keyframes` is defined once in `index.css`. Fix: `animate-slide-up` is currently used but undefined.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, remove transforms and loops and reduce fades to `instant`. Keep the global override and `usePrefersReducedMotion`. The streaming caret becomes static.
- Never block interaction while an animation runs.

---

## 11. Accessibility (target: WCAG 2.2 AA)

- Contrast: 4.5:1 for text, 3:1 for UI components and focus rings. No `opacity-60/70` on text to fake secondary color; use `--color-text-secondary` / `-tertiary`.
- `:focus-visible` ring on every interactive element (global rule, Section 7).
- Landmarks: `header`, `nav`, `aside`, `main`, `footer`; skip link.
- Menus follow ARIA menu pattern with keyboard support.
- Theme toggle uses `role="switch"`.
- Touch targets ≥ 44px on touch devices (`@media (pointer: coarse)`).
- Streaming announcements as in Section 8.
- Never convey state with color alone.
- Keep `eslint-plugin-jsx-a11y`; add an axe check to the Playwright suite for each route in both themes.
- Update the README: remove the "100 accessibility" claim until verified by a real Lighthouse run.

---

## 12. Charts and data visualization

The product has no charts today. If any are added (usage, tokens, latency, status history), they follow these rules.

- Library: choose one (recommend `recharts` or a thin custom SVG); never mix. Record the choice here when made.
- Style: **minimal and dense.** 1px lines at 1.5px stroke, no fills under lines except a single 8% tint on a single-series area chart, no gradients, no shadows, no rounded bars (radius 0–2px), no 3D, no donut/pie unless showing ≤ 4 parts of a whole.
- Gridlines: horizontal only, `--color-border-subtle`, 1px, no vertical grid.
- Axes: no axis lines; tick labels in mono `text-small` tertiary; numeric ticks tabular (`font-variant-numeric: tabular-nums`).
- Series colors, in order: `accent-text`, `text` (neutral light), `text-secondary`, `border-strong`, then dashed variants. Max 4 series per chart. Distinguish series by **line style and direct labels**, not by color alone.
- Tooltip: `raised` surface, 1px border, 4px radius, mono values, no animation delay.
- Legends: direct labels at line ends when possible; otherwise a simple inline row above the chart.
- Tables: header row in `text-label`, 1px row borders, right-aligned tabular numbers, 36px row height, no zebra striping, no hover lift (hover = `hover` background only).
- Motion: line draw-in once on mount (360ms, stroke-dashoffset); no looping or re-animating on data refresh beyond a 160ms value transition. Respect reduced motion.
- Every chart has a title, a text summary or accessible data table alternative, and units on the axis.
- Empty/loading states: skeleton at final chart size (no layout shift).

---

## 13. Code and token governance

1. **Tokens only.** Use semantic Tailwind classes generated from `@theme`: `bg-canvas`, `bg-surface`, `bg-raised`, `border-border`, `text-text`, `text-secondary`, `bg-accent`, `text-accent-text`, `rounded`, `duration-fast`, etc.
2. Update `docs/CONVENTIONS.md` to match this file and `docs/ARCHITECTURE.md` to add `/privacy` and `/terms`.
3. Add a lint guard: an ESLint (or CI grep) rule that fails on `backdrop-blur`, `bg-gradient`, `from-`/`to-`, `shadow-xl|2xl`, `rounded-xl|2xl|3xl`, `hover:scale`, `active:scale`, `animate-bounce|pulse|ping`, raw palette colors (`(gray|slate|red|green|yellow|amber|blue)-\d{2,3}`), and `bg-white/`.
4. Prettier with the Tailwind plugin stays.
5. Strict TypeScript stays. Primitive props are typed (e.g. `IconButton` requires `aria-label`).
6. Visual regression: add Playwright screenshots of landing, login, register, empty chat, chat with code, legal, and the profile modal, in dark and light, at 390px and 1280px.

---

## 14. Refactor order

**Phase 0: Cleanup (no visual change yet)**

- Fix known bugs: undefined `--color-surface`, undefined `animate-slide-up`, `px-1` header misalignment, double message spacing, Register missing `px-4`.
- Remove duplicates: sidebar collapse toggle, SettingsDropdown markup, profile modal fields, typing dots.

**Phase 1: Foundation**

1. Rewrite `src/index.css` with `@theme` tokens (Section 3), motion tokens, keyframes, global focus ring, reduced-motion block, base typography.
2. Install and wire Geist fonts (self-hosted). Remove `react-icons`; migrate to `lucide-react`.
3. Theme provider: dark default, `role="switch"` toggle.

**Phase 2: Primitives** (Section 7)
Button, IconButton, Input, Textarea, Badge, Card, Menu, Dialog + ConfirmDialog, Tooltip, Avatar, Skeleton, Toast, Kbd. Delete `GlassButton`, `AnimatedBackground`, `Typewriter`.

**Phase 3: Chat (highest impact, core product)**
App shell and responsive sidebar/drawer → message list and messages → markdown and code blocks → composer with stop → empty state → sidebar list (groups, rows, confirm dialog) → status pill.

**Phase 4: Auth**
`AuthLayout`, Login, Register, profile modal.

**Phase 5: Landing**
Header/footer, hero, capabilities, motion sequence, simulated preview.

**Phase 6: Legal and error pages**
Legal layout with ToC, error boundary, 404.

**Phase 7: Hardening**
Accessibility pass (axe), contrast audit, responsive audit at 360/390/768/1024/1440, lint guards, docs and README corrections, visual regression baselines.

Each phase ends with: lint, typecheck, tests, and a screenshot comparison. Do not start a phase until the previous one passes.

---

## 15. Definition of Done (check before every PR)

- [ ] No banned pattern from Section 2 appears (run the grep guard).
- [ ] No raw colors, radii, shadows, or durations; tokens only.
- [ ] No `dark:` utilities in components.
- [ ] Works at 360px, 768px, 1280px; no horizontal scroll; no `h-screen` on scrolling content.
- [ ] Every interactive element is keyboard reachable with a visible focus ring.
- [ ] Contrast verified (AA) in both themes.
- [ ] Animations are from the approved list, use only tokens, and respect reduced motion.
- [ ] Copy follows Section 2.3.
- [ ] Uses `shared/ui` primitives; nothing reimplemented.
- [ ] Lint, typecheck, unit tests, and e2e pass; visual snapshots reviewed.
- [ ] Docs updated if a rule changed.

---

## 16. Open decisions (confirm before Phase 5)

These were not specified; defaults are applied but may be changed:

1. **Wordmark/logo:** none exists. Default: text wordmark "Zenith" in Geist 600, no symbol. Provide a logo to replace it.
2. **Font:** Geist Sans + Geist Mono (default). Alternatives: Inter + JetBrains Mono.
3. **Navigation extras:** model selector, attachments, regenerate, feedback are not implemented. Add them later using the primitives; this file already defines their placement (header model selector, composer attach button, message actions row).
4. **Landing copy:** to be rewritten by the product owner; agents must not invent claims or statistics.
