// Archimedean spiral r = a + b*theta. Shared by the Home archive and the Horizon page.
export const spiral = (cx: number, cy: number, a: number, b: number) => {
  const pt = (t: number): [number, number] => [cx + (a + b * t) * Math.cos(t), cy + (a + b * t) * Math.sin(t)];
  const path = (from: number, to: number) => {
    let d = '';
    for (let t = from; t <= to + 0.0001; t += 0.06) {
      const [x, y] = pt(t);
      d += (d ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  };
  return { pt, path };
};
