import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bar } from './shared';

const UW = 5.3;
const D = 6.4;
const ZF = 3.0;
const G = 2.7;
const F1 = 2.5;
const F2 = 2.6;
const PL = 0.25; // plinth

/** Flat-faced stone mullioned window: `lights` lights in one stone surround. */
function mullioned(b: Builder, x: number, y: number, z: number, lights: number, h: number, facing: '+z' | '-z' | '+x', dress: number): void {
  const lw = 0.52;
  const m = 0.13;
  const w = lights * lw + (lights + 1) * m;
  b.window(w, h, { at: [x, y, z], facing, frame: dress, glass: P.windowDark, bars: [lights, 1], border: m });
  // small leaded panes suggested by a transom of thin glazing bars in each light
  const s = facing === '+z' ? 1 : facing === '-z' ? -1 : 0;
  if (s) {
    b.box(w + 0.16, 0.16, 0.12, dress, { at: [x, y + h, z + s * 0.04] }); // lintel
    b.box(w + 0.16, 0.1, 0.16, dress, { at: [x, y - 0.1, z + s * 0.06] }); // sill
  }
}

export const weaversCottages: BuildingDef = {
  id: 'weavers-cottages',
  name: 'Weavers’ cottages',
  style: 'Georgian vernacular (industrial)',
  date: 'c. 1770',
  summary:
    'Before the power loom, cloth was woven at home on hand looms. These cottages put the family on the two lower floors and the looms in a loomshop across the whole top floor, lit by long rows of windows on both fronts so the weavers had light from dawn to dusk. ' +
    'Built of local stone with stone-slate roofs of gentle pitch, they are three storeys where the medieval row was two: the cottage has become a small workshop as the domestic woollen and silk trades boom. ' +
    'A taking-in door high in the end wall let the clothier’s yarn and finished pieces in and out without carrying them through the house.',
  materials: ['gritstone or sandstone', 'stone slate', 'oak and pine joinery'],
  lookFor: [
    { label: 'Weavers’ windows', note: 'Long rows of narrow lights divided by stone mullions, lighting the looms on the top floor from both sides.', at: [-7.95, 6.7, 3.1] },
    { label: 'Loomshop', note: 'The whole top floor was one workroom for the looms, lit by long windows on the back as well as the front.', at: [2.65, 6.7, -3.5] },
    { label: 'Taking-in door', note: 'A door high in the gable with a beam above it for a hoist, so pieces and yarn could be lifted straight to the loomshop.', at: [10.7, 6.5, 0.3] },
    { label: 'Stone-slate roof', note: 'Heavy sandstone slabs need a low pitch so they do not slide; the roof is much flatter than thatch.', at: [-3, 9.1, 1.6] },
    { label: 'Shared chimney stacks', note: 'Stacks on the ridge at each party wall serve the fireplaces of the houses either side.', at: [0, 10.6, -0.2] },
  ],
  influences: ['industrial-export'],
  build(b) {
    const stone = b.pick([P.gritstone, tint(P.gritstone, 0.05), P.sandstone, tint(P.sandstone, -0.06)]);
    const dress = tint(stone, 0.1);
    const roof = b.pick([P.stoneSlate, tint(P.stoneSlate, -0.05), P.slate]);
    const n = 4;
    const L = n * UW;
    const zc = ZF - D / 2;
    const H = PL + G + F1 + F2;
    const rh = (D / 2) * Math.tan((30 * Math.PI) / 180);

    b.box(L + 0.12, PL, D + 0.12, dress, { at: [0, 0, zc] });
    b.box(L, H - PL, D, stone, { at: [0, PL, zc] });
    // string course at the loomshop floor and plain eaves band
    b.box(L + 0.08, 0.12, D + 0.08, dress, { at: [0, PL + G + F1 - 0.1, zc] });
    b.gable(L + 0.1, D, rh, roof, { at: [0, H, zc], overhang: 0.2, thick: 0.18, wall: stone });
    // gable copings
    b.sym((s) => {
      const x = s * (L / 2 + 0.05);
      bar(b, [x, H + 0.05, zc - D / 2 - 0.25], [x, H + rh + 0.2, zc], 0.3, dress);
      bar(b, [x, H + 0.05, zc + D / 2 + 0.25], [x, H + rh + 0.2, zc], 0.3, dress);
    });
    // chimney stacks on the ridge at the ends and party walls
    for (let i = 0; i <= n; i++) {
      const x = -L / 2 + i * UW + (i === 0 ? 0.45 : i === n ? -0.45 : 0);
      b.chimney(i === 0 || i === n ? 0.7 : 1.1, rh + 1.2, 0.7, stone, { at: [x, H, zc] });
    }

    const doors = [P.doorGreen, P.doorBlue, P.oakDark, P.doorRed, P.doorBlack];
    for (let i = 0; i < n; i++) {
      const x = -L / 2 + UW * (i + 0.5);
      const flip = i % 2 === 0 ? 1 : -1;
      // front: door with plain stone jambs and lintel, a window either side upstairs
      const dx = x + flip * 1.5;
      b.panel(1.25, 2.25, dress, { at: [dx, PL, ZF], facing: '+z', depth: 0.06 });
      b.panel(0.9, 2.0, b.pick(doors), { at: [dx, PL, ZF], facing: '+z', depth: 0.09 });
      b.box(1.2, PL, 0.5, dress, { at: [dx, 0, ZF + 0.25] });
      mullioned(b, x - flip * 0.8, PL + 0.85, ZF, 3, 1.2, '+z', dress);
      mullioned(b, x - flip * 0.8, PL + G + 0.75, ZF, 2, 1.15, '+z', dress);
      mullioned(b, dx, PL + G + 0.75, ZF, 1, 1.15, '+z', dress);
      // loomshop: one long window across nearly the whole bay
      mullioned(b, x, PL + G + F1 + 0.6, ZF, 7, 1.25, '+z', dress);
      // back: the same long window, smaller ones below, back door
      mullioned(b, x, PL + G + F1 + 0.6, ZF - D, 7, 1.25, '-z', dress);
      mullioned(b, x + flip * 0.9, PL + G + 0.8, ZF - D, 2, 1.05, '-z', dress);
      mullioned(b, x + flip * 0.9, PL + 0.9, ZF - D, 2, 1.05, '-z', dress);
      b.panel(0.85, 1.95, P.oakDark, { at: [x - flip * 1.4, PL, ZF - D], facing: '-z', depth: 0.08 });
      // back yard wall and privy
      if (i > 0) b.box(0.3, 1.5, 3.4, stone, { at: [x - UW / 2, 0, ZF - D - 1.7] });
      if (i % 2 === 0) {
        const px = x + UW / 2;
        b.box(1.4, 2.0, 1.2, stone, { at: [px, 0, -6.2] });
        b.shed(1.6, 1.4, 0.4, roof, { at: [px, 2.0, -6.2], high: '-z' });
        b.panel(0.7, 1.6, P.oakSilver, { at: [px, 0, -5.6], facing: '+z' });
      }
    }
    b.box(L, 1.5, 0.3, stone, { at: [0, 0, -6.95 + 0.15] });

    // taking-in door high in the right-hand gable, with a hoist beam
    const gx = L / 2;
    b.panel(1.2, 1.9, dress, { at: [gx, PL + G + F1 + 0.15, zc + 0.5], facing: '+x', depth: 0.06 });
    b.panel(0.95, 1.75, P.oakDark, { at: [gx, PL + G + F1 + 0.15, zc + 0.5], facing: '+x', depth: 0.09 });
    b.box(1.0, 0.2, 0.2, P.oakDark, { at: [gx + 0.45, PL + G + F1 + 2.2, zc + 0.5] });
    b.box(0.03, 1.0, 0.03, P.iron, { at: [gx + 0.85, PL + G + F1 + 1.2, zc + 0.5] });
    // small windows lower in the gables
    b.sym((s) => mullioned(b, s * L / 2, PL + 1.0, zc - 1.2, 2, 1.0, '+x', dress), );
    // flagged footway along the front
    b.box(L + 1, 0.06, 1.6, P.paving, { at: [0, 0, ZF + 0.9] });
  },
};
