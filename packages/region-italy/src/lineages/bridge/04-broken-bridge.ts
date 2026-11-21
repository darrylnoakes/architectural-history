import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, FOOT, WATER, romanBridge, steps, bar, tilt } from './shared';

export const brokenBridge: BuildingDef = {
  id: 'broken-bridge',
  name: 'The broken bridge, patched in timber',
  style: 'Late Antique',
  date: 'c. 550',
  summary:
    'In the Gothic War of 535 to 554 the armies of the Goths and of the eastern emperor fought up and down Italy, and bridges were cut to stop the enemy: in the 540s the Gothic king Totila is said to have broken the bridges over the Aniene outside Rome. ' +
    'Here one arch has been smashed and the gap bridged with timber beams on a trestle, which can be pulled up in an emergency. ' +
    'A square tower of reused Roman blocks now guards the bridgehead, and the parapets are left broken. The Roman piers, built with no thought of war, still stand.',
  materials: ['Roman travertine and tufa', 'reused blocks', 'oak beams and planks'],
  lookFor: [
    { label: 'Broken arch', note: 'Only the stubs of the arch ring are left on the piers either side of the gap.', at: [3.3, 0.1, 5.15] },
    { label: 'Timber gap', note: 'Beams laid across the gap on a trestle in the river: quick to build and quick to remove if the enemy comes.', at: [2.4, 0.8, 5.15] },
    { label: 'Bridgehead tower', note: 'A tower built of blocks taken from ruined buildings guards the southern end, where travellers can be stopped and taxed.', at: [3.0, 5.0, -15.0] },
    { label: 'Roman piers', note: 'The piers and the other arches survive: Roman masonry was very hard to destroy completely.', at: [-3.9, -0.9, -2.65] },
  ],
  build(b) {
    b.noCollide();
    const L = romanBridge(b, { broken: 3, aged: 0.6 });
    const { f, ops, W } = L;
    b.deck(W - 0.9, 34, 1.15, { yEnds: 0 });
    const op = ops[3];
    const road = mix(P.peperino, P.gravel, 0.55);

    // road surface over the surviving parts
    const roadRun = (za: number, zb: number) => {
      const zs = steps(14, za, zb);
      const pts: [number, number][] = [...zs.map((z) => [z, f(z) + 0.01] as [number, number]), ...zs.reverse().map((z) => [z, f(z) - 0.17] as [number, number])];
      b.extrude(pts.map(([z, y]) => [-z, y] as [number, number]), W - 0.9, road, { rotY: Math.PI / 2 });
    };
    roadRun(-17, op.z0 + 0.7);
    roadRun(op.z1 - 0.7, 17);

    // rubble fallen into the river below the gap
    for (let i = 0; i < 9; i++) {
      b.blob(b.range(0.35, 0.6), tint(P.travertine, b.range(-0.12, -0.02)), {
        at: [b.range(-2.6, 2.6), WATER - b.range(0.0, 0.25), b.range(op.z0 + 0.3, op.z1 - 0.3)],
        stretch: [1.2, 0.7, 1.0],
        detail: 0,
      });
    }

    // a timber trestle in mid-gap and great beams across, with planks
    const zc = (op.z0 + op.z1) / 2;
    const beamTop = (z: number) => f(z) - 0.1;
    for (const x of [-1.8, -0.6, 0.6, 1.8]) b.cyl(0.15, beamTop(zc) - 0.36 - FOOT, P.oak, { at: [x, FOOT, zc], segs: 6 });
    b.box(W - 0.6, 0.26, 0.34, P.oakDark, { at: [0, beamTop(zc) - 0.62, zc] });
    bar(b, [-1.8, -1.0, zc], [1.8, beamTop(zc) - 0.65, zc], [0.12, 0.14], P.oakDark);
    for (const x of [-2.0, -1.0, 0, 1.0, 2.0]) {
      bar(b, [x, beamTop(op.z0) - 0.18, op.z0 + 0.2], [x, beamTop(op.z1) - 0.18, op.z1 - 0.2], [0.3, 0.36], tint(P.oak, b.range(-0.04, 0.04)));
    }
    for (const z of steps(10, op.z0 + 0.4, op.z1 - 0.4)) {
      b.box(W - 0.9 + b.range(-0.1, 0.1), 0.08, 0.36, tint(P.oakSilver, b.range(-0.15, -0.05)), { at: [b.range(-0.04, 0.04), f(z) - 0.07, z], rot: [tilt(f, z), 0, 0] });
    }
    // a simple rail along each side of the gap
    b.sym((s) => {
      const x = s * (W / 2 - 0.5);
      for (const z of [op.z0 + 0.5, zc, op.z1 - 0.5]) b.box(0.13, 1.0, 0.13, P.oakDark, { at: [x, f(z) - 0.05, z] });
      bar(b, [x, f(op.z0 + 0.5) + 0.9, op.z0 + 0.5], [x, f(op.z1 - 0.5) + 0.9, op.z1 - 0.5], [0.1, 0.1], P.oak);
    });

    // the bridgehead tower on the south bank, built of reused blocks
    const tx = 5.0;
    const tz = -15.0;
    const reuse = mix(P.travertine, P.rubble, 0.5);
    b.box(4.0, 8.5, 4.0, reuse, { at: [tx, -0.3, tz] });
    // courses of bigger reused blocks near the base, and a few column drums laid in
    for (let i = 0; i < 4; i++) b.box(4.06, 0.5, 4.06, tint(P.travertine, -0.04 - (i % 2) * 0.03), { at: [tx, i * 0.9, tz] });
    b.log(0.28, 1.2, P.marble, { at: [tx - 2.0, 2.3, tz + 0.8], axis: 'x' });
    b.log(0.28, 1.2, P.marble, { at: [tx - 2.0, 2.3, tz - 0.9], axis: 'x' });
    // door up a ladder on the bridge side, slit windows, and a timber fighting gallery on top
    b.panel(0.9, 1.8, P.oakDark, { at: [tx - 2.0, 2.6, tz], facing: '-x', shape: 'round' });
    bar(b, [tx - 3.0, 0, tz], [tx - 2.05, 2.6, tz], [0.5, 0.1], P.oak);
    for (const y of [5.0, 6.6]) {
      b.panel(0.18, 0.9, P.windowDark, { at: [tx, y, tz + 2.0], facing: '+z' });
      b.panel(0.18, 0.9, P.windowDark, { at: [tx - 2.0, y, tz], facing: '-x' });
    }
    b.box(4.8, 0.2, 4.8, P.oakDark, { at: [tx, 8.2, tz] });
    b.frame(4.8, 1.3, P.oak, { at: [tx, 8.4, tz + 2.4], facing: '+z', studs: 4, rails: 0 });
    b.frame(4.8, 1.3, P.oak, { at: [tx, 8.4, tz - 2.4], facing: '-z', studs: 4, rails: 0 });
    b.frame(4.8, 1.3, P.oak, { at: [tx + 2.4, 8.4, tz], facing: '+x', studs: 4, rails: 0 });
    b.frame(4.8, 1.3, P.oak, { at: [tx - 2.4, 8.4, tz], facing: '-x', studs: 4, rails: 0 });
    b.pyramid(5.2, 5.2, 1.6, P.shingle, { at: [tx, 9.7, tz], overhang: 0.2 });
    void BANK;

    // weeds on the neglected parapets and a fig in the masonry
    b.blob(0.5, P.leafDark, { at: [-W / 2 - 0.1, -0.2, -8.0], stretch: [0.8, 1.2, 1.4], detail: 0 });
    b.blob(0.4, P.leaf, { at: [W / 2 + 0.05, 0.2, 9.8], stretch: [0.7, 1.0, 1.2], detail: 0 });
  },
};
