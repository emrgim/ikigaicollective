import { announce, track } from '../lib/track';
import { IS_LIVE } from '../lib/env';

// Invite and partner forms. They post JSON to the form's action. Until the endpoints exist (Phase 5)
// a 404 gets an honest "not open yet" message instead of a fake success.
const FALLBACK = 'Sign-up opens with the live site. For now, join the Discord and say hello.';

document.querySelectorAll<HTMLFormElement>('form[data-invite-form], form[data-partner-form]').forEach((form) => {
  const kind = form.hasAttribute('data-invite-form') ? 'invite' : 'partner';
  const success = form.querySelector<HTMLElement>(`[data-${kind}-success]`);
  const fields = form.querySelector<HTMLElement>(`[data-${kind}-fields]`) ?? form;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const note = Object.assign(document.createElement('p'), { hidden: true, className: 'text-[15px] leading-[1.5]' });
  note.setAttribute('role', 'status');
  form.append(note);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    track(`${kind}_submitted`);
    const label = submit.textContent!;
    submit.disabled = true;
    submit.textContent = 'Sending...';
    note.hidden = true;
    try {
      // Test mode (anything but production): behave like a success, send and store nothing.
      const res = !IS_LIVE ? { ok: true, status: 200 } : await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (res.status === 404) throw Object.assign(new Error('not-open'), { soft: true });
      if (!res.ok) throw new Error(String(res.status));
      track(`${kind}_success`);
      if (success) { fields.hidden = true; success.hidden = false; success.focus?.(); } else { submit.textContent = 'Invite sent'; }
      if (!IS_LIVE) { note.textContent = 'Test mode: nothing was sent or stored.'; note.hidden = false; }
      announce(success?.textContent ?? 'Done');
      form.dispatchEvent(new CustomEvent(`ik:${kind}-success`, { bubbles: true }));
    } catch (err) {
      submit.disabled = false;
      submit.textContent = label;
      note.textContent = (err as { soft?: boolean }).soft ? FALLBACK : 'Something went wrong. Please try again in a moment.';
      note.hidden = false;
    }
  });
});
