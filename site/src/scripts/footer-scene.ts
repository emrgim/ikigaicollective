import { gsap } from 'gsap';
import { canMotion } from '../lib/motion';

// Footer scene motion. Lazy chunk, loaded only when motion is allowed; without it the scene is the finished static drawing.
// Transforms and opacity only. Idle loops are CSS and run only while .fs-on is set (footer on screen).
const svg = document.querySelector<SVGSVGElement>('.fs-svg');
if (svg && canMotion()) {
  const q = <T extends Element>(sel: string) => [...svg.querySelectorAll<T>(sel)];

  // Entrance, once: the sun rises from behind the ground line, figures settle in left to right, the sprout grows.
  const sun = q('.fs-sun-rise'), figs = q('.fs-fig'), sprout = q('.fs-sprout');
  gsap.set(sun, { y: 230 });
  gsap.set(figs, { y: 14, opacity: 0 });
  gsap.set(sprout, { scaleY: 0.2, svgOrigin: '1284 330' });
  let played = false;
  const play = () => {
    played = true;
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(sun, { y: 0, duration: 1.6, ease: 'power3.out' })
      .to(figs, { y: 0, opacity: 1, duration: 0.8, stagger: 0.14 }, 0.4)
      .to(sprout, { scaleY: 1, duration: 1.4, ease: 'back.out(1.6)' }, 1.4)
      .add(() => gsap.set([...figs, ...sun, ...sprout], { clearProps: 'transform,opacity' }));
  };
  // One observer: toggles the idle loops while the footer is on screen and starts the entrance the first time it is.
  new IntersectionObserver(([e]) => {
    svg.classList.toggle('fs-on', e.isIntersecting);
    if (e.isIntersecting && !played) play();
  }, { rootMargin: '0px 0px -10% 0px' }).observe(svg);

  // Pointer devices only: the nearest agent's eyes follow the cursor, the centre flares, an agent hops when clicked.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const agents = q<SVGGElement>('[data-agent]').map((hop) => ({ hop, look: hop.querySelector<SVGGElement>('.fs-look')! }));
    let nearest: (typeof agents)[number] | null = null, pt: PointerEvent | null = null, raf = 0;
    const follow = () => {
      raf = 0;
      if (!pt || !svg.classList.contains('fs-on')) return;
      let best: typeof nearest = null, bd = 420;
      for (const a of agents) {
        const r = a.hop.getBoundingClientRect(), d = Math.hypot(pt.clientX - (r.left + r.width / 2), pt.clientY - (r.top + r.height / 2));
        if (d < bd) { bd = d; best = a; }
      }
      if (nearest && nearest !== best) gsap.to(nearest.look, { x: 0, y: 0, duration: 0.25 });
      nearest = best;
      if (best) {
        const r = best.hop.getBoundingClientRect(), dx = pt.clientX - (r.left + r.width / 2), dy = pt.clientY - (r.top + r.height / 3), m = Math.hypot(dx, dy) || 1, k = Math.min(3, m / 40) / m;
        gsap.to(best.look, { x: dx * k, y: dy * k, duration: 0.2, overwrite: 'auto' });
      }
    };
    window.addEventListener('pointermove', (e) => { pt = e; if (!raf) raf = requestAnimationFrame(follow); }, { passive: true });

    const flare = q('.fs-flare');
    q('.fs-hit')[0]?.addEventListener('pointerenter', () => gsap.fromTo(flare, { scale: 1 }, { scale: 2.2, duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true }));
  }
  svg.addEventListener('click', (e) => {
    const hop = (e.target as Element).closest('[data-agent]');
    if (hop) gsap.fromTo(hop, { y: 0 }, { y: -16, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true });
  });
}
