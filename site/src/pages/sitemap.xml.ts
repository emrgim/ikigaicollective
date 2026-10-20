import { getNotes } from '../lib/notes';
import { ORIGIN, PAGES } from '../lib/seo';

export async function GET() {
  const notes = await getNotes();
  const url = (path: string, lastmod?: string) => `  <url><loc>${ORIGIN}${path === '/' ? '' : path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  const body = [...PAGES.map((p) => url(p.path)), ...notes.map((n) => url(`/lab-notes/${n.slug}`, n.date.toISOString().slice(0, 10)))].join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
