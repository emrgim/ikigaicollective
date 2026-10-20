// Site-wide constants. Secrets live in env vars, never here.
export const SITE = {
  name: 'Ikigai Collective',
  // Empty until confirmed; the footer hides the link while empty.
  substackUrl: import.meta.env.SUBSTACK_URL ?? 'https://ikigaicollective.substack.com/',
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
