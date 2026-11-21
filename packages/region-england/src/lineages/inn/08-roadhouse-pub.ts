import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bayLines, car, ground } from './shared';

const G = 3.2;
const F = 2.8;
const EAVE = G + F;
const MX = 5.5; // main range half-length
const MZ0 = -9.5;
const MZ1 = -3.5;
const WX = 5.0; // cross-wing width
const WZ0 = -10.5;
const WZ1 = -1.6;
const RISE = 3.0;

/** A clustered Tudor chimney: a brick base with octagonal shafts and moulded caps. */
function tudorStack(b: Builder, at: [number, number, number], n: number, h: number, brick: number) {
  b.group({ at }, () => {
    b.box(0.75 * n + 0.2, 1.0, 0.95, brick);
    b.box(0.75 * n + 0.35, 0.18, 1.1, tint(brick, -0.08), { at: [0, 1.0, 0] });
    for (const x of spread(n, -(n - 1) * 0.375, (n - 1) * 0.375)) {
      b.cyl(0.28, h, brick, { at: [x, 1.18, 0], segs: 8 });
      b.cyl(0.38, 0.25, tint(brick, -0.08), { at: [x, 1.18 + h, 0], segs: 8 });
      b.cyl(0.18, 0.25, P.terracotta, { at: [x, 1.43 + h, 0], segs: 6 });
    }
  });
}

export const roadhousePub: BuildingDef = {
  id: 'roadhouse-pub',
  name: 'Improved public house',
  style: 'Brewers’ Tudor',
  date: 'c. 1934',
  summary:
    'Between the wars the brewers, pressed by magistrates and temperance campaigners, rebuilt pubs as large, respectable "improved" houses with restaurants, family rooms and car parks for the new motorist. ' +
    'They dressed them in a homely Tudor costume: brick below, black-and-white half-timbering applied to the upper walls and gables, leaded casements and clusters of tall chimneys. ' +
    'The timbering is decoration, not structure: behind it the walls are brick and the floors steel and concrete.',
  materials: ['red brick', 'applied oak-stained timber', 'roughcast render', 'clay plain tiles', 'leaded casements'],
  lookFor: [
    { label: 'Mock half-timbering', note: 'Thin boards fixed over brick or render to look like a medieval frame. Compare the real frame of the galleried inn.', at: [-8, 5.2, WZ1 + 0.5] },
    { label: 'Cross-wing gables', note: 'Two projecting gabled wings either side of the entrance, borrowed from the manor houses of the 1500s.', at: [8, 7.6, WZ1 + 0.4] },
    { label: 'Clustered chimneys', note: 'Tall octagonal brick shafts in groups, a Tudor fashion. Most serve fireplaces, a few are just for show.', at: [-2.2, 12.2, -6.5] },
    { label: 'Leaded casements', note: 'Side-hung windows with small panes in a lead grid, deliberately old-fashioned in an age of plate glass.', at: [-3.6, 1.6, MZ1 + 0.3] },
    { label: 'Car park', note: 'The pub was built for motorists: a forecourt of tarmac where the inn yard used to be.', at: [3, 0.4, 5] },
  ],
  build(b) {
    const brick = b.pick([P.brickRed, P.brickDark, tint(P.brickRed, -0.04)]);
    const tile = b.pick([P.tileBrown, tint(P.tileRed, -0.06), P.tileRed]);
    const timber = P.timberBlack;
    const render = b.pick([P.whiteRender, P.cream, P.limewash]);
    const glaze = P.white;

    // tarmac car park and pavement; a strip of lawn under the windows
    ground(b, 22, 12.3, P.tarmac, [0, 4.75]);
    ground(b, 22, 1.3, P.paving, [0, -0.85], 0.06);
    bayLines(b, -9.8, -1.4, 4, 3.0, 4.2);
    bayLines(b, 1.4, 9.8, 4, 3.0, 4.2);

    // ---------------- main range between the wings
    const mz = (MZ0 + MZ1) / 2;
    const md = MZ1 - MZ0;
    b.box(2 * MX, G, md, brick, { at: [0, 0, mz] });
    b.box(2 * MX, F, md, render, { at: [0, G, mz] });
    b.box(2 * MX + 0.04, 0.2, md + 0.04, timber, { at: [0, G - 0.05, mz] });
    b.frame(2 * MX, F, timber, { at: [0, G, MZ1], facing: '+z', studs: 9, rails: 1, beam: 0.18, depth: 0.05 });
    b.frame(2 * MX, F, timber, { at: [0, G, MZ0], facing: '-z', studs: 7, rails: 1, beam: 0.18, depth: 0.05 });
    b.gable(2 * MX + 2 * WX - 2, md, RISE, tile, { at: [0, EAVE, mz], overhang: 0.4, wall: render });
    // ground floor: leaded bay windows either side of a porch
    b.sym((s) => {
      b.group({ at: [s * 3.4, 0, MZ1] }, () => {
        b.box(3.0, 0.8, 0.7, brick, { at: [0, 0, 0.35] });
        b.window(2.8, 1.6, { at: [0, 0.8, 0.7], facing: '+z', frame: glaze, bars: [6, 3], border: 0.1 });
        b.box(3.1, 0.15, 0.85, tint(brick, -0.1), { at: [0, 2.4, 0.42] });
        b.shed(3.1, 0.85, 0.35, tile, { at: [0, 2.55, 0.42], high: '-z' });
      });
      b.window(1.5, 1.2, { at: [s * 3.4, G + 0.8, MZ1], facing: '+z', frame: glaze, bars: [4, 3] });
    });
    // porch: a little gabled brick porch with a Tudor arch and studded door
    b.group({ at: [0, 0, MZ1] }, () => {
      b.box(2.6, 2.7, 1.4, brick, { at: [0, 0, 0.7] });
      b.panel(1.4, 2.3, tint(P.stucco, -0.1), { at: [0, 0, 1.4], facing: '+z', shape: 'pointed', depth: 0.04 });
      b.panel(1.2, 2.2, P.oak, { at: [0, 0, 1.4], facing: '+z', shape: 'pointed', depth: 0.08 });
      b.gable(2.6, 1.6, 1.4, tile, { at: [0, 2.7, 0.8], ridge: 'z', overhang: 0.2, wall: render });
      b.frame(2.2, 1.1, timber, { at: [0, 2.75, 1.6], facing: '+z', studs: 2, rails: 0, beam: 0.12 });
      b.panel(1.6, 0.3, P.gold, { at: [0, 2.35, 1.42], facing: '+z', depth: 0.08 });
    });

    // ---------------- cross wings, jettied gables to the front
    b.sym((s) => {
      const xc = s * (MX + WX / 2);
      const wz = (WZ0 + WZ1) / 2;
      const wd = WZ1 - WZ0;
      b.box(WX, G, wd, brick, { at: [xc, 0, wz] });
      // jettied first floor on the front gable only
      b.box(WX, F, wd + 0.3, render, { at: [xc, G, wz + 0.15] });
      b.box(WX + 0.06, 0.22, wd + 0.36, timber, { at: [xc, G - 0.05, wz + 0.15] });
      const zf = WZ1 + 0.3;
      b.frame(WX, F, timber, { at: [xc, G, zf], facing: '+z', studs: 5, rails: 1, brace: 'saltire', beam: 0.18, depth: 0.05 });
      b.frame(wd + 0.3, F, timber, { at: [s * (MX + WX), G, wz + 0.15], facing: s > 0 ? '+x' : '-x', studs: 8, rails: 1, brace: 'corner', beam: 0.18, depth: 0.05 });
      b.frame(WX, F, timber, { at: [xc, G, WZ0], facing: '-z', studs: 4, rails: 1, brace: 'corner', beam: 0.18, depth: 0.05 });
      // gable roof with the apex studded and bargeboarded
      b.gable(WX, wd + 0.3, RISE, tile, { at: [xc, EAVE, wz + 0.15], ridge: 'z', overhang: 0.45, wall: render });
      for (const zz of [zf + 0.05, WZ0 - 0.05]) {
        const f = zz > 0 || zz > -5 ? '+z' : '-z';
        for (const x of [-1.2, -0.4, 0.4, 1.2]) {
          const h = RISE * (1 - Math.abs(x) / (WX / 2)) - 0.15;
          b.panel(0.16, h, timber, { at: [xc + x, EAVE, zz], facing: f, depth: 0.06 });
        }
        b.panel(WX - 0.2, 0.16, timber, { at: [xc, EAVE + 0.02, zz], facing: f, depth: 0.06 });
      }
      // bargeboards
      const bl = Math.hypot(WX / 2 + 0.45, RISE + 0.3);
      const ba = Math.atan2(WX / 2 + 0.45, RISE + 0.3);
      for (const t of [1, -1]) {
        b.box(0.32, bl, 0.08, timber, { at: [xc + t * (WX / 2 + 0.4), EAVE - 0.3, WZ1 + 0.7], rot: [0, 0, t * ba] });
      }
      // windows: big ground-floor mullioned window, oriel above
      b.window(3.0, 1.6, { at: [xc, 0.9, WZ1], facing: '+z', frame: glaze, bars: [6, 3], border: 0.1 });
      b.box(3.4, 0.15, 0.2, P.stucco, { at: [xc, 2.6, WZ1 + 0.1] });
      b.window(2.4, 1.3, { at: [xc, G + 0.7, zf + 0.07], facing: '+z', frame: glaze, bars: [5, 3], border: 0.1 });
      for (const z of [-8.5, -5.5, -2.8]) {
        b.window(1.6, 1.4, { at: [s * (MX + WX), 0.9, z], facing: s > 0 ? '+x' : '-x', frame: glaze, bars: [4, 3] });
      }
      b.window(1.4, 1.2, { at: [s * (MX + WX), G + 0.8, -6.0], facing: s > 0 ? '+x' : '-x', frame: glaze, bars: [3, 3] });
      b.window(2.0, 1.4, { at: [xc, 0.9, WZ0], facing: '-z', frame: glaze, bars: [4, 3] });
      b.window(1.6, 1.2, { at: [xc, G + 0.8, WZ0], facing: '-z', frame: glaze, bars: [4, 3] });
    });

    // back of the main range: service door and windows
    for (const x of [-3.5, 0, 3.5]) b.window(1.4, 1.3, { at: [x, 1.0, MZ0], facing: '-z', frame: glaze, bars: [4, 3] });
    for (const x of [-3, 3]) b.window(1.4, 1.2, { at: [x, G + 0.8, MZ0], facing: '-z', frame: glaze, bars: [4, 3] });

    // chimneys: clustered stacks on the main ridge and on the wing
    tudorStack(b, [-2.2, EAVE + RISE - 0.6, mz], 3, 2.6, brick);
    tudorStack(b, [2.6, EAVE + RISE - 0.6, mz], 2, 2.6, brick);
    tudorStack(b, [(MX + WX) - 0.6, EAVE - 0.6, -7.5], 2, 3.6, brick);

    // ---------------- front of the site: low brick wall, gallows sign, cars
    b.sym((s) => {
      b.box(7.6, 0.7, 0.35, brick, { at: [s * 7.1, 0, 10.6] });
      b.box(7.6, 0.1, 0.45, tint(brick, -0.1), { at: [s * 7.1, 0.7, 10.6] });
      b.box(0.6, 1.2, 0.6, brick, { at: [s * 3.3, 0, 10.6] });
      b.pyramid(0.7, 0.7, 0.3, tint(brick, -0.1), { at: [s * 3.3, 1.2, 10.6] });
    });
    // freestanding pictorial sign on an oak post with a little tiled hood
    b.group({ at: [-8.6, 0, 9.4] }, () => {
      b.box(0.3, 4.6, 0.3, timber);
      b.box(1.8, 0.2, 0.2, timber, { at: [0.75, 4.2, 0] });
      b.group({ at: [0.2, 3.7, 0], rot: [0, 0, -0.8] }, () => b.box(0.12, 0.7, 0.12, timber));
      b.box(1.3, 1.5, 0.1, timber, { at: [1.0, 2.55, 0] });
      b.box(1.1, 1.3, 0.14, P.doorRed, { at: [1.0, 2.65, 0] });
      b.box(0.6, 0.6, 0.18, P.gold, { at: [1.0, 3.0, 0] });
      b.gable(1.9, 0.6, 0.35, tile, { at: [0.75, 4.4, 0], overhang: 0.1 });
    });
    car(b, [-6.5, 0, 3.6], Math.PI / 2, b.pick([P.doorBlack, P.doorBlue, P.doorGreen]), 1930);
    car(b, [4.0, 0, 3.4], Math.PI / 2 + 0.05, b.pick([P.doorRed, P.cream, P.doorBlack]), 1930);
    // flower beds under the front
    b.sym((s) => b.tree(1.0, { at: [s * 6.8, 0, -1.2], kind: 'bush' }));
    b.tree(5.5, { at: [9.2, 0, 7.5], kind: 'round' });

    // ---------------- colliders
    b.collider(2 * MX, md + 1.4, { at: [0, 0, mz + 0.7] });
    b.sym((s) => b.collider(WX, WZ1 - WZ0 + 0.3, { at: [s * (MX + WX / 2), 0, (WZ0 + WZ1) / 2 + 0.15] }));
    b.sym((s) => b.collider(7.6, 0.4, { at: [s * 7.1, 0, 10.6] }));
  },
};
