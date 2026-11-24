import { P, mix, tint, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';
import { addTris, quad, ribbon, strip } from './shared';

// The roof: a hexagon in plan (corners at +-X), its height a smooth hat that peaks at the spire and
// whose brim rises in three arches (front, back left, back right) and dips in between.
const HR = 18.6; // centre to corner
const AP = HR * Math.cos(Math.PI / 6); // centre to the middle of a side
const PEAK = 18.0;
const EDGE_MID = 6.6;
const EDGE_AMP = 4.4;
const SPIRE_TOP = 33.0;

/** Distance from the centre to the hexagon edge in direction a (0 = +Z, turning toward +X). */
function rimDist(a: number): number {
  const sector = Math.PI / 3;
  // mid-sides at 0, 60, 120 degrees..., corners half way between
  let d = (((a + sector / 2) % sector) + sector) % sector;
  d -= sector / 2;
  return AP / Math.cos(d);
}

/** Height of the brim in direction a: arches at 0, 120 and 240 degrees, dips at 60, 180 and 300. */
function edgeH(a: number): number {
  return EDGE_MID + EDGE_AMP * Math.cos(3 * a);
}

/** Height of the roof surface at s (0 = centre, 1 = rim) in direction a. */
function roofH(s: number, a: number): number {
  const e = edgeH(a);
  const t = Math.max(0, 1 - Math.pow(Math.min(1, s), 1.5));
  return e + (PEAK - e) * Math.pow(t, 1.25);
}

function roofAt(x: number, z: number): number {
  const a = Math.atan2(x, z);
  return roofH(Math.hypot(x, z) / rimDist(a), a);
}

/** Corner k of the hexagon (k = 0 at +X... going round). */
function corner(k: number, scale = 1): [number, number] {
  const a = Math.PI / 2 + (k * Math.PI) / 3;
  return [HR * scale * Math.sin(a), HR * scale * Math.cos(a)];
}

/** Is (x, z) inside the hexagon shrunk by `m` metres? */
function inside(x: number, z: number, m = 0): boolean {
  const a = Math.atan2(x, z);
  return Math.hypot(x, z) <= rimDist(a) - m;
}

/** The three galleries: direction of the end that projects, height of the floor, length beyond the centre. */
const GALLERIES = [
  { dir: (2 * Math.PI) / 3, y: 5.2, out: 18.0, back: 7.0 },
  { dir: (4 * Math.PI) / 3, y: 9.6, out: 18.0, back: 5.0 },
  { dir: 0, y: 14.0, out: 17.2, back: -3.2 },
];
const GW = 6.0;
const GH = 4.2;

/** A long box of cross-section w x h from p0 to p1 (both at floor level), with an end window at p1. */
function gallery(b: Builder, g: (typeof GALLERIES)[number], clad: number, glassC: number): void {
  const sx = Math.sin(g.dir);
  const sz = Math.cos(g.dir);
  const len = g.out + g.back;
  const mid = (g.out - g.back) / 2;
  b.group({ at: [sx * mid, g.y, sz * mid], rotY: g.dir }, () => {
    b.box(GW, GH, len, clad);
    // seams of the cladding panels
    for (let z = -len / 2 + 2.5; z < len / 2 - 0.5; z += 2.5) {
      for (const s of [1, -1]) b.box(0.05, GH - 0.1, 0.08, tint(clad, -0.08), { at: [s * (GW / 2 + 0.01), 0.05, z] });
    }
    // the great picture window at the end, framing a view of the town
    b.box(GW - 0.6, GH - 0.6, 0.12, glassC, { at: [0, 0.3, len / 2 + 0.02], mat: 'glass' });
    b.box(GW, 0.3, 0.3, tint(clad, -0.05), { at: [0, GH - 0.3, len / 2 - 0.1] });
    b.box(GW, 0.3, 0.3, tint(clad, -0.05), { at: [0, 0, len / 2 - 0.1] });
  });
}

export const artCentre: BuildingDef = {
  id: 'art-centre',
  name: 'Art centre',
  style: 'Contemporary',
  date: '2010',
  summary:
    'The Paris arts centre of 1977 opens a branch in the provinces, the first of the great national museums to do so, and the city and the region pay for a showpiece. ' +
    'Over the galleries floats one vast roof like a woven hat: a lattice of laminated timber strips crossing in hexagons, covered with a white membrane of glass fibre coated with Teflon that glows by night. ' +
    'Under it three long gallery boxes are stacked and turned at different angles, and each pushes out through the roof to end in a picture window aimed at a view of the town. ' +
    'Where the Maison de la Culture was heavy concrete with its life behind glass, this is light, curved and made by computer-driven machines.',
  materials: ['laminated spruce lattice', 'PTFE-coated glass-fibre membrane', 'steel', 'glass', 'concrete'],
  modelledOn:
    'The Centre Pompidou-Metz by Shigeru Ban and Jean de Gastines (opened May 2010), reduced from a roof about 90 m across to under 40: the hexagonal roof and its spire, the woven timber lattice and the three stacked galleries are taken from it. ' +
    'At Metz the spire is 77 m high, for the year the Paris Centre Pompidou opened.',
  influences: ['high-tech'],
  lookFor: [
    {
      label: 'Woven timber roof',
      note: 'Strips of laminated timber cross in three directions to make a pattern of hexagons and triangles, like the weave of a Chinese bamboo hat that inspired the architect. The white membrane over it lets the lattice show through.',
      at: [-6.0, roofAt(-6.0, 6.0) + 0.4, 6.0],
    },
    {
      label: 'Gallery tubes',
      note: 'Three long galleries, each a simple box, are stacked one above another and turned to point in different directions.',
      at: [Math.sin(GALLERIES[0].dir) * 15.5, GALLERIES[0].y + GH + 0.3, Math.cos(GALLERIES[0].dir) * 15.5],
    },
    {
      label: 'Picture windows',
      note: 'Each gallery ends in a wall of glass outside the roof, framing a landmark: at Metz one looks straight at the cathedral.',
      at: [0, GALLERIES[2].y + GH / 2, GALLERIES[2].out + 0.3],
    },
    {
      label: 'Spire',
      note: 'A mast rises from the crown of the roof, which it helps to carry, with the columns, like the pole of a tent.',
      at: [0, 26, 0.6],
    },
    {
      label: 'Tulip columns',
      note: 'Where the brim dips toward the ground, the lattice gathers on to a few timber supports flared like tulips.',
      at: [0, 2.0, -AP * 0.86 + 1.4],
    },
  ],
  build(b) {
    const membrane = tint(P.cladWhite, b.range(-0.01, 0.02));
    const lattice = mix(P.larch, P.white, 0.42);
    const clad = mix(P.cladWhite, P.cladGrey, 0.22);
    const steel = tint(P.steel, 0.12);
    const glassC = mix(P.glass, P.glassDark, 0.3);

    // ------------------------------------------------ the roof membrane: rings round the centre
    const ringsN = 14;
    const perSide = 8;
    const dirs: [number, number][] = [];
    for (let k = 0; k < 6; k++) {
      const c0 = corner(k);
      const c1 = corner(k + 1);
      for (let i = 0; i < perSide; i++) {
        const u = i / perSide;
        dirs.push([c0[0] + (c1[0] - c0[0]) * u, c0[1] + (c1[1] - c0[1]) * u]);
      }
    }
    const pt = (s: number, j: number): Vec3 => {
      const [bx, bz] = dirs[j % dirs.length];
      const a = Math.atan2(bx, bz);
      return [bx * s, roofH(s, a), bz * s];
    };
    const ringS = (i: number) => Math.pow(i / ringsN, 0.85);
    const t: number[] = [];
    for (let i = 0; i < ringsN; i++) {
      for (let j = 0; j < dirs.length; j++) {
        const a0 = pt(ringS(i), j);
        const a1 = pt(ringS(i), j + 1);
        const b1 = pt(ringS(i + 1), j + 1);
        const b0 = pt(ringS(i + 1), j);
        if (i === 0) t.push(...a0, ...b1, ...b0);
        else quad(t, a0, a1, b1, b0);
      }
    }
    addTris(b, t, membrane, { jitter: false });
    // the timber edge beam round the brim
    const rim: [number, number, number, number][] = [];
    for (let j = 0; j <= dirs.length; j++) {
      const p = pt(1, j);
      rim.push([p[0], p[2], p[1] - 0.5, p[1] + 0.08]);
    }
    strip(b, rim, tint(P.larch, -0.05));

    // ------------------------------------------------ the woven lattice: three families of strips
    const lt: number[] = [];
    const pitch = 2.9;
    for (const fam of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
      const ux = Math.sin(fam);
      const uz = Math.cos(fam);
      const nx = uz;
      const nz = -ux;
      for (let o = -HR + pitch / 2; o < HR; o += pitch) {
        let run: Vec3[] = [];
        const flush = () => {
          if (run.length > 1) ribbon(lt, run, 0.2, 0.1);
          run = [];
        };
        for (let s = -HR; s <= HR + 0.01; s += 1.2) {
          const x = nx * o + ux * s;
          const z = nz * o + uz * s;
          if (!inside(x, z, 0.25)) {
            flush();
            continue;
          }
          run.push([x, roofAt(x, z) + 0.12, z]);
        }
        flush();
      }
    }
    addTris(b, lt, lattice, { jitter: false });

    // ------------------------------------------------ the spire, and the steel core under it
    b.lathe([[1.6, PEAK - 1.0], [1.2, PEAK + 3.0], [0.45, SPIRE_TOP - 2.0], [0.12, SPIRE_TOP]], steel, { segs: 6, jitter: false });
    for (const y of [PEAK + 3.0, PEAK + 7.0, PEAK + 11.0]) {
      const r = 1.2 - ((y - PEAK - 3.0) / (SPIRE_TOP - PEAK - 5.0)) * 0.75 + 0.12;
      b.lathe([[r, y], [r, y + 0.25]], P.white, { segs: 6, jitter: false });
    }
    b.cyl(2.6, PEAK - 1.0, tint(P.concrete, 0.04), { segs: 6 });
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + Math.PI / 6;
      b.panel(1.4, 2.4, P.windowDark, { at: [2.25 * Math.sin(a), 0, 2.25 * Math.cos(a)], facing: a, depth: 0.04 });
    }

    // ------------------------------------------------ the three galleries, stacked and turned
    for (const g of GALLERIES) gallery(b, g, clad, glassC);
    // their supports: slim steel columns under the lower ends
    for (const g of GALLERIES) {
      for (const d of [11.0, 15.0]) {
        if (g.y < 6 || g.y > 12) continue;
        const sx = Math.sin(g.dir);
        const sz = Math.cos(g.dir);
        b.sym((s) => b.cyl(0.18, g.y, steel, { at: [sx * d + s * sz * (GW / 2 - 0.4), 0, sz * d - s * sx * (GW / 2 - 0.4)], segs: 6 }));
      }
    }
    // the lowest gallery stands on a glazed ground floor
    {
      const g = GALLERIES[0];
      b.group({ at: [Math.sin(g.dir) * 5, 0, Math.cos(g.dir) * 5], rotY: g.dir }, () => {
        b.box(GW + 0.4, g.y, 24, mix(glassC, P.white, 0.15), { mat: 'glass' });
      });
    }

    // ------------------------------------------------ the glass walls of the great hall under the brim
    const wall: [number, number, number, number][] = [];
    const wallS = 0.72;
    for (let j = 0; j <= dirs.length; j++) {
      if (j % perSide === 4 && Math.abs(Math.atan2(dirs[j % dirs.length][0], dirs[j % dirs.length][1])) < 0.1) {
        // leave the front entrance open
        wall.push([NaN, NaN, NaN, NaN]);
        continue;
      }
      const p = pt(wallS, j);
      wall.push([p[0], p[2], 0, Math.min(p[1] - 0.25, 9.0)]);
    }
    let seg: [number, number, number, number][] = [];
    for (const w of [...wall, [NaN, NaN, NaN, NaN] as [number, number, number, number]]) {
      if (Number.isNaN(w[0])) {
        if (seg.length > 1) strip(b, seg, mix(glassC, P.white, 0.1), { mat: 'glass' });
        seg = [];
      } else seg.push(w);
    }
    // mullions on the glass walls
    for (let j = 0; j < dirs.length; j++) {
      if (j % 2) continue;
      const p = pt(wallS, j);
      if (Number.isNaN(wall[j][0])) continue;
      b.box(0.12, Math.min(p[1] - 0.25, 9.0), 0.12, steel, { at: [p[0], 0, p[2]] });
    }
    // floor of the forecourt and hall
    b.cyl(AP * 0.98, 0.06, tint(P.paving, 0.04), { segs: 6, at: [0, 0, 0], rotY: Math.PI / 6 });

    // ------------------------------------------------ the tulip columns under the three dips
    const tulips: [number, number][] = [];
    for (const a of [Math.PI / 3, Math.PI, (5 * Math.PI) / 3]) {
      const s = 0.86;
      const r = rimDist(a) * s;
      const x = r * Math.sin(a);
      const z = r * Math.cos(a);
      const top = roofH(s, a);
      tulips.push([x, z]);
      b.lathe(
        [[0.35, 0], [0.4, top * 0.45], [0.8, top * 0.8], [1.5, top - 0.25], [0.01, top - 0.25]],
        tint(P.larch, -0.02),
        { at: [x, 0, z], segs: 8, jitter: false },
      );
    }

    // ------------------------------------------------ walk collisions: core, glass hall, columns
    b.collider(4.6, 4.6, { at: [0, 0, 0] });
    b.collider(4.6, 4.6, { at: [0, 0, 0], rotY: Math.PI / 4 });
    for (let j = 0; j < dirs.length; j++) {
      const w0 = wall[j];
      const w1 = wall[j + 1];
      if (!w0 || !w1 || Number.isNaN(w0[0]) || Number.isNaN(w1[0])) continue;
      const len = Math.hypot(w1[0] - w0[0], w1[1] - w0[1]);
      b.collider(0.3, len, { at: [(w0[0] + w1[0]) / 2, 0, (w0[1] + w1[1]) / 2], rotY: Math.atan2(w1[0] - w0[0], w1[1] - w0[1]) });
    }
    for (const [x, z] of tulips) b.collider(0.9, 0.9, { at: [x, 0, z] });
  },
};
