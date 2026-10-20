import { reducedMotion } from '../lib/motion';

// Spiral Archive: pick a week (click, tap or focus) and a card shows it.
// Roving focus: one tab stop, arrow keys move through the weeks. Click on the selected point, or Enter, opens the note.
document.querySelectorAll<HTMLElement>('[data-sp-group]').forEach((group) => {
  const pts = [...group.querySelectorAll<HTMLAnchorElement>('a[data-i]')];
  const card = group.querySelector<HTMLAnchorElement>('[data-sp-card]')!;
  const isSpiral = group.dataset.spGroup === 'spiral';
  let cur = pts.length - 1;

  const place = (p: HTMLElement) => {
    if (!isSpiral) return;
    const x = +p.dataset.x!, y = +p.dataset.y!;
    let cx = x + 22; if (cx + 250 > 790) cx = x - 272;
    let cy = Math.max(10, y - 90); if (cy + 240 > 790) cy = 550;
    card.style.left = `${(Math.max(10, cx) / 8).toFixed(2)}%`;
    card.style.top = `${(cy / 8).toFixed(2)}%`;
  };

  const select = (i: number, focus = false) => {
    cur = i;
    pts.forEach((p, k) => {
      p.tabIndex = k === i ? 0 : -1;
      if (k === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    });
    const p = pts[i], d = p.dataset;
    card.href = p.href;
    card.querySelector('[data-sp-week]')!.textContent = `Week ${d.week}`;
    card.querySelector('[data-sp-date]')!.textContent = d.date!;
    card.querySelector('[data-sp-title]')!.textContent = d.title!;
    (card.querySelector('[data-sp-art]') as HTMLElement).style.background = d.bg!;
    place(p);
    if (focus) p.focus({ preventScroll: !isSpiral ? false : true });
    if (!isSpiral) p.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  pts.forEach((p, k) => (p.tabIndex = k === cur ? 0 : -1));
  place(pts[cur]);

  // First click or tap selects; clicking the already selected point follows the link.
  // Pressing the mouse also focuses the point, so focus caused by a pointer must not select early.
  let byPointer = false;
  group.addEventListener('pointerdown', () => (byPointer = true));
  group.addEventListener('click', (e) => {
    byPointer = false;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-i]');
    if (a && +a.dataset.i! !== cur) { e.preventDefault(); select(+a.dataset.i!); }
  });
  group.addEventListener('focusin', (e) => {
    if (byPointer) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-i]');
    if (a && +a.dataset.i! !== cur) select(+a.dataset.i!);
  });
  group.addEventListener('keydown', (e) => {
    if (!(e.target as HTMLElement).closest('a[data-i]')) return;
    const last = pts.length - 1;
    const next = { ArrowRight: cur + 1, ArrowDown: cur + 1, ArrowLeft: cur - 1, ArrowUp: cur - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(Math.min(last, Math.max(0, next)), true);
  });
});
