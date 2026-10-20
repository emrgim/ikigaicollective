// After the build: write a markdown twin of every page next to its HTML (/lab-night.md, /index.md, /lab-notes/<slug>.md) for agents.
import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', emDelimiter: '*', linkStyle: 'inlined' });
td.remove((n) => n.nodeType === 1 && (['SCRIPT', 'STYLE', 'SVG', 'CANVAS', 'FORM', 'BUTTON', 'NOSCRIPT', 'TEMPLATE'].includes(n.nodeName.toUpperCase()) || n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('hidden')));

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === '_astro' || e.name === 'preview' ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]));

export function buildMarkdown(dist) {
  let n = 0;
  for (const file of walk(dist).filter((f) => f.endsWith('.html') && !f.endsWith('404.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];
    if (!main) continue;
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    const rel = path.relative(dist, file).replace(/\.html$/, '');
    const url = `https://ikigaicollective.org${rel === 'index' ? '/' : '/' + rel}`;
    const body = td.turndown(main).replace(/\n{3,}/g, '\n\n').trim();
    fs.writeFileSync(file.replace(/\.html$/, '.md'), `<!-- ${title} | ${url} -->\n\n${body}\n`);
    n++;
  }
  return n;
}

if (process.argv[1]?.endsWith('build-md.mjs')) console.log(`${buildMarkdown('dist')} markdown pages`);
