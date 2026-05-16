// ═══════════════════════════════════════════════════
// SHARED COMPONENTS
//
// Toast         — temporary notification popup
// useToast      — hook that returns [showFn, element]
// InputField    — labeled input with focus/error states
// Modal         — centered overlay dialog
// Tag           — small colored label badge
// StatCard      — KPI card with top-color bar
// ═══════════════════════════════════════════════════

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  const color = type === 'error' ? 'var(--accent2)' : type === 'warn' ? 'var(--accent3)' : 'var(--accent)';
  return (
    <div style={{ position:'fixed', bottom:24, right:24, background:'var(--surface)', border:`1px solid ${color}`, padding:'12px 20px', fontFamily:'var(--mono)', fontSize:11, color, zIndex:10000, letterSpacing:'1px', maxWidth:300, lineHeight:1.5, animation:'fadeIn .3s ease', borderRadius:2 }}>
      {msg}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type='success') => setToast({ msg, type, key: uid() });
  const el = toast ? <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} /> : null;
  return [show, el];
}

function InputField({ label, type='text', value, onChange, placeholder, autoFocus, hint, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:6 }}>{label}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        style={{ ...S.input, borderColor: error ? 'var(--accent2)' : focused ? 'var(--accent)' : 'var(--border)' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {hint && !error && <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)', marginTop:5, lineHeight:1.5 }}>{hint}</div>}
      {error && <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--accent2)', marginTop:5 }}>{error}</div>}
    </div>
  );
}

function Modal({ title, children, onClose, width = 440 }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.88)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', padding:'32px', width:'100%', maxWidth:width, animation:'fadeIn .2s ease', position:'relative', maxHeight:'92vh', overflowY:'auto', borderRadius:2 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
          <div style={{ fontFamily:'var(--display)', fontSize:24, letterSpacing:'3px', color:'var(--text-bright)' }}>{title}</div>
          {onClose && <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:18, lineHeight:1, padding:4 }}>✕</button>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Tag({ children, color = 'var(--accent)' }) {
  return <span style={{ ...S.tag, color, borderColor: color + '44', background: color + '11' }}>{children}</span>;
}

function StatCard({ label, value, color = 'var(--accent)', sub }) {
  return (
    <div style={{ ...S.card, position:'relative', overflow:'hidden', padding:'18px 20px' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:color }} />
      <div style={{ fontFamily:'var(--display)', fontSize:34, color, letterSpacing:'2px', lineHeight:1.1 }}>{value}</div>
      <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginTop:5 }}>{label}</div>
      {sub && <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', marginTop:3 }}>{sub}</div>}
    </div>
  );
}