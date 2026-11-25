import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, amphora, lin, quayWall, roofRise, waterwheel } from './shared';
import { BUTTRESS_X, buttress, courtArcade, gateColumns, mooringStone, storeBay } from './04-horrea';

/** A ruined wall from (x0, z0) to (x1, z1), broken into stretches of ragged height between hMin and hMax. */
function ruinWall(b: Builder, x0: number, z0: number, x1: number, z1: number, t: number, hMin: number, hMax: number, color: number, y = 0) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(len / 1.4));
  const alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n;
    const r = b.rand();
    const h = hMin + (hMax - hMin) * r * r;
    if (h < 0.25) continue;
    const x = x0 + (x1 - x0) * f;
    const z = z0 + (z1 - z0) * f;
    const seg = len / n + 0.02;
    b.box(alongX ? seg : t, h, alongX ? t : seg, tint(color, b.range(-0.06, 0.03)), { at: [x, y, z] });
  }
}

/**
 * A boat mill as Procopius describes Belisarius’s: two hulls moored side by side a little apart,
 * the wheel hung between them in the current, the millstones in a hut on the larger hull.
 */
function boatMill(b: Builder, x: number, zIn: number, spin: number, roof: number) {
  const L = 8;
  const wa = 2.6; // main hull, toward the bank
  const wb = 1.6; // outrigger hull
  const gap = 1.3;
  const za = zIn - wa / 2;
  const zw = zIn - wa - gap / 2;
  const zb = zIn - wa - gap - wb / 2;
  const hull = (z: number, w: number, len: number) => {
    b.group({ at: [x, WATER - 0.3, z] }, () => {
      b.extrude(
        [
          [-len / 2, 1.0],
          [-len / 2 + 0.9, 0],
          [len / 2 - 0.9, 0],
          [len / 2, 1.0],
        ],
        w,
        P.oakDark,
      );
      b.box(len - 1.6, 0.08, w - 0.1, P.oak, { at: [0, 0.92, 0] });
    });
  };
  hull(za, wa, L);
  hull(zb, wb, L - 1.5);
  const deck = WATER + 0.7;
  // cross-beams tying the hulls together over the wheel
  for (const dx of [-2.8, 2.8]) b.box(0.25, 0.25, wa + gap + wb, P.oak, { at: [x + dx, deck, zIn - (wa + gap + wb) / 2] });
  // the wheel, turned by the current running along the river (+X)
  const r = 2.0;
  waterwheel(b, { at: [x, WATER - 0.55 + r, zw], r, width: gap - 0.3, paddles: 12, spokes: 6, spin, axle: 2.6, axleDir: 1 });
  // the mill hut on the main hull: planked walls, a pitched roof of tiles or shingles
  const hw = 4.2;
  const hd = wa - 0.3;
  const hh = 2.2;
  b.box(hw, hh, hd, tint(P.oak, 0.06), { at: [x, deck, za] });
  for (const dx of lin(6, -hw / 2 + 0.05, hw / 2 - 0.05)) b.box(0.08, hh, hd + 0.04, P.oakDark, { at: [x + dx, deck, za] });
  b.gable(hw, hd, roofRise(hd, 30), roof, { at: [x, deck + hh, za], overhang: 0.3, wall: tint(P.oak, 0.06) });
  b.panel(0.9, 1.7, P.timberBlack, { at: [x + 1.2, deck, za + hd / 2], facing: '+z' });
  b.panel(0.6, 0.5, P.timberBlack, { at: [x - 1.0, deck + 1.2, za + hd / 2], facing: '+z' });
  // the gangplank to the bank
  b.beam([x + 1.2, deck + 0.05, za + hd / 2 + 0.1], [x + 1.2, 0.2, BANK + 0.4], 0.8, 0.08, P.oak);
  // mooring ropes, bow and stern, to stones in the old quay
  for (const dx of [-L / 2 + 0.4, L / 2 - 0.4]) b.beam([x + dx, deck + 0.1, za + 0.6], [x + dx * 1.3, -0.3, BANK - 0.25], 0.05, 0.05, P.wattle);
  // an anchor line out into the stream from the outrigger
  b.beam([x - L / 2 + 1.2, deck, zb], [x - L / 2 - 2.0, WATER, zb - 1.2], 0.05, 0.05, P.wattle);
}

export const floatingMills: BuildingDef = {
  id: 'floating-mills',
  name: 'Boat mills by the ruined warehouse',
  style: 'Late Antique',
  date: 'c. 540',
  summary:
    'In 537 the Goths besieging Rome cut the aqueducts that drove the city’s watermills, and the Byzantine general Belisarius, Procopius tells us, moored pairs of boats in the Tiber, hung waterwheels between them and set millstones on board, so the current ground the corn. ' +
    'Mills like these, which rose and fell with the river and could be moved out of danger, became a common sight on Italian rivers: they worked on the Tiber in Rome until about the 1870s, and on the Po into the twentieth century. ' +
    'On the bank the great warehouse is roofless and half fallen: the grain trade it served has collapsed with the western empire, and its walls are a quarry. ' +
    'A few rooms have been patched up with salvaged tiles as the millers’ store.',
  materials: ['oak hulls', 'timber', 'salvaged Roman brick and tile', 'millstones'],
  lookFor: [
    { label: 'Boat mill', note: 'A hut holding the millstones, built on a hull moored in the current: when the river rose or fell the mill rose and fell with it.', at: [-6, 4.2, -13.0] },
    { label: 'Wheel between two hulls', note: 'The wheel hangs in the gap between the main hull and a smaller outrigger, turned by the river’s flow.', at: [6, 2.0, -15.2] },
    { label: 'Mooring ropes', note: 'Ropes tied to the old Roman mooring stones hold the mills against the current.', at: [-1.5, -0.2, -11.4] },
    { label: 'Ruined warehouse', note: 'The courtyard warehouse stands roofless, its walls robbed for brick, its arcades fallen into heaps of rubble.', at: [-9, 3.0, 1.0] },
    { label: 'Patched storerooms', note: 'A corner of the ruin re-roofed with salvaged tiles on rough timbers to keep the flour dry.', at: [10.5, 5.6, -4.8] },
  ],
  build(b) {
    const brick = tint(P.brickOrange, -0.06);
    const trav = tint(P.travertine, -0.06);
    const pod = 0.9;
    const W = 28;
    const z0 = -7;
    const z1 = 8;
    const dw = 4.2;

    // ---- what is left of the quay: the river wall and its mooring stones, the paving broken
    quayWall(b, tint(trav, -0.04));
    b.box(36.1, 0.2, 1.1, trav, { at: [0, 0.1, BANK + 0.3] });
    for (const x of [-14, -6, 2, 10]) mooringStone(b, x, -0.4, trav);
    b.box(36, 0.05, z0 - BANK, tint(P.earth, 0.06), { at: [0, 0, (z0 + BANK) / 2], jitter: false });
    for (const x of [-12, -3, 8]) b.box(b.range(2, 4), 0.07, 2.2, P.paving, { at: [x, 0, -9.2], jitter: false });

    // ---- the ruined warehouse: its raised base, ragged walls, broken arcades and rubble
    b.box(W + 0.6, pod, z1 - z0 + 0.6, tint(trav, -0.1), { at: [0, 0, (z0 + z1) / 2] });
    // the courtyard paving, weeds growing through it
    b.box(W - 2 * dw, 0.06, z1 - z0 - 2 * dw, P.paving, { at: [0, pod, (z0 + z1) / 2], jitter: false });
    const y = pod;
    ruinWall(b, -W / 2, z1 - 0.3, -4.6, z1 - 0.3, 0.6, 0.4, 4.5, brick, y); // street wall
    ruinWall(b, 4.6, z1 - 0.3, W / 2, z1 - 0.3, 0.6, 0.4, 3.0, brick, y);
    ruinWall(b, -W / 2, z0 + 0.3, W / 2 - 6, z0 + 0.3, 0.6, 0.6, 6.5, brick, y); // river wall
    ruinWall(b, -W / 2 + 0.3, z0, -W / 2 + 0.3, z1, 0.6, 0.5, 5.5, brick, y);
    ruinWall(b, W / 2 - 0.3, z0 + 6, W / 2 - 0.3, z1, 0.6, 0.3, 3.5, brick, y);
    ruinWall(b, -W / 2 + dw, z0 + dw, W / 2 - dw - 4, z0 + dw, 0.5, 0.2, 3.0, brick, y); // inner walls of the ranges
    ruinWall(b, -W / 2 + dw, z1 - dw, W / 2 - dw, z1 - dw, 0.5, 0.2, 2.6, brick, y);
    // three buttresses still stand to their full height on the river side, the rest are stumps
    BUTTRESS_X.forEach((x, i) => {
      if (i === 0 || i === 2 || i === 5) buttress(b, tint(brick, -0.04), x);
      else if (i < 6) b.box(0.8, b.range(0.6, 2.2), 0.6, tint(brick, -0.04), { at: [x, y, z0 - 0.3] });
    });
    // one length of the courtyard arcade survives, and the doorway with its columns
    courtArcade(b, brick, -1);
    gateColumns(b, tint(brick, 0.05), P.travertine);
    b.box(2.4, 3.8, 0.6, brick, { at: [-3.4, y, z1 - 0.3] });
    b.box(2.4, 3.8, 0.6, brick, { at: [3.4, y, z1 - 0.3] });
    b.stairs(5.0, pod, 1.6, 4, trav, { at: [0, 0, z1 + 0.8] });
    // heaps of rubble and fallen tiles, weeds and a fig tree in the ruins
    for (const [x, z, r] of [
      [-9, 3, 1.6],
      [2, 2, 1.3],
      [-2, -4, 1.4],
      [6, 5.5, 1.0],
      [-12, -2, 1.1],
    ] as const) b.blob(r, mix2(brick), { at: [x, y - 0.2, z], stretch: [1.5, 0.45, 1.2], detail: 0 });
    b.tree(4.5, { at: [-4, y, 1], kind: 'round', color: P.leafDark });
    b.tree(2.2, { at: [-11, y + 0.1, 6], kind: 'bush' });
    b.tree(2.0, { at: [8, y + 0.1, 0], kind: 'bush' });

    // ---- the patched corner: the end bay of the river range, still standing to its first floor,
    // re-roofed with salvaged tiles as a store for the millers’ grain and flour
    const px = 10.5;
    const pz = z0 + dw / 2;
    storeBay(b, brick, px, pz, 7, dw);
    b.box(0.8, 4.0, dw + 0.2, tint(P.tufa, -0.05), { at: [px - 3.5, y, pz] }); // a blocking wall of reused stone
    b.gable(7.4, dw + 0.2, roofRise(dw + 0.2, 22), tint(P.romanTile, -0.08), { at: [px, y + 4.0, pz], overhang: 0.35, wall: brick });
    b.panel(1.3, 2.2, P.oakDark, { at: [px + 1.2, y, pz + dw / 2], facing: '+z' });
    b.panel(1.3, 2.2, P.oakDark, { at: [px - 1.0, y, pz - dw / 2], facing: '-z' });
    for (let i = 0; i < 5; i++) b.blob(0.32, P.wattle, { at: [px - 1.4 + (i % 3) * 0.6, y + 0.3, pz + 3.1 + Math.floor(i / 3) * 0.5], stretch: [1, 0.9, 1.2] });
    for (let i = 0; i < 2; i++) amphora(b, [px + 2.8 + i * 0.5, y, pz + 2.9]);
    // a lean-to shelter of poles and thatch against the ruin, where the millers live
    b.shed(5, 3, 1.2, P.thatchOld, { at: [-9, y + 1.6, z0 + 2.0], high: '-z' });
    for (const x of [-11.3, -6.7]) b.cyl(0.08, 1.6, P.oak, { at: [x, y, z0 + 3.3], segs: 5 });
    b.box(1.2, 0.3, 1.0, P.rubble, { at: [-8, y, z0 + 4.4] }); // hearth stones

    // ---- the boat mills
    boatMill(b, -6, BANK - 1.0, b.rand(), P.shingle);
    boatMill(b, 6, BANK - 1.0, b.rand(), tint(P.romanTile, -0.08));
    // sacks waiting at the top of the gangplanks
    for (let i = 0; i < 3; i++) b.blob(0.3, P.wattle, { at: [-4 + i * 0.6, 0.25, BANK + 1.1], stretch: [1, 1.1, 0.8] });

    b.collider(W + 0.6, z1 - z0 + 0.6, { at: [0, 0, (z0 + z1) / 2] });
  },
};

function mix2(c: number): number {
  return tint(c, -0.03);
}
