import { P, tint, type BuildingDef } from '@ah/kit';
import { archRing, balustrade, balustradeRing, band, col, fenetre, onFace, type Face } from './shared';

export const neoclassicalHotel: BuildingDef = {
  id: 'neoclassical-hotel',
  name: 'Neoclassical hôtel',
  style: 'Louis XVI (Neoclassicism)',
  date: 'c. 1780',
  summary:
    'The plan between court and garden is kept, but the dress is new: taste has turned against the curves of the Rococo towards the plain walls and free-standing columns of ancient Rome. ' +
    'The street gate is a triumphal arch, colonnades of Ionic columns line the court, and the main front has a portico of Corinthian columns. ' +
    'The steep roof has gone: the house is crowned by a flat roof behind a balustrade, and on the garden side a round salon bulges out under a shallow dome, ringed with columns and statues.',
  materials: ['fine limestone', 'lead (flat roofs)', 'zinc', 'plaster'],
  modelledOn: 'The Hôtel de Salm, Paris (Pierre Rousseau, 1782 to 1787, now the Palace of the Legion of Honour): the triumphal-arch gate, the Ionic colonnades round the court, the Corinthian portico and the domed rotunda on the garden front with statues above. Much reduced',
  influences: ['neoclassicism', 'anglomania'],
  lookFor: [
    { label: 'Domed round salon (rotunda)', note: 'A circular room projects into the garden under a low dome, ringed with columns and topped with statues.', at: [0, 9.4, -10.0] },
    { label: 'Flat roof behind a balustrade', note: 'No more tall roof: the walls end in a straight cornice and a balustrade, as on an Italian palace or an ancient temple.', at: [-7.0, 9.4, 1.9] },
    { label: 'Corinthian portico', note: 'Free-standing columns carry a straight entablature in front of the court door, in the manner of a Roman temple.', at: [0, 4.0, 3.4] },
    { label: 'Ionic colonnades', note: 'The court is lined with screens of Ionic columns, with the service rooms hidden behind them.', at: [-7.4, 3.0, 7.0] },
    { label: 'Gate as a triumphal arch', note: 'The street entrance is an ancient Roman triumphal arch in miniature, with columns and a carved attic.', at: [0, 7.2, 11.9] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, P.craie, P.portland]);
    const dress = tint(stone, 0.04);
    const lead = P.lead;
    const door = b.pick([P.voletGris, P.doorGreen, P.oakDark]);
    const W = 20;
    const zC = 2.0; // court face
    const zG = -6.0; // garden face
    const D = zC - zG;
    const mzc = (zC + zG) / 2;
    const Hm = 7.2; // main storey
    const At = 1.5; // attic
    const H = Hm + At;
    const X = 11.4;
    const zS = 11.1;
    const cxIn = 7.4; // the court colonnades
    const wW = X - cxIn - 0.6; // service blocks behind them

    // ---- the main block: one tall storey and an attic, flat roof, balustrade
    b.box(W, H, D, stone, { at: [0, 0, mzc] });
    b.box(W + 0.2, 0.7, D + 0.2, tint(stone, -0.05), { at: [0, 0, mzc] });
    b.box(W + 0.5, 0.5, D + 0.5, dress, { at: [0, Hm - 0.2, mzc] });
    b.box(W + 0.3, 0.35, D + 0.3, dress, { at: [0, H, mzc] });
    b.box(W - 0.6, 0.1, D - 0.6, lead, { at: [0, H + 0.35, mzc] });
    balustradeRing(b, W, D, H + 0.35, dress, { z: mzc, step: 0.8 });
    b.collider(W, D, { at: [0, 0, mzc] });
    for (const x of [-6.5, 6.5]) b.chimney(1.4, 1.6, 0.8, dress, { at: [x, H + 0.35, mzc] });

    const faceWin = (f: Face, z: number, xs: number[], len: number) =>
      onFace(b, f, [0, 0, z], () => {
        for (const x of xs) {
          fenetre(b, x, 0.7, 1.6, 4.4, dress, { cols: 2, rows: 5, sill: false, border: 0.18 });
          // a carved relief panel over each window, and a square attic window
          b.box(2.0, 0.9, 0.08, tint(stone, 0.05), { at: [x, 5.7, 0.04] });
          b.box(1.5, 0.5, 0.12, tint(stone, -0.06), { at: [x, 5.9, 0.06] });
          b.box(1.0, 0.8, 0.08, P.windowDark, { at: [x, Hm + 0.45, 0.04] });
        }
        band(b, -len / 2, len / 2, Hm + 0.3, 0.12, 0.1, dress);
      });

    // ---- the court front: Corinthian portico before the door
    faceWin('+z', zC, [-8.0, -5.4, 5.4, 8.0], W);
    onFace(b, '+z', [0, 0, zC], () => {
      fenetre(b, 0, 0.7, 2.0, 4.6, dress, { cols: 2, rows: 5, sill: false, glass: door, bar: tint(door, 0.12), border: 0.2 });
      for (const x of [-2.3, 2.3]) fenetre(b, x, 0.7, 1.4, 4.0, dress, { cols: 2, rows: 5, sill: false });
    });
    const pzc = zC + 1.6;
    for (const x of [-3.5, -1.4, 1.4, 3.5]) col(b, x, pzc, 0.32, Hm - 0.7, dress, { y: 0.7, cap: 'corinthian', segs: 8 });
    b.box(8.4, 0.7, 2.6, stone, { at: [0, 0, zC + 1.3] });
    b.stairs(3.6, 0.7, 1.2, 3, dress, { at: [0, 0, zC + 3.2] });
    b.box(8.4, 0.9, 2.4, dress, { at: [0, Hm, zC + 1.2] });
    balustrade(b, -4.2, 4.2, Hm + 0.9, dress, { z: zC + 2.25, h: 0.8, step: 0.6 });
    // statues over the portico
    for (const x of [-3.5, 3.5]) {
      b.box(0.6, 0.3, 0.6, dress, { at: [x, Hm + 0.9, pzc] });
      b.cyl(0.22, 1.3, P.marble, { at: [x, Hm + 1.2, pzc], segs: 6, rTop: 0.17 });
      b.sphere(0.16, P.marble, { at: [x, Hm + 2.62, pzc], segs: 6 });
    }

    // ---- the garden front with the rotunda
    faceWin('-z', zG, [-8.0, -5.4, 5.4, 8.0], W);
    const rr = 3.8;
    const rz = zG;
    b.lathe([[rr, 0], [rr, H]], stone, { at: [0, 0, rz], start: Math.PI / 2, sweep: Math.PI, segs: 12 });
    b.lathe([[rr + 0.12, 0], [rr + 0.12, 0.7]], tint(stone, -0.05), { at: [0, 0, rz], start: Math.PI / 2, sweep: Math.PI, segs: 12 });
    b.lathe([[rr + 0.3, 0], [rr + 0.3, 0.5]], dress, { at: [0, Hm - 0.2, rz], start: Math.PI / 2, sweep: Math.PI, segs: 12 });
    b.lathe([[rr + 0.18, 0], [rr + 0.18, 0.35]], dress, { at: [0, H, rz], start: Math.PI / 2, sweep: Math.PI, segs: 12 });
    b.collider(2 * rr, rr, { at: [0, 0, rz - rr / 2] });
    // the shallow dome, its lead drum set back
    b.cyl(rr - 0.6, 0.9, stone, { at: [0, H, rz], segs: 14 });
    b.dome(rr - 0.5, lead, { at: [0, H + 0.9, rz], squash: 0.42, segs: 14 });
    b.cyl(0.4, 0.6, dress, { at: [0, H + 0.9 + (rr - 0.5) * 0.42 - 0.1, rz], segs: 8 });
    // columns, windows and statues round the drum
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 2 + ((i + 0.5) / 6) * Math.PI;
      const cx = Math.sin(a) * (rr + 0.35);
      const cz = rz + Math.cos(a) * (rr + 0.35);
      col(b, cx, cz, 0.28, Hm - 0.9, dress, { y: 0.7, cap: 'corinthian', segs: 8 });
      b.box(0.55, 0.3, 0.55, dress, { at: [cx, H + 0.35, cz] });
      b.cyl(0.2, 1.2, P.marble, { at: [cx, H + 0.65, cz], segs: 6, rTop: 0.16 });
      b.sphere(0.15, P.marble, { at: [cx, H + 2.0, cz], segs: 6 });
    }
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + ((i + 1) / 6) * Math.PI;
      b.group({ at: [Math.sin(a) * rr, 0, rz + Math.cos(a) * rr], rotY: a }, () => {
        fenetre(b, 0, 0.7, 1.3, 4.2, dress, { cols: 2, rows: 5, sill: false, border: 0.14 });
        b.box(1.4, 0.6, 0.1, P.windowDark, { at: [0, Hm + 0.45, 0.04] });
      });
    }
    // a terrace and steps down to the lawn
    b.box(W, 0.7, 1.6, stone, { at: [0, 0, zG - 0.8] });
    // the garden, now laid out in the English manner: a lawn, clumps of trees, a winding walk
    b.box(2 * X, 0.04, 2.6, P.gravel, { at: [0, 0, zG - 1.0] });
    b.box(2 * X, 0.05, 4.0, P.grass, { at: [0, 0, -11.0] });
    for (const [x, z, h] of [[-9.0, -10.9, 5.0], [-6.6, -11.4, 3.8], [8.4, -10.8, 5.4], [10.0, -8.8, 4.0]] as [number, number, number][]) b.tree(h, { at: [x, 0, z], kind: 'round' });
    for (const x of [-4.5, 4.5]) {
      b.box(0.6, 0.9, 0.6, dress, { at: [x, 0, -10.6] });
      b.lathe([[0.15, 0], [0.4, 0.3], [0.32, 0.6], [0.4, 0.7]], dress, { at: [x, 0.9, -10.6], segs: 8 });
    }

    // ---- the court: colonnades on both sides, service rooms behind
    const cz0 = zC + 0.4;
    const cz1 = zS - 0.6;
    const cL = cz1 - cz0;
    const czc = (cz0 + cz1) / 2;
    for (const s of [-1, 1] as const) {
      const bx = s * (X - wW / 2);
      b.box(wW, 5.0, cL, stone, { at: [bx, 0, czc] });
      b.collider(wW, cL, { at: [bx, 0, czc] });
      b.box(wW + 0.2, 0.3, cL + 0.2, dress, { at: [bx, 5.0, czc] });
      // the colonnade, a walk between it and the service rooms, a flat roof over all
      const n = 5;
      for (let i = 0; i <= n; i++) col(b, s * cxIn, cz0 + 0.3 + (i * (cL - 0.6)) / n, 0.26, 4.4, dress, { cap: 'ionic', segs: 7 });
      b.box(X - cxIn - wW + 0.6, 0.7, cL, dress, { at: [s * (cxIn + (X - cxIn - wW) / 2 - 0.1), 4.4, czc] });
      b.box(X - cxIn + 0.4, 0.3, cL + 0.2, dress, { at: [s * (X - (X - cxIn) / 2 - 0.1), 5.1, czc] });
      onFace(b, s > 0 ? '-x' : '+x', [s * (X - wW), 0, czc], () => {
        for (const x of [-3.0, 0, 3.0]) {
          b.box(1.2, 2.7, 0.08, door, { at: [x, 0, 0.04] });
          b.box(1.5, 0.4, 0.1, dress, { at: [x, 2.9, 0.05] });
        }
      });
      onFace(b, s > 0 ? '-x' : '+x', [s * (cxIn + 0.26), 0, czc], () => balustrade(b, -cL / 2, cL / 2, 5.4, dress, { h: 0.7, step: 0.8 }));
    }

    // ---- the street side: a triumphal arch between screens of columns
    const gw = 6.6;
    const gh = 8.6;
    b.archWall(gw, gh, 1.4, stone, { at: [0, 0, zS], openings: 1, openW: 3.6, openH: 5.8, shape: 'round' });
    b.sym((s) => b.collider(1.5, 1.4, { at: [s * (gw / 2 - 0.75), 0, zS] }));
    for (const f of ['+z', '-z'] as const) {
      onFace(b, f, [0, 0, zS + (f === '+z' ? 0.7 : -0.7)], () => {
        archRing(b, 0, 0, 3.6, 5.8, 0.3, 0.1, dress);
        for (const s of [-1, 1]) col(b, s * 2.55, 0.45, 0.3, 6.2, dress, { cap: 'ionic', segs: 8 });
        band(b, -gw / 2 - 0.1, gw / 2 + 0.1, 6.2, 0.8, 0.8, dress);
        // the attic with a carved relief
        b.box(4.2, 1.3, 0.1, tint(stone, -0.05), { at: [0, 7.1, 0.05] });
        for (let i = 0; i < 5; i++) b.box(0.35, 0.8, 0.14, tint(stone, 0.06), { at: [-1.6 + i * 0.8, 7.35, 0.1] });
      });
    }
    b.box(gw + 0.3, 0.3, 1.7, dress, { at: [0, gh, zS] });
    // the screen walls with engaged Ionic columns, to the corners
    b.sym((s) => {
      const x0 = gw / 2;
      const len = X - x0;
      b.box(len, 5.0, 0.6, stone, { at: [s * (x0 + len / 2), 0, zS] });
      b.box(len, 0.6, 1.0, dress, { at: [s * (x0 + len / 2), 4.6, zS] });
      b.collider(len, 0.8, { at: [s * (x0 + len / 2), 0, zS] });
      for (let i = 0; i < 4; i++) col(b, s * (x0 + 0.9 + i * ((len - 1.4) / 3)), zS + 0.45, 0.24, 4.6, dress, { cap: 'ionic', segs: 6 });
    });
    // gate leaves of iron and the court
    b.box(2 * cxIn, 0.05, cz1 - zC, P.paving, { at: [0, 0, (cz1 + zC) / 2] });
    b.box(3.8, 0.06, 1.6, P.paving, { at: [0, 0, zS] });
  },
};
