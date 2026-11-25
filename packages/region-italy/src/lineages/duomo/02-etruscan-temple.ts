import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { ALTAR_Z, oldAltar, statue } from './shared';

/** Temple centre and size: almost square, on a podium, front at +Z. */
const TZ = -3.5;
const W = 17;
const D = 19;
const PH = 1.8; // podium height
const COL_H = 6.4;
const ROOF_Y = PH + COL_H + 0.9;
const RISE = 3.0;
const OV = 2.2; // the wide eaves

const TUFA = P.tufa;
const PLASTER = mix(P.plaster, P.ochreWash, 0.25);
const RED = P.terracottaPainted;
const CREAM = P.cream;
const BLACK = 0x2c2622;

export const etruscanTemple: BuildingDef = {
  id: 'etruscan-temple',
  name: 'Etruscan temple',
  style: 'Etruscan (Tuscan temple)',
  date: 'c. 500 BC',
  summary:
    'The first temple on the site, built when the town was Etruscan or under Etruscan influence, behind the altar of the old open-air sanctuary, which stays in use before its stair. It stands on a high podium of tufa and can only be approached from the front, by a single flight of steps: unlike a Greek temple, it has a front and a back. ' +
    'The front half is a deep porch of widely spaced, unfluted columns; the back half holds three rooms (cellae) for three gods, behind three doors. ' +
    'Only the podium is stone. Walls are mud brick on a stone footing, the columns and beams are timber or plastered tufa, and the wide, low roof is protected by brightly painted terracotta plaques, antefixes along the eaves and life-size clay statues standing on the ridge.',
  materials: ['tufa podium', 'mud brick and plaster', 'timber', 'painted terracotta', 'clay roof tiles'],
  lookFor: [
    { label: 'Podium and front stair', note: 'A high platform you can climb only at the front, the Italian way; Greek temples have steps all round.', at: [0, 1.2, TZ + D / 2 + 2.6] },
    { label: 'Deep porch', note: 'Two rows of four columns fill the whole front half of the temple, the setting for the rites at the altar in front.', at: [W / 2 - 1, 4.5, TZ + 5.5] },
    { label: 'Tuscan columns', note: 'Plain, unfluted columns with a simple round cap and base, set far apart because the beams they carry are timber.', at: [-3.2, 5.0, TZ + D / 2 - 0.8] },
    { label: 'Wide eaves', note: 'The roof overhangs by two metres all round to keep rain off the mud-brick walls.', at: [-W / 2 - OV + 0.3, ROOF_Y - 0.5, TZ - 4] },
    { label: 'Ridge statues', note: 'Painted clay gods striding along the ridge, as at Veii, where the famous Apollo stood on the roof.', at: [0, ROOF_Y + RISE + 2.3, TZ - 1] },
  ],
  modelledOn: 'The Portonaccio temple at Veii (late sixth century BC); the two rows of four porch columns and the three cellae follow the Tuscan plan described by Vitruvius, since how Veii’s own front and rooms were laid out is still debated',
  influences: ['greek-colonies', 'etruscan-legacy'],
  build(b) {
    const front = TZ + D / 2;
    const back = TZ - D / 2;
    // the podium with a heavy rounded moulding near the top
    b.box(W + 0.6, 0.35, D + 0.6, tint(TUFA, -0.05), { at: [0, 0, TZ] });
    b.box(W, PH, D, TUFA, { at: [0, 0, TZ] });
    b.box(W + 0.5, 0.45, D + 0.5, tint(TUFA, 0.05), { at: [0, PH - 0.75, TZ] });
    b.box(W + 0.2, 0.2, D + 0.2, tint(TUFA, 0.08), { at: [0, PH - 0.2, TZ] });
    b.stairs(9, PH, 3.4, 7, tint(TUFA, 0.04), { at: [0, 0, front + 1.7] });

    // three cellae across the back half: a stone footing, then plastered mud brick
    const cFront = TZ - 0.5;
    const cd = cFront - (back + 0.4);
    const cc = (cFront + back + 0.4) / 2;
    b.box(W - 0.6, 0.9, cd, TUFA, { at: [0, PH, cc] });
    b.box(W - 0.8, COL_H - 0.9, cd - 0.2, PLASTER, { at: [0, PH + 0.9, cc] });
    // three doors, the central one widest
    for (const [x, w, h] of [[0, 2.4, 4.4], [-5.6, 1.6, 3.4], [5.6, 1.6, 3.4]] as const) {
      b.box(w + 0.5, h + 0.3, 0.1, RED, { at: [x, PH, cFront - 0.08], jitter: false });
      b.box(w, h, 0.12, P.oakDark, { at: [x, PH, cFront - 0.05], jitter: false });
    }
    // side walls run forward as antae to frame the porch
    b.sym((s) => b.box(0.7, COL_H, 1.6, PLASTER, { at: [s * (W / 2 - 0.7), PH, cFront + 0.8] }));

    // the porch: two rows of four widely spaced Tuscan columns
    const xs = [-W / 2 + 1.2, -3.2, 3.2, W / 2 - 1.2];
    for (const z of [front - 1.2, front - 5.4]) {
      for (const x of xs) b.column(0.5, COL_H, PLASTER, { at: [x, PH, z], order: 'tuscan', segs: 9 });
    }

    // the timber entablature cased in painted terracotta plaques
    b.box(W + 0.2, 0.9, D, CREAM, { at: [0, PH + COL_H, TZ] });
    b.box(W + 0.3, 0.42, D + 0.1, RED, { at: [0, PH + COL_H + 0.45, TZ], jitter: false });
    b.box(W + 0.34, 0.1, D + 0.14, BLACK, { at: [0, PH + COL_H + 0.32, TZ], jitter: false });

    // the low roof with wide eaves; the front gable is open, showing the beam ends
    b.gable(W, D, RISE, P.romanTile, { ridge: 'z', at: [0, ROOF_Y, TZ], overhang: OV, wall: tint(P.oakDark, 0.1) });
    const gz = front + OV - 0.15;
    // the ridge beam (columen) and two side beams (mutuli), their ends faced with painted plaques
    b.box(0.6, 0.8, OV, P.oak, { at: [0, ROOF_Y + RISE - 1.2, front + OV / 2 - 0.15] });
    b.sym((s) => b.box(0.5, 0.6, OV, P.oak, { at: [s * 4.1, ROOF_Y + 0.5, front + OV / 2 - 0.5] }));
    b.box(1.0, 0.9, 0.12, RED, { at: [0, ROOF_Y + RISE - 1.25, gz], jitter: false });
    b.box(0.7, 0.55, 0.14, CREAM, { at: [0, ROOF_Y + RISE - 1.1, gz + 0.02], jitter: false });
    b.sym((s) => {
      b.box(0.8, 0.6, 0.12, RED, { at: [s * 4.1, ROOF_Y + 0.55, gz - 0.4], jitter: false });
      b.box(0.5, 0.35, 0.14, CREAM, { at: [s * 4.1, ROOF_Y + 0.65, gz - 0.38], jitter: false });
    });
    // raking sima along the front gable
    b.sym((s) => b.beam([s * (W / 2 + OV), ROOF_Y - 0.65, front + OV], [0, ROOF_Y + RISE + 0.15, front + OV], 0.25, 0.45, RED));

    // antefixes: painted plaques standing along both eaves
    const eaveY = ROOF_Y - (OV * RISE) / (W / 2) + 0.05;
    for (let i = 0; i < 16; i++) {
      const z = back - OV + 0.5 + ((D + 2 * OV - 1.0) * i) / 15;
      b.sym((s) => {
        b.box(0.08, 0.5, 0.36, i % 2 ? RED : CREAM, { at: [s * (W / 2 + OV + 0.05), eaveY, z], jitter: false });
      });
    }

    // terracotta gods on the ridge, and a disc acroterion at the front
    const ridgeY = ROOF_Y + RISE + 0.12;
    for (const z of [TZ + 6.5, TZ + 1.5, TZ - 3.5, TZ - 8.0]) {
      b.box(0.5, 0.25, 1.1, tint(RED, 0.1), { at: [0, ridgeY, z] });
      statue(b, [0, ridgeY + 0.25, z], 2.0, mix(RED, P.terracotta, 0.5));
    }
    b.cyl(0.75, 0.12, RED, { at: [0, ridgeY + 0.6, front + OV - 0.1], rot: [Math.PI / 2, 0, 0], segs: 10 });

    // the old altar of the open-air sanctuary, kept in front of the stair, and the sacred pool beside the temple
    oldAltar(b, TUFA);
    b.box(7.0, 0.4, 3.6, tint(TUFA, -0.04), { at: [-12.0, 0, TZ - 4] });
    b.box(6.2, 0.05, 2.8, P.water, { at: [-12.0, 0.36, TZ - 4], mat: 'glass', jitter: false });
    b.box(22, 0.04, 34, mix(P.earth, P.grassDry, 0.5), { at: [0, 0, TZ + 4], jitter: false });
    b.tree(9, { at: [12.5, 0, -16], kind: 'round', color: tint(P.leafDark, -0.06) });
    b.tree(8, { at: [-12.5, 0, -17], kind: 'round', color: tint(P.leafDark, -0.06) });
    b.tree(5, { at: [12.0, 0, 14], kind: 'olive' });

    b.collider(W, D + 3.4, { at: [0, 0, TZ + 1.7] });
    b.collider(3.2, 2.2, { at: [0, 0, ALTAR_Z] });
  },
};
