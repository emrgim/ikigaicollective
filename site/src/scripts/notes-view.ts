import { store } from '../lib/track';

// Lab Notes: Covers / Index toggle. The toggle is hidden until this runs, so no-JS visitors just see Covers.
const toggle = document.getElementById('view-toggle');
const wrap = document.getElementById('all-notes');
if (toggle && wrap) {
  toggle.hidden = false;
  const buttons = [...toggle.querySelectorAll<HTMLButtonElement>('button[data-view]')];
  const panes = [...wrap.querySelectorAll<HTMLElement>('[data-pane]')];
  const show = (view: string) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    panes.forEach((p) => (p.hidden = p.dataset.pane !== view));
    store.set('ik-notes-view', view);
  };
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.view!)));
  const saved = store.get('ik-notes-view');
  if (saved === 'list') show('list');
}
