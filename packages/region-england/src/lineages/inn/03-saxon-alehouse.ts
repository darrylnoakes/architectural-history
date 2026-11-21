import { P, spread, tint, type BuildingDef } from '@ah/kit';
import { aleStake, barrel, ground, pole, trestle } from './shared';

const W = 9; // hall length (X)
const D = 5; // hall width (Z)
const H = 2.0; // wall height
const HX = -1.5; // hall centre
const HZ = -2.5;

export const saxonAlehouse: BuildingDef = {
  id: 'saxon-alehouse',
  name: 'Alehouse',
  style: 'Anglo-Saxon',
  date: 'c. 700',
  summary:
    'When Roman rule ended, so did Roman building: the mansio fell into ruin and the newcomers built in timber, as they had at home. ' +
    'Ale was brewed in ordinary households, and a house that sold it was an ealu-hus, an alehouse. ' +
    'This one is a small rectangular hall of upright planks set straight into the ground, under a hipped roof of thatch, with a sunken hut beside it for brewing. ' +
    'A pole with a bush tied to the end told passers-by that a fresh brew was ready, a custom that lasted for centuries.',
  materials: ['oak planks and posts', 'thatch', 'wattle'],
  lookFor: [
    { label: 'Ale-stake', note: 'A pole with a bush on the end, hung out when a new brew was ready: the first English inn sign.', at: [HX + 1.7, 2.7, HZ + D / 2 + 2.9] },
    { label: 'Earthfast plank walls', note: 'Split oak planks and posts dug straight into the ground. Quick to build, but they rot at the foot within a generation.', at: [HX - 3, 1.1, HZ + D / 2 + 0.1] },
    { label: 'Hipped thatched roof', note: 'Sloping down at the ends as well as the sides, steep enough to shed rain from the straw.', at: [HX - 4.4, 3.5, HZ] },
    { label: 'Sunken-featured building', note: 'A small hut over a pit, the commonest building of the period, used here as the brewhouse.', at: [6.2, 1.8, -5.4] },
    { label: 'Trestle table', note: 'Drinking went on outside in fine weather, on benches and boards that could be packed away.', at: [3.2, 1.2, 4.6] },
  ],
  build(b) {
    const plank = b.pick([P.oak, tint(P.oak, 0.05), P.cedar]);
    const thatch = b.pick([P.thatchOld, tint(P.thatch, -0.06), P.reed]);

    ground(b, 21, 21, tint(P.earth, 0.04), [0, 0]);

    // ---- the hall
    b.group({ at: [HX, 0, HZ] }, () => {
      b.box(W, H, D, plank);
      // vertical planks and posts: a stud every 0.45 m on the long walls, fewer on the ends
      for (const [f, len, off] of [['+z', W, D / 2], ['-z', W, D / 2], ['+x', D, W / 2], ['-x', D, W / 2]] as const) {
        const n = Math.round(len / 0.45);
        for (const p of spread(n, -len / 2 + 0.1, len / 2 - 0.1)) {
          const xx = f === '+z' || f === '-z' ? p : f === '+x' ? off : -off;
          const zz = f === '+z' ? off : f === '-z' ? -off : p;
          const dx = f === '+x' ? 0.03 : f === '-x' ? -0.03 : 0;
          const dz = f === '+z' ? 0.03 : f === '-z' ? -0.03 : 0;
          b.box(f === '+z' || f === '-z' ? 0.06 : 0.06, H, 0.06, tint(plank, -0.14), {
            at: [xx + dx, 0, zz + dz],
            jitter: false,
          });
        }
      }
      // wall plate
      b.box(W + 0.12, 0.16, D + 0.12, P.oakDark, { at: [0, H - 0.16, 0] });
      // hipped thatched roof, about 50 degrees, deep eaves
      b.hip(W + 1.2, D + 1.2, 3.4, thatch, { at: [0, H - 0.3, 0], ridge: W - D });
      b.hip(W + 0.9, D + 0.9, 3.0, tint(thatch, -0.1), { at: [0, H - 0.5, 0], ridge: W - D });
      // gablets at the hips let the smoke out
      b.sym((s) => b.panel(0.7, 0.5, P.windowDark, { at: [s * (W - D) / 2 + s * 0.35, H + 2.25, 0], facing: s > 0 ? '+x' : '-x', depth: 0.03 }));
      // door in the middle of the long side, with a heavy plank door standing open
      b.panel(1.2, 1.85, P.windowDark, { at: [0, 0, D / 2], facing: '+z', depth: 0.1 });
      b.box(0.1, 1.85, 1.1, tint(plank, -0.06), { at: [-0.62, 0, D / 2 + 0.55] });
      b.box(1.5, 0.2, 0.2, P.oakDark, { at: [0, 1.85, D / 2 + 0.05] });
      // a shuttered window opening either side
      b.sym((s) => b.panel(0.6, 0.45, P.windowDark, { at: [s * 2.8, 1.15, D / 2], facing: '+z', depth: 0.1 }));
      b.sym((s) => b.panel(0.6, 0.45, P.windowDark, { at: [s * 2.0, 1.15, -D / 2], facing: '-z', depth: 0.1 }));
    });

    // the ale-stake, pushed out over the door
    aleStake(b, [HX + 0.9, 1.45, HZ + D / 2 + 0.05], 0.25, 3.0, 0.65);

    // ---- sunken-featured building (grubenhaus) used as the brewhouse: low gable roof nearly to the ground
    b.group({ at: [6.2, 0, -5.4], rotY: 0.08 }, () => {
      b.box(4.2, 0.45, 3.2, tint(plank, -0.05));
      b.gable(4.2, 3.2, 2.1, thatch, { at: [0, 0.45, 0], overhang: 0.25, thick: 0.35, wall: plank });
      b.panel(0.9, 1.0, P.windowDark, { at: [2.1, 0.0, 0], facing: '+x', depth: 0.1 });
      b.cyl(0.05, 0.6, P.bark, { at: [-0.8, 2.3, 0] });
      // mash tubs and a vat by the door
      barrel(b, [3.0, 0, 0.9], tint(P.oak, 0.04));
      barrel(b, [3.1, 0, -0.9], P.oak);
      b.lathe([[0.01, 0], [0.55, 0], [0.62, 0.5], [0.58, 0.52]], tint(P.oak, -0.04), { at: [3.4, 0, 0], segs: 10 });
    });

    // ---- outside: trestle and benches, barrels, a wattle fence round the yard
    trestle(b, [3.2, 0, 4.4], 0.1);
    trestle(b, [-3.6, 0, 4.9], -0.15);
    barrel(b, [1.4, 0, 1.5]);
    barrel(b, [2.0, 0, 1.2], tint(P.oak, 0.06));
    // fence along the back and sides with a gap to the front
    const fence = (x0: number, z0: number, x1: number, z1: number) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const a = Math.atan2(x1 - x0, z1 - z0);
      b.group({ at: [(x0 + x1) / 2, 0, (z0 + z1) / 2], rotY: a }, () => {
        b.box(0.08, 1.0, len, P.wattle);
        for (const p of spread(Math.round(len / 1.5), -len / 2, len / 2)) b.cyl(0.05, 1.15, P.bark, { at: [0, 0, p], segs: 5 });
      });
    };
    fence(-10, -10, -10, 6);
    fence(-10, -10, 10, -10);
    fence(10, -10, 10, 6);
    // log pile and chopping block
    b.group({ at: [-8.2, 0, -7.6] }, () => {
      for (let i = 0; i < 4; i++) b.log(0.13, 1.8, P.bark, { at: [0, 0, i * 0.27], segs: 6 });
      for (let i = 0; i < 3; i++) b.log(0.13, 1.8, tint(P.bark, 0.05), { at: [0, 0.22, 0.13 + i * 0.27], segs: 6 });
    });
    b.cyl(0.3, 0.55, P.bark, { at: [-6.6, 0, -6.6], segs: 7 });
    pole(b, [-6.6, 0.55, -6.6], [-6.3, 1.1, -6.4], 0.03, P.oak, 4);
    b.tree(7, { at: [-7.5, 0, 7.5] });

    b.collider(W, D, { at: [HX, 0, HZ] });
    b.collider(4.2, 3.2, { at: [6.2, 0, -5.4] });
  },
};
