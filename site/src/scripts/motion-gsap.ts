import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reducedMotion } from '../lib/motion';

// Lazy chunk, loaded only when motion is allowed. Everything here is polish on top of a complete static page.
gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | undefined;
const seams: HTMLElement[] = [];

/** Resolve any CSS colour (including var() in its own theme scope) to rgb() by painting a probe inside the element. */
const resolve = (el: Element, colour: string) => {
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;width:0;height:0;background:${colour}`;
  el.append(probe);
  const c = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return c;
};

// Night to Dawn: where one band meets the next, blend the colours as the seam scrolls in.
// No JS or reduced motion means hard edges, which is how the bands are built.
function seamify() {
  const bands = [...document.querySelectorAll<HTMLElement>('main [data-bg-start], footer[data-bg-start]')];
  bands.forEach((cur, i) => {
    const prev = bands[i - 1];
    if (!prev?.dataset.bgEnd || !cur.dataset.bgStart || prev.nextElementSibling !== cur && !(cur.matches('footer') && i > 0)) return;
    const from = resolve(prev, prev.dataset.bgEnd), to = resolve(cur, cur.dataset.bgStart);
    if (from === to) return;
    const padTop = parseFloat(getComputedStyle(cur.firstElementChild as Element).paddingTop) || 0;
    const seam = document.createElement('div');
    seam.setAttribute('aria-hidden', 'true');
    seam.dataset.seam = '';
    seam.style.cssText = `position:absolute;left:0;right:0;top:0;height:${Math.min(120, padTop * 0.85)}px;pointer-events:none;opacity:0;background:linear-gradient(180deg,${from},transparent)`;
    cur.prepend(seam);
    seams.push(seam);
    gsap.to(seam, { opacity: 1, ease: 'none', scrollTrigger: { trigger: cur, start: 'top 95%', end: 'top 55%', scrub: true } });
  });
}

// Spiral Archive: the line draws itself as the section scrolls in. Points stay visible and usable throughout.
function drawSpiral() {
  const line = document.querySelector<SVGPathElement>('[data-sp-line]');
  if (!line || !line.getClientRects().length) return;
  gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.to(line, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#spiral', start: 'top 85%', end: 'center 50%', scrub: true } });
}

function smooth() {
  if (!matchMedia('(pointer: fine)').matches) return; // touch keeps native scrolling
  lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function stop() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  seams.forEach((s) => s.remove());
  lenis?.destroy();
  gsap.ticker.lagSmoothing(500);
}

smooth();
seamify();
drawSpiral();
// If the visitor turns reduced motion on mid-session, fall back to the static page immediately.
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  if (e.matches) {
    stop();
    gsap.set('[data-sp-line]', { clearProps: 'all' });
    document.documentElement.classList.replace('motion', 'rm');
  }
});
if (reducedMotion()) stop();
