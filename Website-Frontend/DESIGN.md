# Between Us — Design & Build Spec

> A private web app for a long-distance couple, **Dhruv (SFO) & Anjali (BLR)**, to stay close across timezones through small daily rituals and games. This document describes the product, the design system, the architecture, and the conventions so any AI/engineer can extend it consistently.

---

## 1. Product Overview

**Name:** Between Us
**Tagline:** "Your little place between the miles."
**Users:** A single couple (two people). Not multi-tenant, not a marketing site — it opens **directly into the app dashboard**, no landing/hero page.
**Tone:** Warm, tender, a little funny, hand-made. Never corporate, never "SaaS." Copy reads like inside jokes between two people, not product marketing.

**Core idea:** Replace the loneliness of distance with shared, low-effort rituals — mood check-ins, countdowns, mini-games, letters, and a memory archive.

---

## 2. Tech Stack & Architecture

- **Single-page app**, no build step. Plain React 18 + Babel standalone, transpiled in-browser from `<script type="text/babel">` tags.
- **Tailwind via CDN** (`cdn.tailwindcss.com`) with an inline `tailwind.config` extending the theme.
- **Fonts:** Google Fonts — Instrument Serif (display, *always italic*), Geist (sans/body), Geist Mono (labels, dates, numbers).
- **No router library.** Hash-based routing (`window.location.hash`) managed in `app.jsx`.
- **No real backend yet.** All content lives in `src/data.jsx` as mock data, *intentionally shaped to map onto a future Supabase schema* (tables: `couple`, `mood_checkins`, `memories`, `quiz_questions`, `quiz_attempts`, `drawings`, `photo_challenges`, `activity`, etc.).

### File structure
```
index.html          ← entry: Tailwind config, global CSS, font + script loads
src/
  data.jsx          ← all mock data (couple, quiz, dates, letters, memories, bucket…)
  ui.jsx            ← shared primitives + icon set, exported to window
  music.jsx         ← MusicCard / soundtrack component
  home.jsx          ← Home dashboard
  quiz.jsx          ← Relationship Quiz game
  drawing.jsx       ← "Future Home, Badly" 60-second drawing game
  blurred.jsx       ← "Guess the Blurred Photo" game
  dates.jsx         ← Date Night spinner wheel
  letters.jsx       ← "Open When" letters
  memories.jsx      ← Memories timeline
  bucket.jsx        ← Bucket list
  settings.jsx      ← Account / couple settings
  app.jsx           ← shell (sidebar, topbar, mobile nav, routing) — loads LAST
```

### Cross-file sharing convention (IMPORTANT)
Each Babel script has its own scope. Shared components/data are published to `window` at the bottom of their file via `Object.assign(window, { … })`. `ui.jsx` and `data.jsx` must load **before** any page that uses them; `app.jsx` loads **last** because it references every page component. Keep this load order in `index.html`.

> When adding a new page: create `src/<page>.jsx`, export its component to `window`, add a `<script>` tag in `index.html` **before** `app.jsx`, and register it in the `ROUTES` array.

---

## 3. Design System

### 3.1 Color palette (Tailwind `theme.extend.colors`)
A warm, paper-like palette. Cream base, soft ink (never pure black), three accent families + one butter accent defined inline.

| Token | Role | Key values |
|---|---|---|
| `cream` 50–400 | Backgrounds, surfaces | `#FCFAF5 #FAF6EF #F4ECDD #EADFC8 #D9C9AC` |
| `ink` 300–900 | Text & strokes (warm near-black) | `#1C1814` (900) → `#BFB3A2` (300) |
| `coral` 50–700 | Primary accent (love / Dhruv) | base `#DD7E66` (500) |
| `lavender` 50–600 | Secondary accent (Anjali) | base `#9E8FBE` (500) |
| `sage` 50–600 | Tertiary accent (calm / "connected") | base `#7E9F86` (500) |
| **butter** | 4th accent, **not** a Tailwind token — use literals | bg `#FBF1D6`, text `#8A6A1D`, solid `#E8B647` |

**Rules:**
- Page/body background is `#FAF6EF` (cream-100). Surfaces are white. Avoid "card everywhere" — use flat hairline panels where possible.
- Text is `ink-900/800/700` for content, `ink-500/400` for muted/labels. Never `#000`.
- **Dhruv = coral, Anjali = lavender.** Keep this mapping consistent (avatars, mood rows, activity dots).
- Don't invent new hues. If a new shade is needed, derive within an existing family.

### 3.2 Typography
- **Display / headings:** Instrument Serif, **always italic** — use the `.font-serif-i` class (`font-family: 'Instrument Serif'; font-style: italic`). Used for page titles, card titles, big numbers/stats. Tracking slightly tight, leading tight (~1–1.1).
- **Body / UI:** Geist (`font-sans`). Sizes typically 13–15px.
- **Labels / dates / numbers:** Geist Mono (`font-mono`), often uppercase with `tracking-[0.14em]` at `11px`, color `ink-500`. This "eyebrow" label is a recurring motif above titles.
- **Tabular numbers** (`tabular-nums`) for counters and clocks.

### 3.3 Shape, shadow, texture
- **Radii:** generous — `rounded-2xl`/`rounded-3xl` for cards, `rounded-full` for buttons/chips/avatars.
- **Shadows** (custom tokens): `shadow-soft`, `shadow-softer`, `shadow-inset-hair`. All very low-contrast and warm-tinted.
- **Hairlines:** `ring-1 ring-ink-900/[0.05–0.10]` instead of hard borders.
- **Paper grain:** `body.grain::before` overlays a faint radial-dot pattern with `mix-blend-multiply`. Decorative gradient glows (radial, ~45% opacity) sit behind some cards.

### 3.4 Motion (defined in `index.html` `<style>`)
- `.fade-up` / `@keyframes fadeUp` — entrance.
- `.stagger > *` — sequential reveal of children (60ms steps), used for game-tile grids.
- `.page-enter` — page transition on route change (`main` is keyed by route).
- `.pulse-dot` / `softPulse` — the live "connected / both online" dot.
- `.lift` — cards rise 2px on hover.
- `.nudge` — quick attention bounce.
- `.drift-bg` — slow animated multi-color gradient (used on the music sheen).
- `.underline-scribble` — hand-drawn coral SVG underline applied to emphasis words (e.g. "Anjali" in the greeting). A signature touch.
- `::selection` is coral-tinted. Tap highlight removed globally.

### 3.5 Shared components (`src/ui.jsx`)
All exported to `window`. Reuse these — don't hand-roll new buttons/chips.

- **Icons** — `I.*` set: stroke-only, 1.5px, lucide-style, 24px viewBox. Members: `Home, Quiz, Draw, Photo, Spinner, Letter, Timeline, List, Gear, Heart, Play, Plus, Undo, Trash, Eraser, X, Check, Arrow, Send, Sparkle, Music, Calendar, Pin, Lock, Unlock, Pencil, Shuffle, Mood, Volume, Globe`. Use `<Icon>` with children or a `d` prop to add more.
- **`Surface`** — white rounded-2xl card with soft shadow + hairline ring. The default container.
- **`Panel`** — background-less rounded panel, hairline ring only (lighter than Surface).
- **`SectionHeader`** — `{eyebrow, title, sub, right}`; serif-italic title + mono eyebrow.
- **`Button`** — `kind`: `primary` (ink-900 fill), `coral`, `soft`, `ghost`, `outline`. `size`: `sm|md|lg`. Always pill-shaped. Optional `icon` / `iconRight`.
- **`Chip`** — pill tag/filter. `tone`: `ink|coral|lavender|sage|butter|cream`, `selected` state, `size`, optional `icon`. Renders `<button>` if `onClick` else `<span>`.
- **`Avatar`** / **`PairAvatar`** — serif-italic initial in a tinted circle. PairAvatar overlaps D (coral) + A (lavender). The brand mark is the same two overlapping circles with `mix-blend-multiply`.
- **`Stat`** — mono label + big serif-italic value + sub.
- **`CountUp`** / **`useCountUp`** — eased count-up animation (easeOutCubic).
- **`PhotoBlock`** — image placeholder: soft gradient `bg`, optional `blur`, paper-noise overlay, mono caption pill. **Photos are gradient stand-ins** — there are no real images yet; each memory/challenge carries a `bg` gradient string.
- **`Hair`** — 1px divider.
- **`LiveDot`** — pulsing "connected" indicator.
- **`Modal`** — bottom-sheet on mobile, centered on desktop; Esc to close, scroll-locked.
- **`SoundtrackCard`** — "tonight's soundtrack" chooser (note: titles only, **no lyrics**).

---

## 4. App Shell (`src/app.jsx`)

- **Desktop:** fixed 244px left **Sidebar** — brand mark + "Dhruv & Anjali", nav grouped into top items + **Together** + **Account** sections, and a bottom "connected" status card. Active item = ink-900 fill with a coral dot.
- **Mobile:** horizontally scrollable bottom **MobileNav** with icon+label; coral indicator bar on the active tab.
- **TopBar** (sticky, blurred): date (mono) + current page label, a **two-timezone clock** widget (`TwoClocks`), a "both online" pulsing sage dot, and the PairAvatar.
- **Routing:** `ROUTES` array maps `id → {label, icon, Page}`. State synced to `window.location.hash`; `main` is keyed by route so `.page-enter` replays. Scrolls to top on navigate.

### Routes
| id | Label | Group |
|---|---|---|
| `home` | Home | top |
| `quiz` | Quiz | top |
| `drawing` | Future Home | top |
| `blurred` | Blurred Photo | top |
| `dates` | Date Night | Together |
| `letters` | Letters | Together |
| `memories` | Memories | Together |
| `bucket` | Bucket List | Together |
| `settings` | Settings | Account |

---

## 5. Pages

### Home (`home.jsx`)
Dashboard, no hero. Sections, top to bottom:
1. **Greeting** — "Hi Dhruv & Anjali" (Anjali gets the scribble underline) + date + a **"Send I miss you"** coral pulse button (shows "Sent · she'll see it" for 2.2s).
2. **Countdown card** (wide) — "Next time together." If `COUPLE.next_visit` is `null`, shows a **"soon 😉"** placeholder + "Pick a date"; otherwise a live D/H/M/S countdown. Plus "Days together" count-up (since anniversary) and "Calls this month."
3. **MusicCard** + **Latest memory** preview (right column).
4. **Tonight's choices** — 4 staggered game tiles (Quiz / Future Home / Blurred / Letter).
5. **Tonight's tiny date** card (numbered steps) + **Mood check-in** (both partners pick a mood chip).
6. **Recent activity** feed.

### Quiz (`quiz.jsx`)
"Relationship Quiz." 6 categories: **Memories, Favorites, Inside Jokes, Future Plans, Deep Questions, Songs**. 13 questions, each with 4 options, an answer index, and custom `ok`/`no` blurbs (warm, funny). Some have `hint`.

### Future Home / Drawing (`drawing.jsx`)
60-second drawing game on a `<canvas>`. Random **twist** prompts (`DRAW_TWISTS`, e.g. "add a tiny kitchen") and snarky **ratings** (`DRAW_RATINGS`, e.g. "zoning violation, but cute"). Tools include pencil/eraser/undo/trash (icons exist).

### Blurred Photo (`blurred.jsx`)
"Guess the Blurred Photo." 4 challenges (`PHOTO_CHALLENGES`), each a gradient `PhotoBlock` (blurred), with `hint`, multiple-choice `options`, `correct`, and a tender `note` revealed after.

### Date Night (`dates.jsx`)
Spinner wheel across 7 categories: **Talk, Game, Create, Food, Music, Memory, Future**. 10 ideas (`DATE_IDEAS`) with duration/mood/materials/steps. A saved list (`SAVED_DATES`).

### Letters (`letters.jsx`)
"Open When" letters. 8 categories (`LETTER_CATEGORIES`). Each letter: author/recipient, `written` date, `locked` boolean (sealed letters show `(sealed)`), and a `tone` color. Bodies are multi-paragraph, intimate.

### Memories (`memories.jsx`)
Tagged timeline. Tags: **Calls, Visits, Firsts, Funny, Hard Moments, Future, Music**. Each memory has date, title, location, note, optional `song`, a `bg` gradient, and a `spotify` field (null now — meant to be set via UI and persisted to localStorage). Includes a "Someday / TBD" future placeholder memory.

### Bucket List (`bucket.jsx`)
6 sections: **Places to go, Food to try, Little rituals, Future home, Songs to share, Silly goals**. Each item: title, `addedBy` (Dhruv/Anjali/Both), `status` (**Dreaming → Planned → Done**), note.

### Settings (`settings.jsx`)
Account / couple settings.

---

## 6. Data Model (`src/data.jsx`)

Key exports (all on `window`):
- `COUPLE` — `{ partner_a, partner_b, anniversary, next_visit, cities, airports }`. `next_visit: null` drives the "soon 😉" state. Anniversary `2021-03-10`. Airports SFO/BLR.
- `QUIZ_QUESTIONS`, `QUIZ_CATEGORIES`
- `DRAW_TWISTS`, `DRAW_RATINGS`
- `PHOTO_CHALLENGES`, `ACTIVITY`, `LATEST_MEMORY`, `TONIGHT_DATE`, `SOUNDTRACK`, `MOODS`
- `DATE_CATEGORIES`, `DATE_IDEAS`, `SAVED_DATES`
- `LETTER_CATEGORIES`, `LETTERS`
- `MEMORY_TAGS`, `MEMORIES`
- `BUCKET_SECTIONS`, `BUCKET_ITEMS`, `BUCKET_STATUSES`

> Data is written as if it came from a DB — stable `id`s, foreign-key-friendly shapes — so migrating to Supabase later is mechanical.

---

## 7. Voice & Content Guidelines

- Copy is **personal and playful**, written between two real people. Eyebrow labels are lowercase-feeling and quiet; titles are warm.
- Humor is dry and affectionate ("the realtor is crying", "zoning violation, but cute", "one sec for twenty minutes").
- **Music:** reference song *titles and artists only* (Billie Eilish, Anuv Jain) — **never reproduce lyrics.**
- Cultural texture is intentional (dosa, rasam, monsoon, autos, SFO↔BLR) — keep it authentic, not stereotyped.
- No filler. Every card earns its place. Prefer fewer, warmer elements over dense dashboards.

---

## 8. Conventions for Extending

1. **Reuse `ui.jsx` primitives** and the `I.*` icon set; match existing spacing/typography.
2. **Keep the Dhruv=coral / Anjali=lavender / sage=calm** color logic.
3. New page → file + `window` export + script tag (before `app.jsx`) + `ROUTES` entry.
4. Use `.font-serif-i` for any display text; mono uppercase eyebrows above titles.
5. Photos are gradient `PhotoBlock`s until real images exist — every photo-bearing record carries a `bg` gradient string.
6. Persist user-set state (e.g. moods, spotify links, saved dates) to `localStorage` and rehydrate on load.
7. Canonical HTML, double-quoted attrs, explicit closing tags (the editor relies on it).
8. Mobile-first: hit targets ≥44px, bottom nav has safe-area padding.
