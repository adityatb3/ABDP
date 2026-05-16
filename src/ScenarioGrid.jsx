// ═══════════════════════════════════════════════════
// SCENARIO GRID
//
// Filterable grid of scenario cards. Shows difficulty
// filter tabs (ALL / ROOKIE / OPERATIVE / GHOST),
// then renders a card for each visible scenario.
//
// Cards show: difficulty badge, title, subtitle,
// duration, type, best previous score (if played),
// and a PLAY / REPLAY button.
//
// Props:
//   onPlay(scenarioId) — callback when player clicks play
//   sessions           — array of user's past sessions
//                        (used to show played/best score)
// ═══════════════════════════════════════════════════

function ScenarioGrid({ onPlay, sessions = [] }) {
  const [filter, setFilter] = useState('all');
  const playedIds = new Set(sessions.map(s => s.scenarioId));
  const bestScores = {};
  sessions.forEach(s => { if (!bestScores[s.scenarioId] || s.score > bestScores[s.scenarioId]) bestScores[s.scenarioId] = s.score; });
  const scenarios = Object.values(SCENARIOS).filter(s => filter === 'all' || s.diffClass === filter);

  return (
    <div>
      <div style={{ display:'flex', gap:7, marginBottom:20, flexWrap:'wrap' }}>
        {[['all','ALL'],['easy','ROOKIE'],['medium','OPERATIVE'],['hard','GHOST']].map(([f,l]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'2px', textTransform:'uppercase', padding:'5px 14px', background:'transparent', border:`1px solid ${filter===f?'var(--accent)':'var(--border)'}`, color:filter===f?'var(--accent)':'var(--text-dim)', cursor:'pointer', transition:'all .2s', borderRadius:1 }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:13 }}>
        {scenarios.map(s => {
          const dc = DIFF_COLORS[s.diffClass];
          const played = playedIds.has(s.id);
          return (
            <div key={s.id} style={{ ...S.card, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', transition:'all .25s', borderTop:`2px solid ${dc}` }}
              onMouseEnter={e => { e.currentTarget.style.borderTopColor=dc; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${dc}18`; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              {played && (
                <div style={{ position:'absolute', top:12, right:12, fontFamily:'var(--mono)', fontSize:8, color:dc, background:dc+'18', border:`1px solid ${dc}44`, padding:'2px 6px', letterSpacing:'1px' }}>
                  PLAYED {bestScores[s.id] ? `· ${bestScores[s.id].toLocaleString()}` : ''}
                </div>
              )}
              <div style={{ fontFamily:'var(--mono)', fontSize:9, color:dc, letterSpacing:'2px', marginBottom:8 }}>{DIFF_LABELS[s.diffClass]}</div>
              <div style={{ fontFamily:'var(--display)', fontSize:18, letterSpacing:'2px', color:'var(--text-bright)', marginBottom:7 }}>{s.title}</div>
              <div style={{ fontSize:11, color:'var(--text-dim)', lineHeight:1.7, flex:1, marginBottom:14 }}>{s.subtitle}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)', borderTop:'1px solid var(--border)', paddingTop:10, marginBottom:12 }}>
                <span>~{s.duration} min</span><span>{s.type}</span>
              </div>
              <button onClick={() => onPlay(s.id)}
                style={{ background:dc+'18', border:`1px solid ${dc}44`, color:dc, padding:'9px', fontFamily:'var(--mono)', fontSize:10, cursor:'pointer', letterSpacing:'2px', transition:'all .2s', width:'100%', borderRadius:1 }}>
                {played ? 'REPLAY ↺' : '▶ PLAY'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}