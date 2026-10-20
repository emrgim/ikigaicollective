import { getNotes } from '../lib/notes';
import { ORIGIN, PAGES } from '../lib/seo';

// llms.txt: a plain-text map for agents. Every page also exists as markdown at <url>.md (home: /index.md).
export async function GET() {
  const notes = (await getNotes()).reverse();
  const md = (p: string) => `${ORIGIN}${p === '/' ? '/index' : p}.md`;
  const text = `# Ikigai Collective

> A studio for people using AI to design their lives. We meet every Thursday at 21:00 Rome time for Lab Night, publish what we try in open Lab Notes, and keep three values as the only membership requirement: curiosity, agency and compassion. Free to join.

Members are not named in Lab Notes. Content is CC BY-SA 4.0, code is MIT.

## Pages

${PAGES.map((p) => `- [${p.title}](${md(p.path)}): ${p.about}`).join('\n')}

## Lab Notes

${notes.map((n) => `- [${n.title}](${ORIGIN}/lab-notes/${n.slug}.md): Week ${n.week}, ${n.long}. ${n.excerpt}`).join('\n')}

## Other

- [Lab Notes feed](${ORIGIN}/lab-notes/rss.xml)
- [Sitemap](${ORIGIN}/sitemap.xml)
- [Discord](https://discord.gg/4rM6FqjVDE): where the studio lives between Thursdays
- [Substack](https://ikigaicollective.substack.com/)
`;
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
