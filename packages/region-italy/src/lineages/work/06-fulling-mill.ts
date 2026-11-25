import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, RACE_Z, WATER, coppiRoof, lin, millRace, quayWall, roofRise, waterwheel } from './shared';

/** A tenter frame along X, `len` long, with a length of cloth stretched on it. */
export function tenter(b: Builder, x: number, z: number, len: number, cloth: number, timber: number = P.oak) {
  const posts = Math.round(len / 2) + 1;
  for (const px of lin(posts, x - len / 2, x + len / 2)) b.box(0.12, 1.9, 0.12, timber, { at: [px, 0, z] });
  b.box(len + 0.2, 0.12, 0.14, timber, { at: [x, 1.75, z] });
  b.box(len + 0.2, 0.1, 0.14, timber, { at: [x, 0.3, z] });
  b.box(len - 0.5, 1.3, 0.03, cloth, { at: [x, 0.42, z + 0.08], jitter: false });
}

/** A pair of fulling stocks: two heavy hammers on long hafts, pivoted at the back, over a trough. */
export function fullingStocks(b: Builder, x: number, z: number, y = 0) {
  b.box(1.6, 0.7, 1.0, P.oakDark, { at: [x, y, z + 0.6] }); // the trough (pila)
  b.sym((s) => b.box(0.25, 2.0, 0.25, P.oak, { at: [x + s * 0.75, y, z - 1.4] })); // frame posts
  b.box(1.8, 0.2, 0.25, P.oak, { at: [x, y + 1.9, z - 1.4] });
  for (const dx of [-0.38, 0.38]) {
    // haft pivoted on the frame, head raised by a cam on the shaft and dropping into the trough
    b.beam([x + dx, y + 1.5, z - 1.4], [x + dx, y + 1.2, z + 0.4], 0.14, 0.14, P.oak);
    b.box(0.32, 0.7, 0.55, P.oak, { at: [x + dx, y + 0.7, z + 0.5], rot: [0.3, 0, 0] });
  }
}

export const fullingMill: BuildingDef = {
  id: 'fulling-mill',
  name: 'Fulling mill (gualchiera)',
  style: 'Romanesque',
  date: 'c. 1150',
  summary:
    'As the town grew rich again in the twelfth century, its cloth makers put the river back to work. ' +
    'A weir of stakes and stone (pescaia) holds up the water and turns part of it into a channel along the bank, where undershot wheels drive a shaft with cams that lift and drop heavy wooden hammers. ' +
    'The hammers pound the woven woollen cloth in troughs of water and fuller’s earth, felting and thickening it: work that Roman fullers did with their feet. ' +
    'The mill is solid stone, with a tower for the miller, because such a valuable machine was owned by a monastery, a noble family or the commune and was worth defending.',
  materials: ['rubble stone', 'squared stone quoins', 'coppi roof tiles', 'oak'],
  lookFor: [
    { label: 'Undershot wheels', note: 'Paddles dipping into the fast water of the channel are pushed round by the current.', at: [-4.5, 1.8, -13.0] },
    { label: 'Fulling stocks', note: 'Cams on the wheel shaft lift the wooden hammers, which fall again and again on the wet cloth in the trough.', at: [7.6, 2.4, -3.0] },
    { label: 'Weir (pescaia)', note: 'A low dam slanting across the river raises the water and steers it into the mill channel.', at: [-16.2, -0.6, -19.5] },
    { label: 'Mill channel', note: 'A stone wall built out in the riverbed makes a channel along the bank to carry water to the wheels.', at: [8.0, -0.5, -13.6] },
    { label: 'Tenter frames', note: 'The fulled cloth was stretched to dry, and to its proper width, on hooks along these timber frames.', at: [-6, 2.2, 6.2] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.pietraForte, P.rubble, tint(P.pietraForte, -0.04)]);
    const quoin = tint(stone, 0.08);
    const timber = P.oak;

    // ---- the bank: the old Roman quay wall, and the new weir and channel wall out in the river
    quayWall(b, tint(stone, -0.06));
    const cz = RACE_Z; // line of the channel wall
    millRace(b, tint(stone, -0.1));

    // ---- the mill: a two-storey stone hall on the bank with a tower at its upstream end
    const mx = -4;
    const mz = -7.3;
    const MW = 14;
    const MD = 6.6;
    const H = 6.4;
    b.box(MW, H, MD, stone, { at: [mx, 0, mz] });
    coppiRoof(b, MW, MD, [mx, H, mz], { wall: stone });
    b.sym((s) => {
      for (let y = 0; y < H; y += 0.7) {
        b.box(0.5, 0.35, 0.5, quoin, { at: [mx + s * (MW / 2 - 0.2), y, mz + MD / 2 - 0.2], jitter: false });
        b.box(0.5, 0.35, 0.5, quoin, { at: [mx + s * (MW / 2 - 0.2), y, mz - MD / 2 + 0.2], jitter: false });
      }
    });
    // front: a round-arched door, small windows with stone heads
    const fz = mz + MD / 2;
    b.panel(1.6, 2.6, P.oakDark, { at: [mx - 2, 0, fz], facing: '+z', shape: 'round' });
    b.panel(2.0, 2.9, quoin, { at: [mx - 2, 0, fz - 0.02], facing: '+z', shape: 'round', depth: 0.04 });
    for (const x of [mx - 5.2, mx + 1.4, mx + 4.6]) b.window(0.6, 0.9, { at: [x, 1.6, fz], facing: '+z', shape: 'round', frame: quoin, glass: P.timberBlack });
    for (const x of [mx - 5.2, mx - 2, mx + 1.4, mx + 4.6]) b.window(0.6, 0.9, { at: [x, 4.4, fz], facing: '+z', shape: 'round', frame: quoin, glass: P.timberBlack });
    // back: the wheels on the channel, under a tiled pentice
    const bz = mz - MD / 2;
    for (const x of [mx - 2.6, mx + 1.6]) {
      waterwheel(b, { at: [x, WATER - 0.4 + 2.2, (cz + BANK) / 2], r: 2.2, width: 1.1, paddles: 16, spokes: 8, spin: b.rand(), axle: 1.8 });
      b.panel(0.9, 0.9, P.timberBlack, { at: [x, 1.4, bz], facing: '-z', shape: 'round' });
    }
    b.shed(9.4, 3.0, 1.0, P.coppi, { at: [mx - 0.5, 3.6, bz - 1.5], high: '+z' });
    for (const x of [mx - 5, mx + 4]) b.box(0.4, 3.6 - WATER + 0.6, 0.4, stone, { at: [x, WATER - 0.6, cz] });
    for (const x of [mx - 5, mx + 4]) b.box(0.4, 0.3, 2.8, stone, { at: [x, 3.3, bz - 1.3] });
    for (const x of [mx - 4, mx + 3.8]) b.window(0.6, 0.9, { at: [x, 4.4, bz], facing: '-z', shape: 'round', frame: quoin, glass: P.timberBlack });

    // the tower: square, with putlog holes, a few slit windows and a low pyramid roof
    const tx = mx - MW / 2 - 1.6;
    const tz = mz - 0.4;
    const TH = 11;
    b.box(3.8, TH, 3.8, stone, { at: [tx, 0, tz] });
    b.pyramid(4.4, 4.4, 1.2, P.coppi, { at: [tx, TH, tz] });
    for (const y of [3, 6, 9]) {
      b.panel(0.25, 0.9, P.timberBlack, { at: [tx, y, tz + 1.9], facing: '+z' });
      b.panel(0.25, 0.9, P.timberBlack, { at: [tx - 1.9, y, tz], facing: '-x' });
      b.panel(0.25, 0.9, P.timberBlack, { at: [tx, y, tz - 1.9], facing: '-z' });
    }
    b.panel(1.0, 2.2, P.oakDark, { at: [tx + 1.9, 2.6, tz + 0.8], facing: '+x', shape: 'round' });
    b.beam([tx + 2.0, 2.6, tz + 0.8], [tx + 2.0, 0, tz + 3.8], 0.9, 0.12, timber); // a timber stair to the raised door

    // ---- the stocks house: an open arcaded bay at the downstream end, where the hammers can be seen
    const sx = mx + MW / 2 + 3.2;
    const SW = 6.4;
    b.box(SW, 4.6, 0.6, stone, { at: [sx, 0, bz + 0.3] });
    b.box(0.6, 4.6, MD, stone, { at: [sx + SW / 2 - 0.3, 0, mz] });
    b.archWall(SW, 4.6, 0.6, stone, { at: [sx, 0, fz - 0.3], facing: '+z', openings: 2, openW: 2.3, openH: 3.6 });
    b.gable(SW, MD, roofRise(MD, 22), P.coppi, { at: [sx, 4.6, mz], overhang: 0.4, wall: stone });
    for (const x of [sx - 1.5, sx + 1.5]) fullingStocks(b, x, mz + 0.6);
    // the cam shaft running from the downstream wheel through the wall to the stocks
    b.log(0.18, 6.0, P.oakDark, { at: [sx, 1.5, mz - 1.2] });
    for (const x of [sx - 1.9, sx - 1.1, sx + 1.1, sx + 1.9]) b.box(0.18, 0.5, 0.18, P.oak, { at: [x, 1.45, mz - 1.0] });
    b.panel(1.2, 2.0, P.timberBlack, { at: [sx + 2.0, 0.6, bz], facing: '-z' });
    waterwheel(b, { at: [sx + 0.5, WATER - 0.4 + 2.2, (cz + BANK) / 2], r: 2.2, width: 1.1, paddles: 16, spokes: 8, spin: b.rand(), axle: 1.8 });

    // ---- the drying ground: tenter frames with lengths of cloth, and a stack of finished bolts
    const cloths = [P.cream, P.limewash, tint(P.cream, -0.05), P.doorBlue, P.intonacoRed];
    tenter(b, -6, 5.6, 12, b.pick(cloths));
    tenter(b, -6, 8.2, 12, b.pick(cloths));
    tenter(b, 9, 7.0, 10, b.pick(cloths));
    for (let i = 0; i < 4; i++) b.log(0.25, 1.6, b.pick(cloths), { at: [sx - 2.6, i * 0.45, fz + 1.6], axis: 'z', segs: 8 });
    b.box(30, 0.04, 8, tint(P.grassDry, 0.04), { at: [0, 0, 6.5], jitter: false });
    b.tree(9, { at: [-16.5, 0, 9.5], kind: 'cypress' });
    b.tree(8.5, { at: [16.5, 0, 9.5], kind: 'cypress' });
    b.tree(5, { at: [16, 0, -1], kind: 'round' });

    b.collider(MW, MD, { at: [mx, 0, mz] });
    b.collider(3.8, 3.8, { at: [tx, 0, tz] });
    b.collider(SW, MD, { at: [sx, 0, mz] });
    for (const z of [5.6, 8.2]) b.collider(12.2, 0.3, { at: [-6, 0, z] });
    b.collider(10.2, 0.3, { at: [9, 0, 7.0] });
  },
};
