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
.gitignore            ← repo root — ignores .DS_Store, .playwright-mcp/
CLAUDE.md             ← repo root — this project guide
Website-Frontend/
  vercel.json         ← no-cache headers for index.html + src/*.jsx (prevents stale-cache bugs)
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
`app.jsx` passes `{ coupleId, profile, couple, me }` to every page via the `ROUTES` spread pattern. Use `coupleId` for all Supabase queries.

### Per-user identity (`me`)
`app.jsx` computes `me = identityFor({ email: session.user.email, role: profile.role })` (helper in `data.jsx`) and passes it to every page. Detection is by **email** — anything containing "anjali" → Anjali, "dhruv" → Dhruv, else `profile.role`, else Dhruv (partner_a). Robust to gmail vs between.us domains. `me` = `{ key, name, accent, partnerKey, partnerName, partnerAccent }` where accent is `coral` (Dhruv) / `lavender` (Anjali). Use `me` for greeting, accent leads, and authorship defaults. `WELCOME_NOTES[me.key]` (in `data.jsx`) is the private per-person line on Home — edit the text there.

### Supabase helpers (all in `supabase.jsx`, all on `window`)
- Auth: `sbSignIn`, `sbSignOut`, `sbGetSession`, `sbOnAuthChange`
- Couple: `sbGetProfile`, `sbGetCouple`, `sbLinkPartner`, `sbUpdateNextVisit`
- Data: `sbFetchMemories`, `sbAddMemory`, `sbUpdateMemory`, `sbDeleteMemory`, `sbFetchLetters`, `sbAddLetter`, `sbUpdateLetter`, `sbDeleteLetter`, `sbFetchBucketItems`, `sbAddBucketItem`, `sbUpdateBucketStatus`, `sbUpdateBucketItem`, `sbDeleteBucketItem`, `sbFetchLatestMoods`, `sbUpsertMood`, `sbFetchActivity`, `sbLogActivity`, `sbFetchSavedDates`, `sbSaveDate`, `sbRecordQuizAttempt`, `sbSaveDrawing`
- Presence: `sbJoinPresence(coupleId, userId, meta, onChange)`, `sbLeavePresence(channel)` — Realtime Presence channel `presence:{coupleId}`, keyed by user id; powers live "both online" in TopBar/Sidebar
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

**Key gotcha:** Never use curly/smart quotes (`'` `'`) as a JS string delimiter — not inside JSX attribute expressions `{}` *and not in plain JS code* (`useState('')`, `toLocaleDateString('en-US', …)`). Babel rejects them with a SyntaxError that kills the whole script tag. Use straight quotes only. Curly quotes inside JSX text content or already-straight-quoted strings are fine. Validate before commit: `Babel.transform(code, { presets: ['react'] })` over `src/*.jsx`.

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
- ~~**Letters write**~~ — DONE (2026-05-29). `sbAddLetter` helper added; `AddLetterModal` is stateful and saves to Supabase with optimistic prepend. Author derived from recipient, tone from author accent, sealed/open toggle. "Seal until specific date" deferred (no `unlock_date` column).

### Nice to have / future
- ~~Real-time presence~~ — DONE (2026-05-29). Live online status via Realtime Presence. Next: broadcast mood/memory/letter changes over the same channel so data syncs live (`postgres_changes` or channel broadcast).
- Push notifications ("I miss you" button actually notifies Anjali)
- Email reminders for date night
- Spotify OAuth so the music card works without manual link pasting
- Anjali being able to write and seal her own letters through the UI
- ~~Add/edit memories from the memory modal~~ — DONE (2026-05-29). Inline edit + delete in `MemoryModal` for DB-backed memories via `sbUpdateMemory` / `sbDeleteMemory`. Photo re-upload from the edit form still TBD.
- Mobile PWA (add to home screen)

### Resolved this session (2026-05-29 cont.)
- ~~Add/Edit memory form fields invisible on mobile~~: inputs used `bg-cream-100`, identical to the `Modal` sheet bg, so Title/Date/Location/note blended in (iOS rendered the empty `type=date` control borderless → looked like a missing field). Switched all memory-modal inputs to `bg-white ... h-11` (matching Letters/Bucket modals). New DESIGN convention #11: modal fields must be `bg-white`.
- ~~Blurred game's "Add photo memory" was a dead mock~~ (a styled "drop photo here / we'll blur it for you" div with no input/save). Replaced with the real `AddMemoryModal` (now exported to `window` from `memories.jsx`), so it opens the working photo-add flow with the iOS PhotoPicker + Supabase save. `BlurredPhotoGame` now takes `coupleId`.
- **Per-user personalization (`me`)**: app detects Dhruv vs Anjali by email (`identityFor` in `data.jsx`) and threads `me` to every page. Home greeting reorders + underlines the signed-in person's name in their accent (added `.underline-scribble-lavender`); "Send I miss you" button + welcome scribble use `me.accent` (coral/lavender); a private `WELCOME_NOTES[me.key]` line shows under the greeting; mood row tags the signed-in person "(you)"; new-letter recipient defaults to `me.partnerName` so the author defaults to whoever is writing. Anjali's login email for testing: anjalisharma6302@gmail.com.
- ~~Letters/Bucket read-only~~: `LetterModal` and `BucketModal` now support edit + delete for DB-backed rows (`sbDeleteLetter`, `sbUpdateBucketItem`, `sbDeleteBucketItem` added). Letters: pencil on each saved envelope opens straight into edit mode (`startEditing`) — only way to manage a *sealed* letter. Bucket: one modal handles add + edit (state `undefined`/`null`/object); local `upsertItem`/`removeItem` keep the list in sync.
- ~~"Both online" was hardcoded~~: **real-time presence**. `App` joins Supabase Realtime Presence channel `presence:{coupleId}` keyed by auth id; `partnerOnline = presentIds.some(id => id !== myUserId)`. TopBar shows pulsing sage "both online" or grey "{partner} offline" (dot visible on mobile, label `sm+`); Sidebar card mirrors it. Helpers `sbJoinPresence`/`sbLeavePresence`. No DB tables — default Realtime config.
- **Memory photo (re)upload**: `MemoryModal` edit form has a file input; on save uploads via `sbUploadPhoto` → `img_path`. All memory `PhotoBlock`s pass `imgPath` so real photos render.
- **Mobile pass**: form controls render ≥16px on `max-width:640px` (no iOS focus-zoom); `.no-scrollbar` rows get momentum scrolling; presence dot now visible on mobile TopBar.
- **Photo upload on iPhone**: added `PhotoPicker` (ui.jsx) — a tap button that fires a hidden file input via ref + thumbnail preview. Replaced the bare `<input type=file>` in Add-memory and Memory-edit (bare inputs are unusable tap targets on iOS; the button opens the Photo Library / camera sheet).
- ~~Memory modal read-only~~: `MemoryModal` now has inline edit + delete for DB-backed memories. Pencil flips the text column to an edit form (title/date/location/note/tags); Save → `sbUpdateMemory` + in-place mutate; Delete → `window.confirm` → `sbDeleteMemory`. Both call `onChanged` → `reload()`. Added `sbDeleteMemory` helper. `reload` now preserves featured memory by id (or picks newest). Static fallback memories stay read-only (`editable` gated on `memories.length > 0`). All 15 `src/*.jsx` transpile clean; app boots 0 console errors.
- ~~Home page blank / crash~~: 3 curly-quote string delimiters in `home.jsx` `CountdownCard` (`useState(‘’)`, `toLocaleDateString(‘en-US’…)`, `setDateInput(‘’)`) threw a Babel SyntaxError. Replaced with straight quotes. All 15 `src/*.jsx` now transpile clean; app loads with 0 console errors.

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
