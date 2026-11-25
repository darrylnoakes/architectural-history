import { P, tint, spread, type Builder, type BuildingDef } from '@ah/kit';
import { coppiRoof, pave, persiane, plasterPick, pot, vegBed } from './shared';
import { OURS, ROW, THEIRS, rowGround, rowOpenings, rowUpper, rowYards } from './shared-row';

/** A Tuscan chimney: a stack with a little pitched roof of tiles on top. */
function comignolo(b: Builder, x: number, y: number, z: number, wall: number, tile: number): void {
  b.box(0.7, 1.4, 0.55, wall, { at: [x, y, z] });
  b.box(0.85, 0.12, 0.7, tint(wall, -0.08), { at: [x, y + 1.4, z] });
  b.sym((s) => b.box(0.12, 0.35, 0.12, tint(wall, -0.08), { at: [x + s * 0.32, y + 1.52, z] }));
  b.gable(0.95, 0.8, 0.3, tile, { at: [x, y + 1.87, z], ridge: 'x', thick: 0.06 });
}

export const renaissanceHouse: BuildingDef = {
  id: 'renaissance-house',
  name: 'Renaissance row house',
  style: 'Early Renaissance',
  date: 'c. 1480',
  summary:
    'The same row of houses, put in order. The jutting upper floors have been cut back and the fronts rebuilt flat and plastered, because the new taste wanted ' +
    'straight, regular streets and town authorities ordered projections removed from the main streets; the windows now stand on even axes, framed in grey pietra serena ' +
    'and linked by a stone sill course, as in the palaces of the rich, only plainer. The medieval ground floor is kept under the new plaster: the shop keeps its old arch, ' +
    'now with a stone counter, the round-headed door beside it still leads to the stair, and at the back one house has opened its back room into a loggia on the yard. ' +
    'Deep timber eaves throw rain clear of the plaster, and a chimney serves a proper fireplace.',
  materials: ['lime plaster on stone and brick', 'pietra serena dressings', 'timber eaves and floors', 'clay pan-and-cover tiles'],
  influences: ['renaissance-birth'],
  revisions: [{ year: 1780, note: 'Louvred shutters (persiane), a fashion of the eighteenth century, have been hung at the street windows, closed by day against the sun.' }],
  lookFor: [
    {
      label: 'Pietra serena window frames',
      note: 'Round-arched windows on the first floor and square-headed ones above, framed in smooth grey sandstone; the windows are filled with oiled cloth on a wooden lattice or, in better houses, small panes of glass.',
      at: [-3.4, 6.9, 7.7],
    },
    {
      label: 'Sill course',
      note: 'A moulded band of grey stone runs under the windows across the whole front, tying the storey together.',
      at: [-5.9, 4.62, 7.75],
    },
    {
      label: 'Shop with stone counter',
      note: 'The shop opening has a stone counter built into its lower part; goods were laid out on it and sold straight to the street.',
      at: [-4.2, 1.1, 8.0],
    },
    {
      label: 'Deep eaves',
      note: 'The rafters run out a metre beyond the wall on shaped timber brackets, keeping rain off the plaster and shading the street.',
      at: [-1.0, 10.1, 8.5],
    },
    {
      label: 'Loggia on the yard',
      note: 'Behind, an open arcade on a slender stone column gives a shady place to work and eat beside the yard.',
      at: [-3.4, 2.6, -1.1],
    },
  ],
  build(b) {
    // the two medieval houses of the stage before, their ground storeys, shop arches, doors and yards
    // kept; the jettied upper floors cut back and rebuilt flush with the street front
    const { W, uw, zf, zb, g, ld } = ROW;
    const f1 = 3.4;
    const f2 = ROW.up - f1;
    const H = g + ROW.up;
    const serena = tint(P.pietraSerena, b.range(-0.03, 0.03));
    const tile = tint(P.coppi, b.range(-0.05, 0.02));
    const cloth = 0xd9cba3;

    const house = (cx: number, ours: boolean) => {
      const plaster = plasterPick(b);
      const zc = (zf + zb) / 2;
      const gl = ours ? ld : 0; // depth of the yard loggia
      // the old ground storey, plastered (on our side its back bay opened as a loggia), and the new floors above
      rowGround(b, cx, ours, plaster, { loggia: ours });
      rowUpper(b, cx, plaster);
      b.box(uw + 0.02, 0.5, zf - zb - gl + 0.02, tint(serena, 0.06), { at: [cx, 0, (zf + zb + gl) / 2] }); // stone plinth
      // sill courses and a band at the eaves
      for (const y of [g + 0.55, g + f1 + 0.5]) b.box(uw, 0.16, 0.14, serena, { at: [cx, y, zf + 0.07] });
      b.box(uw, 0.22, 0.12, tint(plaster, -0.06), { at: [cx, H - 0.3, zf + 0.06] });

      // roof with deep eaves on shaped brackets
      coppiRoof(b, uw, zf - zb, 1.8, tile, { at: [cx, H, zc], overhang: 1.0, ends: 0, wall: plaster, thick: 0.14 });
      b.box(uw, 0.06, 1.0, P.oak, { at: [cx, H - 0.38, zf + 0.5] }); // boarding under the eaves
      b.box(uw, 0.06, 1.0, P.oak, { at: [cx, H - 0.38, zb - 0.5] });
      for (const x of spread(10, -uw / 2 + 0.2, uw / 2 - 0.2)) {
        for (const [z, rot] of [[zf, 0], [zb, Math.PI]] as [number, number][]) {
          b.extrude([[0, 0], [0.95, 0], [0.95, -0.12], [0.35, -0.22], [0.1, -0.42], [0, -0.42]], 0.12, P.oakDark, {
            at: [cx + x, H - 0.32, z],
            rotY: rot - Math.PI / 2,
          });
        }
      }
      comignolo(b, cx + (ours ? -1.8 : 1.6), H + 0.6, zc - 1.2, plaster, tile);

      // ---- street front: the medieval shop arch, now with a stone counter, and the old door; regular windows above
      const sx = cx - 0.8;
      rowOpenings(b, cx, serena, ours ? b.pick([P.doorGreen, P.oakDark, P.doorRed]) : P.oakDark);
      b.box(2.9, 1.0, 0.45, serena, { at: [sx, 0, zf + 0.12] }); // the stone counter
      b.box(3.1, 0.1, 0.6, tint(serena, 0.08), { at: [sx, 1.0, zf + 0.14] });
      const wares = ours ? [P.cream, 0xb5523e, 0x5a6f8a, P.marbleYellow] : [P.terracotta, P.bronze, P.cream];
      wares.forEach((c, i) => b.box(0.42, 0.3, 0.35, c, { at: [sx - 0.9 + (i * 1.8) / (wares.length - 1), 1.1, zf + 0.2] }));
      // windows: arched on the first floor, square-headed on the second, on three even axes
      for (const x of [-2.0, 0, 2.0]) {
        const wx = cx + x;
        b.panel(1.35, 2.3, serena, { at: [wx, g + 0.6, zf], facing: '+z', shape: 'round', depth: 0.04 });
        b.window(1.0, 2.05, { at: [wx, g + 0.72, zf], facing: '+z', shape: 'round', frame: P.oak, glass: cloth, bars: [2, 3] });
        b.panel(1.25, 1.75, serena, { at: [wx, g + f1 + 0.55, zf], facing: '+z', depth: 0.04 });
        b.window(0.95, 1.5, { at: [wx, g + f1 + 0.68, zf], facing: '+z', frame: P.oak, glass: cloth, bars: [2, 2] });
      }

      // ---- back
      if (ours) {
        // the loggia: two arches on a pietra serena column
        b.archWall(uw, g, 0.4, plaster, { at: [cx, 0, zb + 0.2], facing: '-z', openings: 2, openW: 3.15, openH: 3.6, shape: 'round' });
        b.column(0.17, 1.92, serena, { at: [cx, 0, zb + 0.2], order: 'tuscan' });
        b.box(0.5, 0.2, 0.5, serena, { at: [cx, 1.92, zb + 0.2] });
        b.sym((s) => b.box(0.3, 0.2, 0.45, serena, { at: [cx + s * (uw / 2 - 0.15), 1.92, zb + 0.2] }));
        pave(b, uw - 0.2, ld, P.cotto, [cx, 0, zb + ld / 2]);
        b.panel(1.0, 2.2, P.oakDark, { at: [cx - 1.0, 0, zb + ld], facing: '-z' });
        b.window(0.9, 1.3, { at: [cx + 1.6, 0.9, zb + ld], facing: '-z', frame: P.oak, glass: cloth, bars: [2, 2] });
        b.box(1.4, 0.45, 0.5, P.oak, { at: [cx + 1.6, 0, zb + 0.9] }); // a bench
        pot(b, [cx - 2.6, 0, zb - 0.6], 1.1);
        pot(b, [cx + 1.8, 0, zb - 0.6], 1.1);
      } else {
        b.panel(1.0, 2.2, P.oakDark, { at: [cx + 1.4, 0, zb], facing: '-z' });
        b.window(0.9, 1.2, { at: [cx - 1.4, 1.0, zb], facing: '-z', frame: P.oak, glass: cloth, bars: [2, 2] });
      }
      for (const x of [-1.6, 1.6]) {
        b.window(0.9, 1.5, { at: [cx + x, g + 0.8, zb], facing: '-z', frame: P.oak, glass: cloth, bars: [2, 2] });
        b.window(0.8, 1.2, { at: [cx + x, g + f1 + 0.7, zb], facing: '-z', frame: P.oak, glass: cloth, bars: [2, 2] });
      }
    };
    house(OURS, true);
    house(THEIRS, false);
    b.box(0.12, H, zf - zb + 0.04, tint(P.pietraSerena, 0.1), { at: [0, 0, (zf + zb) / 2] }); // the line of the party wall

    // ---- yards: the walls, privies and well of the medieval houses, a vegetable bed, a lemon, an olive
    rowYards(b, P.rubble, tint(P.pietraSerena, 0.08), tile);
    vegBed(b, -4.6, -6.8, 3.2, 3.2, { rows: 5 });
    pot(b, [-2.6, 0, -7.6], 1.3, P.leaf); // a lemon in a pot
    b.blob(0.18, P.marbleYellow, { at: [-2.4, 1.2, -7.4], detail: 0 });
    b.tree(b.range(3.6, 4.2), { at: [3.6, 0, -5.6], kind: 'olive' });

    // ---- later: louvred shutters (persiane) at the windows of the street front, mostly closed against the sun
    if (b.since(1780)) {
      for (const cx of [OURS, THEIRS]) {
        for (const x of [-2.0, 0, 2.0]) {
          persiane(b, 1.0, 1.75, [cx + x, g + 0.72, zf + 0.08], '+z', P.doorGreen, { closed: x !== 0, slats: 3 });
          persiane(b, 0.95, 1.5, [cx + x, g + f1 + 0.68, zf + 0.08], '+z', P.doorGreen, { closed: true, slats: 3 });
        }
      }
    }
  },
};
