import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { BANK, BED, WATER, barrel, bar, circlePts, lin, rise, stakeBank, thatchRoof, vat, water, waterwheel } from './shared';

/**
 * The gearing of a Roman-type watermill: the wheel's horizontal shaft carries a cogged face wheel
 * whose pegs turn a lantern pinion on an upright spindle, and the spindle turns the upper millstone.
 * `at` is the centre of the face wheel; the shaft runs from it toward -Z.
 */
function millGear(b: Builder, at: Vec3, r: number, floorY: number) {
  const [x, y, z] = at;
  // the face wheel (rouet): a disc of planks on arms, with pegs standing out of its face toward +Z
  b.extrude(circlePts(r, 14), 0.2, P.oak, { at: [x, y, z], holes: [circlePts(r - 0.3, 14).reverse()] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    bar(b, x - Math.cos(a) * (r - 0.2), y - Math.sin(a) * (r - 0.2), x + Math.cos(a) * (r - 0.2), y + Math.sin(a) * (r - 0.2), 0.14, 0.16, P.oak, z);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.box(0.08, 0.08, 0.3, P.oakDark, { at: [x + Math.cos(a) * (r - 0.14), y + Math.sin(a) * (r - 0.14) - 0.04, z + 0.22], jitter: false });
  }
  // the lantern pinion: two discs joined by staves, on the upright spindle, meshing at the top
  const py = y + r - 0.35;
  const pz = z + 0.48;
  for (const dy of [0, 0.45]) b.cyl(0.32, 0.06, P.oak, { at: [x, py + dy, pz], segs: 8 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.cyl(0.035, 0.45, P.oakDark, { at: [x + Math.cos(a) * 0.26, py, pz + Math.sin(a) * 0.26], segs: 4, jitter: false });
  }
  b.cyl(0.07, floorY - py + 0.3, P.iron, { at: [x, py, pz], segs: 5 });
  // the millstones on the floor above: the fixed bed stone and the turning runner, with the hopper
  b.cyl(0.62, 0.22, P.granite, { at: [x, floorY, pz], segs: 12 });
  b.cyl(0.6, 0.2, tint(P.granite, 0.06), { at: [x, floorY + 0.24, pz], segs: 12 });
  b.box(1.5, 0.12, 1.5, P.oak, { at: [x, floorY + 0.95, pz] });
  b.cone(0.5, 0.6, P.oak, { at: [x, floorY + 0.7, pz], segs: 4, rot: [Math.PI, Math.PI / 4, 0] });
}

/** A bread oven: a clay dome on a stone base, its mouth toward `facing`. */
function breadOven(b: Builder, at: Vec3, rotY: number, clay: number, stone: number) {
  b.group({ at, rotY }, () => {
    b.box(2.6, 0.9, 2.6, stone, { at: [0, 0, 0] });
    b.dome(1.15, clay, { at: [0, 0.9, 0], squash: 0.75, segs: 10 });
    b.panel(0.5, 0.4, P.timberBlack, { at: [0, 0.95, 1.12], facing: '+z', shape: 'round' });
    b.box(0.3, 0.6, 0.3, tint(clay, -0.08), { at: [0, 0.9 + 0.7, -0.4] }); // flue
  });
}

export const abbeyMill: BuildingDef = {
  id: 'abbey-mill',
  name: 'The abbey’s watermill, bakehouse and brewhouse',
  style: 'Merovingian',
  date: 'c. 620',
  summary:
    'The Roman town is a ruin, and the land by the river now belongs to the abbey outside the walls, which must feed its monks, its servants and the poor at its gate. ' +
    'Monks did not invent the watermill, which the Romans had known, but abbeys were among the few with the capital and the steady demand to build one: here a vertical wheel turned by the current drives a pair of millstones through wooden gears. ' +
    'Beside it stand a bakehouse with its domed oven and a brewhouse where barley was malted and brewed into beer, the everyday drink of the north. ' +
    'Everything is timber and thatch or shingle again, on footings of stone taken from the ruins. Select the mill to see its gears.',
  materials: ['oak frame and planks', 'shingles', 'thatch', 'wattle and daub', 'reused Roman stone', 'millstones'],
  modelledOn: 'Generic. The workings follow the Roman water mill described by Vitruvius; the bakers, brewers and mills of a Frankish abbey are set out in the statutes of Abbot Adalhard of Corbie, in Picardy (822)',
  lookFor: [
    { label: 'Vertical waterwheel', note: 'An undershot wheel standing upright in the mill race, its paddles pushed round by the current.', at: [-7.0, 2.6, -12.6] },
    { label: 'Face wheel and lantern pinion', note: 'Pegs on a big upright gear turn a small cage of staves, changing the drive from horizontal to vertical and speeding it up.', at: [-7.0, 1.8, -7.6] },
    { label: 'Millstones', note: 'The upper stone, the runner, turns on the fixed bed stone; grain is fed in from the hopper above.', at: [-7.0, 2.8, -7.0] },
    { label: 'Mill race and sluice', note: 'A plank wall in the river makes a channel to the wheel; a sluice gate lets the miller start and stop it.', at: [-13.5, 0.2, -13.6] },
    { label: 'Bread oven', note: 'A dome of clay heated with a wood fire, raked out, then filled with loaves to bake in the stored heat.', at: [6.8, 2.2, -4.4] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.rubble, P.limestone, tint(P.rubble, 0.05)]);
    const clay = b.pick([P.daub, P.torchis]);
    const thatch = b.pick([P.thatch, P.thatchOld]);
    const timber = P.oak;

    b.box(35, 0.04, 21.6, tint(P.earth, 0.06), { at: [0, 0, 0], jitter: false });
    stakeBank(b, -17.5, -14.5);
    stakeBank(b, 0.5, 17.5);

    // ---- the race: a plank and pile wall built out into the river, with a sluice at its head
    const cz = -13.8;
    for (const x of lin(15, -14.5, 0.5)) b.cyl(0.12, 2.6, P.oakDark, { at: [x, BED, cz], segs: 5 });
    b.box(15, 1.7, 0.14, tint(P.oakDark, 0.08), { at: [-7, BED + 0.6, cz] });
    b.box(15, 0.2, 2.8, P.oakDark, { at: [-7, BED, (cz + BANK) / 2] });
    water(b, 15, 2.6, [-7, WATER + 0.1, (cz + BANK) / 2]);
    // plank walls lining the bank where the race runs
    b.box(15, -BED + 0.1, 0.16, tint(P.oakDark, 0.04), { at: [-7, BED, BANK - 0.08] });
    // the sluice: two posts, a gate and a windlass beam over the channel
    b.sym((s) => b.box(0.3, 3.4, 0.3, timber, { at: [-13.6, BED, (cz + BANK) / 2 + s * 1.3] }));
    b.box(0.3, 0.3, 3.0, timber, { at: [-13.6, 1.0, (cz + BANK) / 2] });
    b.box(0.12, 1.4, 2.4, tint(timber, -0.06), { at: [-13.6, WATER - 0.2, (cz + BANK) / 2] });
    b.box(0.1, 1.4, 0.1, timber, { at: [-13.6, -0.3, (cz + BANK) / 2] });

    // ---- the mill house: a timber frame on stone footings, plank walls, shingled roof
    const mx = -7;
    const mz = -7.4;
    const MW = 7.2;
    const MD = 6.0;
    const H = 4.6;
    const floorY = 2.2;
    const front = mz + MD / 2;
    const back = mz - MD / 2;
    b.box(MW + 0.3, 0.6, MD + 0.3, stone, { at: [mx, 0, mz] });
    const wall = tint(P.oak, 0.12);
    b.box(MW, H - 0.6, 0.15, wall, { at: [mx, 0.6, back + 0.08] });
    b.box(0.15, H - 0.6, MD, wall, { at: [mx - MW / 2 + 0.08, 0.6, mz] });
    b.frame(MW, H - 0.6, P.oakDark, { at: [mx, 0.6, back], facing: '-z', studs: 4, rails: 1 });
    b.frame(MD, H - 0.6, P.oakDark, { at: [mx - MW / 2, 0.6, mz], facing: '-x', studs: 3, rails: 1, brace: 'corner' });
    // the shaft hole in the back wall
    b.panel(0.7, 0.7, P.timberBlack, { at: [mx, 0.25, back - 0.02], facing: '-z' });
    // the stone floor (the hurst) inside, on posts over the gear pit
    b.box(2.0, 0.15, 1.8, P.pine, { at: [mx, floorY - 0.15, -7.5] });
    for (const x of [mx - 0.9, mx + 0.9]) for (const z of [-8.3, -6.7]) b.box(0.2, floorY - 0.15, 0.2, timber, { at: [x, 0, z] });
    b.box(2.6, 0.05, 2.0, P.timberBlack, { at: [mx, 0.6, mz - 0.9], jitter: false }); // the gear pit
    b.box(MW - 0.4, 0.06, MD - 0.4, tint(P.earth, -0.02), { at: [mx, 0.6, mz], jitter: false });
    millGear(b, [mx, 0.5, -8.0], 1.1, floorY);
    // a ladder to the stone floor and sacks of grain and flour
    b.beam([mx + 2.6, 0.6, mz + 2.4], [mx + 2.6, floorY, mz + 1.5], 0.6, 0.08, timber);
    for (const [x, z] of [
      [mx - 2.4, mz + 2.0],
      [mx - 1.8, mz + 2.3],
      [mx - 2.1, mz + 1.4],
    ]) b.blob(0.32, P.cream, { at: [x, 0.95, z], stretch: [1, 1.3, 1], detail: 0 });

    // the wheel in the race, its shaft into the mill
    waterwheel(b, { at: [mx, WATER - 0.3 + 2.1, -12.6], r: 2.1, width: 1.0, paddles: 14, spokes: 6, spin: b.rand(), axle: 4.2, axleDir: 1 });

    // the front and east walls and the roof: left off when the mill is opened to show its gears
    if (b.cutaway) {
      b.box(MW, 0.9, 0.15, wall, { at: [mx, 0.6, front - 0.08] });
      b.box(0.15, 0.9, MD, wall, { at: [mx + MW / 2 - 0.08, 0.6, mz] });
      for (const [x, z] of [
        [mx + MW / 2 - 0.1, front - 0.1],
        [mx - MW / 2 + 0.1, front - 0.1],
        [mx + MW / 2 - 0.1, back + 0.1],
      ]) b.box(0.22, H - 0.6, 0.22, P.oakDark, { at: [x, 0.6, z] });
    } else {
      b.box(MW, H - 0.6, 0.15, wall, { at: [mx, 0.6, front - 0.08] });
      b.box(0.15, H - 0.6, MD, wall, { at: [mx + MW / 2 - 0.08, 0.6, mz] });
      b.frame(MW, H - 0.6, P.oakDark, { at: [mx, 0.6, front], facing: '+z', studs: 4, rails: 1 });
      b.frame(MD, H - 0.6, P.oakDark, { at: [mx + MW / 2, 0.6, mz], facing: '+x', studs: 3, rails: 1, brace: 'corner' });
      b.panel(1.4, 2.2, P.oakDark, { at: [mx - 1.2, 0.6, front + 0.05], facing: '+z' });
      b.gable(MW, MD, rise(MD, 45), P.shingle, { at: [mx, H, mz], overhang: 0.45, wall, thick: 0.15 });
    }

    // ---- the bakehouse: cob on a stone sill, a thatched roof, the oven built against its end
    const kx = 5.0;
    const kz = -3.0;
    b.box(6.4, 0.5, 4.6, stone, { at: [kx, 0, kz] });
    b.box(6.2, 2.3, 4.4, clay, { at: [kx, 0.5, kz] });
    b.frame(6.2, 2.3, P.oakDark, { at: [kx, 0.5, kz + 2.2], facing: '+z', studs: 3, rails: 1 });
    b.frame(6.2, 2.3, P.oakDark, { at: [kx, 0.5, kz - 2.2], facing: '-z', studs: 3, rails: 1 });
    thatchRoof(b, 6.2, 4.4, [kx, 2.8, kz], { color: thatch });
    b.panel(1.1, 1.9, P.oakDark, { at: [kx - 1.2, 0.5, kz + 2.25], facing: '+z' });
    breadOven(b, [kx + 3.2 + 1.2, 0, kz - 1.0], Math.PI / 2, tint(clay, -0.06), stone);
    b.box(1.6, 0.8, 0.8, P.oak, { at: [kx + 1.5, 0, kz + 3.0] }); // a kneading trough
    b.box(2.4, 0.9, 1.2, P.bark, { at: [kx + 5.0, 0, kz + 1.6] }); // faggots for the oven
    b.box(2.2, 0.35, 1.0, tint(P.bark, 0.05), { at: [kx + 5.0, 0.9, kz + 1.6] });

    // ---- the brewhouse: a longer thatched hall with a smoke louvre, vats and casks outside
    const rx = 7.6;
    const rz = 5.8;
    b.box(9.0, 0.5, 5.0, stone, { at: [rx, 0, rz] });
    b.box(8.8, 2.4, 4.8, clay, { at: [rx, 0.5, rz] });
    b.frame(8.8, 2.4, P.oakDark, { at: [rx, 0.5, rz + 2.4], facing: '+z', studs: 5, rails: 1 });
    b.frame(8.8, 2.4, P.oakDark, { at: [rx, 0.5, rz - 2.4], facing: '-z', studs: 5, rails: 1 });
    thatchRoof(b, 8.8, 4.8, [rx, 2.9, rz], { color: tint(thatch, 0.04) });
    const top = 2.9 + rise(4.8, 50);
    b.box(1.4, 0.7, 0.9, P.oakDark, { at: [rx + 1.5, top - 0.25, rz] }); // the smoke louvre on the ridge
    b.gable(1.6, 1.1, 0.5, thatch, { at: [rx + 1.5, top + 0.45, rz] });
    b.panel(1.4, 2.0, P.oakDark, { at: [rx - 2.6, 0.5, rz - 2.45], facing: '-z' });
    for (const [x, z] of [
      [rx - 1.0, rz - 3.6],
      [rx + 1.0, rz - 3.6],
    ]) vat(b, 0.75, 1.0, [x, 0, z], 0xa47a3a);
    for (let i = 0; i < 3; i++) barrel(b, [rx + 3.0 + i * 0.75, 0, rz - 3.4], true);
    barrel(b, [rx + 3.7, 0.8, rz - 3.4], false);
    for (const x of lin(3, -2.4, -0.4)) b.blob(0.32, P.cream, { at: [x, 0.3, -9.0], stretch: [1, 1.3, 1], detail: 0 });

    // ---- the abbey's fence and gate to the road, and a cart for the grain
    b.box(12, 1.6, 0.2, P.oakDark, { at: [-11.6, 0, 10.4] });
    b.box(5, 1.6, 0.2, P.oakDark, { at: [15.5, 0, 10.4] });
    for (const x of [-5.6, -1.2]) b.box(0.3, 2.6, 0.3, P.oakDark, { at: [x, 0, 10.4] });
    b.box(4.8, 0.3, 0.4, P.oakDark, { at: [-3.4, 2.6, 10.4] });
    b.gable(5.4, 1.2, 0.7, P.shingle, { at: [-3.4, 2.9, 10.4] });
    b.box(2.6, 0.2, 1.3, P.oak, { at: [-1.5, 0.9, 1.5] });
    for (const z of [0.85, 2.15]) b.log(0.5, 0.1, P.oakDark, { at: [-1.5, 0, z], axis: 'x', segs: 10 });
    b.beam([-0.2, 0.95, 1.3], [1.8, 0.6, 1.0], 0.1, 0.1, P.oak);
    b.beam([-0.2, 0.95, 1.7], [1.8, 0.6, 2.0], 0.1, 0.1, P.oak);
    b.tree(7, { at: [-15.0, 0, 4.0], kind: 'round' });
    b.tree(6, { at: [15.8, 0, -1.0], kind: 'round' });

    b.collider(MW + 0.3, MD + 0.3, { at: [mx, 0, mz] });
    b.collider(6.4, 4.6, { at: [kx, 0, kz] });
    b.collider(2.6, 2.6, { at: [kx + 4.4, 0, kz - 1.0] });
    b.collider(9.0, 5.0, { at: [rx, 0, rz] });
  },
};
