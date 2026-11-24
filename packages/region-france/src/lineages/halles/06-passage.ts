import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { archPanel, planSolid, slab, windowRow } from './shared';

const STONE = P.pierreBlonde;
const RENDER = mix3();
const HALF = 1.657; // half width of the passage (one side of the octagonal rotunda)
const A = 4.0; // apothem of the rotunda
const XE = 9.0; // outer side walls
const ZE = 10.5; // street fronts
const HT = 10.8; // cornice of the outer fronts
const HI = 9.8; // cornice inside, where the glass roof springs
const ZB = 8.4; // inner face of the entrance blocks that bridge the passage

function mix3(): number {
  return tint(P.stucco, -0.03);
}

/**
 * One inner front of the passage: shopfronts in wood and glass with a half-moon window lighting the
 * mezzanine above each, pilasters, two floors of windows and a cornice. Local frame: face at z = 0,
 * running along x for `len`, facing +z.
 */
function innerFront(b: Builder, len: number, at: [number, number, number], rotY: number, paint: number[]): void {
  b.group({ at, rotY }, () => {
    const n = Math.max(1, Math.round(len / 3.1));
    const p = len / n;
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (i + 0.5) * p;
      const c = paint[i % paint.length];
      const w = p - 0.7;
      // the shopfront: a painted timber frame, plate glass, a glazed door, a fascia with gilt letters
      b.panel(w, 3.3, c, { at: [x, 0, 0], depth: 0.1 });
      b.panel(w - 0.3, 2.5, P.glassDark, { at: [x, 0.45, 0], depth: 0.13, mat: 'glass' });
      b.panel(0.8, 2.4, tint(c, -0.1), { at: [x + w / 2 - 0.6, 0, 0], depth: 0.15 });
      b.panel(w, 0.45, P.timberBlack, { at: [x, 2.85, 0], depth: 0.16 });
      b.panel(Math.min(1.5, w - 0.4), 0.16, P.gold, { at: [x, 2.99, 0], depth: 0.18 });
      // the mezzanine: a half-moon window in a moulded arch
      archPanel(b, w, 1.5, STONE, [x, 3.35, 0], '+z', 'round', 0.06);
      archPanel(b, w - 0.35, 1.3, P.glassDark, [x, 3.45, 0], '+z', 'round', 0.09, 'glass');
      b.panel(0.05, 1.25, c, { at: [x, 3.45, 0], depth: 0.11 });
      // two floors of tall windows above
      for (const y of [5.4, 7.6]) b.window(1.1, 1.7, { at: [x, y, 0], frame: STONE, bars: [2, 2] });
    }
    for (let i = 0; i <= n; i++) b.panel(0.35, HI - 0.2, tint(STONE, 0.03), { at: [-len / 2 + i * p, 0, 0], depth: 0.12 });
    b.box(len, 0.25, 0.2, STONE, { at: [0, 4.95, 0.08] });
    b.box(len + 0.05, 0.4, 0.35, STONE, { at: [0, HI - 0.4, 0.12] });
  });
}

/** A glazed ridge roof over the passage from z0 to z1 on its iron trusses. Panes are left off when `open`. */
function glassRoof(b: Builder, z0: number, z1: number, open: boolean): void {
  const yr = HI + 1.5;
  if (!open) {
    for (const s of [-1, 1]) {
      slab(b, [[s * (HALF + 0.15), HI, z0], [s * (HALF + 0.15), HI, z1], [0, yr, z1], [0, yr, z0]], 0.05, P.glass, 'glass');
    }
  }
  b.box(0.12, 0.14, Math.abs(z1 - z0), P.castIron, { at: [0, yr - 0.05, (z0 + z1) / 2] });
  for (const s of [-1, 1]) b.box(0.14, 0.14, Math.abs(z1 - z0), P.castIron, { at: [s * (HALF + 0.1), HI - 0.07, (z0 + z1) / 2] });
  const n = Math.max(2, Math.round(Math.abs(z1 - z0) / 1.1));
  for (let i = 0; i <= n; i++) {
    const z = z0 + ((z1 - z0) * i) / n;
    for (const s of [-1, 1]) b.beam([s * (HALF + 0.15), HI + 0.02, z], [0, yr + 0.02, z], 0.07, 0.1, P.castIron);
    // a light arched truss under each pair of rafters
    b.beam([-HALF, HI - 0.05, z], [-0.6, HI + 0.5, z], 0.05, 0.05, P.castIron);
    b.beam([HALF, HI - 0.05, z], [0.6, HI + 0.5, z], 0.05, 0.05, P.castIron);
    b.beam([-0.6, HI + 0.5, z], [0.6, HI + 0.5, z], 0.05, 0.05, P.castIron);
  }
}

export const passage: BuildingDef = {
  id: 'passage',
  name: 'Covered shopping arcade (passage)',
  style: 'Restoration and July Monarchy',
  date: 'c. 1838',
  summary:
    'A private developer buys a block and drives a covered street of shops through it from one street to the other, roofed in glass on light iron bars. ' +
    'Out of the mud, rain and traffic, the well-off can stroll past lit shop windows of milliners, booksellers and pastry cooks, with a glazed rotunda halfway along. ' +
    'Paris built some 150 of these passages between the 1790s and the 1860s; the Galerie Vivienne of 1823 to 1826 is the finest left, and big provincial cities followed, Nantes with the Passage Pommeraye in 1840 to 1843. ' +
    'The market has moved indoors and upmarket: what is sold here is fashion, not food. The type was copied across Europe, as the arcade, the galleria and the Passage.',
  materials: ['cut stone and rendered brick', 'cast and wrought iron', 'sheet glass', 'painted timber shopfronts', 'mosaic floor'],
  lookFor: [
    { label: 'Glass roof', note: 'A ridged roof of glass on slender iron bars lets daylight into the middle of the block. It is left unglazed here so the inside can be seen.', at: [0, 11.4, -6.4] },
    { label: 'Rotunda', note: 'Halfway along the passage widens into an eight-sided hall under a glazed dome, a place to meet and be seen.', at: [0, 12.6, 0] },
    { label: 'Shopfronts with mezzanine', note: 'Each shop has a timber front of plate glass, a gilt name board, and a half-moon window lighting the low mezzanine where stock was kept and the shopkeeper often lived.', at: [-1.6, 3.0, 6.2] },
    { label: 'Mosaic floor', note: 'The passage was paved in a smooth floor of marble mosaic, unknown in the streets outside.', at: [0, 0.3, -2.6] },
    { label: 'Entrance from the street', note: 'A tall arch in an ordinary-looking street front, with the passage’s name over it, invites passers-by in.', at: [0, 6.6, 10.8] },
  ],
  modelledOn: 'The Galerie Vivienne, Paris (François-Jacques Delannoy, 1823 to 1826), for the rotunda, shopfronts and mosaic floor, and the Passage Pommeraye, Nantes (1840 to 1843), as a provincial example; much reduced',
  influences: ['iron-and-rail'],
  build(b) {
    const open = b.cutaway;
    const roofSlate = P.ardoise;
    const paint = b.pick([
      [P.doorGreen, P.timberBlack, P.doorRed],
      [P.timberBlack, P.doorBlue, P.doorGreen],
    ]);

    // pavement round the block and the floor of the passage
    b.box(25.6, 0.08, 21.6, P.paving, { jitter: false });
    b.box(2 * HALF, 0.02, 2 * ZE, P.marble, { at: [0, 0.08, 0], jitter: false });
    for (const s of [-1, 1]) b.box(0.25, 0.012, 2 * ZE, P.marbleRed, { at: [s * (HALF - 0.35), 0.1, 0], jitter: false });
    for (let z = -ZE + 1.2; z < ZE; z += 1.6) b.box(2 * HALF - 0.9, 0.012, 0.18, P.marbleYellow, { at: [0, 0.1, z], jitter: false });
    b.cyl(A + 0.3, 0.02, P.marble, { at: [0, 0.08, 0], segs: 8, rotY: Math.PI / 8, jitter: false });
    b.cyl(2.2, 0.025, P.marbleRed, { at: [0, 0.09, 0], segs: 8, rotY: Math.PI / 8, jitter: false });
    b.cyl(1.4, 0.03, P.marbleYellow, { at: [0, 0.1, 0], segs: 8, jitter: false });
    b.cyl(0.6, 0.035, P.marbleGreen, { at: [0, 0.11, 0], segs: 8, rotY: Math.PI / 8, jitter: false });

    // ---- the two blocks either side of the passage, cut back round the rotunda
    const half: [number, number][] = [
      [HALF, ZE - 0.2],
      [XE, ZE - 0.2],
      [XE, -ZE + 0.2],
      [HALF, -ZE + 0.2],
      [HALF, -A],
      [A, -HALF],
      [A, HALF],
      [HALF, A],
    ];
    for (const s of [-1, 1]) {
      planSolid(b, half.map(([x, z]) => [s * x, z] as [number, number]), HT, RENDER, 0.08);
      b.collider(XE - HALF, 2 * ZE, { at: [s * (XE + HALF) / 2, 0, 0] });
    }
    // the blocks bridging the passage at each end, over the entrance arches
    for (const s of [-1, 1]) b.box(2 * HALF + 0.1, HT - 6.2, ZE - ZB, RENDER, { at: [0, 6.2, s * (ZB + ZE) / 2] });

    // ---- inner fronts along the passage and round the rotunda
    const segLen = ZB - A;
    const segMid = (ZB + A) / 2;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) innerFront(b, segLen, [sx * HALF, 0.08, sz * segMid], sx > 0 ? -Math.PI / 2 : Math.PI / 2, paint);
    }
    const side = 2 * A * Math.tan(Math.PI / 8);
    for (const phi of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4, Math.PI / 2, (3 * Math.PI) / 2]) {
      innerFront(b, side, [Math.sin(phi) * A, 0.08, Math.cos(phi) * A], phi + Math.PI, paint);
    }
    // the inner faces of the bridging blocks: an arch framing the way out, a clock over it
    for (const s of [-1, 1]) {
      const z = s * ZB;
      b.box(2 * HALF, HI - 6.2, 0.3, STONE, { at: [0, 6.2, z] });
      b.panel(0.9, 0.9, P.white, { at: [0, 7.4, z], facing: s > 0 ? '-z' : '+z', shape: 'circle', depth: 0.08 });
      b.panel(0.06, 0.38, P.black, { at: [0, 7.85, z - s * 0.06], facing: s > 0 ? '-z' : '+z', depth: 0.1 });
    }

    // ---- glass roofs on iron, and the glazed dome over the rotunda
    glassRoof(b, A - 0.2, ZB, open);
    glassRoof(b, -ZB, -A + 0.2, open);
    const k = 1 / Math.cos(Math.PI / 8);
    b.lathe([[A * k + 0.2, 0], [A * k + 0.2, 0.5], [A * k - 0.3, 0.5], [A * k - 0.3, 0]], STONE, { at: [0, HI, 0], segs: 8, rotY: Math.PI / 8 });
    const prof: [number, number][] = [
      [A * k - 0.1, 0],
      [A * k - 0.4, 1.1],
      [A * k - 1.3, 2.1],
      [1.6, 2.8],
      [0.6, 3.05],
    ];
    const yD = HI + 0.5;
    if (!open) b.lathe(prof, P.glass, { at: [0, yD, 0], segs: 8, mat: 'glass', rotY: Math.PI / 8 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      for (let j = 0; j < prof.length - 1; j++) {
        const [r0, h0] = prof[j];
        const [r1, h1] = prof[j + 1];
        b.beam([Math.sin(a) * r0, yD + h0, Math.cos(a) * r0], [Math.sin(a) * r1, yD + h1, Math.cos(a) * r1], 0.09, 0.09, P.castIron);
      }
    }
    b.lathe([[0.62, 0], [0.62, 0.35], [0.35, 0.75], [0.05, 0.9]], P.zincParis, { at: [0, yD + 3.0, 0], segs: 8 });
    // a gas lamp hanging in the rotunda
    b.box(0.03, 4.0, 0.03, P.castIron, { at: [0, HI - 2.2, 0] });
    b.cyl(0.2, 0.5, P.windowLit, { at: [0, HI - 2.7, 0], rTop: 0.3, segs: 6 });
    b.cone(0.36, 0.25, P.castIron, { at: [0, HI - 2.2, 0], segs: 6 });

    // ---- roofs of the blocks: slate on the outer part, a zinc flat along the passage, dormers, chimneys
    for (const s of [-1, 1]) {
      for (const sz of [-1, 1]) b.box(A - HALF + 0.3, 0.2, ZE - A - 0.2, P.zincParis, { at: [s * (HALF + A) / 2, HT + 0.08, sz * (ZE + A) / 2] });
      b.hip(XE - A + 0.2, 2 * ZE - 0.2, 2.6, roofSlate, { at: [s * (A + XE) / 2, HT + 0.08, 0], overhang: 0.3 });
      for (const z of [-7, -2.4, 2.4, 7]) {
        b.group({ at: [s * (XE - 0.9), HT + 0.08, z], rotY: s > 0 ? Math.PI / 2 : -Math.PI / 2 }, () => {
          b.box(1.0, 1.4, 1.2, RENDER, { at: [0, 0, -0.4] });
          b.window(0.6, 0.85, { at: [0, 0.25, 0.2], frame: P.white, bars: [2, 2] });
          b.gable(1.2, 1.3, 0.55, roofSlate, { at: [0, 1.4, -0.4], ridge: 'z', overhang: 0.08, wall: RENDER });
        });
      }
      for (const z of [-5, 5]) b.chimney(0.8, 1.6, 0.5, P.briqueNord, { at: [s * (A + XE) / 2, HT + 1.9, z], pots: 2 });
      b.box(0.3, 0.5, 2 * ZE, STONE, { at: [s * (HALF + 0.05), HT - 0.1, 0] }); // parapet along the glass roof
    }
    // a slate roof over each entrance block, joining the two sides
    for (const s of [-1, 1]) b.box(2 * HALF + 0.2, 0.2, ZE - ZB, P.zincParis, { at: [0, HT + 0.08, s * (ZB + ZE) / 2] });

    // ---- the street fronts: an arch in the middle, shops either side, windows above
    for (const s of [-1, 1] as const) {
      const z = s * (ZE - 0.1);
      const facing = s > 0 ? '+z' : '-z';
      b.group({ at: [0, 0.08, z], rotY: s > 0 ? 0 : Math.PI }, () => {
        b.archWall(2 * XE, HT, 0.3, STONE, { openings: 1, openW: 2 * HALF - 0.2, openH: 6.0, shape: 'round' });
        // rusticated ground floor: horizontal joints
        for (let y = 1.2; y < 4.8; y += 1.2) for (const sx of [-1, 1]) b.box(XE - HALF - 0.4, 0.05, 0.05, tint(STONE, -0.1), { at: [sx * (XE + HALF + 0.2) / 2, y, 0.16], jitter: false });
        b.box(2 * XE + 0.2, 0.35, 0.35, STONE, { at: [0, 4.85, 0.12] });
        b.box(2 * XE + 0.4, 0.5, 0.55, STONE, { at: [0, HT - 0.5, 0.2] });
        // the name over the arch, and a lantern in it
        b.panel(3.6, 0.6, P.timberBlack, { at: [0, 6.5, 0.15], depth: 0.06 });
        for (let k = 0; k < 7; k++) b.panel(0.3, 0.3, P.gold, { at: [-1.35 + k * 0.45, 6.65, 0.15], depth: 0.09 });
        b.box(0.5, 0.5, 0.12, P.stucco, { at: [0, 5.95, 0.15] });
        // shops either side of the entrance
        for (const sx of [-1, 1]) {
          for (const x of [4.0, 7.1]) {
            b.panel(2.3, 3.6, paint[0], { at: [sx * x, 0, 0.15], depth: 0.1 });
            b.panel(1.9, 2.6, P.glassDark, { at: [sx * x, 0.5, 0.15], depth: 0.13, mat: 'glass' });
            b.panel(2.3, 0.45, P.timberBlack, { at: [sx * x, 3.15, 0.15], depth: 0.15 });
          }
        }
        // windows with balconies on the first floor, plainer on the second, shutters on both
        windowRow(b, [-7.1, -4.0, 4.0, 7.1], 5.4, 1.15, 2.0, '+z', 0.15, P.white, P.voletGris);
        windowRow(b, [-7.1, -4.0, 4.0, 7.1], 8.0, 1.1, 1.7, '+z', 0.15, P.white, P.voletGris);
        for (const x of [-7.1, -4.0, 4.0, 7.1]) {
          b.box(1.9, 0.1, 0.5, STONE, { at: [x, 5.25, 0.35] });
          for (const y of [5.75, 6.2]) b.box(1.9, 0.05, 0.05, P.castIron, { at: [x, y, 0.58] });
          for (const dx of [-0.9, -0.3, 0.3, 0.9]) b.box(0.04, 0.85, 0.04, P.castIron, { at: [x + dx, 5.35, 0.58] });
        }
        windowRow(b, [0], 8.0, 1.1, 1.7, '+z', 0.15, P.white);
      });
      void facing;
      for (const sx of [-1, 1]) b.collider(XE - HALF, 0.4, { at: [sx * (XE + HALF) / 2, 0, z] });
    }

    // ---- the plainer side fronts on the cross streets
    for (const s of [-1, 1] as const) {
      const facing = s > 0 ? '+x' : '-x';
      const x = s * XE;
      const zs = [-7.4, -2.6, 2.6, 7.4];
      for (const y of [5.4, 8.0]) windowRow(b, zs, y, 1.05, 1.7, facing, x, P.white, P.voletGris, true);
      for (const z of zs) {
        if (Math.abs(z) < 3) b.panel(1.2, 2.5, P.doorGreen, { at: [x, 0.08, z], facing, shape: 'segmental' });
        else b.window(1.0, 1.6, { at: [x, 1.2, z], facing, frame: STONE, bars: [2, 3] });
      }
      b.box(0.3, 0.35, 2 * ZE, STONE, { at: [x + s * 0.12, 4.85, 0] });
      b.box(0.5, 0.5, 2 * ZE + 0.4, STONE, { at: [x + s * 0.2, HT - 0.5, 0] });
      b.box(0.2, 0.6, 2 * ZE, tint(STONE, -0.06), { at: [x + s * 0.06, 0.08, 0] });
    }
  },
};
