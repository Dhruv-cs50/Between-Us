# Between Us — Project Guide for Claude

## What This Is

Private web app for **Dhruv (SFO) & Anjali (BLR)**. Replaces loneliness of distance with shared daily rituals — mood check-ins, mini-games, letters, memory archive, countdown to next visit.

Opens directly into the app dashboard. No marketing page. No public access.

**Live URL:** https://between-us-rho.vercel.app/

---

## Current Status

**Deployed and working.** Auth-gated, Supabase backend live, Vercel auto-deploys on `git push`.

- Dhruv's account: created and linked to couple
- Anjali's account: pending — create in Supabase dashboard, give her invite code from Settings
- DB: all tables created with RLS. Static fallback data shows until real data is seeded
- Storage: `photos` private bucket live with RLS
- Photos: add via "Add memory" modal on the site, or bulk seed via Supabase dashboard

---

## Tech Stack

- React 18 + Babel standalone (in-browser transpile, **no build step**)
- Tailwind CDN + inline `tailwind.config`
- Supabase JS v2 CDN (UMD build) — auth, DB, storage
- Hash-based routing, no router library
- Vercel for hosting (auto-deploy on push to `main`)

---

## File Structure

```
Website-Frontend/
  index.html          ← Tailwind config, global CSS, script load order
  DESIGN.md           ← Full design spec
  src/
    supabase.jsx      ← Supabase client + all DB/storage helpers (loads 1st)
    data.jsx          ← Static content: quiz questions, date ideas, draw twists, etc.
    ui.jsx            ← Shared primitives + icons I.* + Modal (portal) + PageSkeleton
    music.jsx         ← MusicCard, SpotifyEmbed, TwoClocks
    auth.jsx          ← Login screen (shown when no session)
    home.jsx          ← Home dashboard
    quiz.jsx          ← Relationship Quiz
    drawing.jsx       ← "Future Home, Badly" canvas game
    blurred.jsx       ← "Guess the Blurred Photo" game
    dates.jsx         ← Date Night spinner wheel
    letters.jsx       ← "Open When" letters
    memories.jsx      ← Memories timeline + AddMemoryModal
    bucket.jsx        ← Bucket list
    settings.jsx      ← Settings, sign out, invite code / partner linking
    app.jsx           ← Shell: session boot, sidebar, topbar, mobile nav, routing
```

**Load order in index.html (critical):**
`supabase CDN → supabase.jsx → data.jsx → ui.jsx → music.jsx → home.jsx → quiz.jsx → drawing.jsx → blurred.jsx → dates.jsx → letters.jsx → memories.jsx → bucket.jsx → settings.jsx → auth.jsx → app.jsx`

---

## Critical Architecture Rules

### Cross-file sharing
Each Babel script has its own scope. Export to `window` via `Object.assign(window, { … })` at the bottom. Load order enforced in `index.html`.

### Adding a new page
1. Create `src/<page>.jsx`, export component to `window`
2. Add `<script type="text/babel" src="src/<page>.jsx">` in `index.html` before `auth.jsx`
3. Add to `ROUTES` in `app.jsx` using `Page: (p) => <YourComponent {...p} />` pattern

### Props every page receives
`app.jsx` passes `{ coupleId, profile, couple }` to every page via the `ROUTES` spread pattern. Use `coupleId` for all Supabase queries.

### Supabase helpers (all in `supabase.jsx`, all on `window`)
- Auth: `sbSignIn`, `sbSignOut`, `sbGetSession`, `sbOnAuthChange`
- Couple: `sbGetProfile`, `sbGetCouple`, `sbLinkPartner`, `sbUpdateNextVisit`
- Data: `sbFetchMemories`, `sbAddMemory`, `sbUpdateMemory`, `sbFetchLetters`, `sbUpdateLetter`, `sbFetchBucketItems`, `sbAddBucketItem`, `sbUpdateBucketStatus`, `sbFetchLatestMoods`, `sbUpsertMood`, `sbFetchActivity`, `sbLogActivity`, `sbFetchSavedDates`, `sbSaveDate`, `sbRecordQuizAttempt`, `sbSaveDrawing`
- Storage: `sbUploadPhoto`, `sbGetPhotoUrl`

### Modal — ALWAYS use `ReactDOM.createPortal`
The `Modal` component in `ui.jsx` uses `ReactDOM.createPortal(content, document.body)`. This is non-negotiable. CSS animations (`fade-up`, `page-enter`) leave identity transforms on ancestors, which trap `position: fixed` inside the animated element instead of the viewport. Portal escapes this.

### Hooks order
Never put `useMemo` / `useEffect` / `useState` after a conditional `return`. All hooks must be declared before any early returns. This caused blank pages on Memories and Letters.

### Static vs live data
- **Static in `data.jsx`** (never changes): quiz questions, date ideas, draw twists/ratings, photo challenges, soundtrack defaults, letter categories, bucket sections
- **Live in Supabase**: memories, letters, bucket items, mood check-ins, activity, saved dates, quiz attempts, drawings

---

## Supabase

- **Project URL:** `https://bgjwqqgpfljjgvsydpao.supabase.co`
- **Anon key:** `sb_publishable_q62z0muB7Ztmn51lVEyXNQ_0OfD5FP0`
- **Auth:** Email + password, public sign-ups disabled
- **Storage bucket:** `photos` (private), path `{couple_id}/{memory_id}.{ext}`
- **Couple ID:** `69fad414-6606-4e11-b9dc-4f819bb0388d` (Dhruv's couple)
- **Dhruv's user ID:** `9c2c7506-0286-4bfd-89ac-7d7cc8dc37f5`

---

## Design System (quick ref)

**Colors:**
- Background: `#FAF6EF` (cream-100). Surfaces: white.
- **Dhruv = coral (`#DD7E66`), Anjali = lavender (`#9E8FBE`)** — consistent everywhere
- Sage = calm/"connected". Butter = 4th accent (literals only, no Tailwind token)
- Text: `ink-900/800/700` content, `ink-500/400` muted. Never `#000`

**Typography:**
- Display: `.font-serif-i` (Instrument Serif italic). Always italic
- Body: Geist `font-sans`, 13–15px
- Labels: Geist Mono `font-mono`, uppercase, `tracking-[0.14em]`, 11px, ink-500

**Key gotcha:** Never use curly/smart quotes (`'` `'`) inside JSX attribute expressions `{}` — Babel rejects them. Use straight quotes only. Curly quotes in JSX text content (not attributes) are fine.

---

## Copy Rules

- Personal, first-person-plural. "Our" not "Your". "Us" not "you two"
- Never corporate or SaaS-y
- "Our little place between the miles" — not "Your little place"
- "just ours." — not "private to the two of you"

---

## Routes

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

## What Still Needs Doing

### High priority (needs user action)
- **Seed real data** — memories, letters, bucket items need to be inserted into Supabase (currently showing static fallback data)
- **Add Anjali's account** — create in Supabase dashboard → she signs in → Settings → paste Dhruv's invite code to link
- **Fix Spotify track IDs** — default IDs in `music.jsx` are placeholder guesses. Use Edit Library modal (pencil icon on music card) to paste real Spotify track/playlist links. Saves to localStorage.

### Medium priority
- **Real photos** — add to memories via "Add memory" modal, or bulk upload to `photos/{couple_id}/` bucket in Supabase Storage and update `img_path` on memory rows
- **Blurred Photo game** — still uses static photo challenge data. Could be seeded with real photos
- **Letters write** — AddLetterModal UI exists but is not wired to Supabase. `sbAddLetter` helper not yet written.

### Nice to have / future
- Real-time sync (Supabase subscriptions) so both see each other's mood updates live
- Push notifications ("I miss you" button actually notifies Anjali)
- Email reminders for date night
- Spotify OAuth so the music card works without manual link pasting
- Anjali being able to write and seal her own letters through the UI
- Add/edit memories from the memory modal (currently read-only after creation)
- Mobile PWA (add to home screen)

### Resolved this session (2026-05-29)
- ~~`next_visit` date~~: "Pick a date" button opens inline date picker, calls `sbUpdateNextVisit`. CountdownCard now uses live `couple.next_visit` / `couple.anniversary` from Supabase.
- ~~Activity feed "nothing yet"~~: `transformActivity` maps DB rows (`type/who/payload/created_at`) to `ActivityRow` shape (`kind/who/what/meta/when`). Mood check-ins log to `activity` table via `sbLogActivity`.
- ~~Empty space below "Days together"~~: distance + milestone strip (8,726 mi · always + days to 2k/3k/5k/10k).
- ~~Bucket list add is mock~~: `AddBucketModal` is stateful with controlled inputs, saves via `sbAddBucketItem`.
- ~~favicon.ico 404~~: inline SVG favicon (coral + lavender overlapping circles).
- ~~Mood check-in no UX~~: emoji in chips, loading skeleton, relative timestamps, ✓ save flash.
- ~~Future Home page overflows viewport~~: `height: calc(100vh-260px)` + `overflow:hidden` container, canvas flex-fills height, side panel scrolls internally.

---

## Update Protocol

After every completed task:
1. Update this file if architecture, stack, or structure changed
2. Update `Website-Frontend/DESIGN.md` if design system or page behavior changed
3. Append to decisions log in Claude memory (`decisions_between_us.md`)
