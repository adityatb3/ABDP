# ABDP
### Awareness-Based Defense Protocol

> *Train the human firewall.*

10 interactive social engineering attack simulations — vishing calls, CEO wire fraud, phishing drills, physical tailgating, insider threats and more. Free, no download, no backend required.

**Live at:** https://abdp.io

---

## Project Structure

```
abdp/
│
├── index.html              # HTML shell — loads all scripts in order
├── styles.css              # Global styles and CSS variables
├── build.js                # Production build script (removes Babel warning)
├── package.json            # Build dependencies
│
└── src/
    ├── auth.js             # Password hashing (SHA-256 via Web Crypto API)
    ├── db.js               # localStorage abstraction layer
    ├── scenarios.js        # All 10 scenario data (phases, choices, branching)
    ├── constants.js        # Shared style objects, color maps, uid helper
    │
    ├── components.jsx      # Shared UI: Toast, Modal, InputField, Tag, StatCard
    ├── App.jsx             # Root component — view state machine
    ├── AuthScreen.jsx      # Landing page + Login + Signup
    ├── GuestArena.jsx      # Unauthenticated play view
    ├── PlayerDashboard.jsx # Logged-in player (Play / History / Profile)
    ├── GameArena.jsx       # Core gameplay screen
    ├── ResultScreen.jsx    # Post-game debrief
    ├── ScenarioGrid.jsx    # Filterable scenario card grid
    └── ChangePasswordModal.jsx  # Password update dialog
```

---

## Running Locally

Open `index.html` directly in a browser — no server needed for development.

> Some browsers block local file imports. If scripts do not load, run a simple local server:
> ```bash
> npx serve .
> # or
> python3 -m http.server 3000
> ```
> Then open http://localhost:3000

---

## Deploy to GitHub Pages

### Quick deploy (Babel console warning — invisible to users)
1. Push all files to a GitHub repo maintaining the src/ folder structure
2. Settings → Pages → Deploy from branch → main → / (root)
3. Live at https://yourusername.github.io/abdp

### Production deploy (no warning — recommended)
```bash
npm install
npm run build
```
Push the generated dist/index.html to GitHub as index.html.

---

## Adding a Scenario

Edit src/scenarios.js. Each scenario follows this structure:

```js
your_id: {
  id: "your_id",
  title: "SCENARIO TITLE",
  subtitle: "Short description shown on the scenario card.",
  difficulty: "ROOKIE",
  diffClass: "easy",
  type: "VOICE",
  duration: 6,
  callerName: "Attacker Name",
  callerTitle: "Their role or contact info",
  callerFlags: [
    { t: "danger", text: "Red flag shown in side panel" },
    { t: "warn",   text: "Warning shown in side panel"  },
  ],
  intel: [
    { label: "Your role", val: "Description" },
  ],
  phases: [
    {
      id: "p1",
      msg: "Attacker message text.",
      tactic: "Tactic Name",
      opts: [
        { text: "Response", safe: true,  pts: 100,  next: "p2",       fb: "Feedback." },
        { text: "Response", safe: false, pts: -200, next: "end_lose", fb: "Feedback." },
      ]
    },
    { id: "end_win",     terminal: true, success: true  },
    { id: "end_partial", terminal: true, partial: true  },
    { id: "end_lose",    terminal: true, success: false },
  ]
}
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| UI | React 18 (CDN) |
| Styling | CSS custom properties + inline styles |
| Auth | localStorage + SHA-256 (Web Crypto API) |
| Storage | localStorage |
| Build | Babel (optional) |
| Hosting | GitHub Pages |

No backend. No database. No API keys. Works offline after first load.

---

## Roadmap

- [ ] Mobile layout and responsive design
- [ ] iOS and Android app
- [ ] 15 scenarios (5 more in progress)
- [ ] Backend (Supabase) for cross-device sync
- [ ] Admin dashboard for team reporting
- [ ] Daily challenge mode
