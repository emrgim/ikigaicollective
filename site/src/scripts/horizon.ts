import { gsap } from 'gsap';
import { canMotion } from '../lib/motion';

// Home "The Horizon". Idle loops (CSS) run only while the section is on screen (.hz-on). The entrance plays once, the first time it
// scrolls in: the spiral draws outward (solid, dashed, dotted), each card lifts in as the line reaches it, then the sun swells.
// Transforms, opacity and stroke-dashoffset only. Without motion or JS the finished scene is what renders.
const root = document.querySelector<HTMLElement>('.hz');
if (root && canMotion()) {
  const q = <T extends Element>(sel: string) => [...root.querySelectorAll<T>(sel)];
  const one = (sel: string) => root.querySelector(sel)!;

  const s1 = one('.hz-s1'), reveal = q('.hz-reveal'), sun = one('.hz-sun'), halo = one('.hz-halo'), glow = one('.hz-glow');
  const cards = [one('.hz-now'), one('.hz-next'), one('.hz-hor')];
  const leads = [one('.hz-ld1'), one('.hz-ld2'), one('.hz-ld3')];
  const mk = [one('.hz-mk1'), one('.hz-mk2')];

  let played = false;
  const play = () => {
    played = true;
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(mk[0], { opacity: 1, duration: 0.5 }, 0)
      .to(cards[0], { opacity: 1, y: 0, duration: 0.7 }, 0.3).to(leads[0], { opacity: 1, duration: 0.6 }, 0.5)
      .to(s1, { strokeDashoffset: 0, opacity: 1, duration: 1.8, ease: 'power1.inOut' }, 0.2)
      .to(mk[1], { opacity: 1, duration: 0.4 }, 1.9)
      .to(reveal[0], { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }, 1.9)
      .to(cards[1], { opacity: 1, y: 0, duration: 0.7 }, 2.2).to(leads[1], { opacity: 1, duration: 0.6 }, 2.3)
      .to(reveal[1], { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, 2.9)
      .to(halo, { opacity: 1, duration: 1.2 }, 3.5)
      .to(sun, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.6)' }, 3.5)
      .to(cards[2], { opacity: 1, y: 0, duration: 0.7 }, 3.7).to(leads[2], { opacity: 1, duration: 0.6 }, 3.8)
      .to(sun, { scale: 1.1, duration: 0.7, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 4.5)
      .to(glow, { opacity: 0.9, duration: 0.7, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 4.5)
      .add(() => gsap.set([s1, ...reveal, sun, halo, glow, ...cards, ...leads, ...mk], { clearProps: 'opacity,transform,strokeDasharray,strokeDashoffset' }));
  };

  // Hidden start only when the scene is below the fold at load; if it is already on screen it stays as drawn.
  const stage = one('.hz-stage');
  const below = stage.getBoundingClientRect().top > innerHeight * 0.9;
  if (below) {
    gsap.set(s1, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
    gsap.set(reveal, { strokeDashoffset: 1 });
    gsap.set(sun, { opacity: 0, scale: 0.8, svgOrigin: '945 142.5' });
    gsap.set(halo, { opacity: 0 });
    gsap.set(glow, { opacity: 0.2 });
    gsap.set([...leads, ...mk], { opacity: 0 });
    gsap.set(cards, { opacity: 0, y: 18 });
  } else played = true;

  new IntersectionObserver(([e]) => {
    root.classList.toggle('hz-on', e.isIntersecting);
    if (e.isIntersecting && !played) play();
  }, { rootMargin: '0px 0px -15% 0px' }).observe(stage);

  // Pointer devices on wide screens: stars and rings drift a little with the mouse.
  if (matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1100px)').matches) {
    const st = one('.hz-px-stars'), rg = one('.hz-px-rings');
    const sx = gsap.quickTo(st, 'x', { duration: 1 }), sy = gsap.quickTo(st, 'y', { duration: 1 });
    const rx = gsap.quickTo(rg, 'x', { duration: 1.2 }), ry = gsap.quickTo(rg, 'y', { duration: 1.2 });
    root.addEventListener('pointermove', (e) => {
      if (!root.classList.contains('hz-on')) return;
      const r = root.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      sx(dx * -16); sy(dy * -10); rx(dx * 8); ry(dy * 5);
    }, { passive: true });
  }
}
