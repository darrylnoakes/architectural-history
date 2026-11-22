import { P, mix, tint, type BuildingDef, type Builder, type Facing, type Vec3 } from '@ah/kit';
import { SLATE, archPts, flat, pol, rectPts, soup, wallSeg, win, type Pt } from './shared';
import { moat } from './05-renaissance-chateau';

const ASHLAR = mix(P.pierreBlonde, P.craie, 0.4);
const TRIM = tint(ASHLAR, 0.05);
const BRICK = P.briqueNord;
const H = 12;
const ISLE = { x0: -16.5, x1: 16.5, z0: -8.5, z1: 11 };
const MOAT = 3;
const MAIN = { x0: -10, x1: 10, z0: -2, z1: 8 };
const PAV = { w: 4.6, z0: -3.5, z1: 9.5 };
const ROT = { z: -2, r: 4.6 };

/** Tall windows in two storeys on a wall face, at positions us along it. */
function windows(b: Builder, us: number[], fixed: number, f: Facing, along: 'x' | 'z', ground = true) {
  for (const u of us) {
    const at = (y: number): Vec3 => (along === 'x' ? [u, y, fixed] : [fixed, y, u]);
    if (ground) win(b, 'rect', 1.4, 3.6, at(0.9), f, { frame: TRIM, bd: 0.15, mullion: true, transom: 0.72 });
    win(b, 'rect', 1.4, 3.1, at(6.7), f, { frame: TRIM, bd: 0.15, mullion: true, transom: 0.7 });
  }
}

/** An iron railing: thin bars between two plan points, on a low stone plinth. */
function railing(b: Builder, p: Pt, q: Pt, h: number) {
  wallSeg(b, p, q, 0, 0.5, 0.45, TRIM);
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const n = Math.round(L / 0.35);
  const out: number[] = [];
  const ux = (q[0] - p[0]) / L;
  const uz = (q[1] - p[1]) / L;
  for (let i = 0; i <= n; i++) {
    const x = p[0] + (q[0] - p[0]) * (i / n);
    const z = p[1] + (q[1] - p[1]) * (i / n);
    const a = [x - ux * 0.03, 0.5, z - uz * 0.03];
    const c = [x + ux * 0.03, 0.5 + h, z + uz * 0.03];
    out.push(...a, x + ux * 0.03, 0.5, z + uz * 0.03, ...c, ...a, ...c, x - ux * 0.03, 0.5 + h, z - uz * 0.03);
  }
  soup(b, out, P.castIron);
  wallSeg(b, p, q, 0.5 + h - 0.08, 0.08, 0.08, P.castIron, 0);
}

/** A clipped yew: a cone of dark green. */
function yew(b: Builder, x: number, z: number, h = 2.4) {
  b.cone(0.6, h, P.leafDark, { at: [x, 0, z], segs: 6 });
}

/** A scroll of box hedge in the broderie: an arc of short hedge pieces. */
function scroll(b: Builder, cx: number, cz: number, r: number, a0: number, a1: number, n = 6) {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push(pol(cx, cz, r, a0 + ((a1 - a0) * i) / n));
  for (let i = 0; i < n; i++) wallSeg(b, pts[i], pts[i + 1], 0, 0.32, 0.3, P.hedge, 0.12);
}

function build(b: Builder) {
  // ---------------------------------------------------------------- the moated platform
  b.box(ISLE.x1 - ISLE.x0, 0.03, ISLE.z1 - ISLE.z0, mix(P.gravel, P.sand, 0.4), { at: [0, 0, (ISLE.z0 + ISLE.z1) / 2], jitter: false });
  moat(b, ISLE, MOAT, [-2.4, 2.4], TRIM, [-2, 2]);

  // ---------------------------------------------------------------- the main block and pavilions
  const mw = MAIN.x1 - MAIN.x0;
  const md = MAIN.z1 - MAIN.z0;
  const mz = (MAIN.z0 + MAIN.z1) / 2;
  b.box(mw + 0.6, 0.9, md + 0.6, tint(ASHLAR, -0.05), { at: [0, 0, mz] });
  b.box(mw, H, md, ASHLAR, { at: [0, 0, mz] });
  b.box(mw + 0.2, 0.3, md + 0.2, TRIM, { at: [0, 5.8, mz], jitter: false });
  b.box(mw + 0.5, 0.6, md + 0.5, TRIM, { at: [0, H - 0.6, mz], jitter: false });
  b.hip(mw + 0.5, md + 0.5, 5.4, SLATE, { at: [0, H, mz] });
  b.collider(mw, md, { at: [0, 0, mz] });
  const pz = (PAV.z0 + PAV.z1) / 2;
  const pd = PAV.z1 - PAV.z0;
  b.sym((s) => {
    const px = s * (MAIN.x1 + PAV.w / 2);
    b.box(PAV.w + 0.6, 0.9, pd + 0.6, tint(ASHLAR, -0.05), { at: [px, 0, pz] });
    b.box(PAV.w, H + 0.6, pd, ASHLAR, { at: [px, 0, pz] });
    b.box(PAV.w + 0.2, 0.3, pd + 0.2, TRIM, { at: [px, 5.8, pz], jitter: false });
    b.box(PAV.w + 0.5, 0.6, pd + 0.5, TRIM, { at: [px, H, pz], jitter: false });
    // the tall separate roof of each pavilion, the French way of marking the parts of a house
    b.hip(PAV.w + 0.5, pd + 0.5, 8, SLATE, { at: [px, H + 0.6, pz], ridge: 2.5 });
    // quoins at the corners
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) b.box(0.5, H + 0.6, 0.5, TRIM, { at: [px + dx * (PAV.w / 2 - 0.2), 0, pz + dz * (pd / 2 - 0.2)], jitter: false });
    windows(b, [px], PAV.z1, '+z', 'x');
    windows(b, [px], PAV.z0, '-z', 'x');
    windows(b, [pz - 3.6, pz, pz + 3.6], s * (MAIN.x1 + PAV.w), s > 0 ? '+x' : '-x', 'z');
    b.chimney(0.9, 3.8, 1.8, ASHLAR, { at: [px, H + 5.6, pz - 1.6] });
    b.collider(PAV.w, pd, { at: [px, 0, pz] });
  });
  windows(b, [-8.3, -5.8, 5.8, 8.3], MAIN.z1, '+z', 'x');
  windows(b, [-8.3, -6.2, 6.2, 8.3], MAIN.z0, '-z', 'x');
  // dormers (lucarnes) on the main roof
  for (const x of [-7, 7]) {
    for (const [z, f] of [[MAIN.z1 + 0.1, 0], [MAIN.z0 - 0.1, Math.PI]] as const) {
      b.group({ at: [x, H, z], rotY: f }, () => {
        b.box(1.4, 1.9, 1.5, ASHLAR, { at: [0, 0, -0.5] });
        flat(b, archPts('round', 0.9, 1.5, 2), P.windowDark, [0, 0.15, 0.25], '+z', 0.02);
        b.extrude([[-0.85, 0], [0.85, 0], [0, 0.8]], 0.3, TRIM, { at: [0, 1.9, 0.1] });
        b.gable(1.5, 1.6, 0.8, SLATE, { ridge: 'z', at: [0, 1.9, -0.8], wall: ASHLAR });
      });
    }
  }
  for (const x of [-4.2, 4.2]) b.chimney(0.9, 3.8, 1.8, ASHLAR, { at: [x, H + 3.4, mz] });

  // ---------------------------------------------------------------- the entrance front
  const fz = MAIN.z1;
  b.box(7.4, H, 0.8, ASHLAR, { at: [0, 0, fz + 0.4] });
  for (const dx of [-2.3, 0, 2.3]) flat(b, archPts('round', 1.7, 4.0, 3), P.windowDark, [dx, 0.9, fz + 0.8], '+z', 0.04);
  for (const dx of [-3.5, -1.15, 1.15, 3.5]) {
    b.column(0.3, 5.0, TRIM, { at: [dx, 0.9, fz + 1.15], order: 'doric', segs: 8 });
    b.box(0.6, 5.2, 0.25, TRIM, { at: [dx, 6.1, fz + 0.9], jitter: false });
  }
  b.box(7.8, 0.4, 1.4, TRIM, { at: [0, 5.85, fz + 0.9], jitter: false });
  for (const dx of [-2.3, 0, 2.3]) win(b, 'round', 1.3, 3.4, [dx, 6.8, fz + 0.8], '+z', { frame: TRIM, bd: 0.12, transom: 0.7 });
  b.extrude([[-4.0, 0], [4.0, 0], [0, 2.4]], 1.0, TRIM, { at: [0, H, fz + 0.5] });
  flat(b, [[-3.1, 0.3], [3.1, 0.3], [0, 1.85]], tint(ASHLAR, -0.05), [0, H, fz + 1.0], '+z', 0.02);
  b.stairs(9, 0.9, 2.4, 4, TRIM, { at: [0, 0, fz + 2.1] });
  b.collider(7.4, 1.6, { at: [0, 0, fz + 0.8] });

  // ---------------------------------------------------------------- the oval salon and its dome, on the garden side
  const back = { start: Math.PI / 2, sweep: Math.PI, segs: 12 };
  b.lathe([[ROT.r + 0.3, 0], [ROT.r + 0.3, 0.9], [ROT.r, 0.9], [ROT.r, H]], ASHLAR, { ...back, at: [0, 0, ROT.z] });
  b.lathe([[ROT.r + 0.25, H - 0.6], [ROT.r + 0.25, H], [ROT.r - 0.2, H]], TRIM, { ...back, at: [0, 0, ROT.z], jitter: false });
  for (let k = 0; k <= 6; k++) {
    const t = Math.PI / 2 + (k * Math.PI) / 6;
    const [px, pz] = pol(0, ROT.z, ROT.r + 0.05, t);
    b.box(0.5, H - 1.5, 0.2, TRIM, { at: [px, 0.9, pz], rotY: t, jitter: false });
    if (k < 6) {
      const tm = t + Math.PI / 12;
      const [wx, wz] = pol(0, ROT.z, ROT.r * 0.99, tm);
      win(b, 'round', 1.3, 4.2, [wx, 0.9, wz], tm, { frame: TRIM, bd: 0.12, transom: 0.75 });
      win(b, 'rect', 1.1, 2.0, [wx, 7.4, wz], tm, { frame: TRIM, bd: 0.12 });
    }
  }
  // the dome: slate on a timber frame, with lead ribs and a lantern
  const dome: [number, number][] = [[ROT.r + 0.1, 0], [ROT.r + 0.1, 1.6], [ROT.r, 2.4], [4.1, 4.4], [3.3, 6.1], [2.2, 7.4], [1.0, 8.2], [0.01, 8.4]];
  const dy = H + 0.3;
  b.lathe(dome, SLATE, { at: [0, dy, ROT.z], segs: 16 });
  b.cyl(ROT.r + 0.3, 0.4, TRIM, { at: [0, H, ROT.z], segs: 16, jitter: false });
  for (let k = 0; k < 8; k++) {
    const t = (k * Math.PI) / 4;
    for (let i = 1; i < dome.length - 2; i++) {
      const [r0, y0] = dome[i];
      const [r1, y1] = dome[i + 1];
      b.beam([Math.sin(t) * (r0 + 0.05), dy + y0, ROT.z + Math.cos(t) * (r0 + 0.05)], [Math.sin(t) * (r1 + 0.05), dy + y1, ROT.z + Math.cos(t) * (r1 + 0.05)], 0.22, 0.12, P.lead, { jitter: false });
    }
    const [ox, oz] = pol(0, ROT.z, ROT.r + 0.1, t + Math.PI / 8);
    win(b, 'round', 0.7, 1.0, [ox, dy + 0.3, oz], t + Math.PI / 8, { frame: TRIM, bd: 0.12 });
  }
  b.cyl(1.0, 2.2, TRIM, { at: [0, dy + 8.1, ROT.z], segs: 8 });
  b.cone(1.2, 1.2, P.lead, { at: [0, dy + 10.3, ROT.z], segs: 8 });
  b.sphere(0.25, P.gold, { at: [0, dy + 11.7, ROT.z], segs: 6 });
  b.collider(ROT.r * 2, ROT.r, { at: [0, 0, ROT.z - ROT.r / 2] });
  b.stairs(6, 0.9, 2.0, 4, TRIM, { at: [0, 0, ROT.z - ROT.r - 1.2], rotY: Math.PI });

  // ---------------------------------------------------------------- bridges, forecourt, gate, outbuildings
  b.box(4.6, 0.4, MOAT + 0.8, TRIM, { at: [0, -0.15, ISLE.z1 + MOAT / 2] });
  b.box(4.0, 0.4, MOAT + 0.8, TRIM, { at: [0, -0.15, ISLE.z0 - MOAT / 2] });
  b.box(30, 0.03, 9.6, mix(P.gravel, P.sand, 0.5), { at: [0, 0, 18.9], jitter: false });
  railing(b, [-14.5, 23.4], [-2, 23.4], 1.6);
  railing(b, [2, 23.4], [14.5, 23.4], 1.6);
  b.sym((s) => {
    b.box(1.1, 3.6, 1.1, TRIM, { at: [s * 2.1, 0, 23.4] });
    b.box(1.3, 0.3, 1.3, TRIM, { at: [s * 2.1, 3.6, 23.4] });
    b.cyl(0.25, 0.8, TRIM, { at: [s * 2.1, 3.9, 23.4], segs: 6, rTop: 0.4 });
    b.collider(1.1, 1.1, { at: [s * 2.1, 0, 23.4] });
    b.collider(12.5, 0.5, { at: [s * 8.25, 0, 23.4] });
    // brick-and-stone outbuildings (the communs) flanking the forecourt
    const cx = s * 18.2;
    b.box(6, 7.5, 8, BRICK, { at: [cx, 0, 18.6] });
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) b.box(0.55, 7.5, 0.55, TRIM, { at: [cx + dx * 2.8, 0, 18.6 + dz * 3.8], jitter: false });
    b.box(6.2, 0.3, 8.2, TRIM, { at: [cx, 3.6, 18.6], jitter: false });
    b.box(6.3, 0.4, 8.3, TRIM, { at: [cx, 7.3, 18.6], jitter: false });
    b.hip(6.4, 8.4, 4.2, SLATE, { at: [cx, 7.7, 18.6] });
    const f: Facing = s > 0 ? '-x' : '+x';
    for (const z of [15.8, 18.6, 21.4]) {
      if (z !== 18.6) win(b, 'rect', 1.1, 2.2, [cx - s * 3, 1.0, z], f, { frame: TRIM, bd: 0.14 });
      win(b, 'rect', 1.1, 2.0, [cx - s * 3, 4.5, z], f, { frame: TRIM, bd: 0.14 });
    }
    for (const x of [cx - 1.4, cx + 1.4]) {
      win(b, 'rect', 1.1, 2.0, [x, 4.5, 22.6], '+z', { frame: TRIM, bd: 0.14 });
      win(b, 'rect', 1.1, 2.0, [x, 4.5, 14.6], '-z', { frame: TRIM, bd: 0.14 });
    }
    for (const z of [16.2, 21]) win(b, 'rect', 1.1, 2.0, [cx + s * 3, 4.5, z], s > 0 ? '+x' : '-x', { frame: TRIM, bd: 0.14 });
    win(b, 'rect', 1.6, 2.6, [cx - s * 3, 0, 18.6], f, { frame: TRIM, glass: P.doorGreen, bd: 0.14 });
    b.collider(6, 8, { at: [cx, 0, 18.6] });
  });

  // ---------------------------------------------------------------- the garden: parterres, yews, basin, canal
  const gz0 = ISLE.z0 - MOAT - 0.5;
  b.box(42, 0.03, 9, mix(P.gravel, P.sand, 0.45), { at: [0, 0, gz0 - 4.5], jitter: false });
  const red = mix(P.brickRed, P.sand, 0.35);
  b.sym((s) => {
    const cx = s * 8.5;
    const cz = gz0 - 3.0;
    b.box(11, 0.05, 5, red, { at: [cx, 0, cz], jitter: false });
    for (const [w, d, dx, dz] of [[11, 0.3, 0, 2.5], [11, 0.3, 0, -2.5], [0.3, 5, 5.5, 0], [0.3, 5, -5.5, 0]] as const) {
      b.box(w, 0.32, d, P.hedge, { at: [cx + dx, 0, cz + dz], jitter: false });
    }
    // embroidery of box: mirrored scrolls round a central palmette
    for (const m of [-1, 1]) {
      scroll(b, cx + m * 2.6, cz, 1.5, m > 0 ? -Math.PI * 0.2 : Math.PI * 0.2, m > 0 ? Math.PI * 1.2 : -Math.PI * 1.2);
      scroll(b, cx + m * 4.1, cz + 1.2, 0.65, 0, m * Math.PI * 1.5, 4);
      scroll(b, cx + m * 4.1, cz - 1.2, 0.65, Math.PI, Math.PI + m * Math.PI * 1.5, 4);
    }
    b.box(0.3, 0.32, 3.2, P.hedge, { at: [cx, 0, cz], jitter: false });
    // clipped yews along the borders
    for (const x of [-5.5, -1.8, 1.8, 5.5]) {
      yew(b, cx + x, cz + 3.1);
      yew(b, cx + x, cz - 3.1, 2.1);
    }
    // groves (bosquets) of clipped trees at the sides
    b.box(3.6, 3.4, 7, P.hedge, { at: [s * 19.2, 0, gz0 - 4] });
    for (const z of [gz0 - 1.5, gz0 - 4, gz0 - 6.5]) b.blob(1.7, P.leafDark, { at: [s * 19.2, 4.2, z], stretch: [1, 0.8, 1], detail: 0 });
    b.collider(3.6, 7, { at: [s * 19.2, 0, gz0 - 4] });
  });
  // the round basin with its jet on the axis
  const bz = gz0 - 7.2;
  b.cyl(1.9, 0.45, TRIM, { at: [0, 0, bz], segs: 16 });
  b.cyl(1.65, 0.05, P.water, { at: [0, 0.42, bz], segs: 16, mat: 'glass' });
  b.cyl(0.1, 3.2, mix(P.white, P.water, 0.3), { at: [0, 0.45, bz], segs: 6, rTop: 0.03, mat: 'glass' });
  b.collider(3.8, 3.8, { at: [0, 0, bz] });
  // the canal across the bottom of the garden, as at Vaux
  const cz0 = -21.2;
  const cz1 = -23.55;
  b.box(43.6, 0.06, cz0 - cz1, mix(P.water, P.glassGreen, 0.2), { at: [0, 0, (cz0 + cz1) / 2], mat: 'glass', jitter: false });
  b.box(43.6, 0.3, 0.35, TRIM, { at: [0, 0, cz1 - 0.17], jitter: false });
  b.box(43.6, 0.3, 0.35, TRIM, { at: [0, 0, cz0 + 0.17], jitter: false });
  b.collider(43.6, cz0 - cz1, { at: [0, 0, (cz0 + cz1) / 2] });
}

export const classicalChateau: BuildingDef = {
  id: 'classical-chateau',
  name: 'Classical château',
  style: 'French classical (Louis XIV)',
  date: 'c. 1660',
  summary:
    'A minister of finance builds the house that sets the pattern for Louis XIV. It stands on a moated platform between a forecourt and a garden, all laid out on one axis: a main block of fine ashlar, end pavilions each under its own tall slate roof, and in the middle an oval salon that swells into the garden under a dome. ' +
    'Behind it the garden is architecture too: parterres of clipped box embroidered on red and gravel ground, ranks of yews cut into cones, a basin with a fountain and, across the far end, a canal. ' +
    'Service buildings of brick with stone dressings flank the forecourt. The castle is gone: the defences are now a moat and railings, and the power on show is wealth and taste.',
  materials: ['limestone ashlar', 'slate and lead', 'brick and stone (the outbuildings)', 'box, yew and gravel', 'water'],
  lookFor: [
    { label: 'Dome', note: 'A slate dome with lead ribs and a lantern over the oval salon, the centre of the house and of the garden axis.', at: [0, H + 6, ROT.z - 3.4] },
    { label: 'Pavilions', note: 'The ends of the house stand forward under their own tall roofs, so the front reads as separate blocks.', at: [MAIN.x1 + PAV.w / 2, 15, PAV.z1 + 0.6] },
    { label: 'Forecourt', note: 'The cour d’honneur, a gravelled court between the outbuildings, closed by railings and a gate on the axis.', at: [0, 1.2, 18] },
    { label: 'Parterre de broderie', note: 'Low box hedges clipped into scrolls like embroidery, on red brick dust and gravel, to be seen from the windows above.', at: [8.5, 0.8, ISLE.z0 - MOAT - 3.5] },
    { label: 'Canal', note: 'A long sheet of water across the end of the garden, as at Vaux, where it lies at right angles to the axis.', at: [-12, 0.5, -22.5] },
  ],
  modelledOn:
    'Vaux-le-Vicomte, built for Nicolas Fouquet by Louis Le Vau (house), André Le Nôtre (garden) and Charles Le Brun (decoration), 1656 to 1661, much reduced: the moated platform, pavilions with separate roofs, domed oval salon, brick-and-stone outbuildings, parterres and transverse canal are taken from it; the entrance frontispiece is simplified.',
  influences: ['versailles-export', 'roman-baroque'],
  build,
};
