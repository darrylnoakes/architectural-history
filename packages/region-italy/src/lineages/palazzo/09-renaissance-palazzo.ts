import { P, tint, type BuildingDef } from '@ah/kit';
import { bifora, block, brackets, col, corniceProfile, courtRoof, courtRoofRibs, moulding, onFace, rustic, voussoirs, win } from './shared';

export const renaissancePalazzo: BuildingDef = {
  id: 'renaissance-palazzo',
  name: 'Renaissance palazzo',
  style: 'Early Renaissance',
  date: 'c. 1460',
  summary:
    'A banking family rebuilds its house as a single cube of stone round a square courtyard, with a symmetrical front of evenly spaced windows. ' +
    'The wall is graded storey by storey, from rough boulder-like blocks at street level to flat, drafted blocks on the main floor and smooth ashlar at the top, and the whole is crowned by a great cornice in the manner of an ancient entablature. ' +
    'The pointed Gothic windows and battlements have gone: round arches, two-light windows and a courtyard arcaded on slender classical columns, as in Brunelleschi’s Foundling Hospital, follow the buildings of ancient Rome as Florentines understood them.',
  materials: ['pietraforte (rusticated and ashlar)', 'pietra serena columns', 'plastered courtyard walls', 'coppi roof tiles', 'wrought iron'],
  modelledOn: 'Palazzo Medici, Florence (Michelozzo, from 1444) and Palazzo Strozzi, Florence (Benedetto da Maiano and Il Cronaca, from 1489)',
  influences: ['renaissance-birth'],
  lookFor: [
    { label: 'Graded rustication', note: 'Rough, bulging blocks (bugnato rustico) on the ground floor, flat drafted blocks on the main floor, smooth ashlar on the top floor: the wall grows lighter as it rises.', at: [-8.5, 3.0, 12.5] },
    { label: 'Round-arched two-light windows', note: 'Each window is a round arch of long radiating stones, divided by a colonnette into two round-headed lights, often with a roundel above.', at: [3, 8.4, 12.4] },
    { label: 'Crowning cornice (cornicione)', note: 'A huge cornice on brackets, sized to the whole height of the building as if the palace were one classical column.', at: [-6, 17.2, 13.6] },
    { label: 'Arcaded courtyard (cortile)', note: 'Round arches springing straight from the capitals of classical columns, with the upper floors resting on them.', at: [-5.0, 3.5, 0] },
    { label: 'Street bench (panca di via)', note: 'A stone bench along the foot of the wall where clients and dependants waited to be received.', at: [6.5, 0.6, 12.5] },
  ],
  build(b) {
    const stone = b.pick([P.pietraForte, tint(P.pietraForte, 0.03), tint(P.pietraForte, -0.03)]);
    const rough = tint(stone, -0.03);
    const smooth = tint(stone, 0.04);
    const serena = P.pietraSerena;
    const plasterCourt = b.pick([P.intonacoCream, P.plaster, P.limewash]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const wood = b.pick([P.oakDark, P.doorGreen]);
    const W = 20;
    const D = 22;
    const zf = D / 2;
    const G = 6.0;
    const F1 = 5.4;
    const F2 = 4.8;
    const H = G + F1 + F2; // 16.2
    const R = 6; // depth of each range
    const ci = W / 2 - R; // 4: half-width of the court
    const cz = zf - R; // 5: half-depth of the court
    const walk = 2.2; // the arcade walk round the court

    // ---- the four ranges: ground floor set back behind the court arcade, upper floors full depth
    const gD = R - walk;
    b.sym((s) => block(b, W / 2 - 1.3, G, gD, rough, s * (1.3 + (W / 2 - 1.3) / 2), zf - gD / 2));
    block(b, W, G, gD, stone, 0, -zf + gD / 2);
    b.sym((s) => block(b, gD, G, 2 * cz + 2 * walk, stone, s * (W / 2 - gD / 2), 0));
    b.box(W, F1 + F2, R, smooth, { at: [0, G, zf - R / 2] });
    b.box(W, F1 + F2, R, smooth, { at: [0, G, -zf + R / 2] });
    b.sym((s) => b.box(R, F1 + F2, 2 * cz, smooth, { at: [s * (W / 2 - R / 2), G, 0] }));
    // the entrance passage (androne) through the front range
    b.box(2.6, 0.06, R, P.paving, { at: [0, 0, zf - R / 2] });
    b.archWall(3.0, G, 0.9, rough, { at: [0, 0, zf - 0.45], facing: '+z', openings: 1, openW: 2.6, openH: 4.6, shape: 'round' });
    b.box(2.6, 0.3, R, tint(stone, -0.12), { at: [0, G - 0.3, zf - R / 2] });

    // ---- street front
    const bays = [-8.1, -5.4, -2.7, 0, 2.7, 5.4, 8.1];
    onFace(b, '+z', [0, 0, zf], () => {
      const gwin: [number, number, number, number][] = bays.filter((x) => x !== 0 && Math.abs(x) !== 2.7).map((x) => [x - 0.7, x + 0.7, 3.0, 4.6]);
      rustic(b, -W / 2, W / 2, 0, G, rough, { course: 0.86, len: 2.2, proud: 0.12, rough: 0.14, gap: 0.08, vary: 0.06, skip: [[-1.45, 1.45, 0, 4.6], ...gwin] });
      voussoirs(b, 0, 4.6 - 1.3, 1.3, 1.1, 9, 0.18, rough, { rough: 0.08, vary: 0.05 });
      // small barred windows set high in the ground floor
      for (const x of bays.filter((x) => x !== 0 && Math.abs(x) !== 2.7)) {
        win(b, x, 3.1, 1.1, 1.3, smooth, { border: 0.12, z: 0.1 });
        for (const dx of [-0.3, 0, 0.3]) b.box(0.05, 1.3, 0.05, P.iron, { at: [x + dx, 3.1, 0.24] });
      }
      // main floor: flat drafted blocks with deep joints
      const nob = bays.map((x) => [x - 1.05, x + 1.05, G + 0.4, G + 0.4 + 3.4] as [number, number, number, number]);
      rustic(b, -W / 2, W / 2, G + 0.35, G + F1, stone, { course: 0.84, len: 30, proud: 0.05, gap: 0.09, skip: nob, vary: 0.04 });
      for (const x of bays) {
        bifora(b, x, G + 0.75, 1.5, 2.8, smooth, { shape: 'round', oculus: true, border: 0.14, z: 0.05, recess: false });
        voussoirs(b, x, G + 0.75 + 2.8 - 0.75, 0.9, 0.55, 7, 0.1, stone);
        // top floor, smooth ashlar: the same windows, smaller
        bifora(b, x, G + F1 + 0.7, 1.4, 2.5, smooth, { shape: 'round', oculus: true, border: 0.2, recess: false });
      }
      // moulded string courses that double as sills
      for (const y of [G + 0.35, G + F1 + 0.3]) {
        b.box(W + 0.1, 0.22, 0.26, smooth, { at: [0, y - 0.22, 0.13] });
        b.box(W + 0.1, 0.1, 0.14, smooth, { at: [0, y - 0.32, 0.07] });
      }
      // stone bench along the foot of the wall, broken at the door
      b.sym((s) => b.box(W / 2 - 2.0, 0.5, 0.55, smooth, { at: [s * (2.0 + (W / 2 - 2.0) / 2), 0, 0.42] }));
      // iron lantern holders and tethering rings
      for (const x of [-W / 2 + 0.6, W / 2 - 0.6]) {
        b.box(0.08, 0.08, 0.7, P.iron, { at: [x, 4.6, 0.45] });
        b.cyl(0.16, 0.9, P.iron, { at: [x, 4.2, 0.8], segs: 6, rTop: 0.25 });
        b.cone(0.26, 0.4, P.iron, { at: [x, 5.1, 0.8], segs: 6 });
      }
      for (const x of [-4.5, 4.5]) b.cyl(0.1, 0.05, P.iron, { at: [x, 1.6, 0.25], segs: 6 });
      // the family arms on the corner
      b.panel(1.2, 1.5, smooth, { at: [W / 2 - 1.4, G + F1 - 2.3, 0.08], depth: 0.12, shape: 'round' });
      b.panel(0.8, 1.0, P.intonacoRed, { at: [W / 2 - 1.4, G + F1 - 2.1, 0.16], depth: 0.08 });
    });

    // ---- the long side fronts: the same graded wall, more simply cut
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, 0], () => {
        const xs = [-7.5, -2.5, 2.5, 7.5];
        rustic(b, -D / 2, D / 2, 0, G, rough, { course: 1.5, len: 4.4, proud: 0.12, rough: 0.1, gap: 0.08, skip: xs.map((x) => [x - 0.7, x + 0.7, 3.0, 4.6]) });
        for (const y of [G + 1.6, G + 2.8, G + 4.0]) b.box(D, 0.07, 0.05, tint(stone, -0.12), { at: [0, y, 0.01] });
        for (const x of xs) {
          win(b, x, 3.1, 1.1, 1.3, smooth, { border: 0.12, z: 0.1 });
          bifora(b, x, G + 0.75, 1.5, 2.8, smooth, { shape: 'round', border: 0.22, z: 0.05, recess: false });
          win(b, x, G + F1 + 0.7, 1.2, 2.3, smooth, { shape: 'round', border: 0.22, n: 3 });
        }
        b.box(D + 0.1, 0.22, 0.26, smooth, { at: [0, G + 0.13, 0.13] });
        b.box(D + 0.1, 0.22, 0.26, smooth, { at: [0, G + F1 + 0.08, 0.13] });
      });
    }
    // ---- the back, onto the garden: plainer, smooth stone
    onFace(b, '-z', [0, 0, -zf], () => {
      for (const x of [-7, -2.5, 2.5, 7]) {
        win(b, x, 2.4, 1.2, 1.8, smooth, { border: 0.18 });
        win(b, x, G + 0.8, 1.3, 2.6, smooth, { shape: 'round', border: 0.2 });
        win(b, x, G + F1 + 0.7, 1.2, 2.0, smooth, { border: 0.2 });
      }
      b.panel(1.8, 3.2, wood, { at: [0, 0, 0], shape: 'round', depth: 0.08 });
      b.panel(2.3, 3.5, smooth, { at: [0, 0, 0], shape: 'round', depth: 0.05 });
      b.box(D - 2, 0.22, 0.26, smooth, { at: [0, G + 0.13, 0.13] });
    });

    // ---- the great cornice, on brackets, all round
    const cp = 1.1;
    const ch = 1.2;
    moulding(b, W, D, H, corniceProfile(cp, ch), smooth);
    onFace(b, '+z', [0, 0, zf], () => brackets(b, -W / 2 + 0.4, W / 2 - 0.4, H + ch * 0.46, 1.0, cp * 0.82, 0.5, 0.22, smooth));
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, 0], () => brackets(b, -D / 2 + 0.4, D / 2 - 0.4, H + ch * 0.46, 2.1, cp * 0.82, 0.5, 0.22, smooth));
    }
    // a plain frieze band under it
    b.box(W + 0.16, 0.5, D + 0.16, smooth, { at: [0, H - 0.5, 0] });

    // ---- roofs: a low pitched roof over each range, hidden behind the cornice from the street
    const ry = H + ch - 0.3;
    courtRoof(b, W, D, R, 1.3, roof, { at: [0, ry, 0], ov: 0.3, ovIn: 0.6 });
    courtRoofRibs(b, W, D, R, 1.3, tint(roof, -0.06), [0, ry, 0], 0.3, 1.1);
    b.sym((s) => b.chimney(0.7, 1.8, 0.7, smooth, { at: [s * 6.0, ry + 0.6, -zf + 1.8] }));

    // ---- the courtyard: arcades on Corinthian columns, plastered walls above with windows
    b.box(2 * ci + 2 * walk, 0.05, 2 * cz + 2 * walk, P.paving, { at: [0, 0, 0] });
    b.box(2 * ci - 0.6, 0.07, 2 * cz - 0.6, tint(P.paving, 0.06), { at: [0, 0, 0] });
    const arcade = (len: number, n: number, at: [number, number, number], facing: '+z' | '-z' | '+x' | '-x') => {
      const pitch = len / n;
      b.archWall(len, G, 0.5, serena, { at, facing, openings: n, openW: pitch - 0.42, openH: 4.9, shape: 'round' });
      onFace(b, facing, at, () => {
        // grey stone arch mouldings and the columns that carry them
        for (let i = 0; i <= n; i++) {
          const x = -len / 2 + i * pitch;
          col(b, x, 0.32, 0.19, 4.9 - (pitch - 0.42) / 2, serena, { cap: 'corinthian', segs: 6 });
        }
        b.box(len + 0.3, 0.3, 0.2, serena, { at: [0, G - 0.35, 0.3] });
      });
    };
    arcade(2 * ci + 0.4, 3, [0, 0, cz + 0.25], '-z');
    arcade(2 * ci + 0.4, 3, [0, 0, -cz - 0.25], '+z');
    arcade(2 * cz + 0.4, 4, [ci + 0.25, 0, 0], '-x');
    arcade(2 * cz + 0.4, 4, [-ci - 0.25, 0, 0], '+x');
    // the court walls above the arcade
    const courtFace = (f: '+z' | '-z' | '+x' | '-x', at: [number, number, number], len: number, n: number) => {
      b.group({ at, rotY: f === '+z' ? 0 : f === '-z' ? Math.PI : f === '+x' ? Math.PI / 2 : -Math.PI / 2 }, () => {
        b.box(len, F1 + F2, 0.06, plasterCourt, { at: [0, G, 0.0] });
        for (let i = 0; i < n; i++) {
          const x = -len / 2 + (i + 0.5) * (len / n);
          win(b, x, G + 1.0, 1.2, 2.4, serena, { border: 0.12, z: 0.03 });
          b.box(1.6, 0.12, 0.2, serena, { at: [x, G + 3.55, 0.1] });
          b.panel(0.9, 1.4, P.windowDark, { at: [x, G + F1 + 0.9, 0.03], depth: 0.05 });
        }
        b.box(len, 0.2, 0.15, serena, { at: [0, G + F1 + 0.3, 0.06] });
      });
    };
    courtFace('-z', [0, 0, cz], 2 * ci, 3);
    courtFace('+z', [0, 0, -cz], 2 * ci, 3);
    courtFace('-x', [ci, 0, 0], 2 * cz, 4);
    courtFace('+x', [-ci, 0, 0], 2 * cz, 4);
    // doors in the walk; a garden statue in the court
    for (const x of [-2.7, 2.7]) b.panel(1.4, 2.8, wood, { at: [x, 0, -zf + gD], facing: '+z', shape: 'round', depth: 0.08 });
    b.box(1.0, 1.2, 1.0, P.marble, { at: [0, 0, 0] });
    b.cyl(0.25, 1.7, P.bronze, { at: [0, 1.2, 0], segs: 6, rTop: 0.18 });
    b.sphere(0.18, P.bronze, { at: [0, 3.05, 0], segs: 6 });
  },
};
