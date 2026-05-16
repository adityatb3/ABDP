// ═══════════════════════════════════════════════════
// APP — Root component and view router
//
// Manages the top-level view state machine:
//
//   loading  → check localStorage for existing session
//   auth     → AuthScreen (landing / login / signup)
//   guest    → GuestArena (play without account)
//   player   → PlayerDashboard (logged-in player)
//   game     → GameArena (active scenario)
//   result   → ResultScreen (post-game debrief)
//
// All navigation is handled here via view state +
// callback props passed down to child components.
// ═══════════════════════════════════════════════════

function App() {
  const [view, setView] = useState('loading');
  const [authMode, setAuthMode] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [playingScenarioId, setPlayingScenarioId] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Restore session on load
  useEffect(() => {
    const session = DB.getAuthSession();
    if (session) {
      const u = DB.getUserById(session.id);
      if (u) { setCurrentUser(u); setView('player'); return; }
      DB.clearAuthSession();
    }
    setView('auth');
  }, []);

  function handleAuth(user) {
    setCurrentUser(user);
    setView('player');
  }

  function handleLogout() {
    DB.clearAuthSession();
    setCurrentUser(null);
    setView('auth');
    setAuthMode('landing');
  }

  function handlePlay(scenarioId) {
    setPlayingScenarioId(scenarioId);
    setLastResult(null);
    setView('game');
  }

  function handleGameEnd(result) {
    setLastResult(result);
    setRefreshKey(k => k + 1);
    setView('result');
  }

  function handleReplay() {
    setLastResult(null);
    setView('game');
  }

  function handleBackToArena() {
    setView(currentUser ? 'player' : 'guest');
    setLastResult(null);
    setPlayingScenarioId(null);
  }

  if (view === 'loading') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--display)', fontSize:44, letterSpacing:'8px', color:'var(--accent)', marginBottom:20, textShadow:'0 0 20px rgba(0,245,196,.3)' }}>ABDP</div>
          <div style={{ width:8, height:8, background:'var(--accent)', borderRadius:'50%', margin:'0 auto', animation:'pulse 1s infinite' }} />
        </div>
      </div>
    );
  }

  if (view === 'game' && playingScenarioId) {
    const scenario = SCENARIOS[playingScenarioId];
    if (!scenario) { setView('auth'); return null; }
    return <GameArena scenario={scenario} user={currentUser} onEnd={handleGameEnd} />;
  }

  if (view === 'result' && lastResult) {
    return <ResultScreen result={lastResult} onReplay={handleReplay} onHome={handleBackToArena} />;
  }

  if (view === 'player' && currentUser) {
    return <PlayerDashboard key={refreshKey} user={currentUser} onPlay={handlePlay} onLogout={handleLogout} />;
  }

  if (view === 'guest') {
    return <GuestArena onPlay={handlePlay} onSignUp={() => { setAuthMode('signup'); setView('auth'); }} onLogin={() => { setAuthMode('login'); setView('auth'); }} />;
  }

  return <AuthScreen initialMode={authMode} onAuth={handleAuth} onGuest={() => setView('guest')} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);