import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { archPts, archRing, band, col, croisee, dormer, medallion, onFace, pediment, pilaster, plate, type Face } from './shared';

export const renaissanceHotel: BuildingDef = {
  id: 'renaissance-hotel',
  name: 'Renaissance hôtel',
  style: 'French Renaissance',
  date: 'c. 1540',
  summary:
    'Half a century after Charles VIII’s Italian campaign of 1494, a family of royal officers rebuilds in the new manner learned from Italy. The plan and the steep slate roofs are still French, but the walls are now ruled into a grid: pilasters in tiers (plain Doric below, Ionic above) between moulded cornices, framing stone cross-windows set one above another in vertical bays that run up into the dormers. ' +
    'Ornament comes from antiquity: roundels with heads of emperors, shell-headed dormers with candelabra, and on the court an open loggia of round arches on columns. ' +
    'The house now stands behind its court, which the street sees only through a portal like a Roman arch: the first step towards the hôtel between court and garden.',
  materials: ['fine limestone', 'slate', 'oak', 'leaded glass'],
  modelledOn: 'The Hôtel d’Assézat, Toulouse (begun 1555, probably by Nicolas Bachelier) for the tiered orders, the court loggia, the street portal and the tall stair tower crowned by a lantern; the Hôtel Pincé, Angers (Jean de Lespine, about 1523 to 1530) for the medallions, the dormers and the corbelled corner turret. Built in stone, as in the north, rather than Toulouse brick',
  influences: ['italian-renaissance'],
  lookFor: [
    { label: 'Pilasters in tiers', note: 'Flat classical pilasters, Doric on the ground floor and Ionic above, divide the wall into a grid of bays.', at: [-2.65, 6.0, -4.45] },
    { label: 'Medallions', note: 'Round carved portraits in the antique manner, set between the windows.', at: [0.6, 3.6, -4.4] },
    { label: 'Renaissance dormers', note: 'The dormers keep their Gothic height but are now framed by pilasters and crowned with a round pediment holding a scallop shell, with candelabra at the corners.', at: [-1.4, 11.6, -4.2] },
    { label: 'Open loggia', note: 'An arcade of round arches on columns along the court, an idea brought straight from Italy.', at: [5.4, 2.8, 0.5] },
    { label: 'Portal like a triumphal arch', note: 'The street sees only the gate: a round arch between paired columns under an entablature and pediment.', at: [0, 6.2, 12.0] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, tint(P.pierreBlonde, 0.03), P.craie]);
    const dress = tint(stone, 0.05);
    const slate = b.pick([P.ardoise, P.slateBlue]);
    const door = b.pick([P.oakDark, P.doorGreen, P.oak]);
    const G = 4.2;
    const F = 4.0;
    const H = G + F;
    const X = 11;
    const zB = -12;
    const zM = -4.6; // court face of the main block
    const wx = 5.6; // court face of the wing
    const zW = 6.2; // wing's street end
    const zS = 11.6; // street wall

    const dOpts = { stone: dress, roof: slate };

    // ---- main block
    const mD = zM - zB;
    b.box(2 * X, H, mD, stone, { at: [0, 0, (zM + zB) / 2] });
    b.collider(2 * X, mD, { at: [0, 0, (zM + zB) / 2] });
    const mR = (mD / 2) * 1.55;
    b.gable(2 * X, mD, mR, slate, { at: [0, H, (zM + zB) / 2], overhang: 0.3, wall: stone });
    b.box(2 * X + 0.4, 0.14, 0.14, P.lead, { at: [0, H + mR + 0.12, (zM + zB) / 2] });
    // ---- the wing: loggia on the court below, rooms above
    const wD = X - wx;
    const wL = zW - zM;
    const wzc = (zW + zM) / 2;
    b.box(wD - 2.6, G, wL, stone, { at: [X - (wD - 2.6) / 2, 0, wzc] });
    b.box(wD, F, wL, stone, { at: [X - wD / 2, G, wzc] });
    b.collider(wD - 2.6, wL, { at: [X - (wD - 2.6) / 2, 0, wzc] });
    b.box(2.6, 0.06, wL, P.paving, { at: [wx + 1.3, 0, wzc] });
    const wR = (wD / 2) * 1.55;
    b.gable(wD, wL, wR, slate, { at: [X - wD / 2, H, wzc], ridge: 'z', overhang: 0.3, wall: stone });
    // the loggia arcade: round arches on Doric columns, an entablature over
    const nA = 4;
    b.archWall(wL, G, 0.45, dress, { at: [wx + 0.22, 0, wzc], facing: '-x', openings: nA, openW: 2.3, openH: 3.5, shape: 'round' });
    onFace(b, '-x', [wx + 0.22, 0, wzc], () => {
      for (let i = 0; i <= nA; i++) {
        const x = -wL / 2 + (i * wL) / nA;
        col(b, x, 0.35, 0.2, 3.5 - 1.15, dress, { cap: 'tuscan', segs: 6 });
      }
      for (let i = 0; i < nA; i++) medallion(b, -wL / 2 + ((i + 0.5) * wL) / nA, 3.65, 0.25, dress, 0.22);
      band(b, -wL / 2 - 0.2, wL / 2 + 0.2, G - 0.1, 0.32, 0.4, dress, 0.1);
    });

    // ---- a facade of bays: tiered pilasters, cornices, windows over windows, dormers over all
    const bays = (f: Face, at: [number, number, number], xs: number[], o: { len: number; g?: boolean; dorm?: boolean; pil?: boolean; med?: boolean }) =>
      onFace(b, f, at, () => {
        const pil = o.pil !== false;
        for (const x of xs) {
          if (o.g !== false) croisee(b, x, 1.1, 1.4, 2.6, dress, { border: 0.16 });
          croisee(b, x, G + 0.7, 1.4, 2.6, dress, { border: 0.16 });
          // a small cornice over each window
          b.box(2.0, 0.16, 0.24, dress, { at: [x, G + 0.7 + 2.75, 0.12], jitter: false });
          if (o.g !== false) b.box(2.0, 0.16, 0.24, dress, { at: [x, 1.1 + 2.75, 0.12], jitter: false });
          if (pil) {
            for (const s of [-1, 1]) {
              if (o.g !== false) pilaster(b, x + s * 1.25, 0.4, 0.34, G - 0.6, dress, 0, 0.1);
              pilaster(b, x + s * 1.25, G + 0.24, 0.3, F - 0.5, dress, 0, 0.1);
              // Ionic volutes, a pair of little rolls on the upper capitals
              b.box(0.5, 0.12, 0.2, dress, { at: [x + s * 1.25, G + F - 0.4, 0.12], jitter: false });
            }
          }
          if (o.dorm) b.group({ at: [0, 0, 0.3] }, () => dormer(b, 'renaissance', x, H + 0.4, 1.2, 1.8, dOpts));
        }
        if (o.med) for (let i = 0; i < xs.length - 1; i++) medallion(b, (xs[i] + xs[i + 1]) / 2, G - 0.6, 0.38, dress, 0.02);
        // the cornices: one over each storey
        band(b, -o.len / 2, o.len / 2, G, 0.24, 0.26, dress);
        band(b, -o.len / 2, o.len / 2, H - 0.3, 0.3, 0.36, dress);
        band(b, -o.len / 2, o.len / 2, 0, 0.4, 0.12, tint(stone, -0.05));
      });
    bays('+z', [0, 0, zM], [-1.4, 2.6], { len: 2 * X, dorm: true, med: true });
    bays('-x', [wx, 0, wzc], [-2.2, 2.2], { len: wL, g: false, dorm: true });
    bays('-z', [0, 0, zB], [-8.0, -4.0, 0, 4.0, 8.0], { len: 2 * X, pil: false, dorm: false });
    onFace(b, '-z', [0, 0, zB], () => {
      for (const x of [-4.0, 4.0]) b.group({ at: [0, 0, 0.3] }, () => dormer(b, 'renaissance', x, H + 0.4, 1.2, 1.8, dOpts));
    });
    bays('+x', [X, 0, wzc], [-2.6, 2.6], { len: wL, pil: false });
    bays('+x', [X, 0, (zM + zB) / 2], [0], { len: mD, pil: false });
    bays('-x', [-X, 0, (zM + zB) / 2], [-1.6, 1.6], { len: mD, pil: false });
    // the wing's end on the street side
    bays('+z', [X - wD / 2, 0, zW], [0], { len: wD, pil: false });

    // ---- the stair tower in the angle of the court: octagonal, with a little dome and lantern
    const tx = -5.2;
    const tz = zM + 1.7;
    const tr = 2.0;
    const th = H + 3.6;
    b.cyl(tr, th, stone, { at: [tx, 0, tz], segs: 8, rotY: Math.PI / 8 });
    b.collider(2 * tr, 2 * tr, { at: [tx, 0, tz] });
    for (const y of [G - 0.2, H - 0.3, th - 0.4]) b.cyl(tr + 0.12, 0.3, dress, { at: [tx, y, tz], segs: 8, rotY: Math.PI / 8, jitter: false });
    b.lathe([[tr + 0.1, 0], [tr * 0.9, 0.9], [tr * 0.6, 1.6], [tr * 0.25, 1.9], [0.01, 1.95]], slate, { at: [tx, th, tz], segs: 8 });
    b.cyl(0.45, 1.3, dress, { at: [tx, th + 1.8, tz], segs: 6 });
    b.cone(0.6, 1.1, slate, { at: [tx, th + 3.1, tz], segs: 6 });
    const ap = tr * Math.cos(Math.PI / 8);
    for (const [a, y] of [[0, 1.0], [Math.PI / 4, G + 0.8], [-Math.PI / 4, H + 0.9]] as [number, number][]) {
      b.group({ at: [tx + Math.sin(a) * ap, 0, tz + Math.cos(a) * ap], rotY: a }, () => {
        if (y < 2) {
          plate(b, archPts(0, 0, 1.4, 2.8, 'round', 6), 0.08, dress);
          plate(b, archPts(0, 0, 1.0, 2.5, 'round', 6), 0.12, door);
          for (const s of [-1, 1]) pilaster(b, s * 0.95, 0, 0.26, 3.1, dress, 0, 0.1);
          pediment(b, 0, 3.1, 1.9, 0.6, 'tri', dress, 0.2);
        } else {
          croisee(b, 0, y, 0.7, 1.8, dress, { mullion: false, border: 0.12 });
        }
      });
    }

    // ---- the corbelled corner turret (échauguette) at the street corner of the wing
    const ex = X - 0.2;
    const ez = zW - 0.2;
    b.lathe([[0.05, 0], [0.9, 1.4], [1.1, 1.5]], dress, { at: [ex, G - 1.0, ez], segs: 8 });
    b.cyl(1.1, F + 0.6, stone, { at: [ex, G + 0.5, ez], segs: 8 });
    b.cone(1.3, 3.0, slate, { at: [ex, H + 1.1, ez], segs: 8 });
    b.cyl(0.04, 0.9, P.lead, { at: [ex, H + 4.0, ez], segs: 4 });
    for (const a of [Math.PI / 4, Math.PI * 0.75]) {
      b.group({ at: [ex + Math.sin(a) * 1.05, 0, ez + Math.cos(a) * 1.05], rotY: a }, () => croisee(b, 0, G + 1.4, 0.6, 1.6, dress, { mullion: false, border: 0.1 }));
    }

    // ---- left of the court: a low range of offices and stables
    const lw = 3.6;
    b.box(lw, 3.6, 14, stone, { at: [-X + lw / 2, 0, 2.6] });
    b.collider(lw, 14, { at: [-X + lw / 2, 0, 2.6] });
    b.gable(lw, 14, 2.6, slate, { at: [-X + lw / 2, 3.6, 2.6], ridge: 'z', overhang: 0.25, wall: stone });
    onFace(b, '+x', [-X + lw, 0, 2.6], () => {
      for (const x of [-4.5, 0, 4.5]) {
        plate(b, archPts(x, 0, 2.0, 2.8, 'round', 6), 0.08, dress);
        plate(b, archPts(x, 0, 1.7, 2.6, 'round', 6), 0.1, door);
      }
      for (const x of [-2.3, 2.3]) croisee(b, x, 1.4, 0.8, 1.2, dress, { mullion: false, border: 0.1 });
    });
    for (const x of [-1.2, 1.2]) b.group({ at: [-X + lw + 0.25, 0, 2.6 + x * 3.4], rotY: Math.PI / 2 }, () => dormer(b, 'plain', 0, 3.75, 0.7, 0.9, dOpts));

    // ---- the street wall and portal
    const pw = 5.8;
    b.sym((s) => {
      b.box(X - pw / 2, 4.2, 0.6, stone, { at: [s * (pw / 2 + (X - pw / 2) / 2), 0, zS] });
      b.box(X - pw / 2, 0.2, 0.8, dress, { at: [s * (pw / 2 + (X - pw / 2) / 2), 4.2, zS] });
      b.collider(X - pw / 2, 0.6, { at: [s * (pw / 2 + (X - pw / 2) / 2), 0, zS] });
    });
    b.archWall(pw, 7.0, 0.9, stone, { at: [0, 0, zS], openings: 1, openW: 3.2, openH: 5.0, shape: 'round' });
    b.sym((s) => b.collider(1.2, 1.2, { at: [s * (pw / 2 - 0.6), 0, zS] }));
    for (const f of ['+z', '-z'] as const) {
      onFace(b, f, [0, 0, zS + (f === '+z' ? 0.45 : -0.45)], () => {
        // a moulded archivolt with a keystone, paired columns, entablature, pediment
        archRing(b, 0, 0, 3.2, 5.0, 0.4, 0.12, dress, 0.0);
        b.box(0.5, 0.8, 0.22, dress, { at: [0, 4.75, 0.1], jitter: false });
        for (const s of [-1, 1]) for (const dx of [0, 0.75]) col(b, s * (2.05 + dx), 0.3, 0.24, 5.2, dress, { cap: 'doric', segs: 8 });
        band(b, -pw / 2 - 0.2, pw / 2 + 0.2, 5.2, 0.7, 0.5, dress);
        pediment(b, 0, 5.9, pw + 0.4, 1.3, 'seg', dress, 0.45);
        medallion(b, 0, 6.15, 0.35, dress, 0.4);
      });
    }

    // ---- chimneys and finials
    for (const x of [-7.6, 7.6]) {
      b.chimney(1.2, 7.4, 0.8, dress, { at: [x, H, -8.2] });
      for (const s of [-1, 1]) b.box(0.12, 6.6, 0.84, dress, { at: [x + s * 0.48, H + 0.6, -8.2] });
    }
    b.chimney(1.0, 5.6, 0.8, dress, { at: [X - wD / 2, H, 3.0] });
    // the court: paving and a little parterre in the middle
    b.box(2 * X - lw, 0.05, zS - zM, P.paving, { at: [lw / 2, 0, (zS + zM) / 2] });
    b.box(4.0, 0.12, 4.0, P.grass, { at: [-1.0, 0, 4.5] });
    b.cyl(0.6, 0.7, dress, { at: [-1.0, 0, 4.5], segs: 8 });
    b.cyl(0.18, 1.3, dress, { at: [-1.0, 0.7, 4.5], segs: 6 });
  },
};
