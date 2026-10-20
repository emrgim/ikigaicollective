import crafts from './_lib/crafts.js';
import { json } from './_lib/form.js';

// Studio feed: public threads in the #the-loop forum that carry the website tag. Names are never exposed, only a craft.
const STAGES = ['design', 'implement', 'measure', 'iterate', 'needs-input', 'shipped'];
// Forum tags carry emoji prefixes ("🔨 Implement"): compare on the letters only.
const norm = (name: string) => name.replace(/^[^a-z]+/i, '').trim().toLowerCase();
const API = 'https://discord.com/api/v10';
const h = { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' };

const MOCK = [
  { title: 'Mock thread: a tiny agent that books my week', stage: 'Implement', created: '2026-10-18T09:00:00Z', url: 'https://discord.gg/', craft: 'A designer' },
  { title: 'Mock thread: measuring my own mornings', stage: 'Measure', created: '2026-10-14T09:00:00Z', url: 'https://discord.gg/', craft: 'A scientist' },
  { title: 'Mock thread: the first version shipped', stage: 'shipped', created: '2026-10-09T09:00:00Z', url: 'https://discord.gg/', craft: 'A member' },
];

const ok = (threads: unknown[]) => new Response(JSON.stringify({ threads }), { headers: { 'content-type': 'application/json', ...h } });

export async function GET() {
  const { DISCORD_BOT_TOKEN: token, DISCORD_GUILD_ID: guild, DISCORD_LOOP_CHANNEL_ID: channel, DISCORD_WEBSITE_TAG_ID: tag } = process.env;
  if (!token || !guild || !channel || !tag) return process.env.PUBLIC_SITE_ENV === 'production' ? json({ error: 'not-configured' }, 503) : ok(MOCK);
  const d = async (path: string) => {
    const res = await fetch(API + path, { headers: { authorization: `Bot ${token}` } });
    if (!res.ok) throw new Error(`discord ${res.status} ${path}`);
    return res.json();
  };
  try {
    const [ch, active, archived, roles] = await Promise.all([
      d(`/channels/${channel}`), d(`/guilds/${guild}/threads/active`), d(`/channels/${channel}/threads/archived/public?limit=50`), d(`/guilds/${guild}/roles`),
    ]);
    const stageOf = new Map<string, string>(ch.available_tags.filter((t: { name: string }) => STAGES.includes(norm(t.name))).map((t: { id: string; name: string }) => [t.id, norm(t.name)]));
    const roleName = new Map<string, string>(roles.map((r: { id: string; name: string }) => [r.id, r.name]));
    const mine = [...active.threads.filter((t: { parent_id: string }) => t.parent_id === channel), ...archived.threads]
      .filter((t) => t.applied_tags?.includes(tag))
      .sort((a, b) => +new Date(b.thread_metadata.create_timestamp) - +new Date(a.thread_metadata.create_timestamp))
      .slice(0, 3);
    const threads = await Promise.all(mine.map(async (t) => {
      const m = await d(`/guilds/${guild}/members/${t.owner_id}`).catch(() => ({ roles: [] }));
      const craft = (m.roles as string[]).map((r) => crafts[roleName.get(r) ?? '']).find(Boolean) ?? 'A member';
      return { title: t.name, stage: t.applied_tags.map((i: string) => stageOf.get(i)).find(Boolean) ?? 'design', created: t.thread_metadata.create_timestamp, url: `https://discord.com/channels/${guild}/${t.id}`, craft };
    }));
    return ok(threads);
  } catch (e) {
    console.error('studio feed failed', (e as Error).message);
    return json({ error: 'discord' }, 502);
  }
}
