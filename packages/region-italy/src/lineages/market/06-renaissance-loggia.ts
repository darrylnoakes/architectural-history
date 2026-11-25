import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { archivolt, goods, hipRibs, squarePaving } from './shared';

/** The bronze boar fountain: a boar seated on a rocky base over a small basin, water from its mouth. */
function boarFountain(b: Builder, at: [number, number, number], rotY: number): void {
  const br = tint(P.bronze, -0.05);
  b.group({ at, rotY }, () => {
    // basin and pedestal
    b.box(1.9, 0.45, 1.0, P.marble, { at: [0, 0, 0.55] });
    b.box(1.7, 0.04, 0.8, P.water, { at: [0, 0.43, 0.55], jitter: false });
    b.box(1.6, 1.0, 1.2, P.pietraSerena, { at: [0, 0, -0.5] });
    b.box(1.8, 0.12, 1.4, tint(P.pietraSerena, 0.08), { at: [0, 1.0, -0.5] });
    // bronze base with plants and creatures, the boar sitting up on it
    b.blob(0.6, br, { at: [0, 1.25, -0.5], stretch: [1.3, 0.35, 0.9], detail: 0 });
    b.blob(0.5, br, { at: [0, 1.75, -0.7], stretch: [0.8, 1.15, 1.0], detail: 1 }); // body, sitting
    b.blob(0.3, br, { at: [0, 2.05, -0.2], stretch: [0.75, 0.85, 1.2], detail: 0 }); // head
    b.cyl(0.11, 0.3, br, { at: [0, 1.95, 0.08], rot: [Math.PI / 2 - 0.3, 0, 0], segs: 6 }); // snout
    for (const s of [-1, 1]) {
      b.box(0.12, 0.6, 0.12, br, { at: [s * 0.22, 1.3, -0.15] }); // forelegs
      b.cone(0.08, 0.22, br, { at: [s * 0.18, 2.25, -0.35], segs: 4, rot: [-0.3, 0, s * 0.3] }); // ears
      b.cone(0.03, 0.14, P.cream, { at: [s * 0.1, 1.92, 0.2], segs: 4, rot: [1.2, 0, 0] }); // tusks
    }
    b.cone(0.12, 0.08, P.gold, { at: [0, 1.95, 0.34], rot: [Math.PI / 2, 0, 0], segs: 6 }); // the snout rubbed bright
    b.beam([0, 1.82, 0.32], [0, 0.45, 0.6], 0.04, 0.04, P.water, { jitter: false }); // the jet
  });
  b.collider(1.9, 2.2, { at: [at[0], 0, at[2]], rotY });
}

export const renaissanceLoggia: BuildingDef = {
  id: 'renaissance-loggia',
  name: 'Market loggia',
  style: 'Florentine late Renaissance',
  date: 'c. 1550',
  summary:
    'The ducal government replaces the old trading stalls with a free-standing loggia for the dealers in silk, gold and other luxury goods, and for the bankers who changed money there. ' +
    'It is open on all four sides: round arches on Composite columns carrying shallow domed vaults, a sober grey and white scheme of pietra serena against plaster that Florence had used since Brunelleschi. ' +
    'Where the Gothic grain loggia stacked a fortress-like granary on massive piers, this is a single, airy hall whose beauty lies in its proportions. ' +
    'A bronze boar fountain, added in the next century, became a good-luck charm whose snout visitors still rub.',
  materials: ['pietra serena', 'white lime plaster', 'marble', 'bronze', 'coppi tiles'],
  lookFor: [
    { label: 'Arches on columns', note: 'Round arches springing straight from Composite columns, the Renaissance way of building an open arcade.', at: [-2.5, 7.4, 7.7] },
    { label: 'Pietra serena against white', note: 'Grey sandstone for the structural lines, white plaster for the fields between: Brunelleschi’s Florentine colour scheme.', at: [7.6, 9.2, 7.7] },
    { label: 'Corner piers', note: 'Solid square piers with pilasters stiffen the corners where the two arcades meet; in Florence they replaced the original corner columns, a change credited to Buontalenti.', at: [-9.6, 4.0, 7.6] },
    { label: 'Marble wheel', note: 'A wheel inlaid in the floor; in Florence it is said to mark where the city’s war cart stood, and where bankrupts were publicly shamed.', at: [0, 0.6, 0] },
    { label: 'Bronze boar fountain', note: 'Florence’s boar, the Porcellino, was cast by Pietro Tacca in the seventeenth century (about 1633) after an ancient marble.', at: [5.8, 2.6, 9.8] },
  ],
  modelledOn: 'The Loggia del Mercato Nuovo, Florence (Giovanni Battista del Tasso, 1547 to 1551), simplified',
  influences: ['renaissance-birth'],
  revisions: [{ year: 1640, note: 'Pietro Tacca’s bronze boar, cast in about 1633 after an ancient marble, is set up as a fountain on the south side of the loggia.' }],
  build(b) {
    // the square keeps the commune’s paving
    squarePaving(b);
    const W = 20;
    const D = 15;
    const y0 = 0.5; // floor of the loggia, on a stepped platform
    const PED = 0.7; // column pedestals
    const CH = 5.4; // column height
    const IMP = 0.3; // impost block
    const yS = y0 + PED + CH + IMP; // springing of the arches
    const R = 2.2; // arch radius
    const yE = yS + 3.0; // top of the arcade
    const ATT = 2.2; // attic storey
    const grey = P.pietraSerena;
    const white = b.pick([P.whiteRender, P.intonacoCream, P.stucco]);
    const greyL = tint(grey, 0.06);

    // the stepped platform and paving
    b.box(W + 2.4, 0.2, D + 2.4, tint(grey, 0.1), { at: [0, 0, 0] });
    b.box(W + 1.6, 0.15, D + 1.6, tint(grey, 0.14), { at: [0, 0.2, 0] });
    b.box(W + 0.8, 0.15, D + 0.8, tint(grey, 0.18), { at: [0, 0.35, 0] });
    // the marble wheel in the middle of the floor
    b.cyl(1.3, 0.03, P.marble, { at: [0, y0, 0], segs: 16 });
    b.cyl(0.95, 0.04, P.marbleGreen, { at: [0, y0, 0], segs: 16 });
    b.cyl(0.3, 0.05, P.marble, { at: [0, y0, 0], segs: 10 });
    for (let i = 0; i < 6; i++) b.box(0.1, 0.05, 1.9, P.marble, { at: [0, y0, 0], rotY: (i / 6) * Math.PI, jitter: false });

    // ---- the arcades on all four sides
    const colAt: [number, number][] = [];
    for (const x of [-5, 0, 5]) colAt.push([x, D / 2 - 0.3], [x, -D / 2 + 0.3]);
    for (const z of [-2.5, 2.5]) colAt.push([W / 2 - 0.3, z], [-W / 2 + 0.3, z]);
    for (const x of [-5, 0, 5]) for (const z of [-2.5, 2.5]) colAt.push([x, z]); // inside
    for (const [x, z] of colAt) {
      b.box(0.85, PED, 0.85, grey, { at: [x, y0, z] });
      b.column(0.3, CH, grey, { at: [x, y0 + PED, z], order: 'corinthian', segs: 6 });
      // Composite: a pair of Ionic volutes set diagonally at the corners over the leafy bell
      const yV = y0 + PED + CH - CH * 0.13 * 0.55;
      for (const a of [Math.PI / 4, -Math.PI / 4]) {
        b.group({ at: [x, yV, z], rotY: a }, () => {
          b.log(0.11, 1.0, greyL, { at: [0, -0.11, 0], segs: 4 }); // the two ends show as volutes at the corners
        });
      }
      b.box(0.85, IMP, 0.85, grey, { at: [x, y0 + PED + CH, z] });
      b.collider(0.9, 0.9, { at: [x, 0, z] });
    }
    // corner piers with pilasters on both faces
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const x = sx * (W / 2 - 0.6);
        const z = sz * (D / 2 - 0.6);
        b.box(1.4, yS - y0, 1.4, white, { at: [x, y0, z] });
        b.box(1.5, 0.5, 1.5, grey, { at: [x, y0, z] });
        b.panel(0.8, yS - y0 - 0.9, grey, { at: [x, y0 + 0.5, sz * (D / 2 + 0.1)], facing: sz > 0 ? '+z' : '-z', depth: 0.08 });
        b.panel(0.8, yS - y0 - 0.9, grey, { at: [sx * (W / 2 + 0.1), y0 + 0.5, z], facing: sx > 0 ? '+x' : '-x', depth: 0.08 });
        b.box(1.6, 0.35, 1.6, grey, { at: [x, yS - 0.35, z] });
        b.collider(1.4, 1.4, { at: [x, 0, z] });
      }
    }
    // the arched spandrel walls: white plaster, grey archivolts, a grey entablature
    const T = 0.6;
    for (const s of [1, -1] as const) {
      const fz = s > 0 ? '+z' : '-z';
      const fx = s > 0 ? '+x' : '-x';
      b.archWall(W - 0.2, yE - yS, T, white, { at: [0, yS, s * (D / 2 - 0.3)], facing: fz, openings: 4, openW: 2 * R, openH: R, shape: 'round' });
      b.archWall(D - 0.2, yE - yS, T, white, { at: [s * (W / 2 - 0.3), yS, 0], facing: fx, openings: 3, openW: 2 * R, openH: R, shape: 'round' });
      for (const x of [-7.5, -2.5, 2.5, 7.5]) archivolt(b, R, 0.32, 0, 0.08, grey, [x, yS, s * (D / 2 + 0.01)], fz, 6);
      for (const z of [-5, 0, 5]) archivolt(b, R, 0.32, 0, 0.08, grey, [s * (W / 2 + 0.01), yS, z], fx, 6);
      // roundels in the spandrels
      for (const x of [-5, 0, 5]) b.panel(0.7, 0.7, grey, { at: [x, yS + 1.5, s * (D / 2)], facing: fz, shape: 'circle', depth: 0.06 });
      for (const z of [-2.5, 2.5]) b.panel(0.7, 0.7, grey, { at: [s * (W / 2), yS + 1.5, z], facing: fx, shape: 'circle', depth: 0.06 });
    }
    // inner arches carrying the vaults, along both axes
    for (const z of [-2.5, 2.5]) b.archWall(W - 1.2, yE - yS, 0.4, white, { at: [0, yS, z], openings: 4, openW: 2 * R + 0.2, openH: R, shape: 'round' });
    for (const x of [-5, 0, 5]) b.archWall(D - 1.2, yE - yS, 0.4, white, { at: [x, yS, 0], facing: '+x', openings: 3, openW: 2 * R + 0.2, openH: R, shape: 'round' });
    // a shallow sail vault over each bay: a faceted cap on a square plan, springing from the arch crowns
    const rc = 2.5 * Math.SQRT2;
    for (const x of [-7.5, -2.5, 2.5, 7.5]) {
      for (const z of [-5, 0, 5]) {
        b.lathe(
          [
            [rc, 0],
            [rc * 0.72, 0.42],
            [rc * 0.38, 0.7],
            [0.01, 0.8],
          ],
          tint(white, -0.03),
          { at: [x, yS + R, z], segs: 4, rotY: Math.PI / 4 },
        );
      }
    }

    // entablature, attic with small windows over each arch, and cornice
    b.box(W + 0.3, 0.55, D + 0.3, grey, { at: [0, yE, 0] });
    b.box(W, ATT, D, white, { at: [0, yE + 0.55, 0] });
    for (const s of [1, -1] as const) {
      const fz = s > 0 ? '+z' : '-z';
      const fx = s > 0 ? '+x' : '-x';
      for (const x of [-7.5, -2.5, 2.5, 7.5]) b.window(1.1, 0.9, { at: [x, yE + 1.1, s * D / 2], facing: fz, frame: grey, glass: P.windowDark, border: 0.14 });
      for (const z of [-5, 0, 5]) b.window(1.1, 0.9, { at: [s * W / 2, yE + 1.1, z], facing: fx, frame: grey, glass: P.windowDark, border: 0.14 });
    }
    const yC = yE + 0.55 + ATT;
    b.box(W + 0.5, 0.2, D + 0.5, grey, { at: [0, yC - 0.2, 0] });
    b.box(W + 1.1, 0.3, D + 1.1, greyL, { at: [0, yC, 0] });
    b.hip(W + 0.8, D + 0.8, 2.3, P.coppi, { at: [0, yC + 0.3, 0], overhang: 0.3 });
    hipRibs(b, W + 0.8, D + 0.8, 2.3, [0, yC + 0.3, 0], 0.3, tint(P.coppi, -0.08), 1.4);

    // ---- trading inside: benches of silk and cloth, a money-changer's table with a green cloth
    const benches: [number, number, number][] = [
      [-7.5, 4.4, 0],
      [-2.5, 4.4, 0],
      [7.5, 4.4, 0],
      [-7.5, -4.4, Math.PI],
      [2.5, -4.4, Math.PI],
      [7.5, -4.4, Math.PI],
    ];
    benches.forEach(([x, z, r], i) => {
      if (b.variant === 1 && i === 4) return;
      b.box(2.6, 0.8, 0.9, P.oak, { at: [x, y0, z], rotY: r });
      goods(b, 2.4, [x, y0 + 0.8, z], r, ['cloth']);
    });
    b.box(1.8, 0.8, 0.9, P.oakDark, { at: [2.6, y0, 0.4] });
    b.box(1.9, 0.04, 1.0, P.doorGreen, { at: [2.6, y0 + 0.8, 0.4] });
    for (let i = 0; i < 3; i++) b.cyl(0.07, 0.05 + i * 0.03, P.gold, { at: [2.2 + i * 0.3, y0 + 0.84, 0.3], segs: 6 });
    b.box(0.5, 0.25, 0.35, P.oakDark, { at: [3.1, y0 + 0.84, 0.5] }); // strongbox

    // the bronze boar on the south side, from about 1640 (built last, so nothing else moves)
    if (b.since(1640)) boarFountain(b, [5.8, 0.1, 9.8], 0);
  },
};
