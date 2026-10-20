import { labNightPhase, pillText } from './labnight';

// Lab Night times and live mode, in the visitor's own zone. No-JS fallback is the static idle text in the markup.
//   [data-ln-date]      "Thursday 22 October"
//   [data-ln-local]     "00:30 your time"; value "sep" prefixes " · "
//   [data-ln-count]     days / hours / minutes boxes (d h m), hidden until JS
//   [data-ln-timer]     hh:mm:ss until the start, during "tonight"
//   [data-ln-show]      space-separated phases (idle | tonight | live); element is hidden in the others
const pad = (n: number) => String(n).padStart(2, '0');

export function initLabNight() {
  let timer: number;
  const tick = () => {
    const { phase, start, msToStart } = labNightPhase();
    const { date, local } = pillText(start);
    document.documentElement.dataset.lnPhase = phase;
    document.querySelectorAll('[data-ln-date]').forEach((el) => (el.textContent = date));
    document.querySelectorAll<HTMLElement>('[data-ln-local]').forEach((el) => {
      el.textContent = `${el.dataset.lnLocal === 'sep' ? ' · ' : ''}${local} your time`;
    });
    document.querySelectorAll<HTMLElement>('[data-ln-show]').forEach((el) => {
      el.hidden = !el.dataset.lnShow!.split(' ').includes(phase);
    });
    const s = Math.max(0, Math.floor(msToStart / 1000));
    document.querySelectorAll('[data-ln-timer]').forEach((el) => (el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`));
    document.querySelectorAll<HTMLElement>('[data-ln-count]').forEach((b) => {
      if (phase === 'idle') b.hidden = false;
      const v = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60 };
      (['d', 'h', 'm'] as const).forEach((k) => {
        const n = b.querySelector(`[data-ln-${k}]`);
        if (n) n.textContent = pad(v[k]);
      });
    });
    clearTimeout(timer);
    timer = window.setTimeout(tick, phase === 'tonight' ? 1000 : 15_000);
  };
  tick();
  document.addEventListener('visibilitychange', () => !document.hidden && tick());
}
