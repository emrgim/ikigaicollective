import { appendRow, configured, sendMail } from './_lib/google';
import { EMAIL, json, read } from './_lib/form';

export async function POST(req: Request) {
  const f = await read(req, { org: 160, kind: 40, email: 254, message: 4000 });
  if (f instanceof Response) return f;
  if (!f.org || !EMAIL.test(f.email) || !f.message) return json({ error: 'fields' }, 400);
  const to = process.env.PARTNER_INBOX;
  if (!configured() || !to) return json({ error: 'not-configured' }, 503);
  try {
    await appendRow('Partners', [f.email, f.org, f.kind, new Date().toISOString(), f.message]);
    await sendMail(to, `Partner enquiry: ${f.org} (${f.kind})`, `${f.org} · ${f.kind}\n${f.email}\n\n${f.message}`, f.email);
    return json({ ok: true });
  } catch (e) {
    console.error('partner failed', (e as Error).message);
    return json({ error: 'server' }, 502);
  }
}
