// Partner form: type pills (radio group), the sentence that follows them, and the growing message field.
// The submitted kind stays the old dropdown's values, held in the hidden input.
const TYPES: Record<string, { art: string; org: string; msg: string }> = {
  'Community': { art: 'a community.', org: 'Your community', msg: 'a Lab Night with our members' },
  'AI tool': { art: 'an AI tool maker.', org: 'Your company', msg: 'our tool in members’ hands' },
  'Institution': { art: 'an institution.', org: 'Your institution', msg: 'the method with our people' },
};

const form = document.querySelector<HTMLFormElement>('form[data-partner-form]');
if (form) {
  const pills = [...form.querySelectorAll<HTMLButtonElement>('[role=radio]')];
  const kind = form.querySelector<HTMLInputElement>('[data-kind-input]')!;
  const art = form.querySelector<HTMLElement>('[data-art]')!;
  const org = form.querySelector<HTMLInputElement>('[data-ph-org]')!;
  const msg = form.querySelector<HTMLTextAreaElement>('[data-ph-msg]')!;

  const select = (p: HTMLButtonElement, focus = false) => {
    const t = TYPES[p.dataset.kind!];
    pills.forEach((b) => { const on = b === p; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    kind.value = p.dataset.kind!;
    art.textContent = t.art; org.placeholder = t.org; msg.placeholder = t.msg;
    if (focus) p.focus();
  };
  pills.forEach((p, i) => {
    p.addEventListener('click', () => select(p));
    p.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      select(pills[(i + step + pills.length) % pills.length], true);
    });
  });
  select(pills[0]);

  const grow = () => { msg.style.height = 'auto'; msg.style.height = `${msg.scrollHeight}px`; };
  msg.addEventListener('input', grow);
  grow();
}
