import { IS_LIVE } from '../lib/env';

export const GET = () =>
  new Response(IS_LIVE ? 'User-agent: *\nAllow: /\n\nSitemap: https://ikigaicollective.org/sitemap.xml\n' : 'User-agent: *\nDisallow: /\n', {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
