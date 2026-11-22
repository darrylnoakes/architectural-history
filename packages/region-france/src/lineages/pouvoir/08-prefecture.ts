import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { HALL, TRICOLOUR, ZC, civicCentre, column, flag, flatArch, pave, rectCollider, square, win } from './shared';

/** The central block with its temple front, and the two plain wings. */
export const PRF = { x0: 6.5, x1: 16.5, z0: -12, z1: 1.5, pod: 1.4, colH: 7.6, ent: 1.5, ped: 2.3, porch: 4.2, steps: 3.0 };
export const WINGS = { z0: -11, z1: 0, h: 8.6 };
const XC = (PRF.x0 + PRF.x1) / 2;
const ENT_Y = PRF.pod + PRF.colH;
const TOP = ENT_Y + PRF.ent;

const stone = mix(P.pierreBlonde, P.craie, 0.25);
const dark = tint(stone, -0.08);

/**
 * The law court and prefecture: a raised central block fronted by a temple portico of six Greek Doric
 * columns under a pediment, with long plain wings to each side, all in cut stone.
 */
export function prefecture(b: Builder): void {
  const { x0, x1, z0, z1, pod, colH, ent, ped, porch, steps } = PRF;
  const W = x1 - x0;
  const pz = z1 + porch; // front of the portico
  // the podium under the centre and the portico, and the flight of steps
  b.box(W, pod, pz - z0, dark, { at: [XC, 0, (z0 + pz) / 2] });
  b.stairs(W - 0.6, pod, steps, 6, dark, { at: [XC, 0, pz + steps / 2] });
  // the central hall (the salle des pas perdus) behind the portico
  b.box(W, TOP - pod, z1 - z0, stone, { at: [XC, pod, (z0 + z1) / 2] });
  // six Greek Doric columns, no bases, and the entablature with triglyphs
  for (const x of spread(6, x0 + 0.75, x1 - 0.75)) column(b, [x, pod, pz - 0.7], 0.48, colH, stone, { order: 'doric', segs: 8, base: false });
  for (const x of [x0 + 0.75, x1 - 0.75]) column(b, [x, pod, z1 + 1.2], 0.48, colH, stone, { order: 'doric', segs: 8, base: false });
  b.box(W, ent * 0.45, porch + 0.2, stone, { at: [XC, ENT_Y, z1 + porch / 2] });
  b.box(W + 0.1, ent * 0.45, porch + 0.3, tint(stone, 0.02), { at: [XC, ENT_Y + ent * 0.45, z1 + porch / 2] });
  for (const x of spread(11, x0 + 0.5, x1 - 0.5)) b.box(0.36, ent * 0.4, 0.06, dark, { at: [x, ENT_Y + ent * 0.48, pz + 0.12], jitter: false });
  b.box(W + 0.5, ent * 0.12, porch + 0.6, dark, { at: [XC, TOP - ent * 0.1, z1 + porch / 2], jitter: false });
  // the inscription over the door: PALAIS DE JUSTICE in bronze letters (here a bronze strip)
  b.box(5.4, 0.35, 0.05, P.bronze, { at: [XC, ENT_Y + 0.2, pz + 0.12], jitter: false });
  // the pediment and the low roof behind it
  b.extrude([[-W / 2 - 0.25, 0], [W / 2 + 0.25, 0], [0, ped]], 0.6, stone, { at: [XC, TOP, pz - 0.1] });
  b.extrude([[-W / 2 + 0.6, 0.25], [W / 2 - 0.6, 0.25], [0, ped - 0.45]], 0.1, dark, { at: [XC, TOP, pz + 0.22], jitter: false });
  b.gable(W + 0.5, pz - z0, ped, P.ardoise, { at: [XC, TOP, (z0 + pz) / 2 - 0.05], ridge: 'z', wall: stone, thick: 0.15 });
  // a figure of Justice with her scales on the apex (acroterion)
  b.cyl(0.25, 1.6, stone, { at: [XC, TOP + ped, pz - 0.2], rTop: 0.15, segs: 6 });
  b.box(1.2, 0.06, 0.06, P.bronze, { at: [XC, TOP + ped + 1.5, pz - 0.2], jitter: false });
  // the great door and windows in the back wall of the portico
  flatArch(b, 2.4, 4.6, P.doorGreen, { at: [XC, pod, z1], shape: 'rect', off: 0.05 });
  flatArch(b, 3.0, 5.0, dark, { at: [XC, pod, z1], shape: 'rect', off: 0.03 });
  for (const s of [-1, 1]) win(b, 1.2, 2.6, { at: [XC + s * 3.3, pod + 1.2, z1], frame: dark });
  // sides and back of the centre block, above the wings: tall plain windows (thermal light at the back)
  for (const s of [-1, 1]) for (const z of [z0 + 2, z0 + 6.5]) win(b, 1.4, 2.4, { at: [s > 0 ? x1 : x0, WINGS.h + 0.6, z], facing: s > 0 ? '+x' : '-x', frame: dark });
  flatArch(b, 4.0, 2.0, P.windowDark, { at: [XC, 6.0, z0], facing: '-z', shape: 'round', n: 3 });
  b.box(0.15, 2.0, 0.1, dark, { at: [XC - 0.7, 6.0, z0 - 0.1], jitter: false });
  b.box(0.15, 2.0, 0.1, dark, { at: [XC + 0.7, 6.0, z0 - 0.1], jitter: false });
  for (const x of [XC - 3.2, XC + 3.2]) win(b, 1.3, 2.6, { at: [x, pod + 1.0, z0], facing: '-z', frame: dark });
  flatArch(b, 1.6, 2.8, P.doorGreen, { at: [XC, 0, z0], facing: '-z', shape: 'rect', off: 0.05 });

  // ---- the plain wings: two storeys of offices, a band, a cornice, a low hipped roof
  for (const [a, c] of [[ZC.x0 + 1.0, x0], [x1, ZC.x1]]) {
    const w = c - a;
    const xc = (a + c) / 2;
    const zc = (WINGS.z0 + WINGS.z1) / 2;
    const D = WINGS.z1 - WINGS.z0;
    b.box(w, WINGS.h, D, stone, { at: [xc, 0, zc] });
    b.box(w + 0.15, 0.3, D + 0.15, dark, { at: [xc, 4.0, zc], jitter: false });
    b.box(w + 0.5, 0.45, D + 0.5, dark, { at: [xc, WINGS.h, zc], jitter: false });
    b.hip(w + 0.4, D + 0.4, 2.2, P.ardoise, { at: [xc, WINGS.h + 0.45, zc] });
    const nx = Math.max(2, Math.round(w / 2.6));
    for (const x of spread(nx, a + 1.3, c - 1.3)) {
      for (const [zf, f] of [[WINGS.z1, '+z'], [WINGS.z0, '-z']] as const) {
        win(b, 1.2, 2.3, { at: [x, 1.1, zf], facing: f, frame: dark });
        win(b, 1.2, 2.5, { at: [x, 4.9, zf], facing: f, frame: dark });
      }
    }
    // the outer end of each wing
    const ex = a < x0 ? a : c;
    const f = a < x0 ? '-x' : '+x';
    for (const z of spread(4, WINGS.z0 + 1.5, WINGS.z1 - 1.5)) {
      win(b, 1.2, 2.3, { at: [ex, 1.1, z], facing: f, frame: dark });
      win(b, 1.2, 2.5, { at: [ex, 4.9, z], facing: f, frame: dark });
    }
    rectCollider(b, a, c, WINGS.z0, WINGS.z1);
  }
  flag(b, [XC, TOP + 0.6, z0 + 1.2], 4.5, TRICOLOUR, { w: 1.8, h: 1.2 });
  // colliders: the centre block and podium sides; the portico floor is open to walkers between the columns
  rectCollider(b, x0, x1, z0, z1);
  for (const x of spread(6, x0 + 0.75, x1 - 0.75)) b.collider(1.0, 1.0, { at: [x, 0, pz - 0.7] });
  for (const x of [x0 + 0.75, x1 - 0.75]) b.collider(1.0, 1.0, { at: [x, 0, z1 + 1.2] });
  b.deck(W, porch, pod, { at: [XC, 0, z1 + porch / 2] });
}

export const prefectureDef: BuildingDef = {
  id: 'prefecture',
  name: 'Prefecture and law court',
  style: 'Neoclassical (Greek Revival)',
  date: 'c. 1835',
  summary:
    'The Revolution abolishes the provinces, the intendants and the old privileges of the towns, and divides France into departments. From 1800 Napoleon puts a prefect at the head of each, appointed by Paris and answerable to it, with a sub-prefect in each lesser town; the mayor, now appointed too, governs only the commune. ' +
    'Justice is reorganised in the same years with a court in each arrondissement. Prefects at first move into the intendance or the bishop’s palace, but by the 1830s the state is building, and its buildings are temples: a portico of six Greek Doric columns under a pediment on a flight of steps, with plain wings of offices either side. ' +
    'In most towns the prefecture and the law court were separate buildings; the model joins them under one roof for simplicity. The old town hall, the commune’s own, stands on beside them.',
  materials: ['limestone ashlar', 'slate', 'bronze', 'oak doors'],
  lookFor: [
    { label: 'Greek Doric portico', note: 'Six thick Doric columns standing without bases, in the Greek manner rather than the Roman, carry the entablature over a deep porch.', at: [PRF.x0 + 0.75, PRF.pod + 4.5, PRF.z1 + PRF.porch - 0.1] },
    { label: 'Pediment and triglyphs', note: 'A low triangular pediment crowns the front; the frieze below it is divided by triglyphs, the grooved blocks of the Doric order.', at: [XC, TOP + 0.9, PRF.z1 + PRF.porch + 0.3] },
    { label: 'Flight of steps', note: 'Justice and the state are raised above the street on a podium approached by a broad flight of steps, as a Greek temple was.', at: [XC + 3, 0.9, PRF.z1 + PRF.porch + PRF.steps * 0.6] },
    { label: 'Plain wings', note: 'Long office wings with rows of identical windows and almost no ornament: the bureaucracy of the department at work.', at: [PRF.x1 + 2.5, 3.2, WINGS.z1 + 0.3] },
    { label: 'Tricolour', note: 'The flag of the Revolution, restored in 1830, flies over the building of the state.', at: [XC + 1.1, TOP + 4.3, PRF.z0 + 1.2] },
  ],
  modelledOn:
    'Generic: the temple-fronted law courts and prefectures built across France between about 1810 and 1850, in the line of the Chamber of Deputies’ portico in Paris (Poyet, 1806 to 1810)',
  influences: ['neoclassicism'],
  build(b) {
    const alone = b.variant > 0;
    if (!alone) {
      square(b, -21.8, 21.8, HALL.z1, 'paving');
      civicCentre(b, 1835);
    } else {
      square(b, ZC.x0, ZC.x1, WINGS.z1, 'paving');
      pave(b, ZC.x0, ZC.x1, PRF.z0 - 1.5, WINGS.z1, mix(P.paving, P.gravel, 0.4), -0.01);
    }
    prefecture(b);
    // a row of clipped limes along the square's edge
    for (const x of [ZC.x0 + 1.5, ZC.x1 - 1.5]) b.tree(6, { kind: 'round', at: [x, 0, 17.5] });
  },
};
