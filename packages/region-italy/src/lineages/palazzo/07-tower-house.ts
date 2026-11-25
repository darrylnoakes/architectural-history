import { P, tint, type BuildingDef } from '@ah/kit';
import { block, compoundWalls, coppiRibs, onFace, TOWER, towerShaft, wellHead, win } from './shared';

export const towerHouse: BuildingDef = {
  id: 'tower-house',
  name: 'Tower house (casa-torre)',
  style: 'Romanesque',
  date: 'c. 1150',
  summary:
    'In the age of the communes the great families compete by building upward. ' +
    'Beside its house each clan raises a tall square tower of stone, with walls well over a metre thick at the base, few and small openings, and a door well above the ground reached by a ladder or timber stair: a refuge in the feuds between families and a sign of rank on the skyline. ' +
    'Rows of holes left by the builders’ scaffolding (putlog holes) also take the beams of timber balconies and walkways that could link one tower to the next. ' +
    'The house at its foot has a shop arch on the street and upper floors jettied out on timber brackets; behind, the yard is still closed by the walls of the old compound, round the same well.',
  materials: ['squared stone (pietraforte or travertine)', 'rubble core', 'timber balconies and jetties', 'coppi roof tiles'],
  modelledOn: 'The towers of San Gimignano and Bologna',
  influences: [],
  lookFor: [
    { label: 'Family tower', note: 'A tall square tower with very thick walls and tiny openings, more refuge and status symbol than home.', at: [-7.2, 22.0, 9.1] },
    { label: 'Putlog holes', note: 'Rows of square holes left by the scaffolding; beams slotted into them carried balconies and walkways.', at: [-7.2, 12.2, 9.05] },
    { label: 'Timber balcony (ballatoio)', note: 'A wooden gallery on beams pushed into the putlog holes, roofed with a little pent of tiles.', at: [-11.6, 10.2, 5.8] },
    { label: 'Raised doorway', note: 'The tower door is high above the yard, reached by a timber stair that could be taken away.', at: [-8.8, 5.6, 2.45] },
    { label: 'Jettied upper floors (sporti)', note: 'The upper storeys of the house project over the street on timber brackets.', at: [4.0, 4.2, 12.2] },
  ],
  build(b) {
    const stone = b.pick([P.pietraForte, P.travertine, tint(P.pietraForte, 0.05)]);
    const wood = b.pick([P.oakDark, P.oak]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const render = b.pick([P.intonacoCream, P.plaster, P.intonacoOchre]);

    // ---- the tower (built in two parts: the Gothic palace keeps the lower one)
    const { T, x: tx, z: tz, H: TH } = TOWER;
    towerShaft(b, stone, wood, 'lower');
    towerShaft(b, stone, wood, 'upper');
    b.crenel(T + 0.3, T + 0.3, stone, { at: [tx, TH, tz], merlonW: 0.8, merlonH: 0.9, t: 0.5 });
    b.box(T + 0.3, 0.3, T + 0.3, stone, { at: [tx, TH - 0.3, tz] });
    // the timber stair up the back of the tower to the raised door, which could be taken away
    const dx = tx - 1.6;
    b.stairs(1.0, 4.5, 4.0, 10, wood, { at: [dx + 2.65, 0, tz - T / 2 - 0.55], rotY: Math.PI / 2 });
    b.box(1.3, 0.15, 1.1, wood, { at: [dx, 4.45, tz - T / 2 - 0.55] });
    b.collider(4.0, 1.0, { at: [dx + 2.65, 0, tz - T / 2 - 0.55] });
    // timber balcony on beams, under a lean-to of tiles, on the side street
    onFace(b, '-x', [tx - T / 2, 0, tz], () => {
      const by = 9.6;
      for (const x of [-2.2, 0, 2.2]) b.box(0.22, 0.22, 1.8, wood, { at: [x, by - 0.22, 0.7] });
      b.box(T, 0.15, 1.5, wood, { at: [0, by, 0.75] });
      b.box(T, 0.1, 0.1, wood, { at: [0, by + 1.0, 1.45] });
      for (let i = 0; i < 9; i++) b.box(0.08, 1.0, 0.08, wood, { at: [-T / 2 + 0.3 + i * 0.72, by, 1.45] });
      for (const sx of [-1, 1]) b.box(0.12, 2.4, 0.12, wood, { at: [sx * (T / 2 - 0.2), by, 1.4] });
      b.shed(T + 0.4, 1.8, 0.5, roof, { at: [0, by + 2.4, 0.85], high: '-z' });
      b.panel(1.0, 2.0, wood, { at: [0, by + 0.15, 0], shape: 'round', depth: 0.06 });
    });

    // ---- the house at its foot: stone ground floor with a shop arch, jettied plastered floors above
    const hx = 3.3;
    const hw = 14.0;
    const G = 3.6;
    block(b, hw, G, 7.6, stone, hx, 7.8);
    onFace(b, '+z', [hx, 0, 11.6], () => {
      b.archWall(4.0, G, 0.3, stone, { at: [-3.0, 0, 0.15], openings: 1, openW: 3.2, openH: 3.2, shape: 'round' });
      b.panel(3.2, 3.2, 0x2a2420, { at: [-3.0, 0, 0], shape: 'round', depth: 0.03 });
      b.box(3.2, 0.9, 0.5, wood, { at: [-3.0, 0, 0.25] });
      b.panel(1.2, 2.4, wood, { at: [2.5, 0, 0], shape: 'round', depth: 0.08 });
      win(b, 5.5, 1.6, 0.8, 1.0, tint(stone, 0.05), { shape: 'round', border: 0.12 });
    });
    // brackets and the jettied upper floors
    for (let i = 0; i < 8; i++) {
      const x = hx - hw / 2 + 0.6 + i * ((hw - 1.2) / 7);
      b.beam([x, G - 0.8, 11.6], [x, G, 12.5], 0.18, 0.18, wood);
      b.box(0.2, 0.2, 1.2, wood, { at: [x, G - 0.05, 12.05] });
    }
    b.box(hw, 5.2, 8.6, render, { at: [hx, G, 8.2] });
    b.frame(hw, 5.2, wood, { at: [hx, G, 12.5], facing: '+z', studs: 7, rails: 1 });
    onFace(b, '+z', [hx, 0, 12.5], () => {
      for (const x of [-5, -1.7, 1.7, 5]) {
        win(b, x, G + 0.9, 0.9, 1.4, wood, { border: 0.1 });
        win(b, x, G + 3.4, 0.9, 1.2, wood, { border: 0.1 });
      }
    });
    b.gable(hw, 8.6, 2.0, roof, { at: [hx, G + 5.2, 8.2], overhang: 0.35, wall: render });
    coppiRibs(b, hx - hw / 2 - 0.2, hx + hw / 2 + 0.2, 8.2, 8.6, G + 5.2, 2.0, 0.35, tint(roof, -0.06), 0.9, [1]);
    onFace(b, '+x', [hx + hw / 2, 0, 8], () => {
      win(b, 0, 1.6, 0.8, 1.0, tint(stone, 0.05), { shape: 'round', border: 0.12 });
      win(b, 0, G + 1.6, 0.9, 1.4, wood, { border: 0.1 });
    });
    onFace(b, '-z', [hx, 0, 3.9], () => {
      for (const x of [-4, 0, 4]) win(b, x, G + 1.6, 0.9, 1.4, wood, { border: 0.1 });
      b.panel(1.2, 2.4, wood, { at: [-2, 0, 0], depth: 0.08 });
    });

    // ---- the yard behind: the old walls of the Lombard compound, its well, a lean-to store, a vegetable plot
    compoundWalls(b, tint(stone, -0.04));
    wellHead(b, stone, 'wood', wood);
    block(b, 8, 4.0, 4, stone, 6.5, -9.0);
    b.shed(8.4, 4.4, 1.2, roof, { at: [6.5, 4.0, -9.0], high: '-z' });
    b.panel(2.4, 2.6, wood, { at: [6.5, 0, -7.0], facing: '+z', depth: 0.06 });
    b.box(7, 0.1, 5, P.soil, { at: [-6.5, 0, -8.0] });
    for (let i = 0; i < 4; i++) b.box(6.6, 0.25, 0.3, P.leaf, { at: [-6.5, 0.1, -9.8 + i * 1.2] });
    b.tree(6, { kind: 'olive', at: [-2.0, 0, -9.5] });
  },
};
