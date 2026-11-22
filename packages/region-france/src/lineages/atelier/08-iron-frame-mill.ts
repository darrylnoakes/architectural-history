import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, BED, WATER, lin, rise, riverWall, water } from './shared';

const CREAM_BRICK = 0xe2cfa4;
const RED_BRICK = 0xb24b34;
const GLAZE = 0x4f8a7a; // glazed ceramic: the cocoa-flower tiles
const IRON = 0x3d4a52;

/**
 * One facade of the mill: exposed iron posts and floor beams, and between them, in alternate bays,
 * a window or a diamond lattice of iron braces filled with coloured brick. The facade lies in the
 * local XY plane at z = 0, facing +Z; `w` wide, `storeys` of `fh`, starting at y0.
 */
function latticeFacade(b: Builder, w: number, y0: number, storeys: number, fh: number, bays: number) {
  const bw = w / bays;
  for (let k = 0; k < storeys; k++) {
    const y = y0 + k * fh;
    for (let i = 0; i < bays; i++) {
      const x = -w / 2 + (i + 0.5) * bw;
      if (i % 2 === 0) {
        // a lattice bay: a red diamond on cream, iron diagonals round it, a glazed tile at its heart
        b.group({ at: [x, y + fh / 2, 0.04], rot: [0, 0, Math.PI / 4] }, () => {
          const s = Math.min(bw, fh) * 0.62;
          b.box(s, s, 0.05, k % 2 === 0 ? RED_BRICK : tint(RED_BRICK, -0.06), { at: [0, -s / 2, 0], jitter: false });
        });
        b.panel(0.45, 0.45, GLAZE, { at: [x, y + fh / 2 - 0.22, 0.08], facing: '+z', depth: 0.04 });
        for (const [x0, y1, x1, y2] of [
          [x - bw / 2, y, x + bw / 2, y + fh],
          [x + bw / 2, y, x - bw / 2, y + fh],
        ]) b.beam([x0, y1, 0.12], [x1, y2, 0.12], 0.16, 0.08, IRON, { jitter: false });
      } else {
        // a window bay
        b.window(bw * 0.62, fh * 0.62, { at: [x, y + fh * 0.2, 0.02], facing: '+z', frame: CREAM_BRICK, glass: P.windowDark, bars: [2, 3], border: 0.08 });
        b.box(bw * 0.8, 0.22, 0.06, GLAZE, { at: [x, y + fh * 0.88, 0.04], jitter: false }); // glazed frieze over the window
      }
    }
    b.box(w + 0.1, 0.22, 0.16, IRON, { at: [0, y - 0.11, 0.1], jitter: false }); // the floor beam
  }
  b.box(w + 0.1, 0.22, 0.16, IRON, { at: [0, y0 + storeys * fh - 0.11, 0.1], jitter: false });
  for (let i = 0; i <= bays; i++) b.box(0.22, storeys * fh, 0.18, IRON, { at: [-w / 2 + i * bw, y0, 0.1], jitter: false }); // posts
}

export const ironFrameMill: BuildingDef = {
  id: 'iron-frame-mill',
  name: 'Iron-framed mill over the river',
  style: 'Second Empire industrial',
  date: 'c. 1872',
  summary:
    'For the Menier chocolate works at Noisiel, on the Marne east of Paris, the architect Jules Saulnier built a new mill between 1869 and 1872 on the piers of an old one, so that turbines in the river beneath could drive the cocoa grinders. ' +
    'It is often counted the first building whose iron skeleton carries the whole load and is shown openly on the outside: iron posts, beams and diagonal braces form a diamond lattice, and the brick between them merely fills the gaps. ' +
    'The filling is decoration: red and cream brick and glazed tiles patterned with cocoa flowers and the Menier M, so the frame reads like a textile. ' +
    'Here a cloth firm’s mill of the same kind stands out in the river on stone piers, reached by an iron footbridge from its brick yard buildings on the bank.',
  materials: ['wrought and cast iron frame', 'polychrome brick', 'glazed ceramic tiles', 'limestone piers', 'slate'],
  modelledOn: 'The Moulin Saulnier of the Menier chocolate works, Noisiel (Jules Saulnier, 1869 to 1872). Taken from it: the mill standing in the river on stone piers over its turbines, and the exposed iron frame with diagonal braces filled with coloured brick and glazed tiles. Simplified: the pattern, the roof and the proportions are generic',
  lookFor: [
    { label: 'Exposed iron frame', note: 'The iron posts and beams carry the floors and roof; they are shown on the face of the building, not hidden in the wall.', at: [-8.0, 6.0, -13.2] },
    { label: 'Diamond lattice of braces', note: 'Iron diagonals cross each panel to stiffen the frame, making the lozenge pattern of the facade.', at: [-4.6, 9.0, -13.2] },
    { label: 'Coloured brick and glazed tiles', note: 'Red and cream brick and glazed ceramic fill the frame: a curtain of decoration that carries no weight.', at: [3.2, 4.5, -13.2] },
    { label: 'Piers and turbine arches', note: 'The mill stands on stone piers in the river; water runs through the arches between them to the turbines.', at: [-10.4, -0.2, -19.0] },
    { label: 'Iron footbridge', note: 'A light iron bridge links the mill to the yard on the bank.', at: [0, 1.4, -12.0] },
  ],
  influences: ['iron-and-rail'],
  build(b) {
    const stone = P.pierreBlonde;
    const W = 20;
    const D = 10;
    const z0 = -19.0;
    const y0 = 0.9; // the mill floor, over the water
    const fh = 3.6;
    const storeys = 4;
    const H = y0 + storeys * fh;
    const front = z0 + D / 2;
    const back = z0 - D / 2;

    b.box(35, 0.04, 21.6, tint(P.cobble, 0.08), { at: [0, 0, 0], jitter: false });
    riverWall(b, -17.6, 17.6, tint(stone, -0.08), { coping: stone, top: 0.3 });

    // ---- the piers: walls of stone running with the current, with cutwaters, and the arched ends
    const piers = [front - 0.4, z0, back + 0.4];
    for (const z of piers) {
      b.box(W + 0.4, y0 - BED, 1.2, stone, { at: [0, BED, z] });
      b.sym((s) => b.cyl(0.85, y0 - BED, stone, { at: [s * (W / 2 + 0.2), BED, z], segs: 4, rotY: Math.PI / 4 }));
    }
    b.box(W + 0.4, 0.35, D + 0.4, tint(stone, 0.04), { at: [0, y0 - 0.35, z0] }); // the base under the frame
    // under the arches: the water racing through to the turbines, and a turbine housing in each race
    for (const z of [(front + z0) / 2 - 0.2, (z0 + back) / 2 + 0.2]) {
      water(b, W + 3, 3.2, [0, WATER + 0.03, z], tint(P.water, 0.08));
      b.cyl(0.9, 1.6, P.castIron, { at: [-3.0, WATER - 0.6, z], segs: 10 });
      b.cyl(0.9, 1.6, P.castIron, { at: [5.0, WATER - 0.6, z], segs: 10 });
      b.box(W + 0.4, 0.3, 3.6, tint(stone, -0.08), { at: [0, y0 - 0.75, z] }); // the arch soffit
    }
    b.sym((s) => b.archWall(D + 0.4, y0 - BED, 0.6, stone, { at: [s * (W / 2 + 0.25), BED, z0], facing: s > 0 ? '+x' : '-x', openings: 2, openW: 3.0, openH: y0 - WATER + 1.0, shape: 'segmental' }));

    // ---- the mill: four storeys of brick panels on the exposed iron frame
    b.box(W, storeys * fh, D, CREAM_BRICK, { at: [0, y0, z0] });
    b.group({ at: [0, 0, front] }, () => latticeFacade(b, W, y0, storeys, fh, 7));
    b.group({ at: [0, 0, back], rotY: Math.PI }, () => latticeFacade(b, W, y0, storeys, fh, 7));
    b.group({ at: [W / 2, 0, z0], rotY: Math.PI / 2 }, () => latticeFacade(b, D, y0, storeys, fh, 3));
    b.group({ at: [-W / 2, 0, z0], rotY: -Math.PI / 2 }, () => latticeFacade(b, D, y0, storeys, fh, 3));
    // the cornice with its glazed frieze, the roof of slate with a crest, and dormers
    b.box(W + 0.5, 0.5, D + 0.5, GLAZE, { at: [0, H, z0] });
    b.box(W + 0.9, 0.3, D + 0.9, IRON, { at: [0, H + 0.5, z0] });
    const rr = rise(D, 34);
    b.hip(W + 0.9, D + 0.9, rr, P.ardoise, { at: [0, H + 0.8, z0] });
    b.box(W - D + 0.2, 0.25, 0.12, P.castIron, { at: [0, H + 0.8 + rr, z0] }); // roof crest
    for (const x of lin(4, -6.6, 6.6)) {
      for (const [z, s] of [
        [front - 0.6, 1],
        [back + 0.6, -1],
      ] as const) {
        b.box(1.4, 1.6, 1.4, CREAM_BRICK, { at: [x, H + 0.7, z] });
        b.window(0.8, 1.0, { at: [x, H + 0.9, z + s * 0.7], facing: s > 0 ? '+z' : '-z', frame: IRON, glass: P.windowDark });
        b.gable(1.6, 1.6, 0.7, P.ardoise, { at: [x, H + 2.3, z], ridge: 'z' });
      }
    }
    // the name in tiles under the cornice, toward the town
    b.box(6.0, 0.5, 0.06, CREAM_BRICK, { at: [0, H - 0.6, front + 0.2], jitter: false });

    // ---- the iron footbridge from the yard to the mill door
    const bz0 = BANK + 0.4;
    const bz1 = front;
    const bl = bz0 - bz1;
    b.box(2.6, 0.2, bl, IRON, { at: [0, y0 - 0.2, (bz0 + bz1) / 2] });
    b.box(2.4, 0.06, bl, P.oak, { at: [0, y0, (bz0 + bz1) / 2] });
    b.sym((s) => {
      b.box(0.08, 0.08, bl, IRON, { at: [s * 1.25, y0 + 1.0, (bz0 + bz1) / 2], jitter: false });
      for (const z of lin(4, bz1 + 0.1, bz0 - 0.1)) b.box(0.06, 1.0, 0.06, IRON, { at: [s * 1.25, y0, z], jitter: false });
      b.beam([s * 1.25, y0 + 0.1, bz1 + 0.2], [s * 1.25, y0 + 0.9, (bz0 + bz1) / 2], 0.05, 0.05, IRON, { jitter: false });
      b.beam([s * 1.25, y0 + 0.9, (bz0 + bz1) / 2], [s * 1.25, y0 + 0.1, bz0 - 0.2], 0.05, 0.05, IRON, { jitter: false });
    });
    b.stairs(2.6, y0, 1.6, 4, stone, { at: [0, 0, BANK + 1.2] });
    b.panel(1.8, 2.6, P.doorBlack, { at: [0, y0, front + 0.02], facing: '+z' });
    b.deck(2.4, bl + 1.6, y0, { at: [0, 0, (bz0 + bz1) / 2 + 0.6] });

    // ---- the yard on the bank: a long brick store and the works offices, a weighbridge, rails
    const sx = -9.5;
    b.box(13, 6.5, 6.0, RED_BRICK, { at: [sx, 0, 3.0] });
    b.box(13.2, 0.4, 6.2, CREAM_BRICK, { at: [sx, 6.5, 3.0] });
    b.gable(13.4, 6.4, rise(6, 30), P.ardoise, { at: [sx, 6.9, 3.0], overhang: 0.2, wall: RED_BRICK });
    for (const x of lin(5, sx - 5, sx + 5)) {
      b.window(1.2, 2.0, { at: [x, 3.6, 6.0], facing: '+z', shape: 'segmental', frame: CREAM_BRICK, glass: P.windowDark, bars: [2, 2] });
      b.window(1.2, 2.0, { at: [x, 3.6, 0.0], facing: '-z', shape: 'segmental', frame: CREAM_BRICK, glass: P.windowDark, bars: [2, 2] });
    }
    for (const x of [sx - 3.5, sx + 3.5]) b.panel(2.4, 2.8, P.doorGreen, { at: [x, 0, 6.0], facing: '+z', shape: 'segmental' });
    for (const x of [sx - 3.5, sx + 3.5]) b.panel(2.4, 2.8, P.doorGreen, { at: [x, 0, 0.0], facing: '-z', shape: 'segmental' });
    for (let y = 0.8; y < 6.4; y += 1.4) b.box(13.05, 0.25, 6.05, CREAM_BRICK, { at: [sx, y, 3.0], jitter: false }); // polychrome bands
    // the offices: a smaller two-storey pavilion with a zinc roof
    const ox = 10.0;
    b.box(8.0, 6.6, 6.0, CREAM_BRICK, { at: [ox, 0, 4.0] });
    for (let y = 0.8; y < 6.4; y += 1.6) b.box(8.05, 0.3, 6.05, RED_BRICK, { at: [ox, y, 4.0], jitter: false });
    b.hip(8.6, 6.6, 2.4, P.zincParis, { at: [ox, 6.6, 4.0] });
    for (const x of lin(3, ox - 2.6, ox + 2.6)) for (const y of [1.0, 4.0]) b.window(1.1, 1.9, { at: [x, y, 7.0], facing: '+z', frame: P.white, glass: P.windowDark, bars: [2, 3] });
    for (const x of lin(3, ox - 2.6, ox + 2.6)) b.window(1.1, 1.9, { at: [x, 4.0, 1.0], facing: '-z', frame: P.white, glass: P.windowDark, bars: [2, 3] });
    // rails across the yard to the bridge, and crates of cocoa and bales
    for (const x of [-0.7, 0.7]) b.box(0.08, 0.06, 18, P.steel, { at: [x, 0.04, 0.0], jitter: false });
    for (let i = 0; i < 4; i++) b.box(1.0, 0.8, 1.0, P.pine, { at: [3.0 + (i % 2) * 1.1, Math.floor(i / 2) * 0.8, -7.0] });
    // the street railings and gate piers
    b.box(13, 0.6, 0.4, RED_BRICK, { at: [-9.5, 0, 10.6] });
    for (const x of lin(14, -15.5, -3.5)) b.box(0.05, 1.4, 0.05, IRON, { at: [x, 0.6, 10.6], jitter: false });
    b.sym((s) => b.box(0.8, 2.6, 0.8, CREAM_BRICK, { at: [s * 2.2, 0, 10.6] }));

    b.collider(W + 1.4, D + 1.4, { at: [0, 0, z0] });
    b.collider(13, 6, { at: [sx, 0, 3.0] });
    b.collider(8, 6, { at: [ox, 0, 4.0] });
  },
};
