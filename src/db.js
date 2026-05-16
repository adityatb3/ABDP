// ═══════════════════════════════════════════════════
// DATABASE — localStorage abstraction layer
//
// All data is stored locally in the user's browser.
// Keys are namespaced with 'abdp_' to avoid conflicts.
// ═══════════════════════════════════════════════════

const DB = {

  // ── Core get/set/del ──────────────────────────
  get: (key, def = null) => {
    try {
      const v = localStorage.getItem('abdp_' + key);
      return v ? JSON.parse(v) : def;
    } catch { return def; }
  },

  set: (key, val) => {
    try { localStorage.setItem('abdp_' + key, JSON.stringify(val)); } catch {}
  },

  del: (key) => localStorage.removeItem('abdp_' + key),

  // ── Users ─────────────────────────────────────
  getUsers: () => DB.get('users', {}),

  saveUser: (u) => {
    const users = DB.getUsers();
    users[u.id] = u;
    DB.set('users', users);
  },

  getUserByEmail: (email) =>
    Object.values(DB.getUsers()).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    ),

  getUserById: (id) => DB.getUsers()[id],

  // ── Sessions ──────────────────────────────────
  getSessions: () => DB.get('sessions', []),

  saveSession: (s) => {
    const all = DB.getSessions();
    all.push(s);
    // Cap at 500 sessions to avoid filling localStorage
    if (all.length > 500) all.splice(0, all.length - 500);
    DB.set('sessions', all);
  },

  getSessionsByUser: (uid) =>
    DB.getSessions().filter(s => s.userId === uid),

  // ── Auth session ──────────────────────────────
  getAuthSession:   ()  => DB.get('authSession', null),
  setAuthSession:   (u) => DB.set('authSession', { id: u.id, email: u.email }),
  clearAuthSession: ()  => DB.del('authSession'),
};

// Unique ID generator
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
