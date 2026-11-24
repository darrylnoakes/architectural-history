import { P, spread, tint, type Builder, type BuildingDef, type Facing } from '@ah/kit';
import { gardenWalls } from './shared';

/** A Romanesque two-light window: two round-headed lights under one enclosing arch, divided by a shaft. */
function twoLight(b: Builder, x: number, y: number, z: number, facing: Facing, stone: number) {
  b.group({ at: [x, y, z], rotY: typeof facing === 'number' ? facing : facing === '+z' ? 0 : facing === '-z' ? Math.PI : facing === '+x' ? Math.PI / 2 : -Math.PI / 2 }, () => {
    b.panel(1.9, 2.05, tint(stone, 0.05), { shape: 'round', depth: 0.06 });
    b.panel(1.62, 1.85, tint(stone, -0.1), { at: [0, 0.05, 0], shape: 'round', depth: 0.07 });
    for (const s of [-1, 1]) b.panel(0.56, 1.35, P.windowDark, { at: [s * 0.4, 0.12, 0], shape: 'round', depth: 0.09 });
    b.cyl(0.07, 1.05, tint(stone, 0.08), { at: [0, 0.12, 0.16], segs: 6 });
    b.box(0.22, 0.12, 0.22, tint(stone, 0.08), { at: [0, 1.15, 0.16] });
    b.box(1.95, 0.12, 0.14, tint(stone, 0.06), { at: [0, -0.02, 0.07] });
  });
}

export const normanStoneHouse: BuildingDef = {
  id: 'norman-stone-house',
  name: 'Norman stone house',
  style: 'Norman Romanesque',
  date: 'c. 1160',
  summary:
    'After the Conquest a handful of the richest townspeople, among them Jewish financiers living under royal protection, built houses of stone: fireproof, secure and rare. ' +
    'Goods were kept on the ground floor behind narrow slits, and the family lived in a hall on the first floor, warmed by a wall fireplace whose chimney breast is carried on the arch of the front door. ' +
    'Round arches, thick walls and flat corner buttresses are the same Romanesque as the new castle and cathedral.',
  materials: ['limestone rubble', 'dressed limestone', 'stone slate'],
  modelledOn: 'Jew’s House, Steep Hill, Lincoln (c. 1160)',
  lookFor: [
    { label: 'Two-light window', note: 'Two round-headed lights under a single arch, split by a little column called a shaft.', at: [-3.4, 4.6, 10.9] },
    { label: 'Chimney breast over the door', note: 'The first-floor fireplace needed a flue, so its breast is carried out over the doorway arch, as at the Jew’s House.', at: [0, 4.6, 11.1] },
    { label: 'Undercroft', note: 'The ground floor, lit only by slits, held stock and strongboxes; the household lived upstairs, away from damp and thieves.', at: [-5.2, 1.6, 10.8] },
    { label: 'Pilaster buttress', note: 'A flat strip of dressed stone at the corner, typical of Norman work.', at: [6.4, 2.4, 10.7] },
    { label: 'External stair', note: 'Stone steps up the side wall to the door of the first-floor hall.', at: [7.3, 2.6, 6.5] },
  ],
  influences: ['norman-romanesque'],
  build(b) {
    const stone = b.pick([P.limestone, P.limestoneWarm, tint(P.limestone, -0.03)]);
    const dressed = tint(stone, 0.06);
    const roof = b.pick([P.stoneSlate, tint(P.stoneSlate, -0.04), P.tileBrown]);
    const W = 12.4;
    const D = 8;
    const zc = 6.5;
    const zf = zc + D / 2; // street face
    const g = 3.2; // undercroft
    const H = 7; // eaves

    b.box(W + 0.2, 0.3, D + 0.2, tint(stone, -0.06), { at: [0, 0, zc] });
    b.box(W, H, D, stone, { at: [0, 0, zc] });
    // string course at first-floor level and a corbel table under the eaves
    b.box(W + 0.12, 0.16, D + 0.12, dressed, { at: [0, g + 0.4, zc] });
    for (const x of spread(16, -W / 2, W / 2)) {
      for (const s of [1, -1]) b.box(0.2, 0.22, 0.16, dressed, { at: [x, H - 0.38, zc + s * (D / 2 + 0.08)] });
    }
    b.box(W + 0.3, 0.16, D + 0.3, dressed, { at: [0, H - 0.16, zc] });
    // flat pilaster buttresses clasping the corners and one mid-wall on the long sides
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        b.box(0.7, H - 0.2, 0.18, dressed, { at: [sx * (W / 2 - 0.35), 0, zc + sz * (D / 2 + 0.09)] });
        b.box(0.18, H - 0.2, 0.7, dressed, { at: [sx * (W / 2 + 0.09), 0, zc + sz * (D / 2 - 0.35)] });
      }
    }
    b.box(0.6, H - 0.2, 0.16, dressed, { at: [0, 0, zc - D / 2 - 0.08] });

    // roof: ridge along the street, steep stone slates, stone gable copings
    const rh = 4.1;
    b.gable(W, D, rh, roof, { at: [0, H, zc], overhang: 0.2, wall: stone, thick: 0.2 });
    b.sym((s) => b.box(0.35, 0.3, 0.35, dressed, { at: [s * W / 2, H + rh - 0.05, zc] }));

    // ---- street front
    // round-arched doorway in two orders with nook shafts
    b.panel(2.5, 3.0, dressed, { at: [0, 0.3, zf], facing: '+z', shape: 'round', depth: 0.1 });
    b.panel(2.0, 2.75, tint(stone, -0.08), { at: [0, 0.3, zf], facing: '+z', shape: 'round', depth: 0.12 });
    b.panel(1.4, 2.45, P.oakDark, { at: [0, 0.3, zf], facing: '+z', shape: 'round', depth: 0.14 });
    b.sym((s) => b.cyl(0.09, 1.7, dressed, { at: [s * 1.12, 0.3, zf + 0.12], segs: 6 }));
    b.stairs(2.4, 0.3, 0.5, 1, dressed, { at: [0, 0, zf + 0.25] });
    // chimney breast carried on corbels over the arch, rising to a round stack
    b.box(1.7, 0.3, 0.6, dressed, { at: [0, 3.35, zf + 0.3] });
    b.box(1.5, H - 3.65, 0.5, stone, { at: [0, 3.65, zf + 0.25] });
    b.box(1.6, 0.14, 0.56, dressed, { at: [0, H - 0.16, zf + 0.25] });
    b.cyl(0.42, 2.6, stone, { at: [0, H - 0.1, zf + 0.1], segs: 10 });
    b.cyl(0.5, 0.25, dressed, { at: [0, H + 2.45, zf + 0.1], segs: 10 });
    // first-floor two-light windows of the hall
    b.sym((s) => twoLight(b, s * 3.4, g + 0.62, zf, '+z', stone));
    // slit windows to the undercroft
    for (const x of [-5.2, -2.6, 2.6, 5.2]) b.panel(0.24, 1.0, P.windowDark, { at: [x, 1.4, zf], facing: '+z' });

    // ---- back and gable ends
    b.sym((s) => twoLight(b, s * 3.4, g + 0.62, zc - D / 2, '-z', stone));
    for (const x of [-4, 4]) b.panel(0.24, 1.0, P.windowDark, { at: [x, 1.4, zc - D / 2], facing: '-z' });
    b.panel(1.2, 2.2, P.oakDark, { at: [-2.5, 0.3, zc - D / 2], facing: '-z', shape: 'round' });
    b.sym((s) => {
      const f = s > 0 ? '+x' : '-x';
      b.panel(0.5, 1.0, P.windowDark, { at: [s * W / 2, H + 1.0, zc], facing: f, shape: 'round' });
      b.panel(0.24, 1.0, P.windowDark, { at: [s * W / 2, 1.4, zc - 1.8], facing: f });
    });
    twoLight(b, -W / 2, g + 0.62, zc, '-x', stone);

    // external stair up the side wall to the hall door
    const sx = W / 2 + 0.65;
    b.stairs(1.2, g + 0.4, 4.4, 12, stone, { at: [sx, 0, zc + 1.6] });
    b.box(1.2, g + 0.4, 1.3, stone, { at: [sx, 0, zc - 1.25] });
    b.panel(1.15, 2.3, P.oakDark, { at: [W / 2, g + 0.4, zc - 1.25], facing: '+x', shape: 'round' });
    b.panel(1.45, 2.5, dressed, { at: [W / 2, g + 0.4, zc - 1.25], facing: '+x', shape: 'round', depth: 0.04 });

    // ---- the yard: detached timber kitchen (fire risk) and boundary walls
    const ks = -1;
    b.group({ at: [ks * 4.2, 0, -6.5] }, () => {
      b.box(5, 2.4, 4, P.daub);
      b.frame(5, 2.4, P.oak, { at: [0, 0, 2], facing: '+z', studs: 3, rails: 1 });
      b.frame(5, 2.4, P.oak, { at: [0, 0, -2], facing: '-z', studs: 3, rails: 1 });
      b.gable(5, 4, 2.6, P.thatch, { at: [0, 2.4, 0], overhang: 0.35, wall: P.daub, thick: 0.35 });
      b.panel(1.0, 1.9, P.oakDark, { at: [0, 0, 2], facing: '+z' });
    });
    gardenWalls(b);
    b.box(3.0, 0.08, 6, P.gravel, { at: [ks * 4.2, 0, -1.3] });
  },
};
