// How it works: Curiosity / Agency / Compassion stepper that lights the matching part of the mark.
const art = document.getElementById('values-art');
const group = document.getElementById('values');
if (art && group) {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('button[data-value]')];
  const role = group.querySelector<HTMLElement>('[data-v-role]')!;
  const quote = group.querySelector<HTMLElement>('[data-v-quote]')!;
  const note = group.querySelector<HTMLElement>('[data-v-note]')!;
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      art.dataset.v = b.dataset.value;
      role.textContent = b.dataset.role!;
      quote.textContent = b.dataset.quote!;
      note.textContent = b.dataset.note!;
    }),
  );
}
