import { P, mix, tint, facingAngle, type Builder, type Facing, type Vec3 } from '@ah/kit';

/*
 * Shared parts for the cathedral. The entrance front is at +Z and the altar end at -Z, so the
 * flanks face ±X. From the early Christian basilica on, the plan is fixed so that what survives
 * stays put from stage to stage:
 *
 *   nave             x ±5.5, from the front (z 12) to z -14 (basilica) or z -19 (later)
 *   aisles           x ±5.5 .. ±9.5, z 12 .. -14 (basilica) or 12 .. -8 (later)
 *   crossing         x ±5.5, z -8 .. -19 (Romanesque on), the dome rises over it from 1440
 *   transept arms    x ±5.5 .. ±14.5, z -8 .. -19
 *   main apse        centred on z -14 (basilica) or z -19 (later)
 *   baptistery       octagon centred at (-12.6, 19.5), from the basilica onward
 *   bell tower       square centred at (12.9, 6.5), from the Romanesque cathedral onward
 *   houses           against the flanks from the twelfth century until 1887
 */

export type Pt = [number, number];
export type Arch = 'rect' | 'round' | 'pointed';

/** The growth stages of the one building: 0 basilica .. 5 nineteenth-century front. */
export type Phase = 0 | 1 | 2 | 3 | 4 | 5;
export const BASILICA = 0;
export const ROMANESQUE = 1;
export const GOTHIC = 2;
export const DOME = 3;
export const BAROQUE = 4;
export const REVIVAL = 5;

// ------------------------------------------------------------------ plan

export const FZ = 12; // the entrance wall of the body
export const FF = 12.6; // the outer face of the medieval screen front
export const NW = 5.5; // half-width of the nave
export const AW = 9.5; // outer face of the aisle walls
export const CZ0 = -8; // crossing, west edge
export const CZ1 = -19; // crossing, east edge
export const CZ = (CZ0 + CZ1) / 2;
export const TW = 14.5; // transept end walls
export const AISLE_H = 8;
export const NAVE_H_ROM = 14.5;
export const NAVE_H_GOTH = 18;
export const NAVE_RISE = 2.2;
export const TOWER = { x: 12.9, z: 6.5, s: 5.2, h: 30 };
export const BAPT = { x: -12.6, z: 19.5, r: 3.3 };

// ------------------------------------------------------------------ materials

export const BRICK = mix(P.brickBuff, P.brickOrange, 0.45);
export const MARBLE = P.marble;
/** The grey-green bands of the Romanesque work (serpentine or grey marble in white). */
export const STRIPE_R = mix(P.marbleGreen, P.pietraSerena, 0.45);
/** The near-black bands of the Gothic work (dark marble or basalt in white). */
export const STRIPE_G = tint(P.marbleGreen, -0.1);
export const RECESS = mix(P.marble, P.black, 0.6);
export const ROOF = P.coppi;
export const DOORWOOD = P.oakDark;
export const SELENITE = mix(P.windowDark, P.plaster, 0.35);

// ------------------------------------------------------------------ arch geometry

export function rise(kind: Arch, a: number): number {
  return kind === 'round' ? a : kind === 'pointed' ? a * Math.sqrt(3) : 0;
}

/** Points along an arch head of half-width a springing at ys, from the left springing to the right. */
export function archHead(kind: Arch, a: number, ys: number, xc = 0, segs = 3): Pt[] {
  const out: Pt[] = [];
  if (kind === 'rect') return [[xc - a, ys], [xc + a, ys]];
  if (kind === 'round') {
    for (let i = 0; i <= segs * 2; i++) {
      const t = Math.PI - (Math.PI * i) / (segs * 2);
      out.push([xc + a * Math.cos(t), ys + a * Math.sin(t)]);
    }
    return out;
  }
  // equilateral pointed arch: two arcs of radius 2a
  for (let i = 0; i <= segs; i++) {
    const t = Math.PI - ((Math.PI / 3) * i) / segs;
    out.push([xc + a + 2 * a * Math.cos(t), ys + 2 * a * Math.sin(t)]);
  }
  out[out.length - 1] = [xc, ys + a * Math.sqrt(3)];
  for (let i = 1; i <= segs; i++) {
    const t = Math.PI / 3 - ((Math.PI / 3) * i) / segs;
    out.push([xc - a + 2 * a * Math.cos(t), ys + 2 * a * Math.sin(t)]);
  }
  return out;
}

/** Closed outline of an opening w wide and h tall to the apex, bottom centre at (xc, y0). */
export function archPts(kind: Arch, w: number, h: number, xc = 0, y0 = 0, segs = 3): Pt[] {
  const a = w / 2;
  const ys = y0 + Math.max(0.03, h - rise(kind, a));
  return [[xc - a, y0], [xc + a, y0], ...archHead(kind, a, ys, xc, segs).reverse()];
}

/** A strip whose underside is scalloped by n arches: the top of an arcade or a corbel table. */
export function archStrip(kind: Arch, x0: number, x1: number, n: number, ys: number, ytop: number, a: number, segs = 3): Pt[] {
  const pitch = (x1 - x0) / n;
  const pts: Pt[] = [[x0, ytop], [x0, ys]];
  for (let i = 0; i < n; i++) pts.push(...archHead(kind, a, ys, x0 + pitch * (i + 0.5), segs));
  pts.push([x1, ys], [x1, ytop]);
  return pts;
}

export function circlePts(cx: number, cy: number, r: number, n = 12): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return out;
}

// ------------------------------------------------------------------ cheap wall details

/** Run fn in the frame of a wall surface: local x along the wall, y up, +z out of the wall. */
export function onWall(b: Builder, at: Vec3, facing: Facing, fn: () => void) {
  b.group({ at, rotY: facingAngle(facing) }, fn);
}

/** A flat arched panel on a wall: a window, a door leaf, a blind niche, an inlay. */
export function opening(b: Builder, kind: Arch, w: number, h: number, at: Vec3, facing: Facing, color: number = P.windowDark, depth = 0.06) {
  onWall(b, at, facing, () => b.extrude(archPts(kind, w, h, 0, 0, 2), depth, color, { at: [0, 0, depth / 2 - 0.01], jitter: false }));
}

/** An arched window or door with a stone surround: two cheap extrusions. */
export function framed(b: Builder, kind: Arch, w: number, h: number, at: Vec3, facing: Facing, frame: number, inner: number = P.windowDark, bd = 0.16) {
  onWall(b, at, facing, () => {
    b.extrude(archPts(kind, w + bd * 2, h + bd * 1.2, 0, -bd * 0.6, 2), 0.06, frame, { at: [0, 0, 0.02], jitter: false });
    b.extrude(archPts(kind, w, h, 0, 0, 2), 0.06, inner, { at: [0, 0, 0.05], jitter: false });
  });
}

/** A two-light pointed Gothic window: dark lights with a central mullion and a small circle above. */
export function gothicWindow(b: Builder, w: number, h: number, at: Vec3, facing: Facing, frame: number) {
  onWall(b, at, facing, () => {
    b.extrude(archPts('pointed', w + 0.3, h + 0.2, 0, -0.1, 2), 0.06, frame, { at: [0, 0, 0.02], jitter: false });
    b.extrude(archPts('pointed', w, h, 0, 0, 2), 0.06, P.windowDark, { at: [0, 0, 0.05], jitter: false });
    // central mullion and a small roundel in the head
    b.box(0.12, h * 0.68, 0.06, frame, { at: [0, 0, 0.09], jitter: false });
    b.box(w * 0.36, w * 0.36, 0.06, frame, { at: [0, h * 0.68, 0.09], rot: [0, 0, Math.PI / 4], jitter: false });
  });
}

/**
 * Blind arcading: a relief of pilasters and arches laid over a wall, len long, from y0 to y1, with n
 * arches whose crowns reach archTop. Placed on the wall surface at `at`, facing `facing`.
 */
export function blindArcade(
  b: Builder,
  o: { len: number; y0: number; y1: number; n: number; archTop: number; at: Vec3; facing: Facing; color: number; kind?: Arch; depth?: number; pier?: number },
) {
  const kind = o.kind ?? 'round';
  const pitch = o.len / o.n;
  const ow = pitch - (o.pier ?? 0.4);
  const base = o.y0 + 0.3;
  const holes: Pt[][] = [];
  for (let i = 0; i < o.n; i++) holes.push(archPts(kind, ow, o.archTop - base, -o.len / 2 + pitch * (i + 0.5), base, 2));
  const depth = o.depth ?? 0.16;
  onWall(b, o.at, o.facing, () => {
    b.extrude([[-o.len / 2, o.y0], [o.len / 2, o.y0], [o.len / 2, o.y1], [-o.len / 2, o.y1]], depth, o.color, {
      at: [0, 0, depth / 2],
      holes,
      jitter: false,
    });
  });
}

/** Horizontal bands round a rectangular block (w × d centred on x, z), every `pitch` from y0 to y1. */
export function bands(b: Builder, w: number, d: number, y0: number, y1: number, pitch: number, thick: number, color: number, x: number, z: number) {
  for (let y = y0 + pitch - thick; y < y1 - thick * 0.5; y += pitch) {
    b.box(w + 0.05, thick, d + 0.05, color, { at: [x, y, z], jitter: false });
  }
}

/**
 * An open dwarf gallery on a façade facing +Z: a dark recess, a sill, a row of little columns and the
 * arches they carry. x0..x1 wide, y0 to y0 + h, the recess on the plane z.
 */
export function gallery(b: Builder, o: { x0: number; x1: number; y0: number; h: number; n: number; z: number; color?: number; col?: number }) {
  const white = o.color ?? MARBLE;
  const xc = (o.x0 + o.x1) / 2;
  const w = o.x1 - o.x0;
  const pitch = w / o.n;
  const a = pitch / 2 - 0.12;
  const ys = o.y0 + o.h - 0.38 - a;
  b.box(w, o.h, 0.08, RECESS, { at: [xc, o.y0, o.z + 0.02], jitter: false });
  b.box(w + 0.1, 0.24, 0.8, white, { at: [xc, o.y0, o.z + 0.4] });
  for (let i = 0; i <= o.n; i++) {
    const x = Math.min(o.x1 - 0.14, Math.max(o.x0 + 0.14, o.x0 + i * pitch));
    b.cyl(0.1, ys - o.y0 - 0.24, o.col ?? white, { at: [x, o.y0 + 0.24, o.z + 0.42], segs: 6, jitter: false });
  }
  b.extrude(archStrip('round', o.x0, o.x1, o.n, ys, o.y0 + o.h, a, 2), 0.28, white, { at: [0, 0, o.z + 0.42], jitter: false });
}

/** A standing statue on a small pedestal: robe, shoulders and head. */
export function statue(b: Builder, at: Vec3, h: number, color: number, rotY = 0) {
  b.group({ at, rotY }, () => {
    b.box(h * 0.3, h * 0.12, h * 0.3, color, { jitter: false });
    b.cyl(h * 0.13, h * 0.72, color, { at: [0, h * 0.12, 0], rTop: h * 0.1, segs: 5, jitter: false });
    b.box(h * 0.13, h * 0.15, h * 0.13, color, { at: [0, h * 0.84, 0], jitter: false });
  });
}

/** A simple pinnacle: shaft and pyramid, as on Gothic piers and gables. */
export function pinnacle(b: Builder, at: Vec3, r: number, h: number, color: number) {
  b.cyl(r, h * 0.35, color, { at, segs: 4, rotY: Math.PI / 4, jitter: false });
  b.cone(r * 1.15, h * 0.65, color, { at: [at[0], at[1] + h * 0.35, at[2]], segs: 4, rotY: Math.PI / 4, jitter: false });
}

// ------------------------------------------------------------------ the pagan sanctuary (750 BC to AD 392)

/**
 * The stone altar of the open-air sanctuary. Altars were holier than the temples built behind them
 * and were kept when the temples were rebuilt, so the same block stands in front of the open-air
 * sanctuary, the Etruscan temple and the Republican one, until the Augustans replace it in marble.
 */
export const ALTAR_Z = 12.5;
export function oldAltar(b: Builder, color: number) {
  b.box(3.2, 0.25, 2.2, tint(color, -0.05), { at: [0, 0, ALTAR_Z] });
  b.box(2.6, 0.8, 1.6, color, { at: [0, 0.25, ALTAR_Z] });
  b.box(2.8, 0.15, 1.8, tint(color, 0.05), { at: [0, 1.05, ALTAR_Z] });
}

/** The Republican temple's podium (c. 120 BC), later encased in the larger Augustan podium. */
export const REP_PODIUM = { z: -3.5, w: 10.6, d: 19.6, h: 2.4 };
export function republicanPodiumCore(b: Builder, color: number) {
  const { z, w, d, h } = REP_PODIUM;
  b.box(w, h, d, color, { at: [0, 0, z] });
}

/** An honorific bronze statue on a stone base, put up in front of the Republican temple and left standing. */
export function honorificStatue(b: Builder) {
  const [x, z] = [-8.5, 9.3];
  b.box(1.2, 1.6, 1.2, P.travertine, { at: [x, 0, z] });
  b.cyl(0.35, 1.9, P.bronze, { at: [x, 1.6, z], rTop: 0.25, segs: 6 });
  b.sphere(0.24, P.bronze, { at: [x, 3.65, z], segs: 6 });
}

/** The paved precinct of the Augustan temple, still underfoot when the first church is built in it. */
export function precinctPaving(b: Builder) {
  b.box(32, 0.05, 60, tint(P.paving, 0.03), { at: [0, 0, 0], jitter: false });
}

// ------------------------------------------------------------------ the octagonal baptistery

/** Centre of face k of an octagon (corners at 22.5°), as [x, z] offset and facing angle. */
function octFace(k: number, ap: number): [number, number, number] {
  const phi = (k * Math.PI) / 4;
  return [ap * Math.sin(phi), ap * Math.cos(phi), phi];
}

/**
 * The baptistery: an eight-sided brick building beside the forecourt from about 400, refaced in
 * white and green marble with blind arches and given a marble pyramid roof in the twelfth century.
 */
export function baptistery(b: Builder, ph: Phase) {
  const { x, z, r } = BAPT;
  const ap = r * Math.cos(Math.PI / 8);
  const o8 = { segs: 8, rotY: Math.PI / 8 };
  b.group({ at: [x, 0, z] }, () => {
    if (ph === BASILICA) {
      b.cyl(r + 0.25, 0.3, P.travertine, o8);
      b.cyl(r, 7, BRICK, { ...o8, at: [0, 0.3, 0] });
      b.cyl(r + 0.22, 0.3, tint(BRICK, -0.1), { ...o8, at: [0, 7.3, 0] });
      b.cone(r + 0.5, 2.2, ROOF, { ...o8, at: [0, 7.6, 0] });
      for (let k = 0; k < 8; k++) {
        const [fx, fz, phi] = octFace(k, ap);
        if (k === 0) {
          framed(b, 'round', 1.4, 2.6, [fx, 0.3, fz], phi, tint(BRICK, 0.12), DOORWOOD);
        } else if (k % 2 === 1) {
          framed(b, 'round', 0.7, 1.6, [fx, 3.9, fz], phi, tint(BRICK, 0.12), SELENITE, 0.12);
        }
      }
      return;
    }
    // the brick octagon of about 400 is kept inside: the twelfth century faces it in marble, raises it
    // and gives it a new roof
    b.cyl(r + 0.25, 0.3, P.travertine, o8);
    b.cyl(r, 7, BRICK, { ...o8, at: [0, 0.3, 0] });
    const green = P.marbleGreen;
    const H = 10;
    const R = r + 0.12; // the marble skin over the old brick
    const apR = R * Math.cos(Math.PI / 8);
    b.cyl(R + 0.3, 0.45, P.travertine, o8);
    b.cyl(R, H, MARBLE, { ...o8, at: [0, 0.45, 0] });
    for (const y of [4.6, 8.0]) b.cyl(R + 0.1, 0.32, green, { ...o8, at: [0, y, 0], jitter: false });
    b.cyl(R + 0.2, 0.35, MARBLE, { ...o8, at: [0, H + 0.45, 0] });
    // striped corner pilasters
    for (let k = 0; k < 8; k++) {
      const t = Math.PI / 8 + (k * Math.PI) / 4;
      b.box(0.36, H, 0.36, green, { at: [R * Math.sin(t) * 0.97, 0.45, R * Math.cos(t) * 0.97], rotY: t, jitter: false });
    }
    for (let k = 0; k < 8; k++) {
      const [fx, fz, phi] = octFace(k, apR);
      // a green-framed blind arch in each face, the door on the side facing the cathedral front
      opening(b, 'round', 1.9, 3.7, [fx, 0.75, fz], phi, green, 0.04);
      opening(b, 'round', 1.55, 3.45, [fx, 0.8, fz], phi, MARBLE, 0.07);
      if (k === 0) framed(b, 'rect', 1.3, 2.7, [fx, 0.45, fz], phi, green, P.bronze, 0.12);
      framed(b, 'round', 0.6, 1.5, [fx, 5.8, fz], phi, green, P.windowDark, 0.12);
      opening(b, 'rect', 1.4, 0.7, [fx, 9.0, fz], phi, green, 0.04);
    }
    b.cone(R + 0.35, 3.2, tint(MARBLE, -0.04), { ...o8, at: [0, H + 0.8, 0] });
    b.cyl(0.55, 1.0, MARBLE, { ...o8, at: [0, H + 3.4, 0] });
    b.cone(0.7, 1.0, MARBLE, { ...o8, at: [0, H + 4.4, 0] });
  });
}

// ------------------------------------------------------------------ the bell tower

/**
 * The freestanding bell tower (campanile), built with the Romanesque cathedral: a banded marble
 * shaft whose openings multiply storey by storey (one, two, three, four lights), so it is lighter
 * at the top where the bells hang. Gothic builders add a spire; the Baroque a new belfry and cupola.
 */
export function campanile(b: Builder, ph: Phase) {
  const { x, z, s, h } = TOWER;
  b.group({ at: [x, 0, z] }, () => {
    b.box(s + 0.4, 0.5, s + 0.4, P.travertine);
    b.box(s, h, s, MARBLE, { at: [0, 0.5, 0] });
    bands(b, s, s, 0.5, h + 0.5, 1.4, 0.32, STRIPE_R, 0, 0);
    // corner pilaster strips and storey cornices
    for (const cx of [-1, 1]) for (const cz of [-1, 1]) b.box(0.55, h, 0.55, MARBLE, { at: [cx * (s / 2 - 0.25), 0.5, cz * (s / 2 - 0.25)], jitter: false });
    const storeys = [10.5, 15.5, 20.5, 25.5];
    for (const y of storeys) b.box(s + 0.3, 0.3, s + 0.3, MARBLE, { at: [0, y, 0], jitter: false });
    const faces: [Facing, number, number][] = [['+z', 0, s / 2], ['-z', 0, -s / 2], ['+x', s / 2, 0], ['-x', -s / 2, 0]];
    for (const [f, fx, fz] of faces) {
      const along = f === '+z' || f === '-z';
      const put = (u: number, y: number, w: number, hh: number) => {
        const at: Vec3 = along ? [u * (f === '+z' ? 1 : -1), y, fz] : [fx, y, -u * (f === '+x' ? 1 : -1)];
        opening(b, 'round', w, hh, at, f, P.windowDark, 0.06);
      };
      put(0, 5, 0.5, 1.6);
      storeys.forEach((y0, i) => {
        const n = i + 1;
        const w = Math.min(1.25, (3.7 - (n - 1) * 0.3) / n);
        for (let k = 0; k < n; k++) put(-((n - 1) * (w + 0.3)) / 2 + k * (w + 0.3), y0 + 0.9, w, 3.0);
      });
    }
    const top = h + 0.5;
    b.box(s + 0.6, 0.45, s + 0.6, MARBLE, { at: [0, top, 0] });
    if (ph === ROMANESQUE) {
      b.pyramid(s + 0.9, s + 0.9, 2.2, ROOF, { at: [0, top + 0.45, 0] });
    } else if (ph === GOTHIC || ph === DOME) {
      // a parapet, corner pinnacles and a tall octagonal brick spire
      b.box(s + 0.6, 0.9, s + 0.6, MARBLE, { at: [0, top + 0.45, 0] });
      b.cone(2.3, 9.5, P.brickRed, { at: [0, top + 1.3, 0], segs: 8, rotY: Math.PI / 8 });
      for (const cx of [-1, 1]) for (const cz of [-1, 1]) pinnacle(b, [cx * (s / 2), top + 1.3, cz * (s / 2)], 0.35, 3.2, MARBLE);
      b.sphere(0.25, P.gold, { at: [0, top + 10.9, 0], segs: 6 });
    } else {
      // Baroque: an open octagonal belfry, urns on the corners, a lead bulb cupola and a cross
      const o8 = { segs: 8, rotY: Math.PI / 8 };
      const y = top + 0.45;
      b.box(s + 0.2, 0.6, s + 0.2, P.travertine, { at: [0, y, 0] });
      b.cyl(2.25, 4.2, P.travertine, { ...o8, at: [0, y + 0.6, 0] });
      for (let k = 0; k < 8; k += 2) {
        const [fx, fz, phi] = octFace(k, 2.25 * Math.cos(Math.PI / 8));
        framed(b, 'round', 1.0, 2.6, [fx, y + 1.3, fz], phi, MARBLE, P.windowDark, 0.12);
      }
      for (const cx of [-1, 1]) for (const cz of [-1, 1]) {
        b.cyl(0.25, 0.5, P.travertine, { at: [cx * (s / 2 - 0.3), y + 0.6, cz * (s / 2 - 0.3)], segs: 6, rTop: 0.12 });
        b.sphere(0.3, P.travertine, { at: [cx * (s / 2 - 0.3), y + 1.35, cz * (s / 2 - 0.3)], segs: 6 });
      }
      b.cyl(2.5, 0.4, P.travertine, { ...o8, at: [0, y + 4.8, 0] });
      b.lathe(
        [[2.2, 0], [2.3, 0.5], [2.0, 1.4], [1.2, 2.2], [0.45, 2.7], [0.5, 3.0], [0.0, 3.4]],
        P.lead,
        { at: [0, y + 5.2, 0], segs: 8, start: Math.PI / 8 },
      );
      b.box(0.1, 1.5, 0.1, P.iron, { at: [0, y + 8.5, 0] });
      b.box(0.7, 0.1, 0.1, P.iron, { at: [0, y + 9.4, 0] });
    }
  });
  b.collider(s + 0.6, s + 0.6, { at: [x, 0, z] });
}

// ------------------------------------------------------------------ houses against the flanks

function house(b: Builder, x0: number, x1: number, z0: number, z1: number, h: number, color: number, side: 1 | -1) {
  const w = Math.abs(x1 - x0);
  const d = Math.abs(z1 - z0);
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  b.box(w, h, d, color, { at: [xc, 0, zc] });
  b.shed(w + 0.5, d + 0.4, 1.3, ROOF, { at: [xc + side * 0.25, h, zc], high: side > 0 ? '-x' : '+x' });
  const fo = side > 0 ? '+x' : '-x';
  const fx = xc + (side * w) / 2;
  const storeys = Math.floor(h / 3);
  const frame = tint(P.travertine, -0.05);
  for (let s = 0; s < storeys; s++) {
    for (const u of [-d / 4, d / 4]) {
      if (s === 0) {
        if (u < 0) framed(b, 'round', 1.8, 2.6, [fx, 0, zc + u], fo, frame, DOORWOOD, 0.14);
        else framed(b, 'rect', 0.8, 1.2, [fx, 1.3, zc + u], fo, frame, P.windowDark, 0.1);
      } else {
        framed(b, 'rect', 0.8, 1.35, [fx, s * 3 + 1.0, zc + u], fo, frame, P.windowDark, 0.1);
      }
    }
  }
  for (const zf of [z0, z1]) {
    const f: Facing = zf === Math.max(z0, z1) ? '+z' : '-z';
    for (let s = 1; s < storeys; s++) framed(b, 'rect', 0.8, 1.35, [xc, s * 3 + 1.0, zf], f, frame, P.windowDark, 0.1);
  }
}

/** Houses built up against the cathedral's flanks, as in every Italian town; cleared in 1887. */
export function houses(b: Builder, ph: Phase) {
  const up = ph >= DOME ? 3 : 0;
  house(b, AW, AW + 6, 3.4, -1.9, 6.4 + up, P.intonacoOchre, 1);
  house(b, AW, AW + 5.4, -2.2, -7.6, 6.2, P.intonacoRose, 1);
  house(b, -AW, -AW - 6, 11.4, 5.2, 6.4 + (ph >= GOTHIC ? 3 : 0), P.intonacoSienna, -1);
  b.collider(6, 11.0, { at: [AW + 3, 0, -2.1] });
  b.collider(6, 6.2, { at: [-AW - 3, 0, 8.3] });
}

// ------------------------------------------------------------------ the medieval body

/**
 * Nave, aisles, transept and apse of the medieval cathedral. Phase ROMANESQUE builds them in white
 * marble banded with grey-green, with blind arcading on the aisles; from GOTHIC the nave and
 * transept walls are raised in black and white bands with pointed windows (the old round-headed
 * clerestory windows blocked); from DOME the crossing carries the drum and dome.
 */
export function medievalBody(b: Builder, ph: Phase) {
  const naveH = ph >= GOTHIC ? NAVE_H_GOTH : NAVE_H_ROM;
  const navZ0 = FZ;
  const navZ1 = CZ1;
  const navLen = navZ0 - navZ1;
  const navC = (navZ0 + navZ1) / 2;
  const aisLen = FZ - CZ0;
  const aisC = (FZ + CZ0) / 2;

  // plinth, aisles, nave and transept as solid blocks
  b.box(AW * 2 + 0.5, 0.45, aisLen + 0.2, P.travertine, { at: [0, 0, aisC] });
  b.box(TW * 2 + 0.5, 0.45, CZ0 - CZ1 + 0.5, P.travertine, { at: [0, 0, CZ] });
  b.box(AW * 2, AISLE_H, aisLen, MARBLE, { at: [0, 0, aisC] });
  b.box(NW * 2, naveH, navLen, MARBLE, { at: [0, 0, navC] });
  b.box(TW * 2, naveH, CZ0 - CZ1, MARBLE, { at: [0, 0, CZ] });

  // the Romanesque grey-green banding, and the Gothic heightening in black and white
  bands(b, AW * 2, aisLen, 0.45, AISLE_H, 1.0, 0.24, STRIPE_R, 0, aisC);
  bands(b, NW * 2, navLen, AISLE_H, NAVE_H_ROM, 1.0, 0.24, STRIPE_R, 0, navC);
  bands(b, TW * 2, CZ0 - CZ1, 0.45, NAVE_H_ROM, 1.0, 0.24, STRIPE_R, 0, CZ);
  if (ph >= GOTHIC) {
    b.box(NW * 2 + 0.2, 0.3, navLen + 0.2, MARBLE, { at: [0, NAVE_H_ROM, navC], jitter: false });
    b.box(TW * 2 + 0.2, 0.3, CZ0 - CZ1 + 0.2, MARBLE, { at: [0, NAVE_H_ROM, CZ], jitter: false });
    bands(b, NW * 2, navLen, NAVE_H_ROM + 0.3, naveH, 0.6, 0.3, STRIPE_G, 0, navC);
    bands(b, TW * 2, CZ0 - CZ1, NAVE_H_ROM + 0.3, naveH, 0.6, 0.3, STRIPE_G, 0, CZ);
  }
  for (const [w, d, zc] of [[NW * 2, navLen, navC], [TW * 2, CZ0 - CZ1, CZ]] as const) {
    b.box(w + 0.3, 0.3, d + 0.3, MARBLE, { at: [0, naveH - 0.3, zc], jitter: false });
  }
  b.box(AW * 2 + 0.3, 0.3, aisLen + 0.3, MARBLE, { at: [0, AISLE_H - 0.3, aisC], jitter: false });

  // roofs: aisles lean against the nave; nave and transept gables cross (until the dome)
  b.sym((s) => {
    b.shed(4.6, aisLen + 0.3, 1.6, ROOF, { at: [s * 7.6, AISLE_H, aisC], high: s > 0 ? '-x' : '+x' });
  });
  if (ph < DOME) {
    b.gable(NW * 2, navLen, NAVE_RISE, ROOF, { ridge: 'z', at: [0, naveH, navC], overhang: 0.35, wall: MARBLE });
    b.gable(TW * 2, CZ0 - CZ1, NAVE_RISE, ROOF, { ridge: 'x', at: [0, naveH, CZ], overhang: 0.35, wall: MARBLE });
  } else {
    b.gable(NW * 2, aisLen, NAVE_RISE, ROOF, { ridge: 'z', at: [0, naveH, aisC], overhang: 0.35, wall: MARBLE });
    b.sym((s) => b.gable(TW - NW, CZ0 - CZ1, NAVE_RISE, ROOF, { ridge: 'x', at: [s * (TW + NW) / 2, naveH, CZ], overhang: 0.35, wall: MARBLE }));
    crossingDome(b, naveH);
  }

  // the aisle flanks: blind arcading with a round-headed window in every other arch
  const bayZ = [10, 6, 2, -2, -6];
  b.sym((s) => {
    const f: Facing = s > 0 ? '+x' : '-x';
    blindArcade(b, { len: aisLen, y0: 0.45, y1: AISLE_H - 0.3, n: 10, archTop: AISLE_H - 1.0, at: [s * AW, 0, aisC], facing: f, color: MARBLE });
    for (const z of bayZ) framed(b, 'round', 0.8, 2.4, [s * AW, 3.4, z], f, MARBLE, P.windowDark, 0.14);
    // clerestory
    for (const z of bayZ) {
      if (ph >= GOTHIC) {
        opening(b, 'round', 0.9, 2.0, [s * NW, 10.8, z], f, tint(MARBLE, -0.12), 0.04);
        gothicWindow(b, 1.4, 2.9, [s * NW, 14.95, z], f, MARBLE);
      } else {
        framed(b, 'round', 0.9, 2.0, [s * NW, 10.8, z], f, MARBLE, P.windowDark, 0.14);
      }
      b.box(0.5, naveH - 0.3 - (AISLE_H + 1.6), 0.08, MARBLE, { at: [s * NW, AISLE_H + 1.6, z - 2], rotY: Math.PI / 2, jitter: false });
    }
    // transept: windows on the west and east faces and in the gable end
    const tx = s * (TW + NW) / 2;
    for (const [zf, ff] of [[CZ0, '+z'], [CZ1, '-z']] as const) {
      framed(b, 'round', 1.0, 3.0, [tx, 4.2, zf], ff, MARBLE, P.windowDark, 0.16);
      if (ph >= GOTHIC) gothicWindow(b, 1.4, 2.9, [tx, 14.95, zf], ff, MARBLE);
    }
    framed(b, 'round', 1.2, 3.4, [s * TW, 3.8, CZ], f, MARBLE, P.windowDark, 0.16);
    onWall(b, [s * TW, ph >= GOTHIC ? 11.3 : 10.0, CZ], f, () => {
      const rr = ph >= GOTHIC ? 1.6 : 1.0;
      b.extrude(circlePts(0, rr, rr + 0.25, 14), 0.06, MARBLE, { at: [0, 0, 0.02], jitter: false });
      b.extrude(circlePts(0, rr, rr, 14), 0.06, P.windowDark, { at: [0, 0, 0.05], jitter: false });
    });
  });

  // the apse, kept from the Romanesque church to the end
  const ar = 5.0;
  const ah = 10.5;
  const half = { start: Math.PI / 2, sweep: Math.PI, segs: 9 };
  b.lathe([[ar + 0.3, 0], [ar + 0.3, 0.45], [ar, 0.45], [ar, ah]], MARBLE, { ...half, at: [0, 0, CZ1] });
  for (let y = 1.45; y < ah - 0.3; y += 1.0) b.lathe([[ar + 0.03, y], [ar + 0.03, y + 0.24]], STRIPE_R, { ...half, at: [0, 0, CZ1], jitter: false });
  b.lathe([[ar + 0.2, ah - 0.3], [ar + 0.2, ah]], MARBLE, { ...half, at: [0, 0, CZ1] });
  b.lathe([[ar + 0.5, ah - 0.1], [0, ah + 2.0]], ROOF, { ...half, at: [0, 0, CZ1] });
  const apAp = ar * Math.cos(Math.PI / 18);
  for (const k of [2, 4, 6]) {
    const phi = Math.PI / 2 + ((k + 0.5) * Math.PI) / 9;
    framed(b, 'round', 0.8, 2.6, [apAp * Math.sin(phi), 3.6, CZ1 + apAp * Math.cos(phi)], phi, MARBLE, P.windowDark, 0.14);
  }

  b.collider(AW * 2, aisLen, { at: [0, 0, aisC] });
  b.collider(TW * 2, CZ0 - CZ1, { at: [0, 0, CZ] });
  b.collider(ar * 2, ar, { at: [0, 0, CZ1 - ar / 2] });
}

// ------------------------------------------------------------------ the dome

/**
 * Brunelleschi's kind of dome over the crossing: a square base rising above the roofs, an eight-sided
 * drum pierced by round windows (oculi), then a pointed dome of eight tiled faces divided by white
 * marble ribs, closed by a marble lantern.
 */
export function crossingDome(b: Builder, naveH: number) {
  const baseTop = naveH + NAVE_RISE + 1.0;
  const R = 5.74; // drum corner radius: its flat sides touch the crossing square
  const ap = R * Math.cos(Math.PI / 8);
  const o8 = { segs: 8, rotY: Math.PI / 8 };
  b.group({ at: [0, 0, CZ] }, () => {
    b.box(NW * 2, baseTop - naveH, NW * 2, MARBLE, { at: [0, naveH, 0] });
    b.box(NW * 2 + 0.3, 0.35, NW * 2 + 0.3, MARBLE, { at: [0, baseTop - 0.35, 0], jitter: false });
    const dh = 5.4;
    b.cyl(R, dh, MARBLE, { ...o8, at: [0, baseTop, 0] });
    b.cyl(R + 0.08, 0.35, P.marbleGreen, { ...o8, at: [0, baseTop + 0.7, 0], jitter: false });
    b.cyl(R + 0.25, 0.45, MARBLE, { ...o8, at: [0, baseTop + dh - 0.45, 0] });
    for (let k = 0; k < 8; k++) {
      const t = Math.PI / 8 + (k * Math.PI) / 4;
      b.box(0.4, dh - 0.45, 0.4, P.marbleGreen, { at: [R * Math.sin(t) * 0.96, baseTop, R * Math.cos(t) * 0.96], rotY: t, jitter: false });
      const [fx, fz, phi] = octFace(k, ap);
      onWall(b, [fx, baseTop + 1.4, fz], phi, () => {
        b.extrude(circlePts(0, 1.4, 1.3, 12), 0.06, P.marbleGreen, { at: [0, 0, 0.02], jitter: false });
        b.extrude(circlePts(0, 1.4, 1.05, 12), 0.06, MARBLE, { at: [0, 0, 0.05], jitter: false });
        b.extrude(circlePts(0, 1.4, 0.8, 12), 0.06, P.windowDark, { at: [0, 0, 0.08], jitter: false });
      });
    }
    // pointed profile of the "pointed fifth": arcs struck from 4/5 of the span
    const y0 = baseTop + dh;
    const Rd = R - 0.1;
    const rho = 1.6 * Rd;
    const cx = Rd - rho;
    const rTop = 1.25;
    const tMax = Math.acos((rTop - cx) / rho);
    const prof: Pt[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = (tMax * i) / 6;
      prof.push([cx + rho * Math.cos(t), rho * Math.sin(t)]);
    }
    b.lathe(prof, tint(P.cotto, 0.05), { at: [0, y0, 0], segs: 8, start: Math.PI / 8 });
    const topY = y0 + prof[prof.length - 1][1];
    // white ribs on the eight corners
    for (let k = 0; k < 8; k++) {
      const t = Math.PI / 8 + (k * Math.PI) / 4;
      for (let i = 0; i < prof.length - 1; i++) {
        const [r0, h0] = prof[i];
        const [r1, h1] = prof[i + 1];
        const e = 0.1;
        b.beam([(r0 + e) * Math.sin(t), y0 + h0, (r0 + e) * Math.cos(t)], [(r1 + e) * Math.sin(t), y0 + h1, (r1 + e) * Math.cos(t)], 0.42, 0.3, MARBLE, { jitter: false });
      }
    }
    // the lantern
    b.cyl(rTop + 0.2, 0.4, MARBLE, { ...o8, at: [0, topY - 0.1, 0] });
    b.cyl(1.0, 2.6, MARBLE, { ...o8, at: [0, topY + 0.3, 0] });
    for (let k = 0; k < 8; k++) {
      const t = Math.PI / 8 + (k * Math.PI) / 4;
      b.box(0.22, 2.4, 0.7, MARBLE, { at: [1.15 * Math.sin(t), topY + 0.3, 1.15 * Math.cos(t)], rotY: t, jitter: false });
      if (k % 2 === 0) {
        const [fx, fz, phi] = octFace(k, 0.93);
        opening(b, 'round', 0.45, 1.6, [fx, topY + 0.7, fz], phi, P.windowDark, 0.05);
      }
    }
    b.cyl(1.3, 0.3, MARBLE, { ...o8, at: [0, topY + 2.9, 0] });
    b.cone(1.05, 2.4, MARBLE, { ...o8, at: [0, topY + 3.2, 0] });
    b.sphere(0.35, P.gold, { at: [0, topY + 5.9, 0], segs: 8 });
    b.box(0.1, 1.2, 0.1, P.gold, { at: [0, topY + 6.2, 0] });
    b.box(0.6, 0.1, 0.1, P.gold, { at: [0, topY + 6.95, 0] });
  });
}

// ------------------------------------------------------------------ the square in front

/** The church square (sagrato and piazza), the raised platform before the front and its steps. */
export function piazza(b: Builder, ph: Phase) {
  b.box(32, 0.04, 18, P.paving, { at: [0, 0, 21], jitter: false });
  if (ph === REVIVAL) {
    b.sym((s) => b.box(6.4, 0.04, 20, P.paving, { at: [s * 12.8, 0, 2], jitter: false }));
  }
  b.box(AW * 2 + 1.6, 0.6, 2.6, P.travertine, { at: [0, 0, FF + 1.3] });
  if (ph >= BAROQUE) {
    // the Baroque curved flight: convex semicircular steps spilling into the square
    const zc = FF + 2.6;
    for (let i = 0; i < 4; i++) {
      const r = 6.2 - i * 0.7;
      b.lathe([[0, 0], [r, 0], [r, 0.15 * (i + 1)], [0, 0.15 * (i + 1)]], tint(P.travertine, i % 2 ? 0.02 : -0.02), {
        at: [0, 0, zc],
        start: -Math.PI / 2,
        sweep: Math.PI,
        segs: 12,
        jitter: false,
      });
    }
  } else {
    b.stairs(12, 0.6, 1.6, 4, P.travertine, { at: [0, 0, FF + 2.6 + 0.8] });
  }
}

/** Everything that grows from stage to stage, for phases from the Romanesque cathedral on. */
export function cathedral(b: Builder, ph: Phase) {
  medievalBody(b, ph);
  baptistery(b, ph);
  campanile(b, ph);
  if (ph < REVIVAL) houses(b, ph);
  piazza(b, ph);
  b.collider(7, 7, { at: [BAPT.x, 0, BAPT.z] });
}
