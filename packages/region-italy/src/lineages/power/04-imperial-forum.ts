import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { ARCH, ARCH_TOP, BAS, BAS_ZC, PORTICO_Z, archWindow, equestrianPedestal, forumBasilica, forumStatues, forumWell, pave, porticoColumn, triumphalArch } from './shared';

/** A gilded bronze horseman on a marble pedestal, in the middle of the square. */
function equestrian(b: Builder): void {
  const bronze = mix(P.bronze, P.gold, 0.35);
  equestrianPedestal(b);
  b.group({ at: [0, 0, 3] }, () => {
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
    'The old basilica is kept but faced in marble, its Ionic colonnade replaced by Corinthian columns, and an apse is built against one end to hold the tribunal, the raised seat from which the magistrates gave judgement. ' +
    'A triumphal arch at the entrance and a gilded bronze horseman in the square honour the emperor. The town still elects its own magistrates, but the decisions that matter are made in Rome, and loyalty is shown in stone.',
  materials: ['marble', 'brick-faced concrete', 'travertine', 'gilded bronze', 'fired clay tiles'],
  lookFor: [
    { label: 'Triumphal arch', note: 'A single archway framed by half-columns with leafy capitals (Composite ones at Benevento), with relief panels and a tall attic carrying the dedication to the emperor.', at: [ARCH.x + 3.2, ARCH.h + 3.6, ARCH.z + ARCH.d / 2 + 0.3] },
    { label: 'Tribunal apse', note: 'The half-round end of the basilica, where the magistrates sat raised above the parties to a case.', at: [BAS.x0 - BAS.apseR - 0.4, 6, BAS_ZC] },
    { label: 'Equestrian statue', note: 'A gilded bronze rider on a marble pedestal, the emperor shown as the town’s protector.', at: [1.2, 6.2, 3] },
    { label: 'Corinthian colonnade', note: 'Marble columns with leafy capitals carry the porticoes round the square, a Greek order the Romans made their own.', at: [-12.6, 4.6, 8] },
    { label: 'Clerestory', note: 'High windows above the aisle roofs light the basilica’s tall central hall.', at: [-3, 9.0, BAS_ZC + BAS.nave / 2 + 0.4] },
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

    // ---------------------------------------------------------- the old basilica, refaced, with its tribunal apse
    forumBasilica(b, true);
    const { x0, x1, z0, z1, nave, apseR } = BAS;
    const L = x1 - x0;
    const xc = (x0 + x1) / 2;
    const aisle = (z1 - z0 - nave) / 2;

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
      for (let i = 0; i < PORTICO_Z.length; i++) porticoColumn(b, s, i);
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
    equestrian(b);
    // the Republican statues and well-head are kept in the new square
    forumStatues(b);
    forumWell(b);
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
