import { gsap } from 'gsap';
import { canMotion } from '../lib/motion';

// Partners "Our principles": each item plays once as it scrolls in. Ring draws, drawing strokes in, ghost numeral fades up, then the text.
// Items already on screen at load stay static; without motion or JS the finished section is what renders.
if (canMotion()) {
  const items = [...document.querySelectorAll<HTMLElement>('.pr [data-pr]')];
  const wide = matchMedia('(min-width: 1024px)').matches;
  const parts = (el: HTMLElement) => ({
    hair: el,
    ring: el.querySelector('.pr-ring'),
    strokes: [...el.querySelectorAll('.pr-svg .pr-d, .pr-mark path')],
    fade: [...el.querySelectorAll('.pr-ag, .pr-svg .pr-cf, .pr-mark circle')],
    ghost: el.querySelector('.pr-ghost'),
    text: [...el.querySelectorAll('.pr-no, .pr-title, .pr-line')],
  });
  const hide = (el: HTMLElement) => {
    const p = parts(el);
    gsap.set(p.ring, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
    gsap.set(p.strokes, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
    gsap.set(p.fade, { opacity: 0 });
    gsap.set(p.ghost, { opacity: 0, y: 16 });
    gsap.set(p.text, { opacity: 0, y: 8 });
  };
  const play = (el: HTMLElement, i: number) => {
    const p = parts(el);
    const tl = gsap.timeline({ delay: wide ? (i % 3) * 0.12 : 0, defaults: { ease: 'power2.out' } });
    tl.to(p.ring, { strokeDashoffset: 0, opacity: 1, duration: 0.8, ease: 'power1.inOut' })
      .to(p.strokes, { strokeDashoffset: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power1.inOut' }, 0.25)
      .to(p.fade, { opacity: 1, duration: 0.5 }, 0.5)
      .to(p.ghost, { opacity: 1, y: 0, duration: 0.7 }, 0.4)
      .to(p.text, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.65)
      .add(() => gsap.set([p.ring, ...p.strokes, ...p.fade, p.ghost, ...p.text], { clearProps: 'opacity,transform,strokeDashoffset' }));
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    play(e.target as HTMLElement, items.indexOf(e.target as HTMLElement));
  }), { rootMargin: '0px 0px -12% 0px' });
  items.forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) { hide(el); io.observe(el); }
  });
}
