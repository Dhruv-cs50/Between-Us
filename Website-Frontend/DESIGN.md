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
> Repo root (one level above) holds `.gitignore` (ignores `.DS_Store`, `.playwright-mcp/`) and `CLAUDE.md`. Vercel root dir is `Website-Frontend/`, shown below.
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
- **`PhotoBlock`** — image placeholder: soft gradient `bg`, optional `blur`, paper-noise overlay, mono caption pill. Renders a real photo when given `imgPath` (Supabase Storage → signed URL), else the gradient.
- **`PhotoPicker`** — `{ file, onPick, label }`. Explicit pill **tap button** ("Add a photo" / "Change photo") that triggers a *hidden* `<input type=file accept="image/*">` via a ref, plus a 48px thumbnail preview + filename. Used in both Add-memory and Memory-edit forms. The hidden-input-behind-a-button pattern is required for iOS Safari: a bare file input is a poor tap target, while a button `.click()`ing the input opens the native Photo Library / Take Photo sheet.
- **`Hair`** — 1px divider.
- **`LiveDot`** — pulsing "connected" indicator.
- **`Modal`** — bottom-sheet on mobile, centered on desktop; Esc to close, scroll-locked.
- **`SoundtrackCard`** — "tonight's soundtrack" chooser (note: titles only, **no lyrics**).

---

## 4. App Shell (`src/app.jsx`)

- **Desktop:** fixed 244px left **Sidebar** — brand mark + "Dhruv & Anjali", nav grouped into top items + **Together** + **Account** sections, and a bottom "connected" status card. Active item = ink-900 fill with a coral dot.
- **Mobile:** horizontally scrollable bottom **MobileNav** with icon+label; coral indicator bar on the active tab.
- **TopBar** (sticky, blurred): date (mono) + current page label, a **two-timezone clock** widget (`TwoClocks`), a **live presence indicator**, and the PairAvatar.
- **Real-time presence:** `App` joins a Supabase Realtime Presence channel (`presence:{coupleId}`) keyed by the user's auth id, so multiple tabs of one person collapse to a single identity. `partnerOnline = presentIds.some(id => id !== myUserId)`. TopBar shows a **pulsing sage dot + "both online"** when the partner is present, or a **static grey dot + "{partner} offline"** otherwise (the dot is always visible on mobile; the label appears at `sm+`). The Sidebar "connected" card mirrors this ("both online" / "waiting for {partner}"). Presence uses only the default Realtime config — no DB tables. Helpers: `sbJoinPresence(coupleId, userId, meta, onChange)` / `sbLeavePresence(channel)`.
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
1. **Greeting** — **personalized to the signed-in person** (`me` prop). Reads "Hi {me} & {partner}" with the signed-in person's name first and scribble-underlined in *their* accent (coral for Dhruv via `.underline-scribble`, lavender for Anjali via `.underline-scribble-lavender`). A private `WELCOME_NOTES[me.key]` line sits under it (a short note from the other partner). Plus date + a **"Send I miss you"** button tinted to `me.accent` (shows "Sent · {partner} will see it" for 2.2s).
2. **Countdown card** (wide) — "Next time together." If `COUPLE.next_visit` is `null`, shows a **"soon 😉"** placeholder + "Pick a date"; otherwise a live D/H/M/S countdown. Plus "Days together" count-up (since anniversary) and "Calls this month." Below that: a thin strip with **SFO↔BLR distance (8,726 mi · always)** on the left and **days to next milestone** (2k/3k/5k/10k) on the right — fills the empty space that appeared when the right column (MusicCard + LatestMemory) is taller.
3. **MusicCard** + **Latest memory** preview (right column).
4. **Tonight's choices** — 4 staggered game tiles (Quiz / Future Home / Blurred / Letter).
5. **Tonight's tiny date** card (numbered steps) + **Mood check-in** — both partners pick a mood chip (6 options with emoji: 😊 happy, 😴 tired, 💙 missing you, ✨ excited, 🌿 quiet, 😤 stressed). Shows loading skeleton while fetching, relative timestamp ("just now", "5m ago") after current mood label, ✓ "saved" flash on change. `sbFetchLatestMoods` returns `{ who: { mood, checked_at } }` objects.
6. **Recent activity** feed.

### Quiz (`quiz.jsx`)
"Relationship Quiz." 6 categories: **Memories, Favorites, Inside Jokes, Future Plans, Deep Questions, Songs**. 13 questions, each with 4 options, an answer index, and custom `ok`/`no` blurbs (warm, funny). Some have `hint`.

### Future Home / Drawing (`drawing.jsx`)
60-second drawing game on a `<canvas>`. Random **twist** prompts (`DRAW_TWISTS`, e.g. "add a tiny kitchen") and snarky **ratings** (`DRAW_RATINGS`, e.g. "zoning violation, but cute"). Tools include pencil/eraser/undo/trash (icons exist).

**Layout:** Page fits the viewport without scrolling. Outer container uses `height: calc(100vh - 260px); overflow: hidden`. Grid is `flex-1 min-h-0` inside a flex-col. Canvas wrapper is `flex-1 min-h-0` inside a flex-col Surface. `setupCanvas` uses `rect.height` when the wrapper has CSS height (flex-stretched), falling back to `width * 0.6` aspect ratio otherwise. `requestAnimationFrame` defers the initial setup so flex layout settles first. Side panel (`min-h-0; overflow-y-auto`) scrolls internally so Twist Prompts never pushes the page taller.

### Blurred Photo (`blurred.jsx`)
"Guess the Blurred Photo." 4 challenges (`PHOTO_CHALLENGES`), each a gradient `PhotoBlock` (blurred), with `hint`, multiple-choice `options`, `correct`, and a tender `note` revealed after. The **"Add photo memory"** button reuses the wired `AddMemoryModal` (exported to `window` from `memories.jsx`) — real photo upload via `PhotoPicker` + Supabase save. (The old mock drop-zone modal was removed.) The rounds themselves still use static `PHOTO_CHALLENGES`; sourcing rounds from real memories is future work.

### Date Night (`dates.jsx`)
Spinner wheel across 7 categories: **Talk, Game, Create, Food, Music, Memory, Future**. 10 ideas (`DATE_IDEAS`) with duration/mood/materials/steps. A saved list (`SAVED_DATES`).

### Letters (`letters.jsx`)
"Open When" letters. 8 categories (`LETTER_CATEGORIES`). Each letter: author/recipient, `written` date, `locked` boolean (sealed letters show `(sealed)`), and a `tone` color. Bodies are multi-paragraph, intimate. **"Write a letter" modal is fully wired** — single-select category chips, body textarea, recipient select (the two partners), and a sealed/open select. Author is derived as the partner who is *not* the recipient; `tone` follows the author's accent (Dhruv→coral, Anjali→lavender); `written` is today's display date. Saves via `sbAddLetter`, optimistic prepend via `onAdd`. (Note: "seal until a specific date" was dropped — there is no `unlock_date` column or scheduled-unlock logic yet; a sealed letter unlocks only via `sbUpdateLetter({ locked: false })`.) **`LetterModal` supports edit + delete** for DB-backed letters (`editable = letters.length > 0`). A small pencil sits on each saved envelope's top-left and opens the modal **straight into edit mode** (`startEditing`) — this is the only way to reach a *sealed* letter's controls, since sealed envelopes don't open for reading. The edit form mirrors `AddLetterModal` (category chips, body, recipient select, sealed/open select); **Save** recomputes `author`/`tone` from the recipient and calls `sbUpdateLetter`; **Delete** confirms then calls `sbDeleteLetter`. Both fire `onChanged` → `reload()`.

### Memories (`memories.jsx`)
Tagged timeline. Tags: **Calls, Visits, Firsts, Funny, Hard Moments, Future, Music**. Each memory has date, title, location, note, optional `song`, a `bg` gradient, and a `spotify` field (null now — meant to be set via UI and persisted to localStorage). Includes a "Someday / TBD" future placeholder memory. **`MemoryModal` supports inline edit + delete** when the memory came from the DB (`editable` prop = `memories.length > 0`; static fallback memories are read-only since they have no DB row). Pencil icon by the close button flips the text column into an edit form (title / date / location / note / tag chips); **Save** calls `sbUpdateMemory` then mutates `m` in place; **Delete** confirms via `window.confirm` then calls `sbDeleteMemory`. Both fire `onChanged` → `reload()`, which preserves the current featured memory if it still exists else picks the newest. The edit form also has a **photo (re)upload** field — on save it calls `sbUploadPhoto(coupleId, m.id, file)` and writes the returned path to `img_path`. All memory `PhotoBlock`s (featured, card, modal) now pass `imgPath={m.img_path}` so real uploaded photos render in place of the gradient.

### Bucket List (`bucket.jsx`)
6 sections: **Places to go, Food to try, Little rituals, Future home, Songs to share, Silly goals**. Each item: title, `addedBy` (Dhruv/Anjali/Both), `status` (**Dreaming → Planned → Done**), note. **`BucketModal` is a single add/edit modal** — controlled title/section/note/status inputs. Add path saves via `sbAddBucketItem`; **edit** (pencil on each row, shown for DB-backed items) prefills the modal and saves via `sbUpdateBucketItem`; **Delete** (in edit mode) confirms then calls `sbDeleteBucketItem`. `BucketList` keeps local state in sync with `upsertItem`/`removeItem` (modal state: `undefined` = closed, `null` = add, object = edit). Cycle-status button still calls `sbUpdateBucketStatus` live.

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

### Per-partner identity (`identityFor`, `WELCOME_NOTES`)
`data.jsx` also exports the identity layer. `identityFor({ email, role })` returns `{ key, name, accent, partnerKey, partnerName, partnerAccent }` — accent is `coral` for Dhruv, `lavender` for Anjali. Detection is email-first (substring "anjali"/"dhruv"), then `profile.role`, then default Dhruv. `app.jsx` computes `me` once and passes it to every page. `WELCOME_NOTES = { anjali, dhruv }` holds the private per-person Home line (plain text, edit freely). Used by: Home greeting/accent/note + "I miss you" button, mood "(you)" tag, and the new-letter recipient default (recipient → `me.partnerName`, so author derives as the signed-in person).

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
3. New page → file + `window` export + script tag (before `auth.jsx`) + `ROUTES` entry with `(p) => <Component {...p} />` pattern.
4. Use `.font-serif-i` for any display text; mono uppercase eyebrows above titles.
5. Photos: `PhotoBlock` now supports both gradient `bg` and real `imgPath` (Supabase Storage path → signed URL).
6. Live data → Supabase via helpers in `supabase.jsx`. Static content → `data.jsx`.
7. **Never** call `useMemo`/`useEffect`/`useState` after a conditional `return`. Declare all hooks first.
8. **Always** use `ReactDOM.createPortal(content, document.body)` for modals — CSS animations leave transforms on ancestors that trap `fixed` elements.
9. Avoid `date` as a PostgREST column name in `.order()` — it's a reserved word and causes 400 errors.
10. Use straight quotes only **anywhere a quote delimits a JS string** — inside JSX attribute expressions `{}` *and* in plain JS code (`useState('')`, `toLocaleDateString('en-US', …)`). Curly/smart quotes `'` `'` are not valid JS string delimiters and throw a Babel SyntaxError that kills the whole script tag. They are only safe inside JSX *text content* or already-straight-quoted strings. Editors that auto-"smarten" quotes are the usual culprit. Validate with `Babel.transform(code, { presets: ['react'] })` over `src/*.jsx` before commit.
11. **Modal form fields must be `bg-white`**, not `bg-cream-100` — the `Modal` sheet is `bg-cream-100`, so cream inputs become invisible (and iOS renders the native `type=date` control borderless/blank). All Add/Edit modals (memories, letters, bucket) use `bg-white ring-1 ring-ink-900/10` at `h-11`.
12. Mobile-first: hit targets ≥44px, bottom nav has safe-area padding. **Form controls render ≥16px on `max-width:640px`** (global rule in `index.html`) so iOS Safari doesn't auto-zoom on focus — keep the 13–14px design sizes for desktop via Tailwind, the media query bumps them on mobile. Horizontal chip/nav rows use `.no-scrollbar` which also enables `-webkit-overflow-scrolling: touch`.
13. **Viewport-fit pages** (canvas, games): use `style={{ height: 'calc(100vh - 260px)', overflow: 'hidden' }}` on outer container + `flex-1 min-h-0` on grid + `flex flex-col min-h-0` on Surface. Use inline `style` not Tailwind for overflow — Tailwind CDN class scanning can miss `overflow-hidden` on dynamically-rendered JSX.
14. **Activity feed** rows coming from Supabase need `transformActivity(row)` (in `home.jsx`) to map `{ type, who, payload, created_at }` → `{ kind, who, what, meta, when }`. Log events via `sbLogActivity(coupleId, type, who, payload)`.
15. **`sbFetchLatestMoods`** returns `{ who: { mood, checked_at } }` objects (not flat strings). Any consumer must destructure `.mood` and `.checked_at`.

---

## 9. Backend (Supabase)

**Live project:** `https://bgjwqqgpfljjgvsydpao.supabase.co`

### Tables (all with RLS)
| Table | Purpose |
|---|---|
| `couples` | One row per couple. Holds `next_visit`, `anniversary` |
| `profiles` | One row per auth user. Links to `couple_id`, stores `role`, `invite_code` |
| `memories` | Personal memories. `img_path` = storage path (null = use `bg` gradient) |
| `letters` | Open When letters. `locked` = sealed |
| `bucket_items` | Bucket list. `status`: Dreaming → Planned → Done |
| `mood_checkins` | Per-person mood with timestamp. Latest per person = current mood |
| `activity` | Feed items. `type`, `who`, `payload` (jsonb) |
| `saved_dates` | Date Night saves. References `date_idea_id` from static `DATE_IDEAS` |
| `quiz_attempts` | Records each answer. `question_id` references static `QUIZ_QUESTIONS` |
| `drawings` | Canvas PNG (base64) + twist + rating |

### RLS pattern
All tables use `my_couple_id()` helper function:
```sql
select couple_id from profiles where id = auth.uid()
```
Policies: `using (couple_id = my_couple_id())` for reads, `with check` for writes.

### Storage
- Bucket: `photos` (private)
- Path: `{couple_id}/{memory_id}.{ext}`
- Access: signed URLs with 1hr expiry via `sbGetPhotoUrl(imgPath)`

### Auth
- Email + password, public sign-ups disabled
- Two accounts: Dhruv + Anjali (Anjali pending)
- Couple linking: first user creates couple, gets `invite_code`; second user pastes code in Settings

---

## 10. Deployment

- **Hosting:** Vercel — `https://between-us-rho.vercel.app/`
- **Repo:** `Dhruv-cs50/Between-Us` on GitHub
- **Auto-deploy:** Every `git push` to `main` triggers Vercel build
- **Root directory:** `Website-Frontend` (set in Vercel project settings)
- **Build:** None — static HTML/JS site

---

## 11. Known Issues & Remaining Work

### Must fix
- [ ] Seed real memories, letters, bucket items into Supabase (currently showing static data)
- [ ] Create Anjali's Supabase account and link via invite code

### To improve
- [ ] Spotify track IDs in `data.jsx` are placeholder guesses — paste real links via Edit Library modal
- [ ] `next_visit` is null — update in Supabase `couples` table when a date is set
- [x] ~~Memory modal is read-only after creation~~ — inline edit + delete wired (2026-05-29). `sbDeleteMemory` added; `MemoryModal` is editable for DB-backed memories
- [ ] Blurred Photo game uses static gradient placeholders — needs real seeded photos

### Future features
- [x] ~~Real-time presence~~ — `App` joins a Realtime Presence channel; TopBar + Sidebar show live "both online" / "{partner} offline" (2026-05-29). Next: extend the same channel to broadcast mood/memory changes so they sync live.
- [ ] Real-time data sync (Supabase `postgres_changes`) — both see mood/memory/letter updates live without refresh
- [ ] "Send I miss you" actually notifies Anjali (push notification / email)
- [ ] Spotify OAuth so music card links automatically
- [x] ~~Anjali writes letters through the UI~~ — `AddLetterModal` wired to `sbAddLetter` (2026-05-29). Remaining: per-account author defaults once Anjali signs in (currently recipient drives author)
- [ ] Mobile PWA — add to home screen with icon
- [ ] Activity feed auto-populated from real interactions (quiz plays, moods, drawings)
