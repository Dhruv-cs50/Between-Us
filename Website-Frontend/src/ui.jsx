// Shared UI: icons, primitives, layout pieces.
// Exported to window so other Babel scripts can use them.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ─────────────────────────── Icons ─────────────────────────── */
// Stroke-only, 1.5px, lucide-style — small and consistent.

const Icon = ({ d, size = 18, className = '', stroke = 1.5, fill = 'none', children }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true"
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const I = {
  Home:     (p) => <Icon {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></Icon>,
  Quiz:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8v.5"/><circle cx="12" cy="17.2" r=".6" fill="currentColor" stroke="none"/></Icon>,
  Draw:     (p) => <Icon {...p}><path d="M3 21h4l11-11-4-4L3 17v4Z"/><path d="m14 6 4 4"/></Icon>,
  Photo:    (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.2"/><path d="M7.5 5 9 3h6l1.5 2"/></Icon>,
  Spinner:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v6"/><path d="M21 12h-6"/><path d="m18.4 18.4-4.2-4.2"/></Icon>,
  Letter:   (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>,
  Timeline: (p) => <Icon {...p}><path d="M12 3v18"/><circle cx="12" cy="7"  r="1.6"/><circle cx="12" cy="13" r="1.6"/><circle cx="12" cy="19" r="1.6"/><path d="M14 7h6"/><path d="M4 13h6"/><path d="M14 19h6"/></Icon>,
  List:     (p) => <Icon {...p}><path d="M4 7h10"/><path d="M4 12h10"/><path d="M4 17h7"/><path d="m17 8 2 2 4-4"/></Icon>,
  Gear:     (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.5 7.5 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14 2h-4l-.5 2.5A7.5 7.5 0 0 0 6.9 6L4.6 5.1 2.6 8.5l2 1.5a7.5 7.5 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.6 1.5L10 22h4l.5-2.5a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z"/></Icon>,
  Heart:    (p) => <Icon {...p}><path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c-1.7 4.4-7 9-7 9Z"/></Icon>,
  Play:     (p) => <Icon {...p}><path d="M8 5v14l11-7L8 5Z"/></Icon>,
  Plus:     (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Undo:     (p) => <Icon {...p}><path d="M9 10H4V5"/><path d="M4 10c2.5-3 6-4.5 9-4.5a8 8 0 0 1 0 16"/></Icon>,
  Trash:    (p) => <Icon {...p}><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/></Icon>,
  Eraser:   (p) => <Icon {...p}><path d="M3 17 13 7l5 5-10 10H3v-5Z"/><path d="M13 7 18 2l4 4-5 5"/></Icon>,
  X:        (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>,
  Check:    (p) => <Icon {...p}><path d="M4 12.5 10 18l10-12"/></Icon>,
  Arrow:    (p) => <Icon {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Icon>,
  Send:     (p) => <Icon {...p}><path d="m4 12 17-8-5 18-4-7-8-3Z"/></Icon>,
  Sparkle:  (p) => <Icon {...p}><path d="M12 4v6"/><path d="M12 14v6"/><path d="M4 12h6"/><path d="M14 12h6"/><path d="m6 6 3 3"/><path d="m15 15 3 3"/><path d="m18 6-3 3"/><path d="m9 15-3 3"/></Icon>,
  Music:    (p) => <Icon {...p}><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></Icon>,
  Pin:      (p) => <Icon {...p}><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></Icon>,
  Lock:     (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>,
  Unlock:   (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7-2.7"/></Icon>,
  Pencil:   (p) => <Icon {...p}><path d="M3 21h4l11-11-4-4L3 17v4Z"/></Icon>,
  Shuffle:  (p) => <Icon {...p}><path d="M17 4h4v4"/><path d="M21 4 4 21"/><path d="M21 16v4h-4"/><path d="m13 13 8 7"/><path d="M4 4l5 5"/></Icon>,
  Mood:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r=".8" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".8" fill="currentColor" stroke="none"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/></Icon>,
  Volume:   (p) => <Icon {...p}><path d="M4 10v4h3l4 3V7L7 10H4Z"/><path d="M15 9a4 4 0 0 1 0 6"/></Icon>,
  Globe:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 3 4 6 4 9s-1.5 6-4 9c-2.5-3-4-6-4-9s1.5-6 4-9Z"/></Icon>,
};

/* ─────────────────────────── Primitives ─────────────────────────── */

// A subtle "surface" — flat, hairline, used sparingly to avoid card-everywhere.
const Surface = ({ className = '', children, as: Tag = 'div', ...rest }) => (
  <Tag
    className={`bg-white rounded-2xl shadow-soft ring-1 ring-ink-900/[0.05] ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

// Inline panel with no white background — just a hairline border.
const Panel = ({ className = '', children }) => (
  <div className={`rounded-2xl ring-1 ring-ink-900/[0.06] ${className}`}>{children}</div>
);

const SectionHeader = ({ eyebrow, title, sub, right, className = '' }) => (
  <div className={`flex items-end justify-between gap-4 ${className}`}>
    <div className="min-w-0">
      {eyebrow ? (
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-1.5">{eyebrow}</div>
      ) : null}
      <h2 className="font-serif-i text-3xl sm:text-4xl text-ink-900 leading-[1.05] tracking-tight">
        {title}
      </h2>
      {sub ? <p className="text-ink-500 mt-1.5 text-sm sm:text-[15px]">{sub}</p> : null}
    </div>
    {right ? <div className="shrink-0">{right}</div> : null}
  </div>
);

// Buttons — three styles.
const Button = ({ kind = 'primary', size = 'md', icon: IconC, iconRight, className = '', children, ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100';
  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-full',
    md: 'h-10 px-4 text-sm rounded-full',
    lg: 'h-12 px-6 text-[15px] rounded-full',
  };
  const kinds = {
    primary: 'bg-ink-900 text-cream-100 hover:bg-ink-800 shadow-softer',
    coral:   'bg-coral-500 text-white hover:bg-coral-600 shadow-softer',
    soft:    'bg-cream-200 text-ink-800 hover:bg-cream-300 ring-1 ring-ink-900/[0.04]',
    ghost:   'bg-transparent text-ink-700 hover:bg-cream-200/70',
    outline: 'bg-white text-ink-800 ring-1 ring-ink-900/[0.10] hover:ring-ink-900/[0.18]',
  };
  return (
    <button className={`${base} ${sizes[size]} ${kinds[kind]} ${className}`} {...rest}>
      {IconC ? <IconC size={size === 'sm' ? 14 : 16} /> : null}
      <span className="whitespace-nowrap">{children}</span>
      {iconRight ? React.createElement(iconRight, { size: size === 'sm' ? 14 : 16 }) : null}
    </button>
  );
};

// Pill / chip — for tags, filters, mood, categories
const Chip = ({ selected, tone = 'ink', size = 'md', icon: IconC, onClick, children, className = '', as: Tag }) => {
  const T = Tag || (onClick ? 'button' : 'span');
  const sz = size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3 text-[13px]';
  const tones = {
    ink:      selected ? 'bg-ink-900 text-cream-100 ring-ink-900' : 'bg-white/60 text-ink-700 ring-ink-900/10 hover:ring-ink-900/25',
    coral:    selected ? 'bg-coral-500 text-white ring-coral-500' : 'bg-coral-50 text-coral-700 ring-coral-200/70 hover:ring-coral-400/60',
    lavender: selected ? 'bg-lavender-500 text-white ring-lavender-500' : 'bg-lavender-50 text-lavender-600 ring-lavender-200/70 hover:ring-lavender-400/60',
    sage:     selected ? 'bg-sage-500 text-white ring-sage-500' : 'bg-sage-50 text-sage-600 ring-sage-200/70 hover:ring-sage-400/60',
    butter:   selected ? 'bg-[#E8B647] text-white ring-[#E8B647]' : 'bg-[#FBF1D6] text-[#8A6A1D] ring-[#E8C880]/60 hover:ring-[#E8B647]/60',
    cream:    selected ? 'bg-ink-900 text-cream-100 ring-ink-900' : 'bg-cream-200 text-ink-700 ring-ink-900/[0.04] hover:bg-cream-300',
  };
  return (
    <T
      type={T === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 transition-all ${sz} ${tones[tone] || tones.ink} ${className}`}
    >
      {IconC ? <IconC size={13} /> : null}
      <span className="whitespace-nowrap">{children}</span>
    </T>
  );
};

// Avatar
const Avatar = ({ initial, tone = 'coral', size = 32, ring = false, className = '' }) => {
  const tones = {
    coral: 'bg-coral-100 text-coral-700',
    lavender: 'bg-lavender-100 text-lavender-600',
    sage: 'bg-sage-100 text-sage-600',
    ink: 'bg-ink-900 text-cream-100',
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-serif-i text-[1.05em] ${tones[tone] || tones.coral} ${ring ? 'ring-2 ring-white' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {initial}
    </span>
  );
};

const PairAvatar = ({ size = 30, className = '' }) => (
  <span className={`inline-flex ${className}`}>
    <Avatar initial="D" tone="coral" size={size} ring />
    <Avatar initial="A" tone="lavender" size={size} ring className="-ml-2" />
  </span>
);

// Soft labelled stat
const Stat = ({ label, value, sub, className = '' }) => (
  <div className={className}>
    <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">{label}</div>
    <div className="font-serif-i text-4xl sm:text-5xl text-ink-900 leading-none mt-1.5">{value}</div>
    {sub ? <div className="text-ink-500 text-[13px] mt-1.5">{sub}</div> : null}
  </div>
);

// Count-up — animates from 0 to `to` over `duration` ms. Eases out.
const useCountUp = (to, duration = 1100) => {
  const [n, setN] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = fromRef.current;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = Math.round(from + (to - from) * eased);
      setN(val);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return n;
};

const CountUp = ({ to, duration = 1100, className = '' }) => {
  const n = useCountUp(to, duration);
  return <span className={`tabular-nums ${className}`}>{n.toLocaleString()}</span>;
};

// Image block — shows real photo if imgPath, else gradient placeholder.
const PhotoBlock = ({ bg, imgPath, caption, blur = 0, className = '', children, rounded = '2xl' }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (imgPath) sbGetPhotoUrl(imgPath).then(u => setUrl(u));
  }, [imgPath]);

  const style = url
    ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: bg || 'linear-gradient(135deg, #E5DEF0 0%, #C8B8DD 60%, #7D6FA0 100%)' };

  return (
    <div className={`relative overflow-hidden rounded-${rounded} ${className}`} style={style}>
      {!url && (
        <div className="absolute inset-0" style={{ filter: blur ? `blur(${blur}px) saturate(1.1)` : 'none', transform: 'scale(1.05)', transition: 'filter .6s ease' }}>
          <div className="absolute inset-0 mix-blend-overlay opacity-30"
               style={{ backgroundImage:'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1.4px)', backgroundSize:'3px 3px' }} />
          <div className="absolute inset-0 mix-blend-multiply opacity-25"
               style={{ backgroundImage:'radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1.4px)', backgroundSize:'5px 5px' }} />
        </div>
      )}
      {caption ? (
        <div className="absolute bottom-2.5 left-2.5 font-mono text-[10px] tracking-tight uppercase text-white/90 bg-ink-900/30 backdrop-blur px-2 py-0.5 rounded-full">
          {caption}
        </div>
      ) : null}
      {children}
    </div>
  );
};

// Loading skeleton for async page data
const PageSkeleton = ({ rows = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-cream-200 rounded-2xl" style={{ height: 80 + (i % 2) * 40 }} />
    ))}
  </div>
);

// Divider
const Hair = ({ className = '' }) => <div className={`h-px bg-ink-900/[0.07] ${className}`} />;

// Tiny live-dot
const LiveDot = ({ tone = 'sage' }) => (
  <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-500">
    <span className={`pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-${tone}-500`} />
    connected
  </span>
);

/* ─────────────────────────── Modal ─────────────────────────── */
const Modal = ({ open, onClose, children, maxW = 'max-w-lg', padding = 'p-6 sm:p-8' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-900/35 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${maxW} mx-auto fade-up`}>
        <div className={`bg-cream-100 rounded-t-3xl sm:rounded-3xl ring-1 ring-ink-900/10 shadow-soft ${padding} max-h-[88vh] overflow-y-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── Tonight's soundtrack ─────────────────────── */
const SoundtrackCard = ({ compact = false }) => {
  const [picked, setPicked] = useState(0);
  return (
    <Surface className={compact ? 'p-4' : 'p-5'}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">Tonight’s soundtrack</div>
          <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">two artists, one mood</div>
        </div>
        <I.Music size={20} className="text-ink-400 mt-1" />
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {SOUNDTRACK.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setPicked(i)}
            className={`group relative rounded-2xl ring-1 px-3.5 py-2.5 text-left transition-all ${
              picked === i
                ? (s.tone === 'lavender' ? 'bg-lavender-50 ring-lavender-200' : 'bg-sage-50 ring-sage-200')
                : 'bg-white ring-ink-900/[0.07] hover:ring-ink-900/[0.14]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.tone === 'lavender' ? 'bg-lavender-500' : 'bg-sage-500'}`} />
              <span className="text-[13px] font-medium text-ink-900">{s.label}</span>
            </div>
            <div className="text-[11px] text-ink-500 mt-0.5">{s.sub}</div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button kind="soft" size="sm" icon={I.Sparkle}>Pick a song for us</Button>
        <span className="text-[11px] text-ink-400">no lyrics, just titles</span>
      </div>
    </Surface>
  );
};

/* ─────────────────────────── Exports ─────────────────────────── */
Object.assign(window, {
  I, Icon,
  Surface, Panel, SectionHeader, Button, Chip, Avatar, PairAvatar, Stat,
  CountUp, useCountUp,
  PhotoBlock, PageSkeleton, Hair, LiveDot, Modal, SoundtrackCard,
  useState, useEffect, useRef, useMemo, useCallback,
});
