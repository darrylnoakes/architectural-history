import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { hurdles, patch, thickHip } from './shared';

/** A one-room cob cottage: rounded corners, rubble plinth, half-hipped thatch with smoke holes. */
function cobCottage(b: Builder, x: number, z: number, flip: 1 | -1, cob: number, thatch: number): void {
  const w = 6.6;
  const d = 4.5;
  const h = 2.3;
  const rc = 0.45;
  b.group({ at: [x, 0, z] }, () => {
    // rubble plinth keeps the earth wall off the wet ground
    b.box(w - rc * 2 + 0.1, 0.45, d + 0.1, P.rubble);
    b.box(w + 0.1, 0.45, d - rc * 2 + 0.1, P.rubble);
    // cob: rounded corners (no squared quoins in earth walling)
    b.box(w - rc * 2, h, d, cob);
    b.box(w, h, d - rc * 2, cob);
    b.sym((sx) => b.sym((sz) => {
      b.cyl(rc, h, cob, { at: [sx * (w / 2 - rc), 0, sz * (d / 2 - rc)], segs: 8 });
      b.cyl(rc + 0.05, 0.45, P.rubble, { at: [sx * (w / 2 - rc), 0, sz * (d / 2 - rc)], segs: 8 });
    }));
    // steep half-hipped thatch with a smoke hole in each gablet: there is no chimney
    thickHip(b, w, d, 3.0, thatch, { at: [0, h, 0], ov: 0.4, t: 0.45, ridge: 2.6, gablet: 0.95, hole: P.timberBlack });
    // ledged plank door and a small unglazed window with a shutter, on the front
    const dx = flip * 1.4;
    b.panel(0.95, 1.75, P.oak, { at: [dx, 0.05, d / 2], facing: '+z', depth: 0.08 });
    b.box(1.25, 0.14, 0.25, P.oakDark, { at: [dx, 1.8, d / 2 + 0.02] }); // lintel
    b.panel(0.6, 0.55, P.timberBlack, { at: [-flip * 1.3, 1.1, d / 2], facing: '+z' });
    b.box(0.6, 0.55, 0.05, P.oakSilver, { at: [-flip * 1.3 - flip * 0.64, 1.1, d / 2 + 0.06] });
    // a back door to the croft
    b.panel(0.9, 1.7, P.oak, { at: [-dx, 0.05, -d / 2], facing: '-z', depth: 0.08 });
  });
}

export const cobCottages: BuildingDef = {
  id: 'cob-cottages',
  name: 'Cob cottages',
  style: 'Norman-period peasant vernacular',
  date: 'c. 1100',
  summary:
    'After the Conquest the plot held two one-room cottages for families who worked the lord’s land in return for a few acres of their own. ' +
    'Their walls are cob, clay mixed with straw and trodden up in layers on a stone plinth, so the corners come out rounded and the openings stay small. ' +
    'A fire burned on an open hearth in the middle of the floor and the smoke found its way out through the thatch and the holes at each end of the ridge: the few chimneys were in castles and great houses. ' +
    'Unlike the post-built halls before them, these walls were meant to last if kept capped and dry.',
  materials: ['cob (clay and straw)', 'rubble stone plinth', 'straw thatch', 'oak'],
  lookFor: [
    { label: 'Cob walls', note: 'Wet clay and straw built up in layers a foot or two at a time, then pared smooth. A good cob wall stands for centuries if kept dry.', at: [-6.2, 1.3, 3.85] },
    { label: 'Rounded corners', note: 'Earth walls are not built of blocks, so their corners are rounded rather than squared off.', at: [-9.6, 1.2, 3.8] },
    { label: 'Smoke hole (gablet)', note: 'The hipped roof stops short of the ridge at each end, leaving a small triangular vent for the smoke of the open hearth.', at: [-8.7, 5.0, 1.6] },
    { label: 'Stone plinth', note: 'The low stone base kept rising damp out of the cob: "a good hat and a good pair of boots".', at: [6.2, 0.25, 3.9] },
    { label: 'Unglazed window', note: 'A small opening closed by a wooden shutter. Glass was far too costly for a cottager.', at: [-7.6, 1.4, 3.9] },
  ],
  influences: [],
  build(b) {
    const cob = b.pick([P.cob, tint(P.cob, -0.04), P.ochreWash, tint(P.cob, 0.03)]);
    const thatch = b.pick([P.thatch, P.thatchOld, tint(P.thatch, -0.05)]);
    const z = 1.6;
    const sep = b.variant === 0 ? 6.3 : b.range(5.9, 6.6);
    cobCottage(b, -sep, z, 1, cob, thatch);
    cobCottage(b, sep, z, b.chance(0.5) ? 1 : -1, tint(cob, b.range(-0.04, 0.03)), tint(thatch, b.range(-0.03, 0.03)));

    // trodden earth in front, crofts (garden strips) behind divided by wattle
    patch(b, 25, 3.2, tint(P.earth, 0.05), [0, 5.4]);
    const z0 = -6.5;
    const z1 = -1.2;
    hurdles(b, [-12.5, z0], [12.5, z0]);
    hurdles(b, [-12.5, z0], [-12.5, z1]);
    hurdles(b, [12.5, z0], [12.5, z1]);
    hurdles(b, [0, z0], [0, z1 + 1.0]);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const zz = -5.8 + i * 0.9;
        b.box(6.5, 0.15, 0.6, P.soil, { at: [s * 6.6, 0, zz] });
        if (i % 2 === (s > 0 ? 0 : 1)) b.box(6.2, 0.26, 0.3, b.pick([P.leaf, P.leafDark, P.crop]), { at: [s * 6.6, 0.12, zz] });
      }
    }
    // dung heap and a woodpile between the cottages
    b.blob(0.8, P.mud, { at: [0, 0.1, 2.8], stretch: [1.3, 0.55, 1], detail: 0 });
    for (let i = 0; i < 3; i++) b.log(0.11, 1.4, P.bark, { at: [-0.3, i * 0.2, 0 + (i % 2) * 0.12], axis: 'z', segs: 6 });
  },
};
