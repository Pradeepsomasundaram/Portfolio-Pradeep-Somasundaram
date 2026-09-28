#!/usr/bin/env node
// Fails if a Netlify function reads a process.env.VAR that isn't documented in
// .env.example, or if .env.example documents one that's no longer read anywhere.
// Catches env vars going silently undocumented (or stale) as the functions evolve.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const FUNCTIONS_DIR = 'netlify';
const ENV_EXAMPLE = '.env.example';
// Always fine to leave undocumented / auto-provided by the platform.
const IGNORE = new Set(['NODE_ENV', 'URL', 'DEPLOY_URL', 'CONTEXT', 'NETLIFY']);

function collectFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else if (/\.mts$/.test(entry.name)) out.push(full);
  }
  return out;
}

const used = new Set();
for (const file of collectFiles(FUNCTIONS_DIR)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) used.add(m[1]);
}

const documented = new Set();
for (const line of readFileSync(ENV_EXAMPLE, 'utf8').split('\n')) {
  const m = /^#?\s*([A-Z][A-Z0-9_]*)\s*=/.exec(line.trim());
  if (m) documented.add(m[1]);
}

const missing = [...used].filter((v) => !documented.has(v) && !IGNORE.has(v)).sort();
const stale = [...documented].filter((v) => !used.has(v) && !IGNORE.has(v)).sort();

if (missing.length === 0 && stale.length === 0) {
  console.log(`check-env-example: ${documented.size} vars documented, ${used.size} read — in sync.`);
  process.exit(0);
}
if (missing.length) console.error(`Read by a function but missing from ${ENV_EXAMPLE}:\n  ${missing.join('\n  ')}`);
if (stale.length) console.error(`Documented in ${ENV_EXAMPLE} but no function reads them:\n  ${stale.join('\n  ')}`);
process.exit(1);
