import { appendRow, configured, tab } from './_lib/google.js';
import { EMAIL, json, read } from './_lib/form.js';

// Partner enquiries go to the Partners tab; the sheet's own "notify me right away" setting emails the owner.
export const savePartner = (f: Record<string, string>) => appendRow(tab('Partners'), [f.email, f.org, f.kind, new Date().toISOString(), f.message]);

export async function POST(req: Request) {
  const f = await read(req, { org: 160, kind: 40, email: 254, message: 4000 });
  if (f instanceof Response) return f;
  if (!f.org || !EMAIL.test(f.email) || !f.message) return json({ error: 'fields' }, 400);
  if (!configured()) return json({ error: 'not-configured' }, 503);
  try {
    await savePartner(f);
    return json({ ok: true });
  } catch (e) {
    console.error('partner failed', (e as Error).message);
    return json({ error: 'server' }, 502);
  }
}
