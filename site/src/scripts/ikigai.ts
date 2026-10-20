// Home ikigai diagram: tap a circle to light it, tap "Ikigai" to light all four.
const root = document.getElementById('ik-diagram');
if (root) {
  const label = document.querySelector<HTMLElement>('[data-ik-label]')!;
  const text = document.querySelector<HTMLElement>('[data-ik-text]')!;
  const circles = [...root.querySelectorAll<HTMLElement>('[data-ik-circle]')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-ik]')];
  const set = (key: string) => {
    circles.forEach((c) => (c.dataset.lit = key === 'core' || c.dataset.ikCircle === key ? 'on' : 'off'));
    root.dataset.state = key;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ik === key)));
    const src = buttons.find((b) => b.dataset.ik === key)!;
    label.textContent = src.dataset.label!;
    text.textContent = src.dataset.text!;
  };
  buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.ik!)));
}
