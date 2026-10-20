// Motion policy. Every animated feature must check this and fall back to the static design.
// Contract: content is always readable before and without any animation; nothing starts at opacity 0.
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canMotion = () => !reducedMotion() && document.documentElement.classList.contains('motion');
