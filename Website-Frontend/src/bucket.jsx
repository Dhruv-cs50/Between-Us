/* Bucket list — sections + status, filter, add (mock). */

const STATUS_TONES = {
  Dreaming: { chip:'lavender', dot:'bg-lavender-500' },
  Planned:  { chip:'butter',   dot:'bg-[#E8B647]' },
  Done:     { chip:'sage',     dot:'bg-sage-500' },
};

const SECTION_TONES = {
  'Places to go':     'coral',
  'Food to try':      'butter',
  'Little rituals':   'lavender',
  'Future home':      'sage',
  'Songs to share':   'lavender',
  'Silly goals':      'butter',
};

const BucketRow = ({ item, onCycle }) => {
  const tone = STATUS_TONES[item.status];
  return (
    <div className="rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4 sm:p-5 hover:shadow-softer transition-all">
      <div className="flex items-start gap-4">
        <button onClick={() => onCycle(item.id)} aria-label="cycle status"
          className={`mt-0.5 shrink-0 w-7 h-7 rounded-full ring-1 inline-flex items-center justify-center transition-all ${
            item.status === 'Done' ? 'bg-sage-500 text-white ring-sage-500'
            : item.status === 'Planned' ? 'bg-white text-[#8A6A1D] ring-[#E8C880]'
            : 'bg-white text-ink-400 ring-ink-900/15'
          }`}>
          {item.status === 'Done' ? <I.Check size={14} /> : item.status === 'Planned' ? <I.Calendar size={13} /> : <span className="block w-2 h-2 rounded-full bg-lavender-400" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip size="sm" tone={SECTION_TONES[item.section] || 'cream'}>{item.section}</Chip>
            <Chip size="sm" tone={tone.chip}>{item.status}</Chip>
            <span className="text-[12px] text-ink-500 ml-auto">added by <span className="font-medium text-ink-700">{item.addedBy}</span></span>
          </div>
          <div className={`font-serif-i text-[20px] sm:text-[22px] leading-tight mt-2 ${item.status === 'Done' ? 'text-ink-500 line-through decoration-1' : 'text-ink-900'}`} style={{textWrap:'pretty'}}>
            {item.title}
          </div>
          <div className="text-[13px] text-ink-600 mt-1.5" style={{textWrap:'pretty'}}>{item.note}</div>
        </div>
      </div>
    </div>
  );
};

const AddBucketModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} maxW="max-w-lg">
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Add to bucket list (mock)</div>
        <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-1">A new someday</div>
      </div>
      <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
    </div>
    <div className="space-y-3">
      <input placeholder="e.g. Watch a meteor shower somewhere quiet" className="w-full h-11 px-3.5 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px]" />
      <div className="flex flex-wrap gap-1.5">
        {BUCKET_SECTIONS.map(s => <Chip key={s} tone={SECTION_TONES[s] || 'cream'} size="sm">{s}</Chip>)}
      </div>
      <textarea rows={3} placeholder="A note for future us…" className="w-full px-3.5 py-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px] resize-none" />
      <div className="flex flex-wrap gap-1.5">
        {BUCKET_STATUSES.map(s => <Chip key={s} tone={STATUS_TONES[s].chip} size="sm">{s}</Chip>)}
      </div>
    </div>
    <div className="flex items-center justify-end gap-2 mt-5">
      <Button kind="ghost" onClick={onClose}>Cancel</Button>
      <Button kind="primary" icon={I.Plus} onClick={onClose}>Add to list</Button>
    </div>
  </Modal>
);

const BucketList = () => {
  const [items, setItems] = useState(() => BUCKET_ITEMS.map(b => ({ ...b })));
  const [filter, setFilter] = useState('All');
  const [status, setStatus] = useState('All');
  const [adding, setAdding] = useState(false);

  const cycle = (id) => {
    const order = ['Dreaming', 'Planned', 'Done'];
    setItems(items.map(b => b.id === id ? { ...b, status: order[(order.indexOf(b.status) + 1) % order.length] } : b));
  };

  const visible = items.filter(b =>
    (filter === 'All' || b.section === filter) &&
    (status === 'All' || b.status === status)
  );

  const completed = items.filter(b => b.status === 'Done');
  const pct = Math.round((completed.length / items.length) * 100);

  return (
    <div className="space-y-6 fade-up">
      <SectionHeader
        eyebrow="Someday list"
        title="Bucket List"
        sub="Things we are saving for the same someday."
        right={<Button kind="primary" icon={I.Plus} onClick={() => setAdding(true)}>Add to list</Button>}
      />

      {/* Progress */}
      <Surface className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Progress</div>
            <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">
              <span className="text-coral-500">{completed.length}</span> of {items.length} done
            </div>
          </div>
          <div className="flex items-center gap-2">
            {BUCKET_STATUSES.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 text-[12px] text-ink-600">
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_TONES[s].dot}`} />
                {s} <span className="font-mono text-ink-400">{items.filter(b => b.status === s).length}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 h-1.5 bg-cream-300 rounded-full overflow-hidden">
          <div className="h-full bg-coral-500 rounded-full" style={{ width: `${pct}%`, transition:'width .35s ease' }} />
        </div>
      </Surface>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          <Chip size="sm" tone="ink" selected={filter === 'All'} onClick={() => setFilter('All')}>All sections</Chip>
          {BUCKET_SECTIONS.map(s => {
            const n = items.filter(b => b.section === s).length;
            return <Chip key={s} size="sm" tone={SECTION_TONES[s] || 'cream'} selected={filter === s} onClick={() => setFilter(s)}>{s} <span className="opacity-60 font-mono text-[11px] ml-1">{n}</span></Chip>;
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip size="sm" tone="ink" selected={status === 'All'} onClick={() => setStatus('All')}>Any status</Chip>
          {BUCKET_STATUSES.map(s => <Chip key={s} size="sm" tone={STATUS_TONES[s].chip} selected={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-900/15 p-8 text-center">
          <div className="font-serif-i text-2xl text-ink-700">nothing here yet</div>
          <p className="text-[13px] text-ink-500 mt-1.5">No items match these filters — try clearing one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visible.map(item => <BucketRow key={item.id} item={item} onCycle={cycle} />)}
        </div>
      )}

      {/* Completed strip */}
      {completed.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-2">Already done</div>
          <div className="flex flex-wrap gap-2">
            {completed.map(c => (
              <span key={c.id} className="inline-flex items-center gap-2 bg-sage-50 ring-1 ring-sage-200/70 rounded-full pl-3 pr-3.5 py-1 text-[13px] text-sage-600">
                <I.Check size={13} /> <span className="text-ink-800">{c.title}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <AddBucketModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
};

window.BucketList = BucketList;
