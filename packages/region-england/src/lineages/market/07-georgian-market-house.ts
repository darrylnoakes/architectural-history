import { P, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { goods, oct, trestle } from './shared';

/** Collider blocks for the piers of a walk-through arcade face. */
function pierColliders(b: Builder, len: number, n: number, openW: number, fixed: number, alongX: boolean, t: number): void {
  const pitch = len / n;
  for (let i = 0; i <= n; i++) {
    const c = -len / 2 + i * pitch;
    const pw = i === 0 || i === n ? (pitch - openW) / 2 : pitch - openW;
    const cc = i === 0 ? c + pw / 2 : i === n ? c - pw / 2 : c;
    if (alongX) b.collider(pw, t, { at: [cc, 0, fixed] });
    else b.collider(t, pw, { at: [fixed, 0, cc] });
  }
}

export const georgianMarketHouse: BuildingDef = {
  id: 'georgian-market-house',
  name: 'Market house',
  style: 'Georgian classical',
  date: 'c. 1750',
  summary:
    'Timber framing has gone out of fashion, and the town rebuilds its market hall as a stone temple of commerce. ' +
    'The old arrangement survives, an open trading floor under a room for the corporation, but now it is ordered by classical rules: an arcade of round arches below, tall sash windows above, a pediment with the town clock over the centre and a cupola on the roof. ' +
    'The upper room has become an assembly room, used for the court, for balls and for the county’s polite society.',
  materials: ['limestone ashlar', 'slate', 'lead', 'painted timber sashes'],
  lookFor: [
    { label: 'Open arcade', note: 'Round arches on square piers, open on all sides, so the market still trades on the ground floor.', at: [0, 2.4, 4.95] },
    { label: 'Pediment', note: 'The low triangular gable of a classical temple, marking the centre of the main fronts. The clock sits in its tympanum.', at: [0, 10.4, 5.2] },
    { label: 'Sash windows', note: 'Tall windows of small panes in sliding timber sashes, evenly spaced to light the assembly room.', at: [-6.1, 6.4, 4.85] },
    { label: 'Cupola', note: 'A small domed lantern on the roof, holding the market bell and giving the building a skyline.', at: [0, 13.6, 0.4] },
    { label: 'Keystones', note: 'The wedge at the crown of each arch, here enlarged and projecting to show it off.', at: [3.2, 4.05, 4.95] },
  ],
  modelledOn: 'A typical mid-Georgian market house, in the tradition of County Hall, Abingdon (1678 to 1682)',
  influences: ['palladianism'],
  build(b) {
    const W = 16;
    const D = 9.6;
    const GH = 4.4; // arcade storey
    const UH = 4.2; // assembly room storey
    const T = 0.6;
    const stone = b.variant === 0 ? P.bathStone : b.pick([P.bathStone, P.limestone, P.portland]);
    const dress = tint(stone, 0.04);
    const shadow = tint(stone, -0.08);
    const upper = b.variant % 2 === 0 ? stone : b.pick([P.brickRed, P.brickOrange]);

    // paved platform with a step all round
    b.box(W + 1.4, 0.15, D + 1.4, P.paving);
    b.box(W + 0.4, 0.15, D + 0.4, stone, { at: [0, 0.15, 0] });
    const F = 0.3;

    // the arcades
    const nF = 5;
    const nE = 3;
    const oW = 2.3;
    const oH = 3.6;
    for (const s of [1, -1] as const) {
      b.archWall(W, GH, T, stone, { at: [0, F, s * (D / 2 - T / 2)], facing: s > 0 ? '+z' : '-z', openings: nF, openW: oW, openH: oH, shape: 'round' });
      b.archWall(D - 2 * T, GH, T, stone, { at: [s * (W / 2 - T / 2), F, 0], facing: s > 0 ? '+x' : '-x', openings: nE, openW: oW, openH: oH, shape: 'round' });
      pierColliders(b, W, nF, oW, s * (D / 2 - T / 2), true, T);
      pierColliders(b, D - 2 * T, nE, oW, s * (W / 2 - T / 2), false, T);
    }
    // impost bands, keystones and rusticated quoins
    const fx = spread(nF, -W / 2, W / 2);
    const ez = spread(nE, -(D / 2 - T), D / 2 - T);
    for (const s of [1, -1] as const) {
      const zf = s * (D / 2);
      const facing = s > 0 ? '+z' : '-z';
      for (const x of fx) {
        b.panel(0.42, 0.55, dress, { at: [x, F + oH - 0.2, zf], facing, depth: 0.12 });
        for (const dx of [-1, 1]) b.panel(0.45, 0.16, dress, { at: [x + dx * (oW / 2 + 0.225), F + oH - oW / 2 - 0.16, zf], facing, depth: 0.08 });
      }
      const xf = s * (W / 2);
      const efacing = s > 0 ? '+x' : '-x';
      for (const z of ez) {
        b.panel(0.42, 0.55, dress, { at: [xf, F + oH - 0.2, z], facing: efacing, depth: 0.12 });
        for (const dz of [-1, 1]) b.panel(0.25, 0.16, dress, { at: [xf, F + oH - oW / 2 - 0.16, z + dz * (oW / 2 + 0.125)], facing: efacing, depth: 0.08 });
      }
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        for (let i = 0; i < 6; i++) {
          const y = F + 0.1 + i * 0.72;
          const big = i % 2 === 0;
          b.box(big ? 0.9 : 0.6, 0.56, 0.1, dress, { at: [sx * (W / 2 - (big ? 0.45 : 0.3)), y, sz * (D / 2 + 0.03)] });
          b.box(0.1, 0.56, big ? 0.6 : 0.9, dress, { at: [sx * (W / 2 + 0.03), y, sz * (D / 2 - (big ? 0.3 : 0.45))] });
        }
      }
    }
    // the floor of the assembly room seen from below
    b.box(W - 2 * T, 0.4, D - 2 * T, tint(P.plaster, -0.05), { at: [0, F + GH - 0.4, 0] });
    // floor band between the storeys
    const y1 = F + GH;
    b.box(W + 0.2, 0.32, D + 0.2, dress, { at: [0, y1, 0] });

    // upper storey: the assembly room
    const y2 = y1 + 0.32;
    b.box(W, UH, D, upper, { at: [0, y2, 0] });
    // central breakfront on the long sides, carrying the pediment
    const bfW = 9.0;
    for (const s of [1, -1] as const) {
      b.box(bfW, UH, 0.25, stone, { at: [0, y2, s * (D / 2 + 0.12)] });
      const zf = s * (D / 2);
      const facing = s > 0 ? '+z' : '-z';
      fx.forEach((x, i) => {
        const z = Math.abs(x) < bfW / 2 ? zf + s * 0.25 : zf;
        b.window(1.2, 2.6, { at: [x, y2 + 0.7, z], facing, frame: P.white, bars: [3, 4] });
        b.panel(1.5, 0.12, dress, { at: [x, y2 + 0.58, z], facing, depth: 0.1 }); // sill
        b.panel(1.5, 0.35, dress, { at: [x, y2 + 3.35, z], facing, depth: 0.08 }); // flat hood
        void i;
      });
      // pilasters framing the breakfront
      for (const px of [-bfW / 2 + 0.25, bfW / 2 - 0.25]) b.panel(0.5, UH, dress, { at: [px, y2, zf + s * 0.25], facing, depth: 0.1 });
    }
    for (const s of [1, -1] as const) {
      const xf = s * (W / 2);
      const facing = s > 0 ? '+x' : '-x';
      for (const z of ez) {
        b.window(1.2, 2.6, { at: [xf, y2 + 0.7, z], facing, frame: P.white, bars: [3, 4] });
        b.panel(1.5, 0.12, dress, { at: [xf, y2 + 0.58, z], facing, depth: 0.1 });
        b.panel(1.5, 0.35, dress, { at: [xf, y2 + 3.35, z], facing, depth: 0.08 });
      }
    }
    // quoins on the upper corners
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const y = y2 + 0.05 + i * 0.68;
        const big = i % 2 === 0;
        b.box(big ? 0.8 : 0.5, 0.56, 0.08, dress, { at: [sx * (W / 2 - (big ? 0.4 : 0.25)), y, sz * (D / 2 + 0.03)] });
        b.box(0.08, 0.56, big ? 0.5 : 0.8, dress, { at: [sx * (W / 2 + 0.03), y, sz * (D / 2 - (big ? 0.25 : 0.4))] });
      }
    }
    // cornice and the pediments
    const y3 = y2 + UH;
    b.box(W + 0.5, 0.42, D + 0.5, dress, { at: [0, y3, 0] });
    b.box(W + 0.3, 0.12, D + 0.3, shadow, { at: [0, y3 - 0.12, 0] });
    for (const s of [1, -1] as const) {
      const pz = s * (D / 2 + 0.2);
      b.extrude([[-bfW / 2 - 0.25, 0], [bfW / 2 + 0.25, 0], [0, 1.9]], 0.6, dress, { at: [0, y3 + 0.42, pz] });
      b.extrude([[-bfW / 2 + 0.2, 0.12], [bfW / 2 - 0.2, 0.12], [0, 1.63]], 0.62, stone, { at: [0, y3 + 0.42, pz] });
      // clock in the tympanum
      b.panel(0.95, 0.95, P.white, { at: [0, y3 + 0.62, pz + s * 0.31], facing: s > 0 ? '+z' : '-z', shape: 'circle', depth: 0.05 });
      b.panel(0.75, 0.75, P.doorBlue, { at: [0, y3 + 0.72, pz + s * 0.33], facing: s > 0 ? '+z' : '-z', shape: 'circle', depth: 0.05 });
      b.panel(0.04, 0.32, P.gold, { at: [0, y3 + 1.08, pz + s * 0.4], facing: s > 0 ? '+z' : '-z', depth: 0.03 });
      b.panel(0.24, 0.04, P.gold, { at: [0.12, y3 + 1.08, pz + s * 0.4], facing: s > 0 ? '+z' : '-z', depth: 0.03 });
    }

    // hipped slate roof with a flat leaded top for the cupola
    const yR = y3 + 0.42;
    b.hip(W + 0.1, D + 0.1, 2.8, P.slate, { at: [0, yR, 0], ridge: W - D + 1.5, overhang: 0.15 });
    // chimney stacks for the assembly room fireplaces
    for (const s of [-1, 1]) b.chimney(0.8, 2.4, 1.4, stone, { at: [s * (W / 2 - 2.6), yR + 0.6, 0], pots: 2 });

    // cupola: square base, octagonal arcaded drum, lead dome, ball and vane
    const yC = yR + 2.2;
    b.box(2.6, 0.8, 2.6, stone, { at: [0, yC, 0] });
    b.box(2.8, 0.15, 2.8, dress, { at: [0, yC + 0.8, 0] });
    const yD = yC + 0.95;
    oct(b, 1.15, 1.9, P.white, [0, yD, 0]);
    for (let k = 0; k < 8; k++) {
      const th = (k * Math.PI) / 4;
      const ap = 1.15 * Math.cos(Math.PI / 8);
      b.panel(0.55, 1.4, P.windowDark, { at: [Math.sin(th) * ap, yD + 0.2, Math.cos(th) * ap], facing: th, shape: 'round', depth: 0.03 });
    }
    oct(b, 1.3, 0.2, P.white, [0, yD + 1.9, 0]);
    b.dome(1.15, P.lead, { at: [0, yD + 2.1, 0], squash: 1.1, segs: 8 });
    b.sphere(0.18, P.gold, { at: [0, yD + 3.45, 0], segs: 6 });
    b.box(0.05, 1.0, 0.05, P.iron, { at: [0, yD + 3.5, 0] });
    b.box(0.7, 0.18, 0.03, P.gold, { at: [0.2, yD + 4.2, 0] });

    // traders in the arcade
    trestle(b, 2.6, 0.8, [-3.2, F, 1.5], 0);
    goods(b, 2.2, [-3.2, F + 0.88, 1.5], 0, ['basket', 'fruit', 'basket']);
    trestle(b, 2.6, 0.8, [3.2, F, -1.5], Math.PI);
    goods(b, 2.2, [3.2, F + 0.88, -1.5], Math.PI, ['basket', 'pot', 'basket']);
    goods(b, 1.8, [5.2, F, 2.0], 0.3, ['sack', 'sack', 'sack']);
  },
};
