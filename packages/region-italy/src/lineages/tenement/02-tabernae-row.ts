import { P, tint, type BuildingDef } from '@ah/kit';
import { PW, coppiRoof, patch, wellHead } from './shared';

const N = 5; // shops
const BW = 4.8; // bay width
const L = N * BW;
const ZF = 6.3; // street front wall (outer face)
const T = 0.5; // wall thickness
const ZB = -1.9; // back wall (outer face)
const D = ZF - ZB;
const G = 3.2; // shop opening and mezzanine floor level
const H = 5.4; // wall top

export const tabernaeRow: BuildingDef = {
  id: 'tabernae-row',
  name: 'Row of tabernae',
  style: 'Roman Republican',
  date: 'c. 300 BC',
  summary:
    'As the town grew rich on Rome’s conquests, landowners lined the streets with rows of tabernae: single rooms opening on the street through a doorway as wide as the room, let to a cobbler, a fuller, a seller of oil or bread. ' +
    'The family worked at the front and slept in the back room or on a timber mezzanine (pergula) under the roof, reached by a ladder and lit by one small window over the door. ' +
    'At night the front was shut with boards slotted into a groove in the stone threshold. Walls are tufa, squared at the piers and rubble between, under a roof of flat and curved fired tiles that replaces the thatch of the huts.',
  materials: ['tufa blocks', 'tufa rubble in lime mortar', 'timber lintels and boards', 'fired roof tiles (tegulae and imbrices)'],
  lookFor: [
    { label: 'Wide shop front', note: 'The whole width of the room opens on the street, so work and goods spill out onto the pavement by day.', at: [-2.4, 2.0, ZF + 0.3] },
    { label: 'Shutter boards', note: 'At night upright boards were slid into a groove cut along the stone threshold and barred behind a narrow door.', at: [-9.6, 1.6, ZF + 0.3] },
    { label: 'Mezzanine window', note: 'A small window over each shop lit the pergula, the timber loft where the shopkeeper’s family slept.', at: [7.2, 4.3, ZF + 0.2] },
    { label: 'Ladder to the pergula', note: 'Inside, a ladder climbs to the loft over the front half of the shop.', at: [-1.1, 2.2, 3.8] },
    { label: 'Tile roof', note: 'Flat tiles with upturned edges (tegulae) laid side by side, the joints covered by half-round tiles (imbrices).', at: [0, 7.2, 2.2] },
  ],
  influences: ['greek-colonies'],
  build(b) {
    const tufa = b.pick([P.tufa, tint(P.tufa, 0.03), tint(P.tufa, -0.03)]);
    const ashlar = tint(tufa, 0.05);
    const roof = b.pick([P.romanTile, tint(P.romanTile, -0.04), P.coppi]);
    const zc = (ZF + ZB) / 2;

    // street pavement of basalt polygons and a raised kerb (crepido) in front of the shops
    patch(b, PW, 8 - ZF, P.cobble, [0, (ZF + 8) / 2], 0.18);
    b.box(PW, 0.22, 0.25, P.peperino, { at: [0, 0, 7.75] });

    // floor inside and back yard
    patch(b, L, D, tint(P.earth, -0.05), [0, zc], 0.05);
    patch(b, L + 1, 8 + ZB, tint(P.earth, 0.06), [0, (ZB - 8) / 2], 0.03);

    // the front: a wall pierced by five wide openings, timber lintels, ashlar piers between
    const openW = 3.3;
    b.archWall(L, H, T, tufa, { at: [0, 0, ZF - T / 2], facing: '+z', openings: N, openW, openH: G, shape: 'rect' });
    for (let i = 0; i <= N; i++) {
      const x = -L / 2 + i * BW;
      b.box(i === 0 || i === N ? 0.75 : 1.5, G, 0.06, ashlar, { at: [x + (i === 0 ? 0.37 : i === N ? -0.37 : 0), 0, ZF] });
      for (let k = 1; k < 5; k++) b.box(i === 0 || i === N ? 0.75 : 1.5, 0.03, 0.08, tint(ashlar, -0.1), { at: [x + (i === 0 ? 0.37 : i === N ? -0.37 : 0), (G * k) / 5, ZF] });
    }
    // side and back walls, party walls
    b.box(T, H, D, tufa, { at: [-L / 2 + T / 2, 0, zc] });
    b.box(T, H, D, tufa, { at: [L / 2 - T / 2, 0, zc] });
    b.box(L, H, T, tufa, { at: [0, 0, ZB + T / 2] });
    for (let i = 1; i < N; i++) b.box(0.4, H, D - T, tufa, { at: [-L / 2 + i * BW, 0, zc] });
    // cross wall between shop and back room, with a doorway (as two pieces and a head)
    const zx = 1.2;
    for (let i = 0; i < N; i++) {
      const x = -L / 2 + (i + 0.5) * BW;
      b.box(BW - 1.4, H, 0.35, tufa, { at: [x - 0.5, 0, zx] });
      b.box(0.9, H - 2.1, 0.35, tufa, { at: [x + 1.65, 2.1, zx] });
      b.panel(0.85, 2.05, P.timberBlack, { at: [x + 1.65, 0.05, zx + 0.18], facing: '+z', depth: 0.02 });
    }
    // eaves course and roof
    b.box(L + 0.1, 0.18, D + 0.1, ashlar, { at: [0, H - 0.18, zc] });
    coppiRoof(b, L, D, 21, roof, { at: [0, H, zc], ov: 0.55, wall: tufa, rib: 0.5 });

    const goods = [P.terracotta, P.mud, P.wattle, P.cream, P.oak];
    const closed = new Set<number>();
    closed.add(0);
    if (b.chance(0.5)) closed.add(b.pick([3, 4]));
    for (let i = 0; i < N; i++) {
      const x = -L / 2 + (i + 0.5) * BW;
      // timber lintel and the stone threshold with its groove
      b.box(openW + 0.5, 0.3, T + 0.04, P.oakDark, { at: [x, G - 0.3, ZF - T / 2] });
      b.box(openW, 0.16, T + 0.1, P.travertine, { at: [x, 0, ZF - T / 2] });
      b.box(openW, 0.02, 0.06, P.timberBlack, { at: [x, 0.16, ZF - 0.12] });
      // mezzanine floor over the front half, a small window over the opening
      b.box(BW - 0.4, 0.16, ZF - T - 3.2, P.oak, { at: [x, G, ZF - T - (ZF - T - 3.2) / 2] });
      b.window(0.8, 0.75, { at: [x, G + 0.6, ZF], facing: '+z', frame: P.oakDark, glass: P.windowDark, bars: [3, 1], border: 0.07 });
      if (closed.has(i)) {
        // shutters: a row of upright boards with a narrow door
        b.panel(openW - 0.05, G - 0.46, tint(P.oak, -0.05), { at: [x, 0.16, ZF - 0.16], facing: '+z', depth: 0.05 });
        for (let k = 1; k < 9; k++) b.panel(0.03, G - 0.46, P.oakDark, { at: [x - openW / 2 + (openW * k) / 9, 0.16, ZF - 0.11], facing: '+z', depth: 0.03 });
        b.panel(0.75, 1.9, P.oakDark, { at: [x + openW / 2 - 0.55, 0.16, ZF - 0.1], facing: '+z', depth: 0.04 });
      } else {
        // open: a masonry counter, wares, and the ladder to the pergula
        const cw = b.range(1.3, 1.9);
        b.box(cw, 0.95, 0.6, tint(P.plaster, -0.04), { at: [x - openW / 2 + cw / 2 + 0.15, 0.05, ZF - T - 0.4] });
        b.box(cw + 0.06, 0.06, 0.66, P.travertine, { at: [x - openW / 2 + cw / 2 + 0.15, 1.0, ZF - T - 0.4] });
        for (let k = 0; k < 3; k++) {
          b.lathe(
            [
              [0.01, 0],
              [0.12, 0.05],
              [0.15, 0.25],
              [0.07, 0.42],
            ],
            b.pick(goods),
            { at: [x - openW / 2 + 0.4 + k * 0.4, 1.06, ZF - T - 0.4], segs: 7 },
          );
        }
        const lx = x + 1.1;
        for (const s of [-1, 1]) b.beam([lx + s * 0.22, 0.05, 3.0], [lx + s * 0.22, G + 0.9, 3.35], 0.06, 0.06, P.oakSilver);
        for (let k = 1; k <= 7; k++) b.box(0.44, 0.05, 0.05, P.oakSilver, { at: [lx, (k * G) / 8 + 0.05, 3.0 + (0.35 * k) / 8] });
        // an awning of cloth on poles
        if (b.chance(0.5)) {
          b.box(openW, 0.04, 1.2, b.pick([P.cream, P.wattle, tint(P.cream, -0.08)]), { at: [x, G - 0.25, ZF + 0.6], rot: [0.12, 0, 0] });
        }
        // amphorae leaning by the door
        for (let k = 0; k < 2; k++) {
          b.lathe(
            [
              [0.02, 0],
              [0.14, 0.2],
              [0.2, 0.55],
              [0.08, 0.85],
              [0.06, 1.05],
            ],
            P.terracotta,
            { at: [x + openW / 2 + 0.25 + k * 0.32, 0.18, ZF + 0.3], segs: 7 },
          );
        }
      }
      // back room: a small barred window and a back door to the yard
      b.window(0.7, 0.6, { at: [x - 1.1, 2.0, ZB], facing: '-z', frame: P.oakDark, glass: P.windowDark, bars: [3, 1], border: 0.07 });
      if (i % 2 === 0) b.panel(0.85, 2.0, P.oakDark, { at: [x + 1.0, 0.03, ZB], facing: '-z', depth: 0.06 });
      b.window(0.6, 0.5, { at: [x + 1.0, 3.6, ZB], facing: '-z', frame: P.oakDark, glass: P.windowDark, border: 0.07 });
    }
    // painted notices on two piers: Roman walls were written on
    b.panel(1.1, 0.7, P.limewash, { at: [-L / 2 + BW * 2, 3.55, ZF], facing: '+z', depth: 0.03 });
    b.panel(0.9, 0.08, P.terracottaPainted, { at: [-L / 2 + BW * 2, 3.95, ZF], facing: '+z', depth: 0.05 });
    b.panel(0.7, 0.08, P.terracottaPainted, { at: [-L / 2 + BW * 2, 3.7, ZF], facing: '+z', depth: 0.05 });

    // the yard behind: a cistern head, a latrine shed, firewood, a vine on a pergola
    wellHead(b, -6.5, -4.6, P.tufa);
    b.box(2.2, 2.2, 1.6, tufa, { at: [9.5, 0, -6.6] });
    b.shed(2.5, 1.9, 0.45, roof, { at: [9.5, 2.2, -6.6], high: '-z' });
    b.panel(0.75, 1.75, P.oakDark, { at: [9.0, 0.03, -5.8], facing: '+z' });
    for (const [px, pz] of [
      [0, -3.0],
      [3.6, -3.0],
      [0, -6.0],
      [3.6, -6.0],
    ]) b.box(0.12, 2.4, 0.12, P.oak, { at: [px, 0, pz] });
    for (let k = 0; k < 5; k++) b.box(3.8, 0.06, 0.06, P.oak, { at: [1.8, 2.4, -3.0 - k * 0.75] });
    for (const [vx, vz] of [[0.6, -3.4], [2.4, -4.0], [1.2, -5.2], [3.0, -5.6]]) b.blob(0.8, b.pick([P.leaf, P.leafDark]), { at: [vx, 2.55, vz], stretch: [1.3, 0.35, 1.1], detail: 0 });
    b.cyl(0.07, 2.4, P.bark, { at: [0.15, 0, -3.15], segs: 5 });
    for (let i = 0; i < 4; i++) b.log(0.1, 1.5, P.bark, { at: [-10.5, i < 3 ? 0 : 0.18, -3.0 + (i % 3) * 0.22], axis: 'x', segs: 5 });
    b.tree(3.8, { at: [-10.6, 0, -6.2], kind: 'olive' });
  },
};


