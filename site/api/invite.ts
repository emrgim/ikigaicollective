import { addGuest, appendRow, configured, hasEmail } from './_lib/google';
import { EMAIL, json, read } from './_lib/form';

export async function POST(req: Request) {
  const f = await read(req, { email: 254, name: 80, source: 120 });
  if (f instanceof Response) return f;
  const email = f.email.toLowerCase();
  if (!EMAIL.test(email)) return json({ error: 'email' }, 400);
  if (!configured()) return json({ error: 'not-configured' }, 503);
  try {
    // Calendar first: if it fails nothing is recorded, so the person can retry. Sheet is the log.
    await addGuest(email);
    if (!(await hasEmail('Signups', email))) await appendRow('Signups', [email, f.name, new Date().toISOString(), f.source]);
    return json({ ok: true });
  } catch (e) {
    console.error('invite failed', (e as Error).message);
    return json({ error: 'server' }, 502);
  }
}
