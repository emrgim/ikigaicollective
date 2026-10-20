import { canMotion } from '../lib/motion';

// Hero dawn light: a slow fragment shader on a canvas laid over the CSS gradient, which stays underneath as the fallback.
// Same ellipse and copper ramp as the CSS version; it breathes over 9s and rises a little as you scroll.
const host = document.querySelector<HTMLElement>('[data-hero-glow]');
const gl0 = host && canMotion() ? document.createElement('canvas') : null;
const gl = gl0?.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });

if (host && gl0 && gl) {
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `precision mediump float;
uniform vec2 r;uniform float t,s;uniform vec3 c0,c1,c2,c3,c4;
float h(vec2 x){return fract(sin(dot(x,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float b=sin(t*0.69813);                        // 9s period
  vec2 c=vec2(.5,-.12+s*.42);                    // light sits under the horizon and rises with scroll
  float d=length(vec2((uv.x-c.x)/.85,(uv.y-c.y)/.58))/(1.+.035*b);
  vec3 col=d<.10?mix(c0,c1,d/.10):d<.22?mix(c1,c2,(d-.10)/.12):d<.36?mix(c2,c3,(d-.22)/.14):d<.52?mix(c3,c4,(d-.36)/.16):c4;
  float a=(1.-clamp((d-.52)/.20,0.,1.))*(.91+.09*b);
  col+=(h(gl_FragCoord.xy)-.5)/255.;             // dither against banding
  gl_FragColor=vec4(col*a,a);
}`;
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('hero shader failed to link');
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);

  // Colours come from the tokens, never hard-coded here.
  const css = getComputedStyle(document.documentElement);
  ['copper-900', 'copper-700', 'copper-500', 'copper-300', 'copper-100'].forEach((k, i) => {
    const hex = css.getPropertyValue(`--${k}`).trim().slice(1);
    gl.uniform3f(u('c' + i), ...([0, 2, 4].map((o) => parseInt(hex.slice(o, o + 2), 16) / 255) as [number, number, number]));
  });

  gl0.setAttribute('aria-hidden', 'true');
  gl0.className = 'absolute inset-0 size-full opacity-0 transition-opacity duration-700';
  host.append(gl0);

  const size = () => {
    gl0.width = Math.max(2, Math.round(host.clientWidth / 2)); // half resolution: the light is smooth, this is plenty
    gl0.height = Math.max(2, Math.round(host.clientHeight / 2));
    gl.viewport(0, 0, gl0.width, gl0.height);
    gl.uniform2f(u('r'), gl0.width, gl0.height);
  };
  size();
  new ResizeObserver(size).observe(host);

  let rise = 0, last = 0, running = false, visible = true, raf = 0;
  const frame = (now: number) => {
    if (!visible || document.hidden) { running = false; return; }
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; // 30fps is enough for a 9s breath
    last = now;
    rise += (Math.min(1, scrollY / host.offsetHeight) - rise) * 0.1;
    gl.uniform1f(u('t'), now / 1000);
    gl.uniform1f(u('s'), rise);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!gl0.dataset.ready) { gl0.dataset.ready = ''; gl0.classList.replace('opacity-0', 'opacity-100'); }
    gl0.dataset.rise = rise.toFixed(2);
  };
  const run = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); }).observe(host);
  document.addEventListener('visibilitychange', () => !document.hidden && run());
  run();

  const drop = () => { cancelAnimationFrame(raf); running = false; visible = false; gl0.remove(); };
  gl0.addEventListener('webglcontextlost', drop);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => e.matches && drop());
}
