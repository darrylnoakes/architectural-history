import { P, tint, type BuildingDef } from '@ah/kit';
import { BANK, BED, END, hump, band, bar, elevation, archCurve, archRing, cutwaterPier, type Opening } from './shared';

export const medievalStoneBridge: BuildingDef = {
  id: 'medieval-stone-bridge',
  name: 'Stone bridge with chapel',
  style: 'Gothic',
  date: 'c. 1250, chapel 14th century',
  summary:
    'From about 1200 English towns rebuilt their timber bridges in stone, paid for by tolls, gifts and indulgences: helping to mend a bridge was counted a pious work. ' +
    'The arches are pointed, which throws less sideways thrust on the piers than a round arch of the same span, and the piers have triangular cutwaters carried up to the road as refuges where people on foot could step aside from carts. ' +
    'A little chapel stands on one pier, where a priest prayed for travellers and for the benefactors who paid for the bridge.',
  materials: ['coursed limestone', 'ashlar dressings', 'lead'],
  modelledOn: 'The bridge chapels at Wakefield (St Mary, 1340s) and St Ives, Cambridgeshire (1420s)',
  lookFor: [
    { label: 'Pointed arch', note: 'Each arch is two arcs meeting at a point, the Gothic arch used in churches of the same years.', at: [0, 1.8, -6.1] },
    { label: 'Cutwater', note: 'The triangular end of a pier, pointing into the current so floods part around it.', at: [-3.4, 0.2, -3.1] },
    { label: 'Pedestrian refuge', note: 'The cutwater is carried up to the road, making a recess in the parapet where walkers can wait for a cart to pass.', at: [-2.6, 3.4, -3.1] },
    { label: 'Bridge chapel', note: 'A chantry chapel on the pier; the priest also collected alms and tolls for the upkeep of the bridge.', at: [4.4, 7.4, 3.1] },
    { label: 'Arch ring', note: 'Dressed stone voussoirs, wedge-shaped blocks, form the ring of each arch; the walls around it are rougher coursed rubble.', at: [-2.1, 1.0, 1.9] },
  ],
  influences: ['french-gothic'],
  build(b) {
    b.noCollide();
    const W = 4.0; // overall width; roadway about 3.2 between parapets
    const crown = 2.6;
    const f = hump(crown);
    b.deck(W - 0.8, 26, crown, { yEnds: 0 });
    const rubble = b.pick([P.limestone, P.ragstone, tint(P.limestone, -0.03)]);
    const ashlar = tint(P.limestoneWarm, 0.04);
    const piers = [-3.1, 3.1];
    const pierT = 2.2;
    const spring = -0.9;
    const ops: Opening[] = [
      { z0: -BANK, z1: piers[0] - pierT / 2, spring, rise: 2.15, kind: 'pointed' },
      { z0: piers[0] + pierT / 2, z1: piers[1] - pierT / 2, spring, rise: 2.35, kind: 'pointed' },
      { z0: piers[1] + pierT / 2, z1: BANK, spring, rise: 2.15, kind: 'pointed' },
    ];

    // the bridge body: spandrels, piers and abutments in one elevation
    elevation(b, { width: W, color: rubble, top: f, openings: ops, n: 30 });
    // arch rings of dressed voussoirs on both faces
    b.sym((s) => {
      for (const op of ops) archRing(b, archCurve(op.z0, op.z1, op.spring, op.rise, op.kind, 12), 0.42, 0.1, ashlar, s * (W / 2 + 0.03));
    });
    // road surface and a string course marking the road level
    band(b, 0, W - 0.8, -END, END, (z) => f(z) - 0.06, (z) => f(z) + 0.01, P.gravel, 26);
    b.sym((s) => band(b, s * (W / 2 + 0.04), 0.12, -END + 0.5, END - 0.5, (z) => f(z) - 0.22, (z) => f(z) - 0.04, ashlar, 26));

    // cutwaters on both faces, carried up to road level as refuges
    const nose = 1.7;
    for (const z of piers) {
      cutwaterPier(b, { z, len: W, thick: pierT, nose, y0: BED - 0.1, h: f(z) - BED + 0.1, color: rubble });
    }

    // parapets, broken at each refuge, with a coping
    const parH = 1.0;
    const gaps = piers.map((z) => [z - pierT / 2, z + pierT / 2]);
    b.sym((s) => {
      const x = s * (W / 2 - 0.2);
      const runs: [number, number][] = [[-END + 0.6, gaps[0][0]], [gaps[0][1], gaps[1][0]], [gaps[1][1], END - 0.6]];
      for (const [z0, z1] of runs) {
        band(b, x, 0.4, z0, z1, (z) => f(z) - 0.05, (z) => f(z) + parH, rubble, 10);
        band(b, x, 0.5, z0, z1, (z) => f(z) + parH, (z) => f(z) + parH + 0.12, ashlar, 10);
      }
      // refuge parapets following the cutwater (skipped where the chapel stands)
      for (const z of piers) {
        if (s > 0 && z > 0) continue;
        const y = f(z);
        const tip = s * (W / 2 + nose - 0.25);
        b.sym((t) => {
          bar(b, [x, y + parH / 2, z + t * (pierT / 2)], [tip, y + parH / 2, z], [0.4, parH + 0.1], rubble);
          bar(b, [x, y + parH + 0.06, z + t * (pierT / 2)], [tip, y + parH + 0.06, z], [0.5, 0.12], ashlar);
        });
      }
      // end piers where the parapets finish on the banks
      b.box(0.6, 1.3, 0.6, ashlar, { at: [x, f(s * (END - 0.6)) - 0.05, s * (END - 0.6)] });
    });

    // ---- the chapel on the downstream side of one pier
    const cz = piers[1];
    const x0 = W / 2; // chapel west wall meets the bridge
    const L = 4.2; // length along X (east-west)
    const cw = 2.8; // width along Z
    const floor = f(cz);
    const wallH = 3.4;
    const xc = x0 + L / 2;
    // the pier is extended downstream to carry it, with its own cutwater
    b.box(L, floor - BED + 0.1, pierT, rubble, { at: [xc, BED - 0.1, cz] });
    b.group({ at: [x0 + L, 0, 0] }, () => {
      cutwaterPier(b, { z: cz, len: 0.01, thick: pierT, nose: 0.75, y0: BED - 0.1, h: floor - 0.8 - BED, color: rubble });
    });
    // corbel table where the walls oversail the pier
    b.box(L + 0.2, 0.25, cw + 0.1, ashlar, { at: [xc, floor - 0.25, cz] });
    // walls, buttresses, roof
    b.box(L, wallH, cw, rubble, { at: [xc, floor, cz] });
    b.gable(L, cw, 1.9, P.lead, { at: [xc, floor + wallH, cz], ridge: 'x', overhang: 0.15, wall: rubble });
    b.sym((t) => {
      b.box(0.4, wallH * 0.75, 0.35, ashlar, { at: [x0 + L - 0.2, floor, cz + t * (cw / 2 + 0.17)] });
      b.box(0.4, wallH * 0.75, 0.35, ashlar, { at: [x0 + 1.9, floor, cz + t * (cw / 2 + 0.17)] });
      b.window(0.7, 1.9, { at: [x0 + 1.0, floor + 1.0, cz + t * (cw / 2)], facing: t > 0 ? '+z' : '-z', shape: 'pointed', frame: ashlar });
      b.window(0.7, 1.9, { at: [x0 + 3.2, floor + 1.0, cz + t * (cw / 2)], facing: t > 0 ? '+z' : '-z', shape: 'pointed', frame: ashlar });
    });
    // east window with Y-tracery, and a gable cross
    b.window(1.3, 2.5, { at: [x0 + L, floor + 0.9, cz], facing: '+x', shape: 'pointed', frame: ashlar, bars: [2, 1] });
    b.box(0.12, 0.6, 0.12, ashlar, { at: [x0 + L, floor + wallH + 1.85, cz] });
    b.box(0.12, 0.12, 0.45, ashlar, { at: [x0 + L, floor + wallH + 2.2, cz] });
    // west front on the roadway: pointed doorway and a bellcote
    b.panel(1.0, 2.2, P.oakDark, { at: [x0, floor, cz], facing: '-x', shape: 'pointed' });
    b.panel(1.3, 2.4, ashlar, { at: [x0, floor, cz], facing: '-x', shape: 'pointed', depth: 0.03 });
    b.group({ at: [x0 + 0.2, floor + wallH + 1.6, cz] }, () => {
      b.box(0.4, 1.0, 0.9, ashlar);
      b.panel(0.4, 0.6, P.windowDark, { at: [-0.2, 0.2, 0], facing: '-x', shape: 'pointed' });
      b.gable(0.5, 1.0, 0.45, P.lead, { at: [0, 1.0, 0], ridge: 'z' });
    });
  },
};
