import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { ARCH, ARCH_TOP, BAS, BAS_ZC, archWindow, column, pave, triumphalArch } from './shared';

/** A gilded bronze horseman on a marble pedestal. */
export function equestrian(b: Builder, x: number, z: number, rotY = 0): void {
  const bronze = mix(P.bronze, P.gold, 0.35);
  b.group({ at: [x, 0, z], rotY }, () => {
    b.box(2.6, 0.4, 4.0, P.marble);
    b.box(2.0, 2.6, 3.4, P.marble, { at: [0, 0.4, 0] });
    b.box(2.3, 0.3, 3.7, P.marble, { at: [0, 3.0, 0], jitter: false });
    b.box(1.6, 0.5, 0.06, P.bronze, { at: [0, 1.6, 1.71], jitter: false }); // dedication
    const H = 3.3;
    b.box(0.8, 0.9, 2.2, bronze, { at: [0, H + 1.2, 0] });
    for (const [lx, lz, lift] of [[-0.25, 0.85, 0.6], [0.25, 0.85, 0], [-0.25, -0.85, 0], [0.25, -0.85, 0]] as const)
      b.box(0.2, 1.25 - lift * 0.5, 0.22, bronze, { at: [lx, H + lift * 0.5, lz] });
    b.beam([0, H + 1.8, 0.9], [0, H + 2.7, 1.5], 0.4, 0.5, bronze);
    b.box(0.36, 0.4, 0.8, bronze, { at: [0, H + 2.55, 1.7] });
    b.box(0.55, 0.85, 0.45, bronze, { at: [0, H + 2.1, -0.05] });
    b.sphere(0.18, bronze, { at: [0, H + 3.15, -0.05], segs: 6 });
    b.beam([0.25, H + 2.7, 0], [0.55, H + 3.1, 0.6], 0.1, 0.1, bronze); // arm raised in greeting
  });
}

export const imperialForum: BuildingDef = {
  id: 'imperial-forum',
  name: 'Forum in marble',
  style: 'Roman Imperial',
  date: 'c. AD 100 to 120',
  summary:
    'Under the emperors the forum is rebuilt in marble, paid for largely by the town’s leading families, whose gifts are recorded in inscriptions. ' +
    'The new basilica, faced in marble and lined with Corinthian columns, ends in an apse holding the tribunal, the raised seat from which the magistrates gave judgement. ' +
    'A triumphal arch at the entrance and a gilded bronze horseman in the square honour the emperor. The town still elects its own magistrates, but the decisions that matter are made in Rome, and loyalty is shown in stone.',
  materials: ['marble', 'brick-faced concrete', 'travertine', 'gilded bronze', 'fired clay tiles'],
  lookFor: [
    { label: 'Triumphal arch', note: 'A single archway framed by half-columns with leafy capitals (Composite ones at Benevento), with relief panels and a tall attic carrying the dedication to the emperor.', at: [ARCH.x + 3.2, ARCH.h + 3.6, ARCH.z + ARCH.d / 2 + 0.3] },
    { label: 'Tribunal apse', note: 'The half-round end of the basilica, where the magistrates sat raised above the parties to a case.', at: [BAS.x0 - BAS.apseR - 0.4, 6, BAS_ZC] },
    { label: 'Equestrian statue', note: 'A gilded bronze rider on a marble pedestal, the emperor shown as the town’s protector.', at: [1.2, 6.2, 3] },
    { label: 'Corinthian colonnade', note: 'Marble columns with leafy capitals carry the porticoes round the square, a Greek order the Romans made their own.', at: [-12.6, 4.6, 8] },
    { label: 'Clerestory', note: 'High windows above the aisle roofs light the basilica’s tall central hall.', at: [-3, 9.8, BAS_ZC + BAS.nave / 2 + 0.4] },
  ],
  modelledOn: 'The Arch of Trajan at Benevento (AD 114 to 117), with a forum of the kind seen at Pompeii and Ostia, much reduced',
  influences: ['roman-empire-export', 'hellenistic-luxury'],
  build(b) {
    const marble = P.marble;
    const brick = P.romanTile;
    const tile = P.romanTile;
    const tr = P.travertine;

    // the square paved in travertine slabs
    pave(b, 26, 28, -0.5, 5.5, mix(P.travertine, P.paving, 0.35));
    for (const z of spread(6, -7.5, 18)) b.box(26, 0.075, 0.12, tint(P.travertine, -0.08), { at: [-0.5, 0, z], jitter: false });

    // ---------------------------------------------------------- the basilica with its tribunal apse
    const { x0, x1, z0, z1, nave, apseR } = BAS;
    const L = x1 - x0;
    const xc = (x0 + x1) / 2;
    const aisle = (z1 - z0 - nave) / 2;
    const NH = 11.5;
    const AH = 7;
    b.box(L + 0.6, 0.7, z1 - z0 + 0.6, tr, { at: [xc, 0, BAS_ZC] }); // podium
    b.box(L, NH, nave, marble, { at: [xc, 0.7, BAS_ZC] });
    b.gable(L + 0.4, nave + 0.4, 1.8, tile, { at: [xc, NH + 0.7, BAS_ZC], overhang: 0.3, wall: marble });
    b.box(L, AH, aisle, tint(marble, -0.02), { at: [xc, 0.7, z0 + aisle / 2] });
    b.shed(L + 0.4, aisle + 0.5, 1.3, tile, { at: [xc, AH + 0.7, z0 + aisle / 2 - 0.2], high: '+z' });
    b.shed(L + 0.4, aisle + 0.5, 1.3, tile, { at: [xc, AH + 0.7, z1 - aisle / 2 + 0.2], high: '-z' });
    for (const x of spread(10, x0 + 0.5, x1 - 0.5)) column(b, [x, 0.7, z1 - 0.4], 0.34, AH - 0.6, marble, { order: 'corinthian' });
    b.box(L, 0.6, 0.85, marble, { at: [xc, AH + 0.1, z1 - 0.4] });
    b.box(L - 2, 0.3, 0.05, P.bronze, { at: [xc, AH + 0.25, z1 + 0.03], jitter: false }); // bronze-lettered dedication
    b.sym((s) => b.box(0.5, AH, aisle, marble, { at: [s > 0 ? x1 - 0.25 : x0 + 0.25, 0.7, z1 - aisle / 2] }));
    for (const x of spread(9, x0 + 1.5, x1 - 1.5)) {
      for (const s of [1, -1]) archWindow(b, 1.2, 2.0, { at: [x, AH + 1.9, BAS_ZC + (s * nave) / 2], facing: s > 0 ? '+z' : '-z', frame: tr });
      archWindow(b, 0.9, 1.4, { at: [x, 3.0, z0], facing: '-z', frame: tr });
    }
    for (const x of spread(3, x0 + 6, x1 - 6)) b.panel(2, 3.8, P.bronze, { at: [x, 0.7, BAS_ZC + nave / 2], facing: '+z' });
    b.panel(2, 3.6, P.oakDark, { at: [x1, 0.7, BAS_ZC], facing: '+x' });
    archWindow(b, 1.2, 2, { at: [x1, NH - 1.8, BAS_ZC], facing: '+x', frame: tr });
    // the apse at the left end: a half-round of brick-faced concrete under a half-dome of tiles
    b.lathe([[apseR, 0], [apseR, NH - 2.5]], tint(brick, 0.04), { at: [x0, 0.7, BAS_ZC], segs: 9, start: Math.PI, sweep: Math.PI });
    b.lathe([[apseR + 0.3, NH - 2.6], [apseR * 0.75, NH - 1.2], [0.01, NH - 0.4]], tile, { at: [x0, 0.7, BAS_ZC], segs: 9, start: Math.PI, sweep: Math.PI });
    for (const a of [Math.PI * 0.65, Math.PI, Math.PI * 1.35]) {
      const wx = x0 + Math.sin(a) * apseR;
      const wz = BAS_ZC + Math.cos(a) * apseR;
      archWindow(b, 1.0, 1.9, { at: [wx, 4.4, wz], facing: a, frame: tr });
    }

    // ---------------------------------------------------------- porticoes and shop ranges down both sides
    const SZ0 = -8;
    const SZ1 = 17.6;
    const SL = SZ1 - SZ0;
    const SZC = (SZ0 + SZ1) / 2;
    b.sym((s) => {
      const SX = s * 17.5;
      b.box(7, 6.4, SL, tint(brick, 0.06), { at: [SX, 0, SZC] });
      b.box(7.1, 0.4, SL + 0.1, tr, { at: [SX, 6.4, SZC], jitter: false });
      b.gable(7.4, SL + 0.4, 1.4, tile, { at: [SX, 6.8, SZC], ridge: 'z', overhang: 0.2, wall: tint(brick, 0.06) });
      for (const z of spread(6, SZ0 + 2.2, SZ1 - 2.2)) {
        b.panel(2.2, 3.0, P.oak, { at: [SX - s * 3.5, 0, z], facing: s > 0 ? '-x' : '+x' });
        archWindow(b, 0.9, 1.3, { at: [SX - s * 3.5, 4.2, z], facing: s > 0 ? '-x' : '+x', frame: tr, shape: 'segmental' });
        archWindow(b, 0.9, 1.3, { at: [SX + s * 3.5, 3.6, z], facing: s > 0 ? '+x' : '-x', frame: tr, shape: 'segmental' });
      }
      for (const z of spread(9, SZ0 + 0.6, SZ1 - 0.6)) column(b, [s * 12.6, 0, z], 0.3, 4.8, marble, { order: 'corinthian' });
      b.box(0.8, 0.55, SL, marble, { at: [s * 12.6, 4.8, SZC] });
      b.shed(3.3, SL, 0.9, tile, { at: [s * 12.6 + s * 0.85, 5.35, SZC], high: s > 0 ? '+x' : '-x' });
    });

    // ---------------------------------------------------------- the front: walls either side of the arch
    b.sym((s) => {
      const wx0 = s * (ARCH.w / 2);
      const wx1 = s * 21;
      b.box(Math.abs(wx1 - wx0), 6.4, 1.2, tint(brick, 0.06), { at: [(wx0 + wx1) / 2, 0, ARCH.z] });
      b.box(Math.abs(wx1 - wx0), 0.4, 1.3, tr, { at: [(wx0 + wx1) / 2, 6.4, ARCH.z], jitter: false });
      for (const x of spread(2, s * 9, s * 15)) archWindow(b, 1.0, 1.5, { at: [x, 3.5, ARCH.z + 0.6], facing: '+z', frame: tr, shape: 'segmental' });
    });
    triumphalArch(b, marble);

    // ---------------------------------------------------------- the horseman in the square, and an altar
    equestrian(b, 0, 3);
    b.box(1.4, 1.1, 1.0, marble, { at: [0, 0, -5.4] });
    b.box(1.7, 0.2, 1.3, marble, { at: [0, 1.1, -5.4], jitter: false });

    // ---------------------------------------------------------- colliders
    b.collider(L, nave + aisle + 0.6, { at: [xc, 0, BAS_ZC - aisle / 2] });
    b.collider(apseR * 2, apseR * 2, { at: [x0 - apseR / 2, 0, BAS_ZC] });
    b.sym((s) => {
      b.collider(0.6, aisle, { at: [s > 0 ? x1 - 0.25 : x0 + 0.25, 0, z1 - aisle / 2] });
      b.collider(7, SL, { at: [s * 17.5, 0, SZC] });
      b.collider(21 - ARCH.w / 2, 1.2, { at: [s * (21 + ARCH.w / 2) / 2, 0, ARCH.z] });
      b.collider((ARCH.w - ARCH.passW) / 2 + 0.4, ARCH.d + 1.2, { at: [s * (ARCH.passW / 2 + (ARCH.w - ARCH.passW) / 4), 0, ARCH.z] });
    });
    b.collider(2.6, 4.0, { at: [0, 0, 3] });
    b.collider(1.7, 1.3, { at: [0, 0, -5.4] });
    void ARCH_TOP;
  },
};
