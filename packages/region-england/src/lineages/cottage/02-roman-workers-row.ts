import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bar } from './shared';

const UW = 5.4; // unit width
const GAP = 0.5; // eavesdrip alley between units
const DEPTH = 10.2;
const WALL = 2.9;
const FRONT = 4.4; // z of the front (gable) wall

/** Tegulae (flat tiles) with imbrices (half-round cover tiles) shown as ribs running down each slope. */
function tiledRoof(b: Builder, x: number, h: number, ov: number, color: number): void {
  const half = UW / 2;
  const t = 0.14;
  b.gable(UW, DEPTH, h, color, { at: [x, WALL, FRONT - DEPTH / 2], ridge: 'z', overhang: ov, thick: t, wall: P.plaster });
  const vt = (t * Math.hypot(half, h)) / half;
  const drop = (ov * h) / half;
  const ribs = 17;
  for (let i = 0; i < ribs; i++) {
    const z = FRONT + ov - 0.25 - ((DEPTH + ov * 2 - 0.5) * i) / (ribs - 1);
    for (const s of [-1, 1]) {
      bar(b, [x + s * (half + ov - 0.05), WALL - drop + vt + 0.02, z], [x, WALL + h + vt + 0.02, z], 0.12, tint(color, 0.06));
    }
  }
  b.log(0.11, DEPTH + ov * 2, tint(color, 0.04), { at: [x, WALL + h + vt - 0.06, FRONT - DEPTH / 2], axis: 'z', segs: 6 });
}

function amphora(b: Builder, x: number, z: number): void {
  b.lathe(
    [
      [0.01, 0],
      [0.06, 0.08],
      [0.2, 0.4],
      [0.19, 0.62],
      [0.07, 0.78],
      [0.06, 0.95],
      [0.08, 0.98],
    ],
    P.terracotta,
    { at: [x, 0, z], segs: 7 },
  );
}

export const romanWorkersRow: BuildingDef = {
  id: 'roman-workers-row',
  name: 'Romano-British shop-houses',
  style: 'Romano-British vernacular',
  date: 'c. AD 100',
  summary:
    'Within a generation of the conquest the town had straight streets, and along them ran narrow "strip buildings" set end-on to the road. ' +
    'Each was a timber frame on a sill beam and stone footing, its walls filled with wattle or clay and plastered: a shop or workshop open to the street at the front, a room or two to live in behind. ' +
    'What is new since the roundhouse is the rectangle, the street line and, on some roofs, fired clay tiles, though thatch stayed common on cheaper buildings.',
  materials: ['timber frame', 'wattle and daub, plastered', 'clay roof tile', 'thatch', 'stone footings'],
  lookFor: [
    { label: 'Gable end to the street', note: 'Plots along a busy street were narrow, so the building turned its short end to the road and stretched back.', at: [-8.85, 3.6, 4.5] },
    { label: 'Open shop front', note: 'The whole front opened by day behind shutters, with a counter on the street. Living space lay behind.', at: [-9.45, 1.5, 4.9] },
    { label: 'Tegulae and imbrices', note: 'The Roman tile roof: flat tiles with raised edges, the joints covered by half-round tiles that make the ribs.', at: [-4.3, 3.8, 0] },
    { label: 'Timber portico', note: 'A covered walk of posts along the frontage sheltered shoppers and the goods laid out on the counters.', at: [3.0, 2.4, 6.3] },
    { label: 'Sill beam on a stone footing', note: 'Timber laid on a low stone wall kept the frame off the wet ground and lasted far longer than posts set in the earth.', at: [11.6, 0.43, 0] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const n = 4;
    const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * (UW + GAP));
    // which units are tiled: always a mix, the hero has the two left ones tiled
    const firstTiled = b.variant === 0 ? 0 : Math.floor(b.rand() * 3);
    const zc = FRONT - DEPTH / 2;
    const thatch = b.pick([P.thatchOld, P.reed]);
    const tile = b.pick([P.romanTile, tint(P.romanTile, -0.04), P.terracotta]);

    xs.forEach((x, i) => {
      const plaster = b.pick([P.plaster, P.limewash, tint(P.plaster, -0.03), P.daub]);
      // stone footing, oak sill beam, plastered walls
      b.box(UW + 0.1, 0.35, DEPTH + 0.1, P.rubble, { at: [x, 0, zc] });
      b.box(UW + 0.04, 0.16, DEPTH + 0.04, P.oak, { at: [x, 0.35, zc] });
      b.box(UW, WALL - 0.51, DEPTH, plaster, { at: [x, 0.51, zc] });
      // wall plates and corner posts show through the plaster at the angles
      b.sym((s) => {
        for (const z of [FRONT - 0.08, FRONT - DEPTH + 0.08]) b.box(0.18, WALL - 0.51, 0.18, P.oak, { at: [x + s * (UW / 2 - 0.08), 0.51, z] });
        b.box(0.12, 0.16, DEPTH, P.oak, { at: [x + s * (UW / 2 + 0.01), WALL - 0.16, zc] });
      });

      const tiled = i === firstTiled || i === firstTiled + 1;
      if (tiled) tiledRoof(b, x, 1.45, 0.2, tile);
      else b.gable(UW, DEPTH, 2.9, thatch, { at: [x, WALL, zc], ridge: 'z', overhang: 0.22, thick: 0.38, wall: plaster });

      // open shop front: shadowed interior, oak lintel, masonry counter, door to one side
      const side = i % 2 === 0 ? 1 : -1;
      b.panel(3.2, 2.3, P.timberBlack, { at: [x - side * 0.6, 0.35, FRONT], facing: '+z' });
      b.box(3.5, 0.22, 0.22, P.oak, { at: [x - side * 0.6, 2.65, FRONT + 0.05] });
      b.box(2.9, 0.85, 0.55, tint(P.plaster, -0.06), { at: [x - side * 0.6, 0.35, FRONT + 0.3] });
      b.box(3.0, 0.07, 0.62, P.oak, { at: [x - side * 0.6, 1.2, FRONT + 0.3] });
      // folded shutters leant beside the opening
      b.box(0.9, 2.0, 0.06, P.oakSilver, { at: [x + side * 1.6, 0.35, FRONT + 0.08] });
      b.panel(0.85, 1.95, P.oakDark, { at: [x + side * 1.6, 0.35, FRONT + 0.12], facing: '+z' });
      // goods on the counter or the street
      if (b.chance(0.6)) {
        amphora(b, x - side * 1.4, FRONT + 0.85);
        amphora(b, x - side * 1.0, FRONT + 0.95);
      } else {
        b.box(0.5, 0.25, 0.35, P.wattle, { at: [x - side * 0.6, 1.27, FRONT + 0.3] });
        b.cyl(0.13, 0.2, P.mud, { at: [x - side * 1.3, 1.27, FRONT + 0.3], segs: 7 });
      }
      // small shuttered windows high in the side walls and a back door
      for (const s of [-1, 1] as const) {
        for (const z of [zc - 2.2, zc + 1.6]) {
          b.panel(0.6, 0.5, P.oakDark, { at: [x + (s * UW) / 2, 1.9, z], facing: s > 0 ? '+x' : '-x' });
        }
      }
      b.panel(0.9, 1.9, P.oakDark, { at: [x + side * 1.2, 0.35, FRONT - DEPTH], facing: '-z' });
      b.panel(0.7, 0.55, P.oakDark, { at: [x - side * 1.0, 1.7, FRONT - DEPTH], facing: '-z' });
    });

    // portico: oak posts on stone pads carrying a lean-to roof along the whole frontage
    const len = n * UW + (n - 1) * GAP + 0.4;
    const pz = FRONT + 1.8;
    const posts = n * 2 + 1;
    for (let i = 0; i < posts; i++) {
      const x = -len / 2 + 0.2 + ((len - 0.4) * i) / (posts - 1);
      b.box(0.36, 0.2, 0.36, P.rubble, { at: [x, 0, pz] });
      b.box(0.2, 2.15, 0.2, P.oak, { at: [x, 0.2, pz] });
    }
    b.box(len, 0.2, 0.2, P.oak, { at: [0, 2.35, pz] });
    const roofTile = tint(tile, -0.03);
    const run = 2.05;
    const ang = Math.atan2(0.45, run);
    b.box(len, 0.12, run + 0.25, roofTile, { at: [0, 2.55 + 0.45 / 2 - 0.06, FRONT + run / 2 + 0.05], rot: [ang, 0, 0] });
    // flagged walk under the portico
    b.box(len, 0.06, 2.2, P.paving, { at: [0, 0, FRONT + 1.1], jitter: false });

    // back yard: a well head and a woodpile
    b.cyl(0.55, 0.6, P.rubble, { at: [-6.5, 0, -6.4], segs: 9 });
    b.cyl(0.42, 0.05, P.water, { at: [-6.5, 0.56, -6.4], segs: 9 });
    for (let i = 0; i < 3; i++) b.log(0.12, 1.5, P.bark, { at: [5.4, i * 0.2, -6.3 + (i % 2) * 0.1], segs: 6 });
  },
};
