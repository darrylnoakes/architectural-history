import { P, tint, type BuildingDef } from '@ah/kit';
import { archPts, archRing, balustrade, band, col, dormer, fenetre, lowWall, mansard, onFace, parterre, pediment, plate, topiary, type Face } from './shared';

export const hotelParticulier: BuildingDef = {
  id: 'hotel-particulier',
  name: 'Hôtel between court and garden',
  style: 'Louis XIV (French classical)',
  date: 'c. 1705',
  summary:
    'The finished form of the French town palace, the hôtel particulier "entre cour et jardin". From the street there is only a wall and a great carriage gate; inside, a paved court of honour with stables and kitchens in low wings, and across its end the main block, which turns its private side to a formal garden behind. ' +
    'Everything is ordered and symmetrical: a centre bay brought forward under a pediment, tall windows with curved heads and carved keystones, a ground floor scored with horizontal channels like rusticated masonry, and a broken-pitched mansard roof of slate with dormers, which gives a full storey of rooms in the roof. ' +
    'In the provinces the type follows Paris within a generation or so, often built by Parisian architects.',
  materials: ['dressed limestone', 'slate', 'lead', 'wrought iron', 'gravel and clipped box'],
  modelledOn: 'The Hôtel de Soubise (Pierre-Alexis Delamair, 1705 to 1709) and the Hôtel Matignon (Jean Courtonne, finished by Antoine Mazin, 1722 to 1725), Paris: the gate in a screen wall, the court of honour, the pedimented centre and the garden front. Much reduced; the details are generic',
  lookFor: [
    { label: 'Carriage gate (porte cochère)', note: 'A great arched gate in the street wall, wide enough for a coach and six, between columns under a pediment.', at: [0, 5.8, 12.2] },
    { label: 'Court of honour (cour d’honneur)', note: 'The paved forecourt where carriages turned, between the low wings of the stables and kitchens.', at: [0, 0.6, 6.0] },
    { label: 'Centre bay with pediment (avant-corps)', note: 'The middle three bays stand forward under a triangular pediment carved with the family arms.', at: [0, 10.6, 2.6] },
    { label: 'Mansard roof', note: 'A roof broken into a steep lower slope with dormers and a flat upper one: a full storey of rooms under the slates. Named after François Mansart.', at: [-6.6, 11.6, 1.2] },
    { label: 'Parterre de broderie', note: 'Beds of low clipped box laid out in curling patterns on gravel, meant to be seen from the windows above.', at: [-5.5, 0.6, -9.6] },
  ],
  build(b) {
    const stone = b.pick([P.pierreBlonde, P.craie, tint(P.pierreBlonde, 0.03)]);
    const dress = tint(stone, 0.04);
    const slate = b.pick([P.ardoise, P.slateBlue]);
    const door = b.pick([P.doorGreen, P.oakDark, P.voletGris, P.doorBlue]);
    const W = 20; // main block width
    const D = 8.4;
    const zC = 1.8; // court face
    const zG = zC - D; // garden face, -6.6
    const G = 4.6;
    const F = 4.4;
    const H = G + F; // 9.0
    const X = 11.5;
    const zS = 11.6;
    const xs = [-8.4, -5.6, -2.8, 0, 2.8, 5.6, 8.4];
    const acW = 8.6; // the avant-corps
    const acP = 0.5;
    const dOpts = { stone: dress, roof: slate, bar: P.white };

    // ---- the main block
    const mzc = (zC + zG) / 2;
    b.box(W, H, D, stone, { at: [0, 0, mzc] });
    b.collider(W, D + 2 * acP, { at: [0, 0, mzc] });
    b.box(W + 0.2, 0.6, D + 0.2, tint(stone, -0.06), { at: [0, 0, mzc] });
    // the avant-corps on both fronts
    for (const s of [1, -1]) b.box(acW, H, acP, stone, { at: [0, 0, s > 0 ? zC + acP / 2 : zG - acP / 2] });
    // the cornice all round
    b.box(W + 0.5, 0.45, D + 0.5, dress, { at: [0, H - 0.1, mzc] });
    for (const s of [1, -1]) b.box(acW + 0.5, 0.45, acP + 0.25, dress, { at: [0, H - 0.1, s > 0 ? zC + acP / 2 + 0.12 : zG - acP / 2 - 0.12] });
    // the mansard roof
    mansard(b, W, D, 3.3, 1.5, 1.2, slate, { at: [0, H + 0.35, mzc], ov: 0.15 });
    for (const x of [-6.0, 6.0]) {
      b.chimney(1.6, 6.0, 0.8, dress, { at: [x, H + 1.0, mzc] });
    }

    /** One face of the main block: channelled ground floor, tall windows, the pediment, dormers. */
    const front = (f: Face, z: number, garden: boolean) =>
      onFace(b, f, [0, 0, z], () => {
        // horizontal channels (refends) across the ground floor
        for (let i = 1; i < 9; i++) b.box(W, 0.05, 0.03, tint(stone, -0.12), { at: [0, 0.6 + i * 0.45, 0.015], jitter: false });
        for (let i = 1; i < 9; i += 2) b.box(acW, 0.05, 0.03, tint(stone, -0.12), { at: [0, 0.6 + i * 0.45, acP + 0.015], jitter: false });
        band(b, -W / 2, W / 2, G - 0.1, 0.3, 0.14, dress);
        band(b, -acW / 2, acW / 2, G - 0.1, 0.3, acP + 0.14, dress);
        for (const x of xs) {
          const zz = Math.abs(x) < acW / 2 ? acP : 0;
          b.group({ at: [0, 0, zz] }, () => {
            if (x === 0 && !garden) {
              // the main door: round-headed, glazed above, up a short flight of steps
              fenetre(b, 0, 0.6, 1.8, 3.6, dress, { shape: 'round', key: true, cols: 2, rows: 5, glass: door, bar: tint(door, 0.15), sill: false });
            } else {
              fenetre(b, x, 0.6, 1.4, 3.4, dress, { shape: 'segmental', key: true, cols: 2, rows: 4, sill: false });
            }
            fenetre(b, x, G + 0.5, 1.4, 3.0, dress, { shape: 'segmental', key: true, cols: 2, rows: 3 });
            // a low wrought-iron rail across each upper window
            b.box(1.5, 0.05, 0.05, P.iron, { at: [x, G + 1.35, 0.2], jitter: false });
          });
        }
        // the end bays marked by flat strips (chaînes) of smooth stone
        for (const s of [-1, 1]) b.box(0.7, H - 0.6, 0.06, dress, { at: [s * (W / 2 - 0.35), 0.6, 0.03] });
        for (const s of [-1, 1]) b.box(0.5, H - 0.6, 0.06, dress, { at: [s * (acW / 2 - 0.25), 0.6, acP + 0.03] });
        // the pediment over the avant-corps, with a cartouche of arms
        pediment(b, 0, H + 0.35, acW + 0.4, 2.0, 'tri', dress, 0.45, acP - 0.1);
        b.box(1.0, 1.0, 0.2, tint(stone, 0.06), { at: [0, H + 0.6, acP + 0.3] });
        // steps (perron)
        b.stairs(garden ? 4.0 : 3.0, 0.6, 1.4, 3, dress, { at: [0, 0, acP + 0.7] });
        // dormers on the mansard, between the pediment and the ends
        for (const x of xs) {
          if (Math.abs(x) < acW / 2) continue;
          b.group({ at: [0, 0, -0.1] }, () => dormer(b, 'mansard', x, H + 0.8, 1.0, 1.5, { ...dOpts, ped: Math.abs(x) > 6 ? 'seg' : undefined }));
        }
      });
    front('+z', zC, false);
    front('-z', zG, true);
    // end walls: blind, with the chaîne strips and an oeil-de-boeuf in the roof
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, mzc], () => {
        band(b, -D / 2, D / 2, G - 0.1, 0.3, 0.14, dress);
        fenetre(b, 0, G + 0.5, 1.4, 3.0, dress, { shape: 'segmental', key: true, cols: 2, rows: 4 });
        b.group({ at: [0, 0, -0.1] }, () => dormer(b, 'oeil', 0, H + 1.2, 1.1, 1.1, dOpts));
      });
    }

    // ---- the wings round the court: stables (left) and kitchens (right)
    const wW = 3.6;
    const wz0 = zC + 0.4;
    const wz1 = zS - 0.4;
    const wL = wz1 - wz0;
    const wzc = (wz0 + wz1) / 2;
    const wH = 4.4;
    for (const s of [-1, 1] as const) {
      const cx = s * (X - wW / 2);
      b.box(wW, wH, wL, stone, { at: [cx, 0, wzc] });
      b.collider(wW, wL, { at: [cx, 0, wzc] });
      b.box(wW + 0.3, 0.3, wL + 0.3, dress, { at: [cx, wH - 0.1, wzc] });
      b.hip(wW, wL, 2.4, slate, { at: [cx, wH + 0.2, wzc], overhang: 0.2 });
      onFace(b, s > 0 ? '-x' : '+x', [s * (X - wW), 0, wzc], () => {
        for (let i = 2; i < 8; i += 2) b.box(wL, 0.05, 0.03, tint(stone, -0.12), { at: [0, 0.2 + i * 0.5, 0.015], jitter: false });
        for (const x of [-3.0, 0, 3.0]) {
          if (s < 0 && x !== 0) {
            archRing(b, x, 0, 2.4, 3.4, 0.25, 0.08, dress, 0, 'segmental');
            plate(b, archPts(x, 0, 2.4, 3.4, 'segmental', 6), 0.06, door);
          } else fenetre(b, x, 0.9, 1.2, 2.6, dress, { shape: 'segmental', key: true, cols: 2, rows: 3 });
        }
        b.group({ at: [0, 0, 0.0] }, () => dormer(b, 'oeil', 0, wH + 0.3, 0.9, 0.9, dOpts));
      });
    }

    // ---- the street wall and its great gate
    const gw = 6.4;
    b.sym((s) => {
      lowWall(b, s * (gw / 2), zS, s * (X - wW), zS, 4.4, stone, dress);
      b.collider(X - wW - gw / 2, 0.6, { at: [s * ((X - wW + gw / 2) / 2), 0, zS] });
      b.box(wW, wH + 0.2, 0.6, stone, { at: [s * (X - wW / 2), 0, zS] });
    });
    b.archWall(gw, 7.2, 1.0, stone, { at: [0, 0, zS], openings: 1, openW: 3.8, openH: 5.4, shape: 'round' });
    b.sym((s) => b.collider(1.2, 1.2, { at: [s * (gw / 2 - 0.6), 0, zS] }));
    for (const f of ['+z', '-z'] as const) {
      onFace(b, f, [0, 0, zS + (f === '+z' ? 0.5 : -0.5)], () => {
        for (const sx of [-1, 1]) for (let i = 2; i < 10; i += 2) b.box(1.1, 0.05, 0.03, tint(stone, -0.12), { at: [sx * 2.55, i * 0.5, 0.015], jitter: false });
        archRing(b, 0, 0, 3.8, 5.4, 0.35, 0.12, dress);
        b.box(0.6, 1.0, 0.25, dress, { at: [0, 5.1, 0.1], jitter: false });
        if (f === '+z') for (const s of [-1, 1]) col(b, s * 2.75, 0.4, 0.28, 5.6, dress, { cap: 'doric', segs: 8 });
        band(b, -gw / 2 - 0.2, gw / 2 + 0.2, 5.6, 0.7, f === '+z' ? 0.85 : 0.3, dress);
        pediment(b, 0, 6.3, gw + 0.4, 1.4, 'tri', dress, 0.5);
      });
    }
    // the gate leaves, folded back inside
    b.sym((s) => b.box(1.9, 4.4, 0.12, door, { at: [s * 2.0, 0, zS - 1.2], rotY: s * 1.35 }));

    // ---- the court of honour
    b.box(2 * (X - wW), 0.05, zS - zC, P.paving, { at: [0, 0, (zS + zC) / 2] });
    for (let i = 1; i < 6; i++) b.box(2 * (X - wW), 0.06, 0.08, P.cobble, { at: [0, 0, zC + i * ((zS - zC) / 6)] });
    // a pair of stone posts (bornes) guarding the gate jambs
    b.sym((s) => b.cyl(0.25, 0.7, dress, { at: [s * 2.1, 0, zS + 0.8], segs: 6, rTop: 0.18 }));

    // ---- the garden: parterres de broderie, gravel walks, clipped yews, a terrace balustrade
    const gz0 = zG - 0.6;
    const gz1 = -12.5;
    b.box(2 * X, 0.04, gz0 - gz1, P.gravel, { at: [0, 0, (gz0 + gz1) / 2] });
    b.sym((s) => parterre(b, s * 5.2, (gz0 + gz1) / 2 - 0.4, 7.4, 4.6, { scroll: true }));
    for (const x of [-9.8, -0.9, 0.9, 9.8]) topiary(b, x, -11.9, 2.0);
    b.cyl(1.0, 0.4, dress, { at: [0, 0, -9.6], segs: 10 });
    b.cyl(0.85, 0.42, P.water, { at: [0, 0, -9.6], segs: 10, mat: 'glass' });
    b.cyl(0.08, 1.1, dress, { at: [0, 0.4, -9.6], segs: 5 });
    onFace(b, '-z', [0, 0, -12.6], () => balustrade(b, -X, X, 0, dress, { step: 0.9, h: 0.9 }));
    b.collider(2 * X, 0.4, { at: [0, 0, -12.6] });
    b.sym((s) => lowWall(b, s * X, gz0, s * X, -12.6, 2.6, stone, dress));
  },
};

