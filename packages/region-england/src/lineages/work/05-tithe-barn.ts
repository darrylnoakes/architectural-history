import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, riverWall, waterwheel } from './shared';

/** A stepped buttress against a wall facing `dir`, base centre on the wall face at (x, z). */
function buttress(b: Builder, x: number, z: number, h: number, col: number, rotY: number) {
  b.group({ at: [x, 0, z], rotY }, () => {
    b.box(0.85, h * 0.55, 1.1, col, { at: [0, 0, 0.55] });
    b.box(0.85, h * 0.35, 0.75, col, { at: [0, h * 0.55, 0.375] });
    b.extrude([[0, 0], [0.75, 0], [0, 0.7]], 0.85, col, { at: [0, h * 0.9, 0], rotY: -Math.PI / 2 });
  });
}

export const titheBarn: BuildingDef = {
  id: 'tithe-barn',
  name: 'Great barn and mill',
  style: 'Medieval (Decorated period)',
  date: 'c. 1320',
  summary:
    'Barns like this are usually called tithe barns, after the tenth of every harvest that was owed to the Church, but most of the great stone ones were built by abbeys to store the corn of their own great estates. ' +
    'It is a vast single space under one roof, with thick stone walls held up by buttresses and narrow slits for air. ' +
    'Laden wagons drove in through the tall porches and out of smaller doors opposite, and the cross-draught between them was used for winnowing the threshed grain. ' +
    'The mill still stands by the river, now rebuilt wholly in stone.',
  materials: ['limestone rubble', 'ashlar dressings', 'stone slates', 'oak roof trusses'],
  lookFor: [
    { label: 'Cart porch', note: 'Projecting wings with doors tall enough for a wagon piled high with sheaves.', at: [-10, 6.0, 10.4] },
    { label: 'Buttresses', note: 'Stepped stone props that resist the outward thrust of the huge roof.', at: [-4.2, 3.4, 6.6] },
    { label: 'Ventilation slits', note: 'Narrow openings keep the stored grain aired while keeping out thieves and birds.', at: [5.0, 3.0, 6.2] },
    { label: 'Steep stone-slate roof', note: 'Split limestone slates hung on oak pegs, laid in courses that get smaller toward the ridge.', at: [-4, 10.5, 0] },
    { label: 'Undershot wheel', note: 'The mill, now wholly of stone, with its wheel turning in the river below.', at: [13.5, 2.6, -12.6] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.limestoneWarm, P.limestone, tint(P.limestoneWarm, -0.04)]);
    const dress = tint(stone, 0.06);
    const roof = b.pick([P.stoneSlate, tint(P.stoneSlate, -0.04)]);

    // ---- the barn
    const bx = -4;
    const bz = 0.6;
    const L = 26;
    const D = 10.6;
    const H = 5.6;
    const rise = 6.4;
    b.box(L, H, D, stone, { at: [bx, 0, bz] });
    b.box(L + 0.2, 0.35, D + 0.2, dress, { at: [bx, 0, bz] }); // plinth
    b.gable(L, D, rise, roof, { at: [bx, H, bz], overhang: 0.35, thick: 0.25, wall: stone });
    // coped gable parapets with cross finials
    b.sym((s) => {
      const x = bx + (s * L) / 2;
      b.extrude([[-D / 2 - 0.3, 0], [0, rise + 0.3], [D / 2 + 0.3, 0], [D / 2, 0], [0, rise], [-D / 2, 0]], 0.6, dress, { at: [x, H, bz], rotY: Math.PI / 2 });
      b.box(0.25, 0.9, 0.25, dress, { at: [x, H + rise + 0.2, bz] });
      b.box(0.25, 0.22, 0.75, dress, { at: [x, H + rise + 0.75, bz] });
      // owl hole and slits in the gable ends
      b.panel(0.5, 0.5, P.timberBlack, { at: [x + s * 0.02, H + 3.4, bz], facing: s > 0 ? '+x' : '-x', shape: 'circle' });
      for (const z of [-2.5, 0, 2.5]) b.panel(0.16, 1.3, P.timberBlack, { at: [x, 2.0, bz + z], facing: s > 0 ? '+x' : '-x' });
      // angle buttresses at the corners
      b.sym((t) => buttress(b, x - s * 0.45, bz + (t * D) / 2, H, stone, t > 0 ? 0 : Math.PI));
      b.sym((t) => buttress(b, x, bz + t * (D / 2 - 0.5), H, stone, s > 0 ? Math.PI / 2 : -Math.PI / 2));
    });
    // the two porches on the front, with buttresses between them
    const porchX = [bx - 6.5, bx + 6.5];
    const pw = 6.2;
    const pd = 4.2;
    const fz = bz + D / 2;
    const pr = (pw / 2) * Math.tan((50 * Math.PI) / 180);
    const slope = rise / (D / 2);
    const meet = (pr) / slope; // how far into the main roof the porch ridge runs
    for (const px of porchX) {
      b.box(pw, H, pd, stone, { at: [px, 0, fz + pd / 2] });
      b.box(pw + 0.2, 0.35, pd + 0.1, dress, { at: [px, 0, fz + pd / 2] });
      const rl = pd + meet + 0.35;
      b.gable(pw, rl, pr, roof, { at: [px, H, fz + pd + 0.35 - rl / 2], ridge: 'z', overhang: 0.3, thick: 0.25, wall: stone });
      b.extrude([[-pw / 2 - 0.25, 0], [0, pr + 0.25], [pw / 2 + 0.25, 0], [pw / 2, 0], [0, pr], [-pw / 2, 0]], 0.5, dress, { at: [px, H, fz + pd] });
      // tall pointed cart doorway with plank doors
      const dz = fz + pd;
      b.panel(4.0, 5.6, dress, { at: [px, 0, dz], facing: '+z', shape: 'pointed', depth: 0.05 });
      b.panel(3.6, 5.3, P.oakDark, { at: [px, 0, dz], facing: '+z', shape: 'pointed', depth: 0.1 });
      b.panel(0.08, 4.0, P.timberBlack, { at: [px, 0, dz], facing: '+z', depth: 0.14 });
      b.panel(0.55, 0.55, P.timberBlack, { at: [px, H + 1.2, dz + 0.25], facing: '+z', shape: 'circle' });
      b.sym((s) => buttress(b, px + s * (pw / 2 - 0.45), dz, H - 0.5, stone, 0));
      // smaller doors opposite on the back wall
      b.panel(2.6, 3.4, dress, { at: [px, 0, bz - D / 2], facing: '-z', shape: 'pointed', depth: 0.05 });
      b.panel(2.2, 3.1, P.oakDark, { at: [px, 0, bz - D / 2], facing: '-z', shape: 'pointed', depth: 0.1 });
    }
    // buttresses and slits along the long walls
    const bays = [-11, -8.2, -3.4, 0, 3.4, 8.2, 11];
    for (const x of bays) {
      if (Math.abs(x) > 4 && Math.abs(x) < 9.6) continue; // the porches are here
      buttress(b, bx + x, fz, H - 0.4, stone, 0);
    }
    for (const x of [-11, -8.2, -4.8, -1.7, 1.7, 4.8, 8.2, 11]) buttress(b, bx + x, bz - D / 2, H - 0.4, stone, Math.PI);
    for (const x of [-11.9, -1.7, 1.7, 11.6]) b.panel(0.16, 1.4, P.timberBlack, { at: [bx + x, 2.2, fz], facing: '+z' });
    for (const x of [-9.6, -3.2, 3.2, 9.6]) b.panel(0.16, 1.4, P.timberBlack, { at: [bx + x, 2.2, bz - D / 2], facing: '-z' });

    // ---- the mill, now of stone, at the river's edge
    const mx = 13.6;
    const mz = -7.4;
    const mw = 6.6;
    const md = 6.4;
    const mh = 5.2;
    riverWall(b, 8.6, 17.8, stone, { coping: dress });
    b.box(mw, mh, md, stone, { at: [mx, 0, mz] });
    b.gable(mw, md, 3.4, P.tileBrown, { at: [mx, mh, mz], overhang: 0.3, wall: stone, ridge: 'z' });
    b.panel(1.2, 2.2, P.oakDark, { at: [mx - 1.2, 0, mz + md / 2], facing: '+z', shape: 'pointed' });
    b.panel(0.5, 0.9, P.timberBlack, { at: [mx + 1.6, 1.6, mz + md / 2], facing: '+z', shape: 'pointed' });
    b.panel(1.0, 1.3, P.oak, { at: [mx, mh - 1.6, mz + md / 2], facing: '+z' });
    b.panel(0.5, 0.9, P.timberBlack, { at: [mx, mh + 0.9, mz + md / 2], facing: '+z', shape: 'pointed' });
    b.sym((s) => b.panel(0.5, 0.9, P.timberBlack, { at: [mx + (s * mw) / 2, 2.6, mz], facing: s > 0 ? '+x' : '-x', shape: 'pointed' }));
    b.panel(0.6, 1.0, P.timberBlack, { at: [mx + 1.8, 3.0, mz - md / 2], facing: '-z', shape: 'pointed' });
    // wheel hung over the river from the back wall, on a stone pier
    const wz = BANK - 0.95;
    waterwheel(b, { at: [mx - 1.0, WATER - 0.35 + 2.1, wz], r: 2.1, width: 1.0, kind: 'undershot', paddles: 14, spokes: 6, spin: b.rand() });
    // a stone pier in the river carries the outer bearing of the axle
    const ay = WATER - 0.35 + 2.1;
    b.box(0.6, ay - 0.24 - WATER + 0.6, 0.6, stone, { at: [mx - 1.0, WATER - 0.6, wz - 0.95] });

    // ---- a thatched rick on staddle stones and a fence to the lane
    const rx = 13;
    const rz = 4.8;
    for (const x of [-1.2, 0, 1.2]) for (const z of [-1, 1]) {
      b.cyl(0.12, 0.6, stone, { at: [rx + x, 0, rz + z], segs: 6 });
      b.cyl(0.32, 0.12, stone, { at: [rx + x, 0.6, rz + z], segs: 8 });
    }
    b.box(3.6, 2.0, 3.0, P.crop, { at: [rx, 0.72, rz] });
    b.gable(3.6, 3.0, 1.8, P.thatch, { at: [rx, 2.72, rz], overhang: 0.2, thick: 0.3 });
    for (let i = 0; i < 9; i++) b.box(0.12, 1.1, 0.12, P.oak, { at: [9.4 + i * 1.0, 0, 10] });
    b.box(8.2, 0.12, 0.08, P.oak, { at: [13.4, 0.9, 10] });
    b.box(8.2, 0.12, 0.08, P.oak, { at: [13.4, 0.5, 10] });

    b.collider(L + 1.6, D + 2, { at: [bx, 0, bz] });
    for (const px of porchX) b.collider(pw + 1.6, pd + 1, { at: [px, 0, fz + pd / 2 + 0.4] });
    b.collider(mw, md, { at: [mx, 0, mz] });
    b.collider(3.6, 3, { at: [rx, 0, rz] });
  },
};
