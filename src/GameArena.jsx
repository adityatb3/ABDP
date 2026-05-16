// ═══════════════════════════════════════════════════
// GAME ARENA
//
// The core gameplay screen. Renders the full-height
// arena layout with:
//   - Header bar (score, threat level, timer, abort)
//   - Left panel (caller info, intel, tactics detected)
//   - Chat panel (attacker messages, typing indicator,
//                 player messages, feedback flash)
//   - Response panel (4 choice buttons A/B/C/D)
//
// Props:
//   scenario  — scenario object from SCENARIOS
//   user      — current user (or null for guest)
//   onEnd(result) — called when game completes
// ═══════════════════════════════════════════════════

function GameArena({ scenario, user, onEnd }) {
  const [phaseId, setPhaseId] = useState(scenario.phases[0].id);
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [disclosures, setDisclosures] = useState(0);
  const [tactics, setTactics] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [typing, setTyping] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [scoreFlash, setScoreFlash] = useState(null);
  const messagesRef = useRef(null);
  const timerRef = useRef(null);
  const maxTime = scenario.duration * 60;

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (elapsed >= maxTime) { clearInterval(timerRef.current); finalize(false, false); }
  }, [elapsed]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, typing, feedback]);

  const phase = scenario.phases.find(p => p.id === phaseId);

  useEffect(() => {
    if (!phase) return;
    if (phase.terminal) { finalize(phase.success, phase.partial); return; }
    if (!phase.msg) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      setMessages(m => [...m, { type:'attacker', text:phase.msg, time }]);
      if (phase.tactic && !tactics.includes(phase.tactic)) setTactics(t => [...t, phase.tactic]);
    }, 1500);
    return () => clearTimeout(t);
  }, [phaseId]);

  function handleChoice(opt) {
    if (disabled || typing) return;
    setDisabled(true);
    setTotal(t => t + 1);
    const newScore = Math.max(0, score + opt.pts);
    setScore(newScore);
    if (opt.safe) setCorrect(c => c + 1); else setDisclosures(d => d + 1);

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setMessages(m => [...m, { type:'player', text:opt.text, time }]);
    setFeedback({ text:opt.fb, good:opt.safe, pts:opt.pts });

    // Score flash
    setScoreFlash({ pts:opt.pts, key:uid() });

    setTimeout(() => {
      setFeedback(null);
      const next = scenario.phases.find(p => p.id === opt.next);
      if (!next) { finalize(opt.safe, false); return; }
      if (next.terminal) { finalize(next.success, next.partial); return; }
      setPhaseId(opt.next);
      setDisabled(false);
    }, 2000);
  }

  function finalize(success, partial) {
    clearInterval(timerRef.current);
    const result = {
      scenarioId: scenario.id, scenarioTitle: scenario.title, difficulty: scenario.diffClass,
      score, correct, total, disclosures, elapsed, tactics,
      result: success ? 'pass' : partial ? 'partial' : 'breach',
      success, partial, timestamp: new Date().toISOString(), userId: user?.id
    };
    if (user) DB.saveSession(result);
    onEnd(result);
  }

  const timeLeft = Math.max(0, maxTime - elapsed);
  const timerPct = timeLeft / maxTime * 100;
  const mins = String(Math.floor(timeLeft / 60)).padStart(2,'0');
  const secs = String(timeLeft % 60).padStart(2,'0');
  const threatColors = { SCANNING:'var(--text-dim)', LOW:'var(--accent)', MEDIUM:'var(--accent3)', HIGH:'var(--accent2)', CRITICAL:'var(--accent2)' };
  const threatLvl = tactics.length === 0 ? 'SCANNING' : tactics.length === 1 ? 'LOW' : tactics.length === 2 ? 'MEDIUM' : 'HIGH';

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', overflow:'hidden' }}>
      {/* Score flash */}
      {scoreFlash && (
        <div key={scoreFlash.key} style={{ position:'fixed', top:70, right:32, fontFamily:'var(--display)', fontSize:32, color:scoreFlash.pts>0?'var(--accent)':'var(--accent2)', pointerEvents:'none', zIndex:9997, animation:'scoreFloat 1.2s ease-out forwards' }}>
          {scoreFlash.pts > 0 ? '+' : ''}{scoreFlash.pts}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 26px', borderBottom:'1px solid var(--border)', background:'var(--bg2)', flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:'var(--display)', fontSize:17, letterSpacing:'2px', color:'var(--text-bright)' }}>{scenario.title}</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)', marginTop:2 }}>
            <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--accent2)', boxShadow:'0 0 5px var(--accent2)', marginRight:5, animation:'pulse 1.2s infinite' }} />
            LIVE{user ? ` · ${user.name}` : ' · GUEST'}
          </div>
        </div>
        <div style={{ display:'flex', gap:26, alignItems:'center' }}>
          {[['SCORE', score.toLocaleString(), 'var(--accent)'], ['THREAT', threatLvl, threatColors[threatLvl]], ['TIME', `${mins}:${secs}`, timerPct < 25 ? 'var(--accent2)' : 'var(--accent)']].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--display)', fontSize:20, color:c, letterSpacing:'1px' }}>{v}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'8px', color:'var(--text-dim)', letterSpacing:'2px' }}>{l}</div>
              {l==='TIME' && <div style={{ height:2, background:'var(--border)', marginTop:3, width:56 }}><div style={{ height:'100%', width:`${timerPct}%`, background:timerPct<25?'var(--accent2)':'var(--accent)', transition:'width 1s linear' }} /></div>}
            </div>
          ))}
          <button onClick={() => finalize(false, false)} style={{ ...S.btnSecondary, fontSize:11, padding:'7px 14px' }}>ABORT</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'270px 1fr', overflow:'hidden' }}>
        {/* Left panel */}
        <div style={{ background:'var(--bg2)', borderRight:'1px solid var(--border)', padding:16, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ ...S.card, padding:14, position:'relative' }}>
            <div style={{ position:'absolute', top:9, right:9, fontFamily:'var(--mono)', fontSize:8, color:'var(--accent2)', letterSpacing:'2px', animation:'blink 1.5s infinite' }}>LIVE</div>
            <div style={{ fontFamily:'var(--display)', fontSize:18, letterSpacing:'2px', color:'var(--text-bright)', marginBottom:2 }}>{scenario.callerName}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)', marginBottom:10 }}>{scenario.callerTitle}</div>
            {scenario.callerFlags.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:7, marginBottom:5 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:f.t==='danger'?'var(--accent2)':f.t==='warn'?'var(--accent3)':'var(--accent)', boxShadow:`0 0 5px ${f.t==='danger'?'var(--accent2)':f.t==='warn'?'var(--accent3)':'var(--accent)'}`, flexShrink:0, marginTop:4 }} />
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)', lineHeight:1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={{ ...S.card, padding:12 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--accent)', letterSpacing:'2px', marginBottom:8 }}>🔍 YOUR INTEL</div>
            {scenario.intel.map((item,i) => (
              <div key={i} style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)', padding:'3px 0', borderBottom:'1px solid rgba(255,255,255,.02)', lineHeight:1.5 }}>
                <strong style={{ color:'var(--text)' }}>{item.label}:</strong> {item.val}
              </div>
            ))}
          </div>
          <div style={{ ...S.card, padding:12 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--accent)', letterSpacing:'2px', marginBottom:8 }}>⚠️ TACTICS DETECTED</div>
            {tactics.length === 0
              ? <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)' }}>Monitoring...</div>
              : tactics.map((t,i) => <div key={i} style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text)', padding:'3px 0', borderBottom:'1px solid rgba(255,255,255,.02)' }}><span style={{ color:'var(--accent2)' }}>⚠ </span>{t}</div>)
            }
          </div>
        </div>

        {/* Chat */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div ref={messagesRef} style={{ flex:1, overflowY:'auto', padding:'18px 20px', display:'flex', flexDirection:'column', gap:12 }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:3, maxWidth:'76%', alignSelf:m.type==='player'?'flex-end':'flex-start', animation:'slideIn .25s ease' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:9, color:m.type==='player'?'var(--accent)':'var(--accent2)', letterSpacing:'1px', textAlign:m.type==='player'?'right':'left' }}>
                  {m.type==='player'?'YOU':'ATTACKER'}
                </div>
                <div style={{ padding:'11px 14px', fontSize:13, lineHeight:1.65, background:m.type==='player'?'rgba(0,245,196,.07)':'var(--surface)', border:`1px solid ${m.type==='player'?'rgba(0,245,196,.18)':'var(--border)'}`, borderLeft:m.type==='attacker'?'3px solid var(--accent2)':undefined, borderRight:m.type==='player'?'3px solid var(--accent)':undefined, textAlign:m.type==='player'?'right':'left' }}>
                  {m.text}
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'var(--text-dim)', textAlign:m.type==='player'?'right':'left' }}>{m.time}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display:'flex', gap:4, padding:'11px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderLeft:'3px solid var(--accent2)', alignSelf:'flex-start', width:'fit-content' }}>
                {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, background:'var(--accent2)', borderRadius:'50%', animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            )}
            {feedback && (
              <div style={{ padding:'10px 14px', borderLeft:`3px solid ${feedback.good?'var(--accent)':'var(--accent2)'}`, background:feedback.good?'rgba(0,245,196,.06)':'rgba(255,60,95,.06)', fontFamily:'var(--mono)', fontSize:11, color:feedback.good?'var(--accent)':'var(--accent2)', lineHeight:1.5, animation:'slideIn .25s ease' }}>
                {feedback.pts > 0 ? `+${feedback.pts}pts — ` : `${feedback.pts}pts — `}{feedback.text}
              </div>
            )}
          </div>

          {/* Options */}
          <div style={{ borderTop:'1px solid var(--border)', padding:'14px 18px', background:'var(--bg2)', flexShrink:0 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:9 }}>CHOOSE YOUR RESPONSE</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {(phase?.opts || []).map((opt, i) => (
                <button key={i} onClick={() => handleChoice(opt)} disabled={disabled || typing}
                  style={{ background:'var(--surface)', border:`1px solid ${!opt.safe?'rgba(255,60,95,.2)':'var(--border)'}`, color:'var(--text)', padding:'10px 13px', textAlign:'left', fontFamily:'var(--body)', fontSize:12, cursor:'pointer', transition:'all .2s', display:'flex', alignItems:'flex-start', gap:9, lineHeight:1.55, opacity:disabled||typing?.4:1, borderRadius:2 }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:9, color:!opt.safe?'var(--accent2)':'var(--accent)', background:!opt.safe?'rgba(255,60,95,.09)':'rgba(0,245,196,.09)', border:`1px solid ${!opt.safe?'rgba(255,60,95,.2)':'rgba(0,245,196,.2)'}`, padding:'2px 5px', flexShrink:0, marginTop:1 }}>
                    {String.fromCharCode(65+i)}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}