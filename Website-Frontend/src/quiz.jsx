/* Relationship Quiz — playable, multi-category, with results + add-question drawer. */

const FEEDBACK_OK = [
  'Yes. You pay attention.',
  'Correct — and very smug of you.',
  'Right. This is why we work.',
  'You knew. I saw you smile.',
];
const FEEDBACK_NO = [
  'Almost. Cute guess though.',
  'Not quite — but I love how your brain works.',
  'No, but I’ll let it slide.',
  'Wrong. We’ll workshop this on the next call.',
];

const ScoreRing = ({ score, total }) => {
  const r = 44, c = 2 * Math.PI * r;
  const pct = total ? score / total : 0;
  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#EADFC8" strokeWidth="6" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#DD7E66" strokeWidth="6"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 50 50)" style={{ transition:'stroke-dashoffset .6s ease' }} />
      <text x="50" y="54" textAnchor="middle" fontFamily="'Instrument Serif', serif" fontStyle="italic" fontSize="28" fill="#1C1814">
        {score}/{total}
      </text>
    </svg>
  );
};

/* Add-question drawer (mock) */
const AddQuestionDrawer = ({ open, onClose }) => {
  const [form, setForm] = useState({
    category: 'Memories', prompt: '', options: ['', '', '', ''], answer: 0,
  });
  const setOpt = (i, v) => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? v : o) }));
  return (
    <Modal open={open} onClose={onClose} maxW="max-w-xl">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Add a question (mock)</div>
          <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-1">A new tiny test</div>
          <p className="text-[13px] text-ink-500 mt-1.5">Saved locally for now. Will sync to Supabase later.</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[12px] text-ink-600 font-medium">Category</label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUIZ_CATEGORIES.map(c => (
              <Chip key={c} tone="coral" selected={form.category === c} onClick={() => setForm({ ...form, category: c })} size="sm">{c}</Chip>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[12px] text-ink-600 font-medium">Question</label>
          <input value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })}
            placeholder="e.g. What song would I send when I miss you?"
            className="mt-2 w-full h-11 px-3.5 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px]" />
        </div>
        <div>
          <label className="text-[12px] text-ink-600 font-medium">Answers (tap the dot to mark correct)</label>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {form.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => setForm({ ...form, answer: i })}
                  aria-label={`mark option ${i+1} as correct`}
                  className={`w-7 h-7 rounded-full ring-1 transition-all flex items-center justify-center shrink-0 ${form.answer === i ? 'bg-sage-500 ring-sage-500 text-white' : 'bg-white ring-ink-900/10 text-transparent'}`}
                >
                  <I.Check size={13} />
                </button>
                <input value={o} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${i+1}`}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-[12px] text-ink-400 font-mono">draft · not saved</span>
        <div className="flex items-center gap-2">
          <Button kind="ghost" onClick={onClose}>Cancel</Button>
          <Button kind="primary" icon={I.Check} onClick={onClose}>Save question</Button>
        </div>
      </div>
    </Modal>
  );
};

const QuizGame = () => {
  const [category, setCategory] = useState('All');
  const [step, setStep] = useState('intro');     // intro | playing | result
  const [idx, setIdx]   = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [drawer, setDrawer] = useState(false);

  const pool = useMemo(() => {
    return category === 'All' ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter(q => q.category === category);
  }, [category]);

  const total = pool.length;
  const q = pool[idx];
  const correct = picked != null && picked === q?.answer;

  const start = (cat) => {
    setCategory(cat);
    setIdx(0); setPicked(null); setScore(0); setStreak(0); setBestStreak(0);
    setStep('playing');
  };
  const pick = (i) => {
    if (picked != null) return;
    setPicked(i);
    if (i === q.answer) {
      setScore(s => s + 1);
      setStreak(s => { const n = s + 1; setBestStreak(b => Math.max(b, n)); return n; });
    } else {
      setStreak(0);
    }
  };
  const next = () => {
    if (idx + 1 >= total) { setStep('result'); return; }
    setIdx(idx + 1); setPicked(null);
  };
  const reset = () => { setStep('intro'); setIdx(0); setPicked(null); setScore(0); setStreak(0); setBestStreak(0); };

  /* ────── intro ────── */
  if (step === 'intro') {
    return (
      <div className="space-y-7 fade-up">
        <SectionHeader
          eyebrow="Game 01"
          title="Relationship Quiz"
          sub="Tiny questions, big evidence that you pay attention."
          right={<Button kind="outline" icon={I.Plus} onClick={() => setDrawer(true)}>Add a question</Button>}
        />

        <Surface className="p-6 sm:p-7">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Pick a category</div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Chip tone="ink" size="md" selected={category === 'All'} onClick={() => setCategory('All')}>All ({QUIZ_QUESTIONS.length})</Chip>
            {QUIZ_CATEGORIES.map(c => {
              const n = QUIZ_QUESTIONS.filter(q => q.category === c).length;
              const tone = c === 'Songs' ? 'lavender' : c === 'Inside Jokes' ? 'butter' : c === 'Future Plans' ? 'sage' : c === 'Deep Questions' ? 'lavender' : 'coral';
              return (
                <Chip key={c} tone={tone} size="md" selected={category === c} onClick={() => setCategory(c)}>
                  {c} <span className="opacity-60 ml-1 font-mono text-[11px]">{n}</span>
                </Chip>
              );
            })}
          </div>
          <Hair className="my-6" />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="font-serif-i text-3xl text-ink-900 leading-tight">
                {category === 'All' ? 'Everything we know about us' : category}
              </div>
              <p className="text-ink-500 text-[14px] mt-1.5 max-w-md">
                {category === 'Songs'
                  ? 'A few music-coded ones. Includes Billie nights and Anuv evenings.'
                  : 'No score pressure. Just attention, lightly tested.'}
              </p>
            </div>
            <Button kind="primary" size="lg" iconRight={I.Arrow} onClick={() => start(category)}>
              Start · {pool.length || QUIZ_QUESTIONS.length} questions
            </Button>
          </div>
        </Surface>

        <AddQuestionDrawer open={drawer} onClose={() => setDrawer(false)} />
      </div>
    );
  }

  /* ────── result ────── */
  if (step === 'result') {
    const pct = total ? score / total : 0;
    const msg = pct === 1
      ? 'Frankly, suspicious. Are you reading my mind?'
      : pct >= 0.7
      ? 'You’ve been paying attention. I noticed.'
      : pct >= 0.4
      ? 'Decent. We’ll review on the next call.'
      : 'We need a long walk and a long talk.';
    return (
      <div className="space-y-7 fade-up">
        <SectionHeader eyebrow="Round complete" title="The verdict" sub="A playful compatibility-ish score." />
        <Surface className="p-7 sm:p-10">
          <div className="grid sm:grid-cols-[auto,1fr] gap-8 items-center">
            <div className="flex justify-center"><ScoreRing score={score} total={total} /></div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{category} · {total} questions</div>
              <div className="font-serif-i text-4xl text-ink-900 leading-[1.05] mt-2">{msg}</div>
              <div className="flex flex-wrap gap-3 mt-5 text-[13px]">
                <Chip tone="coral" size="sm">best streak · {bestStreak}</Chip>
                <Chip tone="sage" size="sm">accuracy · {Math.round(pct*100)}%</Chip>
                <Chip tone="lavender" size="sm">category · {category}</Chip>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button kind="primary" icon={I.Play} onClick={reset}>Play again</Button>
                <Button kind="outline" icon={I.Send}>Send result to Anjali</Button>
              </div>
            </div>
          </div>
        </Surface>
      </div>
    );
  }

  /* ────── playing ────── */
  const progress = total ? ((idx + (picked != null ? 1 : 0)) / total) : 0;
  const feedback = picked == null ? null : (correct ? (q.ok || FEEDBACK_OK[idx % FEEDBACK_OK.length]) : (q.no || FEEDBACK_NO[idx % FEEDBACK_NO.length]));

  return (
    <div className="space-y-6 fade-up">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{category} · question {idx+1} of {total}</div>
          <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-0.5">Relationship Quiz</div>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="coral" size="sm">score · {score}</Chip>
          <Chip tone="butter" size="sm">streak · {streak}</Chip>
          <button onClick={reset} className="text-[12px] text-ink-500 hover:text-ink-800 underline-offset-2 hover:underline">Quit</button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-cream-300 rounded-full overflow-hidden">
        <div className="h-full bg-coral-500 rounded-full" style={{ width: `${progress*100}%`, transition:'width .35s ease' }} />
      </div>

      {/* Question */}
      <Surface className="p-6 sm:p-8">
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{q.category}</div>
        <h3 className="font-serif-i text-[28px] sm:text-4xl text-ink-900 leading-[1.1] mt-2.5 max-w-2xl" style={{textWrap:'pretty'}}>
          {q.prompt}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-7">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = picked != null && i === q.answer;
            const isWrongPick = picked != null && isPicked && !correct;
            const base = 'group text-left rounded-2xl ring-1 p-4 flex items-start gap-3 transition-all';
            let state = 'bg-white ring-ink-900/[0.07] hover:ring-ink-900/[0.18] hover:-translate-y-px';
            if (picked != null) {
              if (isCorrect) state = 'bg-sage-50 ring-sage-300';
              else if (isWrongPick) state = 'bg-coral-50 ring-coral-300';
              else state = 'bg-white ring-ink-900/[0.05] opacity-60';
            }
            return (
              <button key={i} onClick={() => pick(i)} disabled={picked != null} className={`${base} ${state}`}>
                <span className={`mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-[12px] shrink-0 ring-1 ${
                  isCorrect ? 'bg-sage-500 text-white ring-sage-500' :
                  isWrongPick ? 'bg-coral-500 text-white ring-coral-500' :
                  'bg-cream-200 text-ink-700 ring-ink-900/[0.06] group-hover:bg-cream-300'
                }`}>
                  {isCorrect ? <I.Check size={13} /> : isWrongPick ? <I.X size={13} /> : String.fromCharCode(65+i)}
                </span>
                <span className="text-[14.5px] text-ink-800 leading-snug" style={{textWrap:'pretty'}}>{opt}</span>
              </button>
            );
          })}
        </div>

        {picked != null && (
          <div className={`mt-6 rounded-2xl px-4 py-3.5 ring-1 fade-up ${correct ? 'bg-sage-50 ring-sage-200 text-sage-600' : 'bg-coral-50 ring-coral-200 text-coral-700'}`}>
            <div className="flex items-start gap-3">
              <span className="font-serif-i text-xl leading-none mt-0.5">{correct ? 'yes —' : 'almost —'}</span>
              <p className="text-[13.5px] leading-snug">{feedback}</p>
            </div>
          </div>
        )}
      </Surface>

      <div className="flex justify-between items-center">
        <span className="text-[12px] text-ink-400 font-mono">{idx+1} / {total}</span>
        <Button
          kind={picked != null ? 'primary' : 'soft'}
          iconRight={I.Arrow}
          disabled={picked == null}
          onClick={next}
        >
          {idx + 1 >= total ? 'See result' : 'Next question'}
        </Button>
      </div>
    </div>
  );
};

window.QuizGame = QuizGame;
