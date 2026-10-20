import { alert, g, meetLink, tab } from './_lib/google.js';
import { signUp } from './invite.js';
import { savePartner } from './partner.js';
import { GET as studio } from './studio.js';
import { GET as cron } from './cron/substack.js';

// TEMPORARY end-to-end harness, guarded by CRON_SECRET and refused in production. Delete after use.
//   ?run=e2e      add two test guests to the TEST event + sheet/alert/partner rows + cron dry run
//   ?run=cleanup  remove the test guests again
const A = 'mayur.sachdeva91+ikigai-a@gmail.com';
const B = 'mayur.sachdeva91+ikigai-b@gmail.com';
const out = (o: unknown, status = 200) => new Response(JSON.stringify(o, null, 2), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('forbidden', { status: 403 });
  if (process.env.PUBLIC_SITE_ENV === 'production') return out({ error: 'refused in production' }, 403);
  const run = new URL(req.url).searchParams.get('run');
  const eventUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID ?? 'primary')}/events/${encodeURIComponent(process.env.LAB_NIGHT_EVENT_ID_PREVIEW!)}`;
  const snap = (e: any) => ({ title: e.summary, meet: meetLink(e), location: e.location, guestsCanSeeOtherGuests: e.guestsCanSeeOtherGuests, conferenceData: e.conferenceData ? 'present' : 'none', attendees: (e.attendees ?? []).map((a: any) => a.email) });

  if (run === 'cleanup') {
    const ev = await g(eventUrl);
    const left = (ev.attendees ?? []).filter((a: any) => ![A, B].includes(a.email.toLowerCase()));
    const after = await g(`${eventUrl}?sendUpdates=none`, { method: 'PATCH', body: JSON.stringify({ attendees: left }) });
    return out({ cleanup: snap(after) });
  }
  if (run !== 'e2e') return out({ error: 'use ?run=e2e or ?run=cleanup' }, 400);

  const r: Record<string, unknown> = { startedAt: new Date().toISOString() };
  const step = async (name: string, f: () => Promise<unknown>) => { try { r[name] = await f(); } catch (e) { r[name] = { FAILED: (e as Error).message }; } };
  await step('0_before', async () => snap(await g(eventUrl)));
  await step('1_guest_A', () => signUp(A, 'E2E A', 'e2e'));
  r.afterA = new Date().toISOString();
  await new Promise((res) => setTimeout(res, 20_000));
  await step('2_guest_B', () => signUp(B, 'E2E B', 'e2e'));
  r.afterB = new Date().toISOString();
  await step('3_dedupe_A_again', () => signUp(A, 'E2E A', 'e2e'));
  await step('4_partner_row', () => savePartner({ email: A, org: 'E2E Test Org', kind: 'AI tool', message: 'End-to-end test, ignore.' }));
  await step('5_alert_row', () => alert('E2E test alert', 'End-to-end test, ignore.'));
  await step('6_after', async () => snap(await g(eventUrl)));
  await step('7_sheet_tabs', async () => {
    const rows = async (t: string) => (await g(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/${encodeURIComponent(tab(t) + '!A:F')}`)).values?.slice(-3);
    return { Signups: await rows('Signups'), Partners: await rows('Partners'), Alerts: await rows('Alerts') };
  });
  await step('8_cron_dry_run', async () => {
    const repo = process.env.GITHUB_REPO ?? 'mayursachdeva/ikigaicollective';
    const body = await (await cron(req)).json(); // same Authorization header: authed + token => live mode, but nothing new to commit
    const perm = await (await fetch(`https://api.github.com/repos/${repo}`, { headers: { authorization: `Bearer ${process.env.GITHUB_CONTENT_TOKEN}`, 'user-agent': 'ikigai-diag' } })).json();
    return { cron: body, tokenCanPush: perm.permissions?.push ?? perm.message };
  });
  await step('9_discord', async () => {
    const set = Object.fromEntries(['DISCORD_BOT_TOKEN', 'DISCORD_GUILD_ID', 'DISCORD_LOOP_CHANNEL_ID', 'DISCORD_WEBSITE_TAG_ID'].map((k) => [k, !!process.env[k]]));
    const res = await studio();
    return { envPresent: set, status: res.status, body: await res.json() };
  });
  return out(r);
}
