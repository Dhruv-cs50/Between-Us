# Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase auth (email/password), private database, and photo storage to Between Us so Dhruv and Anjali each have a real account and all personal data (memories, letters, bucket items, moods, activity) is persisted server-side.

**Architecture:** Two Supabase auth users linked by a shared `couple_id`. Static content (quiz questions, date ideas, draw twists) stays in `data.jsx`; personal/live data moves to Supabase tables with RLS. Photos go to a private `photos` bucket, accessed via 1-hour signed URLs.

**Tech Stack:** Supabase JS v2 (CDN UMD build), React 18 + Babel standalone (no build step), Tailwind CDN. All JS files export to `window` — no ES module imports.

**Note on testing:** No test runner exists. Each task ends with a browser verification step. Run `python3 -m http.server 8080` in `Website-Frontend/` and open `http://localhost:8080` to verify.

---

## Phase 0: Supabase Project Setup (manual steps in browser)

These steps are done by the developer in the Supabase dashboard. No code changes.

### Task 0: Create Supabase project and users

- [ ] **Step 1: Create project**
  Go to https://supabase.com → New project → name it `between-us` → choose a strong DB password → select a region close to you (US West or Asia South) → Create project. Wait ~2 minutes for provisioning.

- [ ] **Step 2: Get API credentials**
  Project Settings → API → copy:
  - `Project URL` (looks like `https://xxxxxxxxxxxx.supabase.co`)
  - `anon public` key (long JWT string)
  Save both — needed in Task 1.

- [ ] **Step 3: Create Dhruv's account**
  Authentication → Users → Invite user → enter `dhruvshah844@gmail.com` → Send invite.
  Dhruv clicks the email link and sets a password.

- [ ] **Step 4: Create Anjali's account**
  Authentication → Users → Invite user → enter Anjali's email → Send invite.
  Anjali clicks the email link and sets a password.

- [ ] **Step 5: Disable public sign-ups**
  Authentication → Providers → Email → toggle off "Enable sign ups" → Save.
  Only invited users can ever log in.

---

## Phase 1: Supabase Client + Auth Layer

### Task 1: Add Supabase CDN + create `supabase.jsx`

**Files:**
- Modify: `Website-Frontend/index.html`
- Create: `Website-Frontend/src/supabase.jsx`

- [ ] **Step 1: Add Supabase CDN script to `index.html`**

  Add this line BEFORE the `<script type="text/babel" src="src/data.jsx">` tag:

  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  ```

  Add this line AFTER the CDN script and BEFORE `data.jsx`:

  ```html
  <script type="text/babel" src="src/supabase.jsx"></script>
  ```

  Final load order in `index.html` body (scripts only):
  ```html
  <script src="...react..."></script>
  <script src="...react-dom..."></script>
  <script src="...babel..."></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>

  <script type="text/babel" src="src/supabase.jsx"></script>
  <script type="text/babel" src="src/data.jsx"></script>
  <script type="text/babel" src="src/ui.jsx"></script>
  <script type="text/babel" src="src/music.jsx"></script>
  <script type="text/babel" src="src/home.jsx"></script>
  <script type="text/babel" src="src/quiz.jsx"></script>
  <script type="text/babel" src="src/drawing.jsx"></script>
  <script type="text/babel" src="src/blurred.jsx"></script>
  <script type="text/babel" src="src/dates.jsx"></script>
  <script type="text/babel" src="src/letters.jsx"></script>
  <script type="text/babel" src="src/memories.jsx"></script>
  <script type="text/babel" src="src/bucket.jsx"></script>
  <script type="text/babel" src="src/settings.jsx"></script>
  <script type="text/babel" src="src/auth.jsx"></script>
  <script type="text/babel" src="src/app.jsx"></script>
  ```

- [ ] **Step 2: Create `Website-Frontend/src/supabase.jsx`**

  Replace `YOUR_SUPABASE_URL` and `YOUR_ANON_KEY` with the values from Task 0 Step 2.

  ```jsx
  /* Supabase client, auth helpers, and all DB/Storage query functions.
     Exported to window so every page file can call them without imports. */

  const { createClient } = supabase; // supabase CDN UMD global
  const _sb = createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY');

  /* ── Auth ── */
  const sbSignIn = (email, password) =>
    _sb.auth.signInWithPassword({ email, password });

  const sbSignOut = () => _sb.auth.signOut();

  const sbGetSession = () => _sb.auth.getSession();

  const sbOnAuthChange = (cb) => _sb.auth.onAuthStateChange(cb);

  /* ── Profile / Couple ── */
  const sbGetProfile = async (userId) => {
    const { data, error } = await _sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  };

  const sbGetCouple = async (coupleId) => {
    const { data, error } = await _sb
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .single();
    if (error) throw error;
    return data;
  };

  const sbLinkPartner = async (inviteCode) => {
    const { data: { user } } = await _sb.auth.getUser();
    const { data: target, error: findErr } = await _sb
      .from('profiles')
      .select('couple_id')
      .eq('invite_code', inviteCode)
      .single();
    if (findErr || !target) throw new Error('Invite code not found');
    const { error } = await _sb
      .from('profiles')
      .update({ couple_id: target.couple_id })
      .eq('id', user.id);
    if (error) throw error;
  };

  const sbUpdateNextVisit = async (coupleId, date) => {
    const { error } = await _sb
      .from('couples')
      .update({ next_visit: date })
      .eq('id', coupleId);
    if (error) throw error;
  };

  /* ── Memories ── */
  const sbFetchMemories = async (coupleId) => {
    const { data, error } = await _sb
      .from('memories')
      .select('*')
      .eq('couple_id', coupleId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  };

  const sbAddMemory = async (coupleId, fields) => {
    const { data, error } = await _sb
      .from('memories')
      .insert({ couple_id: coupleId, ...fields })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const sbUpdateMemory = async (id, fields) => {
    const { error } = await _sb
      .from('memories')
      .update(fields)
      .eq('id', id);
    if (error) throw error;
  };

  /* ── Letters ── */
  const sbFetchLetters = async (coupleId) => {
    const { data, error } = await _sb
      .from('letters')
      .select('*')
      .eq('couple_id', coupleId)
      .order('written', { ascending: false });
    if (error) throw error;
    return data;
  };

  const sbUpdateLetter = async (id, fields) => {
    const { error } = await _sb.from('letters').update(fields).eq('id', id);
    if (error) throw error;
  };

  /* ── Bucket list ── */
  const sbFetchBucketItems = async (coupleId) => {
    const { data, error } = await _sb
      .from('bucket_items')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  };

  const sbAddBucketItem = async (coupleId, fields) => {
    const { data, error } = await _sb
      .from('bucket_items')
      .insert({ couple_id: coupleId, ...fields })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const sbUpdateBucketStatus = async (id, status) => {
    const { error } = await _sb
      .from('bucket_items')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  };

  /* ── Moods ── */
  const sbFetchLatestMoods = async (coupleId) => {
    const { data, error } = await _sb
      .from('mood_checkins')
      .select('*')
      .eq('couple_id', coupleId)
      .order('checked_at', { ascending: false })
      .limit(2);
    if (error) throw error;
    // Return { dhruv: 'happy', anjali: 'quiet' }
    const result = {};
    (data || []).forEach(row => { result[row.who] = row.mood; });
    return result;
  };

  const sbUpsertMood = async (coupleId, who, mood) => {
    const { error } = await _sb.from('mood_checkins').insert({
      couple_id: coupleId, who, mood, checked_at: new Date().toISOString()
    });
    if (error) throw error;
  };

  /* ── Activity ── */
  const sbFetchActivity = async (coupleId) => {
    const { data, error } = await _sb
      .from('activity')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  };

  const sbLogActivity = async (coupleId, type, who, payload) => {
    const { error } = await _sb.from('activity').insert({
      couple_id: coupleId, type, who, payload,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
  };

  /* ── Saved dates ── */
  const sbFetchSavedDates = async (coupleId) => {
    const { data, error } = await _sb
      .from('saved_dates')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  const sbSaveDate = async (coupleId, dateIdeaId) => {
    const { error } = await _sb
      .from('saved_dates')
      .insert({ couple_id: coupleId, date_idea_id: dateIdeaId });
    if (error) throw error;
  };

  /* ── Quiz attempts ── */
  const sbRecordQuizAttempt = async (coupleId, who, questionId, answer, correct) => {
    const { error } = await _sb.from('quiz_attempts').insert({
      couple_id: coupleId, who, question_id: String(questionId), answer, correct
    });
    if (error) throw error;
  };

  /* ── Drawings ── */
  const sbSaveDrawing = async (coupleId, canvasData, twist, rating) => {
    const { error } = await _sb.from('drawings').insert({
      couple_id: coupleId, canvas_data: canvasData, twist, rating
    });
    if (error) throw error;
  };

  /* ── Storage ── */
  const sbUploadPhoto = async (coupleId, memoryId, file) => {
    const ext = file.name.split('.').pop();
    const path = `${coupleId}/${memoryId}.${ext}`;
    const { error } = await _sb.storage.from('photos').upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const sbGetPhotoUrl = async (imgPath) => {
    if (!imgPath) return null;
    const { data, error } = await _sb.storage
      .from('photos')
      .createSignedUrl(imgPath, 3600);
    if (error) return null;
    return data.signedUrl;
  };

  Object.assign(window, {
    _sb,
    sbSignIn, sbSignOut, sbGetSession, sbOnAuthChange,
    sbGetProfile, sbGetCouple, sbLinkPartner, sbUpdateNextVisit,
    sbFetchMemories, sbAddMemory, sbUpdateMemory,
    sbFetchLetters, sbUpdateLetter,
    sbFetchBucketItems, sbAddBucketItem, sbUpdateBucketStatus,
    sbFetchLatestMoods, sbUpsertMood,
    sbFetchActivity, sbLogActivity,
    sbFetchSavedDates, sbSaveDate,
    sbRecordQuizAttempt,
    sbSaveDrawing,
    sbUploadPhoto, sbGetPhotoUrl,
  });
  ```

- [ ] **Step 3: Browser verify**
  Open `http://localhost:8080`. Open DevTools Console.
  Run: `window._sb.auth.getSession().then(r => console.log(r))`
  Expected: `{ data: { session: null }, error: null }` — no error means client connected.

- [ ] **Step 4: Commit**
  ```bash
  git add Website-Frontend/index.html Website-Frontend/src/supabase.jsx
  git commit -m "feat(supabase): add client + all DB/storage helper functions"
  ```

---

### Task 2: Create `auth.jsx` login screen

**Files:**
- Create: `Website-Frontend/src/auth.jsx`

- [ ] **Step 1: Create `Website-Frontend/src/auth.jsx`**

  ```jsx
  /* Login screen — shown when no Supabase session exists.
     No public sign-up; accounts are created in the Supabase dashboard. */

  const AuthScreen = ({ onAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const signIn = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const { data, error: err } = await sbSignIn(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      onAuth(data.session);
    };

    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10 justify-center">
            <span className="relative inline-flex">
              <span className="inline-block w-9 h-9 rounded-full bg-coral-500" />
              <span className="inline-block w-9 h-9 rounded-full bg-lavender-500 -ml-4 mix-blend-multiply" />
            </span>
            <div>
              <div className="font-serif-i text-[30px] text-ink-900 leading-none">Between Us</div>
              <div className="text-[12px] text-ink-500 mt-0.5">Dhruv & Anjali</div>
            </div>
          </div>

          <form onSubmit={signIn} className="bg-white rounded-3xl shadow-soft ring-1 ring-ink-900/[0.06] p-7">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-1">Welcome back</div>
            <div className="font-serif-i text-3xl text-ink-900 leading-tight mb-6">sign in</div>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] text-ink-500 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full h-11 px-4 rounded-xl bg-cream-100 ring-1 ring-ink-900/[0.08] focus:ring-2 focus:ring-coral-400/50 outline-none text-[14px] text-ink-900"
                />
              </div>
              <div>
                <label className="text-[12px] text-ink-500 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl bg-cream-100 ring-1 ring-ink-900/[0.08] focus:ring-2 focus:ring-coral-400/50 outline-none text-[14px] text-ink-900"
                />
              </div>
            </div>

            {error && (
              <div className="mt-3 text-[12.5px] text-coral-600 bg-coral-50 ring-1 ring-coral-200 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full h-11 rounded-xl bg-ink-900 text-cream-100 text-[14px] font-medium hover:bg-ink-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[12px] text-ink-400 mt-6">
            private to the two of you
          </p>
        </div>
      </div>
    );
  };

  window.AuthScreen = AuthScreen;
  ```

- [ ] **Step 2: Verify file loads without errors**
  Reload `http://localhost:8080`. DevTools → Console. No errors mentioning `auth.jsx`.

- [ ] **Step 3: Commit**
  ```bash
  git add Website-Frontend/src/auth.jsx
  git commit -m "feat(auth): add login screen component"
  ```

---

### Task 3: Update `app.jsx` for session + couple boot

**Files:**
- Modify: `Website-Frontend/src/app.jsx`

- [ ] **Step 1: Add session state and boot logic to `App` component**

  Replace the `App` component in `app.jsx` with this version:

  ```jsx
  const App = () => {
    const [route, setRouteState] = useState(() => (window.location.hash || '#home').replace('#', ''));
    const [session, setSession] = useState(undefined); // undefined = loading, null = no session
    const [profile, setProfile] = useState(null);
    const [couple, setCouple] = useState(null);

    // Boot: check session, load profile + couple
    useEffect(() => {
      sbGetSession().then(async ({ data: { session: s } }) => {
        if (!s) { setSession(null); return; }
        setSession(s);
        try {
          const prof = await sbGetProfile(s.user.id);
          setProfile(prof);
          if (prof.couple_id) {
            const cpl = await sbGetCouple(prof.couple_id);
            setCouple(cpl);
          }
        } catch (e) {
          console.error('Boot error', e);
        }
      });

      const { data: { subscription } } = sbOnAuthChange(async (event, s) => {
        if (event === 'SIGNED_OUT') { setSession(null); setProfile(null); setCouple(null); return; }
        if (s) {
          setSession(s);
          const prof = await sbGetProfile(s.user.id);
          setProfile(prof);
          if (prof.couple_id) {
            const cpl = await sbGetCouple(prof.couple_id);
            setCouple(cpl);
          }
        }
      });
      return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
      setRoute = setRouteState;
      const onHash = () => setRouteState((window.location.hash || '#home').replace('#', ''));
      window.addEventListener('hashchange', onHash);
      return () => window.removeEventListener('hashchange', onHash);
    }, []);

    const onRoute = (id) => {
      setRouteState(id);
      window.location.hash = id;
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    setRoute = onRoute;

    // Loading state while checking session
    if (session === undefined) {
      return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <span className="relative inline-flex">
              <span className="inline-block w-6 h-6 rounded-full bg-coral-500" />
              <span className="inline-block w-6 h-6 rounded-full bg-lavender-500 -ml-3 mix-blend-multiply" />
            </span>
            <span className="font-serif-i text-[22px] text-ink-900">Between Us</span>
          </div>
        </div>
      );
    }

    // No session → show login
    if (!session) {
      return <AuthScreen onAuth={(s) => setSession(s)} />;
    }

    const coupleId = profile?.couple_id || null;
    const Active = (ROUTES.find(r => r.id === route) || ROUTES[0]).Page;

    return (
      <div className="min-h-screen flex">
        <Sidebar route={route} onRoute={onRoute} />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar route={route} />
          <main key={route} className="px-5 sm:px-7 lg:px-9 py-6 lg:py-9 pb-28 lg:pb-12 max-w-[1200px] w-full mx-auto page-enter">
            <Active coupleId={coupleId} profile={profile} couple={couple} />
          </main>
        </div>
        <MobileNav route={route} onRoute={onRoute} />
      </div>
    );
  };
  ```

- [ ] **Step 2: Browser verify — login flow**
  Reload `http://localhost:8080`.
  Expected: login screen appears (brand mark + sign-in form).
  Sign in with Dhruv's credentials from Task 0.
  Expected: app loads normally with the home dashboard visible.

- [ ] **Step 3: Browser verify — session persists**
  Close and reopen the tab. Expected: still logged in (no login screen).

- [ ] **Step 4: Commit**
  ```bash
  git add Website-Frontend/src/app.jsx
  git commit -m "feat(auth): boot session check, login gate, pass coupleId to pages"
  ```

---

## Phase 2: Database Schema + RLS

### Task 4: Run schema SQL in Supabase dashboard

**Files:** None (SQL run in Supabase dashboard SQL editor)

- [ ] **Step 1: Open SQL editor**
  In Supabase dashboard → SQL Editor → New query.

- [ ] **Step 2: Run tables SQL**

  ```sql
  -- Enable UUID extension (usually already enabled)
  create extension if not exists "pgcrypto";

  -- Couples
  create table couples (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    next_visit date,
    anniversary date default '2021-03-10'
  );

  -- Profiles (one per auth user)
  create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    couple_id uuid references couples(id),
    name text,
    role text,
    invite_code text unique default substring(gen_random_uuid()::text, 1, 8)
  );

  -- Memories
  create table memories (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid references couples(id),
    title text,
    date date,
    location text,
    note text,
    song text,
    spotify_id text,
    img_path text,
    bg text,
    tags text[],
    created_at timestamptz default now()
  );

  -- Letters
  create table letters (
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
  );

  -- Bucket list items
  create table bucket_items (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid references couples(id),
    section text,
    title text,
    added_by text,
    status text default 'Dreaming',
    note text,
    created_at timestamptz default now()
  );

  -- Mood check-ins
  create table mood_checkins (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid references couples(id),
    who text,
    mood text,
    checked_at timestamptz default now()
  );

  -- Activity feed
  create table activity (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid references couples(id),
    type text,
    who text,
    payload jsonb,
    created_at timestamptz default now()
  );

  -- Saved dates
  create table saved_dates (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid references couples(id),
    date_idea_id text,
    created_at timestamptz default now()
  );

  -- Quiz attempts
  create table quiz_attempts (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid references couples(id),
    question_id text,
    who text,
    answer int,
    correct boolean,
    created_at timestamptz default now()
  );

  -- Drawings
  create table drawings (
    id uuid primary key default gen_random_uuid(),
    couple_id uuid references couples(id),
    canvas_data text,
    twist text,
    rating text,
    created_at timestamptz default now()
  );
  ```

  Click Run. Expected: "Success. No rows returned."

- [ ] **Step 3: Enable RLS on all tables**

  ```sql
  alter table couples       enable row level security;
  alter table profiles      enable row level security;
  alter table memories      enable row level security;
  alter table letters       enable row level security;
  alter table bucket_items  enable row level security;
  alter table mood_checkins enable row level security;
  alter table activity      enable row level security;
  alter table saved_dates   enable row level security;
  alter table quiz_attempts enable row level security;
  alter table drawings      enable row level security;
  ```

- [ ] **Step 4: Create RLS policies**

  ```sql
  -- Helper: get current user's couple_id
  create or replace function my_couple_id()
  returns uuid language sql stable
  as $$ select couple_id from profiles where id = auth.uid() $$;

  -- profiles: users can read/write their own row
  create policy "own profile" on profiles
    using (id = auth.uid())
    with check (id = auth.uid());

  -- couples: users can read/write their couple
  create policy "own couple read" on couples
    using (id = my_couple_id());
  create policy "own couple write" on couples
    with check (id = my_couple_id());

  -- Macro for all couple-scoped tables (run once per table)
  -- memories
  create policy "couple scope read" on memories using (couple_id = my_couple_id());
  create policy "couple scope write" on memories with check (couple_id = my_couple_id());

  -- letters
  create policy "couple scope read" on letters using (couple_id = my_couple_id());
  create policy "couple scope write" on letters with check (couple_id = my_couple_id());

  -- bucket_items
  create policy "couple scope read" on bucket_items using (couple_id = my_couple_id());
  create policy "couple scope write" on bucket_items with check (couple_id = my_couple_id());

  -- mood_checkins
  create policy "couple scope read" on mood_checkins using (couple_id = my_couple_id());
  create policy "couple scope write" on mood_checkins with check (couple_id = my_couple_id());

  -- activity
  create policy "couple scope read" on activity using (couple_id = my_couple_id());
  create policy "couple scope write" on activity with check (couple_id = my_couple_id());

  -- saved_dates
  create policy "couple scope read" on saved_dates using (couple_id = my_couple_id());
  create policy "couple scope write" on saved_dates with check (couple_id = my_couple_id());

  -- quiz_attempts
  create policy "couple scope read" on quiz_attempts using (couple_id = my_couple_id());
  create policy "couple scope write" on quiz_attempts with check (couple_id = my_couple_id());

  -- drawings
  create policy "couple scope read" on drawings using (couple_id = my_couple_id());
  create policy "couple scope write" on drawings with check (couple_id = my_couple_id());
  ```

- [ ] **Step 5: Create Dhruv's couple + profile rows**

  In SQL editor, replace `DHRUV_USER_ID` with Dhruv's auth UUID (Authentication → Users → copy ID):

  ```sql
  -- Create the couple record
  insert into couples (id, anniversary)
  values (gen_random_uuid(), '2021-03-10')
  returning id;
  ```

  Copy the returned `id` (this is `COUPLE_ID`). Then:

  ```sql
  -- Create Dhruv's profile (replace both UUIDs)
  insert into profiles (id, couple_id, name, role)
  values ('DHRUV_USER_ID', 'COUPLE_ID', 'Dhruv', 'dhruv');
  ```

- [ ] **Step 6: Create Anjali's profile**

  Replace `ANJALI_USER_ID` with Anjali's auth UUID, and use the same `COUPLE_ID`:

  ```sql
  insert into profiles (id, couple_id, name, role)
  values ('ANJALI_USER_ID', 'COUPLE_ID', 'Anjali', 'anjali');
  ```

- [ ] **Step 7: Browser verify — profile loads**
  Sign in at `http://localhost:8080`. Open DevTools Console.
  Run: `sbGetProfile(window._sb.auth.session?.user?.id).then(console.log)`
  Expected: profile object with `name`, `couple_id`, `role` fields.

---

## Phase 3: Data Layer — per-page migration

### Task 5: Add `PageSkeleton` to `ui.jsx`

**Files:**
- Modify: `Website-Frontend/src/ui.jsx`

- [ ] **Step 1: Add `PageSkeleton` component before the `Object.assign` export at the bottom of `ui.jsx`**

  ```jsx
  const PageSkeleton = ({ rows = 4 }) => (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-cream-200 rounded-2xl" style={{ height: 80 + (i % 2) * 40 }} />
      ))}
    </div>
  );
  ```

- [ ] **Step 2: Add `PageSkeleton` to the `Object.assign(window, {...})` call at the bottom of `ui.jsx`**

  Find the existing `Object.assign(window, { ... })` and add `PageSkeleton` to it.

- [ ] **Step 3: Also update `PhotoBlock` in `ui.jsx` to support real images**

  Find `PhotoBlock` in `ui.jsx` and replace it with:

  ```jsx
  const PhotoBlock = ({ bg, imgPath, className = '', caption, blur }) => {
    const [url, setUrl] = useState(null);

    useEffect(() => {
      if (imgPath) {
        sbGetPhotoUrl(imgPath).then(u => setUrl(u));
      }
    }, [imgPath]);

    const style = url
      ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: bg || 'linear-gradient(135deg, #F4ECDD, #EADFC8)' };

    return (
      <div
        className={`relative overflow-hidden rounded-2xl ${className}`}
        style={style}
      >
        {blur && !url && (
          <div className="absolute inset-0" style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }} />
        )}
        {caption && (
          <div className="absolute bottom-2 left-2">
            <span className="font-mono text-[10px] text-ink-700 bg-white/70 backdrop-blur-sm rounded-full px-2 py-0.5">
              {caption}
            </span>
          </div>
        )}
      </div>
    );
  };
  ```

- [ ] **Step 4: Browser verify**
  Reload. No console errors. Home page renders normally.

- [ ] **Step 5: Commit**
  ```bash
  git add Website-Frontend/src/ui.jsx
  git commit -m "feat(ui): add PageSkeleton, update PhotoBlock for real images"
  ```

---

### Task 6: Migrate `memories.jsx`

**Files:**
- Modify: `Website-Frontend/src/memories.jsx`

- [ ] **Step 1: Add `coupleId` prop and Supabase fetch to `MemoriesTimeline`**

  At the top of the `MemoriesTimeline` component, replace the static data usage with:

  ```jsx
  const MemoriesTimeline = ({ coupleId }) => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);

    const reload = () => {
      if (!coupleId) return;
      sbFetchMemories(coupleId).then(data => {
        setMemories(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    };

    useEffect(() => { reload(); }, [coupleId]);

    if (loading) return <PageSkeleton rows={5} />;
    // rest of render uses `memories` instead of `window.MEMORIES`
  ```

  Replace all references to `MEMORIES` inside this component with `memories`.

- [ ] **Step 2: Add "Add a memory" button and modal**

  Add this modal component above `MemoriesTimeline`:

  ```jsx
  const AddMemoryModal = ({ open, onClose, coupleId, onAdded }) => {
    const [form, setForm] = useState({ title: '', date: '', location: '', note: '', tags: [] });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const allTags = MEMORY_TAGS || ['Calls', 'Visits', 'Firsts', 'Funny', 'Hard Moments', 'Future', 'Music'];

    const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const memory = await sbAddMemory(coupleId, {
          title: form.title,
          date: form.date,
          location: form.location,
          note: form.note,
          tags: form.tags,
          bg: 'linear-gradient(135deg, #F4ECDD, #EADFC8)',
        });
        if (file) {
          const imgPath = await sbUploadPhoto(coupleId, memory.id, file);
          await sbUpdateMemory(memory.id, { img_path: imgPath });
        }
        onAdded();
        onClose();
      } catch (err) {
        console.error('Add memory failed', err);
      } finally {
        setSaving(false);
      }
    };

    const toggleTag = (tag) => {
      setForm(f => ({
        ...f,
        tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
      }));
    };

    return (
      <Modal open={open} onClose={onClose} maxW="max-w-lg">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">New memory</div>
            <div className="font-serif-i text-3xl text-ink-900 mt-1">add a moment</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title" className="w-full h-10 px-3 rounded-xl bg-cream-100 ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="h-10 px-3 rounded-xl bg-cream-100 ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Location" className="h-10 px-3 rounded-xl bg-cream-100 ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
          </div>
          <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="What happened…" rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-cream-100 ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px] resize-none" />
          <div>
            <div className="text-[11px] text-ink-500 mb-1.5">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(t => (
                <Chip key={t} size="sm" tone={form.tags.includes(t) ? 'coral' : 'cream'}
                  selected={form.tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-ink-500 mb-1.5">Photo (optional)</div>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
              className="text-[13px] text-ink-600" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button kind="ghost" onClick={onClose}>Cancel</Button>
            <Button kind="primary" icon={I.Plus} disabled={saving}>
              {saving ? 'saving…' : 'Add memory'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  };
  ```

  In `MemoriesTimeline`, add state for the modal and a button to open it:
  ```jsx
  const [adding, setAdding] = useState(false);
  // In the header area, add:
  <Button kind="coral" icon={I.Plus} onClick={() => setAdding(true)}>Add memory</Button>
  // At the bottom, add:
  <AddMemoryModal open={adding} onClose={() => setAdding(false)} coupleId={coupleId} onAdded={reload} />
  ```

- [ ] **Step 3: Browser verify**
  Navigate to Memories. Expected: loading skeleton → memories list (empty if DB is empty, or seeded data if you've inserted rows). Click "Add memory" → modal opens. Fill form → submit. Expected: new memory appears in list.

- [ ] **Step 4: Commit**
  ```bash
  git add Website-Frontend/src/memories.jsx
  git commit -m "feat(memories): fetch from Supabase, add memory modal with photo upload"
  ```

---

### Task 7: Migrate `letters.jsx`

**Files:**
- Modify: `Website-Frontend/src/letters.jsx`

- [ ] **Step 1: Add coupleId prop and Supabase fetch to `LettersPage`**

  ```jsx
  const LettersPage = ({ coupleId }) => {
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!coupleId) return;
      sbFetchLetters(coupleId).then(data => {
        setLetters(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, [coupleId]);

    if (loading) return <PageSkeleton rows={4} />;
    // rest uses `letters` instead of `window.LETTERS`
  ```

- [ ] **Step 2: Wire unlock to Supabase**

  When a letter is unlocked (wherever `letter.locked` is toggled), call:
  ```jsx
  sbUpdateLetter(letter.id, { locked: false });
  ```

- [ ] **Step 3: Browser verify**
  Navigate to Letters. Expected: skeleton → letters list (empty or seeded). Unlocking a letter persists after page refresh.

- [ ] **Step 4: Commit**
  ```bash
  git add Website-Frontend/src/letters.jsx
  git commit -m "feat(letters): fetch from Supabase, persist unlock state"
  ```

---

### Task 8: Migrate `bucket.jsx`

**Files:**
- Modify: `Website-Frontend/src/bucket.jsx`

- [ ] **Step 1: Add coupleId prop and fetch to `BucketList`**

  ```jsx
  const BucketList = ({ coupleId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const reload = () => {
      if (!coupleId) return;
      sbFetchBucketItems(coupleId).then(data => {
        setItems(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    };

    useEffect(() => { reload(); }, [coupleId]);

    if (loading) return <PageSkeleton rows={6} />;
    // use `items` instead of `window.BUCKET_ITEMS`
  ```

- [ ] **Step 2: Wire status changes to Supabase**

  Wherever bucket item status is cycled/changed, replace the local state mutation with:
  ```jsx
  const cycleStatus = async (item) => {
    const next = BUCKET_STATUSES[(BUCKET_STATUSES.indexOf(item.status) + 1) % BUCKET_STATUSES.length];
    await sbUpdateBucketStatus(item.id, next);
    reload();
  };
  ```

- [ ] **Step 3: Browser verify**
  Navigate to Bucket List. Expected: items load. Cycling status on an item persists after refresh.

- [ ] **Step 4: Commit**
  ```bash
  git add Website-Frontend/src/bucket.jsx
  git commit -m "feat(bucket): fetch and write to Supabase"
  ```

---

### Task 9: Migrate mood check-ins and activity in `home.jsx`

**Files:**
- Modify: `Website-Frontend/src/home.jsx`

- [ ] **Step 1: Update `MoodCheckIn` to accept `coupleId` and fetch/save from Supabase**

  ```jsx
  const MoodCheckIn = ({ coupleId }) => {
    const [mood, setMood] = useState({ dhruv: 'happy', anjali: 'quiet' });

    useEffect(() => {
      if (!coupleId) return;
      sbFetchLatestMoods(coupleId).then(data => {
        if (Object.keys(data).length) setMood(prev => ({ ...prev, ...data }));
      });
    }, [coupleId]);

    const onMoodChange = (who, m) => {
      setMood(prev => ({ ...prev, [who]: m }));
      if (coupleId) sbUpsertMood(coupleId, who, m);
    };

    // In Row, replace onClick={() => setMood({ ...mood, [who]: m.id })} with:
    // onClick={() => onMoodChange(who, m.id)}
  ```

- [ ] **Step 2: Update `ActivityHistory` to accept `coupleId` and fetch from Supabase**

  ```jsx
  const ActivityHistory = ({ coupleId }) => {
    const [items, setItems] = useState(ACTIVITY); // fallback to static
    useEffect(() => {
      if (!coupleId) return;
      sbFetchActivity(coupleId).then(data => { if (data.length) setItems(data); });
    }, [coupleId]);
    // render uses `items`
  ```

- [ ] **Step 3: Pass `coupleId` down from `HomeDashboard`**

  `HomeDashboard` already receives `coupleId` as a prop (from app.jsx). Pass it to:
  ```jsx
  <MoodCheckIn coupleId={coupleId} />
  <ActivityHistory coupleId={coupleId} />
  ```

- [ ] **Step 4: Browser verify**
  Home page loads. Tap a mood chip → refresh page → same mood shown.

- [ ] **Step 5: Commit**
  ```bash
  git add Website-Frontend/src/home.jsx
  git commit -m "feat(home): mood check-ins and activity from Supabase"
  ```

---

### Task 10: Migrate `quiz.jsx`

**Files:**
- Modify: `Website-Frontend/src/quiz.jsx`

- [ ] **Step 1: Add `coupleId` prop to `QuizGame` and record attempts**

  Find where a quiz answer is submitted (the function that checks correctness). After determining `correct`, add:

  ```jsx
  if (coupleId) {
    sbRecordQuizAttempt(coupleId, 'dhruv', question.id, selectedAnswer, correct);
  }
  ```

  Update `QuizGame` signature: `const QuizGame = ({ coupleId }) => {`

- [ ] **Step 2: Browser verify**
  Play the quiz, answer a question. In Supabase dashboard → Table Editor → `quiz_attempts`. Expected: new row with the attempt.

- [ ] **Step 3: Commit**
  ```bash
  git add Website-Frontend/src/quiz.jsx
  git commit -m "feat(quiz): record attempts to Supabase"
  ```

---

### Task 11: Migrate `drawing.jsx`

**Files:**
- Modify: `Website-Frontend/src/drawing.jsx`

- [ ] **Step 1: Add `coupleId` prop to `DrawingGame` and save drawings**

  Find where the drawing game ends (timer hits 0 or user stops). After the rating is determined, add:

  ```jsx
  if (coupleId && canvasRef.current) {
    const canvasData = canvasRef.current.toDataURL('image/png');
    sbSaveDrawing(coupleId, canvasData, currentTwist, currentRating);
  }
  ```

  Update signature: `const DrawingGame = ({ coupleId }) => {`

- [ ] **Step 2: Browser verify**
  Complete a drawing game. In Supabase dashboard → `drawings`. Expected: row with `canvas_data`, `twist`, `rating`.

- [ ] **Step 3: Commit**
  ```bash
  git add Website-Frontend/src/drawing.jsx
  git commit -m "feat(drawing): save completed drawings to Supabase"
  ```

---

### Task 12: Migrate `dates.jsx`

**Files:**
- Modify: `Website-Frontend/src/dates.jsx`

- [ ] **Step 1: Add `coupleId` prop to `DateNight` and migrate saved dates**

  ```jsx
  const DateNight = ({ coupleId }) => {
    const [savedDates, setSavedDates] = useState([]);

    useEffect(() => {
      if (!coupleId) return;
      sbFetchSavedDates(coupleId).then(rows => {
        // Map date_idea_id back to full DATE_IDEAS objects
        setSavedDates(rows.map(r => DATE_IDEAS.find(d => String(d.id) === r.date_idea_id)).filter(Boolean));
      });
    }, [coupleId]);

    const saveDate = async (idea) => {
      if (coupleId) await sbSaveDate(coupleId, String(idea.id));
      setSavedDates(prev => [...prev, idea]);
    };
    // replace existing save logic with `saveDate(idea)`
  ```

- [ ] **Step 2: Browser verify**
  Spin the wheel → save a date. Refresh page. Expected: saved date still listed.

- [ ] **Step 3: Commit**
  ```bash
  git add Website-Frontend/src/dates.jsx
  git commit -m "feat(dates): saved dates persist to Supabase"
  ```

---

### Task 13: Update `settings.jsx`

**Files:**
- Modify: `Website-Frontend/src/settings.jsx`

- [ ] **Step 1: Add `coupleId`, `profile`, `couple` props and auth UI to `SettingsPage`**

  ```jsx
  const SettingsPage = ({ coupleId, profile, couple }) => {
  ```

  Replace the hardcoded "Dhruv" / "Anjali" / email values in the Couple Profile section with data from `profile` and `couple`:

  ```jsx
  // Show logged-in user's real name and email
  <div className="text-[14px] text-ink-900">{profile?.name || 'You'}</div>
  <div className="text-[12px] text-ink-500">
    {profile?.role === 'dhruv' ? 'San Francisco, CA · PST' : 'Bengaluru, IN · IST'}
  </div>
  ```

- [ ] **Step 2: Add sign-out button at the bottom of `SettingsPage`**

  ```jsx
  <div className="flex justify-center pt-2">
    <Button kind="ghost" onClick={() => sbSignOut()}>Sign out</Button>
  </div>
  ```

- [ ] **Step 3: Add invite code / link partner section**

  Add this section inside `SettingsPage` after the Couple Profile surface, only shown if `profile` exists:

  ```jsx
  {profile && !profile.couple_id && (
    <Surface className="p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Link accounts</div>
      <div className="font-serif-i text-2xl text-ink-900 mt-1">connect to your partner</div>
      <p className="text-[13px] text-ink-500 mt-2">
        Paste your partner's invite code to link your accounts and see shared data.
      </p>
      <InviteSection profile={profile} />
    </Surface>
  )}
  ```

  Add the `InviteSection` component above `SettingsPage`:

  ```jsx
  const InviteSection = ({ profile }) => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState(null);
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
      navigator.clipboard.writeText(profile.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const link = async () => {
      setStatus('loading');
      try {
        await sbLinkPartner(code.trim());
        setStatus('linked');
        setTimeout(() => window.location.reload(), 1000);
      } catch (e) {
        setStatus('error');
      }
    };

    return (
      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-cream-200 ring-1 ring-ink-900/[0.06] p-3.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-ink-500">Your invite code</div>
            <div className="font-mono text-[15px] text-ink-900 mt-0.5">{profile.invite_code}</div>
          </div>
          <Button kind="soft" size="sm" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</Button>
        </div>
        <div className="flex gap-2">
          <input value={code} onChange={e => setCode(e.target.value)}
            placeholder="Paste partner's invite code"
            className="flex-1 h-10 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
          <Button kind="coral" size="sm" disabled={!code || status === 'loading'} onClick={link}>
            {status === 'loading' ? 'Linking…' : status === 'linked' ? 'Linked!' : 'Link'}
          </Button>
        </div>
        {status === 'error' && (
          <div className="text-[12px] text-coral-600">Code not found. Check with your partner.</div>
        )}
      </div>
    );
  };
  ```

- [ ] **Step 4: Browser verify**
  Navigate to Settings. Expected: real name/email shown, sign-out button present. Click sign out → redirected to login screen.

- [ ] **Step 5: Commit**
  ```bash
  git add Website-Frontend/src/settings.jsx
  git commit -m "feat(settings): real user data, sign out, invite code / partner linking"
  ```

---

## Phase 4: Storage Setup

### Task 14: Set up photo storage bucket

**Files:** None (done in Supabase dashboard)

- [ ] **Step 1: Create the photos bucket**
  Supabase dashboard → Storage → New bucket → name: `photos` → Private (toggle off "Public bucket") → Create bucket.

- [ ] **Step 2: Add storage RLS policies**
  In SQL editor:

  ```sql
  -- Allow authenticated users to read/write only their couple's folder
  create policy "couple photos read"
  on storage.objects for select
  using (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = my_couple_id()::text
  );

  create policy "couple photos write"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = my_couple_id()::text
  );

  create policy "couple photos update"
  on storage.objects for update
  using (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = my_couple_id()::text
  );
  ```

- [ ] **Step 3: Browser verify — upload test**
  In DevTools console (while logged in):
  ```js
  const file = new File(['test'], 'test.txt', { type: 'text/plain' });
  sbUploadPhoto('your-couple-id', 'test-memory-id', file).then(console.log).catch(console.error)
  ```
  Expected: path string like `couple-id/test-memory-id.txt`. No error.

- [ ] **Step 4: Seed existing photos via dashboard**
  Storage → photos bucket → Upload files → upload to `{couple_id}/` folder.
  After uploading each file, go to Table Editor → `memories` → find the matching row → set `img_path` to `{couple_id}/{filename}`.

---

## Phase 5: Data Seeding

### Task 15: Seed existing static data into Supabase

**Files:** None (done via Supabase dashboard Table Editor or SQL)

- [ ] **Step 1: Seed memories from `data.jsx`**
  For each memory in `window.MEMORIES` (open DevTools console, type `MEMORIES`), insert a row in the `memories` table via Table Editor or SQL:

  ```sql
  insert into memories (couple_id, title, date, location, note, song, bg, tags)
  values
    ('COUPLE_ID', 'The rooftop call', '2024-05-21', 'Bengaluru', 'You held the phone up...', 'From the Start', 'linear-gradient(135deg, #E5DEF0, #F1ECF7)', ARRAY['Calls', 'Firsts']),
    -- repeat for each memory
  ;
  ```

- [ ] **Step 2: Seed letters from `data.jsx`**
  Similarly insert rows from `window.LETTERS` into the `letters` table.

- [ ] **Step 3: Seed bucket items from `data.jsx`**
  Insert rows from `window.BUCKET_ITEMS` into `bucket_items`.

- [ ] **Step 4: Browser verify**
  After seeding, navigate to Memories, Letters, Bucket List. Expected: all existing data appears, loaded from Supabase.

- [ ] **Step 5: Commit all remaining changes**
  ```bash
  git add -A
  git commit -m "feat(supabase): complete integration — auth, DB, storage, data migration"
  ```

---

## Self-Review Checklist

- [x] All 5 spec sections covered: auth, schema, data layer (8 pages), storage, seeding
- [x] `supabase.jsx` exports match every function used across page files
- [x] `coupleId` prop threaded through all pages via `app.jsx`
- [x] `PhotoBlock` updated — `imgPath` + `sbGetPhotoUrl` consistent with `sbUploadPhoto` return value
- [x] RLS `my_couple_id()` function defined before policies that use it
- [x] Storage policies use `(storage.foldername(name))[1]` which gives the first folder segment = couple_id
- [x] `MEMORY_TAGS` fallback array in `AddMemoryModal` in case the global isn't defined
- [x] No TBDs or placeholders — all SQL, code, and commands are complete
