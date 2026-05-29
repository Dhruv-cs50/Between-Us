/* Settings / Profile — private, simple. */

const Field = ({ label, value, sub }) => (
  <div className="flex items-start justify-between gap-4 py-3.5">
    <div className="min-w-0">
      <div className="text-[12px] text-ink-500">{label}</div>
      <div className="text-[14px] text-ink-900 mt-1">{value}</div>
      {sub ? <div className="text-[12px] text-ink-400 mt-0.5">{sub}</div> : null}
    </div>
  </div>
);

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} className={`w-10 h-6 rounded-full transition-colors ${on ? 'bg-coral-500' : 'bg-cream-300'} relative shrink-0`}>
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : ''}`} />
  </button>
);

const SettingsRow = ({ icon: IconC, title, sub, right }) => (
  <div className="flex items-center gap-3 py-3.5">
    {IconC ? <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-cream-200 text-ink-700"><IconC size={16} /></span> : null}
    <div className="min-w-0 flex-1">
      <div className="text-[14px] text-ink-900">{title}</div>
      {sub ? <div className="text-[12px] text-ink-500 mt-0.5">{sub}</div> : null}
    </div>
    <div className="shrink-0">{right}</div>
  </div>
);

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
      setTimeout(() => window.location.reload(), 1200);
    } catch { setStatus('error'); }
  };

  return (
    <Surface className="p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Link partner account</div>
      <div className="font-serif-i text-2xl text-ink-900 mt-1">connect to each other</div>
      <p className="text-[13px] text-ink-500 mt-2 max-w-md">
        Share your invite code with your partner, or paste theirs to link accounts and share data.
      </p>
      <div className="mt-4 rounded-xl bg-cream-200 ring-1 ring-ink-900/[0.06] p-3.5 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-ink-500">Your invite code</div>
          <div className="font-mono text-[15px] text-ink-900 mt-0.5">{profile.invite_code}</div>
        </div>
        <Button kind="soft" size="sm" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</Button>
      </div>
      <div className="flex gap-2 mt-3">
        <input value={code} onChange={e => setCode(e.target.value)}
          placeholder="Paste partner's invite code"
          className="flex-1 h-10 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
        <Button kind="coral" size="sm" disabled={!code || status === 'loading'} onClick={link}>
          {status === 'loading' ? 'Linking…' : status === 'linked' ? 'Linked!' : 'Link'}
        </Button>
      </div>
      {status === 'error' && <div className="text-[12px] text-coral-600 mt-2">Code not found. Check with your partner.</div>}
    </Surface>
  );
};

const SettingsPage = ({ profile, couple }) => {
  const [theme, setTheme] = useState('Warm');
  const [notif, setNotif] = useState({ daily: true, miss: true, date: false });
  const [editingMusic, setEditingMusic] = useState(false);
  const [lib] = useMusicLibrary();
  const linkedBillie = lib.billie.filter(s => s.trackId).length;
  const linkedAnuv   = lib.anuv.filter(s => s.trackId).length;
  const linkedPlaylists = lib.shared.playlists.filter(p => p.id).length;

  return (
    <div className="space-y-6 fade-up">
      <SectionHeader
        eyebrow="Profile"
        title="Settings"
        sub="Private to the two of you. Only invited people can be here."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Couple profile */}
        <Surface className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Couple profile</div>
              <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">Dhruv & Anjali</div>
            </div>
            <PairAvatar size={40} />
          </div>

          <Hair className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 sm:divide-x divide-ink-900/[0.06]">
            <div className="sm:pr-6">
              <div className="flex items-center gap-3 py-2">
                <Avatar initial="D" tone="coral" size={32} />
                <div>
                  <div className="text-[14px] text-ink-900">Dhruv</div>
                  <div className="text-[12px] text-ink-500">San Francisco, CA · PST</div>
                </div>
              </div>
              <Hair className="my-1" />
              <Field label="Email" value="dhruv@between.us" />
            </div>
            <div className="sm:pl-6">
              <div className="flex items-center gap-3 py-2">
                <Avatar initial="A" tone="lavender" size={32} />
                <div>
                  <div className="text-[14px] text-ink-900">Anjali</div>
                  <div className="text-[12px] text-ink-500">Bengaluru, IN · IST</div>
                </div>
              </div>
              <Hair className="my-1" />
              <Field label="Email" value="anjali@between.us" />
            </div>
          </div>

          <Hair className="my-4" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Together since" value="Mar 10, 2021" />
            <Field label="Next visit" value="TBD 😉" sub="a date we’ll pick together" />
            <Field label="Time gap" value="12.5 h" sub="PST ↔ IST" />
            <Field label="Favorite artists" value="Billie Eilish, Anuv Jain" />
          </div>
        </Surface>

        {/* App preferences */}
        <Surface className="p-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">App preferences</div>
          <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">how it should feel</div>

          <div className="mt-4">
            <div className="text-[12px] text-ink-600 mb-2">Theme</div>
            <div className="flex gap-1.5">
              {['Light', 'Warm', 'Night'].map(t => (
                <Chip key={t} tone="coral" size="sm" selected={theme === t} onClick={() => setTheme(t)}>{t}</Chip>
              ))}
            </div>
          </div>

          <Hair className="my-4" />

          <SettingsRow icon={I.Heart} title="Daily soft check-in" sub="one small ping at 9pm her time" right={<Toggle on={notif.daily} onChange={v => setNotif({ ...notif, daily: v })} />} />
          <Hair />
          <SettingsRow icon={I.Send} title="“I miss you” nudges" sub="when one of us has been quiet" right={<Toggle on={notif.miss} onChange={v => setNotif({ ...notif, miss: v })} />} />
          <Hair />
          <SettingsRow icon={I.Calendar} title="Date night reminders" sub="suggest tonight’s tiny date" right={<Toggle on={notif.date} onChange={v => setNotif({ ...notif, date: v })} />} />

          <div className="mt-4 rounded-xl bg-cream-200 ring-1 ring-ink-900/[0.04] p-3.5">
            <div className="flex items-center gap-2 text-[12.5px] text-ink-700">
              <I.Lock size={13} className="text-ink-500" />
              <span>Private. Only invited people can access this space.</span>
            </div>
          </div>
        </Surface>
      </div>

      {/* Data sections */}
      <Surface className="p-5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Your data</div>
        <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">manage what we made</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {[
            { i: I.Quiz,     t:'Quiz questions',  n: QUIZ_QUESTIONS.length, sub:'13 questions' },
            { i: I.Photo,    t:'Photo memories',  n: PHOTO_CHALLENGES.length, sub:'4 rounds' },
            { i: I.Letter,   t:'Letters',         n: LETTERS.length, sub:'8 in the box' },
            { i: I.Timeline, t:'Memory timeline', n: MEMORIES.length, sub:'8 entries' },
          ].map(d => (
            <button key={d.t} className="text-left rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4 hover:ring-ink-900/[0.18] transition-all">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-cream-200 text-ink-700"><d.i size={16} /></span>
                <span className="font-mono text-[12px] text-ink-500 tabular-nums">{d.n}</span>
              </div>
              <div className="font-serif-i text-xl text-ink-900 mt-3">{d.t}</div>
              <div className="text-[12px] text-ink-500 mt-1 inline-flex items-center gap-1">{d.sub} <I.Arrow size={12} /></div>
            </button>
          ))}
        </div>
      </Surface>

      {/* Music */}
      <Surface className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Music</div>
            <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">our songs library</div>
            <p className="text-[13px] text-ink-500 mt-1.5 max-w-md">
              Paste Spotify share links to link real tracks. Saved to your browser, persists across reloads.
              The “Pick a song for us” button on Home shuffles across whatever you’ve linked.
            </p>
          </div>
          <Button kind="primary" icon={I.Pencil} onClick={() => setEditingMusic(true)}>Edit library</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lavender-500" />
              <div className="text-[13px] font-medium text-ink-900">Billie Eilish</div>
            </div>
            <div className="font-serif-i text-3xl text-ink-900 leading-none mt-2">{linkedBillie}<span className="text-ink-400 text-xl"> / {lib.billie.length}</span></div>
            <div className="text-[12px] text-ink-500 mt-1">tracks linked</div>
          </div>
          <div className="rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-500" />
              <div className="text-[13px] font-medium text-ink-900">Anuv Jain</div>
            </div>
            <div className="font-serif-i text-3xl text-ink-900 leading-none mt-2">{linkedAnuv}<span className="text-ink-400 text-xl"> / {lib.anuv.length}</span></div>
            <div className="text-[12px] text-ink-500 mt-1">tracks linked</div>
          </div>
          <div className="rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral-500" />
              <div className="text-[13px] font-medium text-ink-900">Shared playlists</div>
            </div>
            <div className="font-serif-i text-3xl text-ink-900 leading-none mt-2">{linkedPlaylists}<span className="text-ink-400 text-xl"> / {lib.shared.playlists.length}</span></div>
            <div className="text-[12px] text-ink-500 mt-1 truncate">{linkedPlaylists ? 'linked & ready' : 'paste a Spotify playlist link'}</div>
          </div>
        </div>
        <EditLibraryModal open={editingMusic} onClose={() => setEditingMusic(false)} />
      </Surface>

      {profile && !profile.couple_id && <InviteSection profile={profile} />}

      <div className="flex flex-col items-center gap-3 pt-2">
        {profile && (
          <div className="text-[13px] text-ink-500">
            Signed in as <span className="font-medium text-ink-800">{profile.name}</span>
          </div>
        )}
        <Button kind="ghost" onClick={() => sbSignOut()}>Sign out</Button>
        <div className="text-[12px] text-ink-400 font-mono">between us · v0.1 · made for two</div>
      </div>
    </div>
  );
};

window.SettingsPage = SettingsPage;
