/* Future Home, Badly Drawn — real canvas, 60s timer, reveal state. */

const PALETTE = [
  '#1C1814', // ink
  '#DD7E66', // coral
  '#9E8FBE', // lavender
  '#7E9F86', // sage
  '#E8B647', // butter
  '#5C4B7A', // deep plum
  '#C56551', // deep coral
  '#FFFFFF', // eraser-as-color (technically: white)
];

const DrawingGame = () => {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const drawing   = useRef(false);
  const last      = useRef(null);
  const strokes   = useRef([]);     // ImageData snapshots for undo
  const ctxRef    = useRef(null);

  const [color, setColor]   = useState(PALETTE[0]);
  const [size, setSize]     = useState(4);
  const [erasing, setErase] = useState(false);
  const [twists, setTwists] = useState([DRAW_TWISTS[0]]); // initial twist
  const [phase, setPhase]   = useState('ready'); // ready | playing | reveal
  const [time, setTime]     = useState(60);
  const [ratings, setRatings] = useState([]); // selected reveal chips
  const [reaction, setReaction] = useState('');

  /* ── setup canvas at full DPR ── */
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const wrap = wrapRef.current; if (!wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(280, Math.floor(rect.width));
    const h = Math.max(280, Math.floor(rect.width * 0.66));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      // preserve current bitmap when resizing
      const prev = canvas.toDataURL();
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // paint cream background so erase = blend in
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, w, h);
      // restore previous content if any
      if (prev && strokes.current.length) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, w, h);
        img.src = prev;
      }
      ctxRef.current = ctx;
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setupCanvas]);

  /* ── timer ── */
  useEffect(() => {
    if (phase !== 'playing') return;
    if (time <= 0) { setPhase('reveal'); return; }
    const t = setTimeout(() => setTime(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, time]);

  const snapshot = () => {
    const c = canvasRef.current; if (!c || !ctxRef.current) return;
    try {
      const img = ctxRef.current.getImageData(0, 0, c.width, c.height);
      strokes.current.push(img);
      if (strokes.current.length > 20) strokes.current.shift();
    } catch (e) { /* ignore */ }
  };

  const getPos = (e) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const startStroke = (e) => {
    if (phase === 'reveal') return;
    e.preventDefault();
    snapshot();
    drawing.current = true;
    last.current = getPos(e);
    const ctx = ctxRef.current; if (!ctx) return;
    // start a dot
    ctx.beginPath();
    ctx.fillStyle = erasing ? '#FFFDF8' : color;
    ctx.arc(last.current.x, last.current.y, (erasing ? size * 1.6 : size) / 2, 0, Math.PI*2);
    ctx.fill();
  };
  const moveStroke = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ctxRef.current; if (!ctx) return;
    const p = getPos(e);
    ctx.strokeStyle = erasing ? '#FFFDF8' : color;
    ctx.lineWidth = erasing ? size * 1.6 : size;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const endStroke = () => { drawing.current = false; };

  const undo = () => {
    if (!ctxRef.current) return;
    const img = strokes.current.pop();
    if (img) {
      const c = canvasRef.current;
      ctxRef.current.putImageData(img, 0, 0);
    }
  };
  const clearAll = () => {
    const c = canvasRef.current; if (!c || !ctxRef.current) return;
    snapshot();
    ctxRef.current.fillStyle = '#FFFDF8';
    const rect = c.getBoundingClientRect();
    ctxRef.current.fillRect(0, 0, rect.width, rect.height);
  };

  const startGame = () => { setPhase('playing'); setTime(60); };
  const tryAgain  = () => { setRatings([]); setReaction(''); setTime(60); setPhase('ready'); clearAll(); };

  const addTwist = (t) => setTwists(prev => prev.includes(t) ? prev : [...prev, t]);

  /* ── reveal state ── */
  if (phase === 'reveal') {
    return (
      <div className="space-y-6 fade-up">
        <SectionHeader
          eyebrow="Game 02 · round complete"
          title="Masterpiece reveal"
          sub="Architecturally questionable. Emotionally accurate."
          right={<Button kind="outline" icon={I.Play} onClick={tryAgain}>Try again</Button>}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-5">
          <Surface className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">drawn by Dhruv · 60s</div>
              <div className="flex flex-wrap gap-1.5">
                {twists.map(t => <Chip key={t} tone="lavender" size="sm">{t}</Chip>)}
              </div>
            </div>
            <div ref={wrapRef} className="relative rounded-2xl ring-1 ring-ink-900/[0.08] bg-[#FFFDF8] overflow-hidden">
              <canvas ref={canvasRef} className="block w-full" />
              {/* paper tape */}
              <span className="absolute -top-2 left-6 h-6 w-20 rotate-[-4deg] bg-[#F4D9CE]/80 rounded-sm shadow-softer" />
            </div>
          </Surface>
          <div className="space-y-5">
            <Surface className="p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Rate this house</div>
              <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">pick all that apply</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {DRAW_RATINGS.map(r => (
                  <Chip key={r} tone="butter" size="sm" selected={ratings.includes(r)}
                    onClick={() => setRatings(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}>
                    {r}
                  </Chip>
                ))}
              </div>
            </Surface>
            <Surface className="p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Anjali’s reaction</div>
              <textarea
                value={reaction}
                onChange={e => setReaction(e.target.value)}
                placeholder="leave a reaction…"
                rows={3}
                className="mt-3 w-full px-3.5 py-3 rounded-xl bg-cream-100 ring-1 ring-ink-900/[0.06] focus:ring-2 focus:ring-coral-400/40 outline-none text-[14px] resize-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['✨ keep', '🏡 move in', '😭 crying', 'this is us'].map(r => (
                  <button key={r} onClick={() => setReaction(prev => prev ? `${prev} ${r}` : r)}
                    className="px-2.5 h-7 text-[12px] rounded-full bg-cream-200 ring-1 ring-ink-900/[0.05] hover:bg-cream-300">
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button kind="primary" icon={I.Send}>Send to partner</Button>
                <Button kind="ghost" icon={I.Heart}>Save</Button>
              </div>
            </Surface>
          </div>
        </div>
      </div>
    );
  }

  /* ── ready / playing ── */
  return (
    <div className="space-y-6 fade-up">
      <SectionHeader
        eyebrow="Game 02"
        title="Future Home, Badly Drawn"
        sub="You have 60 seconds. Architecture is optional. Love is mandatory."
        right={
          <div className="hidden sm:flex items-center gap-2">
            <Chip tone="coral" size="md" icon={I.Sparkle}>twist: {twists[twists.length - 1]}</Chip>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-5">
        {/* Canvas */}
        <Surface className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Chip tone="ink" size="sm">Draw our future home</Chip>
              <Chip tone="lavender" size="sm" icon={I.Sparkle}>{twists[twists.length - 1]}</Chip>
            </div>
            <div className="flex items-center gap-3">
              <div className={`font-mono tabular-nums text-[13px] px-2.5 h-8 inline-flex items-center rounded-full ring-1 ${phase === 'playing' && time <= 10 ? 'bg-coral-50 text-coral-700 ring-coral-200' : 'bg-cream-200 text-ink-700 ring-ink-900/[0.06]'}`}>
                00:{String(time).padStart(2, '0')}
              </div>
              {phase === 'ready'
                ? <Button kind="primary" icon={I.Play} onClick={startGame}>Start 60 seconds</Button>
                : <Button kind="outline" onClick={() => setPhase('reveal')}>Finish early</Button>}
            </div>
          </div>

          <div ref={wrapRef} className="relative rounded-2xl ring-1 ring-ink-900/[0.08] bg-[#FFFDF8] overflow-hidden">
            <canvas
              ref={canvasRef}
              className="block w-full cursor-crosshair"
              onMouseDown={startStroke} onMouseMove={moveStroke} onMouseUp={endStroke} onMouseLeave={endStroke}
              onTouchStart={startStroke} onTouchMove={moveStroke} onTouchEnd={endStroke}
            />
            {phase === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="font-serif-i text-3xl text-ink-400">tap start — then draw badly, lovingly</div>
                  <div className="text-[12px] text-ink-400 mt-2 font-mono">canvas is yours</div>
                </div>
              </div>
            )}
            {/* progress bar across top while playing */}
            {phase === 'playing' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-cream-200">
                <div className="h-full bg-coral-500" style={{ width: `${(60 - time)/60 * 100}%`, transition:'width 1s linear' }} />
              </div>
            )}
          </div>

          {/* mobile toolbar */}
          <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
            <div className="flex items-center gap-1.5">
              {PALETTE.map(c => (
                <button key={c} onClick={() => { setColor(c); setErase(false); }}
                  aria-label={`color ${c}`}
                  style={{ background: c }}
                  className={`w-7 h-7 rounded-full ring-2 transition-all ${color === c && !erasing ? 'ring-ink-900' : 'ring-white'}`} />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setErase(e => !e)} className={`w-9 h-9 rounded-full inline-flex items-center justify-center ring-1 ${erasing ? 'bg-coral-50 ring-coral-300 text-coral-700' : 'bg-white ring-ink-900/10 text-ink-700'}`}><I.Eraser size={16} /></button>
              <button onClick={undo} className="w-9 h-9 rounded-full inline-flex items-center justify-center ring-1 bg-white ring-ink-900/10 text-ink-700"><I.Undo size={16} /></button>
              <button onClick={clearAll} className="w-9 h-9 rounded-full inline-flex items-center justify-center ring-1 bg-white ring-ink-900/10 text-ink-700"><I.Trash size={16} /></button>
            </div>
          </div>
        </Surface>

        {/* Side toolbar — desktop */}
        <div className="space-y-4">
          <Surface className="p-5 hidden lg:block">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Tools</div>

            <div className="mt-3">
              <div className="text-[12px] text-ink-600 mb-1.5">Color</div>
              <div className="grid grid-cols-4 gap-2">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => { setColor(c); setErase(false); }}
                    aria-label={`color ${c}`}
                    style={{ background: c }}
                    className={`relative h-9 rounded-xl ring-2 transition-all ${color === c && !erasing ? 'ring-ink-900' : 'ring-ink-900/[0.06] hover:ring-ink-900/30'}`}>
                    {c === '#FFFFFF' ? <span className="absolute inset-0 rounded-xl ring-1 ring-ink-900/10" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] text-ink-600 mb-1.5">
                <span>Brush size</span>
                <span className="font-mono tabular-nums text-ink-500">{size}px</span>
              </div>
              <input type="range" min="1" max="28" value={size} onChange={e => setSize(+e.target.value)} className="w-full thumb-coral" />
              <div className="mt-2 h-7 flex items-center">
                <span className="rounded-full" style={{ width: size, height: size, background: erasing ? '#EADFC8' : color }} />
              </div>
            </div>

            <Hair className="my-4" />

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setErase(e => !e)} className={`h-10 rounded-xl inline-flex items-center justify-center gap-1.5 text-[12px] ring-1 ${erasing ? 'bg-coral-50 ring-coral-300 text-coral-700' : 'bg-white ring-ink-900/10 text-ink-700 hover:ring-ink-900/25'}`}>
                <I.Eraser size={14} /> eraser
              </button>
              <button onClick={undo} className="h-10 rounded-xl inline-flex items-center justify-center gap-1.5 text-[12px] bg-white ring-1 ring-ink-900/10 text-ink-700 hover:ring-ink-900/25">
                <I.Undo size={14} /> undo
              </button>
              <button onClick={clearAll} className="h-10 rounded-xl inline-flex items-center justify-center gap-1.5 text-[12px] bg-white ring-1 ring-ink-900/10 text-ink-700 hover:ring-ink-900/25">
                <I.Trash size={14} /> clear
              </button>
            </div>

            <Hair className="my-4" />

            <div className="grid grid-cols-1 gap-2">
              <Button kind="primary" icon={I.Heart}>Save drawing</Button>
              <Button kind="outline" icon={I.Send}>Send to partner</Button>
            </div>
          </Surface>

          <Surface className="p-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Twist prompts</div>
            <div className="font-serif-i text-xl text-ink-900 leading-tight mt-1">add one mid-draw</div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {DRAW_TWISTS.map(t => (
                <button key={t} onClick={() => addTwist(t)}
                  className={`px-2.5 h-7 text-[12px] rounded-full ring-1 transition-all ${
                    twists.includes(t)
                      ? 'bg-lavender-500 text-white ring-lavender-500'
                      : 'bg-white text-ink-700 ring-ink-900/10 hover:ring-ink-900/25'
                  }`}>{t}</button>
              ))}
            </div>
            <div className="text-[11px] text-ink-400 mt-3 font-mono">shuffled into the canvas, every 20s</div>
          </Surface>
        </div>
      </div>
    </div>
  );
};

window.DrawingGame = DrawingGame;
