import { P, mix, tint, linspace, type BuildingDef, type Builder } from '@ah/kit';

/** Temple plan: square cella inside a square ambulatory, centred at z = TZ, door to the east (-Z). */
export const TZ = 2;
export const CELLA = 7;
export const CELLA_H = 10.6;
export const AMB = 15;
export const PX = 12.2;
export const PZ = 21.5;

export const PLASTER = P.plaster;
export const RED = tint(P.romanTile, -0.08);
export const WALLSTONE = mix(P.flint, P.rubble, 0.55);

/** Column positions along one side of the ambulatory (the east side leaves the middle open). */
export const colPos = linspace(7, -AMB / 2 + 0.4, AMB / 2 - 0.4);

/** Precinct (temenos) wall: flint with bands of red tile, split into segments so the ruin can break it. */
export function precinctWall(b: Builder, heightAt: (i: number, n: number) => number) {
  const t = 0.6;
  const sides: [number, number, number, number][] = [
    [-PX, PZ, PX, PZ],
    [PX, -PZ, PX, PZ],
    [-PX, -PZ, -PX, PZ],
    [-PX, -PZ, -2.2, -PZ],
    [2.2, -PZ, PX, -PZ],
  ];
  let k = 0;
  for (const [x0, z0, x1, z1] of sides) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(len / 5));
    const ang = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n;
      const h = heightAt(k++, n);
      if (h <= 0.05) continue;
      const seg = len / n + (i === n - 1 ? t / 2 : 0) + (i === 0 ? t / 2 : 0);
      const at: [number, number, number] = [x0 + (x1 - x0) * f, 0, z0 + (z1 - z0) * f];
      b.box(t, h, seg, WALLSTONE, { at, rotY: ang });
      for (const y of [0.5, 1.4]) if (y + 0.2 < h) b.box(t + 0.04, 0.16, seg, RED, { at: [at[0], y, at[2]], rotY: ang, jitter: false });
      if (h > 2.0) b.box(t + 0.12, 0.12, seg, RED, { at: [at[0], h, at[2]], rotY: ang });
    }
  }
}

export const romanoCelticTemple: BuildingDef = {
  id: 'romano-celtic-temple',
  name: 'Romano-Celtic temple',
  style: 'Romano-British',
  date: 'c. AD 120',
  summary:
    'Under Roman rule the old shrine was rebuilt in stone, mortar and tile, but to a plan found only in Britain and Gaul: a tall square tower-like cella, home of the god\'s statue, ringed by a lower covered walkway. ' +
    'Worshippers did not gather inside. They walked round the ambulatory, left offerings and made vows at the altar outside. ' +
    'The god was probably a local one given a Roman name, and the walled precinct follows the line of the Iron Age enclosure.',
  materials: ['flint and mortar', 'painted plaster', 'clay roof tile', 'limestone columns'],
  lookFor: [
    { label: 'Cella', note: 'The tall central room that housed the cult statue. Only priests went in.', at: [3.8, 9.0, TZ] },
    { label: 'Ambulatory', note: 'A lower covered walkway round all four sides, open between short columns on a low wall.', at: [7.9, 3.0, TZ + 3] },
    { label: 'Tiled roofs', note: 'Flat tegulae and curved imbrices of fired clay, one of the new materials Rome brought.', at: [0, 12.9, TZ] },
    { label: 'Altar', note: 'Sacrifices and offerings were made in the open air, in front of the temple door.', at: [0, 1.3, -9.5] },
    { label: 'Temenos wall', note: 'The wall of the sacred precinct, laid with courses of red tile in the Roman way.', at: [PX + 0.4, 1.6, 8] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const stone = P.limestone;
    // podium for the whole temple, with steps up on the east
    b.box(AMB + 0.8, 0.6, AMB + 0.8, stone, { at: [0, 0, TZ] });
    b.stairs(4.0, 0.6, 1.2, 3, stone, { at: [0, 0, TZ - AMB / 2 - 1.0], rotY: Math.PI });

    // cella: plastered walls with a red dado, high windows above the ambulatory roof
    b.box(CELLA, CELLA_H, CELLA, PLASTER, { at: [0, 0.6, TZ] });
    b.box(CELLA + 0.06, 1.0, CELLA + 0.06, RED, { at: [0, 0.6, TZ], jitter: false });
    b.box(CELLA + 0.2, 0.3, CELLA + 0.2, stone, { at: [0, CELLA_H + 0.6 - 0.3, TZ] });
    b.pyramid(CELLA + 0.9, CELLA + 0.9, 2.5, P.romanTile, { at: [0, CELLA_H + 0.6, TZ] });
    for (const [f, x, z] of [['+z', 0, CELLA / 2], ['-z', 0, -CELLA / 2], ['+x', CELLA / 2, 0], ['-x', -CELLA / 2, 0]] as const) {
      for (const o of [-1.5, 1.5]) {
        const at: [number, number, number] = f === '+z' || f === '-z' ? [o, 8.4, TZ + z] : [x, 8.4, TZ + o];
        b.window(0.8, 1.2, { at, facing: f, shape: 'round', frame: stone });
      }
    }
    // the great door faces east
    b.panel(2.4, 4.2, stone, { at: [0, 0.6, TZ - CELLA / 2], facing: '-z' });
    b.panel(1.9, 3.8, P.bronze, { at: [0, 0.6, TZ - CELLA / 2], facing: '-z', depth: 0.09 });

    // ambulatory: low wall, columns, entablature and a lean-to tiled roof all round
    const half = AMB / 2;
    for (const [x0, z0, x1, z1] of [[-half, half, half, half], [-half, -half, -2.0, -half], [2.0, -half, half, -half], [half, -half, half, half], [-half, -half, -half, half]]) {
      const len = Math.hypot(x1 - x0, z1 - z0);
      b.box(0.5, 0.9, len, PLASTER, { at: [(x0 + x1) / 2, 0.6, TZ + (z0 + z1) / 2], rotY: Math.atan2(x1 - x0, z1 - z0) });
    }
    for (const p of colPos) {
      b.column(0.2, 2.6, stone, { at: [p, 1.5, TZ + half - 0.25], order: 'tuscan' });
      b.column(0.2, 2.6, stone, { at: [half - 0.25, 1.5, TZ + p], order: 'tuscan' });
      b.column(0.2, 2.6, stone, { at: [-half + 0.25, 1.5, TZ + p], order: 'tuscan' });
      if (Math.abs(p) > 1) b.column(0.2, 2.6, stone, { at: [p, 1.5, TZ - half + 0.25], order: 'tuscan' });
    }
    b.box(AMB, 0.4, AMB, PLASTER, { at: [0, 4.1, TZ] });
    b.pyramid(AMB + 0.8, AMB + 0.8, 3.8, P.romanTile, { at: [0, 4.5, TZ] });

    // altar in front of the temple
    b.box(1.6, 0.25, 1.2, stone, { at: [0, 0, -9.5] });
    b.box(1.2, 0.9, 0.9, stone, { at: [0, 0.25, -9.5] });
    b.box(1.4, 0.15, 1.05, stone, { at: [0, 1.15, -9.5] });
    for (const s of [-1, 1]) b.log(0.11, 0.9, stone, { at: [s * 0.5, 1.3, -9.5], axis: 'z' });

    // precinct wall with a gatehouse on the east
    precinctWall(b, () => 2.1);
    for (const s of [-1, 1]) b.box(0.9, 3.4, 1.2, WALLSTONE, { at: [s * 2.4, 0, -PZ] });
    b.box(5.8, 0.5, 1.6, PLASTER, { at: [0, 3.4, -PZ] });
    b.gable(6.0, 2.0, 1.1, P.romanTile, { at: [0, 3.9, -PZ], overhang: 0.2 });
    b.box(3.9, 0.04, 6, P.gravel, { at: [0, 0, -PZ + 3.0], jitter: false });
    b.tree(8, { at: [-9, 0, 15], kind: 'round' });
    b.tree(7, { at: [9, 0, -15], kind: 'round' });

    b.collider(AMB + 1, AMB + 1, { at: [0, 0, TZ] });
  },
};
