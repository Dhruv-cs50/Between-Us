/* Date Night — interactive wheel + generated date card + saved list. */

const SLICE_COLORS = {
  Talk:    '#F4D9CE', // coral-100
  Game:    '#E5DEF0', // lavender-100
  Create:  '#DCE7DD', // sage-100
  Food:    '#FBF1D6', // butter-100
  Music:   '#EFBFA6', // coral-200
  Memory:  '#CCC0DF', // lavender-200
  Future:  '#BDD0BF', // sage-200
};

const DateWheel = ({ angle, onSpin, spinning, slices }) => {
  const segs = slices.length;
  const segDeg = 360 / segs;
  const cx = 130, cy = 130, r = 120;
  const polar = (deg, rad = r) => {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  const arcPath = (i) => {
    const a0 = i * segDeg, a1 = (i + 1) * segDeg;
    const [x0, y0] = polar(a0), [x1, y1] = polar(a1);
    const large = segDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  };

  return (
    <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] mx-auto select-none">
      {/* pointer */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
        <svg width="22" height="20" viewBox="0 0 22 20">
          <path d="M11 20 L1 2 L21 2 Z" fill="#1C1814" />
        </svg>
      </div>
      <svg
        viewBox="0 0 260 260"
        className="w-full h-full"
        style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 3.4s cubic-bezier(.18,.7,.18,1)' : 'none', filter:'drop-shadow(0 10px 24px rgba(28,24,20,0.10))' }}
      >
        {slices.map((s, i) => {
          const mid = i * segDeg + segDeg / 2;
          const [lx, ly] = polar(mid, r * 0.62);
          return (
            <g key={s}>
              <path d={arcPath(i)} fill={SLICE_COLORS[s]} stroke="#FAF6EF" strokeWidth="2" />
              <text
                x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                transform={`rotate(${mid} ${lx} ${ly})`}
                fontFamily="'Instrument Serif', serif" fontStyle="italic"
                fontSize="20" fill="#3D352D"
              >{s}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="22" fill="#FAF6EF" stroke="#1C1814" strokeWidth="1.5" />
        <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Instrument Serif', serif" fontStyle="italic" fontSize="14" fill="#1C1814">spin</text>
      </svg>
      <button
        onClick={onSpin}
        disabled={spinning}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-transparent z-10"
        aria-label="spin the wheel"
      />
    </div>
  );
};

const DateNight = () => {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState(null);
  const [filter, setFilter] = useState('All');
  const [saved, setSaved]   = useState([...SAVED_DATES]);

  const slices = DATE_CATEGORIES;

  const spin = () => {
    if (spinning) return;
    const targetCat = slices[Math.floor(Math.random() * slices.length)];
    const segDeg = 360 / slices.length;
    const idx = slices.indexOf(targetCat);
    // base extra revolutions + land on the slice center
    const finalAngle = 360 * 4 + (360 - (idx * segDeg + segDeg / 2));
    const start = angle % 360;
    setAngle(angle + (finalAngle - start));
    setSpinning(true);
    setTimeout(() => {
      // pick a random idea in that category
      const inCat = DATE_IDEAS.filter(d => d.cat === targetCat);
      const idea = inCat[Math.floor(Math.random() * inCat.length)] || DATE_IDEAS[0];
      setPicked(idea);
      setSpinning(false);
    }, 3500);
  };

  const toggleSave = (id) => setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const filtered = filter === 'All' ? DATE_IDEAS : DATE_IDEAS.filter(d => d.cat === filter);

  return (
    <div className="space-y-6 fade-up">
      <SectionHeader
        eyebrow="Game 04"
        title="Date Night"
        sub={'For when “what should we do?” needs an answer.'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-5">
        {/* Wheel */}
        <Surface className="p-6 sm:p-7 flex flex-col items-center">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium self-start">Spin the wheel</div>
          <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1 self-start">land on a category</div>
          <div className="my-6">
            <DateWheel angle={angle} onSpin={spin} spinning={spinning} slices={slices} />
          </div>
          <Button kind="primary" size="lg" icon={I.Sparkle} onClick={spin} disabled={spinning}>
            {spinning ? 'spinning…' : 'Spin again'}
          </Button>
        </Surface>

        {/* Picked card or empty state */}
        <div className="space-y-4">
          {picked ? (
            <Surface className="p-6 fade-up">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">tonight</div>
                  <div className="font-serif-i text-[28px] text-ink-900 leading-[1.1] mt-1">{picked.title}</div>
                </div>
                <Chip tone={picked.cat === 'Music' ? 'lavender' : picked.cat === 'Food' ? 'butter' : picked.cat === 'Future' ? 'sage' : 'coral'} size="sm">{picked.cat}</Chip>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Chip tone="cream" size="sm">{picked.duration}</Chip>
                <Chip tone="cream" size="sm">{picked.mood}</Chip>
                {picked.materials.map(m => <Chip key={m} tone="cream" size="sm">{m}</Chip>)}
              </div>
              <Hair className="my-5" />
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">how to do it</div>
              <ol className="mt-2 space-y-2">
                {picked.steps.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[13.5px] text-ink-700">
                    <span className="font-mono text-[10px] mt-1 text-ink-400 tabular-nums">0{i+1}</span>
                    <span style={{textWrap:'pretty'}}>{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex items-center gap-2">
                <Button kind="primary" icon={I.Play}>Start this date</Button>
                <Button kind={saved.includes(picked.id) ? 'coral' : 'outline'} icon={I.Heart} onClick={() => toggleSave(picked.id)}>
                  {saved.includes(picked.id) ? 'Saved' : 'Save'}
                </Button>
                <Button kind="ghost" icon={I.Shuffle} onClick={spin}>Spin again</Button>
              </div>
            </Surface>
          ) : (
            <Surface className="p-7 flex flex-col items-center justify-center text-center min-h-[260px]">
              <I.Sparkle size={20} className="text-ink-400 mb-2" />
              <div className="font-serif-i text-2xl text-ink-900">spin to find one</div>
              <p className="text-[13.5px] text-ink-500 mt-2 max-w-xs">
                The wheel picks a category. We pick a date for you. You picked each other.
              </p>
            </Surface>
          )}
        </div>
      </div>

      {/* All ideas browser */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Browse all ideas</div>
            <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">low effort, high serotonin</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip tone="ink" selected={filter === 'All'} onClick={() => setFilter('All')} size="sm">All</Chip>
            {DATE_CATEGORIES.map(c => (
              <Chip key={c} tone={c === 'Music' ? 'lavender' : c === 'Food' ? 'butter' : c === 'Future' ? 'sage' : 'coral'} size="sm" selected={filter === c} onClick={() => setFilter(c)}>{c}</Chip>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(d => (
            <div key={d.id} className="rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4 hover:ring-ink-900/[0.18] transition-all">
              <div className="flex items-center justify-between gap-2">
                <Chip size="sm" tone={d.cat === 'Music' ? 'lavender' : d.cat === 'Food' ? 'butter' : d.cat === 'Future' ? 'sage' : 'coral'}>{d.cat}</Chip>
                <button onClick={() => toggleSave(d.id)} className={`w-7 h-7 rounded-full inline-flex items-center justify-center ${saved.includes(d.id) ? 'bg-coral-500 text-white' : 'bg-cream-200 text-ink-500 hover:text-ink-800'}`}>
                  <I.Heart size={13} />
                </button>
              </div>
              <div className="font-serif-i text-[19px] text-ink-900 leading-tight mt-3" style={{textWrap:'pretty'}}>{d.title}</div>
              <div className="text-[12px] text-ink-500 mt-2 flex items-center gap-2">
                <span>{d.duration}</span>
                <span className="text-ink-300">•</span>
                <span className="italic">{d.mood}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <I.Heart size={16} className="text-coral-500" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Saved for later</span>
          <span className="font-mono text-[11px] text-ink-400">{saved.length}</span>
        </div>
        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-900/15 p-6 text-center text-[13px] text-ink-500">
            Nothing saved yet — tap the heart on any idea.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {saved.map(id => {
              const d = DATE_IDEAS.find(x => x.id === id); if (!d) return null;
              return (
                <span key={id} className="inline-flex items-center gap-2 bg-white ring-1 ring-ink-900/[0.07] rounded-full pl-3 pr-1.5 py-1 text-[13px]">
                  <span className="text-ink-800">{d.title}</span>
                  <button onClick={() => toggleSave(id)} className="w-6 h-6 rounded-full hover:bg-cream-200 text-ink-500"><I.X size={12} /></button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

window.DateNight = DateNight;
