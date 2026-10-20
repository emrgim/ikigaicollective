// Google APIs over plain fetch with one OAuth refresh token (dedicated Ikigai account, app published "In production").
// Scopes: calendar.events, spreadsheets, gmail.send.
const env = (k: string) => process.env[k];
export const configured = () => ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'].every(env);

let cached: { token: string; exp: number } | undefined;
async function accessToken() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: env('GOOGLE_CLIENT_ID')!, client_secret: env('GOOGLE_CLIENT_SECRET')!, refresh_token: env('GOOGLE_REFRESH_TOKEN')!, grant_type: 'refresh_token' }),
  });
  if (!res.ok) throw new Error(`google token ${res.status}`);
  const j = await res.json();
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

async function g(url: string, init: RequestInit = {}) {
  const res = await fetch(url, { ...init, headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...init.headers } });
  if (!res.ok) throw new Error(`google ${res.status} ${url.split('?')[0]}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const meetOf = (ev: any): string[] => [ev.hangoutLink, ...(ev.conferenceData?.entryPoints ?? []).map((e: any) => e.uri), ev.location].filter(Boolean).map((u: string) => u.replace(/\/$/, ''));

/** Mail the owner when the Lab Night event looks wrong. Never throws. */
export async function alert(subject: string, text: string) {
  console.error('ALERT', subject, text);
  const to = env('ALERT_EMAIL') ?? env('PARTNER_INBOX');
  if (to) await sendMail(to, `[ikigaicollective.org] ${subject}`, text).catch(() => {});
}

// Add a guest to the Lab Night event. Patches ONLY `attendees` (no conferenceDataVersion, so Meet/location/description cannot change).
// Before and after: the event's Meet link must equal PUBLIC_MEET_URL and guestsCanSeeOtherGuests must be false. Otherwise roll back and alert.
export async function addGuest(email: string) {
  const cal = encodeURIComponent(env('GOOGLE_CALENDAR_ID') ?? 'primary');
  const id = encodeURIComponent(env('LAB_NIGHT_EVENT_ID')!);
  const base = `https://www.googleapis.com/calendar/v3/calendars/${cal}/events/${id}`;
  const meet = env('PUBLIC_MEET_URL')?.replace(/\/$/, '');
  if (!meet) throw new Error('PUBLIC_MEET_URL is not set; refusing to touch the event');
  const bad = (ev: any) => (ev.guestsCanSeeOtherGuests !== false ? 'guestsCanSeeOtherGuests is not false' : !meetOf(ev).includes(meet) ? `Meet link is not ${meet} (found: ${meetOf(ev).join(', ') || 'none'})` : '');

  const ev = await g(base);
  const before = bad(ev);
  if (before) { await alert('Lab Night event is wrong, sign-ups paused', `${before}\nEvent ${ev.id}. No guest was added.`); throw new Error(before); }
  const attendees: { email: string }[] = ev.attendees ?? [];
  if (attendees.some((a) => a.email.toLowerCase() === email)) return { added: false };

  const out = await g(`${base}?sendUpdates=all`, { method: 'PATCH', body: JSON.stringify({ attendees: [...attendees, { email }] }) });
  const after = bad(out);
  if (after) {
    await g(`${base}?sendUpdates=none`, { method: 'PATCH', body: JSON.stringify({ attendees }) }).catch(() => {});
    await alert('Lab Night event changed after a sign-up, rolled back', `${after}\nEvent ${out.id}. The guest list was restored; check the event by hand (the Meet link must stay David's).`);
    throw new Error(after);
  }
  return { added: true };
}

export async function appendRow(tab: string, row: string[]) {
  const id = env('SHEET_ID')!;
  await g(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(tab + '!A:F')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST', body: JSON.stringify({ values: [row] }),
  });
}

export async function hasEmail(tab: string, email: string) {
  const id = env('SHEET_ID')!;
  const j = await g(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(tab + '!A:A')}`);
  return (j.values ?? []).some((r: string[]) => r[0]?.toLowerCase() === email);
}

export async function sendMail(to: string, subject: string, text: string, replyTo?: string) {
  const enc = (s: string) => `=?UTF-8?B?${Buffer.from(s).toString('base64')}?=`;
  const raw = [`To: ${to}`, `Subject: ${enc(subject)}`, ...(replyTo ? [`Reply-To: ${replyTo}`] : []), 'Content-Type: text/plain; charset=UTF-8', '', text].join('\r\n');
  await g('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', body: JSON.stringify({ raw: Buffer.from(raw).toString('base64url') }) });
}
