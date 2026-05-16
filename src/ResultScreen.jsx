// ═══════════════════════════════════════════════════
// RESULT SCREEN
//
// Full-page debrief shown after a scenario ends.
// Displays: badge (HELD / PARTIAL / BREACHED),
// outcome title, post-mission analysis breakdown,
// and navigation buttons (replay, home).
//
// Props:
//   result    — result object from GameArena.onEnd
//   onReplay  — callback to replay the same scenario
//   onHome    — callback to return to arena/dashboard
// ═══════════════════════════════════════════════════

function ResultScreen({ result, onReplay, onHome }) {
  const pct = result.total > 0 ? Math.round(result.correct / result.total * 100) : 0;
  const rating = pct === 100 ? 'GHOST LEVEL' : pct >= 70 ? 'OPERATIVE' : pct >= 40 ? 'ROOKIE' : 'COMPROMISED';
  const rColor = pct >= 70 ? 'var(--accent)' : pct >= 40 ? 'var(--accent3)' : 'var(--accent2)';
  const badge = result.success ? 'HELD' : result.partial ? 'PARTIAL' : 'BREACHED';
  const badgeColor = result.success ? 'var(--accent)' : result.partial ? 'var(--accent3)' : 'var(--accent2)';
  const mins = Math.floor(result.elapsed / 60), secs = result.elapsed % 60;

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'56px 40px', textAlign:'center', background:'var(--bg)' }}>
      <div style={{ fontFamily:'var(--display)', fontSize:80, letterSpacing:'4px', color:badgeColor, textShadow:`0 0 28px ${badgeColor}44`, marginBottom:12 }}>{badge}</div>
      <div style={{ fontFamily:'var(--display)', fontSize:36, color:'var(--text-bright)', letterSpacing:'4px', marginBottom:10 }}>
        {result.success ? 'ATTACK REPELLED' : result.partial ? 'PARTIAL BREACH' : 'COMPROMISED'}
      </div>
      <div style={{ fontSize:14, color:'var(--text-dim)', maxWidth:440, lineHeight:1.8, marginBottom:32 }}>
        {result.success ? 'You maintained operational security throughout. The attacker failed to extract anything of value.'
          : result.partial ? 'You stopped the attack but may have disclosed some information. Review the debrief carefully.'
          : 'The attacker achieved their objective. Study each decision point to understand where it went wrong.'}
      </div>

      <div style={{ ...S.card, width:'100%', maxWidth:500, marginBottom:26, textAlign:'left' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--accent)', letterSpacing:'3px', textTransform:'uppercase', marginBottom:16 }}>POST-MISSION ANALYSIS</div>
        {[
          ['Final Score', result.score.toLocaleString(), result.score > 0 ? 'var(--accent)' : 'var(--text-dim)'],
          ['Correct Responses', `${result.correct} / ${result.total}`, pct >= 70 ? 'var(--accent)' : 'var(--accent3)'],
          ['Information Disclosed', result.disclosures === 0 ? 'None — Clean Run' : `${result.disclosures} disclosure${result.disclosures > 1 ? 's' : ''}`, result.disclosures === 0 ? 'var(--accent)' : 'var(--accent2)'],
          ['Tactics Identified', `${(result.tactics||[]).length} detected`, 'var(--accent3)'],
          ['Session Duration', `${mins}m ${secs}s`, 'var(--text)'],
          ['Performance Rating', rating, rColor],
        ].map(([label, value, color]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
            <span style={{ color:'var(--text-dim)' }}>{label}</span>
            <span style={{ fontFamily:'var(--mono)', fontSize:13, color }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        <button style={S.btnPrimary} onClick={onReplay}>PLAY AGAIN</button>
        <button style={S.btnSecondary} onClick={onHome}>← BACK TO ARENA</button>
      </div>
    </div>
  );
}