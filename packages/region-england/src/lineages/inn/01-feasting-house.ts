import { P, tint, type BuildingDef } from '@ah/kit';
import { ground, pole } from './shared';

const RX = -2.2; // roundhouse centre
const RZ = -2.6;
const R = 5.6; // wall radius
const WALL = 2.2;

export const feastingHouse: BuildingDef = {
  id: 'feasting-house',
  name: 'Feasting roundhouse',
  style: 'Iron Age',
  date: 'c. 500 BC',
  summary:
    'Before there were inns, hospitality was a duty of the household, and the biggest house in the settlement was where guests ate and slept. ' +
    'This is a large roundhouse of wattle and daub under a steep cone of thatch, with no chimney: smoke from the central hearth simply seeped out through the roof. ' +
    'Feasts were cooked outside in a fire pit, and meat, fish and hides hung on racks to dry and smoke.',
  materials: ['wattle and daub', 'oak posts', 'wheat straw thatch', 'hazel rods'],
  lookFor: [
    { label: 'Conical thatched roof', note: 'A steep cone, about 45 degrees, so that rain runs off the straw before it can soak in.', at: [RX + 2.6, 5.2, RZ + 2.6] },
    { label: 'Wattle-and-daub wall', note: 'Woven hazel rods plastered with clay, dung and straw, low enough that the roof does most of the work.', at: [RX - R - 0.1, 1.0, RZ] },
    { label: 'Porch', note: 'The only opening. Most roundhouse doors faced east or south-east, towards the rising sun and away from the wind.', at: [RX, 2.2, RZ + R + 1.6] },
    { label: 'Cooking pit', note: 'Feasts were cooked outdoors over a fire pit, with a cauldron hung from a tripod and meat roasted on a spit.', at: [5.2, 1.4, 4.8] },
    { label: 'Drying rack', note: 'A frame of poles for drying and smoking meat, fish and hides through the winter.', at: [6.6, 2.4, -4.2] },
  ],
  build(b) {
    const daub = b.pick([P.daub, tint(P.daub, -0.04), P.cob]);
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.05), P.reed]);

    // trodden earth round the house
    ground(b, 21, 21, tint(P.earth, 0.06), [0, 0]);

    // ---- the roundhouse
    b.group({ at: [RX, 0, RZ] }, () => {
      b.cyl(R, WALL, daub, { segs: 18 });
      // a band of exposed wattle at the foot where the daub has worn away
      b.cyl(R + 0.03, 0.35, P.wattle, { segs: 18 });
      // thatch: a thick cone with an overhang well beyond the wall
      const ov = 0.55;
      const rise = (R + ov) * 1.0;
      b.lathe(
        [
          [0.01, WALL - 0.3 + rise],
          [R + ov, WALL - 0.3],
          [R + ov - 0.1, WALL - 0.6],
          [R - 0.2, WALL - 0.15],
          [0.01, WALL - 0.15 + rise - 0.2],
        ],
        thatch,
        { segs: 18 },
      );
      // a ring of binding at the apex
      b.cyl(0.5, 0.35, tint(thatch, -0.12), { at: [0, WALL - 0.5 + rise, 0], rTop: 0.15, segs: 8 });

      // porch facing +Z: two posts, a short ridged thatch roof running out from the cone
      const pz = R - 0.2;
      b.sym((s) => b.cyl(0.11, 2.0, P.oak, { at: [s * 0.9, 0, pz + 1.6], segs: 6 }));
      b.box(2.0, 0.14, 0.14, P.oak, { at: [0, 1.95, pz + 1.6] });
      b.gable(2.2, 2.3, 1.1, thatch, { at: [0, 2.0, pz + 1.0], ridge: 'z', overhang: 0.2, thick: 0.35, wall: daub });
      // door opening and a hide hung across it
      b.panel(1.2, 1.75, P.oakDark, { at: [0, 0, R - 0.02], facing: '+z', depth: 0.12 });
      b.panel(0.9, 1.4, tint(P.mud, 0.05), { at: [0.1, 0.2, R + 0.06], facing: '+z', depth: 0.04 });
    });

    // ---- cooking pit with spit, cauldron tripod and log benches
    const cx = 5.0;
    const cz = 4.6;
    b.cyl(1.25, 0.06, P.soil, { at: [cx, 0, cz], segs: 12 });
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      b.blob(0.24, b.pick([P.rubble, P.gritstone, P.flint]), {
        at: [cx + Math.cos(a) * 1.25, 0.12, cz + Math.sin(a) * 1.25],
        stretch: [1, 0.7, 1],
        detail: 0,
      });
    }
    b.cyl(0.75, 0.1, P.terracotta, { at: [cx, 0.04, cz], segs: 8 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      pole(b, [cx + Math.cos(a) * 0.5, 0.08, cz + Math.sin(a) * 0.5], [cx - Math.cos(a) * 0.15, 0.4, cz - Math.sin(a) * 0.15], 0.06, P.bark, 5);
    }
    // spit on forked posts with a carcass
    b.sym((s) => {
      pole(b, [cx + s * 1.5, 0, cz - 0.15], [cx + s * 1.5, 1.15, cz], 0.06, P.oak, 5);
      pole(b, [cx + s * 1.5, 1.0, cz], [cx + s * 1.62, 1.3, cz], 0.04, P.oak, 4);
      pole(b, [cx + s * 1.5, 1.0, cz], [cx + s * 1.38, 1.3, cz], 0.04, P.oak, 4);
    });
    b.log(0.035, 3.4, P.oakDark, { at: [cx, 1.08, cz], segs: 5 });
    b.blob(0.32, tint(P.sandstoneRed, -0.05), { at: [cx, 1.1, cz], stretch: [2.2, 0.8, 0.9], detail: 0 });
    // cauldron on a tripod beside the fire
    const tx = cx - 2.4;
    const tz = cz + 1.6;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      pole(b, [tx + Math.cos(a) * 0.9, 0, tz + Math.sin(a) * 0.9], [tx, 2.0, tz], 0.05, P.oak, 5);
    }
    b.box(0.02, 0.8, 0.02, P.iron, { at: [tx, 1.2, tz] });
    b.lathe([[0.01, 0], [0.32, 0.05], [0.42, 0.3], [0.38, 0.55], [0.4, 0.58]], P.bronze, { at: [tx, 0.6, tz], segs: 10 });
    b.cyl(0.45, 0.08, P.terracotta, { at: [tx, 0, tz], segs: 8 });
    // log benches
    for (const [x, z, r] of [
      [cx + 0.2, cz + 2.4, 0.15],
      [cx + 2.7, cz + 0.4, 1.5],
      [cx - 0.6, cz - 2.3, -0.2],
    ] as const) {
      b.log(0.22, 2.0, tint(P.bark, 0.05), { at: [x, 0, z], rotY: r, segs: 7 });
    }

    // ---- drying racks: two A-framed bays with rails, hides and strings of fish
    b.group({ at: [6.6, 0, -4.4], rotY: 0.15 }, () => {
      for (const x of [-2.4, 0, 2.4]) {
        pole(b, [x, 0, -0.7], [x, 2.6, 0], 0.07, P.oak, 5);
        pole(b, [x, 0, 0.7], [x, 2.6, 0], 0.07, P.oak, 5);
      }
      b.log(0.05, 5.2, P.oak, { at: [0, 2.5, 0], segs: 5 });
      b.log(0.04, 5.0, P.oak, { at: [0, 1.4, -0.38], segs: 5 });
      b.log(0.04, 5.0, P.oak, { at: [0, 1.4, 0.38], segs: 5 });
      // hides over the ridge pole
      b.box(1.5, 1.3, 0.04, tint(P.mud, 0.12), { at: [-1.2, 1.25, 0.1], rot: [0.25, 0, 0] });
      b.box(1.3, 1.1, 0.04, tint(P.earth, -0.05), { at: [1.3, 1.45, -0.1], rot: [-0.25, 0, 0] });
      // fish and meat strips hanging from the lower rails
      for (let i = 0; i < 7; i++) {
        const x = -2.1 + i * 0.7;
        b.box(0.12, 0.45, 0.04, i % 2 ? P.sandstoneRed : P.steel, { at: [x, 0.97, 0.4] });
        b.box(0.12, 0.4, 0.04, i % 2 ? P.steel : P.sandstoneRed, { at: [x + 0.35, 1.02, -0.4] });
      }
    });

    // ---- four-post granary on stilts, to keep grain from rats and damp
    b.group({ at: [-7.6, 0, 7.4] }, () => {
      b.sym((sx) => b.sym((sz) => b.cyl(0.1, 1.0, P.oak, { at: [sx * 0.9, 0, sz * 0.9], segs: 6 })));
      b.box(2.2, 0.12, 2.2, P.oak, { at: [0, 1.0, 0] });
      b.box(2.0, 1.4, 2.0, P.wattle, { at: [0, 1.12, 0] });
      b.pyramid(2.0, 2.0, 1.5, thatch, { at: [0, 2.5, 0], overhang: 0.3 });
    });

    // woodpile and a quern
    b.group({ at: [-8.4, 0, -6.5], rotY: 0.3 }, () => {
      for (let i = 0; i < 4; i++) b.log(0.12, 1.6, P.bark, { at: [0, 0, -0.5 + i * 0.25], segs: 6 });
      for (let i = 0; i < 3; i++) b.log(0.12, 1.6, tint(P.bark, 0.06), { at: [0, 0.2, -0.38 + i * 0.25], segs: 6 });
    });
    b.cyl(0.32, 0.3, P.gritstone, { at: [1.8, 0, 6.6], segs: 8 });
    b.cyl(0.3, 0.12, tint(P.gritstone, 0.05), { at: [1.8, 0.3, 6.6], segs: 8 });

    // the house is solid; everything outside is walk-through
    b.collider(R * 2, R * 2, { at: [RX, 0, RZ] });
    b.collider(2.2, 2.2, { at: [-7.6, 0, 7.4] });
  },
};
