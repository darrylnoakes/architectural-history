import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { MOTTE, arch, motte, motteY, quad, soup } from './shared';

/** Clustered brick chimney shafts on a shared base, as Elizabethan builders loved to show off. */
function stack(b: Builder, x: number, y: number, z: number, n: number, brick: number, stone: number, rotY = 0) {
  b.group({ at: [x, y, z], rotY }, () => {
    const w = n * 0.75;
    b.box(w + 0.3, 1.6, 1.1, brick);
    b.box(w + 0.5, 0.2, 1.3, stone, { at: [0, 1.6, 0] });
    for (let i = 0; i < n; i++) {
      const px = -w / 2 + 0.375 + i * 0.75;
      b.cyl(0.3, 3.0, brick, { at: [px, 1.8, 0], segs: 6 });
      b.box(0.66, 0.3, 0.66, tint(brick, -0.05), { at: [px, 4.8, 0] });
    }
  });
}

/** A gable end with stone coping and a ball finial, facing +Z in local space. */
function frontGable(b: Builder, w: number, h: number, depth: number, brick: number, stone: number) {
  b.extrude([[-w / 2, 0], [w / 2, 0], [0, h]], depth, brick);
  const a = Math.atan2(h, w / 2);
  const len = Math.hypot(w / 2, h) + 0.3;
  b.sym((s) => {
    b.box(len, 0.25, depth + 0.2, stone, { at: [(s * w) / 4, h / 2 - 0.1, 0], rot: [0, 0, s * -a] });
  });
  b.sphere(0.28, stone, { at: [0, h + 0.3, depth / 2 - 0.1], segs: 6 });
}

/** A ruined length of curtain wall with the stump of a round tower: the castle kept as a garden ornament. */
export function castleFragment(b: Builder, stone: number) {
  const ruin = mix(stone, P.rubble, 0.35);
  // stump of a round corner tower, broken off unevenly
  b.group({ at: [15.2, 0, -17.8] }, () => {
    b.cyl(3.2, 1.4, tint(ruin, -0.04), { segs: 12, rTop: 2.7 });
    b.cyl(2.7, 6.5, ruin, { segs: 12 });
    b.cyl(2.7, 2.2, ruin, { at: [0, 6.5, 0], segs: 12, rTop: 2.2 });
    b.box(1.6, 2.6, 1.4, ruin, { at: [1.6, 8.0, 1.2], rotY: 0.6 });
    b.box(1.3, 1.6, 1.2, ruin, { at: [-1.4, 8.0, 1.6], rotY: -0.4 });
    b.cyl(1.8, 0.3, tint(P.turf, 0.04), { at: [0, 8.7, 0], segs: 8 });
    b.panel(0.18, 1.5, P.black, { at: [0, 3, 2.7], facing: '+z' });
    b.panel(0.55, 0.16, P.black, { at: [0, 3.9, 2.7], facing: '+z' });
    arch(b, 1.4, 2.4, P.black, { at: [-2.5, 0, 0.6], facing: -1.2 });
  });
  // a run of curtain wall, its top ragged where stone has been robbed
  const heights = [6.8, 6.2, 7.2, 5.1, 4.2, 3.4, 2.3, 1.2];
  heights.forEach((h, i) => {
    const z = -17.8 + 0.965 * (2.8 + i * 1.5);
    const x = 15.2 + 0.261 * (2.8 + i * 1.5);
    b.box(2, h, 1.65, ruin, { at: [x, 0, z], rotY: -(Math.PI / 2 - 0.26) });
    if (i % 2 === 0 && h > 5) b.box(0.8, 0.8, 0.4, ruin, { at: [x + 0.7, h, z - 0.2], rotY: -(Math.PI / 2 - 0.26) });
  });
  // ivy
  b.blob(1.3, P.leafDark, { at: [16.9, 4.2, -13.6], stretch: [0.5, 1.6, 1] });
  b.blob(1.0, P.leafDark, { at: [13.4, 3, -16.4], stretch: [1, 1.8, 0.6] });
}

export const elizabethanManor: BuildingDef = {
  id: 'elizabethan-manor',
  name: 'Elizabethan manor house',
  style: 'Elizabethan',
  date: 'c. 1575',
  summary:
    'Under strong Tudor government, and with cannon able to batter walls down, castles lost much of their point; this one was left to decay and quarried for its stone. The new lord builds a house to be seen rather than to hold: an E-shaped plan of fashionable brick, two wings and a central porch, ' +
    'with walls of glass in huge mullioned and transomed windows and tall clustered chimneys announcing many warm rooms. ' +
    'The old motte survives as a garden mount, a spiral walk to its top for a view over the knot garden, and a broken stretch of the castle wall is kept, perhaps as a reminder of the family\'s ancient lineage.',
  materials: ['red brick with blue diaper', 'limestone dressings', 'clay plain tiles', 'leaded glass'],
  lookFor: [
    { label: 'E-plan', note: 'Two wings project forward at the ends and a porch in the middle, so the plan reads as a letter E; it is often said, probably wrongly, to honour the Queen.', at: [0, 11.6, 17.8] },
    { label: 'Mullioned and transomed windows', note: 'Great windows divided by upright stone mullions and horizontal transoms, filled with small leaded panes; glass itself was a display of wealth.', at: [-6.5, 6.5, 12.3] },
    { label: 'Clustered chimneys', note: 'Several tall brick shafts grouped on one base, each serving a fireplace in a different room.', at: [9, 18.2, 6.8] },
    { label: 'Porch of the orders', note: 'The central porch carries classical columns stacked in their proper order, Doric, Ionic, then Corinthian, a Renaissance motif learned from books and applied to a still-medieval house.', at: [0, 4.4, 16.6] },
    { label: 'Castle ruin and garden mount', note: 'A ruined fragment of the medieval curtain wall kept in the garden, and the old motte reused as a mount with a spiral path.', at: [15.6, 9.4, -16] },
  ],
  influences: ['flemish-brick', 'italian-renaissance'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, -0.03), mix(P.brickRed, P.brickOrange, 0.3)]);
    const stone = P.limestoneWarm;
    const diaper = P.brickBlue;
    const roof = P.tileBrown;
    const win = (w: number, h: number, at: [number, number, number], facing: '+z' | '-z' | '+x' | '-x', cols: number, rows: number) =>
      b.window(w, h, { at, facing, frame: stone, bars: [cols, rows], border: 0.14, glass: mix(P.windowDark, P.glass, 0.15) });

    // ------------------------------------------------------- garden mount (the old motte) and the ruin
    motte(b, { color: tint(P.grass, 0.02), ditch: 'none' });
    // spiral walk winding up the mount
    const path: number[] = [];
    const turns = 1.6;
    const N = 44;
    const startA = 0.6;
    for (let i = 0; i < N; i++) {
      const t0 = i / N;
      const t1 = (i + 1) / N;
      const pt = (t: number, off: number) => {
        const r = MOTTE.rBase - 0.6 - t * (MOTTE.rBase - MOTTE.rTop - 0.4) + off;
        const a = startA + t * turns * Math.PI * 2;
        const x = MOTTE.x + r * Math.cos(a);
        const z = MOTTE.z + r * Math.sin(a);
        return [x, motteY(x, z) + 0.12, z];
      };
      quad(path, pt(t0, -0.7), pt(t1, -0.7), pt(t1, 0.7), pt(t0, 0.7));
    }
    soup(b, path, P.gravel);
    // a little banqueting house on the summit
    b.group({ at: [MOTTE.x, MOTTE.h, MOTTE.z] }, () => {
      b.cyl(2, 3, P.limewash, { segs: 8 });
      b.lathe([[2.4, 0], [1.6, 0.9], [0.5, 2.0], [0.15, 2.6], [0.01, 2.8]], P.lead, { at: [0, 3, 0], segs: 8 });
      arch(b, 1, 2.1, P.oakDark, { at: [0, 0, 1.85], facing: '+z', shape: 'round' });
      for (const a of [0.8, 2.4, 4.0, 5.5]) b.panel(0.8, 1.1, P.windowDark, { at: [Math.sin(a) * 1.85, 1.2, Math.cos(a) * 1.85], facing: a });
    });
    castleFragment(b, P.limestone);

    // knot garden: walled square of low clipped box hedges, back right
    b.group({ at: [8.8, 0, -8] }, () => {
      b.box(12, 0.06, 10, P.gravel, { jitter: false });
      for (const [w, d, x, z] of [[11, 0.4, 0, 4.8], [11, 0.4, 0, -4.8], [0.4, 9.6, 5.3, 0], [0.4, 9.6, -5.3, 0]]) {
        b.box(w, 0.6, d, P.hedge, { at: [x, 0, z] });
      }
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          b.box(4.2, 0.45, 0.35, P.hedge, { at: [sx * 2.7, 0, sz * 2.2], rotY: sx * sz * 0.6 });
          b.box(4.2, 0.45, 0.35, P.hedge, { at: [sx * 2.7, 0, sz * 2.2], rotY: -sx * sz * 0.6 });
          b.cone(0.5, 1.6, P.leafDark, { at: [sx * 4.5, 0, sz * 3.8], segs: 6 });
        }
      b.cyl(0.7, 0.8, stone, { segs: 8 }); // sundial
      b.cyl(0.15, 0.4, stone, { at: [0, 0.8, 0], segs: 6 });
    });

    // ------------------------------------------------------- the house
    const Z0 = 4; // back wall
    const DM = 7.4; // main range depth
    const ZM = Z0 + DM / 2;
    const XL = -15;
    const XR = 18;
    const XC = (XL + XR) / 2; // 1.5
    const LM = XR - XL;
    const H = 10.4; // three storeys
    const storeys = [0.5, 4.1, 7.5];
    const WW = 6.4; // wing width
    const WD = 8.6; // wing projection beyond the main range
    const FRONT = Z0 + DM;

    b.group({ at: [XC, 0, 0] }, () => {
      const half = LM / 2;
      // stone plinth and the main range
      b.box(LM + 0.3, 0.5, DM + 0.3, stone, { at: [0, 0, ZM] });
      b.box(LM, H, DM, brick, { at: [0, 0, ZM] });
      b.gable(LM, DM, 4.4, roof, { at: [0, H, ZM], overhang: 0.25, wall: brick });
      // the wings
      b.sym((s) => {
        const wx = s * (half - WW / 2);
        const wz = ZM + WD / 2 + 0.01;
        const wl = DM + WD;
        b.box(WW + 0.3, 0.5, wl + 0.3, stone, { at: [wx, 0, wz] });
        b.box(WW, H, wl, brick, { at: [wx, 0, wz] });
        b.gable(WW, wl, 4.2, roof, { at: [wx, H, wz], ridge: 'z', overhang: 0.25, wall: brick });
        // stone quoins
        for (const y of spread(9, 0.6, H - 0.6)) {
          b.box(0.5, 0.35, 0.5, stone, { at: [wx + s * (WW / 2 - 0.2), y, wz + wl / 2 - 0.2], jitter: false });
          b.box(0.5, 0.35, 0.5, stone, { at: [wx - s * (WW / 2 - 0.2), y, wz + wl / 2 - 0.2], jitter: false });
        }
        // front gable of each wing: coping and finial, a two-light attic window
        b.group({ at: [wx, H, wz + wl / 2 + 0.1] }, () => {
          frontGable(b, WW + 0.2, 4.2, 0.2, brick, stone);
          win(1.4, 1.5, [0, 0.6, 0.1], '+z', 2, 1);
        });
        // a canted bay window rising through all three floors on the wing front
        const fz = wz + wl / 2;
        b.cyl(2.0, H - 0.4, stone, { at: [wx, 0, fz - 0.6], segs: 6, rotY: Math.PI / 6 });
        b.cyl(2.1, 0.4, stone, { at: [wx, H - 0.4, fz - 0.6], segs: 6, rotY: Math.PI / 6 });
        for (const y of storeys) {
          win(2.0, 2.8, [wx, y + 0.4, fz + 1.15], '+z', 4, 2);
          b.group({ at: [wx, 0, fz - 0.6] }, () => {
            for (const a of [1, -1]) {
              const ang = a * Math.PI / 3;
              b.window(1.0, 2.8, { at: [Math.sin(ang) * 1.74, y + 0.4, Math.cos(ang) * 1.74], facing: ang, frame: stone, bars: [1, 2], border: 0.12 });
            }
          });
        }
        // side windows of the wings, toward the forecourt
        for (const y of storeys) {
          win(2.2, 2.6, [wx - s * (WW / 2), y + 0.5, wz + 2.6], s > 0 ? '-x' : '+x', 4, 2);
          win(2.2, 2.6, [wx + s * (WW / 2), y + 0.5, wz + 2.6], s > 0 ? '+x' : '-x', 4, 2);
        }
        // clustered stacks on the wing ridges and outer walls
        stack(b, wx, H + 2.6, wz - 2.4, 3, brick, stone);
        stack(b, wx + s * (WW / 2 + 0.6), H - 1.8, ZM, 2, brick, stone, Math.PI / 2);
        b.box(1.2, H - 1.8, 2, brick, { at: [wx + s * (WW / 2 + 0.6), 0, ZM] });
      });
      // main front between the wings: great windows on each floor, three gables
      for (const x of [-7.6, -3.8, 3.8, 7.6]) {
        for (const y of storeys) win(2.6, 2.8, [x, y + 0.4, FRONT], '+z', 4, 2);
      }
      for (const x of [-5.7, 5.7]) {
        b.group({ at: [x, H, FRONT + 0.1] }, () => {
          frontGable(b, 4.6, 3.4, 0.2, brick, stone);
          win(1.4, 1.4, [0, 0.5, 0.1], '+z', 2, 1);
        });
        b.gable(4.6, DM / 2, 3.4, roof, { at: [x, H, FRONT - DM / 4], ridge: 'z', overhang: 0.1, wall: brick });
      }
      // diaper pattern in blue brick on the main front
      for (const x of [-9.6, -1.9, 1.9, 9.6]) {
        for (const y of [3.2, 6.8]) b.panel(0.6, 0.6, diaper, { at: [x, y, FRONT], facing: '+z', depth: 0.02, rotY: 0, rot: [0, 0, Math.PI / 4] });
      }
      // central porch of the orders, rising to a parapet
      const PW = 3.8;
      const PD = 3.2;
      b.box(PW, H + 1.2, PD, brick, { at: [0, 0, FRONT + PD / 2] });
      b.box(PW + 0.3, 0.35, PD + 0.3, stone, { at: [0, H + 1.2, FRONT + PD / 2] });
      b.crenel(PW + 0.2, PD + 0.2, stone, { at: [0, H + 1.55, FRONT + PD / 2], merlonW: 0.4, merlonH: 0.5, t: 0.25 });
      const pf = FRONT + PD;
      arch(b, 1.8, 3, stone, { at: [0, 0.5, pf], facing: '+z', shape: 'round' });
      arch(b, 1.4, 2.7, P.doorBlack, { at: [0, 0.5, pf + 0.02], facing: '+z', shape: 'round' });
      b.sym((s) => {
        b.column(0.18, 3.4, stone, { at: [s * 1.35, 0.5, pf + 0.2], order: 'doric', segs: 8 });
        b.column(0.16, 3.0, stone, { at: [s * 1.35, 4.3, pf + 0.2], order: 'ionic', segs: 8 });
        b.column(0.14, 2.8, stone, { at: [s * 1.35, 7.6, pf + 0.2], order: 'corinthian', segs: 8 });
      });
      for (const y of [3.9, 7.3]) b.box(PW + 0.1, 0.3, 0.5, stone, { at: [0, y, pf + 0.1] });
      win(1.6, 2.4, [0, 4.6, pf], '+z', 2, 2);
      win(1.4, 2.1, [0, 7.9, pf], '+z', 2, 2);
      b.panel(1.2, 0.7, stone, { at: [0, 10.4, pf], facing: '+z' }); // armorial panel
      b.stairs(2.8, 0.5, 1.2, 3, stone, { at: [0, 0, pf + 0.6] });
      // chimney stacks on the main ridge and back wall
      stack(b, -9, H + 2.6, ZM - 1.2, 4, brick, stone);
      stack(b, 8.4, H + 2.6, ZM - 1.2, 4, brick, stone);
      // the back: plainer, with a stair turret and smaller windows
      for (const x of spread(6, -half + 2, half - 2)) {
        for (const y of storeys) win(1.8, 2.4, [x, y + 0.4, Z0], '-z', 2, 2);
      }
      b.cyl(2, H + 2.4, brick, { at: [-1, 0, Z0 - 0.6], segs: 8 });
      b.cone(2.2, 2.8, P.lead, { at: [-1, H + 2.4, Z0 - 0.6], segs: 8 });
      b.panel(1.2, 2.3, P.doorBlack, { at: [-1, 0.4, Z0 - 2.5], facing: '-z' });
      // end walls of the main range
      b.sym((s) => {
        for (const y of storeys) win(1.8, 2.4, [s * half, y + 0.4, ZM - 1.6], s > 0 ? '+x' : '-x', 3, 2);
      });
    });

    // forecourt with a gravel walk to the porch
    b.box(4, 0.04, 6.5, P.gravel, { at: [XC, 0, FRONT + 6.4], jitter: false });
    b.sym((s) => b.box(7.6, 0.04, 6.2, tint(P.grass, 0.05), { at: [XC + s * 6.6, 0, FRONT + 4.6], jitter: false }));

    // colliders: house blocks; garden and mount walkable
    const half = LM / 2;
    b.collider(LM + 2.6, DM + 1.2, { at: [XC, 0, ZM - 0.2] });
    b.sym((s) => b.collider(WW + 1.2, DM + WD + 1.4, { at: [XC + s * (half - WW / 2), 0, ZM + WD / 2 + 0.6] }));
    b.collider(3.8, 4.2, { at: [XC, 0, FRONT + 1.8] });
    b.collider(5.6, 5.6, { at: [15.2, 0, -17.8] });
    b.collider(12.4, 2, { at: [17.1, 0, -10.6], rotY: -(Math.PI / 2 - 0.26) });
    b.collider(4, 4, { at: [MOTTE.x, 0, MOTTE.z] });
  },
};
