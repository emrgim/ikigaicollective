import { getNotes } from '../../lib/notes';
import { ORIGIN } from '../../lib/seo';

// Machine-readable index of every Lab Note, newest first: the data source for agents and the read-only MCP server.
// Each note also exists as HTML (url) and as a markdown twin (markdown, written by scripts/build-md.mjs).
export async function GET() {
  const notes = (await getNotes()).reverse();
  const index = {
    version: 1,
    generated: new Date().toISOString(),
    site: ORIGIN,
    license: { content: 'CC BY-SA 4.0', code: 'MIT' },
    count: notes.length,
    notes: notes.map((n) => ({
      title: n.title,
      slug: n.slug,
      week: n.week,
      date: n.date.toISOString(),
      summary: n.excerpt,
      url: `${ORIGIN}/lab-notes/${n.slug}`,
      markdown: `${ORIGIN}/lab-notes/${n.slug}.md`,
      ...(n.canonical ? { canonical: n.canonical } : {}),
      source: n.source,
    })),
  };
  return new Response(JSON.stringify(index, null, 2) + '\n', { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
