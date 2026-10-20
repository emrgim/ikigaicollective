// Site-wide constants. Secrets live in env vars, never here.
export const SITE = {
  name: 'Ikigai Collective',
  // Empty until confirmed; the footer hides the link while empty.
  substackUrl: import.meta.env.SUBSTACK_URL ?? 'https://ikigaicollective.substack.com/',
  // Live Lab Night mode. Set PUBLIC_MEET_URL in the environment; empty hides the Join now button.
  meetUrl: import.meta.env.PUBLIC_MEET_URL ?? '',
  // Named contact for privacy requests. Set PUBLIC_PRIVACY_EMAIL; until then the privacy page shows a visible placeholder.
  privacyEmail: import.meta.env.PUBLIC_PRIVACY_EMAIL ?? '',
  // Community preview banner. Shown only when the site is not live and this is set.
  previewFeedbackUrl: import.meta.env.PUBLIC_PREVIEW_FEEDBACK_URL ?? '',
  discordUrl: 'https://discord.gg/4rM6FqjVDE',
  githubUrl: 'https://github.com/ikigaicollective',
  linkedinUrl: 'https://www.linkedin.com/company/joinikigai',
};

export const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/lab-night', label: 'Lab Night' },
  { href: '/lab-notes', label: 'Lab Notes' },
  { href: '/horizon', label: 'Horizon' },
  { href: '/partners', label: 'Partners' },
] as const;
