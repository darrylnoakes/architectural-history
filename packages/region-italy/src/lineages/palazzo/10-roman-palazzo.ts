import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { block, brackets, col, corniceProfile, courtRoof, courtRoofRibs, moulding, onFace, pediment, plate, voussoirs, win } from './shared';

/** A piano nobile window framed as a little temple front: half-columns, entablature, pediment. In the local face frame. */
function aedicule(b: Builder, x: number, y: number, w: number, h: number, ped: 'tri' | 'seg', stone: number): void {
  win(b, x, y, w, h, stone, { border: 0.16 });
  b.box(w + 0.7, 0.14, 0.3, stone, { at: [x, y - 0.3, 0.15] }); // sill
  for (const s of [-1, 1]) {
    b.box(0.3, 0.18, 0.24, stone, { at: [x + s * (w / 2 + 0.3), y - 0.16, 0.12] });
    b.cyl(0.11, h + 0.1, stone, { at: [x + s * (w / 2 + 0.3), y - 0.02, 0.1], segs: 6, rTop: 0.095, jitter: false });
    b.box(0.3, 0.16, 0.24, stone, { at: [x + s * (w / 2 + 0.3), y + h + 0.08, 0.12] });
  }
  b.box(w + 0.95, 0.36, 0.3, stone, { at: [x, y + h + 0.24, 0.15] }); // entablature
  pediment(b, x, y + h + 0.6, w + 1.15, ped === 'tri' ? 0.62 : 0.46, ped, stone, 0.32);
}

/** A ground-floor 'kneeling' window: on two consoles, with a cornice over it and an iron grille. */
function kneeling(b: Builder, x: number, y: number, w: number, h: number, stone: number): void {
  win(b, x, y, w, h, stone, { border: 0.16 });
  b.box(w + 0.6, 0.16, 0.32, stone, { at: [x, y + h + 0.16, 0.16] });
  b.box(w + 0.5, 0.14, 0.3, stone, { at: [x, y - 0.3, 0.15] });
  for (const s of [-1, 1]) b.box(0.18, 0.75, 0.3, stone, { at: [x + s * (w / 2 + 0.05), y - 1.0, 0.15] }); // consoles
  for (const dx of [-0.25, 0.25]) b.box(0.05, h, 0.05, P.iron, { at: [x + dx, y, 0.2] });
}

/** A smaller top-floor window on consoles under a triangular pediment. */
function topWindow(b: Builder, x: number, y: number, w: number, h: number, stone: number): void {
  win(b, x, y, w, h, stone, { border: 0.16 });
  b.box(w + 0.5, 0.14, 0.26, stone, { at: [x, y - 0.28, 0.13] });
  b.box(w + 0.6, 0.18, 0.26, stone, { at: [x, y + h + 0.16, 0.13] });
  pediment(b, x, y + h + 0.34, w + 0.6, 0.5, 'tri', stone, 0.26);
}

/** Alternating long and short travertine blocks up a corner, on the two faces that meet there. */
function quoins(b: Builder, x: number, z: number, sx: number, sz: number, y0: number, y1: number, stone: number, course = 1.1): void {
  const n = Math.round((y1 - y0) / course);
  const ch = (y1 - y0) / n;
  for (let i = 0; i < n; i++) {
    const long = i % 2 === 0;
    const y = y0 + i * ch + 0.04;
    const a = long ? 1.4 : 0.9;
    const c = long ? 0.9 : 1.4;
    b.box(a, ch - 0.08, 0.12, stone, { at: [x - sx * (a / 2 - 0.06), y, z + sz * 0.06] });
    b.box(0.12, ch - 0.08, c, stone, { at: [x + sx * 0.06, y, z - sz * (c / 2 - 0.06)] });
  }
}

export const romanPalazzo: BuildingDef = {
  id: 'roman-palazzo',
  name: 'Roman High Renaissance palazzo',
  style: 'High Renaissance',
  date: 'c. 1545',
  summary:
    'With the popes rebuilding Rome, the grandest palaces now follow Roman models. ' +
    'The front gives up Florentine rustication except at the corners and the doorway: it is a plain wall of plaster or brick, and all the grandeur goes into the stone frames of the windows, each a little temple front with half-columns and a pediment, triangular and segmental by turns on the main floor. ' +
    'No columns or pilasters run up the front itself; the full sequence of orders is kept for the courtyard, stacked Doric, Ionic and Corinthian in half-columns and pilasters, as on the Colosseum. ' +
    'A single great cornice binds the long, even rows of windows together.',
  materials: ['plaster or brick', 'travertine dressings', 'coppi roof tiles', 'wrought iron'],
  modelledOn: 'Palazzo Farnese, Rome (Antonio da Sangallo the Younger from 1517, continued by Michelangelo from 1546 and finished by Giacomo della Porta in 1589)',
  influences: ['renaissance-export'],
  lookFor: [
    { label: 'Aedicule windows', note: 'On the main floor each window is framed like a tiny temple: half-columns carry an entablature and a pediment, triangular and segmental in turn.', at: [-4.4, 10.0, 11.5] },
    { label: 'Rusticated quoins', note: 'Rusticated travertine blocks, long and short in turn, frame the corners: the only rustication left on the front apart from the doorway.', at: [-10.6, 4.0, 11.2] },
    { label: 'Kneeling windows', note: 'The ground-floor windows stand on carved consoles, as if kneeling, a type made fashionable by Michelangelo; iron grilles protect them.', at: [6.6, 1.0, 11.4] },
    { label: 'Balcony and coat of arms', note: 'Over the rusticated doorway a balcony fronts the central window, and above it the family arms are carved large.', at: [0, 13.2, 11.6] },
    { label: 'Crowning cornice', note: 'Michelangelo enlarged the cornice of Palazzo Farnese until it sat on the building like a crown; its frieze is studded with the family lilies.', at: [6, 17.4, 12.6] },
  ],
  build(b) {
    const wall = b.variant === 0 ? P.intonacoOchre : b.pick([P.intonacoOchre, P.intonacoCream, P.brickOrange, tint(P.intonacoOchre, 0.05)]);
    const trav = b.pick([P.travertine, tint(P.travertine, -0.03)]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.04)]);
    const plasterCourt = tint(wall, 0.04);
    const W = 21;
    const D = 22;
    const zf = D / 2;
    const G = 5.6;
    const F1 = 5.8;
    const F2 = 5.0;
    const H = G + F1 + F2; // 16.4
    const R = 6;
    const walk = 2.3;
    const gD = R - walk;
    const ci = W / 2 - R;
    const cz = zf - R;

    // ---- ranges: ground floor behind the court arcades, upper floors full depth
    b.sym((s) => block(b, W / 2 - 1.4, G, gD, wall, s * (1.4 + (W / 2 - 1.4) / 2), zf - gD / 2));
    block(b, W, G, gD, wall, 0, -zf + gD / 2);
    b.sym((s) => block(b, gD, G, 2 * cz + 2 * walk, wall, s * (W / 2 - gD / 2), 0));
    b.box(W, F1 + F2, R, wall, { at: [0, G, zf - R / 2] });
    b.box(W, F1 + F2, R, wall, { at: [0, G, -zf + R / 2] });
    b.sym((s) => b.box(R, F1 + F2, 2 * cz, wall, { at: [s * (W / 2 - R / 2), G, 0] }));
    // base, string courses and plinth bands round the whole block
    b.box(W + 0.16, 0.7, D + 0.16, trav, { at: [0, 0, 0] });
    b.box(W + 0.24, 0.3, D + 0.24, trav, { at: [0, G - 0.1, 0] });
    b.box(W + 0.24, 0.26, D + 0.24, trav, { at: [0, G + F1 - 0.1, 0] });
    // the entrance passage
    b.box(2.8, 0.06, R, P.paving, { at: [0, 0, zf - R / 2] });
    b.archWall(2.8, G, 0.9, wall, { at: [0, 0, zf - 0.45], facing: '+z', openings: 1, openW: 2.4, openH: 4.4, shape: 'round' });
    b.box(2.8, 0.3, R, tint(wall, -0.1), { at: [0, G - 0.4, zf - R / 2] });

    const bays = [-8.8, -6.6, -4.4, -2.2, 0, 2.2, 4.4, 6.6, 8.8];
    onFace(b, '+z', [0, 0, zf], () => {
      // the rusticated doorway
      for (const s of [-1, 1]) {
        for (let i = 0; i < 5; i++) {
          const long = i % 2 === 0;
          b.box(long ? 0.9 : 0.6, 0.56, 0.16, trav, { at: [s * (1.2 + (long ? 0.45 : 0.3)), 0.72 + i * 0.6, 0.08] });
        }
      }
      voussoirs(b, 0, 4.4 - 1.2, 1.2, 0.8, 9, 0.18, trav);
      // ground floor: kneeling windows
      for (const x of bays) if (x !== 0) kneeling(b, x, 2.0, 0.95, 1.6, trav);
      // main floor: aedicules with alternating pediments; the centre has a balcony and an arched window
      bays.forEach((x, i) => {
        if (x === 0) return;
        aedicule(b, x, G + 1.0, 1.0, 2.5, i % 2 === 0 ? 'tri' : 'seg', trav);
      });
      win(b, 0, G + 0.6, 1.3, 3.0, trav, { shape: 'round', border: 0.2, n: 6 });
      b.box(3.2, 0.2, 1.0, trav, { at: [0, G + 0.3, 0.5] });
      for (const s of [-1, 1]) b.box(0.3, 0.6, 0.9, trav, { at: [s * 1.2, G - 0.3, 0.45] });
      for (let i = 0; i < 7; i++) b.cyl(0.07, 0.75, trav, { at: [-1.35 + i * 0.45, G + 0.5, 0.92], segs: 5, jitter: false });
      b.box(3.2, 0.12, 0.2, trav, { at: [0, G + 1.25, 0.92] });
      // the great coat of arms above, between the main floor and the top floor
      b.group({ at: [0, G + 4.0, 0] }, () => {
        plate(b, [[-1.0, 0], [1.0, 0], [1.15, 0.9], [0.8, 1.8], [0, 2.1], [-0.8, 1.8], [-1.15, 0.9]], 0.2, trav);
        plate(b, [[-0.6, 0.3], [0.6, 0.3], [0.6, 1.3], [0, 1.65], [-0.6, 1.3]], 0.1, P.doorBlue, 0.2);
        for (const [x, y] of [[-0.3, 1.0], [0.3, 1.0], [0, 0.6]]) b.box(0.16, 0.24, 0.06, P.gold, { at: [x, y, 0.3] });
        b.cyl(0.4, 0.3, P.gold, { at: [0, 2.0, 0.1], segs: 6 });
      });
      // top floor: windows on consoles under pediments
      for (const x of bays) topWindow(b, x, G + F1 + 0.9, 0.95, 2.0, trav);
    });
    // corners: rusticated quoins on front and back corners
    b.sym((s) => {
      quoins(b, s * W / 2, zf, s, 1, 0.7, H, trav, 1.3);
      quoins(b, s * W / 2, -zf, s, -1, 0.7, H, trav, 1.8);
    });

    // ---- the sides and back: plainer frames
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, 0], () => {
        for (const x of [-6.5, -2.2, 2.2, 6.5]) {
          win(b, x, 2.0, 0.95, 1.6, trav, { border: 0.16 });
          b.box(1.4, 0.14, 0.26, trav, { at: [x, 1.72, 0.13] });
          win(b, x, G + 1.0, 1.0, 2.5, trav, { border: 0.18 });
          b.box(1.6, 0.2, 0.28, trav, { at: [x, G + 3.7, 0.14] });
          win(b, x, G + F1 + 0.9, 0.95, 2.0, trav, { border: 0.16 });
        }
      });
    }
    onFace(b, '-z', [0, 0, -zf], () => {
      for (const x of [-7.5, -5, 5, 7.5]) {
        win(b, x, 2.0, 0.95, 1.6, trav, { border: 0.16 });
        win(b, x, G + 1.0, 1.0, 2.5, trav, { border: 0.18 });
        b.box(1.6, 0.2, 0.28, trav, { at: [x, G + 3.7, 0.14] });
        win(b, x, G + F1 + 0.9, 0.95, 2.0, trav, { border: 0.16 });
      }
      // the garden loggia: three tall arches on the main floor
      b.archWall(7.4, F1 - 0.3, 0.4, trav, { at: [0, G + 0.3, 0.2], openings: 3, openW: 1.8, openH: 4.4, shape: 'round' });
      b.panel(7.0, 4.4, tint(P.windowDark, 0.12), { at: [0, G + 0.3, -0.02], depth: 0.02 });
      for (const x of [-2.45, 0, 2.45]) b.box(1.8, 1.0, 0.12, trav, { at: [x, G + 0.3, 0.3] });
      b.panel(1.6, 2.8, P.oakDark, { at: [0, 0.7, 0], shape: 'round', depth: 0.08 });
    });

    // ---- Michelangelo's cornice, with lilies in the frieze
    const cp = 1.25;
    const ch = 1.5;
    b.box(W + 0.1, 0.9, D + 0.1, tint(wall, 0.03), { at: [0, H - 0.9, 0] });
    moulding(b, W, D, H, corniceProfile(cp, ch), trav);
    onFace(b, '+z', [0, 0, zf], () => {
      brackets(b, -W / 2 + 0.4, W / 2 - 0.4, H + ch * 0.46, 1.1, cp * 0.82, 0.5, 0.2, trav);
      for (let i = 0; i < 9; i++) {
        const x = -8.8 + i * 2.2;
        b.box(0.18, 0.4, 0.06, trav, { at: [x, H - 0.75, 0.03] });
        b.box(0.44, 0.12, 0.06, trav, { at: [x, H - 0.55, 0.03] });
      }
    });
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, 0], () => brackets(b, -D / 2 + 0.4, D / 2 - 0.4, H + ch * 0.46, 2.1, cp * 0.82, 0.5, 0.2, trav));
    }
    const ry = H + ch - 0.3;
    courtRoof(b, W, D, R, 1.4, roof, { at: [0, ry, 0], ov: 0.3, ovIn: 0.6 });
    courtRoofRibs(b, W, D, R, 1.4, tint(roof, -0.06), [0, ry, 0], 0.3, 1.1);
    b.sym((s) => b.chimney(0.7, 1.6, 0.7, wall, { at: [s * 5.5, ry + 0.7, -zf + 2.2] }));

    // ---- the courtyard: the orders stacked as on the Colosseum
    b.box(2 * ci + 2 * walk, 0.05, 2 * cz + 2 * walk, P.paving, { at: [0, 0, 0] });
    const side = (len: number, n: number, at: [number, number, number], facing: '+z' | '-z' | '+x' | '-x') => {
      const pitch = len / n;
      b.archWall(len, G, 0.6, plasterCourt, { at, facing, openings: n, openW: pitch - 0.9, openH: 4.3, shape: 'round' });
      onFace(b, facing, at, () => {
        for (let i = 0; i <= n; i++) {
          const x = -len / 2 + i * pitch;
          // Doric half-columns on the piers below, Ionic above, Corinthian pilasters at the top
          col(b, x, 0.3, 0.24, G - 0.6, trav, { cap: 'tuscan', segs: 6 });
          b.box(0.42, F1 - 0.5, 0.14, trav, { at: [x, G + 0.15, 0.07] });
          b.box(0.62, 0.24, 0.22, trav, { at: [x, G + F1 - 0.6, 0.11] });
          b.box(0.38, F2 - 0.5, 0.1, trav, { at: [x, G + F1 + 0.15, 0.05] });
          b.box(0.56, 0.3, 0.18, trav, { at: [x, G + F1 + F2 - 0.65, 0.09] });
        }
        b.box(len, 0.5, 0.3, trav, { at: [0, G - 0.6, 0.15] });
        b.box(len, 0.45, 0.25, trav, { at: [0, G + F1 - 0.35, 0.13] });
        for (let i = 0; i < n; i++) {
          const x = -len / 2 + (i + 0.5) * pitch;
          // the main-floor arches, filled in with windows
          win(b, x, G + 1.0, 1.0, 2.2, trav, { border: 0.14, z: 0.04 });
          pediment(b, x, G + 3.36, 1.4, 0.4, 'tri', trav, 0.22, 0.04);
          b.panel(0.9, 1.8, P.windowDark, { at: [x, G + F1 + 1.0, 0], depth: 0.05 });
        }
      });
    };
    side(2 * ci + 0.6, 3, [0, 0, cz + 0.3], '-z');
    side(2 * ci + 0.6, 3, [0, 0, -cz - 0.3], '+z');
    side(2 * cz + 0.6, 3, [ci + 0.3, 0, 0], '-x');
    side(2 * cz + 0.6, 3, [-ci - 0.3, 0, 0], '+x');
    b.cyl(0.8, 0.7, trav, { at: [0, 0, 0], segs: 8 });
    b.cyl(0.65, 0.72, P.water, { at: [0, 0, 0], segs: 8, mat: 'glass' });
  },
};
