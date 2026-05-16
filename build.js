// ═══════════════════════════════════════════════════
// ABDP — Production Build Script
//
// Compiles all JSX files to plain JS, then bundles
// everything into a single self-contained index.html
// with no Babel runtime warning.
//
// Usage:
//   npm install        (first time only)
//   npm run build      (generates dist/index.html)
//
// Output: dist/index.html
//   - All JSX precompiled to plain JS
//   - Babel CDN script tag removed
//   - CSS and JS inlined (single file, no server needed)
//   - Ready to push to GitHub Pages
// ═══════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');

// ── Check Babel is installed ──────────────────────
let babel;
try {
  babel = require('@babel/core');
} catch (e) {
  console.error('\n❌ Missing dependencies. Run this first:\n');
  console.error('   npm install\n');
  process.exit(1);
}

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ── Create dist/ folder ───────────────────────────
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

console.log('\n📦 Building ABDP...\n');

// ── Babel config ──────────────────────────────────
const BABEL_CONFIG = {
  presets: [
    ['@babel/preset-env', {
      targets: { browsers: ['last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Safari versions'] },
      modules: false,
    }],
    ['@babel/preset-react', {
      runtime: 'classic',
      pragma: 'React.createElement',
      pragmaFrag: 'React.Fragment',
    }],
  ],
  sourceMaps: false,
  comments: false,
  compact: true,
};

// ── Files to compile ──────────────────────────────
// Plain JS files (no JSX — just read as-is)
const PLAIN_JS = [
  'src/auth.js',
  'src/db.js',
  'src/scenarios.js',
  'src/constants.js',
];

// JSX files (need Babel compilation)
const JSX_FILES = [
  'src/components.jsx',
  'src/GameArena.jsx',
  'src/ResultScreen.jsx',
  'src/ScenarioGrid.jsx',
  'src/PlayerDashboard.jsx',
  'src/ChangePasswordModal.jsx',
  'src/GuestArena.jsx',
  'src/AuthScreen.jsx',
  'src/App.jsx',
];

// ── Compile each file ─────────────────────────────
let allJS = '';

// React hook destructure (needed at top of combined output)
allJS += `const { useState, useEffect, useRef, useCallback } = React;\n\n`;

for (const file of PLAIN_JS) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) { console.error(`❌ Missing: ${file}`); process.exit(1); }
  const content = fs.readFileSync(fullPath, 'utf8');
  // Strip comments for smaller output
  const stripped = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  allJS += `// --- ${file} ---\n${stripped}\n\n`;
  console.log(`   ✓ ${file} (plain JS)`);
}

for (const file of JSX_FILES) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) { console.error(`❌ Missing: ${file}`); process.exit(1); }
  const content = fs.readFileSync(fullPath, 'utf8');
  let compiled;
  try {
    const result = babel.transformSync(content, BABEL_CONFIG);
    compiled = result.code;
  } catch (e) {
    console.error(`\n❌ Babel error in ${file}:\n${e.message}\n`);
    process.exit(1);
  }
  allJS += `// --- ${file} ---\n${compiled}\n\n`;
  const kb = (compiled.length / 1024).toFixed(1);
  console.log(`   ✓ ${file} (${kb}KB compiled)`);
}

// Mount line
allJS += `ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));\n`;

// ── Read CSS ──────────────────────────────────────
const cssPath = path.join(ROOT, 'styles.css');
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

// ── Read index.html and inline everything ─────────
const htmlPath = path.join(ROOT, 'index.html');
if (!fs.existsSync(htmlPath)) { console.error('❌ Missing index.html'); process.exit(1); }
let html = fs.readFileSync(htmlPath, 'utf8');

// Remove external stylesheet link
html = html.replace(/<link rel="stylesheet" href="styles\.css">\n?/, '');

// Remove Babel CDN script tag
html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/babel-standalone\/[^"]+"><\/script>\n?/, '');

// Remove all individual script tags (src/... files + mount script)
html = html.replace(/<script src="src\/[^"]+"><\/script>\n?/g, '');
html = html.replace(/<script type="text\/babel" src="src\/[^"]+"><\/script>\n?/g, '');

// Remove the inline mount script block
html = html.replace(/<script type="text\/babel">\s*const \{ useState[\s\S]*?ReactDOM\.createRoot[\s\S]*?<\/script>\n?/, '');

// Inject inlined CSS before </head>
html = html.replace('</head>', `<style>\n${css}\n</style>\n</head>`);

// Inject compiled JS before </body>
html = html.replace('</body>', `<script>\n${allJS}\n</script>\n</body>`);

// ── Write output ──────────────────────────────────
const outPath = path.join(DIST, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');

const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`\n✅ Build complete!`);
console.log(`   Output: dist/index.html (${sizeKB}KB)`);
console.log(`   No Babel runtime. No external CSS. Single file.\n`);
console.log(`🚀 Push dist/index.html to GitHub Pages to deploy.\n`);
