/* Home Dashboard — opens directly into the app, no marketing hero. */

const dayMs = 86_400_000;

const useCountdown = (iso) => {
  const target = useMemo(() => new Date(iso).getTime(), [iso]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / dayMs),
    hours: Math.floor(diff / 3_600_000 % 24),
    minutes: Math.floor(diff / 60_000 % 60),
    seconds: Math.floor(diff / 1000 % 60)
  };
};

/* — Mood check-in for both partners — */
const MoodCheckIn = ({ coupleId }) => {
  const [mood, setMood] = useState({ dhruv: 'happy', anjali: 'quiet' });

  useEffect(() => {
    if (!coupleId) return;
    sbFetchLatestMoods(coupleId).then(data => {
      if (Object.keys(data).length) setMood(prev => ({ ...prev, ...data }));
    }).catch(() => {});
  }, [coupleId]);

  const onMoodChange = (who, m) => {
    setMood(prev => ({ ...prev, [who]: m }));
    if (coupleId) sbUpsertMood(coupleId, who, m).catch(() => {});
  };

  const Row = ({ who, name, tone }) =>
  <div>
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar initial={name[0]} tone={tone} size={26} />
        <span className="text-[13px] text-ink-700"><span className="font-medium text-ink-900">{name}</span> is feeling</span>
        <span className="text-[13px] text-ink-500 italic ml-auto">
          {MOODS.find((m) => m.id === mood[who])?.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {MOODS.map((m) =>
      <Chip
        key={m.id}
        tone={m.tone === 'butter' ? 'butter' : m.tone === 'ink' ? 'cream' : m.tone}
        size="sm"
        selected={mood[who] === m.id}
        onClick={() => onMoodChange(who, m.id)}>
            {m.label}
          </Chip>
      )}
      </div>
    </div>;

  return (
    <Surface className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Mood check-in</div>
          <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">how we are, right now</div>
        </div>
        <I.Mood size={20} className="text-ink-400" />
      </div>
      <div className="space-y-4">
        <Row who="dhruv" name="Dhruv" tone="coral" />
        <Hair />
        <Row who="anjali" name="Anjali" tone="lavender" />
      </div>
    </Surface>);

};

/* — Countdown card — */
const CountdownCard = () => {
  const isTBD = !COUPLE.next_visit;
  const c = useCountdown(COUPLE.next_visit || Date.now());
  const daysTogether = Math.floor((Date.now() - new Date(COUPLE.anniversary).getTime()) / dayMs);
  const target = COUPLE.next_visit ? new Date(COUPLE.next_visit) : null;
  const targetLabel = isTBD ?
  'still cooking — a date we’ll pick together' :
  target.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const unit = (n, label) =>
  <div className="text-center">
      <div className="font-serif-i text-5xl sm:text-6xl text-ink-900 leading-none tabular-nums">{String(n).padStart(2, '0')}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500 mt-2">{label}</div>
    </div>;

  return (
    <Surface className="p-6 sm:p-7 relative overflow-hidden">
      {/* Soft warm glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-[0.45] pointer-events-none"
      style={{ background: 'radial-gradient(closest-side, #F7DFD2, transparent 70%)' }} />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Next time together</div>
            <div className="font-serif-i text-2xl sm:text-[26px] text-ink-900 mt-1">{targetLabel}</div>
          </div>
          <Chip tone="coral" selected icon={I.Pin} size="sm">{`${COUPLE.airports?.a || 'SFO'} → ${COUPLE.airports?.b || 'BLR'}`}</Chip>
        </div>
        {isTBD ?
        <div className="mt-6 sm:mt-7 rounded-2xl bg-cream-200/70 ring-1 ring-ink-900/[0.05] p-5 sm:p-6 flex items-center justify-between gap-4">
            <div>
              <div className="font-serif-i text-[34px] sm:text-[42px] text-ink-900 leading-none">soon <span aria-label="wink" role="img">😉</span></div>
              <div className="text-[13px] text-ink-500 mt-2">when we pick a date, the countdown starts. Until then, it’s vibes.</div>
            </div>
            <Button kind="outline" icon={I.Calendar}>Pick a date</Button>
          </div> :

        <div className="grid grid-cols-4 gap-2 mt-6 sm:mt-7">
            {unit(c.days, 'days')}
            {unit(c.hours, 'hours')}
            {unit(c.minutes, 'min')}
            {unit(c.seconds, 'sec')}
          </div>
        }
        <Hair className="my-5" />
        <div className="flex items-end justify-between gap-3">
          <Stat label="Days together" value={<CountUp to={daysTogether} />} sub={`since ${new Date(COUPLE.anniversary).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} />
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Calls this month</div>
            <div className="font-serif-i text-4xl text-ink-900 leading-none mt-1">47</div>
          </div>
        </div>
      </div>
    </Surface>);

};

/* — Tonight's tiny date — */
const TonightDateCard = ({ onStart }) =>
<Surface className="p-5 relative overflow-hidden">
    <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full opacity-[0.35] pointer-events-none"
  style={{ background: 'radial-gradient(closest-side, #DCE7DD, transparent 70%)' }} />
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Tonight’s tiny date</div>
        <Chip tone="sage" size="sm">{TONIGHT_DATE.vibe}</Chip>
      </div>
      <div className="font-serif-i text-3xl text-ink-900 leading-[1.1] mt-2.5">{TONIGHT_DATE.title}</div>
      <div className="text-[13px] text-ink-500 mt-2">{TONIGHT_DATE.duration}</div>
      <ol className="mt-4 space-y-2">
        {TONIGHT_DATE.steps.map((s, i) =>
      <li key={i} className="flex gap-2.5 text-[13.5px] text-ink-700">
            <span className="font-mono text-[10px] mt-1 text-ink-400 tabular-nums">0{i + 1}</span>
            <span>{s}</span>
          </li>
      )}
      </ol>
      <div className="mt-5 flex items-center gap-2">
        <Button kind="primary" icon={I.Play} onClick={onStart}>Start tonight’s date</Button>
        <Button kind="ghost" size="md" icon={I.Shuffle}>Spin again</Button>
      </div>
    </div>
  </Surface>;


/* — Latest memory preview — */
const LatestMemory = ({ onOpen }) =>
<Surface className="p-4">
    <div className="flex gap-4">
      <PhotoBlock bg={LATEST_MEMORY.bg} className="w-[110px] h-[110px] shrink-0" caption="memory · may 21" />
      <div className="min-w-0 flex flex-col">
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Latest memory</div>
        <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">{LATEST_MEMORY.title}</div>
        <div className="text-[13px] text-ink-600 mt-2 line-clamp-2">{LATEST_MEMORY.note}</div>
        <button onClick={onOpen} className="mt-auto inline-flex items-center gap-1.5 text-[13px] text-coral-600 hover:text-coral-700 font-medium">
          See timeline <I.Arrow size={14} />
        </button>
      </div>
    </div>
  </Surface>;


/* — Quick game cards — */
const GameCard = ({ title, sub, tone, icon: IconC, onClick }) => {
  const tones = {
    coral: 'bg-coral-50 ring-coral-200/60 hover:ring-coral-400/60',
    lavender: 'bg-lavender-50 ring-lavender-200/60 hover:ring-lavender-400/60',
    sage: 'bg-sage-50 ring-sage-200/60 hover:ring-sage-400/60',
    butter: 'bg-[#FBF1D6] ring-[#E8C880]/70 hover:ring-[#E8B647]/70'
  };
  const dotTones = { coral: 'bg-coral-500', lavender: 'bg-lavender-500', sage: 'bg-sage-500', butter: 'bg-[#E8B647]' };
  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-2xl ring-1 transition-all p-4 sm:p-5 ${tones[tone]} lift hover:shadow-soft`}>
      
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 text-ink-800`}>
          <IconC size={18} />
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${dotTones[tone]}`} />
      </div>
      <div className="font-serif-i text-[22px] sm:text-2xl text-ink-900 leading-tight mt-4">{title}</div>
      <div className="text-[12.5px] text-ink-600 mt-1">{sub}</div>
      <div className="inline-flex items-center gap-1 text-[12px] text-ink-700 mt-4 opacity-70 group-hover:opacity-100">
        play <I.Arrow size={13} />
      </div>
    </button>);

};

const TonightsChoices = ({ go }) =>
<div>
    <div className="flex items-center justify-between mb-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Tonight’s choices</div>
      <span className="text-[11px] text-ink-400">tap one to begin</span>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
      <GameCard tone="coral" icon={I.Quiz} title="Relationship Quiz" sub="evidence that you pay attention" onClick={() => go('quiz')} />
      <GameCard tone="lavender" icon={I.Draw} title="Future Home, Badly" sub="60 seconds. love is mandatory." onClick={() => go('drawing')} />
      <GameCard tone="sage" icon={I.Photo} title="Guess the Blurred" sub="a memory, but mysterious" onClick={() => go('blurred')} />
      <GameCard tone="butter" icon={I.Letter} title="Open a Letter" sub="for when one text is not enough" onClick={() => go('letters')} />
    </div>
  </div>;


/* — Activity log — */
const ActivityRow = ({ a }) => {
  const dotByKind = { quiz: 'bg-coral-500', draw: 'bg-lavender-500', photo: 'bg-sage-500', miss: 'bg-coral-400', date: 'bg-[#E8B647]' };
  const iconByKind = { quiz: I.Quiz, draw: I.Draw, photo: I.Photo, miss: I.Heart, date: I.Calendar };
  const IconC = iconByKind[a.kind] || I.Sparkle;
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="relative mt-1.5 shrink-0">
        <span className={`block w-1.5 h-1.5 rounded-full ${dotByKind[a.kind] || 'bg-ink-400'}`} />
      </span>
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cream-200 text-ink-700 shrink-0">
        <IconC size={13} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] text-ink-800">
          <span className="font-medium text-ink-900">{a.who}</span> {a.what}
        </div>
        <div className="text-[12px] text-ink-500 mt-0.5">{a.meta}</div>
      </div>
      <div className="text-[11px] text-ink-400 whitespace-nowrap mt-1">{a.when}</div>
    </li>);

};

const ActivityHistory = ({ coupleId }) => {
  const [items, setItems] = useState(ACTIVITY);
  useEffect(() => {
    if (!coupleId) return;
    sbFetchActivity(coupleId).then(data => { if (data.length) setItems(data); }).catch(() => {});
  }, [coupleId]);
  return (
  <Surface className="p-5">
    <div className="flex items-center justify-between mb-2">
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Recent activity</div>
        <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">small things, lately</div>
      </div>
      <Chip size="sm" tone="ink">last 7 days</Chip>
    </div>
    <ul className="divide-y divide-ink-900/[0.05] -mx-1 px-1 mt-1">
      {items.map((a) => <ActivityRow key={a.id} a={a} />)}
    </ul>
  </Surface>
  );
};


/* — Miss-you pulse button — */
const MissYouButton = () => {
  const [sent, setSent] = useState(false);
  return (
    <button
      onClick={() => {setSent(true);setTimeout(() => setSent(false), 2200);}}
      className="group inline-flex items-center gap-2 px-3.5 h-10 rounded-full bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 shadow-softer transition-all">
      
      <I.Heart size={15} className="group-hover:scale-110 transition-transform" />
      <span>{sent ? 'Sent · she’ll see it' : 'Send I miss you'}</span>
    </button>);

};

/* — The whole Home page — */
const HomeDashboard = ({ go, coupleId }) => {
  return (
    <div className="space-y-7 fade-up">
      {/* Greeting block */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-2 flex items-center gap-2">
            <span className="font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span className="text-ink-300">•</span>
            <span>Your little place between the miles</span>
          </div>
          <h1 className="font-serif-i text-[44px] sm:text-[56px] text-ink-900 leading-[1] tracking-tight">
            Hi Dhruv <span className="text-ink-400">&</span> <span className="underline-scribble">Anjali</span>
          </h1>
          <p className="text-ink-500 mt-2.5 text-[15px] max-w-md">
            Two cities, one calendar. Here’s what’s soft and small for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MissYouButton />
        </div>
      </div>

      {/* Top row: countdown wide, soundtrack right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><CountdownCard /></div>
        <div className="space-y-5"><MusicCard /><LatestMemory onOpen={() => go('memories')} /></div>
      </div>

      {/* Choices */}
      <TonightsChoices go={go} />

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><TonightDateCard onStart={() => go('dates')} /></div>
        <MoodCheckIn coupleId={coupleId} />
      </div>

      {/* Activity */}
      <ActivityHistory coupleId={coupleId} />
    </div>);

};

window.HomeDashboard = HomeDashboard;