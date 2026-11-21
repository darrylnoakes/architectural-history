import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { BANK, WATER, amphora, donkey, jar, lin, riverWall, roofRise } from './shared';

const LAVA = 0x6a6762;

/**
 * A Pompeian donkey mill: a masonry base with a raised rim to catch the flour, the fixed cone (meta)
 * and the hollow hourglass (catillus) that turned on it, with a timber frame through its waist.
 */
function lavaMill(b: Builder, at: Vec3, turn: number) {
  b.group({ at, scale: 1.2 }, () => {
    b.cyl(0.95, 0.5, tint(P.plaster, -0.08), { segs: 14 });
    b.lathe(
      [
        [0.95, 0.5],
        [0.95, 0.68],
        [0.85, 0.68],
        [0.82, 0.52],
      ],
      LAVA,
      { segs: 14 },
    );
    b.cone(0.48, 0.65, LAVA, { at: [0, 0.5, 0], segs: 10 }); // meta (mostly hidden)
    b.lathe(
      [
        [0.55, 0.55],
        [0.3, 1.1],
        [0.55, 1.65],
        [0.45, 1.65],
        [0.22, 1.1],
        [0.45, 0.6],
      ],
      LAVA,
      { segs: 10 },
    ); // catillus: the hourglass, open at both ends
    b.group({ rotY: turn }, () => {
      b.box(1.5, 0.16, 0.16, P.oakDark, { at: [0, 1.02, 0] });
      b.box(0.16, 0.16, 1.5, P.oakDark, { at: [0, 1.02, 0] });
      b.beam([0.75, 1.1, 0], [1.9, 1.0, 0], 0.1, 0.1, P.oak); // the draught pole for the donkey
    });
  });
}

export const bakery: BuildingDef = {
  id: 'bakery',
  name: 'Bakery (pistrinum)',
  style: 'Roman Imperial',
  date: 'c. AD 60',
  summary:
    'A Roman town bought its bread from bakeries like this, where the grain was milled, the dough mixed and the loaves baked and sold under one roof. ' +
    'Donkeys or mules plodded round the hourglass-shaped mills of hard volcanic lava, grinding the corn between the turning upper stone and the fixed cone beneath, and a mixing machine kneaded the dough. ' +
    'The loaves, scored into eight wedges like those found carbonised at Pompeii, were baked in a great domed oven and sold over a counter on the street. ' +
    'The walls are now mortared rubble and concrete faced with small stones and courses of brick, plastered and painted.',
  materials: ['concrete faced with tufa and brick', 'lava millstones', 'painted plaster', 'roof tiles'],
  modelledOn: 'The bakeries of Pompeii, such as those of Popidius Priscus (VII.2.22) and Modestus (VII.1.36), simplified',
  lookFor: [
    { label: 'Lava mills', note: 'The hollow hourglass (catillus) turned on a fixed cone (meta); grain poured in at the top and flour spilled out onto the rim below.', at: [-8, 2.0, 1.0] },
    { label: 'Donkey at the mill', note: 'Harnessed to the wooden frame through the mill’s waist, a donkey or mule walked in circles all day, often blindfolded.', at: [-10.6, 1.6, 2.6] },
    { label: 'Domed oven', note: 'A brick dome was heated with a wood fire, the ashes raked out and the loaves slid in to bake in the stored heat.', at: [9.0, 3.8, -1.5] },
    { label: 'Dough-mixing machine', note: 'A paddle turning in a lava basin, worked by hand or by an animal, kneaded the dough before it was shaped.', at: [3.8, 1.4, -5.0] },
    { label: 'Shop counter', note: 'Bread was sold from a masonry counter in the wide street opening, closed at night with wooden boards.', at: [-3.0, 1.4, 10.3] },
  ],
  influences: ['roman-concrete'],
  build(b) {
    const plaster = b.pick([P.plaster, P.intonacoCream, P.stucco]);
    const dado = b.pick([P.intonacoRed, P.terracottaPainted]);
    const brick = b.pick([P.brickRed, P.brickOrange]);
    const tufa = P.tufa;

    // ---- basalt-paved mill court
    b.box(34, 0.05, 20, tint(P.cobble, 0.06), { at: [0, 0, 0], jitter: false });
    riverWall(b, -17.6, 17.6, tufa, { coping: P.travertine });

    // ---- the street range: shop and house, two storeys, painted plaster with a red dado
    const fz = 7.6;
    const fd = 5.0;
    const H = 6.6;
    const front = fz + fd / 2;
    const RW = 24;
    const rx = -5;
    b.box(RW, H, fd, plaster, { at: [rx, 0, fz] });
    b.box(RW + 0.02, 1.1, fd + 0.02, dado, { at: [rx, 0, fz] });
    b.box(RW + 0.04, 0.2, fd + 0.04, tint(plaster, -0.06), { at: [rx, 3.3, fz] });
    // the court wall to the street, with the carriage gate
    b.box(10, 3.6, 0.6, plaster, { at: [12, 0, front - 0.3] });
    b.box(10.02, 1.1, 0.62, dado, { at: [12, 0, front - 0.3] });
    b.box(10.2, 0.2, 0.8, P.romanTile, { at: [12, 3.6, front - 0.3] });
    b.box(0.6, 3.6, 3.0, plaster, { at: [16.7, 0, front - 1.8] });
    const rr = roofRise(fd, 20);
    b.gable(RW, fd, rr, P.romanTile, { at: [rx, H, fz], overhang: 0.5, wall: plaster });
    // brick quoins and bands at the corners
    b.sym((s) => {
      for (let y = 0; y < H; y += 0.6) b.box(0.62, 0.3, 0.62, brick, { at: [rx + s * (RW / 2 - 0.28), y, front - 0.3], jitter: false });
    });
    // the shop: a wide opening with an L-shaped counter faced in marble, jars set in it
    const sx = -3;
    b.panel(5.2, 3.0, P.timberBlack, { at: [sx, 0, front], facing: '+z' });
    b.box(5.6, 0.3, 0.3, P.oakDark, { at: [sx, 3.0, front + 0.1] });
    b.box(3.4, 1.0, 0.7, P.marble, { at: [sx - 0.6, 0, front - 0.1] });
    b.box(0.7, 1.0, 1.8, P.marble, { at: [sx - 2.0, 0, front - 1.2] });
    b.box(3.5, 0.06, 0.78, tint(P.marble, -0.06), { at: [sx - 0.6, 1.0, front - 0.1] });
    for (const x of [sx - 1.6, sx - 0.4, sx + 0.6]) b.dome(0.2, P.pietraForte, { at: [x, 1.06, front - 0.1], squash: 0.45, segs: 8 }); // loaves
    // shelves of loaves behind the counter
    b.box(4.4, 1.4, 0.4, P.oak, { at: [sx, 0.4, front - 2.0] });
    // the house door, a carriage gate to the court, and small upper windows
    b.panel(1.4, 2.6, P.oakDark, { at: [4.5, 0, front], facing: '+z' });
    b.box(1.8, 0.2, 0.25, P.travertine, { at: [4.5, 2.6, front + 0.05] });
    b.panel(3.0, 3.2, P.oakDark, { at: [11, 0, front], facing: '+z', shape: 'round' });
    b.panel(0.25, 3.3, P.travertine, { at: [9.4, 0, front], facing: '+z', depth: 0.1 });
    b.panel(0.25, 3.3, P.travertine, { at: [12.6, 0, front], facing: '+z', depth: 0.1 });
    for (const x of lin(7, -15, 5)) b.window(0.7, 0.8, { at: [x, 4.3, front], facing: '+z', frame: tint(plaster, -0.1), glass: P.timberBlack });
    // a painted inscription panel and a phallus-shaped good-luck plaque, as on many Pompeian bakeries, here simplified to a plaque
    b.panel(3.4, 0.7, P.cream, { at: [sx, 3.4, front], facing: '+z' });
    for (const x of lin(5, sx - 1.3, sx + 1.3)) b.panel(0.38, 0.12, P.intonacoRed, { at: [x, 3.68, front], facing: '+z', depth: 0.08 });
    // back of the street range on the court: openings
    for (const x of [-12, -6, 0]) b.panel(1.4, 2.4, P.timberBlack, { at: [x, 0, fz - fd / 2], facing: '-z', shape: 'round' });
    for (const x of lin(6, -15, 5)) b.window(0.6, 0.7, { at: [x, 4.3, fz - fd / 2], facing: '-z', frame: tint(plaster, -0.1), glass: P.timberBlack });

    // ---- the mill court: four lava mills in a row, two donkeys at work
    const mz = 1.0;
    const mills = [-12, -8, -4, 0];
    for (const [i, x] of mills.entries()) lavaMill(b, [x, 0, mz], (i * Math.PI) / 5 + b.range(-0.2, 0.2));
    donkey(b, [-10.6, 0, 2.6], 0.4);
    donkey(b, [-2.2, 0, -0.8], 3.6, 0x6f6458);
    // sacks of grain waiting
    for (let i = 0; i < 4; i++) b.blob(0.35, P.wattle, { at: [-14.5 + (i % 2) * 0.6, 0.3 + Math.floor(i / 2) * 0.45, -2.2], stretch: [1, 1.2, 0.8] });

    // ---- the bakehouse: oven, kneading room, under a tiled roof on the court’s east side
    const ox = 9.0;
    const oz = -1.5;
    // kneading and shaping room behind, its walls of rubble with brick bands
    b.box(12, 4.2, 6.5, plaster, { at: [ox, 0, -6.6] });
    b.box(12.02, 1.0, 6.52, dado, { at: [ox, 0, -6.6] });
    b.gable(12, 6.5, roofRise(6.5, 20), P.romanTile, { at: [ox, 4.2, -6.6], overhang: 0.4, wall: plaster });
    b.panel(2.0, 2.6, P.timberBlack, { at: [ox - 3.5, 0, -3.35], facing: '+z', shape: 'round' });
    b.panel(1.4, 2.4, P.timberBlack, { at: [ox + 3.5, 0, -3.35], facing: '+z', shape: 'round' });
    for (const x of [ox - 4, ox, ox + 4]) b.window(0.8, 0.7, { at: [x, 2.9, -9.85], facing: '-z', frame: tint(plaster, -0.1), glass: P.timberBlack });
    b.panel(1.2, 2.2, P.oakDark, { at: [ox + 2, 0, -9.85], facing: '-z' });
    // the dough mixer just outside the kneading-room door: a lava basin with a paddle shaft
    b.lathe(
      [
        [0.5, 0],
        [0.55, 0.75],
        [0.45, 0.75],
        [0.4, 0.2],
        [0, 0.2],
      ],
      LAVA,
      { at: [ox - 5.2, 0, -2.4], segs: 12 },
    );
    b.cyl(0.07, 1.4, P.oakDark, { at: [ox - 5.2, 0.2, -2.4], segs: 6 });
    b.beam([ox - 5.2, 1.35, -2.4], [ox - 4.0, 1.35, -2.4], 0.08, 0.08, P.oak);
    // the oven: a masonry block with the dome rising out of it, an arched mouth and an antechamber with a flue
    b.box(4.4, 2.2, 4.0, tint(plaster, -0.05), { at: [ox, 0, oz] });
    b.dome(1.85, brick, { at: [ox, 2.2, oz], squash: 0.6, segs: 14 });
    b.box(4.4, 0.12, 4.0, tint(plaster, -0.12), { at: [ox, 2.2, oz] });
    // antechamber on the front of the oven
    b.box(2.4, 2.4, 1.2, brick, { at: [ox, 0, oz + 2.6] });
    b.panel(1.2, 1.0, P.timberBlack, { at: [ox, 0.9, oz + 3.2], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(0.8, 0.5, 0x7a3a22, { at: [ox, 0.95, oz + 3.24], facing: '+z', shape: 'round', depth: 0.04 });
    b.box(1.6, 0.12, 0.5, P.travertine, { at: [ox, 0.82, oz + 3.4] }); // loading sill
    b.box(0.9, 2.4, 0.9, brick, { at: [ox, 2.4, oz + 2.6] }); // flue
    b.box(1.1, 0.15, 1.1, brick, { at: [ox, 4.8, oz + 2.6] });
    // wood store and a water jar beside the oven
    for (let i = 0; i < 6; i++) b.log(0.08, 1.6, P.bark, { at: [ox + 3.2, 0.05 + Math.floor(i / 3) * 0.16, oz + 1.2 + (i % 3) * 0.18], axis: 'z', segs: 5 });
    jar(b, [ox - 3.0, 0, oz + 1.6], 1.1);

    // ---- the stable and grain store on the river side, with a door to the landing
    const gx = -8;
    const gz = -7.6;
    b.box(15, 3.4, 4.6, plaster, { at: [gx, 0, gz] });
    b.box(15.02, 1.0, 4.62, dado, { at: [gx, 0, gz] });
    b.gable(15, 4.6, roofRise(4.6, 20), P.romanTile, { at: [gx, 3.4, gz], overhang: 0.4, wall: plaster });
    for (const x of [gx - 5, gx - 1.5]) b.panel(1.6, 2.4, P.timberBlack, { at: [x, 0, gz + 2.3], facing: '+z', shape: 'round' });
    b.panel(1.6, 2.4, P.oakDark, { at: [gx + 3.5, 0, gz + 2.3], facing: '+z' });
    for (const x of lin(4, gx - 6, gx + 6)) b.panel(0.5, 0.4, P.timberBlack, { at: [x, 2.6, gz - 2.3], facing: '-z' });
    b.panel(1.6, 2.4, P.oakDark, { at: [gx + 4.5, 0, gz - 2.3], facing: '-z', shape: 'round' });
    // a feed trough and a third donkey resting
    b.box(2.0, 0.5, 0.5, P.tufa, { at: [gx - 3.2, 0, gz + 3.0] });
    donkey(b, [gx - 3.2, 0, gz + 4.0], Math.PI, 0x7d7064);
    // the grain landing: travertine steps down to a barge with sacks
    b.stairs(2.4, -WATER + 0.15, 1.8, 5, P.travertine, { at: [gx + 4.5, WATER - 0.15, BANK - 0.7], rotY: Math.PI });
    b.group({ at: [gx + 4.5, WATER - 0.2, BANK - 3.2] }, () => {
      b.extrude(
        [
          [-3.2, 0.9],
          [-2.6, 0],
          [2.4, 0],
          [3.2, 1.1],
          [2.9, 1.1],
          [2.4, 0.9],
        ],
        2.0,
        P.oak,
      );
      b.box(5.0, 0.06, 1.8, P.oakDark, { at: [0, 0.6, 0] });
      for (let i = 0; i < 5; i++) b.blob(0.32, P.wattle, { at: [-1.5 + i * 0.7, 0.85, (i % 2) * 0.4 - 0.2], stretch: [1, 0.7, 1.2] });
    });
    for (let i = 0; i < 3; i++) amphora(b, [gx + 6.4 + i * 0.45, 0, gz + 2.8]);

    b.tree(5, { at: [15.5, 0, -8.5], kind: 'olive' });

    b.collider(RW, fd, { at: [rx, 0, fz] });
    b.collider(10, 0.6, { at: [12, 0, front - 0.3] });
    b.collider(15, 4.6, { at: [gx, 0, gz] });
    b.collider(12, 6.5, { at: [ox, 0, -6.6] });
    b.collider(4.4, 5.2, { at: [ox, 0, oz + 0.6] });
  },
};
