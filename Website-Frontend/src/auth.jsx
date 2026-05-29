/* Login screen — shown when no Supabase session exists.
   Accounts are created in the Supabase dashboard — no public sign-up. */

const AuthScreen = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: err } = await sbSignIn(email, password);
    if (err) { setError(err.message); setLoading(false); return; }
    onAuth(data.session);
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <span className="relative inline-flex">
            <span className="inline-block w-9 h-9 rounded-full bg-coral-500" />
            <span className="inline-block w-9 h-9 rounded-full bg-lavender-500 -ml-4 mix-blend-multiply" />
          </span>
          <div>
            <div className="font-serif-i text-[30px] text-ink-900 leading-none">Between Us</div>
            <div className="text-[12px] text-ink-500 mt-0.5">Dhruv & Anjali</div>
          </div>
        </div>

        <form onSubmit={signIn} className="bg-white rounded-3xl shadow-soft ring-1 ring-ink-900/[0.06] p-7">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-1">Welcome back</div>
          <div className="font-serif-i text-3xl text-ink-900 leading-tight mb-6">sign in</div>

          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-ink-500 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl bg-cream-100 ring-1 ring-ink-900/[0.08] focus:ring-2 focus:ring-coral-400/50 outline-none text-[14px] text-ink-900"
              />
            </div>
            <div>
              <label className="text-[12px] text-ink-500 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-xl bg-cream-100 ring-1 ring-ink-900/[0.08] focus:ring-2 focus:ring-coral-400/50 outline-none text-[14px] text-ink-900"
              />
            </div>
          </div>

          {error && (
            <div className="mt-3 text-[12.5px] text-coral-600 bg-coral-50 ring-1 ring-coral-200 rounded-xl px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full h-11 rounded-xl bg-ink-900 text-cream-100 text-[14px] font-medium hover:bg-ink-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[12px] text-ink-400 mt-6 font-mono">
          just ours.
        </p>
      </div>
    </div>
  );
};

window.AuthScreen = AuthScreen;
