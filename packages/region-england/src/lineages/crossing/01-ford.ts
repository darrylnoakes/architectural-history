import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, BED, WATER, side, bar } from './shared';

export const ford: BuildingDef = {
  id: 'ford',
  name: 'Ford with stepping stones',
  style: 'Iron Age',
  date: 'c. 500 BC',
  summary:
    'Before any bridge, the track crossed where the river spread wide and shallow over a firm gravel bed. ' +
    'People and cattle waded, a line of stepping stones kept feet dry at low water, and woven hazel hurdles were pegged down on the soft banks so hooves and cart wheels did not churn them to mud. ' +
    'When the river was up, goods went over in a dugout canoe hollowed from a single oak. The ford is the reason a town will grow here.',
  materials: ['river gravel', 'boulders', 'hazel wattle', 'oak'],
  lookFor: [
    { label: 'Stepping stones', note: 'Big boulders set in the bed with their tops just clear of the water, a stride apart.', at: [0, -0.6, 0] },
    { label: 'Hurdle trackway', note: 'Panels of woven hazel laid flat and pegged down make a firm path over wet ground; whole trackways like this survive in the Somerset Levels.', at: [0, 0.35, 11] },
    { label: 'Ford approach', note: 'The bank is worn down to a gentle gravel slope so carts and animals can walk into the water.', at: [-2.2, -0.6, -6.2] },
    { label: 'Logboat', note: 'A dugout canoe cut from one oak trunk with axe and adze. The Hasholme logboat from East Yorkshire, of about 300 BC, is over 12 m long.', at: [4.4, -0.4, 5.2] },
  ],
  build(b) {
    b.noCollide();
    const gravel = P.gravel;

    // gravel approach ramps worn into both banks, down to the bed
    b.sym((s) => {
      const top: [number, number][] = [
        [s * (BANK + 1.2), 0.02],
        [s * BANK, -0.05],
        [s * 3.6, BED - 0.02],
        [s * BANK, BED - 0.05],
      ];
      side(b, top, 4.6, mix(gravel, P.mud, 0.35));
      // trodden earth on the bank top
      b.box(4.2, 0.04, 4.8, mix(P.earth, P.mud, 0.4), { at: [0, 0, s * (BANK + 2.6)], jitter: false });
    });

    // stepping stones, a stride apart, across the low-water channel
    const stoneCol = [P.gritstone, P.rubble, P.granite, tint(P.gritstone, -0.05)];
    let i = 0;
    for (let z = -3.4; z <= 3.41; z += 0.85) {
      const top = WATER + b.range(0.25, 0.38);
      const x = 0.4 + Math.sin(i * 1.7) * 0.15;
      const r = b.range(0.36, 0.46);
      b.cyl(r, top - BED, b.pick(stoneCol), { at: [x, BED, z], rTop: r * 0.82, segs: 6, rotY: b.range(0, 1) });
      i++;
    }
    // a few scattered boulders in the shallows
    for (const [x, z] of [[-2.6, 1.8], [3.2, -2.4], [-4.5, -0.6], [5.1, 2.9]] as [number, number][]) {
      b.blob(b.range(0.35, 0.55), b.pick(stoneCol), { at: [x, WATER, z], stretch: [1.3, 0.55, 1], detail: 0 });
    }

    // hurdle trackway on both banks: woven hazel panels laid flat and pegged
    const hazel = P.wattle;
    b.sym((s) => {
      for (let k = 0; k < 4; k++) {
        const z = s * (BANK + 1.75 + k * 1.15);
        b.group({ at: [0, 0, z], rotY: b.range(-0.04, 0.04) }, () => {
          b.box(2.0, 0.06, 1.05, tint(hazel, -0.03));
          // the sails (uprights of the weave, lying lengthwise) and woven rods across them
          for (let r = -2; r <= 2; r++) b.box(2.04, 0.04, 0.05, tint(hazel, -0.12), { at: [0, 0.06, r * 0.2], jitter: false });
          for (let r = -4; r <= 4; r++) b.box(0.05, 0.035, 1.05, tint(hazel, 0.04), { at: [r * 0.22, 0.06, 0], jitter: false });
          // pegs
          b.sym((t) => b.cyl(0.04, 0.22, P.oakDark, { at: [t * 1.05, 0, 0], segs: 5 }));
        });
      }
      // ford marker stakes either side of the approach
      b.sym((t) => b.cyl(0.07, 1.4, P.oak, { at: [t * 2.4, 0, s * (BANK + 0.4)], segs: 5, rTop: 0.05 }));
      // reeds along the water's edge
      for (const x of [-5.6, -4.4, 4.0, 5.6]) {
        for (let k = 0; k < 5; k++) {
          b.cone(0.05, b.range(0.9, 1.4), P.reed, {
            at: [x + b.range(-0.4, 0.4), 0, s * (BANK + b.range(0.2, 0.8))],
            segs: 3,
          });
        }
      }
    });

    // dugout canoe moored in the shallows, tied to a post on the bank
    b.group({ at: [4.4, WATER - 0.18, 5.2], rotY: 0.12 }, () => {
      const oak = tint(P.oak, 0.04);
      const outer: [number, number][] = [];
      const inner: [number, number][] = [];
      for (let k = 0; k <= 8; k++) {
        const t = Math.PI + (Math.PI * k) / 8;
        outer.push([0.42 * Math.cos(t), 0.5 + 0.5 * Math.sin(t)]);
        inner.push([0.32 * Math.cos(t), 0.5 + 0.4 * Math.sin(t)]);
      }
      // hull cross-section (U), lying along X
      b.extrude([...outer, ...inner.reverse()], 3.6, oak, { rotY: Math.PI / 2 });
      // solid bow and stern
      b.sym((s) => {
        b.extrude(outer, 0.4, oak, { at: [s * 2.0, 0, 0], rotY: Math.PI / 2 });
        b.extrude(outer.map(([x, y]) => [x * 0.7, 0.15 + y * 0.7] as [number, number]), 0.3, oak, { at: [s * 2.32, 0.1, 0], rotY: Math.PI / 2 });
      });
      // paddle resting inside
      bar(b, [-1.2, 0.35, 0.05], [1.0, 0.62, -0.1], 0.05, P.oakDark);
      b.box(0.5, 0.03, 0.16, P.oakDark, { at: [1.15, 0.62, -0.11], rot: [0, 0, 0.12] });
    });
    b.cyl(0.08, 2.6, P.oakDark, { at: [5.6, BED, BANK - 0.25], segs: 5 });
    bar(b, [5.55, 0.2, BANK - 0.3], [4.4 + 1.9, WATER + 0.35, 5.45], 0.03, P.reed);
  },
};
