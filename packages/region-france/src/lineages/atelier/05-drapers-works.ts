import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, BED, WATER, lin, rise, stakeBank, tenter, vat, waterwheel } from './shared';

const WOAD = 0x3f5f8c;
const MADDER = 0xa8402f;
const WELD = 0xd2b04a;

/** A pair of fulling stocks: two heavy hammers on long hafts pivoted at the back, over a trough. */
function fullingStocks(b: Builder, x: number, z: number, y = 0) {
  b.box(1.6, 0.7, 1.0, P.oakDark, { at: [x, y, z + 0.6] }); // the trough
  b.sym((s) => b.box(0.25, 2.0, 0.25, P.oak, { at: [x + s * 0.75, y, z - 1.4] }));
  b.box(1.8, 0.2, 0.25, P.oak, { at: [x, y + 1.9, z - 1.4] });
  for (const dx of [-0.38, 0.38]) {
    b.beam([x + dx, y + 1.5, z - 1.4], [x + dx, y + 1.2, z + 0.4], 0.14, 0.14, P.oak);
    b.box(0.32, 0.7, 0.55, P.oak, { at: [x + dx, y + 0.7, z + 0.5], rot: [0.3, 0, 0] });
  }
}

/** Timber framing with cob infill on all four faces of a w by d block from y0 to y0 + h. */
function framedBlock(b: Builder, w: number, h: number, d: number, x: number, y0: number, z: number, infill: number, timber: number, skip: ('+z' | '-z' | '+x' | '-x')[] = []) {
  b.box(w, h, d, infill, { at: [x, y0, z] });
  const f = { studs: Math.round(w / 1.5), rails: 1, brace: 'corner' as const, beam: 0.18 };
  if (!skip.includes('+z')) b.frame(w, h, timber, { ...f, at: [x, y0, z + d / 2], facing: '+z' });
  if (!skip.includes('-z')) b.frame(w, h, timber, { ...f, at: [x, y0, z - d / 2], facing: '-z' });
  const g = { studs: Math.round(d / 1.5), rails: 1, brace: 'corner' as const, beam: 0.18 };
  if (!skip.includes('+x')) b.frame(d, h, timber, { ...g, at: [x + w / 2, y0, z], facing: '+x' });
  if (!skip.includes('-x')) b.frame(d, h, timber, { ...g, at: [x - w / 2, y0, z], facing: '-x' });
}

export const drapersWorks: BuildingDef = {
  id: 'drapers-works',
  name: 'Fulling mill and dye works',
  style: 'Gothic vernacular',
  date: 'c. 1300',
  summary:
    'By 1300 the towns of Picardy, Artois and Flanders are the cloth-makers of Europe, and the riverside is given over to the stages of the trade after weaving. ' +
    'In the fulling mill a waterwheel lifts heavy wooden stocks that pound the cloth in troughs of water and fuller’s earth until it shrinks and thickens; the great Flemish towns long forbade mills for their finest cloth and kept to fulling by foot, but for ordinary cloth the mill won. ' +
    'In the dye house the cloth is boiled in vats over furnaces: blue from woad (guède), the crop that made the merchants of Amiens rich, red from madder, yellow from weld. ' +
    'The cloth is rinsed at a washing stage on the river and stretched on tenter frames to dry square and to width. The buildings are timber-framed with cob infill under steep roofs of flat tiles.',
  materials: ['oak frame', 'cob infill (torchis)', 'chalk and flint footings', 'flat clay tiles', 'brick'],
  lookFor: [
    { label: 'Fulling stocks', note: 'Cams on the wheel shaft lift the wooden hammers, which fall again and again on the wet cloth in the trough.', at: [-11.0, 2.4, -5.6] },
    { label: 'Undershot wheel', note: 'The fulling mill’s wheel, its paddles dipping into the current at the back.', at: [-11.0, 2.4, -12.8] },
    { label: 'Dye vats and furnace chimney', note: 'Round vats of blue woad, red madder and yellow weld, heated by fires whose smoke goes up the brick stack.', at: [3.0, 2.0, -4.0] },
    { label: 'Washing stage', note: 'A timber platform out over the river where dyed cloth was rinsed in running water.', at: [6.5, 0.6, -13.0] },
    { label: 'Tenter frames', note: 'Wet cloth was hooked onto these frames (rames) to dry to the right length and width: the origin of being on tenterhooks.', at: [6.0, 2.2, 5.6] },
  ],
  influences: [],
  build(b) {
    const cob = b.pick([P.torchis, tint(P.torchis, 0.03), P.daub]);
    const timber = b.pick([P.oak, P.oakDark]);
    const tile = b.pick([P.tuilePlate, tint(P.tuilePlate, 0.03)]);
    const sill = P.craie;

    b.box(35, 0.04, 21.6, tint(P.grassDry, -0.04), { at: [0, 0, 0], jitter: false });
    stakeBank(b, -17.5, 17.5, P.oakDark);
    b.box(35, -BED + 0.15, 0.6, tint(P.craie, -0.12), { at: [0, BED, BANK + 0.3] });

    // ---- the fulling mill: chalk footings, a timber-framed upper part, wheel at the back
    const mx = -11;
    const mz = -6.8;
    const MW = 9;
    const MD = 6.4;
    const g = 1.2;
    const H = 4.6;
    const back = mz - MD / 2;
    const front = mz + MD / 2;
    b.box(MW, g, MD, sill, { at: [mx, 0, mz] });
    // back and side walls: always whole
    framedBlock(b, MW, H - g, 0.3, mx, g, back + 0.15, cob, timber, ['+z']);
    framedBlock(b, 0.3, H - g, MD, mx - MW / 2 + 0.15, g, mz, cob, timber, ['+x']);
    framedBlock(b, 0.3, H - g, MD, mx + MW / 2 - 0.15, g, mz, cob, timber, ['-x']);
    b.panel(1.2, 2.0, P.oakDark, { at: [mx + MW / 2 - 0.15, g, mz + 1.4], facing: '+x' });
    b.panel(0.9, 0.9, P.timberBlack, { at: [mx, 0.2, back], facing: '-z' });
    const rr = rise(MD, 52);
    // the back slope of the roof is always there; the front slope and wall come away in the cut-away
    const drop = (0.6 * rr) / (MD / 2);
    const slope = (high: '+z' | '-z') =>
      b.shed(MW + 0.8, MD / 2 + 0.6, rr + drop, tile, { high, at: [mx, H - drop, mz + (high === '+z' ? -1 : 1) * (MD / 2 + 0.6) / 2] });
    slope('+z');
    b.sym((s) =>
      b.extrude(
        [
          [-MD / 2, 0],
          [MD / 2, 0],
          [0, rr - 0.05],
        ],
        0.3,
        cob,
        { at: [mx + s * (MW / 2 - 0.15), H, mz], rot: [0, Math.PI / 2, 0], jitter: false },
      ),
    );
    if (b.cutaway) {
      b.box(MW, 1.0, 0.3, cob, { at: [mx, g, front - 0.15] });
    } else {
      framedBlock(b, MW, H - g, 0.3, mx, g, front - 0.15, cob, timber, ['-z']);
      b.panel(1.4, 2.2, P.oakDark, { at: [mx - 2.4, g, front], facing: '+z' });
      slope('-z');
    }
    b.box(MW + 0.8, 0.2, 0.3, tint(tile, -0.08), { at: [mx, H + rr - 0.2, mz] }); // ridge
    b.box(MW - 0.6, 0.06, MD - 0.6, P.pine, { at: [mx, g, mz], jitter: false }); // the mill floor
    for (const x of [mx - 2.2, mx + 2.2]) fullingStocks(b, x, mz + 0.4, g);
    b.log(0.2, MW - 1.0, P.oakDark, { at: [mx, g + 1.35, mz - 1.3] });
    for (const x of [mx - 2.6, mx - 1.8, mx + 1.8, mx + 2.6]) b.box(0.18, 0.5, 0.18, P.oak, { at: [x, g + 1.45, mz - 1.1] });
    // the wheel in the river behind, on a short race between piles
    waterwheel(b, { at: [mx, 0.8, -12.8], r: 2.2, width: 1.2, paddles: 16, spokes: 8, spin: b.rand(), axle: 3.2, axleDir: 1 });
    for (const z of [-11.4, -13.0, -14.6]) b.cyl(0.14, 3.2, P.oakDark, { at: [mx - 1.0, BED, z], segs: 6 });
    b.box(0.12, 1.6, 3.6, tint(P.oakDark, 0.06), { at: [mx - 1.0, BED + 0.4, -13.0] });
    b.gable(3.2, 4.0, 1.4, tile, { at: [mx, 3.4, -12.6], ridge: 'z', overhang: 0.2 });
    b.sym((s) => b.box(0.22, 3.4 - BED, 0.22, P.oakDark, { at: [mx + s * 1.4, BED, -14.4] }));

    // ---- the dye house: an open-fronted timber hall with the vats, a brick furnace stack
    const dx = 3;
    const dz = -6.2;
    const DW = 11;
    const DD = 6.6;
    const DH = 4.2;
    b.box(DW, 0.5, DD, sill, { at: [dx, 0, dz] });
    framedBlock(b, DW, DH - 0.5, 0.3, dx, 0.5, dz - DD / 2 + 0.15, cob, timber, ['+z']);
    framedBlock(b, 0.3, DH - 0.5, DD, dx - DW / 2 + 0.15, 0.5, dz, cob, timber, ['+x']);
    framedBlock(b, 0.3, DH - 0.5, DD, dx + DW / 2 - 0.15, 0.5, dz, cob, timber, ['-x']);
    for (const x of lin(5, dx - DW / 2 + 0.2, dx + DW / 2 - 0.2)) b.box(0.28, DH - 0.5, 0.28, timber, { at: [x, 0.5, dz + DD / 2 - 0.15] });
    b.box(DW, 0.3, 0.3, timber, { at: [dx, DH - 0.3, dz + DD / 2 - 0.15] });
    b.gable(DW, DD, rise(DD, 50), tile, { at: [dx, DH, dz], overhang: 0.5, wall: cob, thick: 0.16 });
    // a louvre on the ridge to let out the steam
    const top = DH + rise(DD, 50);
    b.box(2.0, 0.8, 1.0, timber, { at: [dx - 2, top - 0.3, dz] });
    b.gable(2.4, 1.4, 0.6, tile, { at: [dx - 2, top + 0.5, dz] });
    // the vats on their brick furnaces, the stokeholes along the back, one brick stack
    const dyes = [WOAD, WOAD, MADDER, WELD];
    lin(4, dx - 3.6, dx + 3.6).forEach((x, i) => {
      b.box(1.9, 0.8, 1.9, P.briqueNord, { at: [x, 0.5, dz + 0.2] });
      b.panel(0.5, 0.45, P.timberBlack, { at: [x, 0.5, dz + 1.15], facing: '+z', shape: 'round' });
      vat(b, 0.8, 0.9, [x, 1.3, dz + 0.2], dyes[i], P.oakDark);
    });
    b.box(DW - 2, 0.6, 0.9, P.briqueNord, { at: [dx, 0.5, dz - 1.6] }); // the flue gathering the fires
    b.chimney(1.2, top + 2.0, 1.2, P.briqueNord, { at: [dx + 3.5, 0, dz - 2.4] });
    // poles hung with dyed hanks in the hall
    b.box(DW - 1.5, 0.1, 0.1, timber, { at: [dx, 3.2, dz + 2.3] });
    lin(6, dx - 4, dx + 4).forEach((x, i) => b.box(0.5, 1.1, 0.06, [WOAD, MADDER, WELD][i % 3], { at: [x, 2.1, dz + 2.3], jitter: false }));

    // ---- the washing stage: a planked platform over the river, steps down to the water, rinsing poles
    const wx = 6.5;
    b.box(6.0, 0.14, 3.8, P.oak, { at: [wx, 0.05, BANK - 1.5] });
    for (const x of lin(4, wx - 2.8, wx + 2.8)) for (const z of [BANK - 0.2, BANK - 3.2]) b.cyl(0.13, 0.25 - BED, P.oakDark, { at: [x, BED, z], segs: 6 });
    b.stairs(1.6, -WATER + 0.2, 1.4, 5, P.oak, { at: [wx + 1.6, WATER - 0.1, BANK - 4.1], rotY: Math.PI });
    b.box(6.0, 0.1, 0.1, P.oak, { at: [wx, 1.1, BANK - 3.3] });
    for (const x of [wx - 2.8, wx + 2.8]) b.box(0.12, 1.1, 0.12, P.oak, { at: [x, 0.1, BANK - 3.3] });
    // lengths of cloth trailing in the current to rinse
    b.box(0.9, 0.04, 3.0, WOAD, { at: [wx - 1.5, WATER + 0.02, BANK - 4.8], jitter: false });
    b.box(0.9, 0.04, 2.6, MADDER, { at: [wx + 0.2, WATER + 0.02, BANK - 4.6], jitter: false });
    b.deck(6.0, 3.8, 0.19, { at: [wx, 0, BANK - 1.5] });

    // ---- the tenter ground in front: rows of frames with dyed and undyed cloth
    tenter(b, 6.0, 3.0, 16, WOAD, timber);
    tenter(b, 6.0, 5.6, 16, MADDER, timber);
    tenter(b, 6.0, 8.2, 16, b.pick([P.cream, WELD]), timber);
    tenter(b, -11.0, 5.2, 10, P.cream, timber);
    // bales of wool and a cart of woad balls (coques de guède)
    for (let i = 0; i < 4; i++) b.box(1.0, 0.7, 0.8, P.cream, { at: [-6.0 + (i % 2) * 1.1, Math.floor(i / 2) * 0.7, -1.6] });
    b.box(2.4, 0.2, 1.3, P.oak, { at: [-12.5, 0.9, 1.4] });
    for (const z of [0.75, 2.05]) b.log(0.5, 0.1, P.oakDark, { at: [-12.5, 0, z], axis: 'x', segs: 10 });
    for (let i = 0; i < 6; i++) b.sphere(0.25, 0x4c5a3c, { at: [-13.2 + (i % 3) * 0.55, 1.35, 1.1 + Math.floor(i / 3) * 0.55], segs: 5 });
    // the street fence and gate
    b.box(14, 2.0, 0.15, timber, { at: [-10.8, 0, 10.6] });
    b.box(14, 2.0, 0.15, timber, { at: [10.8, 0, 10.6] });
    b.sym((s) => b.box(0.3, 2.8, 0.3, timber, { at: [s * 3.9, 0, 10.6] }));
    b.gable(8.6, 1.2, 0.8, tile, { at: [0, 2.8, 10.6] });
    b.box(8.2, 0.25, 0.3, timber, { at: [0, 2.55, 10.6] });

    b.collider(MW, MD, { at: [mx, 0, mz] });
    b.collider(DW, DD, { at: [dx, 0, dz] });
    for (const z of [3.0, 5.6, 8.2]) b.collider(16.2, 0.3, { at: [6.0, 0, z] });
    b.collider(14, 0.3, { at: [-10.8, 0, 10.6] });
    b.collider(14, 0.3, { at: [10.8, 0, 10.6] });
  },
};
