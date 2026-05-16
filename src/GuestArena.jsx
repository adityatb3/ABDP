// ═══════════════════════════════════════════════════
// GUEST ARENA
//
// Arena view for unauthenticated visitors.
// Same ScenarioGrid as PlayerDashboard but with:
//   - Nav bar showing Log In / Sign Up buttons
//   - Persistent warning banner: "progress not saved"
//   - Prompt to create a free account
//
// Props:
//   onPlay(id)  — navigate to game
//   onSignUp    — navigate to signup screen
//   onLogin     — navigate to login screen
// ═══════════════════════════════════════════════════

function GuestArena({ onPlay, onSignUp, onLogin }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 28px', borderBottom:'1px solid var(--border)', background:'rgba(6,10,14,.96)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ fontFamily:'var(--display)', fontSize:21, letterSpacing:'4px', color:'var(--accent)' }}>
          ABDP
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button style={{ ...S.btnSecondary, fontSize:12, padding:'7px 18px' }} onClick={onLogin}>LOG IN</button>
          <button style={{ ...S.btnPrimary, fontSize:13 }} onClick={onSignUp}>SIGN UP</button>
        </div>
      </nav>

      <div style={{ maxWidth:1040, margin:'0 auto', padding:'30px 26px' }}>
        <div style={{ background:'rgba(255,60,95,.06)', border:'1px solid rgba(255,60,95,.2)', padding:'12px 18px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--accent3)', letterSpacing:'1px' }}>
            ⚠ Playing as guest — your progress will not be saved
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onSignUp} style={{ fontFamily:'var(--mono)', fontSize:9, background:'var(--accent)', color:'var(--bg)', border:'none', padding:'5px 14px', cursor:'pointer', letterSpacing:'1px' }}>CREATE FREE ACCOUNT</button>
            <button onClick={onLogin} style={{ fontFamily:'var(--mono)', fontSize:9, background:'transparent', color:'var(--text-dim)', border:'1px solid var(--border)', padding:'5px 14px', cursor:'pointer', letterSpacing:'1px' }}>LOG IN</button>
          </div>
        </div>
        <div style={{ fontFamily:'var(--display)', fontSize:34, letterSpacing:'4px', color:'var(--text-bright)', marginBottom:22 }}>ARENA</div>
        <ScenarioGrid onPlay={onPlay} sessions={[]} />
      </div>
    </div>
  );
}