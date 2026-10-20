// One-shot seed: lab-notes/src/*.md (repo) -> site/src/content/notes/*.md, covers, and old-URL redirects.
// Source files are never modified. Re-run is safe (outputs are overwritten).
// Usage: node scripts/seed-notes.mjs   (from site/)
import fs from 'node:fs';
import path from 'node:path';

const repo = path.resolve(import.meta.dirname, '..', '..', 'lab-notes');
const out = path.resolve(import.meta.dirname, '..');
const files = fs.readdirSync(path.join(repo, 'src')).filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f)).sort();

// Source notes have frontmatter without a leading `---` (one file has it); accept both.
const parse = (raw) => {
  const text = raw.replace(/^---\r?\n/, '');
  const i = text.indexOf('\n---');
  const meta = Object.fromEntries(text.slice(0, i).split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  return { meta, body: text.slice(i + 4).replace(/^\r?\n/, '').trim() + '\n' };
};

const excerpt = (body) => {
  const first = body.split(/\n\s*\n/)[0].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  if (first.length <= 190) return first;
  const cut = first.slice(0, 190);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return end > 90 ? cut.slice(0, end + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '...';
};

const redirects = [];
// Substack is the source of truth: these repo notes were replaced by the Substack posts of the same Lab Night (different title/slug).
const RENAMED = { '2026-10-01-between-ice-and-gas': 'between-frozen-and-gaseous', '2026-10-08-sundoku': 'tsundoku' };
for (const f of files) {
  const stem = f.replace(/\.md$/, '');
  const slug = stem.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  if (RENAMED[stem]) {
    for (const source of [`/lab-notes/${stem}.html`, `/lab-notes/${stem}`, `/lab-notes/${slug}`]) redirects.push({ source, destination: `/lab-notes/${RENAMED[stem]}`, permanent: true });
    continue;
  }
  let { meta, body } = parse(fs.readFileSync(path.join(repo, 'src', f), 'utf8'));
  // Lab Notes stay verbatim, em dashes included (the no em dash rule covers new site copy only).
  const cover = `${stem}.jpg`;
  fs.copyFileSync(path.join(repo, 'img', cover), path.join(out, 'src/assets/covers', `${slug}.jpg`));
  fs.copyFileSync(path.join(repo, 'img', cover), path.join(out, 'public/lab-notes/img', cover)); // keeps old og:image URLs alive
  const q = (s) => JSON.stringify(s);
  fs.writeFileSync(path.join(out, 'src/content/notes', `${slug}.md`),
    `---\ntitle: ${q(meta.title)}\ndate: ${meta.date}\nweek: ${+meta.week}\nslug: ${q(slug)}\ncover: ../../assets/covers/${slug}.jpg\nexcerpt: ${q(excerpt(body))}\nsource: repo\n---\n\n${body}`);
  for (const source of [`/lab-notes/${stem}.html`, `/lab-notes/${stem}`]) redirects.push({ source, destination: `/lab-notes/${slug}`, permanent: true });
}
redirects.push(
  { source: '/lab-notes/index.html', destination: '/lab-notes', permanent: true },
  { source: '/terms.html', destination: '/terms', permanent: true },
  { source: '/privacy.html', destination: '/privacy', permanent: true },
  { source: '/index.html', destination: '/', permanent: true },
  // Any other .html goes to its clean URL. cleanUrls is off on purpose: it strips .html before the redirects above run,
  // which sent old note URLs to a 404. Clean URLs are served by the rewrites instead.
  { source: '/:path(.*)\\.html', destination: '/:path', permanent: true },
);
const rewrites = [
  { source: '/:path((?!.*\\.).+)', destination: '/:path.html' },
];
fs.writeFileSync(path.join(out, 'vercel.json'), JSON.stringify({ trailingSlash: false, redirects, rewrites }, null, 2) + '\n');
for (const a of ['cover.jpg', 'ikigaicollective-logo.jpg']) fs.copyFileSync(path.join(repo, '..', a), path.join(out, 'public', a));
console.log(`${files.length} notes, ${redirects.length} redirects`);
