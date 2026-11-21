import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { balustrade } from './shared';

/** A Venetian (Palladian, or Serlian) window: arched centre light flanked by two lower square-headed ones. */
function venetianWindow(b: Builder, stone: number, at: [number, number, number], facing: '+z' | '-z' | '+x' | '-x'): void {
  const ang = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }[facing];
  b.group({ at, rotY: ang }, () => {
    b.panel(4.6, 0.25, stone, { at: [0, -0.25, 0], depth: 0.16 });
    b.window(1.5, 3.4, { shape: 'round', frame: P.white, bars: [2, 4] });
    b.sym((s) => {
      b.window(0.8, 2.4, { at: [s * 1.6, 0, 0], frame: P.white, bars: [2, 4] });
      b.panel(0.22, 2.4, stone, { at: [s * 0.95, 0, 0], depth: 0.14 });
      b.panel(0.22, 2.4, stone, { at: [s * 2.15, 0, 0], depth: 0.14 });
    });
    b.panel(4.5, 0.2, stone, { at: [0, 2.4, 0], depth: 0.14 });
  });
}

export const assemblyRooms: BuildingDef = {
  id: 'assembly-rooms',
  name: 'Assembly rooms',
  style: 'Georgian Palladian',
  date: '1771',
  summary:
    'The playhouse is long gone. In its place the gentry of the town and county built rooms for balls, concerts, card parties and tea, ' +
    'paid for by subscribers and run by a master of ceremonies who made the introductions. ' +
    'The design comes from the Palladian rulebook: a symmetrical block of smooth ashlar, a temple portico in the middle, ' +
    'and lower wings either side for the tea room and card room. Behind the tall windows of the upper storey is a ballroom two storeys high.',
  materials: ['Bath stone ashlar', 'Welsh slate', 'painted timber sashes', 'wrought iron railings'],
  modelledOn: 'Upper Assembly Rooms, Bath (John Wood the Younger, 1769-71)',
  lookFor: [
    { label: 'Portico', note: 'Four giant Ionic columns and a pediment: the front of a Roman temple applied to a building for dancing.', at: [0, 12.6, 10.6] },
    { label: 'Venetian window', note: 'An arched light between two lower square-headed ones. Palladio popularised it, and Georgian Britain used it everywhere.', at: [12.75, 4.8, 5.4] },
    { label: 'Ballroom windows', note: 'Tall sashes set high in the upper storey to flood the ballroom with light while leaving the walls clear for seating.', at: [-6.6, 8.2, 7.2] },
    { label: 'Rustication', note: 'The ground storey is cut into deep horizontal grooves so it looks heavier and stronger than the smooth walls above.', at: [-5.5, 2.2, 7.3] },
    { label: 'Balustrade', note: 'A parapet of turned stone balusters that hides the roof, so the building ends in a clean classical line.', at: [-13, 8.4, 5.4] },
  ],
  influences: ['palladianism'],
  build(b) {
    const stone = tint(P.bathStone, b.range(-0.03, 0.02));
    const light = tint(stone, 0.05);
    const W = 18; // main block width
    const D = 15; // depth
    const zf = 7; // main front
    const zc = zf - D / 2;
    const H = 11.6; // to the top of the cornice
    const base = 0.6;
    const g = 4.6; // ground storey top

    // ---------------------------------------------------------------- main block
    b.box(W + 0.4, base, D + 0.4, tint(stone, -0.06), { at: [0, 0, zc] });
    b.box(W, H - base, D, stone, { at: [0, base, zc] });
    for (let y = base + 0.5; y < g - 0.2; y += 0.55) {
      b.box(W + 0.08, 0.08, D + 0.08, tint(stone, -0.08), { at: [0, y, zc], jitter: false });
    }
    b.box(W + 0.24, 0.3, D + 0.24, light, { at: [0, g, zc] });
    b.box(W + 0.6, 0.55, D + 0.6, light, { at: [0, H - 0.55, zc] });
    b.hip(W - 1, D - 1, 2.4, P.slate, { at: [0, H, zc] });
    b.sym((s) => {
      balustrade(b, D + 0.4, 1.1, light, { at: [s * (W / 2 + 0.1), H, zc], rotY: Math.PI / 2 });
      b.chimney(0.9, 2.6, 2.0, stone, { at: [s * (W / 2 - 1.5), H, zc - 3] });
    });
    balustrade(b, W + 0.6, 1.1, light, { at: [0, H, zf + 0.1] });
    balustrade(b, W + 0.6, 1.1, light, { at: [0, H, zf - D - 0.1] });

    // front: five bays, the middle three behind the portico
    const bays = spread(5, -W / 2, W / 2);
    bays.forEach((x, i) => {
      const mid = i > 0 && i < 4;
      if (i !== 2) b.window(1.2, 2.3, { at: [x, base + 1.0, zf], facing: '+z', frame: P.white, bars: [2, 2] });
      b.window(1.6, 4.6, { at: [x, g + 1.3, zf], facing: '+z', frame: P.white, bars: [2, 4], shape: mid ? 'round' : 'rect' });
      if (!mid) {
        b.panel(2.3, 0.18, light, { at: [x, g + 6.0, zf], facing: '+z', depth: 0.2 });
        b.extrude([[-1.2, 0], [1.2, 0], [0, 0.55]], 0.24, light, { at: [x, g + 6.18, zf + 0.12] });
      }
    });
    b.panel(1.9, 3.2, P.doorGreen, { at: [0, 1.2, zf], facing: '+z' });
    // back and sides: plainer, but finished
    for (const x of bays) {
      b.window(1.2, 2.3, { at: [x, base + 1.0, zf - D], facing: '-z', frame: P.white, bars: [2, 2] });
      b.window(1.6, 4.6, { at: [x, g + 1.3, zf - D], facing: '-z', frame: P.white, bars: [2, 4] });
    }
    b.sym((s) => {
      for (const z of [zc - 4, zc + 4]) {
        b.window(1.6, 4.6, { at: [s * (W / 2), g + 1.3, z], facing: s > 0 ? '+x' : '-x', frame: P.white, bars: [2, 4] });
      }
    });

    // ---------------------------------------------------------------- the portico
    const pw = 11.2;
    const pd = 3.6;
    const pz = zf + pd / 2;
    const podium = 1.2;
    b.box(pw + 0.6, podium, pd + 0.4, tint(stone, -0.03), { at: [0, 0, pz + 0.2] });
    b.stairs(pw - 2.4, podium, 2.0, 5, tint(stone, -0.03), { at: [0, 0, zf + pd + 1.4] });
    const colH = H - podium - 1.6;
    for (const x of spread(4, -pw / 2, pw / 2)) {
      b.column(0.42, colH, light, { at: [x, podium, zf + pd - 0.6], order: 'ionic', segs: 10 });
    }
    b.sym((s) => b.box(0.9, colH, 0.5, light, { at: [s * (pw / 2 - 0.6), podium, zf + 0.25] })); // pilasters behind
    b.box(pw + 0.4, 1.6, pd + 0.2, light, { at: [0, podium + colH, pz] });
    b.box(pw + 0.7, 0.3, pd + 0.4, light, { at: [0, podium + colH + 1.3, pz] });
    b.gable(pw + 0.4, pd + 0.6, 2.4, P.slate, { at: [0, H, pz + 0.1], ridge: 'z', overhang: 0.3, wall: light });
    b.extrude([[-(pw / 2 + 0.2), 0], [pw / 2 + 0.2, 0], [0, 2.4]], 0.2, light, { at: [0, H, zf + pd + 0.3] });

    // ---------------------------------------------------------------- wings: tea room and card room
    const ww = 7.2;
    const wd = 11;
    const wz = zf - 1.6 - wd / 2;
    const wh = 7.6;
    b.sym((s) => {
      const x = s * (W / 2 + ww / 2);
      b.box(ww + 0.3, base, wd + 0.3, tint(stone, -0.06), { at: [x, 0, wz] });
      b.box(ww, wh - base, wd, stone, { at: [x, base, wz] });
      b.box(ww + 0.4, 0.45, wd + 0.4, light, { at: [x, wh - 0.45, wz] });
      b.hip(ww - 0.6, wd - 0.6, 1.8, P.slate, { at: [x, wh, wz] });
      balustrade(b, ww + 0.2, 1.0, light, { at: [x, wh, wz + wd / 2 + 0.1] });
      balustrade(b, wd + 0.2, 1.0, light, { at: [x + s * (ww / 2 + 0.1), wh, wz], rotY: Math.PI / 2 });
      venetianWindow(b, light, [x, 2.6, wz + wd / 2], '+z');
      for (const dx of [-1.5, 1.5]) b.window(1.3, 2.8, { at: [x + dx, 2.3, wz - wd / 2], facing: '-z', frame: P.white, bars: [2, 3] });
      for (const z of spread(2, wz - wd / 2, wz + wd / 2)) {
        b.window(1.4, 3.4, { at: [x + s * (ww / 2), 2.3, z], facing: s > 0 ? '+x' : '-x', frame: P.white, bars: [2, 3], shape: 'round' });
      }
      b.chimney(0.8, 1.6, 1.6, stone, { at: [x + s * 1.6, wh, wz - 2] });
    });

    // ---------------------------------------------------------------- forecourt
    const rz = 13.6;
    b.box(34, 0.08, rz - zf, tint(P.paving, 0.02), { at: [0, 0, (rz + zf) / 2] });
    b.sym((s) => {
      b.box(12.4, 0.5, 0.35, stone, { at: [s * 10.6, 0, rz] });
      for (const x of spread(15, 4.4, 16.8)) b.box(0.05, 1.1, 0.05, P.castIron, { at: [s * x, 0.5, rz] });
      b.box(12.4, 0.06, 0.08, P.castIron, { at: [s * 10.6, 1.5, rz] });
      b.box(0.7, 2.0, 0.7, stone, { at: [s * 4.1, 0, rz] });
      b.sphere(0.32, stone, { at: [s * 4.1, 2.3, rz], segs: 6 });
      // oil lamp on a bracket post
      b.cyl(0.07, 3.0, P.castIron, { at: [s * 3.0, 0, rz - 1.2], segs: 5 });
      b.box(0.36, 0.5, 0.36, P.windowLit, { at: [s * 3.0, 3.0, rz - 1.2] });
      b.pyramid(0.44, 0.44, 0.3, P.castIron, { at: [s * 3.0, 3.5, rz - 1.2] });
    });
    // a sedan chair waiting at the steps
    b.group({ at: [-4.4, 0, 11.2], rotY: 0.2 }, () => {
      b.box(0.8, 1.5, 0.9, P.black, { at: [0, 0.2, 0] });
      b.box(0.86, 0.12, 0.96, P.gold, { at: [0, 1.7, 0] });
      b.vault(0.86, 0.96, P.black, { at: [0, 1.82, 0], axis: 'x', squash: 0.4, segs: 6 });
      b.window(0.4, 0.6, { at: [0.4, 0.9, 0], facing: '+x', frame: P.gold });
      b.sym((s) => b.box(0.06, 0.06, 3.0, P.oakDark, { at: [s * 0.46, 1.0, 0] }));
    });

    b.collider(W + 2 * ww + 0.6, wd + 0.6, { at: [0, 0, wz] });
    b.collider(W, D, { at: [0, 0, zc] });
    b.collider(pw + 0.6, pd + 0.4, { at: [0, 0, pz + 0.2] });
    b.sym((s) => b.collider(12.4, 0.4, { at: [s * 10.6, 0, rz] }));
  },
};
