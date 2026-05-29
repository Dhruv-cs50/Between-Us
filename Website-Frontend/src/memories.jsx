/* Memories timeline — chronological, filters, featured + random pick. */

/* Memory modal — photo, note, and a Spotify embed for the linked song.
   If no spotify ID yet, surfaces a paste-link affordance.
   When `editable` (memory came from the DB), supports inline edit + delete. */
const MEMORY_TAG_OPTS = ['Calls', 'Visits', 'Firsts', 'Funny', 'Hard Moments', 'Future', 'Music'];
const tagTone = (t) => t === 'Music' ? 'lavender' : t === 'Funny' ? 'butter' : t === 'Hard Moments' ? 'coral' : t === 'Future' ? 'sage' : 'cream';

const MemoryModal = ({ m, onClose, editable, onChanged, coupleId }) => {
  const [linking, setLinking] = useState(false);
  const [override, setOverride] = useState({}); // memId -> trackId during this session
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', location: '', note: '', tags: [] });

  // Sync edit form whenever a different memory opens; reset edit mode.
  useEffect(() => {
    if (m) setForm({ title: m.title || '', date: m.date || '', location: m.location || '', note: m.note || '', tags: m.tags || [] });
    setEditing(false);
    setLinking(false);
    setFile(null);
  }, [m]);

  if (!m) return null;
  const trackId = override[m.id] || m.spotify?.trackId || null;

  const save = (id) => {
    setOverride(o => ({ ...o, [m.id]: id }));
    m.spotify = { trackId: id };          // mutate in place — survives navigation
    setLinking(false);
  };

  const toggleTag = (t) => setForm(f => ({
    ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]
  }));

  const saveEdit = async () => {
    setBusy(true);
    try {
      const fields = {
        title: form.title, date: form.date, location: form.location,
        note: form.note, tags: form.tags,
      };
      if (file && coupleId) {
        fields.img_path = await sbUploadPhoto(coupleId, m.id, file);
      }
      await sbUpdateMemory(m.id, fields);
      Object.assign(m, fields);          // mutate in place so the open modal reflects edits
      setFile(null);
      setEditing(false);
      onChanged?.();
    } catch (err) {
      console.error('Update memory failed', err);
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!window.confirm('Delete this memory? This can\'t be undone.')) return;
    setBusy(true);
    try {
      await sbDeleteMemory(m.id);
      onChanged?.();
      onClose();
    } catch (err) {
      console.error('Delete memory failed', err);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full h-11 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]';

  return (
    <Modal open={!!m} onClose={onClose} maxW="max-w-2xl" padding="p-0">
      <div className="grid grid-cols-1 sm:grid-cols-[1.1fr,1fr]">
        <PhotoBlock bg={m.bg} imgPath={m.img_path} className="aspect-[5/4] sm:aspect-auto sm:h-full" caption={String(m.date).toLowerCase()} />
        <div className="p-6 sm:p-7 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            {editing ? (
              <div className="flex-1 space-y-2.5">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className={inputCls} />
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className={inputCls} />
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{m.date}</div>
                <div className="font-serif-i text-3xl text-ink-900 leading-[1.05] mt-1" style={{textWrap:'pretty'}}>{m.title}</div>
                <div className="text-[12px] text-ink-500 mt-2 inline-flex items-center gap-1.5"><I.Pin size={11} /> {m.location}</div>
              </div>
            )}
            <div className="flex items-center gap-0.5 shrink-0">
              {editable && !editing && (
                <button onClick={() => setEditing(true)} title="Edit memory" className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.Pencil size={16} /></button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
            </div>
          </div>

          {editing ? (
            <>
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="What happened…" rows={3}
                className="w-full px-3 py-2.5 mt-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px] resize-none" />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {MEMORY_TAG_OPTS.map(t => (
                  <Chip key={t} size="sm" tone={form.tags.includes(t) ? 'coral' : 'cream'} selected={form.tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>
                ))}
              </div>
              <div className="mt-3">
                <div className="text-[11px] text-ink-500 mb-1.5">Photo (optional)</div>
                <PhotoPicker file={file} onPick={setFile} label={m.img_path ? 'Replace photo' : 'Add a photo'} />
              </div>
              <div className="flex items-center justify-between gap-2 mt-4">
                <Button kind="ghost" icon={I.Trash} onClick={del} disabled={busy} className="text-coral-600">Delete</Button>
                <div className="flex gap-2">
                  <Button kind="ghost" type="button" onClick={() => setEditing(false)} disabled={busy}>Cancel</Button>
                  <Button kind="primary" icon={I.Check} onClick={saveEdit} disabled={busy}>{busy ? 'saving…' : 'Save'}</Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[14px] text-ink-700 mt-3 leading-relaxed" style={{textWrap:'pretty'}}>{m.note}</p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {(m.tags || []).map(t => <Chip key={t} size="sm" tone={tagTone(t)}>{t}</Chip>)}
              </div>
            </>
          )}

          {/* Music for this memory */}
          {!editing && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium inline-flex items-center gap-1.5">
                <I.Music size={12} /> the song underneath
              </div>
              {!linking && (
                <button onClick={() => setLinking(true)} className="text-[12px] text-coral-600 hover:text-coral-700 inline-flex items-center gap-1">
                  {trackId ? 'change' : 'link a song'} <I.Arrow size={12} />
                </button>
              )}
            </div>
            {linking ? (
              <MemorySpotifyEditor memory={m} onSave={save} onCancel={() => setLinking(false)} />
            ) : trackId ? (
              <SpotifyEmbed trackId={trackId} height={152} />
            ) : (
              <div className="rounded-xl ring-1 ring-ink-900/[0.07] bg-cream-200 px-3.5 py-3 text-[12.5px] text-ink-600 italic">
                {m.song ? <>{m.song} — <span className="text-ink-500">no Spotify link yet. tap “link a song.”</span></> : 'no song linked.'}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const MemoryRow = ({ m, side, onOpen }) => (
  <div className={`relative grid grid-cols-[auto,1fr] sm:grid-cols-[1fr,auto,1fr] gap-4 items-start`}>
    {side === 'left' ? (
      <div className="hidden sm:block">
        <MemCard m={m} align="right" onOpen={onOpen} />
      </div>
    ) : <div className="hidden sm:block" />}

    <div className="relative flex flex-col items-center w-6 sm:w-auto">
      <span className="block w-px h-full bg-ink-900/[0.08] absolute top-0 bottom-0 left-1/2 -translate-x-1/2" />
      <span className="relative z-[1] w-3 h-3 rounded-full bg-coral-500 ring-4 ring-cream-100 mt-1" />
      <span className="font-mono text-[11px] text-ink-500 mt-2 whitespace-nowrap hidden sm:block">{m.date}</span>
    </div>

    {side === 'right' ? (
      <div><MemCard m={m} align="left" onOpen={onOpen} /></div>
    ) : (
      <div className="sm:hidden"><MemCard m={m} align="left" onOpen={onOpen} /></div>
    )}
    {side === 'left' && <div className="sm:hidden"><MemCard m={m} align="left" onOpen={onOpen} /></div>}
  </div>
);

const MemCard = ({ m, align = 'left', onOpen }) => (
  <button onClick={() => onOpen?.(m)} className="group text-left rounded-2xl ring-1 ring-ink-900/[0.07] bg-white p-4 hover:shadow-softer hover:ring-ink-900/[0.18] transition-all w-full">
    <div className="flex gap-3">
      <PhotoBlock bg={m.bg} imgPath={m.img_path} className="w-[88px] h-[88px] shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 sm:hidden">
          <span className="font-mono text-[11px] text-ink-500">{m.date}</span>
        </div>
        <div className="font-serif-i text-[20px] text-ink-900 leading-tight mt-0.5" style={{textWrap:'pretty'}}>{m.title}</div>
        <div className="text-[12px] text-ink-500 mt-1 inline-flex items-center gap-1.5"><I.Pin size={11} /> {m.location}</div>
        <p className="text-[13px] text-ink-700 mt-2 line-clamp-2" style={{textWrap:'pretty'}}>{m.note}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
          {(m.tags || []).map(t => <Chip key={t} size="sm" tone={t === 'Music' ? 'lavender' : t === 'Funny' ? 'butter' : t === 'Hard Moments' ? 'coral' : t === 'Future' ? 'sage' : 'cream'}>{t}</Chip>)}
          {m.song && <span className="inline-flex items-center gap-1 text-[12px] text-ink-500 italic"><I.Music size={11} /> {m.song}</span>}
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-ink-500 group-hover:text-ink-800">
          {m.song ? 'open & play' : 'open memory'} <I.Arrow size={12} />
        </div>
      </div>
    </div>
  </button>
);

const FeaturedMemory = ({ m, onShuffle, onOpen }) => (
  <Surface className="p-0 overflow-hidden">
    <div className="grid grid-cols-1 sm:grid-cols-[1.1fr,1fr]">
      <button onClick={() => onOpen(m)} className="block text-left">
        <PhotoBlock bg={m.bg} imgPath={m.img_path} className="aspect-[5/3] sm:aspect-auto sm:h-full" caption={`featured · ${m.date.toLowerCase()}`} />
      </button>
      <div className="p-6 sm:p-7 flex flex-col">
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Featured memory</div>
        <div className="font-serif-i text-[28px] sm:text-[32px] text-ink-900 leading-[1.05] mt-1.5">{m.title}</div>
        <div className="text-[12px] text-ink-500 mt-2 inline-flex items-center gap-1.5"><I.Pin size={12} /> {m.location} · {m.date}</div>
        <p className="text-[14px] text-ink-700 mt-3 leading-relaxed" style={{textWrap:'pretty'}}>{m.note}</p>
        {m.song && <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-lavender-600 italic"><I.Music size={13} /> {m.song}</div>}
        <div className="mt-auto pt-5 flex items-center gap-2 flex-wrap">
          <Button kind="primary" icon={I.Play} onClick={() => onOpen(m)}>Open & play</Button>
          <Button kind="outline" icon={I.Shuffle} onClick={onShuffle}>Random memory</Button>
        </div>
      </div>
    </div>
  </Surface>
);

const AddMemoryModal = ({ open, onClose, coupleId, onAdded }) => {
  const [form, setForm] = useState({ title: '', date: '', location: '', note: '', tags: [] });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const allTags = ['Calls', 'Visits', 'Firsts', 'Funny', 'Hard Moments', 'Future', 'Music'];

  const toggleTag = (t) => setForm(f => ({
    ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]
  }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const memory = await sbAddMemory(coupleId, {
        title: form.title, date: form.date, location: form.location,
        note: form.note, tags: form.tags,
        bg: 'linear-gradient(135deg, #F4ECDD, #EADFC8)',
      });
      if (file) {
        const imgPath = await sbUploadPhoto(coupleId, memory.id, file);
        await sbUpdateMemory(memory.id, { img_path: imgPath });
      }
      setForm({ title: '', date: '', location: '', note: '', tags: [] });
      setFile(null);
      onAdded();
      onClose();
    } catch (err) {
      console.error('Add memory failed', err);
    } finally {
      setSaving(false);
    }
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
          placeholder="Title" className="w-full h-11 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="h-11 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
          <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="Location" className="h-11 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]" />
        </div>
        <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          placeholder="What happened…" rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px] resize-none" />
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
          <PhotoPicker file={file} onPick={setFile} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button kind="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button kind="primary" icon={I.Plus} disabled={saving}>{saving ? 'saving…' : 'Add memory'}</Button>
        </div>
      </form>
    </Modal>
  );
};

const MemoriesTimeline = ({ coupleId }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState('All');
  const [featured, setFeatured] = useState(null);
  const [opened, setOpened] = useState(null);
  const [adding, setAdding] = useState(false);

  const reload = () => {
    if (!coupleId) { setLoading(false); return; }
    sbFetchMemories(coupleId).then(data => {
      setMemories(data);
      // Keep current featured if it still exists; otherwise pick the newest.
      setFeatured(prev => {
        if (!data.length) return null;
        const still = prev && data.find(d => d.id === prev.id);
        return still || data[0];
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [coupleId]);

  // All hooks before any conditional return
  const allMemories = memories.length ? memories : MEMORIES;
  const filtered = useMemo(() => {
    return tag === 'All' ? allMemories : allMemories.filter(m => (m.tags || []).includes(tag));
  }, [tag, allMemories]);
  const ordered = useMemo(() => [...filtered].sort((a, b) => {
    if (a.date === 'Someday') return 1; if (b.date === 'Someday') return -1;
    return new Date(b.date) - new Date(a.date);
  }), [filtered]);
  const displayFeatured = featured || allMemories[0];

  const shuffle = () => {
    const pool = allMemories.filter(m => m.date !== 'Someday');
    setFeatured(pool[Math.floor(Math.random() * pool.length)]);
  };

  if (loading) return <PageSkeleton rows={5} />;

  return (
    <div className="space-y-6 fade-up">
      <SectionHeader
        eyebrow="Together so far"
        title="Memories"
        sub="Proof that distance still made room for us."
        right={<Button kind="primary" icon={I.Plus} onClick={() => setAdding(true)}>Add memory</Button>}
      />

      {displayFeatured && <FeaturedMemory m={displayFeatured} onShuffle={shuffle} onOpen={setOpened} />}

      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="ink" size="sm" selected={tag === 'All'} onClick={() => setTag('All')}>All</Chip>
        {(MEMORY_TAGS || ['Calls','Visits','Firsts','Funny','Hard Moments','Future','Music']).map(t => {
          const n = allMemories.filter(m => (m.tags||[]).includes(t)).length;
          const tone = t === 'Music' ? 'lavender' : t === 'Funny' ? 'butter' : t === 'Hard Moments' ? 'coral' : t === 'Future' ? 'sage' : 'cream';
          return <Chip key={t} size="sm" tone={tone} selected={tag === t} onClick={() => setTag(t)}>{t} <span className="opacity-60 font-mono text-[11px] ml-1">{n}</span></Chip>;
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="space-y-5 sm:space-y-7">
          {ordered.map((m, i) => (
            <MemoryRow key={m.id} m={m} side={i % 2 === 0 ? 'right' : 'left'} onOpen={setOpened} />
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <Surface className="p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,1.4fr]">
          <div className="p-6 sm:p-7">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Where it happened</div>
            <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-1.5">Two pins, one story</div>
            <p className="text-[13.5px] text-ink-600 mt-2">Bengaluru ↔ San Francisco, with a few in-between cities.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-[13px]"><span className="w-1.5 h-1.5 rounded-full bg-coral-500" /> Anjali · Bengaluru, IN</div>
              <div className="flex items-center gap-2 text-[13px]"><span className="w-1.5 h-1.5 rounded-full bg-lavender-500" /> Dhruv · San Francisco, CA</div>
            </div>
          </div>
          <div className="relative h-[200px] sm:h-auto min-h-[200px] overflow-hidden">
            {/* dotted map placeholder */}
            <div className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #F4ECDD 0%, #EADFC8 100%)',
                backgroundImage: 'radial-gradient(rgba(28,24,20,0.12) 1px, transparent 1.4px), linear-gradient(135deg, #F4ECDD 0%, #EADFC8 100%)',
                backgroundSize: '8px 8px, 100% 100%',
              }} />
            {/* Arc */}
            <svg viewBox="0 0 600 240" className="absolute inset-0 w-full h-full">
              <path d="M70,180 Q300,20 530,150" fill="none" stroke="#DD7E66" strokeWidth="1.5" strokeDasharray="3 4" />
              <circle cx="70"  cy="180" r="5" fill="#DD7E66" />
              <circle cx="530" cy="150" r="5" fill="#9E8FBE" />
              <text x="70"  y="200" fontSize="11" fill="#3D352D" fontFamily="'Geist Mono'" textAnchor="middle">BLR</text>
              <text x="530" y="170" fontSize="11" fill="#3D352D" fontFamily="'Geist Mono'" textAnchor="middle">SFO</text>
            </svg>
          </div>
        </div>
      </Surface>

      <MemoryModal
        m={opened}
        onClose={() => setOpened(null)}
        editable={memories.length > 0}
        onChanged={reload}
        coupleId={coupleId}
      />
      <AddMemoryModal open={adding} onClose={() => setAdding(false)} coupleId={coupleId} onAdded={reload} />
    </div>
  );
};

Object.assign(window, { MemoriesTimeline, AddMemoryModal });
