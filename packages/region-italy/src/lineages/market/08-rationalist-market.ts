import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { goods } from './shared';

const SPAN = 20; // across X
const LEN = 18; // along Z
const HP = 11; // rise of the parabola
const half = SPAN / 2;
const par = (x: number, off = 0) => HP * (1 - (x / half) ** 2) + off;
/** x where the parabola reaches height y. */
const xAt = (y: number) => half * Math.sqrt(Math.max(0, 1 - y / HP));

/** A strip of the parabolic shell between x0 and x1 (x0 < x1), `t` thick, extruded along Z for `len`. */
function shellStrip(b: Builder, x0: number, x1: number, t: number, len: number, color: number, z = 0, mat?: 'glass'): void {
  const n = Math.max(2, Math.ceil((x1 - x0) / 1.0));
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    outer.push([x, par(x, t)]);
    inner.push([x, par(x)]);
  }
  b.extrude([...outer, ...inner.reverse()], len, color, { at: [0, 0, z], mat });
}

/** An exposed parabolic rib standing out from the shell. */
function rib(b: Builder, z: number, color: number): void {
  const n = 16;
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = -half - 0.25 + ((SPAN + 0.5) * i) / n;
    const xx = Math.max(-half, Math.min(half, x));
    outer.push([x, Math.max(0, par(xx, 0.7))]);
    inner.push([xx, Math.max(0, par(xx, 0.05))]);
  }
  b.extrude([...outer, ...inner.reverse()], 0.45, color, { at: [0, 0, z] });
}

/** A parabolic end wall of glass block with a grid of mortar joints. Local frame: wall face at z = 0, facing +z. */
function glassBlockEnd(b: Builder, z: number, facingSign: 1 | -1, block: number, frame: number, doorW: number, doorH: number): void {
  const d = doorW / 2;
  const pts: [number, number][] = [[-half, 0], [-d, 0], [-d, doorH], [d, doorH], [d, 0], [half, 0]];
  for (let i = 15; i >= 1; i--) {
    const x = -half + (SPAN * i) / 16;
    pts.push([x, par(x)]);
  }
  b.extrude(pts, 0.2, block, { at: [0, 0, z], mat: 'glass' });
  const zf = z + facingSign * 0.12;
  for (let y = 1.0; y < HP - 0.3; y += 0.9) {
    const w = 2 * xAt(y) - 0.1;
    if (y > doorH) b.box(w, 0.07, 0.06, frame, { at: [0, y, zf], jitter: false });
    else for (const s of [-1, 1]) b.box(w / 2 - d, 0.07, 0.06, frame, { at: [s * (d + w / 2) / 2, y, zf], jitter: false });
  }
  for (let x = -half + 1; x < half; x += 1.0) {
    const h = par(x) - 0.05;
    const y0 = Math.abs(x) < d ? doorH : 0;
    b.box(0.07, h - y0, 0.06, frame, { at: [x, y0, zf], jitter: false });
  }
}

export const rationalistMarket: BuildingDef = {
  id: 'rationalist-market',
  name: 'Covered market (mercato coperto)',
  style: 'Rationalist',
  date: 'c. 1936',
  summary:
    'In the 1930s the municipality moves the food trade off the street and into a hygienic covered market, part of a programme of public works the regime advertised as modern efficiency. ' +
    'The hall is a single span of reinforced concrete: parabolic arches, a shape that carries an evenly spread load in pure compression, with a thin shell between them. ' +
    'Light comes through walls of glass block and a strip of glazing along the crown, so the stalls inside need no windows. ' +
    'Nothing is borrowed from history except the travertine on the clock tower, the material the regime favoured for its public face.',
  materials: ['reinforced concrete', 'glass block', 'travertine cladding', 'steel'],
  lookFor: [
    { label: 'Parabolic arches', note: 'Concrete ribs shaped as parabolas carry the roof in one span, with no columns inside.', at: [6.4, 7.6, 7.6] },
    { label: 'Glass-block walls', note: 'Hollow pressed-glass bricks let in light but not heat or prying eyes; a favourite material of the Rationalists.', at: [-4.0, 5.0, 9.4] },
    { label: 'Cantilevered canopy', note: 'A thin concrete slab projects over the entrance with no visible support.', at: [0, 4.4, 10.2] },
    { label: 'Clock tower', note: 'A plain travertine-clad shaft with a clock: modern in form, but civic and monumental in intent.', at: [11.6, 12.6, 9.0] },
    { label: 'Crown skylight', note: 'A strip of glazing along the top of the vault lights the middle of the hall.', at: [0, 11.4, -2.0] },
  ],
  influences: ['rationalism'],
  build(b) {
    const conc = b.pick([P.concreteWhite, tint(P.concrete, 0.06)]);
    const block = mix(P.glassGreen, P.white, 0.45);
    const trav = P.travertine;

    // forecourt paving
    b.box(25.6, 0.08, 21.6, P.paving, { jitter: false });
    b.box(SPAN + 1.2, 0.2, LEN + 1.0, tint(trav, -0.05), { at: [0, 0.08, 0] });

    // the shell: concrete at the foot, a band of glass block, concrete above, glazing at the crown
    const t = 0.18;
    const yB = 1.4;
    const yT = 4.6;
    for (const s of [-1, 1]) {
      const a = (x: number) => (s > 0 ? x : -x);
      const seg = (x0: number, x1: number, c: number, mat?: 'glass') => {
        const [p, q] = [a(x0), a(x1)].sort((m, n) => m - n);
        shellStrip(b, p, q, t, LEN, c, 0, mat);
      };
      seg(xAt(yB), half, conc);
      seg(xAt(yT), xAt(yB), block, 'glass');
      seg(2.0, xAt(yT), conc);
    }
    shellStrip(b, -2.0, 2.0, t, LEN, P.glass, 0, 'glass');
    // ribs over the shell, every three metres
    for (let z = -LEN / 2 + 0.25; z <= LEN / 2; z += 2.9) rib(b, z, conc);
    // a raised edge to the skylight
    for (const s of [-1, 1]) b.box(0.15, 0.35, LEN, conc, { at: [s * 2.0, par(2.0, t) - 0.05, 0] });

    // the two glass-block ends
    glassBlockEnd(b, LEN / 2 - 0.1, 1, block, conc, 4.4, 3.9);
    glassBlockEnd(b, -LEN / 2 + 0.1, -1, block, conc, 3.2, 3.9);
    for (const s of [-1, 1] as const) {
      const ze = s * (LEN / 2 + 0.05);
      const facing = s > 0 ? '+z' : '-z';
      // a concrete frame round the entrance, glazed doors in steel
      const dw = s > 0 ? 4.4 : 3.2;
      for (const sx of [-1, 1]) b.box(0.4, 3.9, 0.45, conc, { at: [sx * (dw / 2 + 0.2), 0.28, ze] });
      // steel-framed glazed doors folded back to the jambs, a fanlight over them
      for (const sx of [-1, 1]) b.box(0.9, 2.9, 0.06, P.glassDark, { at: [sx * (dw / 2 - 0.1), 0.28, ze + s * 0.5], rotY: sx * s * 1.3, mat: 'glass' });
      b.box(dw, 0.9, 0.08, P.glassDark, { at: [0, 3.1, ze], mat: 'glass' });
      for (const x of [-dw / 4, 0, dw / 4]) b.box(0.06, 0.9, 0.12, P.steel, { at: [x, 3.1, ze] });
      // the cantilevered canopy
      b.box(dw + 2.6, 0.22, 1.8, conc, { at: [0, 4.0, ze + s * 0.9] });
      // name over the door: travertine panel with letters
      if (s > 0) {
        b.box(8.0, 1.1, 0.12, trav, { at: [0, 4.6, ze + 0.12] });
        for (let k = 0; k < 7; k++) b.box(0.5, 0.6, 0.08, P.bronze, { at: [-2.4 + k * 0.8, 4.85, ze + 0.2] });
        b.collider(SPAN / 2 - 2.6, 0.6, { at: [-(SPAN / 2 + 2.6) / 2 - 0.3, 0, ze] });
        b.collider(SPAN / 2 - 2.6, 0.6, { at: [(SPAN / 2 + 2.6) / 2 + 0.3, 0, ze] });
      } else b.collider(SPAN, 0.6, { at: [0, 0, ze] });
    }
    for (const s of [-1, 1]) b.collider(1.6, LEN, { at: [s * (half - 0.8), 0, 0] });

    // the clock tower at the front corner
    b.group({ at: [11.6, 0.08, 8.2] }, () => {
      b.box(1.9, 14.0, 1.9, trav);
      for (let y = 1.2; y < 13; y += 1.2) b.box(1.94, 0.03, 1.94, tint(trav, -0.06), { at: [0, y, 0], jitter: false });
      b.box(2.2, 0.3, 2.2, trav, { at: [0, 14.0, 0] });
      for (const [f, dx, dz] of [
        ['+z', 0, 0.95],
        ['-x', -0.95, 0],
      ] as ['+z' | '-x', number, number][]) {
        b.panel(1.5, 1.5, P.white, { at: [dx, 11.5, dz], facing: f, shape: 'circle', depth: 0.06 });
        b.panel(0.08, 0.6, P.black, { at: [dx * 1.04, 12.25, dz * 1.04], facing: f, depth: 0.08 });
        b.panel(0.45, 0.08, P.black, { at: [dx * 1.04 + (f === '+z' ? 0.2 : 0), 12.25, dz * 1.04 + (f === '-x' ? 0.2 : 0)], facing: f, depth: 0.08 });
      }
      b.cyl(0.04, 3.0, P.steel, { at: [0, 14.3, 0], segs: 4 }); // flagpole
      b.panel(0.6, 4.2, P.glassDark, { at: [0, 3.0, 0.95], facing: '+z', depth: 0.04 }); // stair slit
    });
    b.collider(1.9, 1.9, { at: [11.6, 0, 8.2] });

    // stalls in rows inside: concrete counters with white marble tops
    for (const x of [-5.5, 5.5]) {
      for (const z of [-5, 0, 5]) {
        b.box(3.6, 0.85, 1.1, P.concrete, { at: [x, 0.28, z], rotY: Math.PI / 2 });
        b.box(1.2, 0.05, 3.7, P.marble, { at: [x, 1.13, z] });
        goods(b, 3.2, [x, 1.18, z], Math.PI / 2, b.pick([['fruit', 'basket'], ['fish'], ['cheese', 'pot']] as const).slice());
        b.collider(1.1, 3.6, { at: [x, 0, z] });
      }
    }
    // a lamp standard in the forecourt
    b.cyl(0.07, 4.2, P.castIron, { at: [-11.6, 0.08, 9.6], segs: 5 });
    b.box(0.6, 0.12, 0.3, P.castIron, { at: [-11.4, 4.2, 9.6] });
  },
};
