# Supabase Integration — Design Spec
**Date:** 2026-05-29
**Project:** Between Us

---

## Overview

Add Supabase as the backend for Between Us. Two authenticated users (Dhruv + Anjali) share a single `couple` record. Personal/live data migrates to Supabase; static content (quiz questions, date ideas, draw twists) stays in `data.jsx`. Photos stored in a private Supabase Storage bucket, accessible via signed URLs.

---

## Approach: Selective Migration

Only data that is personal or changes at runtime moves to Supabase. Static content config never changes and adds no value in a DB.

| Supabase | Stays in `data.jsx` |
|---|---|
| Memories + photos | Quiz questions |
| Letters | Date ideas / categories |
| Bucket list items | Draw twists & ratings |
| Mood check-ins | Blurred photo challenges |
| Activity feed | Soundtrack defaults |
| Saved dates | Letter categories |
| Quiz attempts | Bucket sections |
| Drawings | |

---

## Architecture

### New files
- `src/supabase.jsx` — Supabase client init, auth helpers, all DB/Storage query functions. Exports to `window`.
- `src/auth.jsx` — Login screen, shown when no active session.

### Load order in `index.html`
```
supabase CDN (UMD) → data.jsx → ui.jsx → supabase.jsx → auth.jsx → [pages] → app.jsx
```

### Boot flow
```
App mounts
  → supabase.auth.getSession()
  → no session → render <AuthScreen />
  → session exists → fetch profile row (gets couple_id + role)
  → fetch couple row (gets next_visit, anniversary)
  → render <App coupleId={...} profile={...} couple={...} />
```

### `coupleId` propagation
`App` fetches the couple on boot and passes `coupleId` as a prop to every page in `ROUTES`. Pages never call `auth.uid()` directly.

---

## Auth

### Login screen (`src/auth.jsx`)
- Between Us brand mark (overlapping circles)
- Email + password fields, "Sign in" button
- No public sign-up — accounts created manually in Supabase dashboard
- Matches existing cream/ink design system

### Couple linking (one-time setup, in Settings)
1. Dhruv signs in first → profile row created → `couples` row auto-created → `invite_code` (short UUID) stored on his profile
2. Anjali signs in → Settings → "Link to partner" → pastes Dhruv's invite code → her `couple_id` is set to match
3. Once linked, invite code UI disappears from Settings

### Session persistence
- Supabase JS handles via `localStorage` automatically
- `onAuthStateChange` listener in `app.jsx` re-checks on tab focus

---

## Database Schema

All personal tables include `couple_id uuid references couples(id)`.

```sql
-- Core
couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  next_visit date,
  anniversary date default '2021-03-10'
)

profiles (
  id uuid primary key references auth.users(id),
  couple_id uuid references couples(id),
  name text,                          -- 'Dhruv' | 'Anjali'
  role text,                          -- 'dhruv' | 'anjali'
  invite_code text unique default substring(gen_random_uuid()::text, 1, 8)
)

-- Personal data
memories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  title text,
  date date,
  location text,
  note text,
  song text,
  spotify_id text,
  img_path text,       -- path in storage bucket, null = use bg gradient
  bg text,             -- fallback gradient string
  tags text[],
  created_at timestamptz default now()
)

letters (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  category text,
  author text,
  recipient text,
  body text,
  tone text,
  locked boolean default true,
  written date,
  created_at timestamptz default now()
)

bucket_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  section text,
  title text,
  added_by text,
  status text default 'Dreaming',   -- Dreaming | Planned | Done
  note text,
  created_at timestamptz default now()
)

mood_checkins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  who text,            -- 'dhruv' | 'anjali'
  mood text,
  checked_at timestamptz default now()
)

activity (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  type text,
  who text,
  payload jsonb,
  created_at timestamptz default now()
)

saved_dates (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  date_idea_id text,   -- references static DATE_IDEAS id
  voted_by text[],
  created_at timestamptz default now()
)

quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  question_id text,    -- references static QUIZ_QUESTIONS id
  who text,
  answer int,
  correct boolean,
  created_at timestamptz default now()
)

drawings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id),
  canvas_data text,    -- base64 PNG
  twist text,
  rating text,
  created_at timestamptz default now()
)
```

### Row-Level Security (RLS)
Same pattern on every table — users can only access rows for their couple:

```sql
create policy "couple scope" on memories
  using (
    couple_id = (select couple_id from profiles where id = auth.uid())
  );
```

Enable RLS on all tables. Enable read + write policies (separate `using` / `with check` clauses for writes).

---

## Storage

- **Bucket:** `photos` (private)
- **Path convention:** `{couple_id}/{memory_id}.{ext}`
- **RLS:** authenticated users can read/write only paths prefixed with their `couple_id`
- **Signed URLs:** 1-hour expiry, fetched by `supabase.jsx` helper, cached in component state

### `PhotoBlock` update (`ui.jsx`)
- If `img_path` present → fetch signed URL on mount → render `<img>`
- If only `bg` gradient → existing behavior unchanged
- While URL loading → show gradient placeholder (no flicker)

---

## Data Layer

### `supabase.jsx` exports

```js
// Auth
signIn(email, password)
signOut()
onAuthStateChange(callback)

// Couple
fetchCouple(coupleId)
updateNextVisit(coupleId, date)
linkPartner(inviteCode)   // sets couple_id on current user's profile

// Data reads
fetchMemories(coupleId)
fetchLetters(coupleId)
fetchBucketItems(coupleId)
fetchLatestMoods(coupleId)
fetchActivity(coupleId)
fetchSavedDates(coupleId)
fetchQuizAttempts(coupleId)

// Data writes
upsertMood(coupleId, who, mood)
addMemory(coupleId, data)
updateMemory(id, data)
addLetter(coupleId, data)
updateLetter(id, data)
updateBucketStatus(id, status)
addBucketItem(coupleId, data)
recordQuizAttempt(coupleId, who, questionId, answer, correct)
saveDrawing(coupleId, canvasData, twist, rating)
saveDateIdea(coupleId, dateIdeaId)
logActivity(coupleId, type, who, payload)

// Storage
uploadPhoto(coupleId, memoryId, file)     // returns img_path
getPhotoUrl(img_path)                      // returns signed URL (1hr)
```

### Page fetch pattern
```jsx
const SomePage = ({ coupleId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchSomeData(coupleId).then(d => { setData(d); setLoading(false); });
  }, [coupleId]);
  if (loading) return <PageSkeleton />;
  // render using data
};
```

### `PageSkeleton` (new, in `ui.jsx`)
Pulse-animated cream-colored rounded rects, 3–4 rows, consistent across all pages.

---

## Photo Upload UI

### Entry point: Add Memory modal (`memories.jsx`)
- "Add a memory" button → modal with: title, date, location, note, tag chips, optional file picker
- On submit: `addMemory()` → get `id` → if file: `uploadPhoto()` → `updateMemory({ img_path })`

### Entry point: Supabase dashboard (for seeding)
- Upload files directly to `photos/{couple_id}/` in Supabase Storage UI
- Update memory row `img_path` in Table editor
- Recommended for bulk-seeding existing photos

---

## Settings Page Additions
- Logged-in user name + email
- Invite code section (show/copy) — hidden after couple is linked
- "Link partner account" input — hidden after linked
- Sign out button

---

## Files Changed

| File | Change |
|---|---|
| `index.html` | + Supabase CDN UMD script tag |
| `src/supabase.jsx` | New — client, auth, all fetch/write/storage fns |
| `src/auth.jsx` | New — login screen |
| `src/ui.jsx` | + `PageSkeleton`, update `PhotoBlock` for real images |
| `src/app.jsx` | + session check, `onAuthStateChange`, couple fetch, `coupleId` prop |
| `src/memories.jsx` | Fetch from Supabase, add memory modal, photo upload |
| `src/letters.jsx` | Fetch from Supabase, write letters |
| `src/bucket.jsx` | Fetch + write from Supabase |
| `src/home.jsx` | Mood check-ins + activity from Supabase |
| `src/settings.jsx` | Auth info, invite code, link partner, sign out |
| `src/quiz.jsx` | Record attempts to Supabase |
| `src/drawing.jsx` | Save drawings to Supabase |
| `src/dates.jsx` | Save/load saved dates from Supabase |
| `data.jsx` | Unchanged — static content only |

---

## Out of Scope
- Real-time sync (Supabase subscriptions) — can be added later
- Push notifications
- Email notifications
- Admin panel
- Multi-couple support
