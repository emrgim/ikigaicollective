import { announce, track } from '../lib/track';

// [data-share]: Web Share API where available, otherwise copy the link.
document.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((btn) => {
  const label = btn.textContent!;
  btn.addEventListener('click', async () => {
    const data = { title: document.title, url: location.href };
    track('note_share');
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* cancelled */ }
      return;
    }
    try { await navigator.clipboard.writeText(data.url); } catch { return announce('Could not copy the link.'); }
    btn.textContent = 'Link copied';
    announce('Link copied');
    setTimeout(() => (btn.textContent = label), 2200);
  });
});
