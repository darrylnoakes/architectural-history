import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, BED, END, hump, band, bar, side, steps, archRing, type ZY } from './shared';

export const ironBridge: BuildingDef = {
  id: 'iron-bridge',
  name: 'Cast-iron arch bridge',
  style: 'Georgian industrial',
  date: '1779',
  summary:
    'At Coalbrookdale in Shropshire, Abraham Darby III cast the world’s first large iron bridge to a design by the architect Thomas Farnolls Pritchard, and bridges like it soon followed elsewhere. ' +
    'A single span leaps the whole river, so there are no piers to catch floods or block barges. ' +
    'Five arched ribs, each cast in two halves, are joined with the dovetails, wedges and mortise-and-tenon joints of a carpenter, because nobody yet knew how iron ought to be put together.',
  materials: ['cast iron', 'sandstone', 'gravel road'],
  modelledOn: 'The Iron Bridge, Coalbrookdale (1779)',
  lookFor: [
    { label: 'Cast-iron ribs', note: 'Five parallel arched ribs side by side carry the whole road; each is two castings meeting at the crown.', at: [3.2, 2.9, 0] },
    { label: 'Concentric ribs', note: 'Shorter ribs above the main one, running from the abutment until they meet the deck, stiffen the haunches of the arch.', at: [3.2, 2.5, 5.0] },
    { label: 'Ring spandrel', note: 'A cast-iron circle fills the corner between the ribs, the upright and the deck: ornament that also braces.', at: [3.2, 2.5, -6.2] },
    { label: 'Ogee', note: 'Small S-curved arches near the crown, a decorative shape borrowed from Gothic and Rococo design.', at: [3.2, 3.9, 2.5] },
    { label: 'Stone abutment', note: 'Masonry on each bank takes the push of the arch; at Coalbrookdale the ground moved, and the abutments have needed strengthening ever since.', at: [3.6, 0.2, 9.0] },
  ],
  influences: ['industrial-export'],
  build(b) {
    b.noCollide();
    const W = 6.0;
    const crown = 4.4;
    const f = hump(crown);
    const deckT = 0.35;
    const under = (z: number) => f(z) - deckT;
    b.deck(W - 0.5, 26, crown, { yEnds: 0 });
    const iron = mix(P.castIron, P.brickDark, 0.45); // the iron-oxide red-brown found to be the original paint
    const stone = b.pick([P.sandstone, tint(P.sandstone, 0.03)]);
    const ribs = [-2.4, -1.2, 0, 1.2, 2.4];

    // main arch geometry: a near-semicircular segment springing from the abutments
    const A = 6.8; // half span between abutment faces
    const spring = -2.0;
    const rise = 5.0;
    const R = (A * A + rise * rise) / (2 * rise);
    const cy = spring + rise - R;
    const circle = (r: number, z: number) => cy + Math.sqrt(Math.max(0, r * r - z * z));
    /** arc of radius r from the abutment face (or where it meets the deck) to the other side */
    const arc = (r: number, n = 20): ZY[] => {
      // find |z| where the arc meets the deck underside, if it does
      let zEnd = 0;
      for (let z = 0; z <= A; z += 0.02) {
        if (circle(r, z) <= under(z) - 0.02) {
          zEnd = z;
          break;
        }
      }
      return steps(n, -A, -zEnd).map((z) => [z, circle(r, z)] as ZY);
    };

    // abutments: sandstone, with a skewback ledge where the ribs spring
    b.sym((s) => {
      const pts: ZY[] = [];
      for (const z of steps(8, A + 0.3, END)) pts.push([s * z, under(z)]);
      pts.push([s * END, -0.4], [s * BANK, -0.4], [s * BANK, BED - 0.1], [s * A, BED - 0.1], [s * A, spring], [s * (A + 0.3), spring + 0.4]);
      side(b, pts.reverse(), W + 1.2, stone);
      // ashlar quoins and a projecting plinth
      b.box(W + 1.4, 0.4, 0.5, tint(stone, -0.05), { at: [0, BED - 0.1, s * (A + 0.15)] });
      b.sym((t) => b.box(0.5, under(A + 0.6) - BED, 0.6, tint(stone, 0.05), { at: [t * (W / 2 + 0.4), BED - 0.1, s * (A + 0.55)] }));
    });

    // the five rib frames
    const main = (n: number) => {
      const c: ZY[] = [];
      for (const z of steps(n, -A, A)) c.push([z, circle(R, z)]);
      return c;
    };
    const R2 = R + 0.75;
    const R3 = R + 1.6;
    const mainCurve = main(28);
    const mid = arc(R2);
    const outer = arc(R3, 10);
    for (const x of ribs) {
      archRing(b, mainCurve, 0.32, 0.16, iron, x);
      b.sym((s) => {
        const m = s > 0 ? mid : mid.map(([z, y]) => [-z, y] as ZY).reverse();
        const o = s > 0 ? outer : outer.map(([z, y]) => [-z, y] as ZY).reverse();
        archRing(b, m, 0.16, 0.12, iron, x);
        archRing(b, o, 0.14, 0.12, iron, x);
        // upright standard at the abutment end of the frame
        b.box(0.12, under(A) - spring - 0.3, 0.2, iron, { at: [x, spring + 0.3, s * (A + 0.08)] });
      });
      // radial ties between the main and middle ribs
      for (const z of [-5.0, -3.6, 3.6, 5.0]) {
        const y0 = circle(R, z) + 0.3;
        const y1 = circle(R2, z);
        if (y1 > y0 + 0.05) b.box(0.1, y1 - y0, 0.1, iron, { at: [x, y0, z] });
      }
    }
    // the face ribs carry the ornament: rings and ogees (one set per face, visible in elevation)
    for (const x of [ribs[0], ribs[4]]) {
      b.sym((s) => {
        // ring in the corner between outer rib, upright and deck
        const zc = s * 6.05;
        const yLo = circle(R3, Math.abs(zc));
        const yHi = under(zc);
        const r = Math.min(0.55, (yHi - yLo) / 2 - 0.04);
        const yc = (yLo + yHi) / 2;
        const ring: ZY[] = [];
        const hole: ZY[] = [];
        for (let i = 0; i < 16; i++) {
          const t = (i / 16) * Math.PI * 2;
          ring.push([zc + r * Math.cos(t), yc + r * Math.sin(t)]);
          hole.push([zc + (r - 0.1) * Math.cos(t), yc + (r - 0.1) * Math.sin(t)]);
        }
        side(b, ring, 0.14, iron, x, [hole]);
        // ogee arches between the middle rib and the deck near the crown
        for (const zm of [1.3, 2.5]) {
          const z0 = s * zm;
          const base = circle(R2, zm) + 0.14;
          const top = under(z0) - 0.02;
          if (top - base < 0.2) continue;
          b.sym((t) => {
            let prev: [number, number] | null = null;
            for (const u of steps(6, 0, 1)) {
              const z = z0 + t * 0.42 * (1 - u);
              const y = base + (top - base) * (3 * u * u - 2 * u * u * u);
              if (prev) bar(b, [x, prev[1], prev[0]], [x, y, z], 0.07, iron);
              prev = [z, y];
            }
          });
        }
      });
    }
    // cross bracing between the ribs at the crown and haunches
    for (const z of [-4.5, 0, 4.5]) b.box(ribs[4] - ribs[0], 0.12, 0.12, iron, { at: [0, circle(R, z) + 0.1, z] });

    // deck: cast-iron plates on bearers, a gravel road, cornice plates on each face
    band(b, 0, W, -A - 0.3, A + 0.3, under, (z) => f(z) - 0.08, iron, 28);
    band(b, 0, W - 0.3, -END, END, (z) => f(z) - 0.09, (z) => f(z) + 0.01, P.gravel, 28);
    b.sym((s) => band(b, s * (W / 2 + 0.04), 0.08, -A - 0.3, A + 0.3, (z) => under(z) - 0.06, (z) => f(z) - 0.02, tint(iron, 0.05), 28));

    // cast-iron railings along both sides, on stone end piers
    b.sym((s) => {
      const x = s * (W / 2 - 0.1);
      const zs = steps(48, -END + 0.7, END - 0.7);
      for (const z of zs) b.box(0.05, 1.05, 0.05, iron, { at: [x, f(z) - 0.02, z], jitter: false });
      band(b, x, 0.1, -END + 0.7, END - 0.7, (z) => f(z) + 1.0, (z) => f(z) + 1.1, iron, 28);
      band(b, x, 0.07, -END + 0.7, END - 0.7, (z) => f(z) + 0.12, (z) => f(z) + 0.18, iron, 28);
      b.sym((t) => {
        const z = t * (END - 0.35);
        b.box(0.7, 1.35, 0.7, tint(stone, 0.04), { at: [x, f(z) - 0.1, z] });
        b.pyramid(0.8, 0.8, 0.25, tint(stone, 0.04), { at: [x, f(z) + 1.25, z] });
      });
    });
  },
};
