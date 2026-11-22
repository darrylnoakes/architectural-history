import { P, tint, type Builder, type Vec3 } from '@ah/kit';

/** Plot-local z of the river bank (water lies beyond it, toward -Z). */
export const BANK = -11;
/** Height of the river surface. */
export const WATER = -1.2;
/** Height of the river bed. */
export const BED = -2.4;

export type Pt = [number, number];

/** A row of n evenly spaced values from a to c inclusive. */
export function lin(n: number, a: number, c: number): number[] {
  if (n === 1) return [(a + c) / 2];
  return Array.from({ length: n }, (_, i) => a + ((c - a) * i) / (n - 1));
}

/** The rise of a pitched roof of the given span at `deg` degrees. */
export function rise(span: number, deg: number): number {
  return (span / 2) * Math.tan((deg * Math.PI) / 180);
}

/** A circle as an outline of n points (for extrude). */
export function circlePts(r: number, n = 20, cx = 0, cy = 0): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

/** A flat ring (annulus) in the XY plane, `depth` thick along Z, centred on `at`. */
export function ring(b: Builder, rOut: number, rIn: number, depth: number, color: number, at: Vec3, n = 20): void {
  b.extrude(circlePts(rOut, n), depth, color, { at, holes: [circlePts(rIn, n).reverse()] });
}

/** A bar from (x0, y0) to (x1, y1) in the local XY plane, `t` square, centred on z. */
export function bar(b: Builder, x0: number, y0: number, x1: number, y1: number, t: number, depth: number, color: number, z = 0): void {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const a = Math.atan2(x1 - x0, y1 - y0);
  b.group({ at: [(x0 + x1) / 2, (y0 + y1) / 2, z], rot: [0, 0, -a] }, () => {
    b.box(t, len, depth, color, { at: [0, -len / 2, 0] });
  });
}

export interface WheelOpts {
  /** Centre of the axle. */
  at: Vec3;
  r: number;
  /** Width of the wheel along its axle. */
  width: number;
  /** 'z' (default): axle along Z. 'x': axle along X. */
  axis?: 'x' | 'z';
  /** 'undershot': open floats driven by the current. 'breast': closed buckets between shrouds. */
  kind?: 'undershot' | 'breast';
  paddles?: number;
  spokes?: number;
  color?: number;
  iron?: boolean;
  spin?: number;
  /** Length of axle beyond the wheel (default 1.6), and which way it runs. */
  axle?: number;
  axleDir?: 1 | -1;
}

/** A waterwheel: rims, floats or buckets, arms, hub and axle. */
export function waterwheel(b: Builder, o: WheelOpts): void {
  const kind = o.kind ?? 'undershot';
  const timber = o.color ?? P.oak;
  const metal = o.iron ? P.castIron : timber;
  const r = o.r;
  const w = o.width;
  const n = o.paddles ?? Math.max(8, Math.round(r * 6));
  const spokes = o.spokes ?? (r > 3 ? 8 : 6);
  const rot: Vec3 = o.axis === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0];
  b.group({ at: o.at, rot }, () => {
    b.group({ rot: [0, 0, o.spin ?? 0] }, () => {
      const closed = kind === 'breast';
      const rimD = closed ? Math.min(0.7, r * 0.2) : Math.min(0.28, r * 0.1);
      const rimT = 0.12;
      const seg = r > 3 ? 28 : 18;
      for (const s of [-1, 1]) ring(b, r, r - rimD, rimT, o.iron ? metal : timber, [0, 0, (s * (w - rimT)) / 2], seg);
      if (closed) {
        b.extrude(circlePts(r - rimD + 0.04, seg), w - rimT * 2, P.oakDark, { holes: [circlePts(r - rimD - 0.06, seg).reverse()] });
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          b.group({ rot: [0, 0, a] }, () => {
            b.group({ at: [0, r - rimD, 0], rot: [0, 0, 0.45] }, () => b.box(0.06, rimD * 1.05, w - rimT * 2, timber));
          });
        }
      } else {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          b.group({ rot: [0, 0, a] }, () => b.box(0.07, rimD + 0.35, w, timber, { at: [0, r - rimD - 0.05, 0] }));
        }
      }
      for (const s of [-1, 1]) {
        for (let i = 0; i < spokes / 2; i++) {
          const a = (i / (spokes / 2)) * Math.PI;
          const L = r - rimD + 0.05;
          bar(b, -Math.sin(a) * L, -Math.cos(a) * L, Math.sin(a) * L, Math.cos(a) * L, o.iron ? 0.1 : 0.16, 0.14, metal, (s * (w - 0.4)) / 2);
        }
      }
    });
    const ax = o.axle ?? 1.6;
    b.log(o.iron ? 0.2 : 0.24, w + ax, o.iron ? P.iron : P.oakDark, { at: [0, -(o.iron ? 0.2 : 0.24), (ax / 2 - 0.3) * (o.axleDir ?? 1)], axis: 'z', segs: 8 });
    b.log(r * 0.12 + 0.15, w * 0.85, metal, { at: [0, -(r * 0.12 + 0.15), 0], axis: 'z', segs: 8 });
  });
}

/** A masonry river wall along the bank from x0 to x1, its face at about z = BANK - 0.2. */
export function riverWall(b: Builder, x0: number, x1: number, color: number, o?: { coping?: number; top?: number }): void {
  const top = o?.top ?? 0.15;
  const w = x1 - x0;
  b.box(w, top - BED, 0.8, color, { at: [(x0 + x1) / 2, BED, BANK + 0.2] });
  if (o?.coping !== undefined) b.box(w + 0.1, 0.18, 0.95, o.coping, { at: [(x0 + x1) / 2, top, BANK + 0.2] });
}

/** A revetment of driven stakes and planks along the bank from x0 to x1 (before stone quays). */
export function stakeBank(b: Builder, x0: number, x1: number, color: number = P.oakDark): void {
  const n = Math.max(2, Math.round((x1 - x0) / 0.9));
  for (const x of lin(n, x0, x1)) b.cyl(0.09, 1.5 + b.range(0, 0.25), color, { at: [x, BED + 0.6, BANK - 0.05], segs: 5 });
  b.box(x1 - x0, 0.9, 0.08, tint(color, 0.06), { at: [(x0 + x1) / 2, WATER - 0.4, BANK + 0.06] });
}

/** A timber landing stage: planked deck at `y` from the bank out over the water, on piles. */
export function jetty(b: Builder, x: number, w: number, len: number, o?: { y?: number; color?: number }): void {
  const y = o?.y ?? 0.1;
  const col = o?.color ?? P.oak;
  const zc = BANK + 1 - (len + 1) / 2;
  b.box(w, 0.14, len + 1, col, { at: [x, y, zc] });
  const nz = Math.max(2, Math.round(len / 2) + 1);
  for (let i = 0; i < nz; i++) {
    const z = BANK - (len * i) / (nz - 1) + (i === 0 ? 0 : 0.15);
    for (const s of [-1, 1]) b.cyl(0.13, y - BED, P.oakDark, { at: [x + s * (w / 2 - 0.12), BED, z], segs: 6 });
  }
  b.deck(w, len + 1, y + 0.14, { at: [x, 0, zc] });
}

/** Water lying in a channel (a mill race, vat or basin): a thin glossy slab with its base at `at`. */
export function water(b: Builder, w: number, d: number, at: Vec3, color: number = P.water): void {
  b.box(w, 0.05, d, color, { at, mat: 'glass', jitter: false });
}

/** A river boat or barge: hull of length L and beam w along X, sitting in the water. */
export function boat(b: Builder, at: Vec3, L: number, w: number, color: number = P.oak, rotY = 0, cargo?: number): void {
  b.group({ at: [at[0], WATER - 0.3, at[2]], rotY }, () => {
    const h = Math.min(1.1, w * 0.42);
    b.extrude(
      [
        [-L / 2, h],
        [-L / 2 + 0.7, 0],
        [L / 2 - 0.7, 0],
        [L / 2, h],
        [L / 2 - 0.25, h + 0.12],
        [-L / 2 + 0.25, h + 0.12],
      ],
      w,
      color,
    );
    b.box(L - 1.6, 0.06, w - 0.24, P.oakDark, { at: [0, h - 0.2, 0] });
    if (cargo !== undefined) b.box(L * 0.5, 0.5, w * 0.6, cargo, { at: [0, h - 0.15, 0] });
  });
}

/** A steep thatched gable roof (about 50 degrees). */
export function thatchRoof(b: Builder, w: number, d: number, at: Vec3, o?: { ridge?: 'x' | 'z'; color?: number; deg?: number; overhang?: number }): void {
  const span = (o?.ridge ?? 'x') === 'x' ? d : w;
  b.gable(w, d, rise(span, o?.deg ?? 50), o?.color ?? P.thatch, { at, ridge: o?.ridge, overhang: o?.overhang ?? 0.5, thick: 0.4 });
}

/** A ring of posts holding up a roof with open sides: an open shelter, `w` by `d`, posts `h` tall. */
export function posts(b: Builder, w: number, d: number, h: number, at: Vec3, color: number = P.oak, nx = 3, nz = 2, r = 0.12): void {
  for (const x of lin(nx, -w / 2 + r, w / 2 - r)) for (const z of lin(nz, -d / 2 + r, d / 2 - r)) b.cyl(r, h, color, { at: [at[0] + x, at[1], at[2] + z], segs: 6 });
  for (const z of lin(nz, -d / 2 + r, d / 2 - r)) b.box(w, 0.2, 0.2, color, { at: [at[0], at[1] + h - 0.2, at[2] + z] });
}

/** A wattle fence along X from x0 to x1 at z (or along Z when `alongZ`). */
export function fence(b: Builder, a0: number, a1: number, c: number, alongZ = false, h = 1.1, color: number = P.wattle): void {
  const len = Math.abs(a1 - a0);
  const mid = (a0 + a1) / 2;
  const at: Vec3 = alongZ ? [c, 0, mid] : [mid, 0, c];
  b.box(alongZ ? 0.12 : len, h, alongZ ? len : 0.12, color, { at });
  for (const p of lin(Math.max(2, Math.round(len / 1.6) + 1), Math.min(a0, a1), Math.max(a0, a1))) {
    b.cyl(0.07, h + 0.2, P.oakDark, { at: alongZ ? [c, 0, p] : [p, 0, c], segs: 5 });
  }
}

/** A tenter frame along X, `len` long, with a length of cloth stretched on it (the French rame). */
export function tenter(b: Builder, x: number, z: number, len: number, cloth: number, timber: number = P.oak): void {
  const n = Math.round(len / 2) + 1;
  for (const px of lin(n, x - len / 2, x + len / 2)) b.box(0.12, 1.9, 0.12, timber, { at: [px, 0, z] });
  b.box(len + 0.2, 0.12, 0.14, timber, { at: [x, 1.75, z] });
  b.box(len + 0.2, 0.1, 0.14, timber, { at: [x, 0.3, z] });
  b.box(len - 0.5, 1.3, 0.03, cloth, { at: [x, 0.42, z + 0.08], jitter: false });
}

/** A wooden vat (cuve) of radius r, its base on `at`, filled to near the brim with `liquid`. */
export function vat(b: Builder, r: number, h: number, at: Vec3, liquid: number, wood: number = P.oak): void {
  b.cyl(r, h, wood, { at, rTop: r * 1.06, segs: 10 });
  for (const y of [0.15, h * 0.55, h - 0.15]) b.cyl(r * (1.02 + (y / h) * 0.06), 0.08, P.iron, { at: [at[0], at[1] + y, at[2]], segs: 10, jitter: false });
  b.cyl(r * 0.98, 0.05, liquid, { at: [at[0], at[1] + h - 0.12, at[2]], segs: 10, mat: 'glass', jitter: false });
}

/** A barrel lying on its side along X (or standing when `upright`). */
export function barrel(b: Builder, at: Vec3, upright = false, color: number = P.oak): void {
  if (upright) b.lathe([[0.26, 0], [0.33, 0.4], [0.26, 0.8]], color, { at, segs: 8 });
  else b.group({ at: [at[0], at[1] + 0.33, at[2]], rot: [0, 0, Math.PI / 2] }, () => b.lathe([[0.26, -0.4], [0.33, 0], [0.26, 0.4]], color, { segs: 8 }));
}

/** A pile of logs or billets along X. */
export function logPile(b: Builder, at: Vec3, len: number, rows = 3, color: number = P.bark): void {
  for (let j = 0; j < rows; j++) {
    const n = rows - j + 1;
    for (let i = 0; i < n; i++) b.log(0.16, len, tint(color, b.range(-0.04, 0.04)), { at: [at[0], at[1] + j * 0.28, at[2] + (i - (n - 1) / 2) * 0.34], segs: 6 });
  }
}

/**
 * A water-driven tilt hammer (martinet): a heavy iron head on a long oak helve, pivoted in a frame
 * and lifted by cams on the wheel shaft, falling on an anvil. The shaft runs along -Z from x; the
 * helve lies along X. `at` is the anvil.
 */
export function tiltHammer(b: Builder, at: Vec3, dir: 1 | -1 = 1, shaftTo?: number): void {
  const [x, y, z] = at;
  // anvil on its great block of oak
  b.cyl(0.5, 0.8, P.oakDark, { at: [x, y, z], segs: 8 });
  b.box(0.5, 0.35, 0.4, P.iron, { at: [x, y + 0.8, z] });
  // the helve pivoted on two posts at its middle, the head over the anvil, the tail over the cam shaft
  const px = x + dir * 2.0;
  b.sym((s) => b.box(0.35, 1.9, 0.35, P.oak, { at: [px, y, z + s * 0.45] }));
  b.box(0.4, 0.2, 1.3, P.oak, { at: [px, y + 1.9, z] });
  b.beam([x, y + 1.6, z], [x + dir * 3.2, y + 1.25, z], 0.28, 0.32, P.oak);
  b.box(0.42, 0.5, 0.42, P.iron, { at: [x, y + 1.25, z] }); // the head
  // the cam shaft (arbre à cames) running out to the wheel, with its cams by the tail
  const z1 = shaftTo ?? z - 4.0;
  b.log(0.3, z + 0.6 - z1, P.oakDark, { at: [x + dir * 3.4, y + 0.3, (z + 0.6 + z1) / 2], axis: 'z', segs: 8 });
  for (const a of [0, 1.6, 3.2, 4.8]) {
    b.group({ at: [x + dir * 3.4, y + 0.6, z], rot: [0, 0, a] }, () => b.box(0.22, 0.8, 0.22, P.oak, { at: [0, 0, 0] }));
  }
}

/** A heap of charcoal (or a charcoal clamp): a low earth-covered dome. */
export function charcoalStack(b: Builder, at: Vec3, r: number, h: number, earth: number = P.soil): void {
  b.dome(r, earth, { at, squash: h / r, segs: 9 });
  b.cyl(0.18, 0.25, P.timberBlack, { at: [at[0], at[1] + h - 0.1, at[2]], segs: 5 });
}

/** A heap of loose material (ore, coal, sand) on `at`. */
export function heap(b: Builder, at: Vec3, r: number, h: number, color: number): void {
  b.cone(r, h, color, { at, segs: 8 });
}

/** A small round-headed or square window used on rubble walls: a dark opening with a stone surround. */
export function slit(b: Builder, w: number, h: number, at: Vec3, facing: '+z' | '-z' | '+x' | '-x', stone: number, shape: 'rect' | 'round' | 'pointed' = 'round'): void {
  b.window(w, h, { at, facing, shape, frame: stone, glass: P.timberBlack, border: 0.12 });
}

/** A buttress against a wall, stepping back once: `at` is the base where it meets the wall face. */
export function buttress(b: Builder, at: Vec3, h: number, facing: '+z' | '-z' | '+x' | '-x', color: number, w = 0.8, proj = 1.0): void {
  const ang = facing === '+z' ? 0 : facing === '-z' ? Math.PI : facing === '+x' ? Math.PI / 2 : -Math.PI / 2;
  b.group({ at, rotY: ang }, () => {
    b.box(w, h * 0.55, proj, color, { at: [0, 0, proj / 2] });
    b.box(w, h * 0.35, proj * 0.6, color, { at: [0, h * 0.55, proj * 0.3] });
    b.extrude([[0, 0], [proj * 0.6, 0], [0, h * 0.1]], w, tint(color, -0.04), { at: [0, h * 0.9, 0], rot: [0, -Math.PI / 2, 0] });
    b.extrude([[0, 0], [proj, 0], [proj * 0.6, h * 0.08], [0, h * 0.08]], w, tint(color, -0.04), { at: [0, h * 0.55 - 0.01, 0], rot: [0, -Math.PI / 2, 0] });
  });
}

/** A square brick factory chimney, tapering, with a corbelled cap. `at` is the base. */
export function squareChimney(b: Builder, at: Vec3, h: number, base: number, color: number, cap?: number): void {
  const top = base * 0.62;
  b.box(base + 0.6, 2.2, base + 0.6, tint(color, -0.06), { at });
  const g = (bw: number, tw: number, hh: number, y: number) => {
    // a frustum with four sides: a 4-sided cylinder turned 45 degrees
    b.cyl((bw / 2) * Math.SQRT2, hh, color, { at: [at[0], at[1] + y, at[2]], rTop: (tw / 2) * Math.SQRT2, segs: 4, rotY: Math.PI / 4 });
  };
  g(base, top, h - 3, 2.2);
  const c = cap ?? tint(color, -0.12);
  b.box(top + 0.5, 0.35, top + 0.5, c, { at: [at[0], at[1] + h - 0.8, at[2]] });
  b.box(top + 0.3, 0.5, top + 0.3, c, { at: [at[0], at[1] + h - 0.45, at[2]] });
  b.box(top - 0.2, 0.1, top - 0.2, P.timberBlack, { at: [at[0], at[1] + h + 0.04, at[2]], jitter: false });
}

/** A round brick factory chimney, tapering, with a cap band. `at` is the base. */
export function roundChimney(b: Builder, at: Vec3, h: number, r: number, color: number): void {
  b.box(r * 2.6, 3.0, r * 2.6, tint(color, -0.06), { at });
  b.cyl(r, h - 3, color, { at: [at[0], at[1] + 3, at[2]], rTop: r * 0.62, segs: 12 });
  b.cyl(r * 0.72, 0.9, tint(color, -0.14), { at: [at[0], at[1] + h - 0.9, at[2]], segs: 12 });
}

/**
 * A segmental shell or arch band spanning `span` across Z with a `rise`, running `len` along X,
 * `thick` deep, between fractions t0 and t1 of its half-angle (-1 to 1 is the whole arch).
 * `at` is the centre of the springing line.
 */
export function shell(b: Builder, span: number, riseH: number, thick: number, len: number, t0: number, t1: number, color: number, at: Vec3, o?: { mat?: 'glass'; segs?: number }): void {
  const R = (span * span) / 4 / (2 * riseH) + riseH / 2;
  const alpha = Math.asin(span / 2 / R);
  const n = Math.max(2, Math.round((o?.segs ?? 14) * (t1 - t0) / 2));
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (t0 + ((t1 - t0) * i) / n) * alpha;
    outer.push([R * Math.sin(a), R * Math.cos(a) - (R - riseH)]);
    inner.push([(R - thick) * Math.sin(a), (R - thick) * Math.cos(a) - (R - riseH)]);
  }
  b.group({ at, rotY: Math.PI / 2 }, () => b.extrude([...outer, ...inner.reverse()], len, color, { mat: o?.mat, jitter: o?.mat ? false : undefined }));
}

export interface WorksOpts {
  /** 2010: the works reused as studios, a concert hall and a café. */
  reused?: boolean;
}

/**
 * The reinforced-concrete workshop of the Reconstruction (1921), and the same building reused (2010).
 * A hall of thin segmental concrete arches with glazed rooflights between them, the frame left bare,
 * a water tower at the street corner and a concrete quay on the river.
 */
export function concreteWorks(b: Builder, o: WorksOpts = {}): void {
  const reused = !!o.reused;
  const conc = reused ? tint(P.concrete, 0.06) : P.concrete;
  const concDark = P.concreteDark;
  const brick = P.briqueNord;
  const glass = reused ? P.glassDark : P.windowDark;
  const x0 = -2;
  const W = 28;
  const D = 15;
  const z0 = -3.2;
  const hw = 5.0; // the springing of the arches
  const f = 4.2; // the rise of the arches
  const front = z0 + D / 2;
  const back = z0 - D / 2;
  const nb = 8;
  const bay = W / nb;

  b.box(35, 0.04, 21.6, reused ? tint(P.paving, 0.04) : tint(P.concrete, -0.06), { at: [0, 0, 0], jitter: false });
  // the concrete quay: a river wall and a deck on concrete piles standing out over the water
  b.box(35.2, 0.3 - BED, 1.0, concDark, { at: [0, BED, BANK + 0.3] });
  b.box(32, 0.3, 2.6, conc, { at: [-1, 0.2, BANK - 1.3] });
  for (const x of lin(9, -16.6, 14.6)) b.box(0.4, 0.2 - BED, 0.4, concDark, { at: [x, BED, BANK - 2.3] });
  b.box(32, 0.25, 0.3, concDark, { at: [-1, 0.5, BANK - 2.45] });
  b.deck(32, 2.6, 0.5, { at: [-1, 0, BANK - 1.3] });

  // ---- the long walls: concrete posts and beam left bare, brick below, steel windows between
  for (const [z, s] of [
    [front, 1],
    [back, -1],
  ] as const) {
    b.box(W, 0.6, 0.45, conc, { at: [x0, hw - 0.6, z] }); // the ring beam
    for (let i = 0; i < nb; i++) {
      const x = x0 - W / 2 + (i + 0.5) * bay;
      b.box(bay - 0.5, 1.2, 0.3, reused ? P.briqueNord : brick, { at: [x, 0, z] });
      if (reused && s > 0 && i >= 2 && i <= 4) continue; // opened up behind the new foyer
      b.box(bay - 0.5, hw - 1.8, 0.12, glass, { at: [x, 1.2, z], mat: reused ? 'glass' : undefined });
      for (const xx of lin(4, x - bay / 2 + 0.25, x + bay / 2 - 0.25).slice(1, -1)) b.box(0.07, hw - 1.8, 0.2, reused ? P.castIron : P.steel, { at: [xx, 1.2, z], jitter: false });
      for (const y of [2.4, 3.5]) b.box(bay - 0.5, 0.06, 0.2, reused ? P.castIron : P.steel, { at: [x, y, z], jitter: false });
    }
    for (let i = 0; i <= nb; i++) b.box(0.5, hw, 0.6, conc, { at: [x0 - W / 2 + i * bay, 0, z] });
  }
  // the gable ends: the end arch over a great glazed lunette with concrete mullions
  b.sym((s) => {
    const x = x0 + s * (W / 2);
    b.box(0.45, hw, D, conc, { at: [x, 0, z0] });
    b.group({ at: [x, 0, z0], rotY: s > 0 ? 0 : Math.PI }, () => {
      for (const z of lin(4, -D / 2 + 2.2, D / 2 - 2.2)) b.window(2.2, 3.0, { at: [0.22, 1.2, z], facing: '+x', frame: concDark, glass, bars: [2, 3] });
    });
    shell(b, D, f, 0.5, 0.5, -1, 1, conc, [x, hw, z0]);
    // the lunette under the end arch: glazed, with upright concrete mullions
    const R = (D * D) / 4 / (2 * f) + f / 2;
    const pts: Pt[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (-1 + i / 5) * Math.asin(D / 2 / R);
      pts.push([R * Math.sin(a), R * Math.cos(a) - (R - f)]);
    }
    b.group({ at: [x, hw, z0], rotY: Math.PI / 2 }, () => b.extrude(pts.map(([u, v]) => [u * 0.97, Math.max(0, v - 0.45)] as Pt), 0.1, glass, { mat: reused ? 'glass' : undefined, jitter: false }));
    for (const z of lin(5, -D / 2 + 2.5, D / 2 - 2.5)) {
      const zz = z;
      const yTop = Math.sqrt(R * R - zz * zz) - (R - f) - 0.4;
      b.box(0.25, yTop, 0.25, conc, { at: [x + s * 0.06, hw, z0 + zz] });
    }
  });

  // ---- the roof: thin arches every bay, concrete shell at the haunches, glazed rooflights at the crown
  for (let i = 0; i <= nb; i++) shell(b, D, f, 0.55, 0.35, -1, 1, conc, [x0 - W / 2 + i * bay, hw, z0]);
  const lit = reused ? 0.3 : 0.42;
  for (let i = 0; i < nb; i++) {
    if (reused && i < 2) continue; // the concert hall rises through these bays
    const x = x0 - W / 2 + (i + 0.5) * bay;
    shell(b, D, f - 0.12, 0.14, bay - 0.35, -1, -lit, conc, [x, hw, z0], { segs: 12 });
    shell(b, D, f - 0.12, 0.14, bay - 0.35, lit, 1, conc, [x, hw, z0], { segs: 12 });
    shell(b, D, f - 0.12, 0.08, bay - 0.35, -lit, lit, reused ? P.glass : 0x8fb0bd, [x, hw, z0], { mat: 'glass', segs: 6 });
  }
  // doors: a big sliding door on the yard and one on the quay
  b.panel(4.0, 3.8, reused ? P.cladRed : P.doorGreen, { at: [x0 + W / 2 - 1.8 - bay, 0, front + 0.32], facing: '+z' });
  b.panel(4.0, 3.8, P.doorGreen, { at: [x0 - 1.8, 0, back - 0.32], facing: '-z' });

  // ---- the water tower at the street corner: a concrete shaft carrying a tank
  const tx = 14.2;
  const tz = 5.6;
  const TH = 19;
  b.box(3.2, TH, 3.2, conc, { at: [tx, 0, tz] });
  for (const y of lin(4, 3, TH - 3)) {
    b.window(0.6, 1.6, { at: [tx, y, tz + 1.6], facing: '+z', frame: concDark, glass });
    b.window(0.6, 1.6, { at: [tx - 1.6, y, tz], facing: '-x', frame: concDark, glass });
  }
  b.box(5.2, 3.6, 5.2, conc, { at: [tx, TH, tz] }); // the tank
  b.box(5.4, 0.3, 5.4, concDark, { at: [tx, TH, tz] });
  b.box(5.5, 0.4, 5.5, concDark, { at: [tx, TH + 3.6, tz] });
  for (const x of lin(4, tx - 1.8, tx + 1.8)) b.box(0.25, 3.0, 0.1, concDark, { at: [x, TH + 0.4, tz + 2.6], jitter: false });
  b.panel(1.0, 2.2, P.doorGreen, { at: [tx, 0, tz + 1.6], facing: '+z' });

  if (!reused) {
    // the yard: a gate in a concrete fence, a lorry, crates; a crane on the quay
    b.box(14, 1.8, 0.25, conc, { at: [-9.0, 0, 10.6] });
    b.box(6.5, 1.8, 0.25, conc, { at: [7.3, 0, 10.6] });
    b.sym((s) => b.box(0.7, 2.6, 0.7, conc, { at: [1.0 + s * 3.0, 0, 10.6] }));
    for (let i = 0; i < 5; i++) b.box(1.1, 0.9, 1.0, P.pine, { at: [-12.0 + (i % 3) * 1.2, Math.floor(i / 3) * 0.9, 7.0] });
    // a lorry of the 1920s
    b.group({ at: [4.0, 0, 7.4] }, () => {
      b.box(4.4, 0.25, 1.9, P.timberBlack, { at: [0, 0.6, 0] });
      b.box(1.4, 1.5, 1.8, P.doorGreen, { at: [1.6, 0.85, 0] });
      b.box(2.8, 0.7, 1.9, P.oak, { at: [-0.7, 0.85, 0] });
      for (const x of [-1.4, 1.5]) for (const z of [-0.85, 0.85]) b.log(0.42, 0.25, P.timberBlack, { at: [x, 0, z], axis: 'z', segs: 8 });
    });
    // a derrick crane on the quay
    const cz = BANK - 1.6;
    b.box(0.5, 6.5, 0.5, P.steel, { at: [-12.0, 0.5, cz] });
    b.beam([-12.0, 6.6, cz], [-12.0, 3.8, BANK - 6.2], 0.3, 0.3, P.steel);
    b.beam([-12.0, 1.4, cz], [-12.0, 3.8, BANK - 6.2], 0.2, 0.2, P.steel);
    b.beam([-12.0, 3.8, BANK - 6.2], [-12.0, 0.9, BANK - 6.2], 0.04, 0.04, P.timberBlack);
    b.box(1.0, 0.7, 0.8, P.pine, { at: [-12.0, 0.2, BANK - 6.2] });
    boat(b, [-8.0, 0, BANK - 6.0], 16, 4.0, 0x3c3a36, 0, P.pine);
    for (let i = 0; i < 4; i++) b.box(1.0, 0.8, 1.0, P.pine, { at: [-4.0 + (i % 2) * 1.1, 0.5 + Math.floor(i / 2) * 0.8, BANK - 1.3] });
  } else {
    // ---- reuse: a glass foyer and café on the yard, the concert hall rising out of the west bays
    const fx = x0 - W / 2 + 3.5 * bay;
    b.box(3 * bay - 0.4, 4.4, 4.0, P.glass, { at: [fx, 0, front + 2.2], mat: 'glass', jitter: false });
    b.box(3 * bay + 0.6, 0.4, 5.0, P.cladWhite, { at: [fx, 4.4, front + 2.4] });
    for (const x of lin(6, fx - 1.5 * bay + 0.1, fx + 1.5 * bay - 0.1)) b.box(0.12, 4.4, 0.12, P.castIron, { at: [x, 0, front + 4.2], jitter: false });
    // terrace with tables and parasols on the yard
    for (const [x, z] of [
      [fx - 3.5, 8.6],
      [fx, 8.8],
      [fx + 3.5, 8.6],
    ]) {
      b.cyl(0.4, 0.75, P.white, { at: [x, 0, z], segs: 8 });
      b.cyl(0.04, 2.3, P.steel, { at: [x, 0.75, z], segs: 4 });
      b.cone(1.5, 0.6, b.pick([P.cladRed, P.white, P.cladYellow]), { at: [x, 2.5, z], segs: 8 });
    }
    // the concert hall: a dark box of corrugated metal pushed up through the two west bays
    const hx = x0 - W / 2 + bay;
    b.box(2 * bay - 0.6, hw + f + 3.0, D - 2.4, P.cladGrey, { at: [hx, 0, z0] });
    b.box(2 * bay - 0.4, 0.3, D - 2.2, P.timberBlack, { at: [hx, hw + f + 3.0, z0] });
    for (const x of lin(8, hx - bay + 0.6, hx + bay - 0.6)) b.box(0.08, 3.0, D - 2.36, tint(P.cladGrey, -0.08), { at: [x, hw + f, z0], jitter: false });
    // studios: the east bays' windows coloured with blinds; solar panels on the south haunches
    for (let i = nb - 2; i < nb; i++) {
      const x = x0 - W / 2 + (i + 0.5) * bay;
      b.box(bay - 0.7, 0.8, 0.14, P.cladYellow, { at: [x, 3.6, front + 0.02], jitter: false });
    }
    // the tower kept as a landmark: a glass lantern and a band of light on top
    b.box(3.6, 2.4, 3.6, P.glass, { at: [tx, TH + 4.0, tz], mat: 'glass', jitter: false });
    b.box(4.0, 0.25, 4.0, P.cladWhite, { at: [tx, TH + 6.4, tz] });
    b.box(5.3, 0.6, 0.06, P.cladRed, { at: [tx, TH + 1.5, tz + 2.64], jitter: false });
    b.box(0.06, 0.6, 5.3, P.cladRed, { at: [tx + 2.64, TH + 1.5, tz], jitter: false });
    // the quay as a riverside promenade: timber deck, benches, trees, a footbridge landing
    b.box(32, 0.08, 2.6, P.larch, { at: [-1, 0.5, BANK - 1.3], jitter: false });
    for (const x of lin(5, -14, 12)) b.box(1.8, 0.45, 0.5, P.larch, { at: [x, 0.58, BANK - 0.6] });
    for (const x of lin(16, -16.6, 14.6)) b.box(0.05, 1.1, 0.05, P.castIron, { at: [x, 0.5, BANK - 2.5], jitter: false });
    b.box(32, 0.06, 0.08, P.castIron, { at: [-1, 1.6, BANK - 2.5], jitter: false });
    for (const x of lin(4, -15, 9)) b.tree(7, { at: [x, 0, 8.6], kind: 'round' });
    // bicycles at a rack by the gate, and low planting where the fence was
    for (const x of lin(6, -3.0, 0.5)) b.box(0.05, 0.9, 1.6, P.castIron, { at: [x, 0, 10.0], jitter: false });
    b.box(30, 0.5, 1.0, P.hedge, { at: [-3.0, 0, 10.8] });
  }

  b.collider(W + 0.6, D + 0.6, { at: [x0, 0, z0] });
  b.collider(3.2, 3.2, { at: [tx, 0, tz] });
}
