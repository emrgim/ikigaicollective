import { announce, track } from '../lib/track';

// [data-copy="text"] buttons: copy, flash "Copied", tell screen readers.
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const label = btn.textContent!;
  let timer: number;
  btn.addEventListener('click', async () => {
    if (!(await copyText(btn.dataset.copy!))) return announce('Could not copy. Select the text and copy it by hand.');
    btn.textContent = 'Copied';
    announce('Copied to clipboard');
    track('paste_copied');
    btn.dispatchEvent(new CustomEvent('ik:copied', { bubbles: true }));
    clearTimeout(timer);
    timer = window.setTimeout(() => (btn.textContent = label), 2200);
  });
});
