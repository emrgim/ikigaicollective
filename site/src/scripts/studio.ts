import { IS_LIVE } from '../lib/env';

// Replace the placeholder cards with live #the-loop threads. On failure: live site hides the section, preview keeps the placeholders.
const box = document.querySelector<HTMLElement>('[data-studio]');
const section = document.getElementById('studio');
type Thread = { title: string; stage: string; created: string; url: string; craft: string };

const ago = (iso: string) => {
  const days = Math.round((Date.now() - +new Date(iso)) / 864e5);
  return days < 1 ? 'today' : new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-days, 'day');
};

async function load() {
  try {
    const res = await fetch('/api/studio');
    if (!res.ok) throw new Error(String(res.status));
    const { threads } = (await res.json()) as { threads: Thread[] };
    if (!threads.length) throw new Error('empty');
    box!.replaceChildren(...threads.map((t) => {
      const a = Object.assign(document.createElement('a'), { href: t.url, className: 'flex min-h-[260px] flex-[1_1_320px] flex-col gap-[18px] border border-cu-200 p-8 no-underline', target: '_blank', rel: 'noopener' });
      a.style.background = 'var(--brown-deep)';
      const shipped = t.stage.toLowerCase() === 'shipped';
      a.append(
        Object.assign(document.createElement('span'), { textContent: t.stage[0].toUpperCase() + t.stage.slice(1), className: `self-start rounded px-3 py-1.5 text-[13px] tracking-[0.06em] ${shipped ? 'bg-copper text-bg' : 'border border-copper text-cu-700'}` }),
        Object.assign(document.createElement('span'), { textContent: t.title, className: 'font-display text-[26px] leading-[1.3]' }),
        Object.assign(document.createElement('span'), { textContent: `${t.craft} · ${ago(t.created)}`, className: 'mt-auto text-[15px] text-cu-800' }),
      );
      return a;
    }));
  } catch {
    if (IS_LIVE) section?.remove();
  }
}
if (box) load();
