import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { beam, beast, goods, hurdle, pot } from './shared';

/** A four-post granary: a raised wattle-and-daub store on four oak posts under a steep thatch. */
function granary(b: Builder, x: number, z: number, rotY: number): void {
  const S = 2.6; // square floor
  const F = 1.15; // floor height
  const H = 1.5; // wall height
  b.group({ at: [x, 0, z], rotY }, () => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.13, F + H, P.oakDark, { at: [sx * (S / 2 - 0.1), 0, sz * (S / 2 - 0.1)], segs: 6 });
    b.box(S + 0.2, 0.14, S + 0.2, P.oak, { at: [0, F - 0.14, 0] });
    b.box(S - 0.1, H, S - 0.1, P.daub, { at: [0, F, 0] });
    // wattle shows where the daub has worn
    b.box(0.9, 0.6, 0.04, P.wattle, { at: [0.5, F + 0.25, (S - 0.1) / 2] });
    b.panel(0.7, 0.95, P.oakDark, { at: [0, F + 0.05, (S - 0.1) / 2], facing: '+z' });
    b.gable(S - 0.1, S - 0.1, 1.85, P.thatch, { at: [0, F + H, 0], ridge: 'x', overhang: 0.45, thick: 0.4, wall: P.daub });
    // notched-log ladder up to the door
    beam(b, [0, 0, S / 2 + 0.9], [0, F, S / 2 + 0.05], 0.2, P.oak, 0.12);
  });
}

/** An open storage pit, or one sealed with a clay cap. */
function pit(b: Builder, x: number, z: number, sealed: boolean): void {
  b.cyl(0.85, 0.05, tint(P.soil, 0.04), { at: [x, 0, z], segs: 10 });
  if (sealed) {
    b.dome(0.62, P.mud, { at: [x, 0.03, z], squash: 0.35, segs: 9 });
  } else {
    b.cyl(0.6, 0.06, P.timberBlack, { at: [x, 0, z], segs: 10 });
    // wicker lid propped beside it
    b.cyl(0.6, 0.06, P.wattle, { at: [x + 0.95, 0.02, z], segs: 9, rot: [0.25, 0, 0.5] });
  }
}

export const tradingGround: BuildingDef = {
  id: 'trading-ground',
  name: 'Trading ground',
  style: 'Late Iron Age',
  date: 'c. 100 BC',
  summary:
    'Before there was a town there was a gathering place: a patch of trodden ground where farmers met to swap grain, livestock, salt, pots and iron. ' +
    'Nothing here is a shop. Grain is kept in small storehouses raised on four posts, away from damp and rats, or sealed in pits in the chalk. ' +
    'Pens and windbreaks are woven hazel hurdles, the same panels used for walls and fences on every farm.',
  materials: ['oak posts', 'hazel wattle', 'daub', 'straw thatch'],
  lookFor: [
    { label: 'Four-post granary', note: 'A tiny store lifted on four posts so air moves under the floor and rodents cannot climb in. Archaeologists find them as a square of four post-holes.', at: [-6.2, 2.4, -3.2] },
    { label: 'Storage pit', note: 'Grain kept for seed was sealed in a pit under a clay cap. Starved of air it kept through the winter.', at: [3.6, 0.5, -5.2] },
    { label: 'Wattle hurdles', note: 'Hazel rods woven between upright stakes: a light, portable panel for pens, windbreaks and the walls of houses.', at: [6.4, 1.1, 3.2] },
    { label: 'Notched-log ladder', note: 'A single log with steps cut into it, the usual way up to a raised floor.', at: [-6.2, 0.9, -1.4] },
  ],
  build(b) {
    // the trampled ground of the meeting place
    b.group({ scale: [1.1, 1, 0.85] }, () => b.cyl(9.4, 0.04, tint(P.earth, 0.03), { segs: 18 }));

    // granaries at the back
    granary(b, -6.2, -3.2 - 0.3, 0);
    granary(b, -1.8, -5.6, b.range(-0.15, 0.15));
    if (b.variant !== 1) granary(b, 7.2, -4.8, b.range(-0.2, 0.2));
    b.collider(3, 3, { at: [-6.2, 0, -3.5] });
    b.collider(3, 3, { at: [-1.8, 0, -5.6] });
    if (b.variant !== 1) b.collider(3, 3, { at: [7.2, 0, -4.8] });

    // storage pits
    pit(b, 2.2, -5.4, false);
    pit(b, 3.8, -5.0, true);
    pit(b, 3.0, -3.3, true);
    pit(b, -4.2, -6.4, true);

    // stock pen of hurdles with sheep, front right
    const px = 6.2;
    const pz = 4.6;
    hurdle(b, 4.4, 0.95, [px, 0, pz - 1.6]);
    hurdle(b, 4.4, 0.95, [px, 0, pz + 1.6]);
    hurdle(b, 3.2, 0.95, [px + 2.2, 0, pz], Math.PI / 2);
    hurdle(b, 1.8, 0.95, [px - 2.2, 0, pz - 0.7], Math.PI / 2);
    for (let i = 0; i < 4; i++) beast(b, [px - 1.2 + i * 0.8, 0, pz - 0.6 + (i % 2) * 1.1], b.range(0, 6.28), 'sheep');

    // pig pen front left
    hurdle(b, 3, 0.8, [-6.6, 0, 5.6]);
    hurdle(b, 3, 0.8, [-6.6, 0, 3.4]);
    hurdle(b, 2.2, 0.8, [-8.1, 0, 4.5], Math.PI / 2);
    for (let i = 0; i < 2; i++) beast(b, [-6.9 + i * 0.9, 0, 4.4 + i * 0.4], b.range(0, 6.28), 'pig');

    // windbreak stalls: a hurdle screen with goods laid out on hides in front
    const stall = (x: number, z: number, r: number, kinds: ('basket' | 'sack' | 'pot' | 'cloth')[]) => {
      b.group({ at: [x, 0, z], rotY: r }, () => {
        hurdle(b, 2.8, 1.4, [0, 0, -0.7]);
        beam(b, [-1.3, 0, -0.7], [-1.3, 1.6, -0.6], 0.08, P.bark);
        b.box(2.4, 0.03, 1.2, P.oak, { at: [0, 0, 0.1] }); // hide laid on the ground
        goods(b, 2.2, [0, 0.03, 0.1], 0, kinds);
      });
    };
    stall(0.2, 1.2, 0, ['pot', 'basket', 'pot']);
    stall(-2.9, 2.2, 0.35, ['sack', 'basket', 'sack']);
    stall(2.9, -0.4, -0.3, ['cloth', 'pot', 'cloth']);

    // cooking hearth and a few big storage jars
    b.cyl(0.6, 0.08, P.rubble, { at: [-1.6, 0, 5.2], segs: 8 });
    b.cyl(0.4, 0.1, P.timberBlack, { at: [-1.6, 0.02, 5.2], segs: 8 });
    for (const s of [-1, 1]) beam(b, [-1.6 + s * 0.55, 0, 5.2], [-1.6, 1.3, 5.2], 0.05, P.bark);
    pot(b, [-1.6, 0.6, 5.2], 1.1, P.oakDark);
    pot(b, [-4.6, 0, -1.2], 1.6, P.tileBrown);
    pot(b, [-4.1, 0, -1.4], 1.3, P.tileBrown);
  },
};
