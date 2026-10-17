#!/usr/bin/env node
// Lists every place in the code that still contains the ORIGINAL site
// owner's personal details. Use it two ways:
//   * Selling/customising the template: run it, and everything listed is
//     either something to move into site.config.ts or page copy to rewrite.
//   * Maintaining the site: run it after adding features to catch
//     personal details that crept back in outside site.config.ts.
//
//     node scripts/check-personalization.mjs          # report
//     node scripts/check-personalization.mjs --strict # exit 1 if any CODE-level leftovers (for CI)
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

// Always scan the whole project, wherever this is run from. (Using the current
// folder meant running it from inside scripts/ scanned only scripts/ — and
// reported this file's own search patterns as "personal details".)
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
if (!existsSync(join(ROOT, 'package.json')) || !existsSync(join(ROOT, 'site.config.ts'))) {
  console.error(`Expected the project root at ${ROOT} (with package.json and site.config.ts) — is this script still in <project>/scripts/?`)
  process.exit(2)
}
console.log(`Scanning ${ROOT}`)
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'supabase', 'scripts', 'public'])
// globals.css holds the on-site accent color tokens: site.config.ts says to change both together.
const SKIP_FILES = new Set(['site.config.ts', 'app/components/ExperienceTimeline.tsx', 'app/globals.css'])

const PATTERNS = [
  ['Full name',        /Muhammad Qasim Imran/g],
  ['First name',       /\bQasim\b/g],
  ['Domain',           /muhammadqasimimran\.me/g],
  ['Social handles',   /qasimdevelops|mqasimimran|muhammadqasimimran|muhammad-qasim-imran/g],
  ['Personal emails',  /m\.qasimimran01@gmail\.com|qasimshibli12@gmail\.com/g],
  ['Phone / WhatsApp', /923249453952/g],
  ['Location',         /Lahore|Pakistan/g],
  ['Orgs / employers', /TEDx|UMT\b|Big Brains|MoinSystems|Logitrix|Frag Games/g],
  ['Brand hex',        /#aa002a/gi],
]

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (/\.(tsx?|mjs|css|json)$/.test(name) && !/package(-lock)?\.json$/.test(name)) yield p
  }
}

const rows = []
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).split(sep).join('/')
  if (SKIP_FILES.has(rel)) continue
  // Comments explain things (often *mentioning* the original owner); only real
  // code and copy count. Strip block and line comments (but not `https://`).
  const text = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
  const hits = {}
  for (const [label, re] of PATTERNS) {
    const n = (text.match(re) || []).length
    if (n) hits[label] = n
  }
  if (Object.keys(hits).length) rows.push({ rel, hits })
}

// "Content" files hold long-form copy about the owner (journey, resume,
// legal text) — you rewrite those, rather than template them.
const isContent = (rel) => /^app\/(about|resume|tech-stack|privacy)\//.test(rel) || /^app\/admin\/resume\//.test(rel)

const code = rows.filter((r) => !isContent(r.rel)), content = rows.filter((r) => isContent(r.rel))
const fmt = (r) => `  ${r.rel}\n      ${Object.entries(r.hits).map(([k, v]) => `${k} ×${v}`).join(', ')}`

console.log('\n== CODE still holding personal details — should come from site.config.ts ==')
console.log(code.length ? code.map(fmt).join('\n') : '  none ✓')
console.log('\n== PAGE COPY about the original owner — rewrite for each site ==')
console.log(content.length ? content.map(fmt).join('\n') : '  none ✓')
console.log(`\n${code.length} code file(s), ${content.length} content file(s) with personal details.`)
if (process.argv.includes('--strict') && code.length) process.exit(1)
