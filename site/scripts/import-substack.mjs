// Substack RSS -> src/content/notes/<slug>.md (+ cover). Idempotent. Usage: node scripts/import-substack.mjs [--write]  (default: dry run)
// The daily Vercel cron (api/cron/substack.ts) uses the same logic; this is the manual / local path.
import fs from 'node:fs';
import path from 'node:path';
import { download, facts, fetchFeed, plan } from '../api/_lib/substack.js';

const write = process.argv.includes('--write');
const notes = 'src/content/notes';
const existing = facts(fs.readdirSync(notes).map((f) => fs.readFileSync(path.join(notes, f), 'utf8')));
let items;
try { items = await fetchFeed(); } catch (e) { console.error(e.message); process.exit(1); }

for (const p of plan(items, existing, console.log)) {
  console.log(`${write ? 'import' : 'would import'}: ${p.slug} (${p.date}, week ${p.week}, cover ${p.coverUrl ? 'yes' : 'no'}, ${p.chars} chars)`);
  if (!write) continue;
  const img = p.coverUrl && (await download(p.coverUrl));
  if (img) fs.writeFileSync(path.join('src/assets/covers', `${p.slug}.jpg`), img);
  fs.writeFileSync(path.join(notes, `${p.slug}.md`), p.md(!!img));
}
