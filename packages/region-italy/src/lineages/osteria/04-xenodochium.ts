import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bigJar, ground, tiledGable } from './shared';

// the hall across the back of the plot
const HX0 = -10;
const HX1 = 10;
const HZ0 = -10.2;
const HZ1 = -3.6;
const HH = 5.0;
// the chapel on the right, its apse toward the street
const CX0 = 5.4;
const CX1 = 10.0;
const CZ0 = -2.4;
const CZ1 = 4.6;
const CH = 5.6;
const AR = 1.9; // apse radius
const ZW = 10.0; // front (street) wall of the enclosure

/** A wall box in rubble with bands of reused brick every so often (opus listatum). */
function banded(b: Builder, w: number, h: number, d: number, at: [number, number, number], stone: number, brick: number): void {
  b.box(w, h, d, stone, { at });
  for (let y = 0.9; y < h - 0.3; y += 1.1) {
    b.box(w + 0.03, 0.2, d + 0.03, brick, { at: [at[0], at[1] + y, at[2]], jitter: false });
  }
}

export const xenodochium: BuildingDef = {
  id: 'xenodochium',
  name: 'Xenodochium',
  style: 'Late Antique',
  date: 'c. AD 500',
  summary:
    'The town has shrunk and the bars have closed, but the Church has taken up the old duty of welcoming strangers. ' +
    'A xenodochium (from the Greek for "receiving strangers") gave pilgrims, travellers and the poor a bed and a meal; bishops, popes and rich Christians founded them as acts of charity, and the Liber Pontificalis credits Pope Symmachus (498 to 514) with lodgings for the poor beside St Peter’s and other basilicas of Rome. ' +
    'It is built from the ruins of the Roman town round a walled yard: a long plain hall to sleep and eat in, a small chapel, a well.',
  materials: ['tufa rubble', 'reused Roman brick', 'reused marble', 'fired clay roof tiles'],
  lookFor: [
    { label: 'Hall', note: 'One long room where guests slept on pallets along the walls and ate together, lit by small windows set high up.', at: [-4, 3.8, HZ1 + 0.2] },
    { label: 'Chapel and apse', note: 'Prayer came with the bed. The rounded apse held the altar, lit by three small windows.', at: [(CX0 + CX1) / 2, 3.2, CZ1 + AR + 0.2] },
    { label: 'Opus listatum', note: 'Rough tufa blocks laid in bands between courses of brick salvaged from ruined buildings: quick, cheap walling typical of the age.', at: [HX0 - 0.1, 2.0, -6.5] },
    { label: 'Spolia', note: 'Two Roman columns and a marble lintel frame the gate, and the well-head is an old altar drum: reusing the ruins was cheaper than quarrying.', at: [-2.3, 2.4, ZW + 0.3] },
    { label: 'Well', note: 'Water for washing feet, a work of charity the guests could expect on arrival.', at: [-3.5, 1.0, 2.6] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.tufa, tint(P.tufa, 0.04), tint(P.tufa, -0.03)]);
    const brick = b.pick([P.brickOrange, P.cotto, tint(P.brickOrange, -0.06)]);
    const tile = b.pick([P.romanTile, P.coppi, tint(P.romanTile, -0.06)]);
    const wood = P.oakDark;
    const marble = P.marble;

    ground(b, 20, ZW - HZ1, tint(P.earth, 0.05), [0, (ZW + HZ1) / 2], 0.03);

    // ---------------- the hall
    const hz = (HZ0 + HZ1) / 2;
    banded(b, HX1 - HX0, HH, HZ1 - HZ0, [0, 0, hz], stone, brick);
    tiledGable(b, HX1 - HX0, HZ1 - HZ0, ((HZ1 - HZ0) / 2) * 0.45, tile, { at: [0, HH, hz], overhang: 0.4, wall: stone, step: 0.9 });
    // small high round-headed windows on both long sides, doors to the yard
    for (const x of spread(8, HX0 + 0.5, HX1 - 0.5)) {
      b.window(0.55, 1.0, { at: [x, 3.2, HZ1], facing: '+z', shape: 'round', frame: brick, border: 0.1 });
      b.window(0.55, 1.0, { at: [x, 3.2, HZ0], facing: '-z', shape: 'round', frame: brick, border: 0.1 });
    }
    for (const x of [-6.2, 1.0]) {
      b.panel(1.3, 2.4, wood, { at: [x, 0, HZ1], facing: '+z', shape: 'round' });
      b.panel(1.7, 2.65, brick, { at: [x, 0, HZ1], facing: '+z', shape: 'round', depth: 0.04 });
    }
    b.sym((s) => b.window(0.6, 1.1, { at: [s * HX1, 3.4, hz], facing: s > 0 ? '+x' : '-x', shape: 'round', frame: brick, border: 0.1 }));
    // a lean-to porch along the yard face: benches for those waiting
    const pz = HZ1 + 1.4;
    for (const x of spread(6, -9.0, 4.5)) b.box(0.2, 2.6, 0.2, wood, { at: [x, 0, pz] });
    b.box(13.8, 0.18, 0.22, wood, { at: [-2.25, 2.6, pz] });
    b.shed(14.4, 1.8, 0.6, tile, { at: [-2.25, 2.75, HZ1 + 0.8], high: '-z' });
    b.box(13, 0.45, 0.45, stone, { at: [-2.25, 0, HZ1 + 0.35] });

    // ---------------- the chapel
    const cz = (CZ0 + CZ1) / 2;
    const cxm = (CX0 + CX1) / 2;
    const cw = CX1 - CX0;
    banded(b, cw, CH, CZ1 - CZ0, [cxm, 0, cz], stone, brick);
    // apse: a half drum with a half-cone roof
    b.lathe([[AR, 0], [AR, CH - 1.2]], stone, { at: [cxm, 0, CZ1], start: -Math.PI / 2, sweep: Math.PI, segs: 10 });
    for (let y = 0.9; y < CH - 1.5; y += 1.1) {
      b.lathe([[AR + 0.02, y], [AR + 0.02, y + 0.2]], brick, { at: [cxm, 0, CZ1], start: -Math.PI / 2, sweep: Math.PI, segs: 10 });
    }
    b.lathe([[AR + 0.3, CH - 1.3], [0.05, CH - 1.3 + AR * 0.45]], tile, { at: [cxm, 0, CZ1], start: -Math.PI / 2, sweep: Math.PI, segs: 10 });
    for (const a of [-0.7, 0, 0.7]) {
      b.window(0.4, 0.9, { at: [cxm + Math.sin(a) * AR, 2.4, CZ1 + Math.cos(a) * AR], facing: a, shape: 'round', frame: brick, border: 0.08 });
    }
    tiledGable(b, cw, CZ1 - CZ0, (cw / 2) * 0.45, tile, { at: [cxm, CH, cz], ridge: 'z', overhang: 0.35, wall: stone, step: 0.9 });
    // west door from the yard, under a reused lintel, and side windows
    b.panel(1.2, 2.3, wood, { at: [CX0, 0, cz - 1.2], facing: '-x' });
    b.panel(1.6, 0.25, marble, { at: [CX0, 2.3, cz - 1.2], facing: '-x', depth: 0.1 });
    b.panel(1.6, 2.3, stone, { at: [CX0, 0, cz - 1.2], facing: '-x', depth: 0.03 });
    b.window(0.45, 1.0, { at: [CX0, 3.4, cz + 1.6], facing: '-x', shape: 'round', frame: brick });
    b.window(0.45, 1.0, { at: [CX1, 3.4, cz], facing: '+x', shape: 'round', frame: brick });
    // a cross on the gable over the yard end
    b.box(0.12, 0.9, 0.12, P.iron, { at: [cxm, CH + (cw / 2) * 0.45 + 0.1, CZ0 - 0.2] });
    b.box(0.5, 0.1, 0.1, P.iron, { at: [cxm, CH + (cw / 2) * 0.45 + 0.65, CZ0 - 0.2] });

    // ---------------- the enclosure wall, with a gate of reused columns
    const ww = 2.8;
    const gx = -2.3;
    const gw = 2.2;
    const wallSeg = (x0: number, x1: number, z0: number, z1: number) => {
      b.box(x1 - x0, ww, z1 - z0, stone, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2] });
      b.box(x1 - x0 + 0.12, 0.15, z1 - z0 + 0.12, brick, { at: [(x0 + x1) / 2, ww, (z0 + z1) / 2], jitter: false });
      b.collider(x1 - x0, z1 - z0, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2] });
    };
    wallSeg(-10, gx - gw / 2, ZW - 0.5, ZW);
    wallSeg(gx + gw / 2, 10, ZW - 0.5, ZW);
    wallSeg(-10, -9.5, HZ1, ZW - 0.5);
    wallSeg(9.5, 10, CZ1 + AR, ZW - 0.5);
    // the gate: two columns, a marble lintel and a little tiled roof
    b.sym((s) => {
      b.column(0.2, 2.6, b.pick([marble, P.marbleGreen]), { at: [gx + s * (gw / 2 + 0.25), 0, ZW + 0.25], order: 'plain' });
      b.box(0.55, 3.4, 0.6, stone, { at: [gx + s * (gw / 2 + 0.25), 0, ZW - 0.25] });
    });
    b.box(gw + 1.3, 0.4, 0.7, marble, { at: [gx, 2.6, ZW + 0.05] });
    b.box(gw + 1.3, 0.4, 0.6, stone, { at: [gx, 3.0, ZW - 0.2] });
    b.gable(gw + 1.6, 1.4, 0.5, tile, { at: [gx, 3.4, ZW - 0.05], overhang: 0.15, wall: stone });
    b.panel(0.3, 0.3, brick, { at: [gx, 2.68, ZW + 0.4], facing: '+z', shape: 'circle', depth: 0.03 });
    b.box(gw, 0.06, 1.2, marble, { at: [gx, 0, ZW], jitter: false });

    // ---------------- the yard: well on an old altar drum, a garden, spolia, a fig tree
    b.cyl(0.6, 0.9, marble, { at: [-3.5, 0, 2.6], segs: 10 });
    b.cyl(0.62, 0.12, tint(marble, -0.08), { at: [-3.5, 0.5, 2.6], segs: 10 });
    b.cyl(0.45, 0.05, P.windowDark, { at: [-3.5, 0.88, 2.6], segs: 10 });
    b.sym((s) => b.box(0.1, 1.2, 0.1, P.iron, { at: [-3.5 + s * 0.55, 0.9, 2.6] }));
    b.box(1.2, 0.08, 0.08, P.iron, { at: [-3.5, 2.05, 2.6] });
    // vegetable beds
    for (const z of [2.0, 4.0, 6.0, 8.0]) {
      b.box(4.4, 0.2, 1.3, P.soil, { at: [-7.0, 0, z], jitter: false });
      for (const x of spread(5, -8.8, -5.2)) b.blob(0.3, b.pick([P.leaf, P.leafDark, P.grass]), { at: [x, 0.25, z], stretch: [1, 0.6, 1], detail: 0 });
    }
    // fallen column drums and a stack of reused blocks
    b.log(0.32, 2.4, marble, { at: [2.6, 0, 7.6], rotY: 0.3, segs: 9 });
    b.log(0.3, 1.0, tint(marble, -0.05), { at: [4.0, 0, 6.4], rotY: 1.1, segs: 9 });
    b.box(1.6, 0.5, 0.8, P.travertine, { at: [2.0, 0, 5.6], rotY: 0.2 });
    b.box(1.2, 0.5, 0.7, P.travertine, { at: [2.1, 0.5, 5.6], rotY: 0.35 });
    bigJar(b, [3.2, 0, -2.6], 1.0, P.terracotta);
    bigJar(b, [3.9, 0, -2.2], 0.8, tint(P.terracotta, 0.05));
    b.tree(5, { at: [1.5, 0, 1.0], kind: 'round', color: P.leafDark });

    b.collider(HX1 - HX0, HZ1 - HZ0 + 0.4, { at: [0, 0, hz + 0.2] });
    b.collider(cw, CZ1 - CZ0 + AR, { at: [cxm, 0, cz + AR / 2] });
  },
};
