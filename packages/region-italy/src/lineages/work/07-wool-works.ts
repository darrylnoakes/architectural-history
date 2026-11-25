import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, coppiRoof, jar, lin, millRace, quayWall, roofRise, water, waterSteps } from './shared';

/** A dyer's vat: a copper cauldron set in a masonry furnace with a stoke-hole. */
function dyeVat(b: Builder, x: number, z: number, liquor: number, stone: number) {
  b.box(1.9, 1.0, 1.9, stone, { at: [x, 0, z] });
  b.cyl(0.8, 0.2, 0xa0603a, { at: [x, 1.0, z], segs: 12 }); // copper rim
  water(b, 1.3, 1.3, [x, 1.17, z], liquor);
  b.panel(0.5, 0.45, P.timberBlack, { at: [x, 0.05, z + 0.95], facing: '+z', shape: 'round' });
}

export const woolWorks: BuildingDef = {
  id: 'wool-works',
  name: 'Wool guild dye house and tiratoio',
  style: 'Gothic',
  date: 'c. 1350',
  summary:
    'Wool cloth made the fortunes of the central Italian cities, and its guild, the Arte della Lana, regulated every stage of the work. ' +
    'Most of it was done by spinners and weavers in their own homes, but the heavy, smelly and space-hungry stages came to big riverside works: dye houses with vats over furnaces, where cloth was dyed and then rinsed in the river, and the tiratoio. ' +
    'The tiratoio was a tall building of open timber galleries where wet cloth was stretched on frames to dry under cover to the exact length and width the guild required. ' +
    'The stone ground floor and the deep tiled roof are Gothic central Italy; the guild’s arms over the door show who controls the trade.',
  materials: ['stone', 'brick', 'oak and chestnut galleries', 'coppi roof tiles', 'copper vats'],
  lookFor: [
    { label: 'Tiratoio galleries', note: 'Open timber floors one above another, where cloth hung on stretching frames in the wind but out of the rain.', at: [-8, 11.0, 5.2] },
    { label: 'Dye vats', note: 'Copper cauldrons over small furnaces held the hot dye: woad for blue, madder for red, and costly kermes for scarlet.', at: [9.0, 1.8, -1.5] },
    { label: 'Furnace chimneys', note: 'Each vat had its own fire, and the dye house roof bristled with chimneys.', at: [10.5, 9.0, -7.2] },
    { label: 'Rinsing steps', note: 'Dyed cloth was rinsed in the fast water of the old mill channel, which ran blue and red below the dye works.', at: [6.0, -0.6, -12.0] },
    { label: 'Guild arms', note: 'A shield with the lamb, the emblem of the wool guild in Florence and other cities, marks the guild’s property.', at: [-8, 5.6, 7.5] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.pietraForte, tint(P.pietraForte, 0.04), P.rubble]);
    const brick = b.pick([P.cotto, P.brickOrange]);
    const plaster = b.pick([P.intonacoCream, P.intonacoOchre]);
    const timber = b.pick([P.oak, tint(P.oak, 0.05)]);

    // the Roman quay wall, and the weir and channel of the old fulling mill, which still runs fast past the dye house
    quayWall(b, tint(stone, -0.06));
    millRace(b, tint(stone, -0.1));
    b.box(34, 0.04, 20, tint(P.gravel, -0.04), { at: [0, 0, 0], jitter: false });

    // ---- the tiratoio: stone ground floor, three open timber galleries, a deep roof
    const tx = -8;
    const tz = 3.2;
    const TW = 16;
    const TD = 8.4;
    const g = 4.4; // ground floor
    const fl = 3.1; // gallery storey
    const n = 3;
    b.archWall(TW, g, 0.6, stone, { at: [tx, 0, tz + TD / 2 - 0.3], facing: '+z', openings: 4, openW: 2.6, openH: 3.4 });
    b.archWall(TW, g, 0.6, stone, { at: [tx, 0, tz - TD / 2 + 0.3], facing: '-z', openings: 4, openW: 2.6, openH: 3.4 });
    b.sym((s) => b.box(0.6, g, TD, stone, { at: [tx + s * (TW / 2 - 0.3), 0, tz] }));
    for (const x of lin(4, tx - 6, tx + 6)) b.panel(2.6, 3.4, P.oakDark, { at: [x, 0, tz + TD / 2 - 0.6], facing: '+z', shape: 'round' });
    // galleries: posts, floors, a rail; corner piers of brick carry the roof
    const top = g + fl * n;
    b.sym((s) => {
      for (const z of [tz - TD / 2 + 0.4, tz + TD / 2 - 0.4]) b.box(0.8, top - g, 0.8, brick, { at: [tx + s * (TW / 2 - 0.4), g, z] });
    });
    for (let k = 0; k < n; k++) {
      const y = g + k * fl;
      b.box(TW, 0.25, TD, tint(timber, -0.1), { at: [tx, y, tz] });
      for (const x of lin(7, tx - TW / 2 + 1.6, tx + TW / 2 - 1.6)) {
        for (const z of [tz - TD / 2 + 0.3, tz + TD / 2 - 0.3]) b.box(0.2, fl, 0.2, timber, { at: [x, y + 0.25, z] });
      }
      for (const z of [tz - TD / 2 + 0.3, tz + TD / 2 - 0.3]) {
        b.box(TW - 1.6, 0.1, 0.1, timber, { at: [tx, y + 1.2, z] });
        b.box(TW - 1.6, 0.3, 0.3, timber, { at: [tx, y + fl - 0.05, z] });
      }
      // lengths of cloth hanging on the stretching frames inside
      const cols = [P.intonacoRed, P.doorBlue, P.cream, P.doorGreen, P.intonacoRed, P.cream];
      for (const [i, x] of lin(6, tx - 5.8, tx + 5.8).entries()) {
        b.box(1.3, fl - 0.8, 0.04, cols[(i + k) % cols.length], { at: [x, y + 0.5, tz + 1.2], jitter: false });
        b.box(1.3, fl - 0.8, 0.04, cols[(i + k + 2) % cols.length], { at: [x, y + 0.5, tz - 1.2], jitter: false });
      }
    }
    b.box(TW, 0.3, TD, tint(timber, -0.1), { at: [tx, top, tz] });
    coppiRoof(b, TW + 0.4, TD + 0.4, [tx, top + 0.3, tz], { overhang: 1.1, wall: tint(timber, -0.05) });
    // guild arms over the central arches: a blue shield with the lamb and banner
    b.panel(1.3, 1.4, P.doorBlue, { at: [tx, g - 0.1 + 0.4, tz + TD / 2], facing: '+z', depth: 0.1 });
    b.blob(0.32, P.limewash, { at: [tx, g + 0.8, tz + TD / 2 + 0.2], stretch: [1.2, 0.8, 0.5] });
    b.box(0.04, 0.8, 0.04, P.limewash, { at: [tx + 0.35, g + 0.8, tz + TD / 2 + 0.2] });
    b.box(0.35, 0.25, 0.03, P.intonacoRed, { at: [tx + 0.53, g + 1.32, tz + TD / 2 + 0.2] });
    b.panel(1.3, 0.3, P.doorBlue, { at: [tx, g + 0.0, tz + TD / 2], facing: '+z', shape: 'round', depth: 0.1 });

    // ---- the dye house by the river: a long stone shed with an open front of vats and many chimneys
    const dx = 9;
    const dz = -6;
    const DW = 13;
    const DD = 6.4;
    const dh = 5.0;
    b.box(DW, dh, 0.6, stone, { at: [dx, 0, dz - DD / 2 + 0.3] });
    b.sym((s) => b.box(0.6, dh, DD, stone, { at: [dx + s * (DW / 2 - 0.3), 0, dz] }));
    b.gable(DW, DD, roofRise(DD, 22), P.coppi, { at: [dx, dh, dz], overhang: 0.45, wall: stone });
    // open front on stone piers
    for (const x of lin(4, dx - DW / 2 + 0.3, dx + DW / 2 - 0.3)) b.box(0.6, dh, 0.6, stone, { at: [x, 0, dz + DD / 2 - 0.3] });
    b.box(DW, 0.5, 0.6, stone, { at: [dx, dh - 0.5, dz + DD / 2 - 0.3] });
    const liquors = [0x2f4f7a, 0x9a2e2a, 0x3a5a8a, 0x8a3a5a];
    for (const [i, x] of lin(4, dx - 4.6, dx + 4.6).entries()) {
      dyeVat(b, x, dz + 0.8, liquors[i], tint(brick, -0.05));
      b.chimney(0.8, dh + roofRise(DD, 22) + 1.6, 0.8, brick, { at: [x, 0, dz - 1.2] });
      b.beam([x, 1.0, dz + 0.4], [x, 1.6, dz - 0.8], 0.5, 0.4, brick); // flue from the furnace
    }
    // a windlass beam for lifting cloth out of the vats
    b.box(DW - 1.4, 0.2, 0.2, timber, { at: [dx, 3.0, dz + 0.8] });
    // river side: rinsing steps and a timber platform on posts
    b.panel(1.6, 2.4, P.oakDark, { at: [dx - 3, 0, dz - DD / 2], facing: '-z', shape: 'pointed' });
    for (const x of [dx + 1.5, dx + 4.5]) b.window(0.8, 1.2, { at: [x, 2.0, dz - DD / 2], facing: '-z', shape: 'pointed', frame: tint(stone, 0.06), glass: P.timberBlack });
    waterSteps(b, dx - 3, 2.4, 1.8, tint(stone, -0.04));
    b.box(4.0, 0.14, 2.0, timber, { at: [dx + 3, -0.2, BANK - 1.0] });
    for (const x of [dx + 1.2, dx + 4.8]) b.cyl(0.12, 1.2, P.oakDark, { at: [x, WATER - 0.2, BANK - 1.8], segs: 5 });
    // a length of blue cloth being rinsed, trailing into the river
    b.beam([dx + 2.4, -0.05, BANK - 1.0], [dx + 2.0, WATER + 0.2, BANK - 2.2], 1.0, 0.03, 0x34558a);
    // woad balls and madder in baskets, firewood, and jars of mordant (alum)
    for (let i = 0; i < 4; i++) b.cyl(0.35, 0.5, P.wattle, { at: [dx + 6.8 + (i % 2) * 0.8, 0, dz + 4.2 + Math.floor(i / 2) * 0.8], segs: 8 });
    for (let i = 0; i < 4; i++) b.sphere(0.2, 0x4a5a3a, { at: [dx + 6.8 + (i % 2) * 0.8, 0.55, dz + 4.2 + Math.floor(i / 2) * 0.8], segs: 6 });
    for (let i = 0; i < 3; i++) jar(b, [dx - 6.2, 0, dz + 4.0 + i * 0.9], 0.9);
    for (let i = 0; i < 8; i++) b.log(0.1, 2.0, P.bark, { at: [dx + 1.0, 0.05 + Math.floor(i / 4) * 0.2, dz + 4.0 + (i % 4) * 0.22], segs: 5 });

    // ---- a small counting house for the guild’s officials, plastered, on the street
    const ox = 10.5;
    const oz = 6.5;
    b.box(9, 6.2, 6, plaster, { at: [ox, 0, oz] });
    coppiRoof(b, 9, 6, [ox, 6.2, oz], { wall: plaster });
    b.panel(1.4, 2.6, P.oakDark, { at: [ox - 2.5, 0, oz + 3], facing: '+z', shape: 'round' });
    b.panel(1.8, 2.9, tint(stone, 0.06), { at: [ox - 2.5, 0, oz + 2.98], facing: '+z', shape: 'round', depth: 0.04 });
    for (const x of [ox, ox + 2.8]) b.window(0.8, 1.2, { at: [x, 1.4, oz + 3], facing: '+z', shape: 'pointed', frame: tint(stone, 0.06), glass: P.timberBlack });
    for (const x of [ox - 2.5, ox, ox + 2.8]) b.window(0.9, 1.4, { at: [x, 3.9, oz + 3], facing: '+z', shape: 'pointed', frame: tint(stone, 0.06), glass: P.windowDark, bars: [2, 1] });
    for (const x of [ox - 2, ox + 2]) b.window(0.8, 1.2, { at: [x, 3.9, oz - 3], facing: '-z', shape: 'pointed', frame: tint(stone, 0.06), glass: P.timberBlack });
    b.box(9.1, 0.25, 6.1, tint(stone, 0.06), { at: [ox, 3.3, oz] }); // string course

    // ---- drying poles in the yard for skeins of dyed yarn
    for (const x of [-2, 3]) {
      b.box(0.12, 2.4, 0.12, timber, { at: [x - 2, 0, -3] });
      b.box(0.12, 2.4, 0.12, timber, { at: [x + 2, 0, -3] });
      b.box(4.2, 0.1, 0.1, timber, { at: [x, 2.3, -3] });
      for (const [i, c] of [0x2f4f7a, 0x9a2e2a, P.cream, 0x2f4f7a, 0xc9a03a].entries()) b.box(0.4, 1.1, 0.08, c, { at: [x - 1.6 + i * 0.8, 1.2, -3] });
    }
    // bales of raw wool from the hill farms, and a handcart
    for (let i = 0; i < 6; i++) b.box(1.1, 0.8, 0.8, i % 2 ? P.cream : tint(P.cream, -0.06), { at: [-5 + (i % 3) * 1.2, Math.floor(i / 3) * 0.8, -8.4] });
    b.box(1.4, 0.15, 2.2, timber, { at: [-9.5, 0.6, -8.0] });
    b.sym((s) => b.log(0.45, 0.1, P.oakDark, { at: [-9.5 + s * 0.8, 0, -8.0], axis: 'x', segs: 10 }));
    b.beam([-9.5, 0.7, -6.9], [-9.5, 0.3, -5.6], 0.5, 0.08, timber);
    b.tree(9, { at: [-17, 0, -8.5], kind: 'cypress' });

    b.collider(TW, TD, { at: [tx, 0, tz] });
    b.collider(DW, DD, { at: [dx, 0, dz] });
    b.collider(9, 6, { at: [ox, 0, oz] });
  },
};
