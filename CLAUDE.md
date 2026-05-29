# Between Us — Project Guide for Claude

## What This Is

Private web app for a long-distance couple: **Dhruv (SFO) & Anjali (BLR)**. Replaces loneliness of distance with shared daily rituals — mood check-ins, mini-games, letters, memory archive, countdown to next visit.

**Not** a marketing site. Opens directly into the app dashboard.

---

## Tech Stack

- React 18 + Babel standalone (transpiled in-browser, **no build step**)
- Tailwind via CDN (`cdn.tailwindcss.com`) + inline `tailwind.config`
- Fonts: Instrument Serif (display, always italic), Geist (body), Geist Mono (labels/numbers)
- Hash-based routing (`window.location.hash`), no router library
- No backend yet — all data in `src/data.jsx` as mock data, shaped for future Supabase

---

## File Structure

```
Website-Frontend/
  index.html          ← Tailwind config, global CSS, font + script loads
  DESIGN.md           ← Full design spec (design system, conventions, data model)
  src/
    data.jsx          ← All mock data (couple, quiz, dates, letters, memories, bucket…)
    ui.jsx            ← Shared primitives + icon set I.* (exported to window)
    music.jsx         ← MusicCard / SoundtrackCard
    home.jsx          ← Home dashboard
    quiz.jsx          ← Relationship Quiz
    drawing.jsx       ← "Future Home, Badly" canvas game
    blurred.jsx       ← "Guess the Blurred Photo" game
    dates.jsx         ← Date Night spinner wheel
    letters.jsx       ← "Open When" letters
    memories.jsx      ← Memories timeline
    bucket.jsx        ← Bucket list
    settings.jsx      ← Couple settings
    app.jsx           ← Shell (sidebar, topbar, mobile nav, routing) — loads LAST
```

---

## Critical Architecture Rules

### Cross-file sharing
Each Babel script has its own scope. Shared components/data are published via `Object.assign(window, { … })` at the bottom of each file. **Load order matters** — `data.jsx` and `ui.jsx` load first; `app.jsx` loads last.

### Adding a new page
1. Create `src/<page>.jsx`
2. Export component to `window` at bottom
3. Add `<script type="text/babel" src="src/<page>.jsx">` in `index.html` **before** `app.jsx`
4. Add entry to `ROUTES` array in `app.jsx`

### State persistence
User-set state (moods, spotify links, saved dates) → `localStorage`, rehydrated on load.

---

## Design System (quick ref)

**Colors:**
- Background: `#FAF6EF` (cream-100). Surfaces: white.
- Text: `ink-900/800/700` for content, `ink-500/400` for muted. Never `#000`.
- **Dhruv = coral (`#DD7E66`), Anjali = lavender (`#9E8FBE`)**. Keep consistent.
- Sage = calm / "connected" state. Butter = 4th accent (use literals, not Tailwind token).

**Typography:**
- Display/headings: `.font-serif-i` (Instrument Serif italic). Always italic.
- Body/UI: Geist (`font-sans`), 13–15px.
- Labels/dates/numbers: Geist Mono (`font-mono`), uppercase, `tracking-[0.14em]`, 11px, ink-500.

**Shared components (all in `ui.jsx`, on `window`):**
`Surface`, `Panel`, `SectionHeader`, `Button`, `Chip`, `Avatar`, `PairAvatar`, `Stat`, `CountUp`, `PhotoBlock`, `Hair`, `LiveDot`, `Modal`, `SoundtrackCard`, `I.*` icons.

Do **not** hand-roll new buttons/chips — reuse these.

**Photos:** Gradient `PhotoBlock`s only — no real images yet. Every photo-bearing record carries a `bg` gradient string.

---

## Tone & Content Rules

- Personal, playful, inside-jokey. Never corporate.
- Humor: dry, affectionate ("zoning violation, but cute").
- Music: reference titles/artists only — **never reproduce lyrics**.
- Cultural texture: SFO↔BLR, dosa, monsoon, etc. — authentic, not stereotyped.
- No filler. Fewer, warmer elements over dense dashboards.

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

## Key Data Constants

- `COUPLE.anniversary` = `2021-03-10`
- `COUPLE.next_visit` = `null` (shows "soon 😉" placeholder until set)
- `COUPLE.cities` = SFO / BLR
- Dhruv = partner_a (coral), Anjali = partner_b (lavender)

---

## Decisions Log

See `MEMORY.md` (project memory) and `Website-Frontend/DESIGN.md` (full design spec).

---

## Update Protocol

When any task is completed, update:
1. This file (`CLAUDE.md`) if architecture or structure changed
2. `Website-Frontend/DESIGN.md` if design system or pages changed
3. Project memory (`MEMORY.md` in Claude memory dir) with decisions made
