import { getNotes } from '../../lib/notes';
import { ORIGIN, xml } from '../../lib/seo';

export async function GET() {
  const notes = (await getNotes()).reverse();
  const items = notes.map((n) => `    <item><title>${xml(n.title)}</title><link>${ORIGIN}/lab-notes/${n.slug}</link><guid>${ORIGIN}/lab-notes/${n.slug}</guid><pubDate>${n.date.toUTCString()}</pubDate><description>${xml(n.excerpt)}</description></item>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n    <title>Ikigai Collective Lab Notes</title><link>${ORIGIN}/lab-notes</link><description>Weekly notes from every Lab Night.</description><language>en</language>\n${items}\n</channel></rss>\n`, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
