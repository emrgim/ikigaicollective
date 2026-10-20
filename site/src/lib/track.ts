// Analytics hook: scripts/analytics.ts listens for `ik:event` and forwards to Umami (production only).
export const track = (name: string, props: Record<string, unknown> = {}) =>
  window.dispatchEvent(new CustomEvent('ik:event', { detail: { name, ...props } }));

/** Say something to screen readers (polite) without moving focus. */
export const announce = (msg: string) => {
  const el = document.getElementById('sr-status');
  if (!el) return;
  el.textContent = '';
  setTimeout(() => (el.textContent = msg), 30);
};

export const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode: state just will not persist */ } },
};
