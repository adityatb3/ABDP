// ═══════════════════════════════════════════════════
// AUTH SCREEN
//
// Handles three modes controlled by the `initialMode` prop:
//
//   landing  — Full-page hero with Create / Log In / Guest
//   login    — Email + password form
//   signup   — Name + email + password form
//
// Switching between login and signup is handled internally.
// Password is hashed with SHA-256 before storing.
//
// Props:
//   initialMode  — 'landing' | 'login' | 'signup'
//   onAuth(user) — called after successful auth
//   onGuest      — called when user chooses guest mode
// ═══════════════════════════════════════════════════

function AuthScreen({ initialMode, onAuth, onGuest }) {
  const [mode, setMode] = useState(initialMode || 'landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const u = DB.getUserByEmail(email);
    if (!u) { setError('No account found with that email.'); setLoading(false); return; }
    const valid = await verifyPassword(password, u.password);
    if (!valid) { setError('Incorrect password.'); setLoading(false); return; }
    DB.setAuthSession(u);
    setLoading(false);
    onAuth(DB.getUserById(u.id));
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); setLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    if (DB.getUserByEmail(email)) { setError('An account with that email already exists.'); setLoading(false); return; }
    const hashed = await hashPassword(password);
    const u = { id: uid(), email: email.trim().toLowerCase(), password: hashed, name: name.trim(), role:'player', createdAt: new Date().toISOString() };
    DB.saveUser(u);
    DB.setAuthSession(u);
    setLoading(false);
    onAuth(u);
  }

  if (mode === 'landing') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'40px 20px', textAlign:'center' }}>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(0,245,196,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,196,.018) 1px,transparent 1px)', backgroundSize:'44px 44px', pointerEvents:'none' }} />
      <div style={{ fontFamily:'var(--display)', fontSize:18, letterSpacing:'6px', color:'var(--accent)', marginBottom:16, textShadow:'0 0 20px rgba(0,245,196,.3)' }}>ABDP</div>
      <div style={{ fontFamily:'var(--display)', fontSize:'clamp(64px,11vw,118px)', lineHeight:.88, letterSpacing:'6px', color:'var(--text-bright)', marginBottom:20, animation:'fadeIn .9s ease' }}>
        <div><span style={{ color:'var(--accent2)', textShadow:'0 0 28px rgba(255,60,95,.5)' }}>HACK</span></div>
        <div style={{ color:'var(--text)' }}>THE</div>
        <div><span style={{ color:'var(--accent)', textShadow:'0 0 28px rgba(0,245,196,.5)' }}>HUMAN</span></div>
      </div>
      <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text-dim)', letterSpacing:'3px', marginBottom:10, maxWidth:480, lineHeight:1.8 }}>
        AWARENESS-BASED DEFENSE PROTOCOL
      </div>
      <div style={{ display:'flex', gap:12, fontFamily:'var(--mono)', fontSize:10, color:'var(--text-dim)', marginBottom:44 }}>
        {['10 SCENARIOS','BRANCHING DECISIONS','INSTANT DEBRIEF'].map((t,i) => (
          <span key={i} style={{ color:'var(--accent)', background:'rgba(0,245,196,.06)', border:'1px solid rgba(0,245,196,.15)', padding:'3px 10px' }}>{t}</span>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:320, animation:'fadeIn .9s .3s ease both', position:'relative', zIndex:1 }}>
        <button style={{ ...S.btnPrimary, width:'100%', padding:'14px', fontSize:18 }} onClick={() => setMode('signup')}>CREATE FREE ACCOUNT</button>
        <button style={{ ...S.btnSecondary, width:'100%', padding:'13px', fontSize:16 }} onClick={() => setMode('login')}>LOG IN</button>
        <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
        <button onClick={onGuest} style={{ ...S.btnGhost, fontSize:10 }}>Continue as Guest (progress not saved) →</button>
      </div>
    </div>
  );

  const isLogin = mode === 'login';
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:20 }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', padding:'36px', width:'100%', maxWidth:400, animation:'fadeIn .25s ease', borderRadius:2 }}>
        <div style={{ fontFamily:'var(--display)', fontSize:24, letterSpacing:'3px', color:'var(--text-bright)', marginBottom:4 }}>
          {isLogin ? 'WELCOME BACK' : 'JOIN ABDP'}
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-dim)', letterSpacing:'1px', marginBottom:26 }}>
          {isLogin ? 'Sign in to your ABDP account' : 'Create your free ABDP account'}
        </div>
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && <InputField label="Full Name" value={name} onChange={setName} placeholder="Your name or codename" autoFocus />}
          <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus={isLogin} />
          <InputField label="Password" type="password" value={password} onChange={setPassword}
            placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
            hint={!isLogin ? 'Hashed with SHA-256 — never transmitted anywhere' : undefined}
            error={error} />
          <button type="submit" disabled={loading}
            style={{ ...S.btnPrimary, width:'100%', padding:'12px', fontSize:17, textAlign:'center', marginTop:4, opacity:loading?.7:1 }}>
            {loading ? 'LOADING...' : isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
          </button>
        </form>
        <div style={{ marginTop:18, textAlign:'center', fontFamily:'var(--mono)', fontSize:10, color:'var(--text-dim)' }}>
          {isLogin ? (<>No account? <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => { setMode('signup'); setError(''); }}>Sign up</span></>) : (<>Already have one? <span style={{ color:'var(--accent)', cursor:'pointer' }} onClick={() => { setMode('login'); setError(''); }}>Log in</span></>)}
        </div>
        <div style={{ marginTop:14, textAlign:'center' }}>
          <button style={{ ...S.btnGhost, fontSize:9 }} onClick={() => setMode('landing')}>← BACK</button>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)', margin:'0 10px' }}>·</span>
          <button style={{ ...S.btnGhost, fontSize:9 }} onClick={onGuest}>PLAY AS GUEST →</button>
        </div>
      </div>
    </div>
  );
}