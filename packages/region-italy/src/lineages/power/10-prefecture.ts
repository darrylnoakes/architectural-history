import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import {
  MON,
  MON_TOP,
  PAL,
  TRICOLORE,
  brickSquare,
  corbels,
  flag,
  flatArch,
  kingMonument,
  lordsColliders,
  lordsCourt,
  palaceColliders,
  palazzoPubblico,
  pave,
  rectWindow,
} from './shared';

/** The prefecture's block in zone C beside the old palace. */
export const PREF = { x0: 7.5, x1: 20.7, z0: -12, z1: 7, g: 5.4, n: 5.6, t: 4.4 };

/** A piano nobile window in a little temple frame: pilasters, an entablature and a pediment. */
function aedicule(b: Builder, at: [number, number, number], rotY: number, ped: 'tri' | 'seg', stone: number): void {
  b.group({ at, rotY }, () => {
    rectWindow(b, 1.3, 2.7, { at: [0, 0, 0], frame: stone, glass: P.windowDark, sill: true });
    for (const s of [-1, 1]) b.box(0.22, 2.9, 0.16, stone, { at: [s * 0.86, -0.1, 0.08], jitter: false });
    b.box(2.0, 0.28, 0.3, stone, { at: [0, 2.8, 0.12], jitter: false });
    if (ped === 'tri') b.extrude([[-1.1, 0], [1.1, 0], [0, 0.6]], 0.3, stone, { at: [0, 3.08, 0.12], jitter: false });
    else b.extrude([[-1.1, 0], [1.1, 0], [0.8, 0.33], [0.3, 0.48], [-0.3, 0.48], [-0.8, 0.33]], 0.3, stone, { at: [0, 3.08, 0.12], jitter: false });
    // louvred shutters folded back either side
    for (const s of [-1, 1]) b.box(0.62, 2.5, 0.06, P.doorGreen, { at: [s * 1.35, 0.1, 0.04], jitter: false });
  });
}

/**
 * The prefecture of the 1880s: a Neo-Renaissance palazzo in stucco with a rusticated ground floor,
 * pedimented windows on the piano nobile, a balcony over the portal, a deep cornice and the Savoy arms.
 */
export function prefecture(b: Builder, o?: { alone?: boolean }): void {
  const { x0, x1, z0, z1, g, n, t } = PREF;
  const W = x1 - x0;
  const D = z1 - z0;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  const stucco = mix(P.intonacoCream, P.stucco, 0.5);
  const stone = P.travertine;
  const rust = tint(stucco, -0.05);
  const H = g + n + t;

  b.box(W, g, D, rust, { at: [xc, 0, zc] });
  b.box(W, n + t, D, stucco, { at: [xc, g, zc] });
  // rustication: horizontal channels across the ground floor
  for (let y = 0.9; y < g - 0.3; y += 0.75) b.box(W + 0.06, 0.08, D + 0.06, tint(rust, -0.1), { at: [xc, y, zc], jitter: false });
  b.box(W + 0.3, 0.4, D + 0.3, stone, { at: [xc, g - 0.1, zc], jitter: false }); // string course / sill band
  b.box(W + 0.2, 0.25, D + 0.2, stone, { at: [xc, g + n - 0.1, zc], jitter: false });
  // quoins up the corners of the upper floors
  for (const sx of [-1, 1])
    for (let y = g + 0.3; y < H - 0.6; y += 1.1) b.box(0.9, 0.55, 0.9, tint(stucco, -0.08), { at: [xc + sx * (W / 2 - 0.4), y, z1 - 0.4], jitter: false });
  // the great cornice on brackets, and a low hipped roof
  corbels(b, [x0, z1], [x1, z1], H - 0.6, 0.7, stone, { pitch: 0.8, h: 0.6 });
  corbels(b, [x1, z1], [x1, z0], H - 0.6, 0.7, stone, { pitch: 0.8, h: 0.6 });
  corbels(b, [x0, z0], [x0, z1], H - 0.6, 0.7, stone, { pitch: 0.8, h: 0.6 });
  b.box(W + 1.8, 0.55, D + 1.8, stone, { at: [xc, H, zc] });
  b.hip(W + 1.2, D + 1.2, 2.4, P.coppi, { at: [xc, H + 0.55, zc] });

  // front: five bays; portal in the middle under a balcony
  const bays = spread(5, x0 + 1.9, x1 - 1.9);
  bays.forEach((x, i) => {
    if (i === 2) {
      flatArch(b, 2.6, 4.2, stone, { at: [x, 0, z1], shape: 'round', off: 0.05, n: 3 });
      flatArch(b, 2.0, 3.8, P.doorGreen, { at: [x, 0, z1], shape: 'round', off: 0.08, n: 3 });
    } else rectWindow(b, 1.2, 2.0, { at: [x, 1.6, z1], frame: stone, glass: P.windowDark });
    aedicule(b, [x, g + 0.9, z1], 0, i % 2 ? 'seg' : 'tri', stone);
    rectWindow(b, 1.1, 1.8, { at: [x, g + n + 0.8, z1], frame: stone, cornice: true });
  });
  // the balcony on stone consoles, with a balustrade, and the Savoy arms above the cornice line
  const BX = bays[2];
  for (const dx of [-1.2, 1.2]) b.beam([BX + dx, g - 1.2, z1], [BX + dx, g + 0.15, z1 + 1.3], 0.35, 0.45, stone);
  b.box(3.6, 0.3, 1.5, stone, { at: [BX, g + 0.15, z1 + 0.75] });
  for (const dx of spread(9, -1.6, 1.6)) b.box(0.14, 0.85, 0.14, stone, { at: [BX + dx, g + 0.45, z1 + 1.35], jitter: false });
  b.box(3.6, 0.15, 0.3, stone, { at: [BX, g + 1.3, z1 + 1.35], jitter: false });
  b.group({ at: [BX, H - 2.1, z1 + 0.06] }, () => {
    b.extrude([[-0.7, 0.3], [0.7, 0.3], [0.7, 1.4], [-0.7, 1.4]], 0.12, P.gold, { jitter: false });
    b.extrude([[-0.55, 0.4], [0.55, 0.4], [0.55, 1.3], [0, 0.45], [-0.55, 1.3]], 0.16, 0xc23b2e, { jitter: false });
    b.box(0.16, 0.8, 0.18, P.white, { at: [0, 0.48, 0], jitter: false });
    b.box(0.7, 0.16, 0.18, P.white, { at: [0, 0.8, 0], jitter: false });
  });
  b.box(5, 0.5, 0.08, stone, { at: [BX, g - 0.9, z1 + 0.02], jitter: false }); // PREFETTURA inscription band
  flag(b, [BX, H + 0.6, z1 - 0.6], 4.5, TRICOLORE, { w: 2.1, h: 1.4 });

  // the side to the street (+X) and the back
  for (const z of spread(6, z0 + 1.8, z1 - 1.8)) {
    rectWindow(b, 1.2, 2.0, { at: [x1, 1.6, z], facing: '+x', frame: stone });
    rectWindow(b, 1.3, 2.7, { at: [x1, g + 0.9, z], facing: '+x', frame: stone, cornice: true, sill: true });
    rectWindow(b, 1.1, 1.8, { at: [x1, g + n + 0.8, z], facing: '+x', frame: stone, cornice: true });
  }
  // standing free, the side that met the old palace gets windows like the street side
  if (o?.alone) {
    for (const z of spread(6, z0 + 1.8, z1 - 1.8)) {
      rectWindow(b, 1.2, 2.0, { at: [x0, 1.6, z], facing: '-x', frame: stone });
      rectWindow(b, 1.3, 2.7, { at: [x0, g + 0.9, z], facing: '-x', frame: stone, cornice: true, sill: true });
      rectWindow(b, 1.1, 1.8, { at: [x0, g + n + 0.8, z], facing: '-x', frame: stone, cornice: true });
    }
    corbels(b, [x1, z0], [x0, z0], H - 0.6, 0.7, stone, { pitch: 0.8, h: 0.6 });
    for (let y = g + 0.3; y < H - 0.6; y += 1.1) b.box(0.9, 0.55, 0.9, tint(stucco, -0.08), { at: [x0 + 0.4, y, z0 + 0.4], jitter: false });
  }
  for (const x of bays) {
    rectWindow(b, 1.2, 2.2, { at: [x, g + 0.9, z0], facing: '-z', frame: stone, cornice: true });
    rectWindow(b, 1.1, 1.8, { at: [x, g + n + 0.8, z0], facing: '-z', frame: stone });
    rectWindow(b, 1.1, 1.6, { at: [x, 1.6, z0], facing: '-z', frame: stone });
  }
  b.collider(W, D, { at: [xc, 0, zc] });
}

export const prefectureDef: BuildingDef = {
  id: 'prefecture',
  name: 'Prefecture and monument',
  style: 'Neo-Renaissance',
  date: 'c. 1885',
  summary:
    'In 1860 the town joins the new Kingdom of Italy and becomes the capital of a province, governed for the state by a prefect sent from the capital. ' +
    'Beside the old Palazzo Pubblico, which stays the town hall of the elected council and its mayor (old), the state builds its prefecture in a Neo-Renaissance style that borrows from the Florentine palaces of the fifteenth century: ' +
    'a rusticated ground floor, windows in little temple frames with alternating pediments, a balcony over the portal and a deep cornice (new). ' +
    'In the square a bronze Victor Emmanuel II, the first king of Italy, rides on a granite pedestal: one of hundreds of such monuments raised in the 1880s and 1890s to make Italians.',
  materials: ['stucco', 'travertine', 'clay roof tiles', 'bronze', 'granite'],
  lookFor: [
    { label: 'Equestrian monument to the king', note: 'Victor Emmanuel II in bronze on a polished granite pedestal with reliefs, inside an iron railing.', at: [MON[0] + 1.4, MON_TOP - 1.2, MON[1] + 1.4] },
    { label: 'Alternating pediments', note: 'The main-floor windows are framed like little temples, capped by triangular and curved pediments in turn.', at: [PREF.x0 + 5.4, PREF.g + 4.4, PREF.z1 + 0.4] },
    { label: 'Rusticated ground floor', note: 'The stucco of the ground floor is scored in deep horizontal channels to look like heavy blocks of stone.', at: [PREF.x0 + 1.6, 2.4, PREF.z1 + 0.3] },
    { label: 'Balcony and Savoy arms', note: 'The prefect’s balcony over the portal, below the white cross on red of the royal house of Savoy.', at: [(PREF.x0 + PREF.x1) / 2, PREF.g + 1.4, PREF.z1 + 1.6] },
    { label: 'Main cornice', note: 'A deep projecting cornice on stone brackets crowns the building, as on the Florentine palaces it imitates.', at: [PREF.x1 + 1.0, PREF.g + PREF.n + PREF.t - 0.2, PREF.z1 - 2] },
  ],
  modelledOn: 'The prefectures and equestrian monuments to Victor Emmanuel II raised in Italian provincial capitals after unification',
  build(b) {
    // on the main plot it stands beside the old palace; elsewhere it stands alone on its own square
    const alone = b.variant > 0;
    if (!alone) {
      palazzoPubblico(b, { stage: 1885 });
      lordsCourt(b);
      brickSquare(b, -21.5, 21.5, PAL.zf, 21.5);
    } else {
      pave(b, 31, 14.5, 6, 14.25, mix(P.paving, P.travertine, 0.4));
      pave(b, 2.4, 19.4, PREF.x0 - 1.2, -2.5, mix(P.paving, P.travertine, 0.4));
    }
    prefecture(b, { alone });
    kingMonument(b);
    // a small public garden behind the prefecture, with palms and a gravel walk
    pave(b, 14, 9.4, PREF.x0 + 7, -16.8, mix(P.gravel, P.grassDry, 0.3));
    for (const [x, z] of [[10, -15], [18.5, -18.5]] as const) {
      b.cyl(0.25, 6, P.bark, { at: [x, 0, z], segs: 6, rTop: 0.2 });
      for (let i = 0; i < 6; i++) b.beam([x, 6, z], [x + Math.cos(i) * 1.9, 5.2, z + Math.sin(i) * 1.9], 0.5, 0.08, P.leafDark);
    }
    b.tree(5, { kind: 'round', at: [14, 0, -17] });
    b.box(14, 1.2, 0.3, P.castIron, { at: [PREF.x0 + 7, 0, -21.4], jitter: false });
    // gas lamps in the square
    for (const [x, z] of (alone ? [[2, 12], [12, 12]] : [[-14, 12], [2, 12], [12, 12]]) as [number, number][]) {
      b.cyl(0.1, 3.6, P.castIron, { at: [x, 0, z], segs: 6 });
      b.box(0.4, 0.5, 0.4, P.glass, { at: [x, 3.6, z], mat: 'glass' });
    }
    if (!alone) {
      palaceColliders(b, true);
      lordsColliders(b);
    }
  },
};
