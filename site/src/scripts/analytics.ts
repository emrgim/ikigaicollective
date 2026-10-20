// Funnel events -> Umami (cookieless). Page code calls track() (ik:event); a few events are detected here by delegation.
declare global { interface Window { umami?: { track: (name: string, data?: Record<string, unknown>) => void } } }

const params = new URLSearchParams(location.search);
const source = params.get('utm_source') ?? (document.referrer ? new URL(document.referrer).hostname : 'direct');
const send = (name: string, data: Record<string, unknown> = {}) => window.umami?.track(name, { source, page: location.pathname, ...data });

window.addEventListener('ik:event', (e) => {
  const { name, ...data } = (e as CustomEvent).detail;
  send(name, data);
});

document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a');
  const href = a?.getAttribute('href') ?? '';
  if (/\/lab-night(?:[#?]|$)/.test(href)) send('cta_lab_night_click');
  else if (/discord\.(gg|com)/.test(href)) send('discord_click');
});

// note_read: 75% of the article scrolled past, once.
const article = document.querySelector('article.note-body');
if (article) {
  const onScroll = () => {
    const r = article.getBoundingClientRect();
    if (r.height && (innerHeight - r.top) / r.height >= 0.75) { removeEventListener('scroll', onScroll); send('note_read', { note: location.pathname.split('/').pop() }); }
  };
  addEventListener('scroll', onScroll, { passive: true });
}
