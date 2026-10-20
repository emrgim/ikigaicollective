import { announce, store, track } from '../lib/track';

// Join page: three steps that tick off. State survives a reload (localStorage, best effort).
const list = document.getElementById('join-steps');
if (list) {
  const steps = [...list.querySelectorAll<HTMLElement>('[data-step]')];
  const done = list.querySelector<HTMLElement>('[data-done]')!;
  const KEY = 'ik-join-steps';
  const state = new Set<string>((store.get(KEY) ?? '').split(',').filter(Boolean));
  const paint = () => {
    steps.forEach((li) => {
      const on = state.has(li.dataset.step!);
      li.dataset.complete = String(on);
      const mark = li.querySelector<HTMLElement>('[data-mark]')!;
      mark.textContent = on ? '✓' : li.dataset.step!;
      const action = li.querySelector<HTMLElement>('[data-action-label]');
      if (action) action.textContent = on ? action.dataset.doneLabel! : action.dataset.label!;
      li.querySelector('[data-sr]')!.textContent = on ? 'Done' : '';
    });
    done.hidden = state.size < 3;
  };
  const complete = (n: string) => {
    if (state.has(n)) return;
    state.add(n);
    store.set(KEY, [...state].join(','));
    paint();
    announce(`Step ${n} done`);
    if (state.size === 3) announce('You are in. See you on Thursday.');
  };
  list.addEventListener('ik:invite-success', () => complete('1'));
  list.addEventListener('ik:copied', () => complete('3'));
  list.querySelector('[data-discord]')?.addEventListener('click', () => { track('discord_click', { from: 'join' }); complete('2'); });
  paint();
}
