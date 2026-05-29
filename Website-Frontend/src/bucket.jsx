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

const BucketRow = ({ item, onCycle, onEdit, editable }) => {
  const tone = STATUS_TONES[item.status];
  return (
    <div className="group rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4 sm:p-5 hover:shadow-softer transition-all">
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
            {editable && (
              <button onClick={() => onEdit(item)} aria-label="edit item" title="Edit"
                className="p-1.5 -mr-1 rounded-full text-ink-400 hover:text-ink-700 hover:bg-cream-200 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <I.Pencil size={14} />
              </button>
            )}
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

const BucketModal = ({ open, onClose, coupleId, item, onSaved, onDeleted }) => {
  const editMode = !!item;
  const [title, setTitle] = useState('');
  const [section, setSection] = useState(BUCKET_SECTIONS[0]);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Dreaming');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) { setTitle(item.title); setSection(item.section); setNote(item.note || ''); setStatus(item.status); }
    else { setTitle(''); setNote(''); setSection(BUCKET_SECTIONS[0]); setStatus('Dreaming'); }
  }, [open, item]);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const fields = { title: title.trim(), section, note: note.trim(), status };
    if (editMode) {
      if (coupleId) await sbUpdateBucketItem(item.id, fields).catch(() => {});
      onSaved({ ...item, ...fields });
    } else {
      const full = { ...fields, addedBy: 'Dhruv' };
      if (coupleId) {
        const saved = await sbAddBucketItem(coupleId, full).catch(() => null);
        onSaved(saved || { ...full, id: String(Date.now()) });
      } else {
        onSaved({ ...full, id: String(Date.now()) });
      }
    }
    setSaving(false);
    onClose();
  };

  const del = async () => {
    if (!window.confirm('Remove this from the list? This can\'t be undone.')) return;
    setSaving(true);
    if (coupleId) await sbDeleteBucketItem(item.id).catch(() => {});
    onDeleted(item.id);
    setSaving(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-lg">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{editMode ? 'Edit bucket item' : 'Add to bucket list'}</div>
          <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-1">{editMode ? 'Tend a someday' : 'A new someday'}</div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
      </div>
      <div className="space-y-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Watch a meteor shower somewhere quiet"
          className="w-full h-11 px-3.5 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px]"
        />
        <div className="flex flex-wrap gap-1.5">
          {BUCKET_SECTIONS.map(s => (
            <Chip key={s} tone={SECTION_TONES[s] || 'cream'} size="sm" selected={section === s} onClick={() => setSection(s)}>{s}</Chip>
          ))}
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="A note for future us…"
          className="w-full px-3.5 py-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px] resize-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {BUCKET_STATUSES.map(s => (
            <Chip key={s} tone={STATUS_TONES[s].chip} size="sm" selected={status === s} onClick={() => setStatus(s)}>{s}</Chip>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-5">
        {editMode
          ? <Button kind="ghost" icon={I.Trash} onClick={del} disabled={saving} className="text-coral-600">Delete</Button>
          : <span />}
        <div className="flex gap-2">
          <Button kind="ghost" onClick={onClose}>Cancel</Button>
          <Button kind="primary" icon={editMode ? I.Check : I.Plus} onClick={save} disabled={!title.trim() || saving}>
            {saving ? 'Saving…' : (editMode ? 'Save' : 'Add to list')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const BucketList = ({ coupleId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalItem, setModalItem] = useState(undefined); // undefined=closed, null=add, object=edit
  const [dbBacked, setDbBacked] = useState(false);

  const reload = () => {
    if (!coupleId) { setItems(BUCKET_ITEMS.map(b => ({ ...b }))); setDbBacked(false); setLoading(false); return; }
    sbFetchBucketItems(coupleId).then(data => {
      setDbBacked(data.length > 0);
      setItems(data.length ? data : BUCKET_ITEMS.map(b => ({ ...b })));
      setLoading(false);
    }).catch(() => { setItems(BUCKET_ITEMS.map(b => ({ ...b }))); setDbBacked(false); setLoading(false); });
  };

  useEffect(() => { reload(); }, [coupleId]);

  if (loading) return <PageSkeleton rows={6} />;

  const cycle = async (id) => {
    const order = ['Dreaming', 'Planned', 'Done'];
    const item = items.find(b => b.id === id);
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    setItems(items.map(b => b.id === id ? { ...b, status: next } : b));
    if (coupleId) await sbUpdateBucketStatus(id, next);
  };

  const upsertItem = (item) => {
    setDbBacked(true);
    setItems(prev => prev.some(b => b.id === item.id) ? prev.map(b => b.id === item.id ? item : b) : [item, ...prev]);
  };
  const removeItem = (id) => setItems(prev => prev.filter(b => b.id !== id));

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
        right={<Button kind="primary" icon={I.Plus} onClick={() => setModalItem(null)}>Add to list</Button>}
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
          {visible.map(item => <BucketRow key={item.id} item={item} onCycle={cycle} onEdit={setModalItem} editable={dbBacked} />)}
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

      <BucketModal
        open={modalItem !== undefined}
        onClose={() => setModalItem(undefined)}
        coupleId={coupleId}
        item={modalItem || null}
        onSaved={upsertItem}
        onDeleted={removeItem}
      />
    </div>
  );
};

window.BucketList = BucketList;
