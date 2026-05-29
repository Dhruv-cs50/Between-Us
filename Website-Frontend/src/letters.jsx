/* Open When Letters — envelope grid, modal reader, locked/unlocked states. */

const toneRing = {
  coral:    'bg-coral-50 ring-coral-200/70',
  lavender: 'bg-lavender-50 ring-lavender-200/70',
  sage:     'bg-sage-50 ring-sage-200/70',
  butter:   'bg-[#FBF1D6] ring-[#E8C880]/70',
};
const toneFlap = {
  coral:    '#F7DFD2',
  lavender: '#E5DEF0',
  sage:     'rgb(220,231,221)',
  butter:   '#F4E2B8',
};
const toneStamp = {
  coral:    'bg-coral-500',
  lavender: 'bg-lavender-500',
  sage:     'bg-sage-500',
  butter:   'bg-[#E8B647]',
};

const Envelope = ({ l, onOpen }) => (
  <button
    onClick={() => !l.locked && onOpen(l)}
    className={`group relative text-left rounded-2xl ring-1 transition-all overflow-hidden ${toneRing[l.tone] || toneRing.coral} hover:-translate-y-0.5 hover:shadow-soft`}
    style={{ minHeight: 196 }}
  >
    {/* Envelope flap */}
    <svg viewBox="0 0 200 80" className="absolute top-0 left-0 right-0 w-full h-20 pointer-events-none" preserveAspectRatio="none">
      <path d="M0,0 L100,55 L200,0 L200,80 L0,80 Z" fill={toneFlap[l.tone] || toneFlap.coral} />
      <path d="M0,0 L100,55 L200,0" fill="none" stroke="rgba(28,24,20,0.06)" />
    </svg>
    {/* Wax / stamp */}
    <span className={`absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full ${toneStamp[l.tone]} text-white shadow-softer ring-2 ring-white/70`}>
      {l.locked ? <I.Lock size={14} /> : <I.Unlock size={14} />}
    </span>

    <div className="relative p-5 pt-24">
      <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{l.category}</div>
      <div className="font-serif-i text-[22px] text-ink-900 leading-[1.1] mt-1.5" style={{textWrap:'pretty'}}>
        {l.locked ? 'Sealed for later' : 'A letter inside'}
      </div>
      <div className="flex items-center justify-between mt-4 text-[12px] text-ink-600">
        <span className="font-mono">{l.written}</span>
        <span className="inline-flex items-center gap-1.5">
          <Avatar initial={l.author[0]} tone={l.author === 'Dhruv' ? 'coral' : 'lavender'} size={20} />
          {l.author} → {l.recipient}
        </span>
      </div>
      <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-ink-700 opacity-80 group-hover:opacity-100">
        {l.locked ? 'sealed · unlocks on the day' : 'open the letter'}
        {!l.locked ? <I.Arrow size={13} /> : null}
      </div>
    </div>
  </button>
);

const LetterModal = ({ letter, onClose }) => {
  if (!letter) return null;
  return (
    <Modal open={!!letter} onClose={onClose} maxW="max-w-xl" padding="p-0">
      <div className="flex items-start justify-between p-6 pb-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{letter.category}</div>
          <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-1">For {letter.recipient}</div>
          <div className="text-[12px] text-ink-500 mt-1.5 font-mono">written {letter.written} · by {letter.author}</div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
      </div>
      <div className="px-6">
        <div className={`rounded-2xl p-6 sm:p-7 relative ${toneRing[letter.tone]} ring-1`}>
          <div className="absolute -top-2 left-6 h-5 w-16 rotate-[-3deg] bg-white/80 rounded-sm shadow-softer" />
          <p className="font-serif-i text-[19px] leading-[1.55] text-ink-900 whitespace-pre-line" style={{textWrap:'pretty'}}>
            {letter.body}
          </p>
          <div className="mt-6 flex items-center justify-between text-[12px] text-ink-500">
            <span>— {letter.author}</span>
            <span className="font-mono">{letter.written}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 p-6 pt-5">
        <Button kind="ghost" icon={I.Heart}>Save this feeling</Button>
        <Button kind="primary" icon={I.Send}>Reply with a song</Button>
      </div>
    </Modal>
  );
};

// author is whichever partner is NOT the recipient; tone follows their accent.
const partnerAccent = (name) => (name === COUPLE.partner_b.name ? 'lavender' : 'coral');
const otherPartner = (name) => (name === COUPLE.partner_a.name ? COUPLE.partner_b.name : COUPLE.partner_a.name);

const AddLetterModal = ({ open, onClose, coupleId, onAdd }) => {
  const [category, setCategory] = useState(LETTER_CATEGORIES[0]);
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState(COUPLE.partner_b.name);
  const [sealed, setSealed] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setCategory(LETTER_CATEGORIES[0]);
      setBody('');
      setRecipient(COUPLE.partner_b.name);
      setSealed(true);
    }
  }, [open]);

  const save = async () => {
    if (!body.trim()) return;
    setSaving(true);
    const author = otherPartner(recipient);
    const written = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const fields = {
      category, author, recipient,
      written, locked: sealed, tone: partnerAccent(author),
      body: body.trim(),
    };
    if (coupleId) {
      const saved = await sbAddLetter(coupleId, fields).catch(() => null);
      onAdd(saved || { ...fields, id: String(Date.now()) });
    } else {
      onAdd({ ...fields, id: String(Date.now()) });
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-lg">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">New letter</div>
          <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-1">Write something to come back to</div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[12px] text-ink-600 font-medium">For when</label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LETTER_CATEGORIES.map(c => (
              <Chip key={c} tone="coral" size="sm" selected={category === c} onClick={() => setCategory(c)}>{c}</Chip>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[12px] text-ink-600 font-medium">Letter</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            placeholder="Start anywhere…"
            className="mt-2 w-full px-3.5 py-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px] resize-none leading-relaxed"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            className="h-11 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px]"
          >
            <option value={COUPLE.partner_b.name}>For {COUPLE.partner_b.name}</option>
            <option value={COUPLE.partner_a.name}>For {COUPLE.partner_a.name}</option>
          </select>
          <select
            value={sealed ? 'sealed' : 'open'}
            onChange={e => setSealed(e.target.value === 'sealed')}
            className="h-11 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px]"
          >
            <option value="sealed">Seal until they open it</option>
            <option value="open">Leave it open now</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6">
        <Button kind="ghost" onClick={onClose}>Cancel</Button>
        <Button kind="primary" icon={sealed ? I.Lock : I.Send} onClick={save} disabled={!body.trim() || saving}>
          {saving ? 'Saving…' : (sealed ? 'Seal letter' : 'Save letter')}
        </Button>
      </div>
    </Modal>
  );
};

const LettersPage = ({ coupleId }) => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(null);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    if (!coupleId) { setLoading(false); return; }
    sbFetchLetters(coupleId).then(data => {
      setLetters(data.length ? data : LETTERS);
      setLoading(false);
    }).catch(() => { setLetters(LETTERS); setLoading(false); });
  }, [coupleId]);

  const handleAdd = (letter) => {
    setLetters(prev => [letter, ...(prev.length ? prev : [])]);
  };

  // All hooks before conditional return
  const allLetters = letters.length ? letters : LETTERS;
  const visible = useMemo(() => tab === 'All' ? allLetters : allLetters.filter(l => l.category === tab), [tab, allLetters]);
  const unlockedCount = allLetters.filter(l => !l.locked).length;

  if (loading) return <PageSkeleton rows={4} />;

  return (
    <div className="space-y-6 fade-up">
      <SectionHeader
        eyebrow="Open When"
        title="Open When Letters"
        sub="For the moments one text is not enough."
        right={<Button kind="primary" icon={I.Plus} onClick={() => setAdding(true)}>Write a letter</Button>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="ink" size="sm" selected={tab === 'All'} onClick={() => setTab('All')}>All ({allLetters.length})</Chip>
        {LETTER_CATEGORIES.map(c => {
          const n = allLetters.filter(l => l.category === c).length;
          if (!n) return null;
          return <Chip key={c} tone="coral" size="sm" selected={tab === c} onClick={() => setTab(c)}>{c} <span className="opacity-60 font-mono text-[11px] ml-1">{n}</span></Chip>;
        })}
        <span className="ml-auto text-[12px] text-ink-500"><span className="font-mono">{unlockedCount}</span> unlocked · <span className="font-mono">{allLetters.length - unlockedCount}</span> sealed</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(l => <Envelope key={l.id} l={l} onOpen={setReading} />)}
        {/* add-new tile */}
        <button onClick={() => setAdding(true)} className="rounded-2xl border-2 border-dashed border-ink-900/15 hover:border-ink-900/30 p-5 flex flex-col items-center justify-center min-h-[196px] text-ink-600 hover:text-ink-900 transition-all">
          <I.Plus size={20} />
          <div className="font-serif-i text-xl mt-2">a new letter</div>
          <div className="text-[12px] text-ink-500 mt-1">for next time, or later</div>
        </button>
      </div>

      <LetterModal letter={reading} onClose={() => setReading(null)} />
      <AddLetterModal open={adding} onClose={() => setAdding(false)} coupleId={coupleId} onAdd={handleAdd} />
    </div>
  );
};

window.LettersPage = LettersPage;
