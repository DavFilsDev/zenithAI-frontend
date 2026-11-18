# Zenith AI Frontend Refactor Plan

**Date:** 18 November 2026  
**Goal:** Replace the current glass/blue UI with the precise, neutral, crimson-accented design system in `docs/Design.md`, in the exact phase order required by Design.md Section 14.  
**Source of truth:** [`docs/Design.md`](Design.md). If this plan conflicts with Design.md, Design.md wins.  
**How to use:** Read Design.md in full first. Work top to bottom. Check off tasks only after the task-level verification passes. Run the phase exit checklist before starting the next phase. Split a task if it touches more than roughly 8 files; do not reorder phases.

---

## 1. Progress Overview

| Phase     | Name                  |  Tasks |  Done | Status      |
| --------- | --------------------- | -----: | ----: | ----------- |
| 0         | Cleanup               |      7 |     2 | In progress |
| 1         | Foundation            |      5 |     0 | Planned     |
| 2         | Primitives            |      7 |     0 | Planned     |
| 3         | Chat                  |      9 |     0 | Planned     |
| 4         | Auth                  |      3 |     0 | Planned     |
| 5         | Landing               |      5 |     0 | Planned     |
| 6         | Legal and error pages |      4 |     0 | Planned     |
| 7         | Hardening             |     10 |     0 | Planned     |
| **Total** |                       | **50** | **2** |             |

---

## 2. Global Rules Recap

1. Read `docs/Design.md` before any UI change; it overrides `docs/CONVENTIONS.md`, `README.md`, and existing code.
2. Use semantic tokens only: no raw colors, palette classes, arbitrary `rgb(var())` values, raw radii, raw shadows, raw durations, or raw fonts.
3. No banned visual, motion, copy, or code patterns from Design.md Sections 2.1–2.4.
4. Dark is the default; keep the `.dark` class strategy and `@custom-variant dark`; target zero `dark:` utilities in components.
5. Use `lucide-react` only, stroke width `1.5`, sizes 16/20/14, with `aria-label` and a tooltip for icon-only controls.
6. Use `shared/ui` primitives only; pages and features may compose them, never restyle them.
7. Chat uses `100dvh`, a centered 720px column, real landmarks, a skip link, safe-area insets, and an off-canvas drawer below `lg`.
8. Target WCAG 2.2 AA: visible global focus ring, 4.5:1 text contrast, 44px touch targets, no color-only state.
9. Motion is CSS only, from the approved list, using motion tokens, and must respect reduced motion.
10. Every task must satisfy the Design.md Section 15 Definition of Done, including lint, typecheck, unit tests, e2e, and screenshot review.

---

## 3. Phase 0 — Cleanup

**Goal:** Remove known bugs and duplicated implementations without starting the visual redesign.  
**Prerequisites:** None.

### Tasks

- [x] **P0-T01 Fix undefined token and motion class**
  - **Design rules:** Design.md 3.1, 3.6, 8, 10.3, 14 (Phase 0).
  - **Files:** `src/index.css`, `src/features/status/components/ServiceStatus.tsx`, `src/features/chat/components/SettingsDropdown.tsx`.
  - **Do:**
    - Add a temporary `--color-surface` value in both current theme blocks so `ServiceStatus` no longer references an undefined variable; keep it equal to the current panel background until Phase 1 replaces the token system.
    - Define the missing `animate-slide-up` keyframes and utility in `src/index.css`; use an approved fade plus `translateY` motion, not a scale.
    - Keep the existing `SettingsDropdown` usage working; do not rename classes yet.
  - **Done when:** `rg -- '--color-surface|animate-slide-up' src` shows only defined and resolved usages; no undefined CSS variable remains; existing unit tests pass.
  - **Depends on:** None.
  - **Risk:** Low. Temporary tokens are replaced in P1-T01.

- [x] **P0-T02 Fix chat header alignment and double message spacing**
  - **Design rules:** Design.md 3.5, 6.2, 8, 14 (Phase 0).
  - **Files:** `src/features/chat/components/ChatWindow.tsx`, `src/features/chat/components/MessageList.tsx`, `src/features/chat/components/MessageBubble.tsx`.
  - **Do:**
    - Replace the header `px-1` with the same horizontal padding used by the message and composer columns.
    - Remove `mb-4` from `MessageBubble`; let the parent `space-y-4` own turn spacing.
    - Remove the extra `mb-4` from the pending indicator so it follows the same parent rhythm.
  - **Done when:** At 390px and 1280px the header title, message column, and composer share the same left edge; no message component adds its own bottom margin.
  - **Depends on:** None.
  - **Risk:** Low. Final 720px column is completed in P3-T01.

- [ ] **P0-T03 Fix Register horizontal gutters**
  - **Design rules:** Design.md 3.5, 9.2, 14 (Phase 0).
  - **Files:** `src/features/auth/pages/RegisterPage.tsx`.
  - **Do:**
    - Add the missing horizontal page gutter to the Register page outer container.
    - Match the gutter used by Login at the same breakpoint.
  - **Done when:** Register and Login have equal left and right gutters at 390px; no card touches the viewport edge.
  - **Depends on:** None.
  - **Risk:** Low.

- [ ] **P0-T04 Remove duplicate sidebar collapse control**
  - **Design rules:** Design.md 6.2, 14 (Phase 0).
  - **Files:** `src/features/chat/components/Sidebar.tsx`, `src/features/chat/components/SidebarHeader.tsx`.
  - **Do:**
    - Keep one collapse/expand implementation in `SidebarHeader`; add the compact/rail mode needed by the collapsed sidebar.
    - Remove the duplicate button and tooltip markup from `Sidebar`.
    - Preserve `Ctrl+B`/`Cmd+B` behavior and `aria-expanded`.
  - **Done when:** Only `SidebarHeader` renders the collapse/expand control; both expanded and collapsed states use it; keyboard shortcut still works.
  - **Depends on:** None.
  - **Risk:** Medium. Responsive drawer behavior is completed in P3-T02.

- [ ] **P0-T05 Deduplicate SettingsDropdown markup**
  - **Design rules:** Design.md 2.4, 7 (Menu), 14 (Phase 0).
  - **Files:** `src/features/chat/components/SettingsDropdown.tsx`.
  - **Do:**
    - Extract the repeated theme/logout menu-item markup into one local render path used by both `full` and `icon` variants.
    - Keep the existing behavior and ARIA attributes unchanged for now.
  - **Done when:** Theme and logout menu items are defined once; both variants render the same item structure; `SettingsDropdown.test.tsx` still passes.
  - **Depends on:** P0-T01.
  - **Risk:** Low. The final Menu primitive replacement is P3-T08.

- [ ] **P0-T06 Deduplicate profile field blocks**
  - **Design rules:** Design.md 9.5, 14 (Phase 0).
  - **Files:** `src/features/auth/components/UserProfileModal.tsx`.
  - **Do:**
    - Extract the repeated email/username label, value, edit form, error, Save, and Cancel markup into one local field component or render function.
    - Preserve the existing focus trap, validation, error IDs, and update callbacks.
  - **Done when:** Email and username render through one field implementation; no duplicated field JSX remains; existing profile tests pass.
  - **Depends on:** None.
  - **Risk:** Medium. The shared `EditableField` and Dialog extraction are completed in P4-T02.

- [ ] **P0-T07 Remove duplicate typing dots**
  - **Design rules:** Design.md 2.2, 8, 14 (Phase 0).
  - **Files:** `src/features/chat/components/MessageList.tsx`, `src/features/chat/components/MessageBubble.tsx`.
  - **Do:**
    - Choose `MessageBubble` as the single owner of the pending assistant indicator.
    - Remove the duplicate pending block and `showTyping` logic from `MessageList`.
    - Keep the accessible pending label until the streaming caret replaces it in P3-T05.
  - **Done when:** Only one pending typing indicator can render for one pending assistant message; no duplicate status announcements.
  - **Depends on:** P0-T02.
  - **Risk:** Low.

### Phase 0 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] Manual grep for the Phase 0 bugs and duplicate markers

---

## 4. Phase 1 — Foundation

**Goal:** Replace the old color system with the Design.md token system, self-host Geist, migrate icons, and make dark the default.  
**Prerequisites:** Phase 0 passes its exit checklist.

### Tasks

- [ ] **P1-T01 Rewrite `src/index.css` with the design token system**
  - **Design rules:** Design.md 2, 3.1–3.7, 4, 7 (focus ring), 10, 11, 15.
  - **Files:** `src/index.css`.
  - **Do:**
    - Replace the old `:root` RGB-triplet variables and arbitrary `rgb(var())` pattern with `@theme` tokens for dark default and `.light` overrides.
    - Add color, type scale, spacing, radius, `--shadow-float`, z-index, easing, and duration tokens from Design.md Sections 3.1–3.7 and 10.1.
    - Define every approved keyframe once: route fade, menu/tooltip, dialog, drawer, list stagger, new message, caret blink, skeleton pulse, toast, landing reveal, and landing preview.
    - Add base typography, prose/markdown token styles, code/syntax token styles, global `:focus-visible` ring, and the reduced-motion block.
    - Replace the old `animate-scale-up` and `animate-slide-right` definitions with approved fade/translate motion behind temporary class aliases until their owners migrate in Phases 3–4.
  - **Done when:** `src/index.css` is the only token source; no old RGB-triplet variables remain; all keyframes are defined once; focus and reduced-motion rules exist; `npm run build` passes.
  - **Depends on:** Phase 0.
  - **Risk:** High. This task changes the visual foundation and must be reviewed first.

- [ ] **P1-T02 Self-host Geist Sans and Geist Mono**
  - **Design rules:** Design.md 3.4, 10.3, 15.
  - **Files:** `package.json`, `package-lock.json`, `index.html`, `src/index.css`, `public/fonts/geist-variable.woff2` (to be created), `public/fonts/geist-mono-variable.woff2` (to be created).
  - **Do:**
    - Install `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` as dependencies.
    - Copy the two variable font files into `public/fonts/` and declare `@font-face` in `src/index.css` with `font-display: swap` and the correct weight range.
    - Add preload links for the primary sans and mono files in `index.html`.
    - Set `--font-sans` and `--font-mono` from Design.md Section 3.4.
  - **Done when:** No remote font request exists; both fonts load from the app origin; preload links are present; text does not shift after font load.
  - **Depends on:** P1-T01.
  - **Risk:** Medium. Font file paths and licenses must be verified.

- [ ] **P1-T03 Migrate chat icons to `lucide-react`**
  - **Design rules:** Design.md 5, 15.
  - **Files:** `src/features/chat/components/Sidebar.tsx`, `src/features/chat/components/SidebarHeader.tsx`, `src/features/chat/components/ConversationList.tsx`, `src/features/chat/components/Composer.tsx`, `src/features/chat/components/SettingsDropdown.tsx`, `src/features/chat/components/UserButton.tsx`.
  - **Do:**
    - Apply the Design.md Section 5 migration map to every chat icon.
    - Set stroke width to `1.5` and use the specified 16/20/14 sizes.
    - Keep or add `aria-label` on every icon-only button.
  - **Done when:** No `react-icons` import remains in the listed chat files; icons use `lucide-react`; icon-only controls are labelled.
  - **Depends on:** P1-T01.
  - **Risk:** Low.

- [ ] **P1-T04 Migrate profile icons and remove `react-icons`**
  - **Design rules:** Design.md 5, 15.
  - **Files:** `src/features/auth/components/UserProfileModal.tsx`, `package.json`, `package-lock.json`.
  - **Do:**
    - Replace the profile modal icons with `lucide-react` equivalents from the migration map.
    - Remove the `react-icons` dependency after confirming no imports remain.
  - **Done when:** `rg 'react-icons' src package.json package-lock.json` returns no matches; the dependency tree no longer includes `react-icons`; build passes.
  - **Depends on:** P1-T03.
  - **Risk:** Low.

- [ ] **P1-T05 Make dark the default and update the theme switch**
  - **Design rules:** Design.md 3.1, 3.2, 4, 11.
  - **Files:** `src/shared/ui/ThemeProvider.tsx`, `src/shared/ui/ThemeToggle.tsx`, `src/main.tsx`.
  - **Do:**
    - Persist `theme` in `localStorage`; when no stored value exists, use dark and do not follow the system preference.
    - Toggle the `.dark` and `.light` classes consistently with the token strategy chosen in P1-T01.
    - Update the theme-color meta value from the token palette.
    - Convert the toggle to `role="switch"` with `aria-checked` and neutral token styling; remove red/yellow colors.
  - **Done when:** First visit is dark; light persists after reload; the switch exposes correct state to assistive technology; no per-component theme class is required.
  - **Depends on:** P1-T01.
  - **Risk:** Medium. The class strategy must match P1-T01 exactly.

### Phase 1 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] `rg 'react-icons|bg-\[rgb\(var\(--color|backdrop-blur|hover:scale|active:scale' src` reviewed

---

## 5. Phase 2 — Primitives

**Goal:** Build every shared primitive from Design.md Section 7 before page refactors.  
**Prerequisites:** Phase 1 passes its exit checklist.

### Tasks

- [ ] **P2-T01 Build Button and IconButton primitives**
  - **Design rules:** Design.md 2.1, 2.2, 3.6, 7 (Button, IconButton), 11.
  - **Files:** `src/shared/ui/Button.tsx`, `src/shared/ui/IconButton.tsx` (to be created), `src/shared/ui/Button.test.tsx` (to be created), `src/shared/ui/IconButton.test.tsx` (to be created).
  - **Do:**
    - Implement `primary`, `secondary`, `ghost`, and `danger` variants and `sm`/`md`/`lg` sizes.
    - Implement hover, active, focus-visible, disabled, and stable-width loading states; remove all scale transforms.
    - Make `IconButton` require `aria-label` by type and support the 400ms tooltip behavior from Design.md Section 7.
  - **Done when:** All variants and sizes match the specification; no scale or raw color remains; tests cover loading, disabled, focus, and icon labels.
  - **Depends on:** P1-T01.
  - **Risk:** Medium. This primitive is used by every later phase.

- [ ] **P2-T02 Build Input, Textarea, and Kbd primitives**
  - **Design rules:** Design.md 3.5, 3.6, 7 (Input/Textarea, Kbd), 11.
  - **Files:** `src/shared/ui/Input.tsx`, `src/shared/ui/Textarea.tsx` (to be created), `src/shared/ui/Kbd.tsx` (to be created), `src/shared/ui/Input.test.tsx` (to be created).
  - **Do:**
    - Implement the 36px raised field, 1px border, 4px radius, label above, focus border plus ring, error border plus icon plus message, and `aria-describedby`.
    - Add a Textarea with the same field styling and auto-grow support hooks.
    - Add Kbd with mono text, 2px radius, and 1px border.
  - **Done when:** Fields are label-associated, errors are announced, focus is visible, and no glass or raw palette classes remain.
  - **Depends on:** P1-T01.
  - **Risk:** Medium.

- [ ] **P2-T03 Build Badge, Card, Avatar, Skeleton, and update Spinner**
  - **Design rules:** Design.md 2.1, 3.6, 7 (Badge, Card/Panel, Avatar, Skeleton), 8, 10.
  - **Files:** `src/shared/ui/Badge.tsx` (to be created), `src/shared/ui/Card.tsx` (to be created), `src/shared/ui/Avatar.tsx` (to be created), `src/shared/ui/Skeleton.tsx` (to be created), `src/shared/ui/Spinner.tsx`.
  - **Do:**
    - Implement the neutral badge, border-only card, 24/32px avatar, and raised skeleton with the single approved pulse.
    - Update Spinner to use tokens and keep it for route fallback only.
    - Keep radius at 2px for badges and 4px or 0 for cards; use `radius-full` only for avatars and status dots.
  - **Done when:** Each primitive matches its specification, uses tokens only, and has no shadow, blur, or hover lift.
  - **Depends on:** P1-T01.
  - **Risk:** Low.

- [ ] **P2-T04 Build Menu and Tooltip primitives**
  - **Design rules:** Design.md 3.7, 7 (Menu/Dropdown, Tooltip), 10.2, 11.
  - **Files:** `src/shared/ui/Menu.tsx` (to be created), `src/shared/ui/Tooltip.tsx` (to be created), `src/shared/ui/Menu.test.tsx` (to be created).
  - **Do:**
    - Implement `role="menu"`/`menuitem`, arrow keys, Home/End, Escape, outside click, focus restore, 32px items, 4px radius, border, and `--shadow-float`.
    - Implement Tooltip with mono small text, raised surface, border, 4px radius, and configurable delay.
    - Use 400ms for IconButton tooltips and 150ms for standalone tooltips per Design.md Section 7.
  - **Done when:** Keyboard and focus behavior are covered by tests; no raw shadow, radius, or z-index remains.
  - **Depends on:** P1-T01.
  - **Risk:** Medium.

- [ ] **P2-T05 Build Dialog and ConfirmDialog primitives**
  - **Design rules:** Design.md 2.1, 2.4, 3.6, 3.7, 7 (Dialog), 9.5, 11.
  - **Files:** `src/shared/ui/Dialog.tsx` (to be created), `src/shared/ui/ConfirmDialog.tsx` (to be created), `src/shared/ui/Dialog.test.tsx` (to be created).
  - **Do:**
    - Extract the existing focus trap, Escape handling, body scroll lock, labelled title, and focus restore into Dialog.
    - Use a no-blur scrim, max width 440px, 4px radius, border, and `--shadow-float`.
    - Implement ConfirmDialog with a title, one sentence of consequence, ghost Cancel, and danger Delete.
  - **Done when:** Dialog tests cover initial focus, trap, Escape, restore, and scrim; ConfirmDialog is ready to replace every `window.confirm`.
  - **Depends on:** P2-T01.
  - **Risk:** High. Focus behavior is security- and accessibility-sensitive.

- [ ] **P2-T06 Replace the toast styling with token surfaces**
  - **Design rules:** Design.md 2.1, 3.1, 3.6, 3.7, 7 (Toast), 11.
  - **Files:** `src/shared/ui/toastConfig.ts`, `src/shared/ui/notify.tsx`, `src/shared/ui/RateLimitToast.tsx`, `src/app/providers.tsx`.
  - **Do:**
    - Use solid `surface`, 1px border, `text` color, status icon on the left, and 4px radius for all toast variants.
    - Remove translucent backgrounds, backdrop blur, and raw palette colors.
    - Position bottom-center below `sm` and bottom-right at `sm` and above.
  - **Done when:** Success, error, loading, and rate-limit toasts are readable in both themes with AA contrast; no blur or raw palette class remains.
  - **Depends on:** P1-T01.
  - **Risk:** Medium.

- [ ] **P2-T07 Delete decorative home components and unused background assets**
  - **Design rules:** Design.md 2.1, 2.2, 9.1, 14 (Phase 2).
  - **Files:** `src/features/home/components/GlassButton.tsx` (delete), `src/features/home/components/AnimatedBackground.tsx` (delete), `src/features/home/components/Typewriter.tsx` (delete), `src/features/home/pages/HomePage.tsx`, `src/assets/code-bg.webp` (delete), `src/assets/code-bg-768.webp` (delete).
  - **Do:**
    - Remove the three decorative components and the unused background assets.
    - Replace their imports in HomePage with a temporary plain heading, paragraph, and Button-based call to action so the app still builds before Phase 5.
    - Do not add new landing copy claims; use neutral placeholder text that will be replaced by owner-provided copy in Phase 5.
  - **Done when:** The three components and background assets are gone; no import references them; no typewriter, mouse-follow, or glass button remains; build passes.
  - **Depends on:** P2-T01.
  - **Risk:** Medium. Landing is intentionally minimal until Phase 5.

### Phase 2 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] `rg 'GlassButton|AnimatedBackground|Typewriter|backdrop-blur|rounded-xl|rounded-2xl|shadow-xl|shadow-2xl|hover:scale|active:scale' src` reviewed

---

## 6. Phase 3 — Chat

**Goal:** Refactor the core product UI: shell, responsive sidebar, messages, markdown, composer, empty state, conversation list, and status pill.  
**Prerequisites:** Phase 2 passes its exit checklist.

### Tasks

- [ ] **P3-T01 Build the chat shell, landmarks, skip link, and 720px column**
  - **Design rules:** Design.md 6.2, 6.3, 7 (focus ring), 8, 11.
  - **Files:** `src/app/ChatShell.tsx`, `src/features/chat/components/ChatWindow.tsx`, `src/shared/ui/SkipLink.tsx` (to be created).
  - **Do:**
    - Replace `h-screen` with `h-dvh`; use `<aside>`, `<header>`, and `<main id="main">`.
    - Add SkipLink as the first focusable element.
    - Center header content, messages, and composer in one 720px column with shared gutters.
    - Apply safe-area insets to the header and composer.
  - **Done when:** The shell has one main landmark, a working skip link, no horizontal scroll at 360px, and header/messages/composer share one left edge.
  - **Depends on:** Phase 2.
  - **Risk:** High. This is the layout foundation for all chat work.

- [ ] **P3-T02 Build the responsive sidebar and off-canvas drawer**
  - **Design rules:** Design.md 2.1, 2.2, 6.2, 10.2, 11.
  - **Files:** `src/features/chat/components/Sidebar.tsx`, `src/features/chat/components/SidebarHeader.tsx`, `src/app/ChatShell.tsx`, `src/features/chat/model/chatUiStore.ts`.
  - **Do:**
    - Implement 280px expanded and 56px collapsed on `lg+`; below `lg`, use `min(320px, 85vw)` off-canvas drawer with a no-blur scrim.
    - Close the drawer on route change, Escape, and scrim tap; open it from a header button.
    - Keep exactly one collapse control and remove the New Chat shine sweep, green pulse dot, and hover/active scale.
    - Add `aria-expanded`/`aria-controls` and focus return for the drawer trigger.
  - **Done when:** Drawer behavior works at 390px and 768px; sidebar is collapsed rail or expanded at `lg+`; no shine, pulse, or scale remains.
  - **Depends on:** P3-T01.
  - **Risk:** High.

- [ ] **P3-T03 Refactor message list and message rendering**
  - **Design rules:** Design.md 3.5, 8 (Messages, Actions row), 10.2, 11.
  - **Files:** `src/features/chat/components/MessageList.tsx`, `src/features/chat/components/MessageBubble.tsx`, `src/features/chat/components/MessageBubble.test.tsx`.
  - **Do:**
    - Render user messages right-aligned in a raised bordered container, max width 80%.
    - Render assistant messages as plain canvas prose with no container, background, or border.
    - Use 32px turn spacing from the parent only; show timestamps on hover/focus and always expose them to screen readers.
    - Keep actions visible at 60% opacity on touch and on hover/focus-within on desktop.
    - Set `aria-live="off"` on the log while streaming.
  - **Done when:** Assistant messages have no bubble; user messages are raised; turn spacing is 32px; timestamps and actions are keyboard and screen-reader accessible.
  - **Depends on:** P3-T01.
  - **Risk:** High.

- [ ] **P3-T04 Restyle markdown and code blocks**
  - **Design rules:** Design.md 3.4, 3.6, 8 (Markdown/prose, Code blocks), 10.
  - **Files:** `src/features/chat/components/MessageBubble.tsx`, `src/index.css`.
  - **Do:**
    - Map prose headings, links, lists, tables, and blockquotes to the type scale and semantic tokens.
    - Build a code block header with a mono language label and a copy button.
    - Use raised background, 1px border, 4px radius, 13px/20px mono, horizontal scroll, and a labelled `tabIndex=0` region.
    - Replace the rainbow highlight theme with neutral grays plus accent keywords.
  - **Done when:** Markdown and code blocks use tokens only; copy works; code region is keyboard reachable and labelled; no raw palette color remains.
  - **Depends on:** P3-T03.
  - **Risk:** Medium.

- [ ] **P3-T05 Add composer stop, streaming caret, and completion announcement**
  - **Design rules:** Design.md 2.2, 8 (Streaming, Composer), 10.2, 11.
  - **Files:** `src/features/chat/components/Composer.tsx`, `src/features/chat/pages/ChatPage.tsx`, `src/features/chat/components/MessageList.tsx`, `src/features/chat/components/Composer.test.tsx` (to be created).
  - **Do:**
    - Replace Send with Stop while streaming; wire Stop and Escape to the existing `abort`.
    - Add the 2px accent streaming caret with steps timing and a static reduced-motion state.
    - Auto-grow the textarea from one to eight rows, then scroll; keep the mono hint below.
    - Announce completion once through a visually hidden `role="status"` element instead of `aria-live` on the log.
  - **Done when:** Stop aborts the stream; Escape aborts; caret respects reduced motion; the completion message is announced once; tests cover stop and keyboard behavior.
  - **Depends on:** P3-T03, P3-T04.
  - **Risk:** High. The streaming state machine and announcements must not regress.

- [ ] **P3-T06 Replace the empty chat state**
  - **Design rules:** Design.md 8 (Empty state), 9.3, 11.
  - **Files:** `src/features/chat/pages/ChatPage.tsx`, `src/features/chat/components/ChatEmptyState.tsx` (to be created).
  - **Do:**
    - Replace “What’s on your mind?” with a neutral `text-h1` line such as “Start a conversation.”
    - Add a one-sentence description and up to four plain bordered suggestion rows without icons.
    - Clicking a suggestion fills the composer draft and focuses it; it does not auto-send.
  - **Done when:** Empty chat shows no illustration or sparkles; suggestions are keyboard reachable; composer remains the primary action.
  - **Depends on:** P3-T05.
  - **Risk:** Low.

- [ ] **P3-T07 Refactor conversation list grouping, rows, and delete confirmation**
  - **Design rules:** Design.md 3.4, 3.6, 8 (Sidebar), 11.
  - **Files:** `src/features/chat/components/ConversationList.tsx`, `src/features/chat/components/Sidebar.tsx`, `src/features/chat/components/Sidebar.test.tsx`.
  - **Do:**
    - Group conversations by Today, Yesterday, Previous 7 days, and Older with mono label headings.
    - Use 36px rows, a 2px accent left bar plus `accent-subtle` for the selected row, and actions visible on hover/focus and always on touch.
    - Replace every `window.confirm` with ConfirmDialog.
    - Use Skeleton for the loading list instead of a spinner.
    - Preserve existing pagination behavior with neutral controls until the API changes.
  - **Done when:** Grouping and selection styling match the specification; delete uses ConfirmDialog; no `window.confirm` remains; list loading uses Skeleton.
  - **Depends on:** P3-T02, P2-T05.
  - **Risk:** High.

- [ ] **P3-T08 Replace SettingsDropdown with Menu and Avatar**
  - **Design rules:** Design.md 3.4, 7 (Menu, Avatar, Tooltip), 8 (Sidebar), 11.
  - **Files:** `src/features/chat/components/SettingsDropdown.tsx` (delete), `src/features/chat/components/SettingsDropdown.test.tsx` (delete), `src/features/chat/components/Sidebar.tsx`, `src/features/chat/components/UserButton.tsx`.
  - **Do:**
    - Use the Menu primitive for the user menu with Profile and Log out items.
    - Use Avatar plus username for the trigger; use Tooltip for the icon-only rail state.
    - Place ThemeToggle as its own `role="switch"` row in the sidebar footer.
    - Delete the old duplicated SettingsDropdown component and its test.
  - **Done when:** Only the Menu primitive implements dropdown behavior; the user menu has Profile and Log out; ThemeToggle is a switch; SettingsDropdown files are gone.
  - **Depends on:** P2-T04, P3-T02.
  - **Risk:** Medium.

- [ ] **P3-T09 Restyle the service status pill**
  - **Design rules:** Design.md 2.1, 2.2, 3.1, 3.4, 3.6, 8 (Service status pill), 11.
  - **Files:** `src/features/status/components/ServiceStatus.tsx`, `src/features/status/components/ServiceStatus.test.tsx`.
  - **Do:**
    - Use a neutral bordered badge, 6px status dot, and mono label.
    - Map status colors to `success`, `warning`, and `danger` tokens; never pulse.
    - Remove backdrop blur, raw palette colors, and the undefined surface token.
  - **Done when:** The pill is readable in both themes, has no blur or pulse, and tests cover online, waking, unavailable, and retry states.
  - **Depends on:** P2-T03.
  - **Risk:** Low.

### Phase 3 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] `rg 'window\.confirm|backdrop-blur|bg-white/|border-white/|animate-bounce|animate-pulse|hover:scale|active:scale|h-screen' src/features/chat src/app/ChatShell.tsx` reviewed

---

## 7. Phase 4 — Auth

**Goal:** Apply the two-pane auth layout and the Dialog/EditableField profile modal.  
**Prerequisites:** Phase 3 passes its exit checklist.

### Tasks

- [ ] **P4-T01 Build AuthLayout and refactor Login and Register**
  - **Design rules:** Design.md 2.1, 2.3, 3.5, 9.2, 11, 15.
  - **Files:** `src/features/auth/components/AuthLayout.tsx` (to be created), `src/features/auth/pages/LoginPage.tsx`, `src/features/auth/pages/RegisterPage.tsx`, `src/shared/ui/CardHeader.tsx` (delete).
  - **Do:**
    - Implement the 480px form column on canvas and a flat surface pane with a short product statement and static code preview on `lg+`; hide the pane below `lg`.
    - Use `text-h2`, Input, one full-width primary Button, and one text link to the alternate page.
    - Give both pages identical `px-4` minimum gutters and remove the glass card, `rounded-2xl`, shadow, and duplicated layout.
    - Replace banned hype copy with literal, neutral copy.
  - **Done when:** Login and Register share one AuthLayout; both have identical gutters; no glass, gradient, oversized radius, or banned copy remains; CardHeader is deleted.
  - **Depends on:** P2-T02.
  - **Risk:** Medium.

- [ ] **P4-T02 Refactor the profile modal onto Dialog and EditableField**
  - **Design rules:** Design.md 7 (Dialog), 9.5, 11.
  - **Files:** `src/features/auth/components/UserProfileModal.tsx`, `src/features/auth/components/EditableField.tsx` (to be created).
  - **Do:**
    - Replace the hand-rolled modal shell with the Dialog primitive.
    - Move the Phase 0 field deduplication into `EditableField` with labels above values, inline edit, Save, Cancel, error, and `aria-describedby`.
    - Keep the existing profile update behavior and success/error notifications.
  - **Done when:** The profile modal uses Dialog and EditableField; email and username share one field implementation; focus trap, Escape, and focus restore are covered by tests.
  - **Depends on:** P2-T05, P4-T01.
  - **Risk:** Medium.

- [ ] **P4-T03 Update auth tests for the new layout and dialog**
  - **Design rules:** Design.md 11, 15.
  - **Files:** `src/features/auth/pages/authFlows.test.tsx`, `src/features/auth/components/UserProfileModal.test.tsx`.
  - **Do:**
    - Update role and label queries for the new auth layout, copy, and dialog primitive.
    - Add assertions for the shared gutters and the EditableField save/cancel/error path.
    - Keep the tests user-facing; do not add test-only IDs.
  - **Done when:** Auth tests pass with the new structure and cover sign in, register, profile edit, error, cancel, and Escape.
  - **Depends on:** P4-T01, P4-T02.
  - **Risk:** Low.

### Phase 4 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] `rg 'CardHeader|backdrop-blur|rounded-2xl|shadow-xl|shadow-2xl|text-gray|dark:' src/features/auth src/shared/ui/CardHeader.tsx` reviewed

---

## 8. Phase 5 — Landing

**Goal:** Rebuild the landing page as a left-aligned, factual product page with a real static chat preview.  
**Prerequisites:** Phase 4 passes its exit checklist. Product-owner copy is required before this phase; agents must not invent claims.

### Tasks

- [ ] **P5-T01 Build the shared site header and footer**
  - **Design rules:** Design.md 9.1, 9.4, 11.
  - **Files:** `src/shared/layout/SiteHeader.tsx` (to be created), `src/shared/layout/SiteFooter.tsx` (to be created), `src/features/home/pages/HomePage.tsx`.
  - **Do:**
    - Build a 56px header with the text wordmark on the left, ThemeToggle, Log in ghost link, and Sign up primary link on the right.
    - Build a footer with Privacy, Terms, the service status pill, copyright, and a hairline top border.
    - Use the same header and footer for legal pages in Phase 6.
  - **Done when:** Header and footer use tokens and primitives only; wordmark is “Zenith”; links are keyboard reachable; no glass or blur remains.
  - **Depends on:** P2-T01, P3-T09.
  - **Risk:** Low.

- [ ] **P5-T02 Build the hero and static product preview**
  - **Design rules:** Design.md 2.1, 2.3, 9.1 (Hero), 10.2, 11.
  - **Files:** `src/features/home/pages/HomePage.tsx`, `src/features/home/components/ProductPreview.tsx` (to be created).
  - **Do:**
    - Implement the 7/5 two-column hero on `lg+` and single column below.
    - Left: mono eyebrow, `text-display` headline, one supporting paragraph, primary and secondary actions.
    - Right: a static bordered frame containing a real chat excerpt with one message, one code block, and the composer.
  - **Done when:** Hero is left-aligned and asymmetric; preview is static and rendered from real UI components or faithful markup; no stock image, gradient, or typewriter exists.
  - **Depends on:** P5-T01.
  - **Risk:** Medium.

- [ ] **P5-T03 Build the capabilities definition list**
  - **Design rules:** Design.md 2.1, 2.3, 9.1 (Capabilities), 11.
  - **Files:** `src/features/home/pages/HomePage.tsx`, `src/features/home/components/Capabilities.tsx` (to be created).
  - **Do:**
    - Implement a plain two-column definition list with hairline dividers.
    - Use `text-h3` for terms and `text-body` secondary for descriptions.
    - Do not add icon circles, card grids, fake stats, or testimonials.
  - **Done when:** Capabilities are a two-column definition list on desktop and stack below `md`; no icons or cards are used.
  - **Depends on:** P5-T02.
  - **Risk:** Low.

- [ ] **P5-T04 Add landing motion sequence and simulated preview**
  - **Design rules:** Design.md 10.1, 10.2, 10.3, 11.
  - **Files:** `src/features/home/pages/HomePage.tsx`, `src/features/home/components/ProductPreview.tsx`, `src/index.css`, `src/shared/hooks/useReveal.ts` (to be created).
  - **Do:**
    - Add the hero entrance sequence in 80ms steps with total duration at or below 700ms.
    - Add section reveal on scroll once with 60ms stagger using IntersectionObserver and `data-reveal`/`data-revealed`.
    - Add the one-time simulated preview sequence in at most 3s.
    - Remove transforms and loops under reduced motion.
  - **Done when:** Only approved animations run; each runs once; reduced motion shows the final state immediately; no scroll-jacking or parallax exists.
  - **Depends on:** P5-T02, P5-T03.
  - **Risk:** Medium.

- [ ] **P5-T05 Update landing tests**
  - **Design rules:** Design.md 9.1, 11, 15.
  - **Files:** `src/features/home/pages/HomePage.test.tsx`.
  - **Do:**
    - Update tests for the new wordmark, hero, links, capabilities, and preview.
    - Assert the legal links and service status are present.
    - Keep queries role- and label-based.
  - **Done when:** Landing tests pass and cover the public call to action, legal links, and preview presence.
  - **Depends on:** P5-T01, P5-T02, P5-T03, P5-T04.
  - **Risk:** Low.

### Phase 5 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] `rg 'Typewriter|AnimatedBackground|GlassButton|bg-gradient|from-|to-|backdrop-blur|rounded-xl|rounded-2xl|shadow-xl' src/features/home src/shared/layout` reviewed

---

## 9. Phase 6 — Legal and Error Pages

**Goal:** Apply the legal layout with ToC and replace the error boundary and 404 redirect with designed pages.  
**Prerequisites:** Phase 5 passes its exit checklist.

### Tasks

- [ ] **P6-T01 Build the legal layout with table of contents**
  - **Design rules:** Design.md 9.4, 11.
  - **Files:** `src/features/legal/components/LegalLayout.tsx`, `src/features/legal/pages/PrivacyPage.tsx`, `src/features/legal/pages/TermsPage.tsx`.
  - **Do:**
    - Use the shared SiteHeader and SiteFooter.
    - Limit content to 68ch, use `text-h1`, mono tertiary last-updated text, type-scale headings, and hairline separators.
    - Add a sticky in-page ToC on `lg+` from an explicit sections list passed by each page.
    - Keep legal content and dates unchanged.
  - **Done when:** Both legal pages share one layout; ToC links resolve to heading IDs; content width is 68ch; no glass or raw palette remains.
  - **Depends on:** P5-T01.
  - **Risk:** Medium.

- [ ] **P6-T02 Redesign the error boundary**
  - **Design rules:** Design.md 2.1, 9.6, 11.
  - **Files:** `src/app/ErrorBoundary.tsx`.
  - **Do:**
    - Render a left-aligned `text-h1`, one sentence, one primary Button, and an optional mono error code.
    - Remove the centered glass card, gradient, blur, oversized radius, and shadow.
    - Keep the reload behavior and development logging.
  - **Done when:** The fallback uses tokens and primitives only; no glass or raw palette remains; reload still works.
  - **Depends on:** P2-T01.
  - **Risk:** Low.

- [ ] **P6-T03 Add a designed 404 page**
  - **Design rules:** Design.md 9.6, 11.
  - **Files:** `src/app/NotFoundPage.tsx` (to be created), `src/app/router.tsx`.
  - **Do:**
    - Replace the `*` redirect with a lazy-loaded NotFoundPage.
    - Render a left-aligned `text-h1`, one sentence, and a primary link back to home.
    - Keep the route public and lazy.
  - **Done when:** Unknown routes render the 404 page instead of redirecting; the page is keyboard accessible and uses primitives.
  - **Depends on:** P6-T02.
  - **Risk:** Low.

- [ ] **P6-T04 Update legal and 404 tests**
  - **Design rules:** Design.md 11, 15.
  - **Files:** `src/features/legal/pages/legalPages.test.tsx`, `src/app/NotFoundPage.test.tsx` (to be created), `e2e/legal.spec.ts`.
  - **Do:**
    - Update legal tests for the new layout, ToC links, and shared header/footer.
    - Add a 404 test for an unknown route.
    - Keep the Playwright legal journey on the new link names.
  - **Done when:** Legal and 404 tests pass; ToC navigation works; unknown route test asserts the 404 heading.
  - **Depends on:** P6-T01, P6-T03.
  - **Risk:** Low.

### Phase 6 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] `rg 'backdrop-blur|rounded-2xl|shadow-xl|shadow-2xl|bg-white/|text-gray|dark:' src/features/legal src/app/ErrorBoundary.tsx src/app/NotFoundPage.tsx` reviewed

---

## 10. Phase 7 — Hardening

**Goal:** Prove accessibility, responsiveness, visual consistency, token governance, and documentation.  
**Prerequisites:** Phase 6 passes its exit checklist.

### Tasks

- [ ] **P7-T01 Add axe checks for every route in both themes**
  - **Design rules:** Design.md 11, 13.6, 15.
  - **Files:** `package.json`, `package-lock.json`, `e2e/a11y.spec.ts` (to be created), `e2e/support/app.ts`.
  - **Do:**
    - Add `@axe-core/playwright` as a dev dependency.
    - Run axe on landing, login, register, empty chat, chat with a message, legal pages, profile modal, and 404.
    - Run each route in dark and light at 390px and 1280px.
  - **Done when:** No serious or critical axe violations remain on any route in either theme.
  - **Depends on:** Phase 6.
  - **Risk:** Medium.

- [ ] **P7-T02 Add Playwright visual regression baselines**
  - **Design rules:** Design.md 13.6, 15.
  - **Files:** `e2e/visual.spec.ts` (to be created), `playwright.config.ts`, `e2e/support/app.ts`.
  - **Do:**
    - Capture landing, login, register, empty chat, chat with code, legal, and profile modal.
    - Capture dark and light at 390px and 1280px.
    - Commit reviewed baselines and document how to update them intentionally.
  - **Done when:** Snapshots exist for every required screen and theme; a clean run matches the baselines.
  - **Depends on:** P7-T01.
  - **Risk:** Medium.

- [ ] **P7-T03 Run the responsive audit at all required widths**
  - **Design rules:** Design.md 6.1, 6.2, 11, 15.
  - **Files:** `e2e/responsive.spec.ts` (to be created), `src/index.css`.
  - **Do:**
    - Check 360, 390, 768, 1024, and 1440 widths.
    - Assert no horizontal scroll, correct drawer behavior below `lg`, correct rail/expanded behavior at `lg+`, and safe-area padding on the composer.
  - **Done when:** Every width passes without overflow; drawer and rail states match the specification.
  - **Depends on:** P7-T02.
  - **Risk:** Medium.

- [ ] **P7-T04 Add the banned-pattern guard**
  - **Design rules:** Design.md 2, 13.3, 15.
  - **Files:** `scripts/check-banned-patterns.mjs` (to be created), `package.json`, `.github/workflows/ci.yml`.
  - **Do:**
    - Add a CI grep script that fails on `backdrop-blur`, gradients, `from-`/`to-`, `shadow-xl|2xl`, `rounded-xl|2xl|3xl`, `hover:scale`, `active:scale`, `animate-bounce|pulse|ping`, raw palette colors, and `bg-white/`.
    - Exclude token declarations in `src/index.css` from color-value checks.
    - Add `npm run check:design` and wire it into CI.
  - **Done when:** The script reports file and line for each violation; a clean tree passes; CI runs the check.
  - **Depends on:** Phase 6.
  - **Risk:** Low.

- [ ] **P7-T05 Clean up app and shared residuals**
  - **Design rules:** Design.md 2, 3, 13, 15.
  - **Files:** Residual files reported by `npm run check:design` under `src/app` and `src/shared/ui`, up to 8 files. Expected candidates: `src/app/ErrorBoundary.tsx`, `src/shared/ui/Button.tsx`, `src/shared/ui/Input.tsx`, `src/shared/ui/Spinner.tsx`, `src/shared/ui/ThemeToggle.tsx`, `src/shared/ui/toastConfig.ts`, `src/shared/ui/RateLimitToast.tsx`.
  - **Do:**
    - Replace any remaining raw palette, arbitrary color, `dark:`, blur, gradient, scale, non-token radius/shadow, and unapproved animation with tokens and primitives.
    - Remove any leftover unused shared component.
  - **Done when:** The guard reports zero findings under `src/app` and `src/shared/ui`; tests still pass.
  - **Depends on:** P7-T04.
  - **Risk:** Medium. Split by directory if more than 8 files appear.

- [ ] **P7-T06 Clean up chat residuals**
  - **Design rules:** Design.md 2, 3, 8, 13, 15.
  - **Files:** Residual files reported by `npm run check:design` under `src/features/chat`, up to 8 files.
  - **Do:**
    - Remove remaining banned classes, `dark:` overrides, raw colors, blur, gradient, scale, and non-token values.
    - Verify message, composer, sidebar, list, and status states in both themes.
  - **Done when:** The guard reports zero findings under `src/features/chat`; chat tests pass.
  - **Depends on:** P7-T05.
  - **Risk:** Medium. Split by component group if more than 8 files appear.

- [ ] **P7-T07 Clean up auth, home, legal, and status residuals**
  - **Design rules:** Design.md 2, 3, 9, 13, 15.
  - **Files:** Residual files reported by `npm run check:design` under `src/features/auth`, `src/features/home`, `src/features/legal`, and `src/features/status`, up to 8 files.
  - **Do:**
    - Remove remaining banned classes, `dark:` overrides, raw colors, blur, gradient, scale, and non-token values.
    - Verify both themes and all required widths for these pages.
  - **Done when:** The guard reports zero findings under these feature directories; page tests pass.
  - **Depends on:** P7-T06.
  - **Risk:** Medium. Split by feature if more than 8 files appear.

- [ ] **P7-T08 Correct the documentation**
  - **Design rules:** Design.md 3, 5, 11, 13.2, 15.
  - **Files:** `docs/CONVENTIONS.md`, `docs/ARCHITECTURE.md`, `README.md`.
  - **Do:**
    - Update `CONVENTIONS.md` to reference the Design.md token and motion rules instead of the old styling guidance.
    - Add `/privacy` and `/terms` to the `ARCHITECTURE.md` route table.
    - Update README icons to `lucide-react` only, remove the unverified “100 accessibility” claim, and state that responsive behavior is verified by the new audits.
  - **Done when:** Documentation matches the implemented token system, routes, icons, and verified quality claims.
  - **Depends on:** P7-T07.
  - **Risk:** Low.

- [ ] **P7-T09 Update end-to-end journeys for the new UI**
  - **Design rules:** Design.md 2.3, 8, 9, 11, 15.
  - **Files:** `e2e/support/app.ts`, `e2e/chat.spec.ts`, `e2e/legal.spec.ts`.
  - **Do:**
    - Update labels and roles for the new auth, composer, stop, message, sidebar, and legal UI.
    - Add a stop-stream journey if the mock can hold a stream open.
    - Keep the existing session-restore and rate-limit journeys.
  - **Done when:** All Playwright journeys pass against the refactored UI without relying on test IDs.
  - **Depends on:** P7-T08.
  - **Risk:** Low.

- [ ] **P7-T10 Run the final Definition of Done audit**
  - **Design rules:** Design.md 15.
  - **Files:** None; verification only.
  - **Do:**
    - Run format, lint, typecheck, unit tests, e2e, visual regression, axe, responsive audit, build, and `npm run check:design`.
    - Verify no banned patterns, no `dark:` utilities, no raw tokens, no `h-screen` on scrolling content, and no horizontal scroll at required widths.
    - Review all screenshots in both themes.
  - **Done when:** Every Section 15 checkbox passes and the review is recorded in the PR description.
  - **Depends on:** P7-T01 through P7-T09.
  - **Risk:** Low.

### Phase 7 exit checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] `npm run check:design`
- [ ] Playwright visual regression and axe suites pass
- [ ] Screenshot review at 390px and 1280px, dark and light
- [ ] Definition of Done from Design.md Section 15 is complete

---

## 11. Specific Work That Must Appear

| Required work                                                                                                          | Task IDs                           | Verification                                    |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| Fix undefined `--color-surface`                                                                                        | P0-T01, P3-T09                     | No undefined surface token; status pill renders |
| Fix undefined `animate-slide-up`                                                                                       | P0-T01, P1-T01                     | Keyframe and utility defined once               |
| Fix `px-1` header misalignment                                                                                         | P0-T02, P3-T01                     | Header and content share one left edge          |
| Fix double message spacing                                                                                             | P0-T02, P3-T03                     | Parent owns 32px turn spacing                   |
| Fix Register missing `px-4`                                                                                            | P0-T03, P4-T01                     | Register and Login gutters match                |
| Remove duplicate sidebar collapse control                                                                              | P0-T04, P3-T02                     | One control in `SidebarHeader`                  |
| Deduplicate SettingsDropdown markup                                                                                    | P0-T05, P3-T08                     | Menu primitive replaces duplicated markup       |
| Deduplicate profile modal fields                                                                                       | P0-T06, P4-T02                     | One EditableField implementation                |
| Deduplicate typing dots                                                                                                | P0-T07, P3-T05                     | One pending indicator, then caret               |
| Remove duplicated auth layout                                                                                          | P4-T01                             | One AuthLayout for both pages                   |
| Delete `GlassButton`                                                                                                   | P2-T07                             | File removed and no import remains              |
| Delete `AnimatedBackground`                                                                                            | P2-T07                             | File removed and no import remains              |
| Delete `Typewriter`                                                                                                    | P2-T07                             | File removed and no import remains              |
| Delete sidebar shine and green pulse                                                                                   | P3-T02                             | No shine/pulse classes remain                   |
| Delete every `window.confirm`                                                                                          | P3-T07                             | ConfirmDialog used; grep is clean               |
| Rewrite `src/index.css` to `@theme` tokens                                                                             | P1-T01                             | One token source; no RGB triplets               |
| Self-host Geist fonts                                                                                                  | P1-T02                             | Local font files and preload links              |
| Remove `react-icons` and migrate to `lucide-react`                                                                     | P1-T03, P1-T04                     | No react-icons import or dependency             |
| Replace raw colors, palette classes, arbitrary `rgb(var())`, `dark:`, blur, gradients, scale, shadows, oversized radii | All phases; verified P7-T04–P7-T07 | `npm run check:design` clean                    |
| Build all Design.md Section 7 primitives                                                                               | P2-T01–P2-T06                      | Primitives exist in `src/shared/ui`             |
| Responsive chat drawer below `lg`                                                                                      | P3-T02                             | Drawer behavior at 390/768                      |
| Use `100dvh`                                                                                                           | P3-T01                             | No chat `h-screen`                              |
| Respect safe-area insets                                                                                               | P3-T01                             | Header/composer padding uses `env()`            |
| Add `<main id="main">` landmark                                                                                        | P3-T01                             | One main landmark in chat shell                 |
| Add skip link                                                                                                          | P3-T01                             | First focusable element targets `#main`         |
| Wire Stop to existing abort                                                                                            | P3-T05                             | Stop and Escape abort the stream                |
| Add streaming caret                                                                                                    | P3-T05                             | 2px accent caret, reduced-motion static         |
| Announce completion once                                                                                               | P3-T05                             | Hidden `role="status"` announces once           |
| Add lint/CI banned-pattern guard                                                                                       | P7-T04                             | `npm run check:design` fails on violations      |
| Add Playwright screenshots and axe checks                                                                              | P7-T01, P7-T02                     | Both themes, 390/1280                           |
| Correct CONVENTIONS, ARCHITECTURE, README                                                                              | P7-T08                             | Routes, icons, and claims match reality         |

---

## 12. Dependency and Risk Notes

**Critical path:** P1-T01 → P2-T01/P2-T05 → P3-T01/T02/T03/T05 → P4/P5/P6 → P7.

**Parallel work within a phase:**

- Phase 1: P1-T03 and P1-T04 can follow P1-T01 in parallel with P1-T02.
- Phase 2: P2-T01 through P2-T06 can be split across agents after P1-T01; P2-T05 depends on P2-T01.
- Phase 3: P3-T04 and P3-T06 can run in parallel after P3-T03; P3-T08 depends on P2-T04 and P3-T02.
- Phase 5: P5-T03 can run in parallel with P5-T02 after P5-T01.
- Phase 6: P6-T02 and P6-T03 can run in parallel after Phase 5.
- Phase 7: P7-T01, P7-T04, and P7-T08 can start in parallel; P7-T02 depends on P7-T01; cleanup tasks follow P7-T04.

**Five riskiest tasks:**

1. P1-T01 — token and keyframe rewrite affects every screen.
2. P2-T05 — Dialog focus trap and restore must not regress.
3. P3-T01 — shell landmarks and 720px column define the core layout.
4. P3-T02 — responsive drawer and single collapse control.
5. P3-T05 — stop, streaming caret, and completion announcements.

**Execution notes:**

- Do not add an animation library. CSS only, as required by Design.md Section 10.
- Do not add a gradient or glass UI kit. Do not reintroduce `react-icons`.
- Keep one PR per phase at most. If a phase is too large, split by task while preserving phase order.
- Commit only when the maintainer asks. Agents edit the working tree and report changes.
- Live streaming verification is blocked by the backend SSE `406` until the backend fix is deployed; mocked Playwright journeys can still cover the UI.

---

## 13. Per-File Migration Table

| File                                                     | What changes                                                                                                              | Phase/Task                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `src/index.css`                                          | Replace old RGB tokens with `@theme`, fonts, keyframes, focus ring, reduced motion, prose and code styles, landing reveal | P1-T01, P1-T02, P3-T04, P5-T04         |
| `src/main.tsx`                                           | Set initial dark/light class consistently with ThemeProvider                                                              | P1-T05                                 |
| `src/app/router.tsx`                                     | Replace `*` redirect with NotFoundPage route                                                                              | P6-T03                                 |
| `src/app/ChatShell.tsx`                                  | Landmarks, skip link, `h-dvh`, drawer state, safe areas                                                                   | P3-T01, P3-T02                         |
| `src/app/providers.tsx`                                  | Toast position and token-styled Toaster                                                                                   | P2-T06                                 |
| `src/app/ErrorBoundary.tsx`                              | Token-only left-aligned error fallback                                                                                    | P6-T02                                 |
| `src/app/NotFoundPage.tsx`                               | New designed 404 page                                                                                                     | P6-T03                                 |
| `src/app/NotFoundPage.test.tsx`                          | New 404 test                                                                                                              | P6-T04                                 |
| `src/features/auth/pages/LoginPage.tsx`                  | AuthLayout, neutral copy, token fields, gutters                                                                           | P4-T01                                 |
| `src/features/auth/pages/RegisterPage.tsx`               | `px-4`, AuthLayout, neutral copy, token fields                                                                            | P0-T03, P4-T01                         |
| `src/features/auth/pages/authFlows.test.tsx`             | Update roles, labels, layout assertions                                                                                   | P4-T03                                 |
| `src/features/auth/components/AuthLayout.tsx`            | New shared two-pane auth layout                                                                                           | P4-T01                                 |
| `src/features/auth/components/UserProfileModal.tsx`      | Deduplicate fields, Dialog, EditableField, lucide icons                                                                   | P0-T06, P1-T04, P4-T02                 |
| `src/features/auth/components/UserProfileModal.test.tsx` | Update dialog and field tests                                                                                             | P4-T03                                 |
| `src/features/auth/components/EditableField.tsx`         | New reusable profile field                                                                                                | P4-T02                                 |
| `src/features/chat/components/ChatWindow.tsx`            | Header padding, landmarks, 720px column, safe areas                                                                       | P0-T02, P3-T01                         |
| `src/features/chat/components/Composer.tsx`              | Token composer, stop, auto-grow, hint, caret input                                                                        | P1-T03, P3-T05                         |
| `src/features/chat/components/Composer.test.tsx`         | New stop and keyboard tests                                                                                               | P3-T05                                 |
| `src/features/chat/components/ConversationList.tsx`      | Groups, 36px rows, selected bar, actions, ConfirmDialog, Skeleton                                                         | P1-T03, P3-T07                         |
| `src/features/chat/components/MessageBubble.tsx`         | No assistant bubble, user raised, timestamps, actions, markdown/code                                                      | P0-T02, P0-T07, P3-T03, P3-T04         |
| `src/features/chat/components/MessageBubble.test.tsx`    | Update message, timestamp, code, and action tests                                                                         | P3-T03, P3-T04                         |
| `src/features/chat/components/MessageList.tsx`           | Parent spacing, aria-live off, pending indicator removal, completion status                                               | P0-T02, P0-T07, P3-T03, P3-T05         |
| `src/features/chat/components/SettingsDropdown.tsx`      | Deduplicate, lucide icons, then delete in favor of Menu                                                                   | P0-T01, P0-T05, P1-T03, P3-T08         |
| `src/features/chat/components/SettingsDropdown.test.tsx` | Delete with component                                                                                                     | P3-T08                                 |
| `src/features/chat/components/Sidebar.tsx`               | Single collapse, responsive drawer, list, Menu, ThemeToggle, remove shine/pulse                                           | P0-T04, P1-T03, P3-T02, P3-T07, P3-T08 |
| `src/features/chat/components/Sidebar.test.tsx`          | Update drawer, list, and menu tests                                                                                       | P3-T02, P3-T07, P3-T08                 |
| `src/features/chat/components/SidebarHeader.tsx`         | Single collapse control, lucide, drawer trigger                                                                           | P0-T04, P1-T03, P3-T02                 |
| `src/features/chat/components/UserButton.tsx`            | Avatar, Menu trigger, Tooltip, lucide                                                                                     | P1-T03, P3-T08                         |
| `src/features/chat/components/ChatEmptyState.tsx`        | New empty state and suggestions                                                                                           | P3-T06                                 |
| `src/features/chat/pages/ChatPage.tsx`                   | Pass stop, empty state composition                                                                                        | P3-T05, P3-T06                         |
| `src/features/chat/pages/chatFlows.test.tsx`             | Update stop, empty, sidebar, and send flows                                                                               | P3-T05, P3-T06, P3-T07                 |
| `src/features/chat/model/chatUiStore.ts`                 | Add drawer open/close state separate from desktop collapse                                                                | P3-T02                                 |
| `src/features/home/pages/HomePage.tsx`                   | Remove decorative components, add header/footer, hero, capabilities, motion                                               | P2-T07, P5-T01, P5-T02, P5-T03, P5-T04 |
| `src/features/home/pages/HomePage.test.tsx`              | Update landing tests                                                                                                      | P5-T05                                 |
| `src/features/home/components/GlassButton.tsx`           | Delete                                                                                                                    | P2-T07                                 |
| `src/features/home/components/AnimatedBackground.tsx`    | Delete                                                                                                                    | P2-T07                                 |
| `src/features/home/components/Typewriter.tsx`            | Delete                                                                                                                    | P2-T07                                 |
| `src/features/home/components/ProductPreview.tsx`        | New static chat preview                                                                                                   | P5-T02, P5-T04                         |
| `src/features/home/components/Capabilities.tsx`          | New definition-list section                                                                                               | P5-T03                                 |
| `src/assets/code-bg.webp`                                | Delete unused background asset                                                                                            | P2-T07                                 |
| `src/assets/code-bg-768.webp`                            | Delete unused background asset                                                                                            | P2-T07                                 |
| `src/features/legal/components/LegalLayout.tsx`          | Shared header/footer, 68ch, ToC, token prose                                                                              | P6-T01                                 |
| `src/features/legal/pages/PrivacyPage.tsx`               | Add section IDs and ToC data                                                                                              | P6-T01                                 |
| `src/features/legal/pages/TermsPage.tsx`                 | Add section IDs and ToC data                                                                                              | P6-T01                                 |
| `src/features/legal/pages/legalPages.test.tsx`           | Update layout, ToC, and 404 coverage                                                                                      | P6-T04                                 |
| `src/features/status/components/ServiceStatus.tsx`       | Token badge, mono label, status tokens, no blur/pulse                                                                     | P0-T01, P3-T09                         |
| `src/features/status/components/ServiceStatus.test.tsx`  | Update status and retry tests                                                                                             | P3-T09                                 |
| `src/shared/ui/Button.tsx`                               | Variants, sizes, states, loading, no scale                                                                                | P2-T01                                 |
| `src/shared/ui/Button.test.tsx`                          | New variant and loading tests                                                                                             | P2-T01                                 |
| `src/shared/ui/IconButton.tsx`                           | New icon-only button with required label and tooltip                                                                      | P2-T01                                 |
| `src/shared/ui/IconButton.test.tsx`                      | New label and tooltip tests                                                                                               | P2-T01                                 |
| `src/shared/ui/Input.tsx`                                | Token field, label, focus, error, password toggle                                                                         | P2-T02                                 |
| `src/shared/ui/Input.test.tsx`                           | New field and error tests                                                                                                 | P2-T02                                 |
| `src/shared/ui/Textarea.tsx`                             | New auto-grow-capable textarea                                                                                            | P2-T02                                 |
| `src/shared/ui/Kbd.tsx`                                  | New keyboard hint primitive                                                                                               | P2-T02                                 |
| `src/shared/ui/Badge.tsx`                                | New badge primitive                                                                                                       | P2-T03                                 |
| `src/shared/ui/Card.tsx`                                 | New border-only card primitive                                                                                            | P2-T03                                 |
| `src/shared/ui/Avatar.tsx`                               | New initials avatar primitive                                                                                             | P2-T03                                 |
| `src/shared/ui/Skeleton.tsx`                             | New skeleton primitive                                                                                                    | P2-T03                                 |
| `src/shared/ui/Spinner.tsx`                              | Token-only route fallback                                                                                                 | P2-T03                                 |
| `src/shared/ui/Menu.tsx`                                 | New ARIA menu primitive                                                                                                   | P2-T04                                 |
| `src/shared/ui/Menu.test.tsx`                            | New keyboard and focus tests                                                                                              | P2-T04                                 |
| `src/shared/ui/Tooltip.tsx`                              | New tooltip primitive                                                                                                     | P2-T04                                 |
| `src/shared/ui/Dialog.tsx`                               | New dialog primitive with focus trap                                                                                      | P2-T05                                 |
| `src/shared/ui/Dialog.test.tsx`                          | New focus, Escape, restore tests                                                                                          | P2-T05                                 |
| `src/shared/ui/ConfirmDialog.tsx`                        | New destructive confirmation dialog                                                                                       | P2-T05                                 |
| `src/shared/ui/CardHeader.tsx`                           | Delete after AuthLayout replaces it                                                                                       | P4-T01                                 |
| `src/shared/ui/toastConfig.ts`                           | Token toast styles, no blur, no raw colors                                                                                | P2-T06                                 |
| `src/shared/ui/notify.tsx`                               | Keep API, wire token toast config                                                                                         | P2-T06                                 |
| `src/shared/ui/RateLimitToast.tsx`                       | Token surface, status icon, no blur                                                                                       | P2-T06                                 |
| `src/shared/ui/ThemeProvider.tsx`                        | Dark default, persistence, `.dark`/`.light`, meta color                                                                   | P1-T05                                 |
| `src/shared/ui/ThemeToggle.tsx`                          | `role="switch"`, `aria-checked`, neutral tokens                                                                           | P1-T05, P3-T08                         |
| `src/shared/ui/SkipLink.tsx`                             | New skip-to-content link                                                                                                  | P3-T01                                 |
| `src/shared/layout/SiteHeader.tsx`                       | New shared header for landing and legal                                                                                   | P5-T01                                 |
| `src/shared/layout/SiteFooter.tsx`                       | New shared footer for landing and legal                                                                                   | P5-T01                                 |
| `src/shared/hooks/useReveal.ts`                          | New IntersectionObserver reveal hook                                                                                      | P5-T04                                 |

---

## 14. Open Questions

1. **Logo:** Design.md defaults to the text wordmark “Zenith.” Is that final, or will an asset be supplied before Phase 5?
2. **Fonts:** Design.md defaults to Geist Sans + Geist Mono. Confirm, or switch to Inter + JetBrains Mono before P1-T02.
3. **Navigation extras:** Model selector, attachments, regenerate, and feedback are not implemented. Confirm they stay out of scope for this refactor; Design.md already defines where they go later.
4. **Landing copy:** The product owner must provide the final headline, supporting paragraph, capability terms, and descriptions before Phase 5. Agents must not invent claims or statistics.
5. **Theme strategy:** This plan assumes `@theme` defines dark values and `.light` overrides them, while retaining the `.dark` class and `@custom-variant dark`. Confirm this reading of Design.md Section 4.
6. **Tooltip delay:** Design.md Section 7 says Tooltip uses 150ms and IconButton uses 400ms. This plan uses 400ms for IconButton and 150ms for standalone tooltips. Confirm.
7. **Auth copy:** Current auth copy violates the Section 2.3 bans (“smart coding companion,” “most advanced AI coding platform”). This plan replaces it with neutral literal copy. Confirm the replacement is acceptable.
8. **Axe and snapshots:** This plan adds `@axe-core/playwright` as a dev dependency and commits Playwright visual snapshots. Confirm both are allowed.
9. **Lint guard:** Design.md Section 13.3 allows an ESLint rule or CI grep. This plan chooses a CI grep script to avoid a custom ESLint plugin. Confirm.
10. **Sidebar pagination:** Design.md does not mention conversation pagination. This plan preserves the existing Previous/Next controls as neutral text buttons. Confirm, or remove them in favor of a later cursor-based design.
