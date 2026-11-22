import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { block, onFace, pediment, plate, win } from './shared';

/** A piano nobile window with eared frame and a broken segmental (or triangular) pediment, local face frame. */
function nobileWindow(b: Builder, x: number, y: number, w: number, h: number, kind: 'seg' | 'tri', stone: number): void {
  win(b, x, y, w, h, stone, { border: 0.18 });
  // the 'ears' where the frame steps out at the top corners
  b.box(w + 0.7, 0.3, 0.12, stone, { at: [x, y + h - 0.12, 0.06] });
  b.box(w + 0.6, 0.18, 0.3, stone, { at: [x, y - 0.32, 0.15] });
  b.box(w + 0.9, 0.2, 0.32, stone, { at: [x, y + h + 0.2, 0.16] });
  // broken pediment: two halves with a gap in the middle filled by a little cartouche
  const pw = w + 1.0;
  const ph = kind === 'tri' ? 0.6 : 0.45;
  for (const s of [-1, 1]) {
    const pts: [number, number][] =
      kind === 'tri'
        ? [[0.22, 0], [pw / 2, 0], [0.22, ph * (1 - 0.44 / pw)]]
        : [[0.22, 0], [pw / 2, 0], [pw / 2 - 0.12, 0.2], [pw / 3, ph * 0.85], [0.22, ph]];
    b.group({ at: [x, y + h + 0.4, 0], scale: [s, 1, 1] }, () => plate(b, pts, 0.32, stone));
  }
  plate(b, [[x - 0.2, y + h + 0.4], [x + 0.2, y + h + 0.4], [x + 0.26, y + h + 0.75], [x, y + h + 1.0], [x - 0.26, y + h + 0.75]], 0.22, tint(stone, 0.04));
}

/** A giant pilaster rising through two storeys, with base and a flared composite capital, local face frame. */
function pilaster(b: Builder, x: number, y0: number, h: number, w: number, stone: number): void {
  b.box(w + 0.2, 0.5, 0.36, stone, { at: [x, y0, 0.18] });
  b.box(w, h - 1.2, 0.26, stone, { at: [x, y0 + 0.5, 0.13] });
  b.box(w + 0.1, 0.35, 0.32, stone, { at: [x, y0 + h - 0.7, 0.16] });
  b.box(w + 0.3, 0.35, 0.38, stone, { at: [x, y0 + h - 0.35, 0.19] });
}

export const baroquePalazzo: BuildingDef = {
  id: 'baroque-palazzo',
  name: 'Baroque palazzo',
  style: 'Roman Baroque',
  date: 'c. 1665',
  summary:
    'The palace front becomes a stage set. Giant pilasters rise through both upper storeys and tie the whole front into one composition, and the centre is pushed forward in a curve to draw the eye to the doorway, the balcony and the great coat of arms. ' +
    'Window frames step out into ‘ears’ and break their pediments, and statues line the balustrade against the sky. ' +
    'Arrival is a ceremony: carriages pass through the portal into the court, and from its portico tall open arches lead into a stair hall, where a broad staircase (scalone) climbs in two flights to the main floor. ' +
    'Where the Farnese front was a flat wall with framed windows, this one is modelled in depth.',
  materials: ['ochre or rose plaster', 'travertine pilasters and dressings', 'stucco', 'coppi roof tiles', 'wrought iron'],
  modelledOn: 'Palazzo Chigi-Odescalchi, Rome (Gian Lorenzo Bernini, from 1664), with a centre bowed forward in the manner of Bernini’s Palazzo di Montecitorio, Rome (from 1653), and later of Guarino Guarini’s Palazzo Carignano, Turin (from 1679); the stair hall opening off the courtyard portico follows the staircases of Palazzo Barberini, Rome (1627 to 1633)',
  influences: ['baroque-export'],
  lookFor: [
    { label: 'Giant order', note: 'Pilasters rise through two storeys at once, from the top of the rusticated base to the main cornice: the "giant order" used by Michelangelo on the Capitol and by Bernini on palace fronts.', at: [-8.05, 11.0, 11.8] },
    { label: 'Curved centre', note: 'The three middle bays swell forward in a convex curve, so the front seems to move.', at: [2.3, 8.5, 12.4] },
    { label: 'Balcony over the portal', note: 'Two columns flank the carriage entrance and carry the balcony of the main reception room above it.', at: [0, 5.6, 13.6] },
    { label: 'Coat of arms', note: 'A huge carved cartouche with the family arms, under a crown, breaks up through the cornice into the balustrade.', at: [0, 16.8, 12.9] },
    { label: 'Stair hall off the portico', note: 'At the end of the courtyard portico tall open arches lead into the stair hall, where the scalone rises in two broad flights with a stone balustrade to the main floor.', at: [8.0, 4.0, 0.5] },
  ],
  build(b) {
    const wall = b.variant === 0 ? P.intonacoRose : b.pick([P.intonacoRose, P.intonacoOchre, P.intonacoSienna, P.brickOrange]);
    const trav = b.pick([P.travertine, P.stucco, tint(P.travertine, 0.03)]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const door = b.pick([P.oakDark, P.doorGreen, P.doorBlue]);
    const W = 22;
    const zf = 11.0;
    const zb = 4.0;
    const G = 5.0;
    const F1 = 5.4;
    const F2 = 4.6;
    const Ho = G + F1 + F2; // top of the giant order, 15.0
    const E = 1.3; // entablature
    const H = Ho + E;

    // ---- the front range, split by the carriage passage, and the two wings round the court
    b.sym((s) => block(b, W / 2 - 1.5, G, zf - zb, wall, s * (1.5 + (W / 2 - 1.5) / 2), (zf + zb) / 2));
    b.box(W, H - G, zf - zb, wall, { at: [0, G, (zf + zb) / 2] });
    b.box(3.0, 0.06, zf - zb, P.paving, { at: [0, 0, (zf + zb) / 2] });
    b.box(3.0, 0.3, zf - zb, tint(wall, -0.12), { at: [0, G - 0.3, (zf + zb) / 2] });
    block(b, 4, H - E, 14, wall, -9, -3);
    block(b, 4, H - E, 7, wall, 9, -6.5);
    // the stair hall at the court end of the right wing: open to the portico in two tall arches
    const SH = G + F1; // the hall rises to the main floor
    b.box(4, H - E - SH, 7, wall, { at: [9, SH, 0.5] });
    b.box(0.4, SH, 7, wall, { at: [10.8, 0, 0.5] });
    b.collider(0.4, 7, { at: [10.8, 0, 0.5] });
    b.archWall(7, SH, 0.5, wall, { at: [7.25, 0, 0.5], facing: '-x', openings: 2, openW: 2.6, openH: SH - 1.2, shape: 'round' });
    onFace(b, '-x', [7.0, 0, 0.5], () => {
      for (const x of [-3.3, 0, 3.3]) pilaster(b, x, 0, SH - 0.2, 0.5, trav);
      b.box(7.2, 0.4, 0.4, trav, { at: [0, SH - 0.4, 0.2] });
    });
    b.box(3.5, 0.05, 6.6, P.marble, { at: [9, 0, 0.5] });
    // the scalone: a first flight along the outer wall, a landing, a second flight back to the main floor
    const sw = 1.6;
    b.stairs(sw, G / 2, 4.2, 9, trav, { at: [9.8, 0, 1.5] });
    b.box(3.4, G / 2, 1.6, trav, { at: [9.0, 0, -1.4] });
    b.stairs(sw, G / 2, 4.2, 9, trav, { at: [8.1, G / 2, 1.5], rotY: Math.PI });
    b.box(1.7, G, 0.4, trav, { at: [8.1, 0, 3.8] });
    b.box(0.14, G / 2 + 1.0, 4.2, tint(trav, -0.05), { at: [8.95, 0, 1.5] });
    b.beam([7.35, G / 2 + 1.0, -0.6], [7.35, G + 1.0, 3.6], 0.16, 0.16, trav);
    for (let i = 0; i < 7; i++) {
      const z = -0.3 + i * 0.6;
      b.cyl(0.07, 0.9, trav, { at: [7.35, G / 2 + ((z + 0.6) * (G / 2)) / 4.2 + 0.1, z], segs: 5, jitter: false });
    }
    b.collider(3.4, 6.4, { at: [9.0, 0, 0.9] });
    b.sym((s) => b.box(4.3, 0.6, 14.3, trav, { at: [s * 9, H - E - 0.1, -3] }));
    // the courtyard portico along the back of the front range, a terrace above it
    b.archWall(14, G, 0.5, wall, { at: [0, 0, zb - 2.2], facing: '-z', openings: 5, openW: 2.0, openH: 4.0, shape: 'round' });
    onFace(b, '-z', [0, 0, zb - 2.45], () => {
      for (let i = 0; i <= 5; i++) pilaster(b, -7 + i * 2.8, 0, G - 0.4, 0.45, trav);
    });
    b.box(14, 0.3, 2.4, wall, { at: [0, G - 0.3, zb - 1.2] });
    b.box(14, 0.06, 2.0, P.paving, { at: [0, 0, zb - 1.1] });
    for (let i = 0; i < 6; i++) b.box(0.4, 1.0, 0.4, trav, { at: [-7 + i * 2.8, G, zb - 2.25] });
    b.box(14, 0.15, 0.4, trav, { at: [0, G + 1.0, zb - 2.25] });

    // ---- street front: banded rustication on the ground storey
    for (let i = 0; i < 7; i++) b.box(W + 0.12, 0.58, 0.12, trav, { at: [0, i * 0.66 + 0.04, zf + 0.06], jitter: false });
    b.box(W + 0.3, 0.4, 0.4, trav, { at: [0, G - 0.4, zf + 0.15] });
    const bays = [-9.2, -6.9, -4.6, 4.6, 6.9, 9.2];
    onFace(b, '+z', [0, 0, zf], () => {
      for (const x of bays) {
        win(b, x, 1.6, 1.0, 2.0, trav, { border: 0.18, z: 0.12 });
        b.box(1.6, 0.4, 0.3, trav, { at: [x, 3.75, 0.15] });
        nobileWindow(b, x, G + 1.0, 1.15, 2.6, Math.abs(x) === 6.9 ? 'tri' : 'seg', trav);
        // second floor: a smaller window under a shell-like hood
        win(b, x, G + F1 + 0.9, 1.0, 1.9, trav, { border: 0.16 });
        pediment(b, x, G + F1 + 2.95, 1.4, 0.4, 'seg', trav, 0.22);
      }
      for (const x of [-10.65, -8.05, -5.75, -3.45, 3.45, 5.75, 8.05, 10.65]) pilaster(b, x, G, Ho - G, 0.7, trav);
      // entablature with a frieze band, on the flat parts of the front
      b.sym((s) => {
        b.box(7.6, 0.5, 0.36, trav, { at: [s * 7.2, Ho, 0.18] });
        b.box(7.6, 0.4, 0.06, tint(wall, 0.05), { at: [s * 7.2, Ho + 0.5, 0.03] });
        b.box(7.8, 0.4, 0.75, trav, { at: [s * 7.3, Ho + 0.9, 0.37] });
      });
    });

    // ---- the curved centre: three bays swelling forward on an arc
    const sag = 0.8;
    const chord = 6.9;
    const Rb = (chord * chord) / 4 / (2 * sag) + sag / 2;
    const zc = zf + sag - Rb;
    const half = Math.asin(chord / 2 / Rb);
    const arc = { at: [0, 0, zc] as [number, number, number], segs: 9, start: -half, sweep: 2 * half };
    b.lathe([[Rb, 0], [Rb, H - 0.4]], wall, arc);
    for (let i = 0; i < 7; i++) b.lathe([[Rb + 0.12, i * 0.66 + 0.04], [Rb + 0.12, i * 0.66 + 0.62]], trav, { ...arc, jitter: false });
    b.lathe([[Rb + 0.36, Ho], [Rb + 0.36, Ho + 0.5], [Rb + 0.06, Ho + 0.5], [Rb + 0.06, Ho + 0.9], [Rb + 0.75, Ho + 0.9], [Rb + 0.75, Ho + 1.3], [Rb - 0.4, Ho + 1.3]], trav, { ...arc, jitter: false });
    b.box(2 * Rb * Math.sin(half), H - 0.4, 0.2, wall, { at: [0, 0, zc + Rb * Math.cos(half) - 0.1] });
    // bays and pilasters on the curve
    const onArc = (x: number, fn: () => void) => {
      const a = Math.asin(x / Rb);
      b.group({ at: [Rb * Math.sin(a), 0, zc + Rb * Math.cos(a)], rotY: a }, fn);
    };
    for (const x of [-2.3, 2.3]) {
      onArc(x, () => {
        win(b, 0, 1.6, 1.0, 2.0, trav, { border: 0.18, z: 0.12 });
        nobileWindow(b, 0, G + 1.0, 1.15, 2.6, 'seg', trav);
        win(b, 0, G + F1 + 0.9, 1.0, 1.9, trav, { border: 0.16 });
        pediment(b, 0, G + F1 + 2.95, 1.4, 0.4, 'seg', trav, 0.22);
      });
    }
    for (const x of [-1.15, 1.15]) onArc(x, () => pilaster(b, 0, G, Ho - G, 0.7, trav));
    onArc(0, () => {
      // the portal, flanked by columns that carry the balcony
      b.panel(2.6, 4.2, door, { at: [0, 0, 0.0], shape: 'round', depth: 0.1 });
      b.panel(3.4, 4.6, trav, { at: [0, 0, 0.0], shape: 'round', depth: 0.06 });
      for (const s of [-1, 1]) {
        b.box(0.75, 0.6, 0.75, trav, { at: [s * 2.1, 0, 0.6] });
        b.cyl(0.28, 3.9, trav, { at: [s * 2.1, 0.6, 0.6], segs: 8, rTop: 0.24 });
        b.box(0.7, 0.5, 0.7, trav, { at: [s * 2.1, 4.5, 0.6] });
      }
      // balcony with balusters
      b.box(5.2, 0.35, 1.4, trav, { at: [0, G - 0.1, 0.5] });
      for (let i = 0; i < 9; i++) b.cyl(0.08, 0.8, trav, { at: [-2.2 + i * 0.55, G + 0.25, 1.1], segs: 5, rTop: 0.06, jitter: false });
      b.box(5.2, 0.14, 0.25, trav, { at: [0, G + 1.05, 1.1] });
      // the balcony door with a big broken pediment
      win(b, 0, G + 0.3, 1.5, 3.4, trav, { shape: 'round', border: 0.22, n: 6 });
      // the arms: a cartouche under a crown, breaking the cornice
      b.group({ at: [0, Ho - 1.8, 0.3] }, () => {
        plate(b, [[-1.0, 0], [-0.6, -0.35], [0, -0.2], [0.6, -0.35], [1.0, 0], [1.25, 1.2], [1.0, 2.4], [0.45, 2.85], [-0.45, 2.85], [-1.0, 2.4], [-1.25, 1.2]], 0.3, trav);
        plate(b, [[-0.6, 0.35], [0.6, 0.35], [0.65, 1.6], [0, 2.2], [-0.65, 1.6]], 0.12, P.doorRed, 0.3);
        for (const [x, y] of [[-0.28, 1.25], [0.28, 1.25], [0, 0.7]]) b.box(0.3, 0.3, 0.06, P.gold, { at: [x, y, 0.42], rot: [0, 0, Math.PI / 4] });
        b.cyl(0.55, 0.45, P.gold, { at: [0, 2.85, 0.15], segs: 7, rTop: 0.65 });
        for (const s of [-1, 0, 1]) b.cone(0.1, 0.3, P.gold, { at: [s * 0.45, 3.3, 0.15], segs: 4 });
      });
    });

    // ---- balustrade with statues along the skyline
    const by = H;
    const balZ = zf - 0.1;
    b.sym((s) => {
      b.box(7.6, 0.25, 0.5, trav, { at: [s * 7.3, by, balZ] });
      b.box(7.6, 0.2, 0.5, trav, { at: [s * 7.3, by + 1.0, balZ] });
      for (let i = 0; i < 12; i++) b.box(0.16, 0.75, 0.16, trav, { at: [s * (3.8 + i * 0.6), by + 0.25, balZ], jitter: false });
      for (const x of [3.45, 5.75, 8.05, 10.65]) b.box(0.6, 1.2, 0.6, trav, { at: [s * x, by, balZ] });
    });
    b.lathe([[Rb - 0.2, by], [Rb, by], [Rb, by + 1.2], [Rb - 0.2, by + 1.2]], trav, { ...arc, at: [0, 0, zc], segs: 9 });
    for (const x of [-10.65, -5.75, 5.75, 10.65]) {
      b.cyl(0.22, 1.3, trav, { at: [x, by + 1.2, balZ], segs: 6, rTop: 0.16 });
      b.sphere(0.2, trav, { at: [x, by + 2.7, balZ], segs: 5 });
      b.box(0.5, 0.18, 0.12, trav, { at: [x + 0.25, by + 2.15, balZ + 0.1], rotY: 0.4 });
    }
    for (const x of [-8.05, -3.45, 3.45, 8.05]) b.lathe([[0.01, 0], [0.25, 0.1], [0.32, 0.4], [0.18, 0.75], [0.08, 0.95], [0.01, 1.0]], trav, { at: [x, by + 1.2, balZ], segs: 6 });
    // a low hipped roof behind it all
    b.hip(W - 0.4, zf - zb + 0.2, 1.6, roof, { at: [0, H, (zf + zb) / 2 - 0.2] });
    b.sym((s) => b.hip(4.6, 14.4, 1.3, roof, { at: [s * 9, H - E + 0.5, -3.4] }));

    // ---- sides of the block and the wings
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, 0.5], () => {
        for (const x of [-8.5, -4.5, -0.5, 3.5, 7.5]) {
          win(b, x, 1.6, 1.0, 2.0, trav, { border: 0.16 });
          win(b, x, G + 1.0, 1.1, 2.6, trav, { border: 0.18 });
          b.box(1.8, 0.2, 0.3, trav, { at: [x, G + 3.9, 0.15] });
          win(b, x, G + F1 + 0.9, 1.0, 1.9, trav, { border: 0.16 });
        }
      });
      // the wings' court faces
      onFace(b, s > 0 ? '-x' : '+x', [s * 7, 0, -3], () => {
        for (const x of s > 0 ? [-5.5, -2.2] : [-4.5, 0, 4.5]) {
          b.panel(1.6, 3.0, door, { at: [x, 0, 0], shape: 'round', depth: 0.08 });
          win(b, x, G + 1.0, 1.1, 2.6, trav, { border: 0.18 });
          b.box(1.8, 0.2, 0.3, trav, { at: [x, G + 3.9, 0.15] });
          win(b, x, G + F1 + 0.9, 1.0, 1.9, trav, { border: 0.16 });
        }
      });
      onFace(b, '-z', [s * 9, 0, -10], () => {
        win(b, 0, G + 1.0, 1.1, 2.6, trav, { border: 0.18 });
        win(b, 0, G + F1 + 0.9, 1.0, 1.9, trav, { border: 0.16 });
      });
    }
    b.sym((s) => {
      for (const z of [-9.55, 10.55]) b.box(0.12, Ho - 0.6, 0.9, trav, { at: [s * (W / 2 + 0.06), 0.6, z] });
    });

    // ---- the court face of the front range, above the portico
    onFace(b, '-z', [0, 0, zb], () => {
      for (const x of [-1.6, 1.6]) win(b, x, G + 1.0, 1.1, 2.6, trav, { border: 0.18 });
      for (const x of [-5.5, 5.5]) win(b, x, G + 1.0, 1.1, 2.6, trav, { border: 0.18 });
      for (const x of [-5.5, -1.8, 1.8, 5.5]) win(b, x, G + F1 + 0.9, 1.0, 1.9, trav, { border: 0.16 });
      for (const x of [-4.2, 0, 4.2]) b.panel(1.6, 3.2, door, { at: [x, 0, 0], shape: 'round', depth: 0.06 });
    });
    // garden court: parterres, a fountain and a back wall with gates
    b.box(14, 0.05, 14, P.gravel, { at: [0, 0, -4] });
    for (const [x, z] of [[-3.2, -2.2], [3.2, -2.2], [-3.2, -7.4], [3.2, -7.4]]) {
      b.box(4.2, 0.12, 3.8, P.grass, { at: [x, 0, z] });
      b.box(4.2, 0.5, 0.25, P.hedge, { at: [x, 0, z + 1.8] });
      b.box(4.2, 0.5, 0.25, P.hedge, { at: [x, 0, z - 1.8] });
    }
    b.cyl(1.3, 0.6, trav, { at: [0, 0, -4.8], segs: 10 });
    b.cyl(1.15, 0.62, P.water, { at: [0, 0, -4.8], segs: 10, mat: 'glass' });
    b.cyl(0.2, 1.6, trav, { at: [0, 0.6, -4.8], segs: 6 });
    b.sym((s) => {
      block(b, 5.6, 3.2, 0.5, wall, s * 4.2, -11.7);
      b.box(0.9, 4.2, 0.9, trav, { at: [s * 1.6, 0, -11.7] });
      b.lathe([[0.01, 0], [0.3, 0.1], [0.35, 0.4], [0.15, 0.8], [0.01, 0.9]], trav, { at: [s * 1.6, 4.2, -11.7], segs: 6 });
      for (let i = 0; i < 6; i++) b.box(0.05, 2.6, 0.05, P.iron, { at: [s * (0.2 + i * 0.22), 0, -11.7] });
    });
    b.tree(7, { kind: 'cypress', at: [-5.8, 0, -10.6] });
    b.tree(7, { kind: 'cypress', at: [5.8, 0, -10.6] });
  },
};
