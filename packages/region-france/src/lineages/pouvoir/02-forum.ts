import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { arcade, column, flatArch, pave, rectCollider, statue } from './shared';

const stone = P.pierreBlonde;
const dark = tint(stone, -0.08);
const tile = P.romanTile;
const plaster = mix(P.plaster, P.pierreBlonde, 0.4);

/** The basilica across the back of the forum, and the curia at its left end. */
const BAS = { x0: -13, x1: 17.5, z0: -21.5, z1: -10, aisle: 8, nave: 13.5 };
const CUR = { x0: -21, x1: -14.5, z0: -20.5, z1: -11.5 };
/** The square and the porticoes round it. */
const SQ = { x0: -15, x1: 15, z0: -5.5, z1: 15 };
const PW = 5.5; // portico depth
const POD = 1.6; // the east portico stands on the cryptoporticus

/** Bands of brick in the small squared stone (petit appareil) of a wall face. */
function brickBands(b: Builder, w: number, at: [number, number, number], rotY: number, ys: number[]): void {
  for (const y of ys) b.box(w, 0.22, 0.05, P.romanTile, { at: [at[0], y, at[2]], rotY, jitter: false });
}

/** A portico along one side: a colonnade on a stylobate, a back wall with shop doors, a lean-to roof. */
function portico(b: Builder, len: number, base: number, o: { at: [number, number, number]; rotY: number; doors?: boolean }): void {
  const colH = 5.2;
  b.group({ at: o.at, rotY: o.rotY }, () => {
    // local frame: runs along X, the colonnade at z = 0 facing +Z (onto the square), back wall at z = -PW
    b.box(len, 0.35, PW + 0.6, dark, { at: [0, base, -PW / 2 + 0.3], jitter: false });
    for (const x of spread(Math.round(len / 2.9), -len / 2 + 0.8, len / 2 - 0.8)) column(b, [x, base + 0.35, 0], 0.3, colH, stone, { order: 'doric', segs: 6 });
    b.box(len, 0.7, 0.8, stone, { at: [0, base + 0.35 + colH, 0] });
    b.box(len, base + colH + 1.05, 0.7, plaster, { at: [0, 0, -PW] });
    brickBands(b, len, [0, 0, -PW - 0.36], 0, [1.5, 3.2, 4.9]);
    b.shed(len + 0.4, PW + 1.4, 1.8, tile, { at: [0, base + colH + 1.05, -PW / 2 + 0.1], high: '-z' });
    if (o.doors) for (const x of spread(Math.round(len / 4.2), -len / 2 + 2, len / 2 - 2)) b.panel(1.6, 2.6, P.oakDark, { at: [x, base + 0.35, -PW + 0.35], facing: '+z' });
  });
}

export const forum: BuildingDef = {
  id: 'forum',
  name: 'Forum and basilica',
  style: 'Gallo-Roman',
  date: 'c. AD 60',
  summary:
    'After the conquest the tribe becomes a civitas, a self-governing city of the Roman empire, and its capital is laid out again with a forum at the crossing of the main streets. ' +
    'The leading Gauls now rule as Roman magistrates and town councillors (decurions), who meet in the small senate house (curia); justice and business are done in the basilica, a great hall across one end, and the square is ringed by porticoes with shops. ' +
    'Under the east portico runs a cryptoporticus, a half-buried vaulted gallery lit by slanting slits, which raised the portico and gave dry storage or a cool covered walk. Stone, mortar, brick and tile arrive all at once with Rome.',
  materials: ['small squared limestone with brick bands', 'limestone columns', 'lime mortar', 'Roman roof tile'],
  lookFor: [
    { label: 'Basilica', note: 'The great hall across the end of the forum, its tall nave lit by a row of clerestory windows above the aisles, used for courts and business.', at: [8, BAS.nave - 1.5, -15.75 + 2.4] },
    { label: 'Curia (senate house)', note: 'The small temple-fronted hall where the town council of decurions met.', at: [(CUR.x0 + CUR.x1) / 2, 6.6, CUR.z1 + 1.3] },
    { label: 'Cryptoporticus', note: 'A vaulted gallery half sunk under the east portico, lit by slanting slits at ground level; the remains of one survive under the forum of Reims.', at: [SQ.x1 + 0.3, 0.8, 2] },
    { label: 'Porticoes', note: 'Covered walks of Doric columns on three sides of the square, with shops behind them.', at: [SQ.x0 - 0.2, 4.6, 6] },
    { label: 'Statues on pedestals', note: 'Honorary statues of the emperor and of local worthies stood in the square, with inscriptions naming who paid for them.', at: [-4.5, 3.8, 3.2] },
  ],
  modelledOn:
    'The forum of Bavay (Bagacum), with its cryptoporticus, and the cryptoporticus of the forum of Reims (Durocortorum); generic and much reduced',
  influences: ['roman-conquest'],
  build(b) {
    // the paved square
    pave(b, SQ.x0, SQ.x1, SQ.z0 - 2, SQ.z1, mix(P.paving, stone, 0.45));
    for (const x of spread(7, SQ.x0 + 2, SQ.x1 - 2)) b.box(0.08, 0.075, SQ.z1 - SQ.z0 + 2, tint(P.paving, -0.08), { at: [x, 0, (SQ.z0 + SQ.z1) / 2 - 1], jitter: false });

    // ---- the basilica: aisles, a raised nave with clerestory, a colonnaded front to the forum
    const bx = (BAS.x0 + BAS.x1) / 2;
    const bW = BAS.x1 - BAS.x0;
    const bz = (BAS.z0 + BAS.z1) / 2;
    const bD = BAS.z1 - BAS.z0;
    b.box(bW, BAS.aisle, bD, plaster, { at: [bx, 0, bz] });
    brickBands(b, bW, [bx, 0, BAS.z1 + 0.03], 0, [2.2, 4.4, 6.6]);
    brickBands(b, bW, [bx, 0, BAS.z0 - 0.03], 0, [2.2, 4.4, 6.6]);
    const nD = 6.5;
    b.box(bW, BAS.nave - BAS.aisle, nD, plaster, { at: [bx, BAS.aisle, bz] });
    for (const s of [1, -1]) b.shed(bW + 0.3, (bD - nD) / 2 + 0.4, 1.6, tile, { at: [bx, BAS.aisle, bz + s * (nD / 2 + (bD - nD) / 4)], high: s > 0 ? '-z' : '+z' });
    b.gable(bW + 0.4, nD + 0.8, 2.6, tile, { at: [bx, BAS.nave, bz], wall: plaster, thick: 0.18 });
    for (const x of spread(9, BAS.x0 + 2, BAS.x1 - 2)) {
      for (const s of [1, -1]) flatArch(b, 1.2, 1.9, P.windowDark, { at: [x, BAS.aisle + 2.1, bz + s * nD / 2], facing: s > 0 ? '+z' : '-z', shape: 'round', n: 3 });
      flatArch(b, 1.0, 2.0, P.windowDark, { at: [x, 3.6, BAS.z0], facing: '-z', shape: 'round', n: 3 });
    }
    // the front colonnade of the basilica, a step up from the square
    b.box(bW, 0.5, 3.6, dark, { at: [bx, 0, BAS.z1 + 1.8], jitter: false });
    for (const x of spread(11, BAS.x0 + 0.8, BAS.x1 - 0.8)) column(b, [x, 0.5, BAS.z1 + 3.0], 0.35, 6.4, stone, { order: 'corinthian', segs: 6 });
    b.box(bW, 0.9, 1.0, stone, { at: [bx, 6.9, BAS.z1 + 3.0] });
    b.shed(bW, 3.8, 1.1, tile, { at: [bx, 7.8, BAS.z1 + 1.8], high: '-z' });
    for (const x of spread(5, BAS.x0 + 3, BAS.x1 - 3)) flatArch(b, 2.0, 4.0, P.oakDark, { at: [x, 0.5, BAS.z1], shape: 'round', n: 3 });
    b.stairs(bW, 0.5, 1.0, 2, dark, { at: [bx, 0, BAS.z1 + 4.1] });
    // the tribunal: an apse at the right end where the magistrate sat
    b.lathe([[4.0, 0], [4.0, BAS.aisle], [0.1, BAS.aisle + 2.2]], plaster, { at: [BAS.x1 - 0.1, 0, bz], start: 0, sweep: Math.PI, segs: 8 });

    // ---- the curia: a small temple-fronted hall on a podium
    const cx = (CUR.x0 + CUR.x1) / 2;
    const cW = CUR.x1 - CUR.x0;
    const cz = (CUR.z0 + CUR.z1) / 2;
    b.box(cW, 1.2, CUR.z1 - CUR.z0 + 2.4, dark, { at: [cx, 0, cz + 1.2] });
    b.box(cW, 7.0, CUR.z1 - CUR.z0, plaster, { at: [cx, 1.2, cz] });
    brickBands(b, CUR.z1 - CUR.z0, [CUR.x0 - 0.03, 0, cz], Math.PI / 2, [3.0, 5.0, 7.0]);
    b.gable(cW + 0.5, CUR.z1 - CUR.z0 + 2.6, 2.0, tile, { at: [cx, 8.2, cz + 1.2], ridge: 'z', wall: stone });
    for (const s of [-1, 1]) column(b, [cx + s * 1.6, 1.2, CUR.z1 + 1.9], 0.32, 7.0, stone, { order: 'corinthian', segs: 6 });
    b.box(cW, 0.7, 2.4, stone, { at: [cx, 7.5, CUR.z1 + 1.2] });
    flatArch(b, 1.8, 3.6, P.bronze, { at: [cx, 1.2, CUR.z1], shape: 'rect' });
    b.stairs(3.6, 1.2, 1.8, 5, dark, { at: [cx, 0, CUR.z1 + 3.3] });

    // ---- porticoes: west with shops, east raised over the cryptoporticus, south with the gate
    portico(b, SQ.z1 - SQ.z0, 0, { at: [SQ.x0, 0, (SQ.z0 + SQ.z1) / 2], rotY: Math.PI / 2, doors: true });
    portico(b, SQ.z1 - SQ.z0, POD, { at: [SQ.x1, 0, (SQ.z0 + SQ.z1) / 2], rotY: -Math.PI / 2, doors: true });
    // the cryptoporticus under the east portico: its wall faces and slanting light slits
    b.box(PW + 1.0, POD, SQ.z1 - SQ.z0, dark, { at: [SQ.x1 + PW / 2 + 0.2, 0, (SQ.z0 + SQ.z1) / 2] });
    for (const z of spread(8, SQ.z0 + 1.5, SQ.z1 - 1.5)) {
      b.panel(0.35, 0.9, P.windowDark, { at: [SQ.x1 - 0.31, 0.35, z], facing: '-x' });
      b.panel(0.35, 0.9, P.windowDark, { at: [SQ.x1 + PW + 0.7, 0.35, z], facing: '+x' });
    }
    // steps up to the raised portico, and a stair going down into the gallery at its south end
    for (const z of [SQ.z0 + 4, (SQ.z0 + SQ.z1) / 2, SQ.z1 - 4]) b.stairs(2.6, POD, 1.8, 6, dark, { at: [SQ.x1 - 1.2, 0, z], rotY: -Math.PI / 2 });
    b.box(1.6, 0.05, 3.0, P.windowDark, { at: [SQ.x1 + 2.6, POD + 0.36, SQ.z1 - 1.8], jitter: false });
    b.deck(PW, SQ.z1 - SQ.z0, POD + 0.35, { at: [SQ.x1 + PW / 2, 0, (SQ.z0 + SQ.z1) / 2] });
    // the south range: porticoes either side of a monumental gateway onto the main street
    const half = (SQ.x1 - SQ.x0) / 2 - 2.6;
    for (const s of [-1, 1]) portico(b, half, 0, { at: [s * (half / 2 + 2.6), 0, SQ.z1 + 0.4], rotY: Math.PI });
    b.group({ at: [0, 0, SQ.z1 + PW / 2 + 0.4] }, () => {
      arcade(b, 5.6, 8.6, PW + 0.8, stone, { openings: 1, openW: 3.4, openH: 6.0, shape: 'round', n: 3 });
      b.box(6.2, 0.6, PW + 1.2, dark, { at: [0, 8.6, 0], jitter: false });
      b.extrude([[-3.1, 0], [3.1, 0], [0, 1.4]], PW + 1.2, tile, { at: [0, 9.2, 0], rotY: 0 });
      statue(b, [0, 9.2, PW / 2 + 0.3], 2.0, P.bronze);
    });
    // statues and an altar in the square
    for (const [x, z] of [[-4.5, 3], [4.5, 3], [-4.5, -4], [4.5, -4]] as [number, number][]) {
      b.box(1.4, 1.8, 1.4, stone, { at: [x, 0, z] });
      b.box(1.6, 0.2, 1.6, dark, { at: [x, 1.8, z], jitter: false });
      statue(b, [x, 2.0, z], 2.0, P.bronze, { arm: true });
      b.collider(1.5, 1.5, { at: [x, 0, z] });
    }
    b.box(2.0, 1.1, 1.2, P.marble, { at: [0, 0, -2] });
    b.collider(2.0, 1.2, { at: [0, 0, -2] });

    // ---- colliders: the closed halls, the portico back walls and columns
    rectCollider(b, BAS.x0, BAS.x1 + 4, BAS.z0, BAS.z1);
    rectCollider(b, CUR.x0, CUR.x1, CUR.z0, CUR.z1);
    rectCollider(b, SQ.x0 - PW - 0.4, SQ.x0 - PW + 0.4, SQ.z0, SQ.z1);
    rectCollider(b, SQ.x1 + PW - 0.2, SQ.x1 + PW + 1.2, SQ.z0, SQ.z1); // the raised east walk is reached by its stairs
    rectCollider(b, SQ.x0, -2.6, SQ.z1 + PW + 0.1, SQ.z1 + PW + 0.8);
    rectCollider(b, 2.6, SQ.x1, SQ.z1 + PW + 0.1, SQ.z1 + PW + 0.8);
    for (const s of [-1, 1]) rectCollider(b, s * 2.8 - 1.0, s * 2.8 + 1.0, SQ.z1 + 0.4, SQ.z1 + PW + 0.8);
  },
};
