import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, jetty, riverWall, waterwheel } from './shared';

/** A tenter frame running along X, `len` long, with a length of cloth stretched on it. */
function tenter(b: Builder, x: number, z: number, len: number, cloth: number) {
  const posts = Math.round(len / 2) + 1;
  for (let i = 0; i < posts; i++) b.box(0.12, 1.9, 0.12, P.oak, { at: [x - len / 2 + (len * i) / (posts - 1), 0, z] });
  b.box(len + 0.2, 0.12, 0.14, P.oak, { at: [x, 1.75, z] });
  b.box(len + 0.2, 0.1, 0.14, P.oak, { at: [x, 0.3, z] });
  b.box(len - 0.5, 1.3, 0.03, cloth, { at: [x, 0.42, z + 0.08], jitter: false });
}

export const fullingMill: BuildingDef = {
  id: 'fulling-mill',
  name: 'Fulling mill and clothier’s workshop',
  style: 'Tudor',
  date: 'c. 1590',
  summary:
    'Woollen cloth was England’s great export, and by Tudor times rich clothiers ran the trade from riverside works like this. ' +
    'In the fulling mill the waterwheel lifted heavy wooden hammers, the stocks, that pounded the woven cloth in water and fuller’s earth to shrink and thicken it. ' +
    'The wet cloth was then stretched to dry on tenter frames in the field, hooked along both edges: the origin of being “on tenterhooks”. ' +
    'The buildings are timber-framed, with close-set upright studs that showed off the owner’s wealth.',
  materials: ['oak frame', 'lime plaster', 'brick', 'clay tile'],
  lookFor: [
    { label: 'Tenter frames', note: 'Long timber racks where cloth was stretched and dried to an exact width on rows of tenterhooks.', at: [-9, 2.2, 6.2] },
    { label: 'Waterwheel', note: 'It turned a shaft with cams (tappets) that lifted and dropped the fulling stocks inside.', at: [-10.5, 3.2, -12.5] },
    { label: 'Close studding', note: 'Upright timbers set barely a stud-width apart: far more oak than the frame needed, as a display of wealth.', at: [-14, 4.5, -3.1] },
    { label: 'Jetty', note: 'The upper floor of the workshop oversails the one below, gaining space and showing off the frame.', at: [9, 3.0, 0.9] },
    { label: 'Long mullioned windows', note: 'Bands of windows light the looms in the upper workshop, where weavers needed all the daylight they could get.', at: [12.5, 4.4, 1.0] },
  ],
  influences: [],
  build(b) {
    const plaster = b.pick([P.limewash, P.plaster, P.ochreWash]);
    const oak = b.pick([P.oakDark, P.timberBlack, P.oak]);
    const tile = b.pick([P.tileRed, P.tileBrown]);
    const brick = b.pick([P.brickRed, P.brickOrange]);

    // ---- the fulling mill, on a stone plinth at the river
    const mx = -10.5;
    const mz = -6.7;
    const W = 11;
    const D = 6.6;
    const plinth = 0.8;
    const H1 = 2.9;
    const H2 = 2.5;
    riverWall(b, -17.6, -3.6, P.rubble, { coping: P.ragstone });
    b.box(W + 0.2, plinth, D + 0.2, P.rubble, { at: [mx, 0, mz] });
    b.box(W, H1 + H2, D, plaster, { at: [mx, plinth, mz] });
    for (const s of [1, -1] as const) {
      const f = s > 0 ? '+z' : '-z';
      b.frame(W, H1, oak, { at: [mx, plinth, mz + (s * D) / 2], facing: f, studs: 14, rails: 1, beam: 0.16 });
      b.frame(W, H2, oak, { at: [mx, plinth + H1, mz + (s * D) / 2], facing: f, studs: 14, rails: 0, beam: 0.16 });
      b.frame(D, H1, oak, { at: [mx + (s * W) / 2, plinth, mz], facing: s > 0 ? '+x' : '-x', studs: 8, rails: 1, beam: 0.16 });
      b.frame(D, H2, oak, { at: [mx + (s * W) / 2, plinth + H1, mz], facing: s > 0 ? '+x' : '-x', studs: 8, rails: 0, beam: 0.16 });
    }
    const top = plinth + H1 + H2;
    b.gable(W, D, 3.6, tile, { at: [mx, top, mz], overhang: 0.35, wall: plaster });
    // gable-end framing (a king post and two struts on each end)
    b.sym((s) => {
      const x = mx + (s * W) / 2 + s * 0.04;
      b.box(0.16, 3.4, 0.16, oak, { at: [x, top, mz] });
      for (const t of [-1, 1]) b.group({ at: [x, top, mz + t * 1.6], rot: [t * -0.6, 0, 0] }, () => b.box(0.16, 1.9, 0.16, oak));
    });
    // front: open double doors showing the stocks inside, and the loft hatch
    const fz = mz + D / 2;
    b.panel(2.4, 2.3, P.timberBlack, { at: [mx - 1.5, plinth, fz + 0.02], facing: '+z' });
    b.panel(1.1, 2.3, oak, { at: [mx - 3.4, plinth, fz + 0.5], facing: 0.6 });
    b.stairs(2.4, plinth, 1.0, 3, P.rubble, { at: [mx - 1.5, 0, fz + 0.6] });
    // the fulling stocks: two great hammers just inside the doors
    for (const dx of [-2.1, -0.9]) {
      b.group({ at: [mx + dx, plinth + 0.1, fz - 0.5], rot: [0.5, 0, 0] }, () => {
        b.box(0.35, 1.4, 0.5, P.oak, { at: [0, 0, 0] });
        b.box(0.12, 0.12, 2.0, P.oak, { at: [0, 1.0, -1.0] });
      });
    }
    b.box(2.2, 0.6, 0.8, P.oakDark, { at: [mx - 1.5, plinth, fz - 0.8] });
    b.sym((s) => b.window(1.4, 1.0, { at: [mx + 2.0 + s * 1.6, plinth + 1.2, fz], facing: '+z', frame: oak, bars: [3, 1] }));
    b.window(1.6, 1.0, { at: [mx, plinth + H1 + 0.7, fz], facing: '+z', frame: oak, bars: [4, 1] });
    b.window(1.6, 1.0, { at: [mx + 3.5, plinth + H1 + 0.7, mz - D / 2], facing: '-z', frame: oak, bars: [4, 1] });
    b.window(1.6, 1.0, { at: [mx - 3.5, plinth + H1 + 0.7, mz - D / 2], facing: '-z', frame: oak, bars: [4, 1] });
    // the wheel on the river side
    const wz = BANK - 0.95;
    const wr = 2.5;
    const ay = WATER - 0.35 + wr;
    waterwheel(b, { at: [mx, ay, wz], r: wr, width: 1.2, kind: 'undershot', paddles: 16, spokes: 8, spin: b.rand() });
    b.box(0.6, ay - 0.24 - WATER + 0.6, 0.6, P.rubble, { at: [mx, WATER - 0.6, wz - 1.05] });
    // a pentice roof over the wheel
    b.shed(6.2, 2.6, 0.9, tile, { at: [mx, plinth + H1 - 0.2, mz - D / 2 - 1.3], high: '+z' });
    b.sym((s) => b.box(0.18, plinth + H1 - 0.2 - WATER + 0.6, 0.18, oak, { at: [mx + s * 3.0, WATER - 0.6, mz - D / 2 - 2.5] }));

    // ---- the clothier's workshop: two storeys, jettied to the lane, with a brick chimney
    const wx = 9.6;
    const wkz = -2.8;
    const ww = 13;
    const wd = 6.2;
    const g1 = 2.8;
    const g2 = 2.6;
    const jet = 0.6;
    b.box(ww, 0.4, wd, P.rubble, { at: [wx, 0, wkz] });
    b.box(ww, g1, wd, plaster, { at: [wx, 0.4, wkz] });
    b.box(ww, g2, wd + jet, plaster, { at: [wx, 0.4 + g1, wkz + jet / 2] });
    b.box(ww + 0.1, 0.22, 0.22, oak, { at: [wx, 0.4 + g1 - 0.1, wkz + wd / 2 + jet - 0.08] }); // bressumer
    for (let i = 0; i < 12; i++) b.box(0.16, 0.16, jet, oak, { at: [wx - ww / 2 + 0.5 + i * ((ww - 1) / 11), 0.4 + g1 - 0.2, wkz + wd / 2 + jet / 2] });
    const wfz = wkz + wd / 2;
    b.frame(ww, g1, oak, { at: [wx, 0.4, wfz], facing: '+z', studs: 18, rails: 1 });
    b.frame(ww, g2, oak, { at: [wx, 0.4 + g1, wfz + jet], facing: '+z', studs: 18, rails: 1 });
    b.frame(ww, g1 + g2, oak, { at: [wx, 0.4, wkz - wd / 2], facing: '-z', studs: 14, rails: 2, brace: 'corner' });
    b.sym((s) => b.frame(wd, g1, oak, { at: [wx + (s * ww) / 2, 0.4, wkz], facing: s > 0 ? '+x' : '-x', studs: 6, rails: 1 }));
    const wtop = 0.4 + g1 + g2;
    b.gable(ww, wd + jet, 3.5, tile, { at: [wx, wtop, wkz + jet / 2], overhang: 0.3, wall: plaster });
    // ground floor: door and windows; upper floor: a long band of mullioned windows for the looms
    b.panel(1.0, 2.1, P.doorRed, { at: [wx - 4.5, 0.4, wfz], facing: '+z', shape: 'segmental' });
    b.window(1.8, 1.1, { at: [wx - 1.5, 1.4, wfz], facing: '+z', frame: oak, bars: [3, 1] });
    b.window(1.8, 1.1, { at: [wx + 2.5, 1.4, wfz], facing: '+z', frame: oak, bars: [3, 1] });
    b.window(8.4, 1.05, { at: [wx + 1.4, 0.4 + g1 + 0.8, wfz + jet], facing: '+z', frame: oak, bars: [12, 1] });
    b.window(3.0, 1.0, { at: [wx, 0.4 + g1 + 0.8, wkz - wd / 2], facing: '-z', frame: oak, bars: [5, 1] });
    // brick chimney stack on the +X gable, with clustered shafts
    const cx = wx + ww / 2 + 0.5;
    b.box(1.6, wtop + 2.6, 1.4, brick, { at: [cx, 0, wkz] });
    b.box(1.8, 0.2, 1.6, brick, { at: [cx, wtop + 2.6, wkz] });
    b.sym((s) => b.cyl(0.3, 1.6, brick, { at: [cx, wtop + 2.8, wkz + s * 0.35], segs: 8 }));
    b.box(1.5, 0.2, 1.5, brick, { at: [cx, wtop + 4.4, wkz] });

    // ---- the tenter field, and a landing stage with bales of finished cloth
    const cloths = [P.doorBlue, P.cream, P.doorRed, tint(P.cream, -0.05), P.doorGreen];
    tenter(b, -9, 3.0, 13, b.pick(cloths));
    tenter(b, -9, 5.8, 13, b.pick(cloths));
    tenter(b, -9, 8.6, 13, b.pick(cloths));
    tenter(b, 8.5, 7.6, 11, b.pick(cloths));
    jetty(b, 6, 3, 2.4);
    riverWall(b, -3.6, 17.6, P.oak);
    for (let i = 0; i < 3; i++) b.box(0.8, 0.6, 0.6, P.wattle, { at: [5.4 + i * 0.5, 0.24, BANK - 0.9 - (i % 2) * 0.7] });

    b.collider(W + 0.4, D + 0.4, { at: [mx, 0, mz] });
    b.collider(ww + 2, wd + 1, { at: [wx + 0.5, 0, wkz + 0.3] });
    for (const z of [3.0, 5.8, 8.6]) b.collider(13.2, 0.3, { at: [-9, 0, z] });
    b.collider(11.2, 0.3, { at: [8.5, 0, 7.6] });
  },
};
