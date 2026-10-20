// Fail closed: the site is indexable and forms are live only when PUBLIC_SITE_ENV=production (set at cutover).
export const IS_LIVE = import.meta.env.PUBLIC_SITE_ENV === 'production';
