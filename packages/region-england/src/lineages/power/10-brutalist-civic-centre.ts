import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { TOWER, clockTower } from './shared';

/** Fine horizontal lines on a concrete surface: the imprint of the timber boards it was cast against. */
function boardMarks(b: Builder, w: number, d: number, y0: number, y1: number, at: [number, number], color: number, step = 0.6) {
  for (let y = y0 + step; y < y1 - 0.1; y += step) {
    b.box(w + 0.03, 0.04, d + 0.03, color, { at: [at[0], y, at[1]], jitter: false });
  }
}

export const brutalistCivicCentre: BuildingDef = {
  id: 'brutalist-civic-centre',
  name: 'Civic centre',
  style: 'Brutalist',
  date: '1967',
  summary:
    'Local government has grown into a large employer, and the cramped Victorian town hall is pulled down for a civic centre. In this town, protests from the townspeople save its clock tower alone. ' +
    'Offices go in a long slab lifted on pilotis, the councillors meet in a drum-shaped chamber, and both stand on a raised plaza that keeps people above the traffic. ' +
    'Everything is cast in raw concrete that still shows the grain of the timber boards it was poured against, seen by its architects as an honest material for a confident welfare state.',
  materials: ['board-marked in-situ concrete', 'precast concrete fins', 'aluminium-framed glazing', 'asphalt roofs'],
  lookFor: [
    { label: 'Pilotis', note: 'The office slab stands on rows of concrete stilts, leaving the ground beneath open, an idea taken from Le Corbusier.', at: [-6, 3.6, -9.6] },
    { label: 'Board-marked concrete', note: 'The faint horizontal lines are the imprint of the timber shuttering boards the concrete was poured into.', at: [11, 6.6, 9.6] },
    { label: 'Council chamber drum', note: 'The debating chamber is expressed as a separate round form, so you can read what happens inside from outside.', at: [11, 11.6, 3] },
    { label: 'Raised plaza', note: 'A paved deck lifted above street level, reached by broad steps: the town square remade as a podium.', at: [2, 2.2, 13] },
    { label: 'Retained clock tower', note: 'The tower of the 1874 town hall, kept as a landmark when the rest was demolished.', at: [TOWER.x - TOWER.w / 2 - 0.3, 22, TOWER.z] },
  ],
  influences: ['corbusian-brutalism'],
  build(b) {
    const conc = tint(P.concrete, b.range(-0.02, 0.02));
    const lines = tint(conc, -0.07);
    const dark = P.glassDark;

    // the Victorian clock tower, kept
    clockTower(b, { brick: tint(P.brickRed, -0.04), stone: tint(P.sandstone, -0.04) });

    // ---------------------------------------------------------- raised plaza
    const PY = 1.5;
    const PX0 = -6.4;
    const PX1 = 21.4;
    const PZ0 = -21;
    const PZ1 = 13.4;
    const pw = PX1 - PX0;
    const pd = PZ1 - PZ0;
    const pcx = (PX0 + PX1) / 2;
    const pcz = (PZ0 + PZ1) / 2;
    b.box(pw, PY, pd, conc, { at: [pcx, 0, pcz] });
    boardMarks(b, pw, pd, 0, PY, [pcx, pcz], lines, 0.5);
    b.box(pw - 0.2, 0.04, pd - 0.2, mix(P.paving, P.concrete, 0.4), { at: [pcx, PY, pcz], jitter: false });
    // broad steps up from the street, and a parapet round the plaza edge
    b.stairs(14, PY, 3.2, 6, conc, { at: [6, 0, PZ1 + 1.6] });
    b.box(pw, 1.0, 0.35, conc, { at: [pcx, PY, PZ0 + 0.2] });
    b.box(0.35, 1.0, pd - 0.4, conc, { at: [PX1 - 0.2, PY, pcz] });
    b.box(0.35, 1.0, 20, conc, { at: [PX0 + 0.2, PY, PZ0 + 10.4] });
    b.box(5.6, 1.0, 0.35, conc, { at: [PX0 + 3, PY, PZ1 - 0.2] });
    b.box(5.8, 1.0, 0.35, conc, { at: [PX1 - 3, PY, PZ1 - 0.2] });
    // ramp down on the left side, by the old tower
    b.box(3, 0.2, 9, conc, { at: [PX0 - 1.5, 0, -1], rot: [0, 0, 0] });
    b.shed(3, 9, PY, conc, { at: [PX0 - 1.5, 0, 4.2], high: '-z' });
    b.box(3, PY, 4.4, conc, { at: [PX0 - 1.5, 0, -2.6] });
    b.deck(pw, pd, PY, { at: [pcx, 0, pcz] });
    // planters with shrubs
    for (const [x, z] of [[-1, 8], [2.6, 8], [18, -3], [18, 1.6]] as [number, number][]) {
      b.box(2.4, 0.8, 2.4, conc, { at: [x, PY, z] });
      b.blob(1.0, P.leafDark, { at: [x, PY + 1.2, z], stretch: [1.1, 0.7, 1.1] });
    }

    // ---------------------------------------------------------- the office slab on pilotis
    const SX0 = -19;
    const SX1 = 14;
    const SL = SX1 - SX0;
    const SXC = (SX0 + SX1) / 2;
    const SZ = -13.6;
    const SD = 11;
    const LIFT = 7.2; // underside of the first office floor
    const FL = 3.4;
    const NF = 5;
    const TOP = LIFT + FL * NF;
    // pilotis: two rows of tapering piers
    for (const x of spread(7, SX0 + 2, SX1 - 2)) {
      for (const z of [SZ - 3.4, SZ + 3.4]) {
        b.box(0.9, LIFT, 1.3, conc, { at: [x, 0, z] });
        b.box(1.4, 0.6, 1.8, conc, { at: [x, LIFT - 0.6, z] });
      }
    }
    // transfer floor and the slab itself
    b.box(SL, 1.0, SD, conc, { at: [SXC, LIFT, SZ] });
    b.box(SL - 0.6, FL * NF - 1.0, SD - 0.6, dark, { at: [SXC, LIFT + 1, SZ], mat: 'glass' });
    for (let f = 1; f <= NF; f++) {
      const y = LIFT + f * FL - 1.0;
      b.box(SL, 1.0, SD, conc, { at: [SXC, y, SZ] }); // spandrel band
      b.box(SL + 0.04, 0.04, SD + 0.04, lines, { at: [SXC, y + 0.5, SZ], jitter: false });
    }
    // precast fins at close centres on the long faces, end walls blank
    for (const x of spread(23, SX0 + 0.7, SX1 - 0.7)) {
      for (const s of [1, -1]) b.box(0.22, FL * NF - 1.0, 0.6, conc, { at: [x, LIFT + 1, SZ + s * (SD / 2 + 0.1)] });
    }
    b.sym((s) => {
      const ex = s > 0 ? SX1 : SX0;
      b.box(0.8, FL * NF + 0.4, SD, conc, { at: [ex, LIFT, SZ] });
      boardMarks(b, 0.8, SD, LIFT, TOP + 0.4, [ex, SZ], lines);
    });
    // roof plant room and lift motor house
    b.box(SL, 0.5, SD, conc, { at: [SXC, TOP, SZ] });
    b.box(9, 3.2, 6, conc, { at: [SXC + 4, TOP + 0.5, SZ] });
    boardMarks(b, 9, 6, TOP + 0.5, TOP + 3.7, [SXC + 4, SZ], lines);
    // service core: stairs and lifts, a solid concrete tower at the east end
    const CX = SX1 + 2.6;
    b.box(4.6, TOP + 3.6, 6, conc, { at: [CX, 0, SZ] });
    boardMarks(b, 4.6, 6, PY, TOP + 3.6, [CX, SZ], lines);
    b.box(0.6, TOP - 2, 0.3, dark, { at: [CX, LIFT, SZ + 3.0], mat: 'glass' });
    // glazed entrance lobby under the slab
    b.box(8, 3.2, 5, mix(dark, P.glass, 0.3), { at: [SXC + 6, PY, SZ], mat: 'glass' });
    b.box(8.4, 0.4, 5.4, conc, { at: [SXC + 6, PY + 3.2, SZ] });

    // ---------------------------------------------------------- the council chamber drum
    const DX = 11;
    const DZ = 3;
    const DR = 7.2;
    b.cyl(DR - 1.6, 3.6, mix(dark, P.glass, 0.3), { at: [DX, PY, DZ], segs: 20, mat: 'glass' });
    b.cyl(DR, 7.4, conc, { at: [DX, PY + 3.6, DZ], segs: 20 });
    for (let y = PY + 3.6 + 0.6; y < PY + 11; y += 0.6) b.cyl(DR + 0.02, 0.04, lines, { at: [DX, y, DZ], segs: 20 });
    // vertical slit windows round the drum
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.panel(0.35, 4.6, dark, { at: [DX + Math.sin(a) * DR, PY + 4.8, DZ + Math.cos(a) * DR], facing: a });
    }
    // flat roof with a raised rooflight
    b.cyl(DR + 0.3, 0.6, conc, { at: [DX, PY + 11, DZ], segs: 20 });
    b.cyl(2.6, 1.2, conc, { at: [DX, PY + 11.6, DZ], segs: 10, rTop: 1.6 });
    // the bridge linking the drum to the office slab
    b.box(3, 1.4, SZ + SD / 2 - DZ + DR - 0.6, conc, { at: [DX - 2, PY + 6.2, (SZ + SD / 2 + DZ - DR) / 2 + 0.2] });
    b.box(2.8, 1.6, SZ + SD / 2 - DZ + DR - 0.6, dark, { at: [DX - 2, PY + 7.6, (SZ + SD / 2 + DZ - DR) / 2 + 0.2], mat: 'glass' });
    b.box(3, 0.4, SZ + SD / 2 - DZ + DR - 0.6, conc, { at: [DX - 2, PY + 9.2, (SZ + SD / 2 + DZ - DR) / 2 + 0.2] });

    // ---------------------------------------------------------- the left side: grass, trees and the tower
    b.box(14, 0.04, 30, tint(P.grass, 0.02), { at: [-14.6, 0, -2], jitter: false });
    b.tree(7, { at: [-18, 0, 2], kind: 'round' });
    b.tree(6.5, { at: [-16, 0, -5], kind: 'round' });

    // colliders: the plaza is a deck; the solid parts are the drum, the core, the lobby, the tower
    b.collider(DR * 2, DR * 2, { at: [DX, 0, DZ] });
    b.collider(4.6, 6, { at: [CX, 0, SZ] });
    b.collider(8, 5, { at: [SXC + 6, 0, SZ] });
    b.collider(TOWER.w + 0.6, TOWER.w + 0.6, { at: [TOWER.x, 0, TOWER.z] });
    for (const x of spread(7, SX0 + 2, SX1 - 2)) for (const z of [SZ - 3.4, SZ + 3.4]) b.collider(0.9, 1.3, { at: [x, 0, z] });
  },
};
