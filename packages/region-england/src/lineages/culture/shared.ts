import { P, type Builder, type Vec3 } from '@ah/kit';

export type Pt = [number, number];

/** Vertex i of a regular n-gon of circumradius r (vertex 0 on +Z, matching b.lathe's seams). */
export function polyVert(i: number, n: number, r: number): Pt {
  const a = (i / n) * Math.PI * 2;
  return [r * Math.sin(a), r * Math.cos(a)];
}

/**
 * A ruined wall slab with a broken, stepped top. It runs `len` along local X, is `t` thick and stands
 * on `at`, rotated by `rotY`. Heights wander between hMin and hMax. `holes` are cut through it.
 */
export function ruinWall(
  b: Builder,
  len: number,
  hMin: number,
  hMax: number,
  t: number,
  color: number,
  o: { at?: Vec3; rotY?: number; holes?: Pt[][]; endHigh?: number },
): void {
  const n = Math.max(2, Math.round(len / 0.9));
  const pts: Pt[] = [
    [-len / 2, 0],
    [len / 2, 0],
  ];
  let h = o.endHigh ?? b.range(hMin, hMax);
  for (let i = n; i >= 0; i--) {
    const x = -len / 2 + (len * i) / n;
    pts.push([x, h]);
    if (i > 0) {
      h = Math.min(hMax, Math.max(hMin, h + b.range(-1.1, 1.1)));
      pts.push([x, h]);
    }
  }
  b.extrude(pts, t, color, { at: o.at, rotY: o.rotY, holes: o.holes });
}

/** Outline of a round-headed opening (for extrude holes). */
export function roundArch(xc: number, y0: number, w: number, h: number, segs = 8): Pt[] {
  const a = w / 2;
  const hs = h - a;
  const pts: Pt[] = [[xc - a, y0]];
  for (let i = 0; i <= segs; i++) {
    const t = Math.PI - (i / segs) * Math.PI;
    pts.push([xc + a * Math.cos(t), y0 + hs + a * Math.sin(t)]);
  }
  pts.push([xc + a, y0]);
  return pts;
}

/** A grazing sheep, about 1.3 m long, facing rotY. */
export function sheep(b: Builder, at: Vec3, rotY: number): void {
  b.group({ at, rotY }, () => {
    b.blob(0.42, P.cream, { at: [0, 0.68, 0], stretch: [0.9, 0.75, 1.45], detail: 0 });
    b.blob(0.17, P.black, { at: [0, 0.6, 0.62], stretch: [0.8, 0.9, 1.3], detail: 0 });
    for (const [x, z] of [[-0.18, 0.3], [0.18, 0.3], [-0.18, -0.3], [0.18, -0.3]] as Pt[]) {
      b.box(0.08, 0.42, 0.08, P.black, { at: [x, 0, z] });
    }
  });
}

/** A run of thin boxes making a balustrade: rail, plinth and balusters. Runs along X from `at`. */
export function balustrade(b: Builder, len: number, h: number, color: number, o: { at: Vec3; rotY?: number; step?: number }): void {
  b.group({ at: o.at, rotY: o.rotY }, () => {
    b.box(len, 0.14, 0.4, color);
    b.box(len + 0.1, 0.14, 0.46, color, { at: [0, h - 0.14, 0] });
    const n = Math.max(2, Math.round(len / (o.step ?? 0.55)));
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + ((i + 0.5) * len) / n;
      b.box(0.16, h - 0.28, 0.16, color, { at: [x, 0.14, 0] });
    }
  });
}

/**
 * A lettered sign made of bars, for cinema names. Letters are drawn on a 3 × 5 grid; `size` is the
 * letter height. Built in the XY plane, facing +Z, centred on `at`'s x and starting at its y.
 */
export function blockLetters(
  b: Builder,
  text: string,
  size: number,
  color: number,
  o: { at: Vec3; rotY?: number; depth?: number; gap?: number },
): void {
  // each glyph: list of [x0, y0, x1, y1] bars on a 3 wide × 5 tall grid
  const G: Record<string, number[][]> = {
    O: [[0, 0, 3, 1], [0, 4, 3, 5], [0, 0, 1, 5], [2, 0, 3, 5]],
    D: [[0, 0, 2.3, 1], [0, 4, 2.3, 5], [0, 0, 1, 5], [2, 0.6, 3, 4.4]],
    E: [[0, 0, 3, 1], [0, 2, 2.4, 3], [0, 4, 3, 5], [0, 0, 1, 5]],
    N: [[0, 0, 1, 5], [2, 0, 3, 5]],
  };
  const u = size / 5;
  const depth = o.depth ?? 0.15;
  const gap = o.gap ?? 1;
  const adv = (3 + gap) * u;
  const total = text.length * adv - gap * u;
  b.group({ at: o.at, rotY: o.rotY }, () => {
    [...text].forEach((ch, i) => {
      const x0 = -total / 2 + i * adv;
      for (const [a, c, d, e] of G[ch] ?? []) {
        b.box((d - a) * u, (e - c) * u, depth, color, { at: [x0 + ((a + d) / 2) * u, c * u, 0], jitter: false });
      }
      if (ch === 'N') {
        // the diagonal of the N, as a short slanted bar
        b.box(u * 0.95, 5.05 * u, depth * 0.9, color, { at: [x0 + 1.95 * u, 0, 0], rot: [0, 0, 0.2], jitter: false });
      }
    });
  });
}

/** Centre of facet i of an n-sided cylinder or lathe of radius r: [x, z, facing angle]. */
export function facet(i: number, n: number, r: number): [number, number, number] {
  const a = ((i + 0.5) / n) * Math.PI * 2;
  const ap = r * Math.cos(Math.PI / n);
  return [ap * Math.sin(a), ap * Math.cos(a), a];
}

/**
 * A semicircular "thermal" (Diocletian) window of radius r: frame, dark glass and two mullions.
 * `at` is the centre of its flat base on the wall surface.
 */
export function thermalWindow(b: Builder, r: number, frame: number, o: { at: Vec3; facing: number | '+z' | '-z' | '+x' | '-x' }): void {
  const ang = typeof o.facing === 'number' ? o.facing : { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[o.facing];
  b.group({ at: o.at, rotY: ang }, () => {
    b.panel(r * 2, r, frame, { shape: 'round', depth: 0.05 });
    const ri = r - 0.14;
    b.panel(ri * 2, ri, P.windowDark, { shape: 'round', depth: 0.075, at: [0, 0.02, 0] });
    for (const s of [-1, 1]) {
      const x = (s * ri) / 3;
      b.panel(0.14, Math.sqrt(ri * ri - x * x), frame, { at: [x, 0, 0], depth: 0.1 });
    }
  });
}
