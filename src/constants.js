// ═══════════════════════════════════════════════════
// CONSTANTS — Shared style objects and lookup maps
// ═══════════════════════════════════════════════════

const DIFF_COLORS = {
  easy:   '#00f5c4',  // green  — ROOKIE
  medium: '#f5a623',  // yellow — OPERATIVE
  hard:   '#ff3c5f',  // red    — GHOST
};

const DIFF_LABELS = {
  easy:   'ROOKIE',
  medium: 'OPERATIVE',
  hard:   'GHOST',
};

// ── Inline style objects (used instead of CSS classes for React components) ──

const S = {
  // Card surface
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 2,
    padding: '24px',
  },

  // Text inputs
  input: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    color: 'var(--text-bright)',
    padding: '11px 14px',
    fontFamily: 'var(--mono)',
    fontSize: 13,
    width: '100%',
    outline: 'none',
    borderRadius: 2,
    transition: 'border-color .2s',
  },

  // Primary button (filled accent)
  btnPrimary: {
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    padding: '11px 28px',
    fontFamily: 'var(--display)',
    fontSize: 17,
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'all .2s',
    clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
  },

  // Secondary button (outlined)
  btnSecondary: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    padding: '10px 24px',
    fontFamily: 'var(--display)',
    fontSize: 15,
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'all .2s',
    clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
  },

  // Ghost button (no border, dimmed text)
  btnGhost: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: 10,
    cursor: 'pointer',
    letterSpacing: '2px',
    padding: '8px',
    transition: 'color .2s',
    textTransform: 'uppercase',
  },

  // Small label tag
  tag: {
    fontFamily: 'var(--mono)',
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '2px 8px',
    border: '1px solid',
    display: 'inline-block',
    borderRadius: 1,
  },
};
