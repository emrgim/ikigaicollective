// Fail closed: the site is indexable and forms are live only when PUBLIC_SITE_ENV=production (set at cutover).
export const IS_LIVE = import.meta.env.PUBLIC_SITE_ENV === 'production';
// Preview switch, off by default: PUBLIC_FORMS_LIVE=1 makes the forms call the real API (test event and '-test' sheet tabs) without going live.
export const FORMS_LIVE = IS_LIVE || import.meta.env.PUBLIC_FORMS_LIVE === '1';
