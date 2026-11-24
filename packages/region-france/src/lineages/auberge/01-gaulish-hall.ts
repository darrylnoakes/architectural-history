import { P, spread, tint, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';
import { amphora, fence, ground } from './shared';

const L = 12.0; // hall length along X
const HW = 3.6; // half its width
const WH = 2.0; // wall height
const RISE = 4.3; // thatch at about 50 degrees
const OV = 0.7;
const HZ = -2.0; // hall centre
const E = 10.2; // the enclosure fence

/** One slope of a thatched roof, ridge along X: s = +1 the front (+Z) slope, -1 the back. */
function thatchSlope(b: Builder, s: 1 | -1, color: number, at: Vec3): void {
  const t = 0.45;
  const drop = (OV * RISE) / HW;
  const zo = s * (HW + OV);
  // profile in world (z, y), extruded along X; rotY = pi/2 maps local x to world -z
  b.extrude(
    [[0, RISE + t], [0, RISE - 0.05], [-zo, -drop], [-zo, -drop + t]],
    L + OV * 2,
    color,
    { at, rotY: Math.PI / 2 },
  );
}

export const gaulishHall: BuildingDef = {
  id: 'gaulish-hall',
  name: 'Feasting hall',
  style: 'La Tène (late Iron Age)',
  date: '3rd to 1st century BC',
  summary:
    'Among the Gauls hospitality was politics: a chief kept his followers by feasting them, and a stranger at the door was fed before he was asked his business. ' +
    'This long hall of oak posts, wattle and daub under a steep thatch stands in its own fenced enclosure, with a granary on posts in the yard. Inside, a fire burns on a clay hearth between iron firedogs, meat seethes in a bronze cauldron hung from the roof, and the company sits on hay and hides at low tables, as the Greek traveller Posidonius saw them. ' +
    'At first the feast is washed down with beer and mead. From the later second century BC the drink is Italian wine, shipped up the Rhône and the Saône in amphorae by the hundred thousand; Diodorus says a merchant could get a slave for a single jar. Their broken sherds, heaped by the fence, are how archaeologists find such feasts.',
  materials: ['oak posts', 'wattle and daub', 'straw thatch', 'iron and bronze', 'Italian amphorae'],
  lookFor: [
    { label: 'Hearth and firedogs', note: 'A clay hearth in the middle of the floor, with a pair of iron firedogs (chenets) whose ends are forged as animal heads, often oxen or rams, to hold the logs and spits.', at: [0.9, 0.8, HZ] },
    { label: 'Cauldron', note: 'A bronze cauldron hung on a chain from a tie beam over the fire: the feast was mostly boiled meat, pork above all.', at: [0, 2.4, HZ - 0.9] },
    { label: 'Wine amphorae', note: 'Tall jars of the Dressel 1 type, made in Italy and filled with wine, which reach the north only from the later second century BC. Gauls drank it neat, which shocked the Greeks and Romans.', at: [-7.4, 1.2, 6.2] },
    { label: 'Steep thatch', note: 'Straw thatch on a roof of about fifty degrees sheds the rain fast; smoke from the open hearth finds its own way out through it.', at: [4.0, WH + 2.6, HZ + 1.6] },
    { label: 'Enclosure fence', note: 'A fence of posts and woven hurdles marks out the household’s ground, with a gateway on the lane.', at: [6.0, 1.4, E] },
  ],
  build(b) {
    const thatch = b.pick([P.thatch, tint(P.thatch, -0.04), P.reed]);
    const daub = b.pick([P.daub, tint(P.daub, -0.04), P.cob]);
    const post = P.oakDark;
    const amph = b.pick([P.terracotta, tint(P.terracotta, 0.05), 0xc98a62]);

    ground(b, 21.0, 21.0, P.earth, [0, 0], 0.03);
    ground(b, L - 0.4, 2 * HW - 0.4, tint(P.earth, -0.06), [0, HZ], 0.05);

    // ---------------- the hall: posts and wattle-and-daub walls
    const zf = HZ + HW;
    const zb = HZ - HW;
    const dw = 1.4; // door width
    b.box(L, WH, 0.2, daub, { at: [0, 0, zb + 0.1] });
    b.sym((s) => {
      const len = L / 2 - dw / 2;
      b.box(len, WH, 0.2, daub, { at: [s * (dw / 2 + len / 2), 0, zf - 0.1] });
      b.box(0.2, WH, 2 * HW, daub, { at: [s * (L / 2 - 0.1), 0, HZ] });
      // the gable ends filled with daub over a tie beam
      b.extrude([[-HW, 0], [HW, 0], [0, RISE - 0.2]], 0.16, daub, { at: [s * (L / 2 - 0.1), WH, HZ], rotY: Math.PI / 2 });
    });
    b.box(dw, 0.35, 0.2, daub, { at: [0, WH - 0.35, zf - 0.1] });
    b.panel(dw - 0.1, WH - 0.4, P.timberBlack, { at: [0, 0, zf - 0.21], facing: '-z', depth: 0.01 });
    // the wall posts showing in the daub
    for (const x of spread(7, -L / 2 + 0.1, L / 2 - 0.1)) {
      b.box(0.22, WH, 0.24, post, { at: [x, 0, zf - 0.08] });
      b.box(0.22, WH, 0.24, post, { at: [x, 0, zb + 0.08] });
    }
    for (const z of spread(3, zb + 1.2, zf - 1.2)) b.sym((s) => b.box(0.24, WH, 0.22, post, { at: [s * (L / 2 - 0.08), 0, z] }));
    // the door: a plank door standing open, and a porch on two posts
    b.box(0.08, WH - 0.45, 1.3, P.oak, { at: [dw / 2 - 0.05, 0, zf + 0.6], rotY: 0.25 });
    b.sym((s) => b.box(0.18, 2.4, 0.18, post, { at: [s * 1.3, 0, zf + 1.6] }));
    b.box(3.2, 0.16, 0.2, post, { at: [0, 2.4, zf + 1.6] });
    b.gable(3.2, 1.9, 0.9, thatch, { at: [0, 2.4, zf + 0.75], ridge: 'z', overhang: 0.2, thick: 0.3 });

    // ---------------- the roof: tie beams and rafters, then the thatch (front slope left off to look in)
    for (const x of spread(4, -L / 2 + 0.6, L / 2 - 0.6)) b.box(0.2, 0.2, 2 * HW, post, { at: [x, WH, HZ] });
    b.box(L + 0.4, 0.2, 0.2, post, { at: [0, WH + RISE - 0.25, HZ] });
    for (const x of spread(7, -L / 2 + 0.2, L / 2 - 0.2)) {
      b.sym((s) => b.beam([x, WH - 0.2, HZ + s * (HW + 0.3)], [x, WH + RISE - 0.1, HZ], 0.13, 0.13, post));
    }
    thatchSlope(b, -1, thatch, [0, WH, HZ]);
    if (!b.cutaway) thatchSlope(b, 1, thatch, [0, WH, HZ]);
    // ridge: a roll of thatch held by crossed rods
    b.log(0.28, L + OV * 2 + 0.1, tint(thatch, -0.08), { at: [0, WH + RISE + 0.05, HZ], segs: 6 });

    // ---------------- inside: the hearth, firedogs, cauldron and low tables
    b.cyl(1.2, 0.1, 0xa47a55, { at: [0, 0.05, HZ], segs: 10 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.box(0.3, 0.16, 0.24, P.rubble, { at: [Math.sin(a) * 1.25, 0.05, HZ + Math.cos(a) * 1.25], rotY: a });
    }
    b.sym((s) => {
      // an iron firedog: a bar on two legs with an upright ending in an ox head at each end
      b.box(1.1, 0.06, 0.06, P.iron, { at: [s * 0.45, 0.3, HZ] , rotY: Math.PI / 2 });
      for (const z of [-0.55, 0.55]) {
        b.box(0.06, 0.6, 0.06, P.iron, { at: [s * 0.45, 0.15, HZ + z] });
        b.box(0.1, 0.12, 0.16, P.iron, { at: [s * 0.45, 0.72, HZ + z + 0.05] });
        b.box(0.18, 0.03, 0.03, P.iron, { at: [s * 0.45, 0.82, HZ + z] });
      }
    });
    for (let i = 0; i < 4; i++) b.box(0.14, 0.14, 1.3, P.oakDark, { at: [-0.15 + i * 0.1, 0.18, HZ], rotY: 0.3 * i });
    b.blob(0.22, 0xf0a040, { at: [0, 0.35, HZ], stretch: [1.2, 1.4, 1.2], detail: 0 });
    // the cauldron on a chain from the tie beam
    b.lathe([[0, 0], [0.3, 0.05], [0.42, 0.3], [0.38, 0.55], [0.4, 0.58], [0, 0.58]], P.bronze, { at: [0, 0.7, HZ - 0.9], segs: 8 });
    b.box(0.04, WH - 1.28 + RISE * 0.12, 0.04, P.iron, { at: [0, 1.28, HZ - 0.9] });
    b.box(L * 0.5, 0.16, 0.16, post, { at: [0, WH + RISE * 0.12, HZ - 0.9] });
    // low tables, hides and hay along the walls; a hide on the floor by each
    for (const [x, z] of [[-3.8, HZ + 1.8], [-3.8, HZ - 1.8], [3.8, HZ + 1.8], [3.8, HZ - 1.8]] as const) {
      b.box(2.0, 0.06, 0.6, P.oak, { at: [x, 0.3, z] });
      b.sym((s) => b.box(0.08, 0.3, 0.5, P.oakDark, { at: [x + s * 0.85, 0, z] }));
      b.box(2.2, 0.08, 0.7, b.pick([0x8a6a4a, 0x6b5038, P.thatchOld]), { at: [x, 0.05, z + Math.sign(z - HZ) * 0.7] });
    }
    b.lathe([[0, 0], [0.18, 0], [0.24, 0.3], [0.2, 0.5], [0, 0.5]], P.bronze, { at: [-1.6, 0.05, HZ + 2.6], segs: 7 });
    amphora(b, [L / 2 - 0.6, 0.05, HZ - 2.8], amph, 0.15, 0.3);
    amphora(b, [L / 2 - 1.1, 0.05, HZ - 2.9], amph, 0.12, -0.2);

    // ---------------- the granary on four posts
    b.group({ at: [7.2, 0, -8.0] }, () => {
      for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]] as const) b.box(0.2, 1.1, 0.2, post, { at: [x, 0, z] });
      b.box(2.3, 0.15, 2.3, P.oak, { at: [0, 1.1, 0] });
      b.box(2.0, 1.4, 2.0, daub, { at: [0, 1.25, 0] });
      b.panel(0.6, 0.9, P.timberBlack, { at: [0, 1.4, 1.0], facing: '+z' });
      b.gable(2.0, 2.0, 1.4, thatch, { at: [0, 2.65, 0], overhang: 0.35, thick: 0.3, wall: daub });
      b.beam([0, 0.0, 2.0], [0, 1.2, 1.15], 0.25, 0.08, P.oak);
    });
    // a storage pit, covered, and a woodpile
    b.cyl(0.8, 0.12, P.soil, { at: [-7.0, 0, -7.6], segs: 8 });
    for (let i = 0; i < 5; i++) b.log(0.12, 1.6, P.bark, { at: [-4.0, i < 3 ? 0 : 0.2, -7.7 + (i % 3) * 0.25], segs: 5 });

    // ---------------- Italian wine: jars stacked by the door, broken ones heaped by the fence
    for (const [x, z, t, r] of [[-3.0, HZ + HW + 0.5, 0.18, 0], [-3.5, HZ + HW + 0.45, 0.14, 0.4], [-4.0, HZ + HW + 0.5, 0.2, -0.3]] as const) {
      amphora(b, [x, 0.03, z], amph, t, r);
    }
    for (let i = 0; i < 6; i++) {
      amphora(b, [-8.4 + (i % 3) * 0.55, 0.05 + Math.floor(i / 3) * 0.2, 6.0 + (i % 2) * 0.4], tint(amph, (i % 3) * 0.03 - 0.03), 1.45, 0.4 + i * 0.7);
    }
    b.blob(0.8, tint(amph, -0.12), { at: [-7.2, 0.1, 7.0], stretch: [1.4, 0.35, 1.0], detail: 0 });
    for (let i = 0; i < 6; i++) b.box(0.25, 0.04, 0.18, amph, { at: [-6.4 + b.range(-0.8, 0.8), 0.04, 7.6 + b.range(-0.6, 0.6)], rotY: b.range(0, 3) });

    // ---------------- the enclosure: fence of posts and hurdles, a gateway on the lane
    const fh = 1.4;
    const gate = 1.8;
    fence(b, [-E, -E], [E, -E], fh, post, P.wattle);
    fence(b, [-E, -E], [-E, E], fh, post, P.wattle);
    fence(b, [E, -E], [E, E], fh, post, P.wattle);
    fence(b, [-E, E], [-gate, E], fh, post, P.wattle);
    fence(b, [gate, E], [E, E], fh, post, P.wattle);
    b.sym((s) => b.box(0.3, 2.8, 0.3, post, { at: [s * gate, 0, E] }));
    b.box(2 * gate + 0.6, 0.25, 0.3, post, { at: [0, 2.8, E] });

    // ---------------- colliders: the hall and granary; the yard is open
    b.collider(L, 2 * HW, { at: [0, 0, HZ] });
    b.collider(2.3, 2.3, { at: [7.2, 0, -8.0] });
    b.collider(2 * E, 0.3, { at: [0, 0, -E] });
    b.sym((s) => b.collider(0.3, 2 * E, { at: [s * E, 0, 0] }));
    b.sym((s) => b.collider(E - gate, 0.3, { at: [s * (E + gate) / 2, 0, E] }));
  },
};
