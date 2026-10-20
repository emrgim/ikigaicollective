// Substack RSS -> src/content/notes/<slug>.md (+ cover). Idempotent: notes already on disk are never overwritten.
// Usage: node scripts/import-substack.mjs [--write]   (default is a dry run)
import fs from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

const FEED = process.env.SUBSTACK_FEED_URL ?? 'https://ikigaicollective.substack.com/feed';
const write = process.argv.includes('--write');
const notesDir = 'src/content/notes';
const covers = 'src/assets/covers';

const xml = new XMLParser({ cdataPropName: '__cdata', ignoreAttributes: false, attributeNamePrefix: '@' }).parse(await (await fetch(FEED)).text());
const items = [xml.rss.channel.item ?? []].flat();
const text = (v) => (typeof v === 'string' ? v : v?.__cdata ?? '');

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', emDelimiter: '*' });
td.remove(['style', 'script', 'form', 'button']);
td.addRule('substackBlocks', { filter: (n) => n.nodeName === 'DIV' && /subscription-widget|share-widget|button-wrapper/.test(n.className), replacement: () => '' });
td.addRule('figure', { filter: 'figure', replacement: (c) => `\n\n${c.trim()}\n\n` });

const all = fs.readdirSync(notesDir).map((f) => fs.readFileSync(path.join(notesDir, f), 'utf8'));
const known = new Set(all.map((s) => s.match(/^canonical: "?(.+?)"?$/m)?.[1]).filter(Boolean));
const days = all.map((s) => ({ t: +new Date(s.match(/^date: (\S+)/m)?.[1]), slug: s.match(/^slug: "?([^"\n]+)"?/m)?.[1] }));
let week = Math.max(...all.map((s) => +s.match(/^week: (\d+)/m)?.[1] || 0));
const q = JSON.stringify;

for (const it of items.reverse()) {
  const link = text(it.link);
  const slug = link.split('/p/')[1];
  if (!slug || known.has(link) || fs.existsSync(path.join(notesDir, `${slug}.md`))) continue;
  // Same Lab Night already on the site (any source) if its date is within 2 days: never import a second copy.
  const when = +new Date(text(it.pubDate));
  const twin = days.find((d) => Math.abs(d.t - when) <= 2 * 864e5);
  if (twin) { console.log(`skip ${slug}: within 2 days of existing note ${twin.slug}`); continue; }
  const body = td.turndown(text(it['content:encoded'])).replace(/\n{3,}/g, '\n\n').replace(/^\s*\[\s*!\[[^\]]*\]\([^)]*\)\s*\]\([^)]*\)\s*/, ''); // leading hero image duplicates the cover
  const excerpt = text(it.description) || body.split('\n\n')[0].slice(0, 190);
  const date = new Date(text(it.pubDate)).toISOString().slice(0, 10);
  const img = it.enclosure?.['@url'];
  days.push({ t: when, slug });
  week += 1; // ponytail: next number in sequence; edit by hand when a post is not a Lab Night note
  console.log(`${write ? 'import' : 'would import'}: ${slug} (${date}, week ${week}, cover ${img ? 'yes' : 'no'}, ${body.length} chars)`);
  if (!write) continue;
  let cover = '';
  if (img) {
    const res = await fetch(img);
    if (res.ok) { fs.writeFileSync(path.join(covers, `${slug}.jpg`), Buffer.from(await res.arrayBuffer())); cover = `cover: ../../assets/covers/${slug}.jpg\n`; }
  }
  fs.writeFileSync(path.join(notesDir, `${slug}.md`),
    `---\ntitle: ${q(text(it.title))}\ndate: ${date}\nweek: ${week}\nslug: ${q(slug)}\n${cover}excerpt: ${q(excerpt)}\ncanonical: ${q(link)}\nsource: substack\n---\n\n${body}\n`);
}
