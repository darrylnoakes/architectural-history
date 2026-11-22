import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { HALL, ZC, arcade, civicCentre, flatArch, pave, pilaster, rectCollider, square, statue, win } from './shared';

/** The intendance: an arcade storey g, the main floor f1 and the attic floor f2; arcade walk zin..z1. */
export const INT = { x0: 1.5, x1: 21.5, z0: -12, z1: 4, zin: 0.9, g: 5.0, f1: 4.6, f2: 3.6 };
const TOP = INT.g + INT.f1 + INT.f2;
const XC = (INT.x0 + INT.x1) / 2;
const BAYS = spread(5, INT.x0 + 2, INT.x1 - 2);
/** The statue of the king in the middle of the new square. */
export const KING = { x: XC, z: 14.5 };

const stone = mix(P.pierreBlonde, P.craie, 0.3);
const dark = tint(stone, -0.08);
const slate = P.ardoise;

/** A wrought-iron balcony rail (balconnet) under a main-floor window. */
function balconnet(b: Builder, x: number, y: number, z: number, w: number): void {
  b.box(w + 0.3, 0.12, 0.5, dark, { at: [x, y - 0.12, z + 0.25], jitter: false });
  b.box(w + 0.3, 0.06, 0.06, P.castIron, { at: [x, y + 0.9, z + 0.47], jitter: false });
  // the scrolled ironwork as one dark grille
  b.box(w + 0.2, 0.75, 0.03, mix(P.castIron, P.windowDark, 0.3), { at: [x, y + 0.12, z + 0.47], jitter: false });
}

/** A balustrade from x0 to x1 at height y on the face z (facing +Z or -Z), with or without balusters. */
function balustrade(b: Builder, x0: number, x1: number, y: number, z: number, full: boolean): void {
  const w = x1 - x0;
  const xc = (x0 + x1) / 2;
  b.box(w, 0.2, 0.5, stone, { at: [xc, y, z], jitter: false });
  b.box(w, 0.18, 0.55, stone, { at: [xc, y + 0.92, z], jitter: false });
  if (full) for (const x of spread(Math.round(w / 0.6), x0 + 0.2, x1 - 0.2)) b.cyl(0.11, 0.72, stone, { at: [x, y + 0.2, z], segs: 4, rTop: 0.07, jitter: false });
  else b.box(w, 0.72, 0.25, tint(stone, -0.04), { at: [xc, y + 0.2, z], jitter: false });
}

/** A stone urn (pot à feu) on a pedestal of the balustrade. */
function urn(b: Builder, x: number, y: number, z: number): void {
  b.box(0.6, 1.1, 0.6, stone, { at: [x, y, z], jitter: false });
  b.lathe([[0.1, 0], [0.3, 0.15], [0.32, 0.5], [0.15, 0.75], [0.05, 1.0]], stone, { at: [x, y + 1.1, z], segs: 6 });
}

/**
 * The intendant's residence: an arcade of round arches on rusticated piers, two storeys bound by giant
 * Corinthian pilasters, a pediment over the three middle bays carrying the royal arms, and a balustrade
 * with urns hiding a low slate roof. Finished on all four sides.
 */
export function intendance(b: Builder): void {
  const { x0, x1, z0, z1, zin, g, f1 } = INT;
  const W = x1 - x0;
  const D = z1 - z0;
  const zc = (z0 + z1) / 2;
  // closed ground floor behind the arcade, the upper floors over the full depth
  b.box(W, g, zin - z0, stone, { at: [XC, 0, (z0 + zin) / 2] });
  b.box(W, TOP - g, D, stone, { at: [XC, g, zc] });
  b.box(W - 0.4, 0.4, z1 - zin, dark, { at: [XC, g - 0.4, (zin + z1) / 2], jitter: false });
  pave(b, x0 + 0.3, x1 - 0.3, zin, z1, mix(P.paving, stone, 0.5), 0, 0.08);
  // the arcade, its piers rusticated with channelled joints
  arcade(b, W, g, 0.7, stone, { at: [XC, 0, z1 - 0.35], openings: 5, openW: 2.7, openH: 4.2, shape: 'round', n: 3 });
  for (let i = 0; i <= 5; i++) {
    const px = x0 + i * 4 + (i === 0 ? 0.32 : i === 5 ? -0.32 : 0);
    const pw = i === 0 || i === 5 ? 0.66 : 1.3;
    for (const y of [1.0, 2.0, 3.0]) b.box(pw + 0.02, 0.07, 0.72, dark, { at: [px, y, z1 - 0.35], jitter: false });
  }
  for (const x of BAYS) b.box(0.5, 0.7, 0.2, dark, { at: [x, g - 0.85, z1 + 0.05], jitter: false }); // keystones
  for (const s of [-1, 1]) arcade(b, z1 - zin, g, 0.5, stone, { at: [s > 0 ? x1 - 0.25 : x0 + 0.25, 0, (zin + z1) / 2], facing: s > 0 ? '+x' : '-x', openings: 1, openW: 2.0, openH: 3.8, shape: 'round', n: 3 });
  // doors and shop windows inside the arcade, the main door in the middle
  BAYS.forEach((x, i) => {
    if (i === 2) flatArch(b, 2.2, 3.8, P.doorGreen, { at: [x, 0, zin], shape: 'segmental', off: 0.05 });
    else win(b, 1.8, 3.2, { at: [x, 0.3, zin], shape: 'segmental', frame: dark, mullion: true });
  });
  // the band over the arcade, and the upper floors' front, the middle three bays brought forward
  b.box(W + 0.3, 0.45, D + 0.3, dark, { at: [XC, g, zc], jitter: false });
  const ac0 = BAYS[1] - 2;
  const ac1 = BAYS[3] + 2;
  b.box(ac1 - ac0, TOP - g - 0.45, 0.4, stone, { at: [(ac0 + ac1) / 2, g + 0.45, z1 + 0.2] });
  // giant pilasters: two storeys tall, at the bay divisions and the corners
  const PIL = [x0 + 0.35, ac0 + 0.35, BAYS[1] + 2, BAYS[2] + 2, ac1 - 0.35, x1 - 0.35];
  PIL.forEach((x) => {
    const fz = x > ac0 && x < ac1 ? z1 + 0.4 : z1;
    pilaster(b, [x, g + 0.45, fz], '+z', 0.7, TOP - g - 0.45, stone, 0.18);
  });
  for (const s of [-1, 1]) for (const z of [z0 + 0.35, z1 - 0.35]) pilaster(b, [s > 0 ? x1 : x0, g + 0.45, z], s > 0 ? '+x' : '-x', 0.7, TOP - g - 0.45, stone, 0.18);
  for (const x of [x0 + 0.35, x1 - 0.35]) pilaster(b, [x, g + 0.45, z0], '-z', 0.7, TOP - g - 0.45, stone, 0.18);
  // windows: tall on the main floor with iron balconies and carved heads, smaller above
  BAYS.forEach((x, i) => {
    const fz = i >= 1 && i <= 3 ? z1 + 0.4 : z1;
    win(b, 1.5, 3.2, { at: [x, g + 0.85, fz], shape: 'segmental', frame: dark, mullion: true, transom: 2.3 });
    b.box(0.4, 0.5, 0.18, dark, { at: [x, g + 3.9, fz + 0.05], jitter: false });
    balconnet(b, x, g + 0.85, fz, 1.5);
    win(b, 1.3, 2.2, { at: [x, g + f1 + 0.6, fz], shape: 'rect', frame: dark, mullion: true });
  });
  // sides and back: the same windows without balconies, and a plain ground floor
  for (const s of [-1, 1]) {
    const ex = s > 0 ? x1 : x0;
    const f = s > 0 ? '+x' : '-x';
    for (const z of spread(4, z0 + 2.2, z1 - 2.2)) {
      win(b, 1.5, 3.2, { at: [ex, g + 0.85, z], facing: f, shape: 'segmental', frame: dark });
      win(b, 1.3, 2.2, { at: [ex, g + f1 + 0.6, z], facing: f, frame: dark });
      if (z < zin - 1.5) win(b, 1.4, 2.6, { at: [ex, 1.0, z], facing: f, shape: 'segmental', frame: dark });
    }
  }
  BAYS.forEach((x, i) => {
    win(b, 1.5, 3.2, { at: [x, g + 0.85, z0], facing: '-z', shape: 'segmental', frame: dark });
    win(b, 1.3, 2.2, { at: [x, g + f1 + 0.6, z0], facing: '-z', frame: dark });
    if (i === 2) flatArch(b, 2.6, 4.0, P.doorGreen, { at: [x, 0, z0], facing: '-z', shape: 'segmental', off: 0.05 });
    else win(b, 1.4, 2.6, { at: [x, 1.0, z0], facing: '-z', shape: 'segmental', frame: dark });
  });
  for (const y of [1.0, 2.0, 3.0, 4.0]) b.box(W + 0.04, 0.07, zin - z0 + 0.04, dark, { at: [XC, y, (z0 + zin) / 2], jitter: false });
  // the entablature and cornice all round
  b.box(W + 0.5, 0.5, D + 0.5, dark, { at: [XC, TOP - 0.1, zc], jitter: false });
  b.box(W + 0.9, 0.3, D + 0.9, stone, { at: [XC, TOP + 0.4, zc], jitter: false });
  b.box(ac1 - ac0 + 0.6, 0.8, 0.5, stone, { at: [(ac0 + ac1) / 2, TOP - 0.1, z1 + 0.55], jitter: false });
  const by = TOP + 0.7;
  // the pediment with the arms of France: three gold lilies on blue under a crown
  b.extrude([[-(ac1 - ac0) / 2 - 0.3, 0], [(ac1 - ac0) / 2 + 0.3, 0], [0, 2.8]], 0.9, stone, { at: [(ac0 + ac1) / 2, by, z1 + 0.3] });
  b.extrude([[-(ac1 - ac0) / 2 - 0.5, 0], [(ac1 - ac0) / 2 + 0.5, 0], [0, 3.0]], 0.3, dark, { at: [(ac0 + ac1) / 2, by + 0.05, z1 + 0.85], jitter: false });
  b.group({ at: [XC, by + 0.25, z1 + 0.8] }, () => {
    b.extrude([[-0.7, 0.3], [0.7, 0.3], [0.7, 1.6], [-0.7, 1.6]], 0.12, P.doorBlue, { at: [0, 0, 0.12], jitter: false });
    b.extrude([[0, 0], [0.7, 0.3], [-0.7, 0.3]], 0.12, P.doorBlue, { at: [0, 0, 0.12], jitter: false });
    for (const [px, py] of [[-0.35, 1.2], [0.35, 1.2], [0, 0.6]]) b.box(0.22, 0.26, 0.06, P.gold, { at: [px, py, 0.22], jitter: false });
    b.box(1.0, 0.35, 0.12, P.gold, { at: [0, 1.65, 0.12], jitter: false });
  });
  // balustrades with urns over the wings, and along the sides and back
  for (const [a, c] of [[x0 - 0.2, ac0], [ac1, x1 + 0.2]]) balustrade(b, a, c, by, z1 + 0.15, true);
  balustrade(b, x0 - 0.2, x1 + 0.2, by, z0 - 0.15, false);
  for (const s of [-1, 1]) {
    b.group({ at: [s > 0 ? x1 + 0.15 : x0 - 0.15, 0, zc], rotY: Math.PI / 2 }, () => balustrade(b, -D / 2, D / 2, by, 0, false));
  }
  for (const x of [x0 + 0.35, x1 - 0.35, ac0 - 0.1, ac1 + 0.1]) urn(b, x, by, z1 + 0.15);
  for (const x of [x0 + 0.35, x1 - 0.35]) urn(b, x, by, z0 - 0.15);
  // the low slate roof behind the balustrade, with chimneys
  b.hip(W - 1.0, D - 1.0, 3.6, slate, { at: [XC, by, zc] });
  for (const x of [x0 + 4, x1 - 4]) b.chimney(1.4, 2.6, 0.7, stone, { at: [x, by + 1.2, zc] });
  // colliders: the closed block and the arcade piers
  rectCollider(b, x0, x1, z0, zin);
  for (const x of spread(6, x0 + 0.3, x1 - 0.3)) b.collider(1.3, 0.8, { at: [x, 0, z1 - 0.35] });
}

/** The statue of Louis XV in Roman armour on a tall pedestal with two seated virtues, inside a railing. */
export function kingStatue(b: Builder): void {
  const { x, z } = KING;
  const ped = mix(P.marble, P.pierreBlonde, 0.3);
  b.group({ at: [x, 0, z] }, () => {
    b.box(5.4, 0.3, 5.4, tint(ped, -0.06));
    b.box(2.4, 0.6, 3.2, tint(ped, -0.04), { at: [0, 0.3, 0] });
    b.box(1.8, 3.0, 2.6, ped, { at: [0, 0.9, 0] });
    b.box(2.2, 0.35, 3.0, tint(ped, -0.04), { at: [0, 3.9, 0], jitter: false });
    b.box(1.2, 1.0, 0.04, P.bronze, { at: [0, 1.8, 1.31], jitter: false }); // inscription plaque
    statue(b, [0, 4.25, 0], 2.8, P.bronze, { arm: true });
    b.box(0.9, 0.5, 0.5, P.bronze, { at: [0, 6.2, -0.1], jitter: false }); // the cloak over the shoulders
    for (const s of [-1, 1]) {
      // the virtues seated at the foot of the pedestal
      b.box(0.7, 0.6, 0.9, P.bronze, { at: [s * 1.5, 0.3, 0.8], jitter: false });
      statue(b, [s * 1.5, 0.9, 0.7], 1.1, P.bronze);
    }
    // the railing
    for (const [w, d, px, pz] of [[5.0, 0.05, 0, 2.5], [5.0, 0.05, 0, -2.5], [0.05, 5.0, 2.5, 0], [0.05, 5.0, -2.5, 0]]) b.box(w, 0.06, d, P.castIron, { at: [px, 1.2, pz], jitter: false });
    for (const sx of [-2.5, 2.5]) for (const sz of [-2.5, 2.5]) b.box(0.12, 1.4, 0.12, P.castIron, { at: [sx, 0, sz], jitter: false });
  });
  b.collider(5.4, 5.4, { at: [x, 0, z] });
}

export const intendanceDef: BuildingDef = {
  id: 'intendance',
  name: 'The intendance and place royale',
  style: 'Louis XV classicism',
  date: 'c. 1760',
  summary:
    'Since the 1630s the real ruler of the province has been the intendant, a royal official sent from Versailles to oversee justice, police and above all taxes; the mayor and aldermen keep their hall and their ceremonies, but their elections and budgets are now watched by the king. ' +
    'The intendant’s residence sets the tone: cut stone, an arcade on the ground floor, two storeys bound together by giant pilasters, a pediment with the arms of France, and a balustrade with urns hiding the roof. ' +
    'In front of it the town clears a new square for a bronze statue of Louis XV, as Reims and Nancy did in the 1750s; like nearly all of them it was pulled down and melted in 1792.',
  materials: ['limestone ashlar', 'slate', 'wrought iron', 'bronze', 'marble'],
  lookFor: [
    { label: 'Giant pilasters', note: 'Flat pilasters with Corinthian capitals run through two storeys at once, the colossal order that gives the front its grandeur.', at: [BAYS[1] + 2, INT.g + 5.5, INT.z1 + 0.65] },
    { label: 'Pediment with the royal arms', note: 'Over the middle three bays a pediment carries the shield of France, three gold lilies on blue under a crown.', at: [XC, TOP + 2.2, INT.z1 + 1.1] },
    { label: 'Balustrade and urns', note: 'A stone balustrade with urns runs along the top and hides the low slate roof, an Italian touch the French classical style made its own.', at: [INT.x0 + 1.6, TOP + 1.4, INT.z1 + 0.5] },
    { label: 'Arcade', note: 'Round arches on rusticated piers give a covered walk along the square, as on the uniform fronts of the royal squares.', at: [BAYS[0], 2.4, INT.z1 + 0.3] },
    { label: 'Statue of Louis XV', note: 'The king in Roman armour on a tall pedestal with seated virtues, the reason the square was made; it was destroyed in the Revolution.', at: [KING.x + 0.4, 6.4, KING.z + 0.5] },
  ],
  modelledOn:
    'The Place Royale of Reims (Legendre, 1756 to 1760, with Pigalle’s statue of Louis XV, 1765) and the Place Stanislas, Nancy (Héré, 1752 to 1755); the intendance itself is generic, after the residences of the intendants of the 1750s and 1760s such as the intendance of Champagne at Châlons, now the prefecture of the Marne',
  influences: ['versailles-export', 'neoclassicism'],
  build(b) {
    const alone = b.variant > 0;
    if (!alone) {
      square(b, -21.8, 21.8, HALL.z1, 'paving');
      civicCentre(b, 1760);
    } else {
      // on a plot of its own: its square in front and a walk round the other three sides
      square(b, ZC.x0, ZC.x1, INT.z1, 'paving');
      pave(b, ZC.x0, ZC.x1, INT.z0 - 1.5, INT.z1, mix(P.paving, P.gravel, 0.4), -0.01);
    }
    intendance(b);
    kingStatue(b);
    // the square's frame of clipped lime trees and lamps
    for (const x of [ZC.x0 + 1.0, ZC.x1 - 1.0]) b.tree(6, { kind: 'round', at: [x, 0, 19.5] });
  },
};
