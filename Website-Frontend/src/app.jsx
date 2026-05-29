/* App shell: sidebar nav (desktop), bottom nav (mobile), top utility bar, routed body. */

const ROUTES = [
  { id:'home',     label:'Home',         icon: I.Home,     Page: (p) => <HomeDashboard go={setRoute} {...p} /> },
  { id:'quiz',     label:'Quiz',         icon: I.Quiz,     Page: (p) => <QuizGame {...p} /> },
  { id:'drawing',  label:'Future Home',  icon: I.Draw,     Page: (p) => <DrawingGame {...p} /> },
  { id:'blurred',  label:'Blurred Photo',icon: I.Photo,    Page: (p) => <BlurredPhotoGame {...p} /> },
  { id:'dates',    label:'Date Night',   icon: I.Spinner,  Page: (p) => <DateNight {...p} /> },
  { id:'letters',  label:'Letters',      icon: I.Letter,   Page: (p) => <LettersPage {...p} /> },
  { id:'memories', label:'Memories',     icon: I.Timeline, Page: (p) => <MemoriesTimeline {...p} /> },
  { id:'bucket',   label:'Bucket List',  icon: I.List,     Page: (p) => <BucketList {...p} /> },
  { id:'settings', label:'Settings',     icon: I.Gear,     Page: (p) => <SettingsPage {...p} /> },
];

let setRoute = () => {}; // patched below

const Sidebar = ({ route, onRoute, online, partnerName }) => (
  <aside className="hidden lg:flex sticky top-0 h-screen w-[244px] shrink-0 flex-col py-6 px-4 border-r border-ink-900/[0.06] bg-cream-50/60 backdrop-blur-sm z-10">
    {/* Brand */}
    <div className="px-2 mb-7">
      <div className="flex items-center gap-2.5">
        <span className="relative inline-flex">
          <span className="inline-block w-7 h-7 rounded-full bg-coral-500" />
          <span className="inline-block w-7 h-7 rounded-full bg-lavender-500 -ml-3 mix-blend-multiply" />
        </span>
        <div>
          <div className="font-serif-i text-[22px] text-ink-900 leading-none">Between Us</div>
          <div className="text-[11px] text-ink-500 mt-1">Dhruv & Anjali</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex flex-col gap-0.5">
      {ROUTES.slice(0, 4).map(r => <NavItem key={r.id} r={r} active={route === r.id} onRoute={onRoute} />)}
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400 mt-4 mb-1 px-3">Together</div>
      {ROUTES.slice(4, 8).map(r => <NavItem key={r.id} r={r} active={route === r.id} onRoute={onRoute} />)}
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400 mt-4 mb-1 px-3">Account</div>
      {ROUTES.slice(8).map(r => <NavItem key={r.id} r={r} active={route === r.id} onRoute={onRoute} />)}
    </nav>

    <div className="mt-auto px-3">
      <div className="rounded-2xl bg-white ring-1 ring-ink-900/[0.06] p-3.5">
        <div className="flex items-center gap-2.5">
          <PairAvatar size={28} />
          <div className="min-w-0">
            <div className="text-[13px] text-ink-900 font-medium leading-tight">Dhruv & Anjali</div>
            <div className="text-[11px] text-ink-500 leading-tight mt-0.5 inline-flex items-center gap-1.5">
              <span className={`${online ? 'pulse-dot' : ''} inline-block w-1.5 h-1.5 rounded-full ${online ? 'bg-sage-500' : 'bg-ink-300'}`} />
              {online ? 'both online' : `waiting for ${partnerName}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
);

const NavItem = ({ r, active, onRoute }) => (
  <button
    onClick={() => onRoute(r.id)}
    className={`group flex items-center gap-2.5 px-3 h-10 rounded-xl text-[13.5px] transition-all relative ${
      active
        ? 'bg-ink-900 text-cream-100'
        : 'text-ink-700 hover:bg-cream-200/80 hover:text-ink-900'
    }`}
  >
    <r.icon size={16} />
    <span className="font-medium">{r.label}</span>
    {active ? <span className="ml-auto w-1 h-1 rounded-full bg-coral-400" /> : null}
  </button>
);

const TopBar = ({ route, online, partnerName }) => {
  const r = ROUTES.find(x => x.id === route);
  const date = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  const status = online
    ? { dot: 'bg-sage-500', anim: 'pulse-dot', label: 'both online' }
    : { dot: 'bg-ink-300',  anim: '',          label: `${partnerName} offline` };
  return (
    <div className="sticky top-0 z-20 backdrop-blur bg-cream-100/85 border-b border-ink-900/[0.05]">
      <div className="flex items-center justify-between gap-3 px-5 lg:px-9 h-14">
        <div className="flex items-center gap-2 min-w-0">
          {/* mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="relative inline-flex">
              <span className="inline-block w-5 h-5 rounded-full bg-coral-500" />
              <span className="inline-block w-5 h-5 rounded-full bg-lavender-500 -ml-2 mix-blend-multiply" />
            </span>
            <span className="font-serif-i text-[20px] text-ink-900 leading-none">Between Us</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 min-w-0 text-[12.5px] text-ink-500">
            <span className="font-mono">{date}</span>
            <span className="text-ink-300">/</span>
            <span className="truncate">{r?.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex"><TwoClocks /></span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500" title={status.label}>
            <span className={`${status.anim} inline-block w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span className="hidden sm:inline">{status.label}</span>
          </span>
          <PairAvatar size={26} />
        </div>
      </div>
    </div>
  );
};

const MobileNav = ({ route, onRoute }) => (
  <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-ink-900/[0.06] bg-cream-100/95 backdrop-blur">
    <div className="flex items-stretch overflow-x-auto no-scrollbar">
      {ROUTES.map(r => (
        <button key={r.id} onClick={() => onRoute(r.id)}
          className={`shrink-0 flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px] text-[10.5px] relative ${
            route === r.id ? 'text-ink-900' : 'text-ink-500'
          }`}>
          <r.icon size={18} />
          <span>{r.label}</span>
          {route === r.id && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-coral-500" />}
        </button>
      ))}
    </div>
    <div className="pb-[env(safe-area-inset-bottom)]" />
  </nav>
);

const App = () => {
  const [route, setRouteState] = useState(() => (window.location.hash || '#home').replace('#', ''));
  const [session, setSession] = useState(undefined); // undefined = checking, null = no session
  const [profile, setProfile] = useState(null);
  const [couple, setCouple] = useState(null);
  const [presentIds, setPresentIds] = useState([]); // online user ids in our presence channel

  // Boot: check existing session, load profile + couple
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
      } catch (e) { console.error('Boot error', e); }
    });

    const { data: { subscription } } = sbOnAuthChange(async (event, s) => {
      if (event === 'SIGNED_OUT') { setSession(null); setProfile(null); setCouple(null); return; }
      if (s) {
        setSession(s);
        try {
          const prof = await sbGetProfile(s.user.id);
          setProfile(prof);
          if (prof.couple_id) {
            const cpl = await sbGetCouple(prof.couple_id);
            setCouple(cpl);
          }
        } catch (e) { console.error('Auth change error', e); }
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

  // Real-time presence: join a per-couple channel so each partner sees the other go on/offline.
  useEffect(() => {
    const uid = session?.user?.id;
    const cid = profile?.couple_id;
    if (!uid || !cid) return;
    const ch = sbJoinPresence(cid, uid, { id: uid }, (ids) => setPresentIds(ids));
    return () => { sbLeavePresence(ch); setPresentIds([]); };
  }, [session && session.user && session.user.id, profile && profile.couple_id]);

  const onRoute = (id) => {
    setRouteState(id);
    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  setRoute = onRoute;

  // Checking session
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

  // No session → login screen
  if (!session) {
    return <AuthScreen onAuth={(s) => setSession(s)} />;
  }

  const coupleId = profile?.couple_id || null;
  const Active = (ROUTES.find(r => r.id === route) || ROUTES[0]).Page;

  // Who is signed in (Dhruv vs Anjali) — drives greeting, accents, defaults.
  const me = identityFor({ email: session?.user?.email, role: profile?.role });
  // Presence → partner is "online" if any present id isn't mine.
  const myUserId = session?.user?.id;
  const partnerOnline = presentIds.some(id => id !== myUserId);

  return (
    <div className="min-h-screen flex">
      <Sidebar route={route} onRoute={onRoute} online={partnerOnline} partnerName={me.partnerName} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar route={route} online={partnerOnline} partnerName={me.partnerName} />
        <main key={route} className="px-5 sm:px-7 lg:px-9 py-6 lg:py-9 pb-28 lg:pb-12 max-w-[1200px] w-full mx-auto page-enter">
          <Active coupleId={coupleId} profile={profile} couple={couple} me={me} />
        </main>
      </div>
      <MobileNav route={route} onRoute={onRoute} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
