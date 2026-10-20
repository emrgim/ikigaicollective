import { canMotion } from '../lib/motion';

// Scroll motion (GSAP, Lenis) is a lazy chunk that only loads when motion is allowed.
if (canMotion()) {
  const load = () => import('./motion-gsap');
  'requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 2500 }) : setTimeout(load, 1200);
}
