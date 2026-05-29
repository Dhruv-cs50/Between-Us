/* Guess the Blurred Photo — multi-round, hints reduce blur, reveal animation. */

const BlurredPhotoGame = ({ coupleId }) => {
  const AddMemoryModal = window.AddMemoryModal; // shared from memories.jsx (loads in same session)
  const [roundIdx, setRound] = useState(0);
  const [picked, setPicked]  = useState(null);
  const [hintsUsed, setHints] = useState(0);
  const [attempts, setAtt]   = useState(0);
  const [score, setScore]    = useState(0);
  const [revealed, setReveal] = useState(false);
  const [completedRounds, setCompleted] = useState([]); // indices done
  const [showAdd, setShowAdd] = useState(false);

  const ch = PHOTO_CHALLENGES[roundIdx];
  const blur = Math.max(2, 28 - hintsUsed * 8 - (revealed ? 28 : 0));

  const pick = (opt) => {
    if (revealed) return;
    setAtt(a => a + 1);
    setPicked(opt);
    if (opt === ch.correct) {
      const earned = Math.max(40, 100 - hintsUsed * 25 - (attempts) * 10);
      setScore(s => s + earned);
      setReveal(true);
      setCompleted(prev => prev.includes(roundIdx) ? prev : [...prev, roundIdx]);
    }
  };

  const useHint = () => {
    if (revealed || hintsUsed >= 3) return;
    setHints(h => h + 1);
  };

  const nextRound = () => {
    if (roundIdx + 1 >= PHOTO_CHALLENGES.length) {
      setRound(0); // loop, demo
    } else {
      setRound(i => i + 1);
    }
    setPicked(null); setHints(0); setAtt(0); setReveal(false);
  };

  const wrongPick = picked && picked !== ch.correct;
  const allDone = completedRounds.length === PHOTO_CHALLENGES.length;

  return (
    <div className="space-y-6 fade-up">
      <SectionHeader
        eyebrow={`Game 03 · round ${roundIdx + 1} of ${PHOTO_CHALLENGES.length}`}
        title="Guess the Blurred Photo"
        sub="A memory, but make it mysterious."
        right={<Button kind="outline" icon={I.Plus} onClick={() => setShowAdd(true)}>Add photo memory</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-5">
        {/* Photo */}
        <Surface className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Chip tone="ink" size="sm">{ch.date}</Chip>
              <Chip tone="lavender" size="sm" icon={I.Pin}>{ch.location}</Chip>
            </div>
            <div className="flex items-center gap-2">
              <Chip tone="coral" size="sm">score · {score}</Chip>
              <Chip tone="butter" size="sm">attempts · {attempts}</Chip>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden ring-1 ring-ink-900/[0.08] aspect-[4/3] sm:aspect-[5/3]">
            <PhotoBlock bg={ch.bg} blur={blur} className="w-full h-full" />
            {/* Question overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-ink-900/55 via-ink-900/15 to-transparent">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/80 font-medium">
                {revealed ? 'reveal' : 'what memory is this?'}
              </div>
              <div className="font-serif-i text-3xl sm:text-4xl text-white leading-[1.05] mt-1">
                {revealed ? ch.title : 'Guess it from a blur.'}
              </div>
              {revealed ? (
                <p className="text-white/90 text-[14px] mt-2 max-w-xl" style={{textWrap:'pretty'}}>{ch.note}</p>
              ) : null}
            </div>

            {/* Hints used badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1">
              {[0,1,2].map(i => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < hintsUsed ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>

          {/* Hint reveal */}
          {hintsUsed > 0 && !revealed && (
            <div className="mt-4 rounded-2xl bg-cream-200 ring-1 ring-ink-900/[0.05] p-3.5 flex items-start gap-2.5 fade-up">
              <I.Sparkle size={16} className="text-coral-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-ink-700 italic">{ch.hint}</p>
            </div>
          )}
        </Surface>

        {/* Controls */}
        <div className="space-y-4">
          <Surface className="p-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">
              {revealed ? 'we got it' : 'choose a memory'}
            </div>
            <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">
              {revealed ? ch.correct : 'what does the blur remember?'}
            </div>

            <div className="grid grid-cols-1 gap-2 mt-4">
              {ch.options.map((opt, i) => {
                const isCorrect = revealed && opt === ch.correct;
                const isWrong   = picked === opt && opt !== ch.correct;
                let state = 'bg-white ring-ink-900/[0.07] hover:ring-ink-900/[0.18]';
                if (isCorrect) state = 'bg-sage-50 ring-sage-300';
                else if (isWrong) state = 'bg-coral-50 ring-coral-300';
                return (
                  <button
                    key={i}
                    disabled={revealed}
                    onClick={() => pick(opt)}
                    className={`group rounded-xl ring-1 px-3.5 py-3 text-left flex items-center gap-3 transition-all ${state}`}
                  >
                    <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-mono text-[12px] shrink-0 ring-1 ${
                      isCorrect ? 'bg-sage-500 text-white ring-sage-500'
                      : isWrong ? 'bg-coral-500 text-white ring-coral-500'
                      : 'bg-cream-200 text-ink-700 ring-ink-900/[0.06]'
                    }`}>
                      {isCorrect ? <I.Check size={13} /> : isWrong ? <I.X size={13} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-[14px] text-ink-800 leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {wrongPick && !revealed && (
              <div className="mt-3 text-[13px] text-coral-700 fade-up">
                <span className="font-serif-i text-lg">close —</span> try a hint, or guess again.
              </div>
            )}

            <Hair className="my-5" />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Button kind="soft" icon={I.Sparkle} onClick={useHint} disabled={revealed || hintsUsed >= 3}>
                  Use hint {hintsUsed > 0 ? `(${3 - hintsUsed} left)` : ''}
                </Button>
              </div>
              <Button
                kind={revealed ? 'primary' : 'ghost'}
                icon={revealed ? I.Arrow : I.Play}
                iconRight={revealed ? null : null}
                onClick={revealed ? nextRound : null}
                disabled={!revealed}
              >
                {revealed ? 'Next photo' : 'Pick to continue'}
              </Button>
            </div>
          </Surface>

          {/* Reveal actions */}
          {revealed && (
            <Surface className="p-5 fade-up">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">that one again</div>
              <div className="font-serif-i text-xl text-ink-900 leading-tight mt-1">{ch.title}</div>
              <p className="text-[13.5px] text-ink-600 mt-2" style={{textWrap:'pretty'}}>{ch.note}</p>
              <div className="flex items-center gap-2 mt-4">
                <Button kind="primary" icon={I.Heart}>Save to Memories</Button>
                <Button kind="outline" icon={I.Send}>Send reaction</Button>
              </div>
            </Surface>
          )}

          {/* Round summary at end */}
          {allDone && (
            <Surface className="p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">round summary</div>
              <div className="font-serif-i text-2xl text-ink-900 leading-tight mt-1">A whole album, one blur at a time.</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Chip tone="coral" size="sm">total score · {score}</Chip>
                <Chip tone="sage" size="sm">{completedRounds.length}/{PHOTO_CHALLENGES.length} found</Chip>
              </div>
            </Surface>
          )}
        </div>
      </div>

      {/* Add a real photo memory — reuses the wired AddMemoryModal (PhotoPicker
          tap-to-pick from gallery + Supabase save). */}
      {AddMemoryModal && (
        <AddMemoryModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          coupleId={coupleId}
          onAdded={() => setShowAdd(false)}
        />
      )}
    </div>
  );
};

window.BlurredPhotoGame = BlurredPhotoGame;
