/* Music — Spotify embed integration, shuffler, two-zone clocks.
   Uses Spotify's public iframe player (no API key, no auth).
   Library is editable in the UI and persisted to localStorage. */

const LS_KEY = 'between-us::music';

/* Default seed — titles + artist only. trackId starts null; user pastes a
   Spotify share link to populate. We try to provide some IDs as best-guesses;
   if any are wrong, the embed shows "track not available" and the user can
   replace via the Edit library modal. */
const DEFAULT_MUSIC = {
  billie: [
    { title: 'what was I made for?', trackId: '5jhJur5n4fasblLSCOcrTQ' },
    { title: 'TV',                   trackId: '0QZ5yyl6B6utIWkxeBDxQN' },
    { title: 'ocean eyes',           trackId: '7tfvuLgK0RcRGd16C9obwq' },
    { title: 'BIRDS OF A FEATHER',   trackId: '6dOtVTDdiauQNBQEDOtlAB' },
    { title: 'lovely (with Khalid)', trackId: '0u2P5u6lvoDfwTYjAADbn4' },
  ],
  anuv: [
    { title: 'Husn',       trackId: '3aJrwHbqRRq0PEjL7Vw9Ah' },
    { title: 'Baarishein', trackId: '36J9D0Le3RrxJYIaesGEZL' },
    { title: 'Gul',        trackId: '5Vh8XDvUlMcBJqaIjAtROC' },
    { title: 'Mishri',     trackId: '4cv2BVl9YbsHzbXgQy3Eqz' },
    { title: 'Antaraa',    trackId: null },
  ],
  shared: {
    playlists: [
      { id: '32dnalb3dfsDvgcJR9U32c', name: 'Ours · D \u2194 A' },
      { id: '37i9dQZF1EJKcLqJBajNcu', name: 'Daily mood (Spotify)' },
    ],
  },
};

/* Spotify share/URI parser. Accepts:
   - https://open.spotify.com/track/<id>?si=...
   - https://open.spotify.com/playlist/<id>?si=...
   - spotify:track:<id>
   - bare <id> (22 chars, base62)
*/
const parseSpotify = (input) => {
  if (!input) return { kind: null, id: null };
  const s = String(input).trim();
  const m = s.match(/(track|playlist|album|episode)[\/:]([a-zA-Z0-9]{16,32})/);
  if (m) return { kind: m[1], id: m[2] };
  if (/^[a-zA-Z0-9]{22}$/.test(s)) return { kind: 'track', id: s };
  return { kind: null, id: null };
};

/* localStorage-backed library with migration from old single-playlist format */
const migrate = (lib) => {
  if (!lib || !lib.shared) return DEFAULT_MUSIC;
  // Old shape: shared: { name, playlistId } → new shape: shared: { playlists: [] }
  if (!Array.isArray(lib.shared.playlists)) {
    const old = lib.shared;
    lib = {
      ...lib,
      shared: {
        playlists: old.playlistId
          ? [{ id: old.playlistId, name: old.name || 'Our shared playlist' }, ...DEFAULT_MUSIC.shared.playlists]
          : DEFAULT_MUSIC.shared.playlists,
      },
    };
  }
  return lib;
};
const loadLibrary = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return migrate({ ...DEFAULT_MUSIC, ...JSON.parse(raw) });
  } catch (e) {}
  return DEFAULT_MUSIC;
};
const saveLibrary = (lib) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(lib)); } catch (e) {}
};

/* React hook so multiple components stay in sync */
const musicListeners = new Set();
const useMusicLibrary = () => {
  const [lib, setLib] = useState(loadLibrary);
  useEffect(() => {
    const l = (newLib) => setLib(newLib);
    musicListeners.add(l);
    return () => musicListeners.delete(l);
  }, []);
  const update = (next) => {
    const merged = typeof next === 'function' ? next(lib) : next;
    saveLibrary(merged);
    musicListeners.forEach(fn => fn(merged));
  };
  return [lib, update];
};

/* Spotify embed iframe — works on HTTPS (production). */
const SpotifyEmbed = ({ trackId, playlistId, height = 152, theme = 0, className = '' }) => {
  if (!trackId && !playlistId) {
    return (
      <div className={`rounded-xl ring-1 ring-ink-900/[0.07] bg-cream-200 px-3.5 py-3 flex items-center gap-2.5 text-[12px] text-ink-500 ${className}`}>
        <I.Music size={14} className="text-ink-400" />
        <span className="font-mono">no track linked yet — paste a Spotify link to play.</span>
      </div>
    );
  }
  const path = trackId ? `track/${trackId}` : `playlist/${playlistId}`;
  return (
    <iframe
      title="Spotify player"
      src={`https://open.spotify.com/embed/${path}?utm_source=generator&theme=${theme}`}
      style={{ borderRadius: 12, border: 0 }}
      width="100%"
      height={height}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className={className}
    />
  );
};

/* Two-zone clocks for the top bar */
const TwoClocks = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
  const fmt = (tz) => now.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true });
  const part = (label, tz, dot) => (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-ink-400 uppercase tracking-[0.14em] text-[10px]">{label}</span>
      <span className="font-mono tabular-nums text-ink-700">{fmt(tz)}</span>
    </span>
  );
  return (
    <div className="inline-flex items-center gap-3 text-[12px]">
      {part('SF',  'America/Los_Angeles', 'bg-coral-500')}
      <span className="text-ink-300">/</span>
      {part('BLR', 'Asia/Kolkata',        'bg-lavender-500')}
    </div>
  );
};

/* The "current pick" lives in module scope so Home + Memory modals can read it */
const useCurrentTrack = (initial = null) => {
  const [pick, setPick] = useState(initial);
  return [pick, setPick];
};

/* Edit-library modal: paste Spotify links per song & for the shared playlist */
const EditLibraryModal = ({ open, onClose }) => {
  const [lib, setLib] = useMusicLibrary();
  const [edits, setEdits] = useState({});
  useEffect(() => { if (open) setEdits({}); }, [open]);

  const onChange = (section, idx, value) => {
    setEdits(e => ({ ...e, [`${section}:${idx}`]: value }));
  };

  const save = () => {
    const next = { ...lib, billie: [...lib.billie], anuv: [...lib.anuv], shared: { playlists: [...lib.shared.playlists] } };
    Object.entries(edits).forEach(([k, v]) => {
      if (k.startsWith('playlist:')) {
        const idx = +k.split(':')[1];
        const { id } = parseSpotify(v);
        if (id) next.shared.playlists[idx] = { ...next.shared.playlists[idx], id };
      } else if (k === 'newPlaylist') {
        const { id } = parseSpotify(v);
        if (id) next.shared.playlists.push({ id, name: 'New playlist' });
      } else {
        const [section, idx] = k.split(':');
        const { id } = parseSpotify(v);
        if (id) next[section][+idx] = { ...next[section][+idx], trackId: id };
      }
    });
    setLib(next);
    onClose();
  };

  const Row = ({ section, idx, song }) => {
    const key = `${section}:${idx}`;
    const draft = edits[key];
    const draftId = draft ? parseSpotify(draft).id : null;
    return (
      <div className="grid grid-cols-[1fr,1.4fr] gap-2 items-center py-1.5">
        <div className="min-w-0">
          <div className="text-[13.5px] text-ink-900 truncate">{song.title}</div>
          <div className="text-[11px] font-mono text-ink-400 truncate">
            {song.trackId ? `track/${song.trackId}` : 'not set'}
          </div>
        </div>
        <input
          value={draft ?? ''}
          onChange={e => onChange(section, idx, e.target.value)}
          placeholder="paste Spotify link or URI…"
          className={`h-10 px-3 rounded-xl bg-white ring-1 outline-none text-[13px] ${draft && !draftId ? 'ring-coral-300 focus:ring-coral-400/40' : 'ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40'}`}
        />
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-xl">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Music library</div>
          <div className="font-serif-i text-3xl text-ink-900 leading-tight mt-1">Tonight’s soundtrack, edited</div>
          <p className="text-[13px] text-ink-500 mt-1.5">
            Paste a Spotify share link (Track → Share → Copy Song Link). Saves to your browser.
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-200 text-ink-600"><I.X size={18} /></button>
      </div>

      <div className="mt-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-1.5">Billie Eilish</div>
        {lib.billie.map((s, i) => <Row key={i} section="billie" idx={i} song={s} />)}
      </div>
      <Hair className="my-4" />
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-1.5">Anuv Jain</div>
        {lib.anuv.map((s, i) => <Row key={i} section="anuv" idx={i} song={s} />)}
      </div>
      <Hair className="my-4" />
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-1.5">Shared playlists</div>
        {lib.shared.playlists.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr,1.4fr] gap-2 items-center py-1.5">
            <div className="min-w-0">
              <div className="text-[13.5px] text-ink-900 truncate">{p.name}</div>
              <div className="text-[11px] font-mono text-ink-400 truncate">
                {p.id ? `playlist/${p.id}` : 'not set'}
              </div>
            </div>
            <input
              value={edits[`playlist:${i}`] ?? ''}
              onChange={e => setEdits(prev => ({ ...prev, [`playlist:${i}`]: e.target.value }))}
              placeholder="paste Spotify playlist link…"
              className="h-10 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]"
            />
          </div>
        ))}
        <div className="grid grid-cols-[1fr,1.4fr] gap-2 items-center py-1.5 pt-3 border-t border-dashed border-ink-900/[0.1]">
          <div className="min-w-0">
            <div className="text-[13.5px] text-ink-500 italic">Add another</div>
            <div className="text-[11px] font-mono text-ink-400">paste any Spotify playlist</div>
          </div>
          <input
            value={edits.newPlaylist ?? ''}
            onChange={e => setEdits(prev => ({ ...prev, newPlaylist: e.target.value }))}
            placeholder="paste Spotify playlist link…"
            className="h-10 px-3 rounded-xl bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6">
        <Button kind="ghost" onClick={onClose}>Cancel</Button>
        <Button kind="primary" icon={I.Check} onClick={save}>Save library</Button>
      </div>
    </Modal>
  );
};

/* Pick a memory's spotify link inline */
const MemorySpotifyEditor = ({ memory, onSave, onCancel }) => {
  const [val, setVal] = useState('');
  const id = parseSpotify(val).id;
  return (
    <div className="rounded-xl ring-1 ring-ink-900/[0.07] bg-cream-100 p-3.5 flex items-center gap-2">
      <input
        autoFocus value={val} onChange={e => setVal(e.target.value)}
        placeholder="paste Spotify song link…"
        className="flex-1 h-9 px-3 rounded-lg bg-white ring-1 ring-ink-900/10 focus:ring-2 focus:ring-coral-400/40 outline-none text-[13px]"
      />
      <Button kind="primary" size="sm" disabled={!id} onClick={() => onSave(id)}>Link</Button>
      <Button kind="ghost" size="sm" onClick={onCancel}>Cancel</Button>
    </div>
  );
};

/* The main Tonight-ish music card used on Home. */
const MusicCard = () => {
  const [lib, setLib] = useMusicLibrary();
  const [source, setSource] = useState('billie'); // billie | anuv | shared | surprise
  const [pickIdx, setPickIdx] = useState(0);
  const [playlistIdx, setPlaylistIdx] = useState(0);
  const [editing, setEditing] = useState(false);

  // Whatever's currently playing
  const current = useMemo(() => {
    if (source === 'shared') {
      const pl = lib.shared.playlists[playlistIdx % Math.max(1, lib.shared.playlists.length)];
      return { kind: 'playlist', id: pl?.id || null, label: pl?.name || 'Our shared playlist' };
    }
    const list = source === 'anuv' ? lib.anuv : lib.billie;
    const song = list[pickIdx % list.length] || {};
    return { kind: 'track', id: song.trackId, label: song.title, artist: source === 'anuv' ? 'Anuv Jain' : 'Billie Eilish' };
  }, [source, pickIdx, playlistIdx, lib]);

  const allTracks = useMemo(() => [
    ...lib.billie.map(s => ({ ...s, artist: 'Billie Eilish', _s: 'billie' })),
    ...lib.anuv.map(s   => ({ ...s, artist: 'Anuv Jain',     _s: 'anuv'   })),
  ].filter(t => t.trackId), [lib]);

  const surprise = () => {
    if (!allTracks.length) { setEditing(true); return; }
    const pick = allTracks[Math.floor(Math.random() * allTracks.length)];
    setSource(pick._s);
    const list = pick._s === 'billie' ? lib.billie : lib.anuv;
    setPickIdx(list.findIndex(s => s.trackId === pick.trackId));
  };

  const cycleWithin = () => {
    if (source === 'shared') {
      const n = lib.shared.playlists.length;
      if (n <= 1) return;
      setPlaylistIdx((playlistIdx + 1) % n);
      return;
    }
    const list = source === 'anuv' ? lib.anuv : lib.billie;
    const withIds = list.map((s, i) => s.trackId ? i : null).filter(i => i != null);
    if (!withIds.length) { setEditing(true); return; }
    let next;
    do { next = withIds[Math.floor(Math.random() * withIds.length)]; } while (withIds.length > 1 && next === pickIdx);
    setPickIdx(next);
  };

  const SourceTab = ({ id, label, sub, tone }) => (
    <button
      onClick={() => { setSource(id); if (id !== 'shared') setPickIdx(0); }}
      className={`flex-1 rounded-xl ring-1 px-3 py-2.5 text-left transition-all ${
        source === id
          ? (tone === 'lavender' ? 'bg-lavender-50 ring-lavender-300' : tone === 'sage' ? 'bg-sage-50 ring-sage-300' : 'bg-coral-50 ring-coral-300')
          : 'bg-white ring-ink-900/[0.07] hover:ring-ink-900/[0.18]'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${tone === 'lavender' ? 'bg-lavender-500' : tone === 'sage' ? 'bg-sage-500' : 'bg-coral-500'} ${source === id ? 'pulse-dot' : ''}`} />
        <span className="text-[12.5px] font-medium text-ink-900">{label}</span>
      </div>
      <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>
    </button>
  );

  return (
    <Surface className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Tonight\u2019s soundtrack</div>
          <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1 transition-all">
            {current.label || 'pick a song'}
          </div>
          {current.artist && <div className="text-[12px] text-ink-500 italic mt-0.5">{current.artist}</div>}
        </div>
        <button onClick={() => setEditing(true)} aria-label="edit library" className="p-1.5 rounded-full hover:bg-cream-200 text-ink-500 transition-colors">
          <I.Pencil size={15} />
        </button>
      </div>

      {/* Source tabs */}
      <div className="flex gap-2 mt-4">
        <SourceTab id="billie" label="Billie mood"  sub="quiet night, low light" tone="lavender" />
        <SourceTab id="anuv"   label="Anuv evening" sub="rain on the window"     tone="sage" />
        <SourceTab id="shared" label="Our playlists" sub={`${lib.shared.playlists.filter(p => p.id).length} linked`} tone="coral" />
      </div>

      {/* Playlist sub-tabs (only on shared) */}
      {source === 'shared' && lib.shared.playlists.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 fade-up">
          {lib.shared.playlists.map((p, i) => (
            <button
              key={i}
              onClick={() => setPlaylistIdx(i)}
              className={`px-2.5 h-7 text-[12px] rounded-full ring-1 transition-all ${
                playlistIdx === i
                  ? 'bg-coral-500 text-white ring-coral-500'
                  : 'bg-white text-ink-700 ring-ink-900/10 hover:ring-ink-900/25'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Player */}
      <div className="mt-4">
        <SpotifyEmbed
          trackId={current.kind === 'track' ? current.id : null}
          playlistId={current.kind === 'playlist' ? current.id : null}
          height={current.kind === 'playlist' ? 232 : 152}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button kind="primary" size="sm" icon={I.Sparkle} onClick={surprise}>Pick a song for us</Button>
        <Button kind="ghost" size="sm" icon={I.Shuffle} onClick={cycleWithin}>shuffle within</Button>
      </div>

      <EditLibraryModal open={editing} onClose={() => setEditing(false)} />
    </Surface>
  );
};

Object.assign(window, {
  MUSIC_LIBRARY_LS_KEY: LS_KEY,
  parseSpotify, loadLibrary, saveLibrary, useMusicLibrary,
  SpotifyEmbed, TwoClocks, EditLibraryModal, MemorySpotifyEditor, MusicCard,
});
