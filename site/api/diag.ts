import { g } from './_lib/google.js';

// TEMPORARY: lists the IDs needed for env setup. Guarded by CRON_SECRET. Delete after use.
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('forbidden', { status: 403 });
  const out: Record<string, unknown> = {};
  try {
    const cal = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID ?? 'primary');
    const ev = await g(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events?q=Lab%20Night&maxResults=40&singleEvents=false&showDeleted=false`);
    out.calendar = (ev.items ?? []).filter((e: any) => e.recurrence).map((e: any) => ({ id: e.id, title: e.summary, recurring: !!e.recurrence, start: e.start?.dateTime ?? e.start?.date, location: e.location, conferenceSolution: e.conferenceData?.conferenceSolution?.name, linksInDescription: (String(e.description ?? '').match(/https?:\/\/[^\s<>"')]+/g) ?? []), meet: [e.hangoutLink, ...(e.conferenceData?.entryPoints ?? []).map((p: any) => p.uri)].filter(Boolean), guestsCanSeeOtherGuests: e.guestsCanSeeOtherGuests, attendees: (e.attendees ?? []).length }));
  } catch (e) { out.calendar = String((e as Error).message); }
  const { DISCORD_BOT_TOKEN: t, DISCORD_GUILD_ID: guild, DISCORD_LOOP_CHANNEL_ID: ch } = process.env;
  const d = async (path: string) => { const r = await fetch('https://discord.com/api/v10' + path, { headers: { authorization: `Bot ${t}` } }); if (!r.ok) throw new Error(`discord ${r.status} ${path}`); return r.json(); };
  try { out.forumTags = (await d(`/channels/${ch}`)).available_tags.map((x: any) => ({ id: x.id, name: x.name, emoji: x.emoji_name })); } catch (e) { out.forumTags = String((e as Error).message); }
  try { out.roles = (await d(`/guilds/${guild}/roles`)).map((r: any) => r.name); } catch (e) { out.roles = String((e as Error).message); }
  return new Response(JSON.stringify(out, null, 2), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
