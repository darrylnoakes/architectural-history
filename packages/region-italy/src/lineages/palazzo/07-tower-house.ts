import { P, tint, type BuildingDef } from '@ah/kit';
import { block, coppiRibs, onFace, win } from './shared';

export const towerHouse: BuildingDef = {
  id: 'tower-house',
  name: 'Tower house (casa-torre)',
  style: 'Romanesque',
  date: 'c. 1150',
  summary:
    'In the age of the communes the great families compete by building upward. ' +
    'Beside its house each clan raises a tall square tower of stone, with walls well over a metre thick at the base, few and small openings, and a door well above the street reached by a ladder or timber stair: a refuge in the feuds between families and a sign of rank on the skyline. ' +
    'Rows of holes left by the builders’ scaffolding (putlog holes) also take the beams of timber balconies and walkways that could link one tower to the next. ' +
    'The house at its foot has a shop arch on the street and upper floors jettied out on timber brackets.',
  materials: ['squared stone (pietraforte or travertine)', 'rubble core', 'timber balconies and jetties', 'coppi roof tiles'],
  modelledOn: 'The towers of San Gimignano and Bologna',
  influences: [],
  lookFor: [
    { label: 'Family tower', note: 'A tall square tower with very thick walls and tiny openings, more refuge and status symbol than home.', at: [-6.5, 22.0, 6.4] },
    { label: 'Putlog holes', note: 'Rows of square holes left by the scaffolding; beams slotted into them carried balconies and walkways.', at: [-6.5, 12.2, 6.3] },
    { label: 'Timber balcony (ballatoio)', note: 'A wooden gallery on beams pushed into the putlog holes, roofed with a little pent of tiles.', at: [-11.0, 10.2, 3.0] },
    { label: 'Raised doorway', note: 'The tower door is high above the street, reached by a timber stair that could be removed.', at: [-3.0, 5.6, 1.4] },
    { label: 'Jettied upper floors (sporti)', note: 'The upper storeys of the house project over the street on timber brackets.', at: [4.0, 4.2, 12.2] },
  ],
  build(b) {
    const stone = b.pick([P.pietraForte, P.travertine, tint(P.pietraForte, 0.05)]);
    const wood = b.pick([P.oakDark, P.oak]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const render = b.pick([P.intonacoCream, P.plaster, P.intonacoOchre]);

    // ---- the tower
    const T = 6.4;
    const tx = -6.5;
    const tz = 3.0;
    const TH = 27;
    block(b, T + 0.4, 2.0, T + 0.4, stone, tx, tz);
    b.box(T, TH, T, stone, { at: [tx, 0, tz] });
    for (let y = 1.6; y < TH; y += 1.6) b.box(T + 0.03, 0.04, T + 0.03, tint(stone, -0.08), { at: [tx, y, tz], jitter: false });
    b.crenel(T + 0.3, T + 0.3, stone, { at: [tx, TH, tz], merlonW: 0.8, merlonH: 0.9, t: 0.5 });
    b.box(T + 0.3, 0.3, T + 0.3, stone, { at: [tx, TH - 0.3, tz] });
    // putlog holes on every face and a few narrow slits
    for (const f of ['+z', '-z', '+x', '-x'] as const) {
      const at: [number, number, number] =
        f === '+z' ? [tx, 0, tz + T / 2] : f === '-z' ? [tx, 0, tz - T / 2] : f === '+x' ? [tx + T / 2, 0, tz] : [tx - T / 2, 0, tz];
      onFace(b, f, at, () => {
        for (let y = 6; y < TH - 2; y += 3.2) for (const x of [-2.2, 0, 2.2]) b.panel(0.25, 0.25, 0x2a2420, { at: [x, y, 0], depth: 0.03 });
        for (const y of [13, 19.5]) win(b, 0.9, y, 0.35, 1.3, tint(stone, 0.05), { shape: 'round', border: 0.1, n: 3 });
      });
    }
    // the raised door with its timber stair
    onFace(b, '+x', [tx + T / 2, 0, tz], () => win(b, -1.6, 4.6, 0.9, 2.0, tint(stone, 0.06), { shape: 'round', border: 0.15, glass: wood, n: 4 }));
    b.stairs(1.0, 4.5, 4.0, 10, wood, { at: [tx + T / 2 + 0.55, 0, tz - 2.6], rotY: Math.PI });
    b.box(1.1, 0.15, 1.3, wood, { at: [tx + T / 2 + 0.55, 4.45, tz + 1.6] });
    b.collider(1.0, 4.0, { at: [tx + T / 2 + 0.55, 0, tz - 2.6] });
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
    const hx = 3.6;
    const hw = 14.6;
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

    // ---- the yard behind: wall, well, a lean-to store, a vegetable plot
    b.sym((s) => block(b, 0.5, 3.0, 15.4, stone, s * 11.4, -4.7));
    block(b, 23.3, 3.0, 0.5, stone, 0, -12.4);
    block(b, 8, 4.0, 4, stone, 6.5, -9.0);
    b.shed(8.4, 4.4, 1.2, roof, { at: [6.5, 4.0, -9.0], high: '-z' });
    b.panel(2.4, 2.6, wood, { at: [6.5, 0, -7.0], facing: '+z', depth: 0.06 });
    b.cyl(0.7, 0.9, stone, { at: [-1.5, 0, -2.0], segs: 8 });
    b.cyl(0.55, 0.92, P.windowDark, { at: [-1.5, 0, -2.0], segs: 8 });
    b.box(7, 0.1, 5, P.soil, { at: [-6.5, 0, -8.0] });
    for (let i = 0; i < 4; i++) b.box(6.6, 0.25, 0.3, P.leaf, { at: [-6.5, 0.1, -9.8 + i * 1.2] });
    b.tree(6, { kind: 'olive', at: [-2.0, 0, -9.5] });
  },
};
