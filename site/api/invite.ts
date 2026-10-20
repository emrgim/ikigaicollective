import { addGuest, appendRow, configured, hasEmail, tab } from './_lib/google.js';
import { EMAIL, json, read } from './_lib/form.js';

/** Add the guest to the event, then log the sign-up. Throws on failure. */
export async function signUp(email: string, name = '', source = '') {
  // Calendar first: if it fails nothing is recorded, so the person can retry. Sheet is the log.
  const { added } = await addGuest(email);
  const logged = !(await hasEmail(tab('Signups'), email));
  if (logged) await appendRow(tab('Signups'), [email, name, new Date().toISOString(), source]);
  return { added, logged };
}

export async function POST(req: Request) {
  const f = await read(req, { email: 254, name: 80, source: 120 });
  if (f instanceof Response) return f;
  const email = f.email.toLowerCase();
  if (!EMAIL.test(email)) return json({ error: 'email' }, 400);
  if (!configured()) return json({ error: 'not-configured' }, 503);
  try {
    await signUp(email, f.name, f.source);
    return json({ ok: true });
  } catch (e) {
    console.error('invite failed', (e as Error).message);
    return json({ error: 'server' }, 502);
  }
}
