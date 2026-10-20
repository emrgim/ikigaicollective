import { nextLabNight, pillText } from './labnight';

// Fills Lab Night times in the visitor's own zone. No-JS fallback is the static text in the markup.
//   [data-ln-date]           "Thursday 22 October"
//   [data-ln-local]          "00:30 your time"; value "sep" prefixes " · "
//   [data-ln-count]          container hidden until JS; children [data-ln-d|h|m] get zero-padded values
export function initLabNight() {
  const start = nextLabNight();
  const { date, local } = pillText(start);
  document.querySelectorAll('[data-ln-date]').forEach((el) => (el.textContent = date));
  document.querySelectorAll<HTMLElement>('[data-ln-local]').forEach((el) => {
    el.textContent = `${el.dataset.lnLocal === 'sep' ? ' · ' : ''}${local} your time`;
  });
  const box = document.querySelectorAll<HTMLElement>('[data-ln-count]');
  if (!box.length) return;
  const pad = (n: number) => String(n).padStart(2, '0');
  const tick = () => {
    const ms = Math.max(0, start - Date.now());
    const v = { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60 };
    box.forEach((b) => {
      b.hidden = false;
      (['d', 'h', 'm'] as const).forEach((k) => {
        const n = b.querySelector(`[data-ln-${k}]`);
        if (n) n.textContent = pad(v[k]);
      });
    });
  };
  tick();
  setInterval(tick, 30_000);
}
