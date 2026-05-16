// ═══════════════════════════════════════════════════
// PLAYER DASHBOARD
//
// Main view for logged-in players. Three tabs:
//   PLAY    — ScenarioGrid with personal stats header
//   HISTORY — Full session log table
//   PROFILE — Account info + change password link
//
// Props:
//   user       — current user object
//   onPlay(id) — navigate to game with scenario id
//   onLogout   — clear session and return to auth
// ═══════════════════════════════════════════════════

function PlayerDashboard({ user, onPlay, onLogout, onRefresh }) {
  const [tab, setTab] = useState('play');
  const [showPwModal, setShowPwModal] = useState(false);
  const [showToast, toastEl] = useToast();

  const sessions = DB.getSessionsByUser(user.id);
  const passRate = sessions.length > 0 ? Math.round(sessions.filter(s => s.result === 'pass').length / sessions.length * 100) : 0;
  const avgScore = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + (s.score || 0), 0) / sessions.length) : 0;
  const scenariosPlayed = new Set(sessions.map(s => s.scenarioId)).size;
  const totalScenarios = Object.keys(SCENARIOS).length;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {toastEl}
      {showPwModal && <ChangePasswordModal user={user} onClose={() => setShowPwModal(false)} onSuccess={() => { setShowPwModal(false); showToast('Password updated successfully'); }} />}

      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 28px', borderBottom:'1px solid var(--border)', background:'rgba(6,10,14,.96)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ fontFamily:'var(--display)', fontSize:21, letterSpacing:'4px', color:'var(--accent)', cursor:'pointer' }} onClick={() => setTab('play')}>
          ABDP
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {[['play','PLAY'],['history','HISTORY'],['profile','PROFILE']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'2px', color:tab===t?'var(--accent)':'var(--text-dim)', background:tab===t?'rgba(0,245,196,.06)':'transparent', border:`1px solid ${tab===t?'rgba(0,245,196,.2)':'transparent'}`, cursor:'pointer', padding:'6px 14px', transition:'all .2s', borderRadius:1 }}>
              {l}
            </button>
          ))}
          <div style={{ width:1, height:20, background:'var(--border)', margin:'0 6px' }} />
          <button onClick={onLogout} style={{ ...S.btnGhost, fontSize:9 }}>LOG OUT</button>
        </div>
      </nav>

      <div style={{ maxWidth:1040, margin:'0 auto', padding:'30px 26px' }}>
        {tab === 'play' && (
          <div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <div style={{ fontFamily:'var(--display)', fontSize:36, letterSpacing:'4px', color:'var(--text-bright)' }}>ARENA</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-dim)', letterSpacing:'2px', marginTop:3 }}>Welcome back, {user.name}</div>
              </div>
              {sessions.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                  <StatCard label="Sessions" value={sessions.length} />
                  <StatCard label="Pass Rate" value={`${passRate}%`} color={passRate >= 70 ? 'var(--accent)' : passRate >= 40 ? 'var(--accent3)' : 'var(--accent2)'} />
                  <StatCard label="Avg Score" value={avgScore.toLocaleString()} color="var(--accent3)" />
                  <StatCard label="Scenarios" value={`${scenariosPlayed}/${totalScenarios}`} />
                </div>
              )}
            </div>
            <ScenarioGrid onPlay={onPlay} sessions={sessions} />
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div style={{ fontFamily:'var(--display)', fontSize:36, letterSpacing:'4px', color:'var(--text-bright)', marginBottom:22 }}>SESSION HISTORY</div>
            {sessions.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-dim)' }}>
                <div style={{ fontSize:48, marginBottom:16, opacity:.3 }}>📋</div>
                <div style={{ fontFamily:'var(--display)', fontSize:26, letterSpacing:'3px', marginBottom:8 }}>NO SESSIONS YET</div>
                <div style={{ fontSize:13, marginBottom:20 }}>Play some scenarios to see your history.</div>
                <button style={S.btnPrimary} onClick={() => setTab('play')}>PLAY NOW</button>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                      {['DATE','SCENARIO','DIFFICULTY','SCORE','CORRECT','DISCLOSURES','DURATION','RESULT'].map(h => (
                        <th key={h} style={{ fontFamily:'var(--mono)', fontSize:8, color:'var(--text-dim)', letterSpacing:'2px', padding:'9px 13px', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...sessions].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((s, i) => {
                      const rc = {'pass':'var(--accent)','partial':'var(--accent3)','breach':'var(--accent2)'}[s.result];
                      const dc = {'easy':'var(--accent)','medium':'var(--accent3)','hard':'var(--accent2)'}[s.difficulty];
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,.025)' }}>
                          <td style={{ padding:'10px 13px', fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)' }}>{new Date(s.timestamp).toLocaleDateString()}</td>
                          <td style={{ padding:'10px 13px', fontSize:11, maxWidth:170, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.scenarioTitle}</td>
                          <td style={{ padding:'10px 13px' }}><Tag color={dc}>{DIFF_LABELS[s.difficulty]||s.difficulty}</Tag></td>
                          <td style={{ padding:'10px 13px', fontFamily:'var(--display)', fontSize:15, color:'var(--accent)' }}>{(s.score||0).toLocaleString()}</td>
                          <td style={{ padding:'10px 13px', fontFamily:'var(--mono)', fontSize:10 }}>{s.correct||0}/{s.total||0}</td>
                          <td style={{ padding:'10px 13px', fontFamily:'var(--mono)', fontSize:11, color:(s.disclosures||0)>0?'var(--accent2)':'var(--accent)' }}>{s.disclosures||0}</td>
                          <td style={{ padding:'10px 13px', fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)' }}>{Math.floor((s.elapsed||0)/60)}m {(s.elapsed||0)%60}s</td>
                          <td style={{ padding:'10px 13px' }}><Tag color={rc}>{(s.result||'').toUpperCase()}</Tag></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ maxWidth:500 }}>
            <div style={{ fontFamily:'var(--display)', fontSize:36, letterSpacing:'4px', color:'var(--text-bright)', marginBottom:22 }}>PROFILE</div>
            <div style={{ ...S.card, marginBottom:14 }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--accent)', letterSpacing:'2px', marginBottom:14 }}>ACCOUNT</div>
              {[['Name', user.name], ['Email', user.email], ['Joined', new Date(user.createdAt).toLocaleDateString()], ['Sessions Completed', sessions.length]].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                  <span style={{ color:'var(--text-dim)' }}>{l}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text-bright)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ ...S.card }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--accent)', letterSpacing:'2px', marginBottom:14 }}>SECURITY</div>
              <div style={{ fontSize:13, color:'var(--text-dim)', marginBottom:14 }}>Your password is hashed using SHA-256 and stored locally in your browser. It is never transmitted anywhere.</div>
              <button style={S.btnSecondary} onClick={() => setShowPwModal(true)}>CHANGE PASSWORD</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}