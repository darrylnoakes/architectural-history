import { P, tint, type BuildingDef } from '@ah/kit';
import { pitched, privy, vegBed, well, yardWall, washing } from './shared';

export const romanesqueHouse: BuildingDef = {
  id: 'romanesque-house',
  name: 'Romanesque stone house',
  style: 'Romanesque',
  date: 'c. 1140',
  summary:
    'With the revival of trade and the charter of the commune, the better-off craftsmen and merchants began to build in stone, side by side along the street. ' +
    'The ground floor is the shop and store, opening to the street through wide round arches with a stone sill for a counter; a separate door leads to the stair. ' +
    'Upstairs the hall, where the family ate, worked and slept, is lit by a row of small arched windows on slender colonnettes (a claire-voie), closed by shutters, for glass was still for churches. ' +
    'The side walls are shared with the neighbours, so they are blank, and the roof slopes to the street and the yard.',
  materials: ['cut limestone front', 'rubble side and back walls', 'oak floors and roof', 'flat clay tiles'],
  modelledOn:
    'The front follows the twelfth- and thirteenth-century stone houses of Cluny (Saône-et-Loire): shop arches below and a continuous row of windows lighting the hall above. The proportions and details here are generic, not those of a particular house.',
  lookFor: [
    {
      label: 'Shop arch with its counter',
      note: 'A wide round arch opens the shop to the street; goods were set out on the broad stone sill, and shutters closed it at night.',
      at: [-3.6, 3.5, 8.6],
    },
    {
      label: 'Claire-voie on colonnettes',
      note: 'A row of small round-arched windows divided by slender columns with carved capitals lights the hall across the whole front.',
      at: [-3.4, 5.6, 8.6],
    },
    {
      label: 'Door to the stair',
      note: 'A narrow arched door beside the shop leads to the stair, so the family could come and go when the shop was shut.',
      at: [0.6, 2.6, 8.6],
    },
    {
      label: 'Corbel table',
      note: 'A row of small carved blocks carries the eaves course, a detail borrowed from the churches.',
      at: [4.5, 8.0, 8.6],
    },
    {
      label: 'Blank party wall',
      note: 'The side walls are shared with the houses on either side, so they have no openings: the house lives through its front and its yard.',
      at: [-6.85, 5.0, 4.0],
    },
  ],
  build(b) {
    const stone = tint(b.pick([P.pierreBlonde, P.craie, P.limestoneWarm]), b.range(-0.04, 0.0));
    const rubble = tint(stone, -0.08);
    const dress = tint(stone, 0.05);
    const tile = tint(P.tuilePlate, b.range(-0.05, 0.03));
    const shut = b.pick([P.oak, P.oakDark, tint(P.oak, 0.05)]);
    const W = 13.6;
    const zF = 8.4;
    const zB = 0.0;
    const D = zF - zB;
    const zc = (zF + zB) / 2;
    const g = 3.9;
    const eaves = 8.0;

    // the block: rubble walls, the front faced in cut stone
    b.box(W, eaves, D, rubble, { at: [0, 0, zc] });
    b.box(W, eaves, 0.08, stone, { at: [0, 0, zF], jitter: false });
    for (let y = 0.45; y < eaves; y += 0.45) b.box(W, 0.025, 0.1, tint(stone, -0.12), { at: [0, y, zF + 0.005], jitter: false });
    // plinth and string courses
    b.box(W, 0.35, 0.22, dress, { at: [0, 0, zF + 0.05] });
    b.box(W, 0.18, 0.24, dress, { at: [0, g + 0.15, zF + 0.06] });
    b.box(W, 0.16, 0.22, dress, { at: [0, 4.55, zF + 0.05] });
    b.box(W, 0.16, 0.22, dress, { at: [0, 6.75, zF + 0.05] });

    // ground floor: two shop arches and the stair door
    const arch = (x: number, w: number, h: number, counter: boolean) => {
      b.panel(w + 0.6, h + 0.3, dress, { at: [x, 0, zF + 0.04], facing: '+z', shape: 'round', depth: 0.05 });
      b.panel(w, h, P.windowDark, { at: [x, 0, zF + 0.04], facing: '+z', shape: 'round', depth: 0.08 });
      if (counter) {
        b.box(w, 0.9, 0.7, dress, { at: [x, 0, zF + 0.05] });
        b.box(w + 0.1, 0.1, 0.8, tint(dress, 0.03), { at: [x, 0.9, zF + 0.05], jitter: false });
        // night shutters, propped up as an awning
        b.group({ at: [x, h - w / 2 - 0.1, zF + 0.12], rot: [-1.2, 0, 0] }, () => b.box(w - 0.2, 0.06, 0.8, shut, { at: [0, 0, 0.4] }));
      }
    };
    arch(-3.6, 3.4, 3.4, true);
    arch(4.0, 3.0, 3.3, true);
    // wares on the counters: cloth on one, pots on the other
    for (let i = 0; i < 4; i++) b.box(0.55, 0.18, 0.4, b.pick([P.doorRed, P.cream, 0x5a6f8a, P.ochreWash]), { at: [-4.8 + i * 0.8, 1.0, zF + 0.2] });
    for (let i = 0; i < 4; i++) b.cyl(0.16, 0.3, b.pick([P.terracotta, tint(P.terracotta, -0.1), P.oakDark]), { at: [3.0 + i * 0.65, 1.0, zF + 0.2], rTop: 0.1, segs: 7 });
    b.panel(1.7, 2.75, dress, { at: [0.6, 0, zF + 0.04], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(1.2, 2.5, shut === P.oakDark ? P.oak : P.oakDark, { at: [0.6, 0, zF + 0.04], facing: '+z', shape: 'round', depth: 0.08 });
    b.box(1.6, 0.16, 0.5, dress, { at: [0.6, 0, zF + 0.25] });

    // the hall: a claire-voie in two arcades, each of n lights on colonnettes
    const n = b.pick([4, 4, 5]);
    const lw = n === 4 ? 0.72 : 0.6;
    const lh = 1.6;
    const ly = 4.71;
    for (const gx of [-3.4, 3.4]) {
      const span = n * lw + (n - 1) * 0.3;
      b.panel(span + 0.5, lh + 0.25, tint(stone, -0.06), { at: [gx, ly, zF + 0.04], facing: '+z', depth: 0.02 });
      for (let i = 0; i < n; i++) {
        const x = gx - span / 2 + lw / 2 + i * (lw + 0.3);
        b.panel(lw + 0.18, lh + 0.1, dress, { at: [x, ly, zF + 0.06], facing: '+z', shape: 'round', depth: 0.03 });
        b.panel(lw, lh, P.windowDark, { at: [x, ly, zF + 0.06], facing: '+z', shape: 'round', depth: 0.06 });
        // inner shutter, half open
        b.panel(lw * 0.5, lh - lw / 2 - 0.05, shut, { at: [x - lw / 4, ly, zF + 0.07], facing: '+z', depth: 0.06 });
        if (i < n - 1) {
          const cx = x + lw / 2 + 0.15;
          b.cyl(0.075, lh - lw / 2 - 0.25, dress, { at: [cx, ly + 0.1, zF + 0.2], segs: 8 });
          b.box(0.22, 0.12, 0.22, dress, { at: [cx, ly, zF + 0.2] });
          b.cyl(0.08, 0.18, dress, { at: [cx, ly + lh - lw / 2 - 0.15, zF + 0.2], rTop: 0.15, segs: 8 });
          b.box(0.3, 0.08, 0.3, dress, { at: [cx, ly + lh - lw / 2 + 0.03, zF + 0.2] });
        }
      }
    }
    // small attic lights
    for (const x of [-3.4, 3.4]) b.panel(0.5, 0.7, P.windowDark, { at: [x, 7.0, zF + 0.04], facing: '+z', shape: 'round', depth: 0.07 });
    // corbel table under the eaves
    for (let i = 0; i < 22; i++) b.box(0.2, 0.22, 0.3, dress, { at: [-W / 2 + 0.35 + (i * (W - 0.7)) / 21, eaves - 0.42, zF + 0.15] });
    b.box(W, 0.2, 0.42, dress, { at: [0, eaves - 0.2, zF + 0.15] });
    b.box(W, 0.2, 0.3, dress, { at: [0, eaves - 0.2, zB - 0.12] });

    // steep roof of flat tiles; the gable ends are the party walls
    pitched(b, W, D, 4.6, tile, { at: [0, eaves, zc], ridge: 'x', overhang: 0.5, ends: 0, wall: rubble, thick: 0.13, courses: 9 });

    // back: a timber gallery with an outside stair up to the hall, small windows, the yard door
    b.panel(1.1, 2.3, P.oakDark, { at: [-3.5, 0, zB], facing: '-z', shape: 'round' });
    b.panel(0.6, 0.9, P.windowDark, { at: [2.5, 1.4, zB], facing: '-z', shape: 'round' });
    b.panel(0.6, 0.9, P.windowDark, { at: [5.0, 1.4, zB], facing: '-z', shape: 'round' });
    for (const x of [-5.0, -1.0, 3.0]) b.panel(0.7, 1.2, P.windowDark, { at: [x, 5.0, zB], facing: '-z', shape: 'round' });
    b.panel(1.0, 2.2, P.oak, { at: [1.0, g + 0.4, zB], facing: '-z', shape: 'round' });
    const gy = g + 0.35;
    b.box(6.4, 0.18, 1.3, P.oak, { at: [2.2, gy, zB - 0.65] });
    for (const x of [-0.9, 2.2, 5.3]) b.box(0.18, gy, 0.18, P.oak, { at: [x, 0, zB - 1.2] });
    for (let i = 0; i < 16; i++) b.box(0.05, 0.95, 0.05, P.oak, { at: [-0.9 + i * 0.41, gy + 0.18, zB - 1.25] });
    b.box(6.4, 0.08, 0.1, P.oak, { at: [2.2, gy + 1.13, zB - 1.25] });
    b.beam([-0.9, gy + 0.1, zB - 0.65], [-4.9, 0.05, zB - 0.65], 1.0, 0.16, P.oak);
    for (let i = 1; i < 10; i++) {
      const t = i / 10;
      b.box(1.0, 0.06, 0.3, tint(P.oak, 0.06), { at: [-0.9 - 4.0 * t, gy * (1 - t) + 0.06, zB - 0.65], jitter: false });
    }
    b.shed(6.8, 1.6, 0.5, tile, { at: [2.2, gy + 2.4, zB - 0.8], high: '+z' });

    // the yard
    const wall = tint(P.rubble, 0.02);
    yardWall(b, -6.75, zB, -6.75, -8.75, 2.2, wall, tile);
    yardWall(b, 6.75, zB, 6.75, -8.75, 2.2, wall, tile);
    yardWall(b, -6.75, -8.75, 6.75, -8.75, 2.2, wall, tile);
    b.box(13.2, 0.03, 3.0, tint(P.gravel, -0.04), { at: [0, 0, -1.6], jitter: false });
    well(b, [4.2, 0, -4.2], P.pierreBlonde, { frame: 'wood' });
    privy(b, [5.6, 0, -7.8], 0, tint(P.oak, 0.1), tile);
    vegBed(b, -3.0, -6.2, 5.4, 4.2, { rows: 7 });
    washing(b, [-6.2, 1.9, -3.4], [-1.2, 1.9, -3.4], [P.white, P.cream, 0x8a6a4a, P.white, P.cream]);
    b.tree(b.range(3.8, 4.6), { at: [1.4, 0, -7.4], kind: 'round', color: P.leafDark });
  },
};
