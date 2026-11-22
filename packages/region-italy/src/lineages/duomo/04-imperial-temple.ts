import { P, tint, type BuildingDef } from '@ah/kit';

const TZ = -5.5;
const W = 13.4;
const D = 26.4;
const PH = 2.9;
const CH = 9.0;
const MARBLE = P.marble;
const STONE = P.travertine;
const PX = 13.0; // inner line of the precinct colonnades

export const imperialTemple: BuildingDef = {
  id: 'imperial-temple',
  name: 'Imperial temple',
  style: 'Augustan Roman',
  date: 'c. AD 20',
  summary:
    'Under Augustus and his successors the town rebuilt its chief temple in gleaming white marble from the new quarries at Luna (Carrara), probably for the cult of Rome and the emperor. ' +
    'It is the classic Roman temple, and the old Italian plan is still there underneath: a high podium approached only by a front stair, a deep porch (six columns across and three deep), and half-columns along the cella walls. ' +
    'The columns are now Corinthian, with capitals of carved acanthus leaves, and the temple stands in a paved precinct framed on three sides by colonnaded porticoes, the heart of the town’s forum.',
  materials: ['Luna (Carrara) marble', 'concrete core', 'travertine', 'clay roof tiles'],
  lookFor: [
    { label: 'Corinthian columns', note: 'Tall slender columns with bell-shaped capitals of acanthus leaves, the favourite order of imperial Rome.', at: [-1.2, PH + CH - 0.3, TZ + D / 2 - 0.9] },
    { label: 'Hexastyle porch', note: 'Six columns across the front and three deep: a porch nearly a third of the building’s length.', at: [W / 2 + 0.3, 6.5, TZ + D / 2 - 2.5] },
    { label: 'Pseudo-peripteral cella', note: 'Half-columns run along the cella walls so the temple seems ringed with columns.', at: [W / 2 - 0.2, 7.5, TZ - 6] },
    { label: 'Colonnaded precinct', note: 'Porticoes on three sides frame the temple and give shade to the business of the forum.', at: [PX + 0.4, 3.5, 12] },
  ],
  modelledOn: 'The Maison Carrée, Nîmes (built under Augustus, about 20 BC to AD 5) and the Temple of Augustus, Pula (between 2 BC and AD 14)',
  influences: ['hellenistic-luxury', 'roman-empire-export'],
  build(b) {
    const front = TZ + D / 2;
    const back = TZ - D / 2;
    // podium with base and crown mouldings, and a stair between two cheek walls
    b.box(W + 0.6, 0.5, D + 0.6, STONE, { at: [0, 0, TZ] });
    b.box(W, PH, D, tint(MARBLE, -0.03), { at: [0, 0, TZ] });
    b.box(W + 0.4, 0.35, D + 0.4, MARBLE, { at: [0, PH - 0.35, TZ] });
    b.stairs(10.4, PH, 4.4, 13, MARBLE, { at: [0, 0, front + 2.2] });
    b.sym((s) => {
      b.box(1.2, PH, 4.4, tint(MARBLE, -0.03), { at: [s * 5.9, 0, front + 2.2] });
      b.box(1.4, 1.4, 1.2, MARBLE, { at: [s * 5.9, PH, front + 3.6] });
    });

    // 6 across, 3 deep in the porch; half-columns on the cella sides and back
    const xs = [-6.0, -3.6, -1.2, 1.2, 3.6, 6.0];
    const pitch = 2.4;
    const z0 = front - 0.8;
    const cellaFront = z0 - pitch * 3 + 1.0;
    const cellaBack = back + 0.8;
    b.box(12.0, CH, cellaFront - cellaBack, MARBLE, { at: [0, PH, (cellaFront + cellaBack) / 2] });
    b.box(3.6, 7.0, 0.1, STONE, { at: [0, PH, cellaFront + 0.02], jitter: false });
    b.box(3.0, 6.6, 0.12, P.bronze, { at: [0, PH, cellaFront + 0.05], jitter: false });
    const col = (x: number, z: number) => b.column(0.42, CH, MARBLE, { at: [x, PH, z], order: 'corinthian', segs: 8 });
    for (const x of xs) col(x, z0);
    for (let k = 1; k <= 2; k++) b.sym((s) => col(s * 6.0, z0 - pitch * k));
    for (let z = z0 - pitch * 3; z >= cellaBack - 0.01; z -= pitch) b.sym((s) => col(s * 6.0, z));
    for (const x of [-3.6, -1.2, 1.2, 3.6]) col(x, cellaBack);

    // entablature: architrave, frieze, cornice with modillions
    const ey = PH + CH;
    const ez = (z0 + 0.5 + cellaBack - 0.5) / 2;
    const ed = z0 - cellaBack + 1.0;
    b.box(12.9, 0.75, ed, MARBLE, { at: [0, ey, ez] });
    b.box(12.9, 0.7, ed, tint(MARBLE, -0.05), { at: [0, ey + 0.75, ez] });
    b.box(13.7, 0.5, ed + 0.8, MARBLE, { at: [0, ey + 1.45, ez] });
    const ry = ey + 1.95;
    b.gable(13.5, ed + 0.6, 2.7, P.romanTile, { ridge: 'z', at: [0, ry, ez], overhang: 0.25, wall: MARBLE });
    const fz = ez + (ed + 0.6) / 2 + 0.05;
    b.sym((s) => b.beam([s * 7.0, ry - 0.08, fz], [0, ry + 2.85, fz], 0.45, 0.4, MARBLE));
    b.box(14.0, 0.25, 0.5, MARBLE, { at: [0, ry - 0.2, fz - 0.1] });
    // acroteria
    b.box(0.5, 0.9, 0.3, MARBLE, { at: [0, ry + 2.9, fz] });
    b.sym((s) => b.box(0.5, 0.7, 0.3, MARBLE, { at: [s * 6.8, ry, fz] }));

    // the paved precinct
    b.box(32, 0.05, 60, tint(P.paving, 0.03), { at: [0, 0, 0], jitter: false });
    // altar before the stair
    b.box(4.4, 0.3, 2.8, STONE, { at: [0, 0, front + 8.0] });
    b.box(3.8, 1.1, 2.2, MARBLE, { at: [0, 0.3, front + 8.0] });
    b.box(4.1, 0.25, 2.5, MARBLE, { at: [0, 1.4, front + 8.0] });
    b.sym((s) => b.log(0.18, 2.2, MARBLE, { at: [s * 1.7, 1.65, front + 8.0], axis: 'z', segs: 8 }));

    // porticoes on three sides: back wall, a row of columns, a lean-to roof
    const z1 = 26;
    const z2 = -27.4;
    const portH = 4.8;
    const plain = (x: number, z: number) => {
      b.cyl(0.24, portH - 0.35, STONE, { at: [x, 0.1, z], segs: 6, rTop: 0.2, jitter: false });
      b.box(0.62, 0.35, 0.62, STONE, { at: [x, portH - 0.25, z], jitter: false });
    };
    b.sym((s) => {
      b.box(0.6, portH + 0.9, z1 - z2 + 2.6, tint(STONE, -0.05), { at: [s * 15.7, 0, (z1 + z2 - 2.6) / 2] });
      for (let z = z1; z > z2 + 1; z -= 3.3) plain(s * PX, z);
      b.box(0.55, 0.55, z1 - z2 + 0.4, STONE, { at: [s * PX, portH + 0.1, (z1 + z2) / 2] });
      b.shed(3.4, z1 - z2 + 2.6, 1.05, P.romanTile, { at: [s * 14.3, portH + 0.65, (z1 + z2 - 2.6) / 2], high: s > 0 ? '+x' : '-x' });
    });
    b.box(32, portH + 0.9, 0.6, tint(STONE, -0.05), { at: [0, 0, z2 - 2.3] });
    for (let x = -9.9; x <= 9.91; x += 3.3) plain(x, z2);
    b.box(PX * 2, 0.55, 0.55, STONE, { at: [0, portH + 0.1, z2] });
    b.shed(PX * 2 - 0.6, 3.0, 1.05, P.romanTile, { at: [0, portH + 0.65, z2 - 1.2], high: '-z' });
    // honorary statues on bases in the open court
    b.sym((s) => {
      b.box(1.3, 1.8, 1.3, MARBLE, { at: [s * 8.5, 0, 20] });
      b.cyl(0.3, 2.0, P.bronze, { at: [s * 8.5, 1.8, 20], rTop: 0.22, segs: 6 });
      b.box(0.3, 0.32, 0.3, P.bronze, { at: [s * 8.5, 3.8, 20] });
    });

    b.collider(W, D + 4.4, { at: [0, 0, TZ + 2.2] });
    b.sym((s) => b.collider(3.2, z1 - z2 + 2.6, { at: [s * 14.5, 0, (z1 + z2 - 2.6) / 2] }));
    b.collider(32, 3.0, { at: [0, 0, z2 - 1.2] });
  },
};
