import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { church, tower, porch, win, churchyardCross, archPts, DOOR_Z } from './shared';
import { PERP_ASHLAR, PERP_DRESS, perpChurchSpec, perpTower } from './08-perpendicular-church';

const NEW_STONE = tint(P.limestone, 0.05);

/** A lychgate: a roofed timber gateway where the coffin rested on its way into the churchyard. */
function lychgate(b: Builder, x: number, z: number) {
  b.group({ at: [x, 0, z] }, () => {
    for (const sx of [-1, 1]) {
      b.box(0.25, 0.6, 3.0, P.ragstone, { at: [sx * 1.3, 0, 0] });
      for (const sz of [-1, 1]) b.box(0.2, 2.4, 0.2, P.oak, { at: [sx * 1.3, 0.6, sz * 1.3] });
      b.box(0.2, 0.2, 3.1, P.oak, { at: [sx * 1.3, 2.9, 0] });
      // curved brace effect: two short struts under the plate
      for (const sz of [-1, 1]) b.box(0.12, 0.7, 0.12, P.oak, { at: [sx * 1.3, 2.3, sz * 0.95], rot: [sz * 0.7, 0, 0] });
    }
    for (const sz of [-1, 1]) b.box(2.8, 0.18, 0.18, P.oak, { at: [0, 2.82, sz * 1.3] });
    b.gable(2.8, 3.1, 1.9, P.tileRed, { at: [0, 3.0, 0], ridge: 'z', overhang: 0.35, wall: P.oak });
    // a pair of gates
    for (const sx of [-1, 1]) b.box(1.05, 1.2, 0.07, P.oakDark, { at: [sx * 0.58, 0.05, 0.6] });
  });
}

/** Victorian headstone: a round-topped slab. */
function headstone(b: Builder, x: number, z: number, col: number) {
  const h = b.range(0.75, 1.2);
  b.extrude(archPts(b.pick(['round', 'pointed', 'rect'] as const), 0.6, h), 0.12, col, { at: [x, 0, z], rotY: b.range(-0.06, 0.06) });
}

export const victorianRestoration: BuildingDef = {
  id: 'victorian-restoration',
  name: 'Restored parish church',
  style: 'Victorian Gothic Revival restoration',
  date: '1868',
  summary:
    'Inspired by the Oxford Movement and Pugin, Victorian restorers set out to return churches to what they thought was their proper medieval state. ' +
    'Here the shallow lead roofs of the nave and chancel were replaced by steep new slated roofs, a vestry for robes and registers was added on the north side, and a clock went on the tower. ' +
    'Outside, the churchyard filled with carved headstones, yews and a lychgate; inside, box pews and galleries were torn out. ' +
    'Underneath it all the Norman doorway, the Early English chancel and the Perpendicular tower still stand.',
  materials: ['limestone', 'Welsh slate', 'oak', 'cast iron'],
  lookFor: [
    { label: 'Steep new roofs', note: 'Restorers thought a steep pitch the true Gothic form, so the nave now has a high slate roof rising behind its old battlements.', at: [0, 13.5, 4] },
    { label: 'Tower clock', note: 'A public clock, paid for by subscription: railway time had made accurate hours matter to everyone.', at: [0, 15.7, 21.3] },
    { label: 'Vestry', note: 'A small new room off the chancel for the clergy and choir to robe in, with its own chimney for a stove.', at: [-5.6, 3.5, -12] },
    { label: 'Lychgate', note: 'A roofed gate where the coffin waited for the priest at the start of a funeral.', at: [8.5, 3.2, 21.3] },
    { label: 'Headstones and yews', note: 'Carved stone grave markers spread across the churchyard in the 18th and 19th centuries; yews are its oldest residents.', at: [11.2, 1.2, -6] },
  ],
  influences: ['gothic-revival-export'],
  build(b) {
    church(b, perpChurchSpec({
      naveRoof: { rise: 4.6, color: P.slate, parapet: 'battle' },
      chancelRoof: { rise: 4.5, color: P.slate },
    }));
    tower(b, { ...perpTower, clock: 15.0 });
    porch(b, { wall: PERP_ASHLAR, dress: PERP_DRESS, x: 9, z: DOOR_Z, d: 3.4, w: 3.6, h: 6.0, roof: { rise: 0, color: P.lead, parapet: 'battle' }, arch: 'tudor', upper: true });
    // ornamental ridge cresting on the new chancel roof
    for (let z = -16.5; z <= -5.5; z += 0.55) b.box(0.06, 0.3, 0.06, P.castIron, { at: [0, 6 + 4.5 + 0.12, z] });

    // vestry on the north side of the chancel, with a stove chimney
    const vx = -3 - 2.3;
    b.box(4.6, 4.0, 4.4, NEW_STONE, { at: [vx, 0, -12] });
    b.gable(4.6, 4.4, 2.6, P.slate, { at: [vx, 4.0, -12], ridge: 'x', overhang: 0.25, wall: NEW_STONE });
    b.chimney(0.6, 2.4, 0.6, NEW_STONE, { at: [vx - 1.5, 4.6, -13.4] });
    win(b, { kind: 'pointed', w: 1.4, h: 2.0, at: [vx - 2.3, 1.3, -12], facing: '-x', frame: PERP_DRESS, tracery: 'geometric', lights: 2, hood: 'arch' });
    b.group({ at: [vx, 0, -14.2], rotY: Math.PI }, () => {
      b.extrude(archPts('pointed', 1.0, 2.2), 0.08, P.doorRed, { at: [0, 0, 0.03] });
    });

    // churchyard: path, lychgate, yews, headstones, the medieval cross now a broken stump
    b.box(1.6, 0.03, 13.0, P.gravel, { at: [9.2, 0, 16.0], jitter: false });
    lychgate(b, 9.2, 21.2);
    churchyardCross(b, [8.0, 0, -12.0], P.limestone, true);
    for (const [x, z, h] of [[-9.5, 17, 6.5], [11.5, -17, 7], [-10.5, -19, 5.5], [6.0, 19.5, 4.5]] as [number, number, number][]) {
      b.cyl(0.35, h * 0.3, P.bark, { at: [x, 0, z], segs: 6 });
      b.blob(h * 0.33, tint(P.leafDark, -0.1), { at: [x, h * 0.45, z], stretch: [1.15, 1.0, 1.15] });
      b.blob(h * 0.22, tint(P.leafDark, -0.12), { at: [x + 0.4, h * 0.75, z - 0.2] });
    }
    const stones = [P.limestone, P.sandstone, P.slate, tint(P.limestone, -0.1)];
    const rows: [number, number, number][] = [
      [11.2, -16, -1], // south churchyard
      [12.4, -16, -1],
      [-10.6, -16, 2],
      [-12.0, -16, 2],
    ];
    for (const [x, z0, z1] of rows) {
      for (let z = z0; z <= z1; z += b.range(1.4, 2.2)) {
        if (b.chance(0.82)) headstone(b, x + b.range(-0.2, 0.2), z, b.pick(stones));
      }
    }
    for (let x = -8; x <= 8; x += b.range(1.5, 2.3)) if (b.chance(0.8)) headstone(b, x, -21.0, b.pick(stones));
    // a chest tomb
    b.box(1.0, 0.8, 2.0, P.limestone, { at: [11.5, 0, 2.6] });
    b.box(1.15, 0.12, 2.15, P.limestone, { at: [11.5, 0.8, 2.6] });
  },
};
