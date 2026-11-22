import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { columnArcade, ground, tiledGable, tiledShed } from './shared';

// the long hall (pellegrinaio) along the street
const HX0 = -10.4;
const HX1 = 6.4;
const HZ0 = 0.0;
const HZ1 = 6.6;
const HH = 9.0;
// the loggia in front of it
const LZ = 9.4; // line of the columns
const COLH = 2.7;
const ARC = 1.5; // wall height over the capitals
// the chapel at the right-hand end, gable to the street
const CX0 = 6.8;
const CX1 = 10.8;
const CZ0 = -3.4;
const CZ1 = 9.8;
const CH = 9.6;
const AR = 1.7;
// kitchen and infirmary range behind
const KX0 = -10.4;
const KX1 = -1.2;
const KZ0 = -10.6;
const KZ1 = -5.2;
const KH = 6.4;

/** A row of small blind arches under the eaves (the "Lombard band" of Romanesque walls). */
function lombardBand(b: Builder, len: number, y: number, at: [number, number], facing: '+z' | '-z' | '+x' | '-x', color: number): void {
  const n = Math.floor(len / 0.85);
  const along = facing === '+z' || facing === '-z';
  b.group({ at: [at[0], y, at[1]], rotY: facing === '+z' ? 0 : facing === '-z' ? Math.PI : facing === '+x' ? Math.PI / 2 : -Math.PI / 2 }, () => {
    b.panel(len, 0.14, color, { at: [0, 0.55, 0], depth: 0.1 });
    for (const x of spread(n, -len / 2, len / 2)) b.panel(0.5, 0.5, tint(color, -0.12), { at: [x, 0.05, 0], shape: 'round', depth: 0.03 });
  });
  void along;
}

export const pilgrimHospital: BuildingDef = {
  id: 'pilgrim-hospital',
  name: 'Pilgrim hospital',
  style: 'Romanesque',
  date: 'c. 1050 to 1150',
  modelledOn: 'Santa Maria della Scala, Siena (first recorded in 1090), much simplified',
  summary:
    'The town lies on the Via Francigena, the pilgrim road from Canterbury and France to Rome, and the traffic of pilgrims has grown enough to need a proper hospital. ' +
    'A hospital (ospedale) was then a place of hospitality as much as of healing: canons or a lay brotherhood gave a free bed and food to pilgrims, the sick, the poor and abandoned children, paid for by gifts and bequests. ' +
    'Everything is bigger and better built than in the old hostel: a long, tall hall of dressed stone, an arcaded loggia on the street, and a chapel with a bell-gable, all with the round arches and blind arcading of the Romanesque.',
  materials: ['dressed stone (pietraforte)', 'travertine', 'timber roof trusses', 'clay pan-and-cover tiles'],
  lookFor: [
    { label: 'Long hall', note: 'The pellegrinaio, one great room for the pilgrims’ beds, lit by tall round-headed windows high above the loggia roof.', at: [-4.5, 6.6, HZ1 + 0.2] },
    { label: 'Loggia', note: 'An open arcade on columns along the street, where alms and bread were handed out and travellers waited for a bed.', at: [-6.0, 2.2, LZ + 0.5] },
    { label: 'Bell-gable', note: 'A pierced wall above the chapel front carries the bell (a campanile a vela), cheaper than a tower.', at: [(CX0 + CX1) / 2, CH + 2.6, CZ1 + 0.3] },
    { label: 'Lombard band', note: 'A row of small blind arches under the eaves, the favourite ornament of Romanesque builders in northern and central Italy.', at: [-1.5, HH - 0.2, HZ1 + 0.3] },
    { label: 'Ladder and cross', note: 'The hospital’s sign carved over the door: a ladder under a cross, as in the arms of Santa Maria della Scala in Siena.', at: [-1.0, 3.6, LZ + 0.4] },
  ],
  build(b) {
    const stone = b.pick([P.pietraForte, tint(P.pietraForte, 0.04), P.limestoneWarm]);
    const trav = P.travertine;
    const tile = b.pick([P.coppi, tint(P.coppi, -0.04)]);
    const wood = P.oakDark;

    ground(b, 21.6, 1.0, P.cobble, [0, 10.3], 0.06);
    ground(b, 20.6, 10.8, tint(P.earth, 0.05), [0, -5.2], 0.03);

    // ---------------- the long hall
    const hz = (HZ0 + HZ1) / 2;
    b.box(HX1 - HX0, HH, HZ1 - HZ0, stone, { at: [(HX0 + HX1) / 2, 0, hz] });
    b.box(HX1 - HX0 + 0.1, 0.5, HZ1 - HZ0 + 0.1, trav, { at: [(HX0 + HX1) / 2, 0, hz] });
    // pilaster strips dividing the bays on both long sides
    for (const x of spread(7, HX0, HX1).map((x) => x - (HX1 - HX0) / 14)) {
      if (x <= HX0 + 0.1) continue;
      b.box(0.5, HH - 0.6, 0.12, stone, { at: [x, 0, HZ1 + 0.06] });
      b.box(0.5, HH - 0.6, 0.12, stone, { at: [x, 0, HZ0 - 0.06] });
    }
    lombardBand(b, HX1 - HX0 - 0.2, HH - 0.75, [(HX0 + HX1) / 2, HZ1], '+z', stone);
    for (const x of spread(7, HX0, HX1)) {
      b.window(0.8, 1.7, { at: [x, 6.25, HZ1], facing: '+z', shape: 'round', frame: trav, border: 0.12 });
      b.window(0.8, 2.0, { at: [x, 5.3, HZ0], facing: '-z', shape: 'round', frame: trav, border: 0.12 });
      b.window(0.6, 0.9, { at: [x, 1.6, HZ0], facing: '-z', shape: 'round', frame: trav, border: 0.1 });
    }
    b.window(1.4, 1.4, { at: [HX0, 6.0, hz], facing: '-x', shape: 'circle', frame: trav, border: 0.15 });
    tiledGable(b, HX1 - HX0, HZ1 - HZ0, ((HZ1 - HZ0) / 2) * 0.42, tile, { at: [(HX0 + HX1) / 2, HH, hz], overhang: 0.45, wall: stone, step: 1.0 });
    // doors from the hall to the yard behind
    b.panel(1.4, 2.6, wood, { at: [-5.0, 0, HZ0], facing: '-z', shape: 'round' });
    b.panel(1.8, 2.9, trav, { at: [-5.0, 0, HZ0], facing: '-z', shape: 'round', depth: 0.04 });

    // ---------------- the loggia: arches on columns, a lean-to roof against the hall
    const llen = HX1 - HX0;
    const lmid = (HX0 + HX1) / 2;
    b.box(llen, 0.3, LZ - HZ1 + 0.3, trav, { at: [lmid, 0, (LZ + HZ1) / 2], jitter: false });
    columnArcade(b, llen, 7, COLH, ARC, stone, { at: [lmid, 0.3, LZ], colColor: trav, r: 0.22, order: 'corinthian', t: 0.5 });
    b.box(llen + 0.1, 0.2, 0.6, trav, { at: [lmid, 0.3 + COLH + ARC, LZ] });
    tiledShed(b, llen, LZ - HZ1 + 0.7, 1.3, tile, { at: [lmid, 0.5 + COLH + ARC, (LZ + HZ1) / 2 + 0.35], high: '-z', step: 1.0 });
    // the hall's main door and the ladder-and-cross sign over it, inside the loggia
    b.panel(1.8, 3.2, wood, { at: [-1.0, 0.3, HZ1], facing: '+z', shape: 'round' });
    b.panel(2.4, 3.6, trav, { at: [-1.0, 0.3, HZ1], facing: '+z', shape: 'round', depth: 0.04 });
    b.group({ at: [-1.0, 3.95, HZ1 + 0.06] }, () => {
      b.sym((s) => b.box(0.08, 0.9, 0.06, P.white, { at: [s * 0.22, 0, 0] }));
      for (const y of [0.15, 0.4, 0.65]) b.box(0.44, 0.06, 0.06, P.white, { at: [0, y, 0] });
      b.box(0.08, 0.5, 0.06, P.white, { at: [0, 0.9, 0] });
      b.box(0.3, 0.07, 0.06, P.white, { at: [0, 1.15, 0] });
    });
    // benches along the hall wall in the loggia
    b.box(llen - 4, 0.45, 0.45, trav, { at: [lmid - 1.0, 0.3, HZ1 + 0.25] });

    // ---------------- the chapel
    const cxm = (CX0 + CX1) / 2;
    const cw = CX1 - CX0;
    const cz = (CZ0 + CZ1) / 2;
    const crise = (cw / 2) * 0.45;
    b.box(cw, CH, CZ1 - CZ0, stone, { at: [cxm, 0, cz] });
    b.box(cw + 0.1, 0.5, CZ1 - CZ0 + 0.1, trav, { at: [cxm, 0, cz] });
    tiledGable(b, cw, CZ1 - CZ0, crise, tile, { at: [cxm, CH, cz], ridge: 'z', overhang: 0.35, wall: stone, step: 1.0 });
    // apse at the back
    b.lathe([[AR, 0], [AR, CH - 2.2]], stone, { at: [cxm, 0, CZ0], start: Math.PI / 2, sweep: Math.PI, segs: 10 });
    b.lathe([[AR + 0.3, CH - 2.3], [0.05, CH - 2.3 + AR * 0.45]], tile, { at: [cxm, 0, CZ0], start: Math.PI / 2, sweep: Math.PI, segs: 10 });
    for (const a of [Math.PI - 0.6, Math.PI, Math.PI + 0.6]) {
      b.window(0.4, 1.2, { at: [cxm + Math.sin(a) * AR, 3.6, CZ0 + Math.cos(a) * AR], facing: a, shape: 'round', frame: trav, border: 0.08 });
    }
    // front: stepped round-arched portal with a lunette, an oculus, corner pilasters and blind arches
    for (const [w, h, d, c] of [[2.6, 3.9, 0.04, trav], [2.2, 3.6, 0.08, stone], [1.8, 3.3, 0.12, trav]] as const) {
      b.panel(w, h, c, { at: [cxm, 0.5, CZ1], facing: '+z', shape: 'round', depth: d });
    }
    b.panel(1.5, 2.4, wood, { at: [cxm, 0.5, CZ1], facing: '+z', depth: 0.15 });
    b.panel(1.5, 0.75, tint(trav, -0.15), { at: [cxm, 2.95, CZ1], facing: '+z', shape: 'round', depth: 0.14 });
    b.window(1.3, 1.3, { at: [cxm, 5.6, CZ1], facing: '+z', shape: 'circle', frame: trav, border: 0.16 });
    b.sym((s) => b.box(0.4, CH, 0.14, trav, { at: [cxm + s * (cw / 2 - 0.2), 0, CZ1 + 0.07] }));
    lombardBand(b, cw - 0.8, CH - 0.7, [cxm, CZ1], '+z', stone);
    b.window(0.45, 1.3, { at: [CX1, 4.8, 3.0], facing: '+x', shape: 'round', frame: trav });
    b.window(0.45, 1.3, { at: [CX1, 4.8, -1.0], facing: '+x', shape: 'round', frame: trav });
    // bell-gable over the front, with its bell
    const by = CH + crise - 0.4;
    b.extrude(
      [[-0.9, 0], [0.9, 0], [0.9, 1.9], [0, 2.6], [-0.9, 1.9]],
      0.4,
      stone,
      { at: [cxm, by, CZ1 - 0.2], holes: [[[-0.45, 0.5], [0.45, 0.5], [0.45, 1.3], [0.32, 1.6], [0, 1.75], [-0.32, 1.6], [-0.45, 1.3]]] },
    );
    b.lathe([[0, 0], [0.3, 0], [0.24, 0.12], [0.17, 0.42], [0.08, 0.52], [0, 0.52]], P.bronze, { at: [cxm, by + 0.85, CZ1 - 0.2], segs: 8 });
    b.box(0.08, 0.3, 0.08, P.iron, { at: [cxm, by + 2.6, CZ1 - 0.2] });

    // ---------------- kitchen and infirmary range behind
    const kxm = (KX0 + KX1) / 2;
    const kz = (KZ0 + KZ1) / 2;
    b.box(KX1 - KX0, KH, KZ1 - KZ0, stone, { at: [kxm, 0, kz] });
    tiledGable(b, KX1 - KX0, KZ1 - KZ0, ((KZ1 - KZ0) / 2) * 0.42, tile, { at: [kxm, KH, kz], overhang: 0.4, wall: stone, step: 1.0 });
    for (const x of spread(4, KX0, KX1)) {
      b.window(0.7, 1.3, { at: [x, 3.9, KZ1], facing: '+z', shape: 'round', frame: trav });
      b.window(0.7, 1.3, { at: [x, 3.9, KZ0], facing: '-z', shape: 'round', frame: trav });
    }
    b.panel(1.2, 2.3, wood, { at: [-7.6, 0, KZ1], facing: '+z', shape: 'round' });
    b.panel(1.2, 2.3, wood, { at: [-3.4, 0, KZ1], facing: '+z', shape: 'round' });
    // outside stair to the infirmary floor
    b.stairs(1.0, 3.2, 3.2, 12, stone, { at: [KX1 + 0.6, 0, KZ1 - 2.0], rotY: Math.PI / 2 });
    b.panel(0.9, 2.1, wood, { at: [KX1, 3.2, KZ1 - 0.9], facing: '+x' });
    b.box(1.0, 0.12, 1.2, stone, { at: [KX1 + 0.5, 3.1, KZ1 - 0.9] });

    // ---------------- the yard: back wall, well, herb garden, a mule-drawn cart's worth of firewood
    b.box(CX1 - KX1, 3.0, 0.5, stone, { at: [(KX1 + CX1) / 2, 0, KZ0 + 0.25] });
    b.box(0.5, 3.0, CZ0 - AR - KZ0, stone, { at: [CX1 - 0.25, 0, (CZ0 - AR + KZ0) / 2] });
    b.box(CX1 - KX1 + 0.1, 0.12, 0.6, tile, { at: [(KX1 + CX1) / 2, 3.0, KZ0 + 0.25] });
    b.cyl(0.65, 0.95, trav, { at: [1.8, 0, -3.2], segs: 8 });
    b.cyl(0.5, 0.05, P.windowDark, { at: [1.8, 0.93, -3.2], segs: 8 });
    b.sym((s) => b.box(0.15, 1.4, 0.15, stone, { at: [1.8 + s * 0.6, 0.9, -3.2] }));
    b.box(1.5, 0.15, 0.25, stone, { at: [1.8, 2.3, -3.2] });
    for (const z of [-6.0, -7.6, -9.2]) {
      b.box(5.0, 0.2, 1.1, P.soil, { at: [4.4, 0, z], jitter: false });
      for (const x of spread(6, 2.2, 6.6)) b.blob(0.28, b.pick([P.olive, P.leaf, P.leafDark]), { at: [x, 0.22, z], stretch: [1, 0.7, 1], detail: 0 });
    }
    for (let i = 0; i < 8; i++) b.log(0.1, 1.2, tint(P.bark, (i % 3) * 0.05), { at: [-0.4 + (i % 4) * 0.22, i > 3 ? 0.2 : 0, -6.2], axis: 'z', segs: 5 });
    b.tree(6, { at: [-2.0, 0, -3.0], kind: 'olive' });
    b.tree(9, { at: [9.2, 0, -8.6], kind: 'cypress' });

    // ---------------- colliders: hall, chapel, back range, yard walls (the loggia is open to walk in)
    b.collider(HX1 - HX0, HZ1 - HZ0, { at: [(HX0 + HX1) / 2, 0, hz] });
    b.collider(cw, CZ1 - CZ0 + AR, { at: [cxm, 0, cz - AR / 2] });
    b.collider(KX1 - KX0, KZ1 - KZ0, { at: [kxm, 0, kz] });
    b.collider(CX1 - KX1, 0.5, { at: [(KX1 + CX1) / 2, 0, KZ0 + 0.25] });
  },
};
