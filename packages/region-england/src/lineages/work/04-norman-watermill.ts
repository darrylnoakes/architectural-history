import { P, tint, type BuildingDef } from '@ah/kit';
import { POND, WATER, millPond, waterwheel, water } from './shared';

export const normanWatermill: BuildingDef = {
  id: 'norman-watermill',
  name: 'Manorial watermill',
  style: 'Norman',
  date: 'c. 1090',
  summary:
    'Domesday Book recorded some 5,600 mills in England in 1086, most of them belonging to the lord of the manor, whose tenants were expected to grind their corn there and pay a share of it as toll. ' +
    'This mill has a vertical undershot wheel, a type already used in Saxon England, turned by a fast mill race, and wooden gears inside turn the drive through a right angle to the millstones. ' +
    'The Saxon mill has been pulled down, but its embanked millpond is kept and now feeds the race. ' +
    'The new mill is larger and sturdier than its predecessor: a stone ground storey that stands up to damp and flood, with a timber-framed storey and thatched roof above.',
  materials: ['rubble stone', 'oak frame', 'wattle and daub', 'thatch'],
  lookFor: [
    { label: 'Undershot wheel', note: 'Paddles dip into the race at the bottom of the wheel and are pushed round by the current.', at: [-1.6, 4.9, -10.9] },
    { label: 'Mill race', note: 'A man-made channel that leads water from the pond to the wheel, faster and steadier than the river itself.', at: [3.5, 1.0, -10.1] },
    { label: 'Sluice gate', note: 'Raised and lowered by the miller to set the mill going; a second gate lets spare water spill back to the river.', at: [7.6, 2.5, -10.1] },
    { label: 'The old millpond', note: 'Dug and banked for the Saxon mill and kept for the new one. Earthworks like this often outlasted several mills on the same site.', at: [10.3, 1.6, -3] },
    { label: 'Stone ground storey', note: 'Masonry below, where water and heavy millstones are; lighter timber framing above, where the grain was stored.', at: [-6.6, 1.3, 1.3] },
    { label: 'Worn millstone', note: 'Millstones wore down and were replaced; old ones were left lying about the yard.', at: [3.6, 1.0, 2.2] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.rubble, P.ragstone, tint(P.rubble, 0.03)]);
    const thatch = b.pick([P.thatch, P.thatchOld]);
    const daub = b.pick([P.daub, P.limewash]);

    // ---- the mill
    const mx = -1.6;
    const mz = -5.3;
    const W = 10.5;
    const D = 6.6;
    const H1 = 2.8;
    const H2 = 2.5;
    b.box(W, H1, D, stone, { at: [mx, 0, mz] });
    b.box(W + 0.12, 0.18, D + 0.12, P.oakDark, { at: [mx, H1, mz] });
    b.box(W, H2, D, daub, { at: [mx, H1 + 0.18, mz] });
    b.sym((s) => b.frame(W, H2, P.oakDark, { at: [mx, H1 + 0.18, mz + (s * D) / 2], facing: s > 0 ? '+z' : '-z', studs: 5, rails: 1, brace: 'corner' }));
    b.sym((s) => b.frame(D, H2, P.oakDark, { at: [mx + (s * W) / 2, H1 + 0.18, mz], facing: s > 0 ? '+x' : '-x', studs: 3, rails: 1 }));
    const top = H1 + 0.18 + H2;
    b.gable(W, D, 3.6, thatch, { at: [mx, top, mz], overhang: 0.55, thick: 0.45, wall: daub });
    // front: round-headed door under a timber lintel, small windows, a loft door above
    const fz = mz + D / 2;
    b.panel(1.4, 2.3, P.oakDark, { at: [mx - 2.5, 0, fz], facing: '+z', shape: 'round' });
    b.panel(1.7, 2.5, stone, { at: [mx - 2.5, 0, fz - 0.03], facing: '+z', shape: 'round', depth: 0.1 });
    b.panel(1.4, 2.3, P.oakDark, { at: [mx - 2.5, 0, fz + 0.02], facing: '+z', shape: 'round' });
    b.sym((s) => b.panel(0.45, 0.8, P.timberBlack, { at: [mx + s * 2.2 + 1, 1.1, fz], facing: '+z', shape: 'round' }));
    b.panel(1.1, 1.4, P.oak, { at: [mx - 2.5, H1 + 0.5, fz], facing: '+z' });
    b.box(0.2, 0.2, 1.2, P.oakDark, { at: [mx - 2.5, top - 0.25, fz + 0.5] }); // hoist beam
    // ends: windows
    b.sym((s) => b.panel(0.45, 0.8, P.timberBlack, { at: [mx + (s * W) / 2, 1.1, mz], facing: s > 0 ? '+x' : '-x', shape: 'round' }));
    // back: a door onto the race and a shuttered loft window
    b.panel(1.0, 0.8, P.oak, { at: [mx + 2.6, H1 + 0.9, mz - D / 2], facing: '-z' });

    // ---- the race behind the mill, running right to left, and the wheel in it
    const rz = mz - D / 2 - 1.5; // centre line of the race
    const rw = 1.8;
    const wl = 0.5;
    // the race: earth-filled channel with stone kerbs, from the old pond's outfall (x 10.85) to the tail (x -9.3);
    // the river-side kerb has gaps where water spills out
    b.box(19.6, wl - 0.1, rw, P.earth, { at: [0.8, 0, rz], jitter: false });
    water(b, 19.6, rw, [0.8, wl - 0.1, rz]);
    b.box(19.6, wl + 0.25, 0.55, stone, { at: [0.8, 0, rz + rw / 2 + 0.27] });
    b.box(0.55, wl + 0.25, rw + 1.1, stone, { at: [-9.3, 0, rz] });
    b.box(0.55, wl + 0.25, rw + 1.1, stone, { at: [10.85, 0, rz] });
    const kz = rz - rw / 2 - 0.27;
    b.box(16.8, wl + 0.25, 0.55, stone, { at: [0.4, 0, kz] }); // from -8 to 8.8
    b.box(0.85, wl + 0.25, 0.55, stone, { at: [10.425, 0, kz] }); // 10 .. 10.85
    // the pond's outfall: a stone culvert through the back bank into the head of the race
    millPond(b);
    b.box(1.4, POND.h + 0.15, 1.5, stone, { at: [POND.x, 0, rz + rw / 2 + 1.3] });
    b.panel(0.9, 0.6, P.timberBlack, { at: [POND.x, wl - 0.15, rz + rw / 2 + 0.55], facing: '-z' });
    // the tail: water pours out of the end of the race and drops into the river
    const fall = (x: number, w: number) => {
      b.box(w, wl - WATER, 0.4, tint(P.water, 0.22), { at: [x, WATER, kz - 0.1], mat: 'glass', jitter: false });
      b.blob(w * 0.5, tint(P.water, 0.3), { at: [x, WATER, kz - 0.7], stretch: [1.4, 0.15, 1], mat: 'glass' });
    };
    fall(-8.5, 1.0);
    // the wheel: 4.4 m across, its axle running into the mill wall
    waterwheel(b, { at: [mx, wl - 0.25 + 2.2, rz], r: 2.2, width: 1.3, kind: 'undershot', paddles: 14, spokes: 6, color: P.oak, spin: b.rand() });
    // timber bearer on posts carrying the outer end of the axle
    b.box(0.3, wl + 2.0, 0.3, P.oakDark, { at: [mx, 0, rz - rw / 2 - 0.3] });
    // sluice gate across the race upstream, with a bypass spillway into the river
    const sx = 7.6;
    b.sym((s) => b.box(0.3, 2.3, 0.3, P.oakDark, { at: [sx, 0, rz + s * (rw / 2 + 0.1)] }));
    b.box(0.3, 0.25, rw + 0.8, P.oakDark, { at: [sx, 2.3, rz] });
    b.box(0.12, 1.1, rw, P.oak, { at: [sx, wl + 0.2, rz] });
    b.box(0.12, 1.3, 0.12, P.oak, { at: [sx, wl + 1.3, rz] });
    // bypass: a second, smaller gate in the river-side kerb that lets spare water away
    const bx = 9.4;
    b.sym((s) => b.box(0.15, 1.4, 0.15, P.oakDark, { at: [bx + s * 0.6, 0, kz] }));
    b.box(1.35, 0.15, 0.2, P.oakDark, { at: [bx, 1.4, kz] });
    b.box(1.1, 0.45, 0.08, P.oak, { at: [bx, wl + 0.35, kz] });
    fall(bx, 1.0);
    // plank footbridge over the race
    b.box(1.4, 0.15, rw + 1.4, P.oak, { at: [5.5, wl + 0.25, rz] });

    // ---- the yard: a worn millstone, sacks, a cart and a fence to the lane
    b.group({ at: [3.6, 0, 2.2], rot: [0.25, 0.3, 0] }, () => {
      b.log(0.65, 0.28, P.gritstone, { axis: 'z', segs: 12 });
    });
    for (let i = 0; i < 4; i++) b.blob(0.3, P.wattle, { at: [mx - 4.3 + i * 0.6, 0.3, fz + 0.8], stretch: [1, 1.3, 1] });
    b.group({ at: [-7, 0, 5], rotY: 0.4 }, () => {
      b.box(1.6, 0.12, 2.6, P.oak, { at: [0, 0.75, 0] });
      b.sym((s) => b.box(0.08, 0.35, 2.6, P.oak, { at: [s * 0.8, 0.87, 0] }));
      b.sym((s) => b.log(0.55, 0.12, P.oakDark, { at: [s * 0.9, 0, 0.1], segs: 10 }));
      b.sym((s) => b.box(0.08, 0.08, 2.2, P.oak, { at: [s * 0.4, 0.7, 2.3] }));
      for (let i = 0; i < 3; i++) b.blob(0.3, P.wattle, { at: [0, 1.15, -0.8 + i * 0.7], stretch: [1.2, 0.9, 1] });
    });
    for (let i = 0; i < 20; i++) b.cyl(0.05, 1.0, P.wattle, { at: [-17 + i * 1.79, 0, 9.5], segs: 4 });
    b.box(34, 0.5, 0.08, P.wattle, { at: [0, 0.4, 9.5] });
    b.tree(7.5, { at: [-13, 0, 3] });

    b.collider(W, D, { at: [mx, 0, mz] });
    b.collider(20.2, rw + 1.2, { at: [0.8, 0, rz] });
    b.collider(POND.w + 1.8, POND.d + 1.8, { at: [POND.x, 0, POND.z] });
  },
};
