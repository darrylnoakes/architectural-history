import { P, tint, spread, type Builder, type BuildingDef } from '@ah/kit';
import { coppiRoof, coppiShed, pave, plasterPick, pot, vegBed, well } from './shared';

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
    'The same row of houses, put in order. The jutting upper floors have been cut back and the fronts rebuilt flat and plastered, ' +
    'because the new taste wanted streets of straight, regular walls, and town authorities ordered projections removed from the main streets. Windows now stand on even axes, ' +
    'framed in grey pietra serena and linked by a stone sill course, as in the palaces of the rich, only plainer. The shop keeps its ' +
    'opening with a stone counter, the roof has deep timber eaves to throw rain clear of the plaster, and a chimney serves a proper fireplace.',
  materials: ['lime plaster on stone and brick', 'pietra serena dressings', 'timber eaves and floors', 'clay pan-and-cover tiles'],
  influences: ['renaissance-birth'],
  lookFor: [
    {
      label: 'Pietra serena window frames',
      note: 'Round-arched windows on the first floor and square-headed ones above, framed in smooth grey sandstone; the windows are filled with oiled cloth on a wooden lattice or, in better houses, small panes of glass.',
      at: [-3.4, 6.9, 8.1],
    },
    {
      label: 'Sill course',
      note: 'A moulded band of grey stone runs under the windows across the whole front, tying the storey together.',
      at: [-5.9, 4.62, 8.15],
    },
    {
      label: 'Shop with stone counter',
      note: 'The shop opening has a stone counter built into its lower part; goods were laid out on it and sold straight to the street.',
      at: [-4.3, 1.1, 8.4],
    },
    {
      label: 'Deep eaves',
      note: 'The rafters run out a metre beyond the wall on shaped timber brackets, keeping rain off the plaster and shading the street.',
      at: [-1.0, 10.1, 8.9],
    },
    {
      label: 'Loggia on the yard',
      note: 'Behind, an open arcade on a slender stone column gives a shady place to work and eat beside the yard.',
      at: [-3.4, 2.6, -1.1],
    },
  ],
  build(b) {
    const W = 13.6;
    const X = W / 2;
    const uw = X;
    const zf = 8.0;
    const zb = -1.0;
    const g = 4.0;
    const f1 = 3.4;
    const f2 = 3.0;
    const H = g + f1 + f2;
    const serena = tint(P.pietraSerena, b.range(-0.03, 0.03));
    const tile = tint(P.coppi, b.range(-0.05, 0.02));
    const cloth = 0xd9cba3;

    const house = (cx: number, ours: boolean) => {
      const plaster = plasterPick(b);
      const zc = (zf + zb) / 2;
      const ld = ours ? 2.2 : 0; // depth of the yard loggia
      // ground storey (set back behind the loggia on our side) and the two floors above
      b.box(uw, g, zf - zb - ld, plaster, { at: [cx, 0, (zf + zb + ld) / 2] });
      b.box(uw, f1 + f2, zf - zb, plaster, { at: [cx, g, zc] });
      b.box(uw + 0.02, 0.5, zf - zb - ld + 0.02, tint(serena, 0.06), { at: [cx, 0, (zf + zb + ld) / 2] }); // stone plinth
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

      // ---- street front: shop with a stone counter, a door, regular windows above
      const sx = cx - 0.9;
      const dx = cx + 2.4;
      b.panel(3.2, 3.3, serena, { at: [sx, 0, zf], facing: '+z', shape: 'round', depth: 0.04 });
      b.panel(2.7, 3.05, P.windowDark, { at: [sx, 0, zf], facing: '+z', shape: 'round', depth: 0.06 });
      b.box(2.7, 1.0, 0.45, serena, { at: [sx, 0, zf + 0.12] }); // the stone counter
      b.box(2.9, 0.1, 0.6, tint(serena, 0.08), { at: [sx, 1.0, zf + 0.14] });
      const wares = ours ? [P.cream, 0xb5523e, 0x5a6f8a, P.marbleYellow] : [P.terracotta, P.bronze, P.cream];
      wares.forEach((c, i) => b.box(0.42, 0.3, 0.35, c, { at: [sx - 0.9 + (i * 1.8) / (wares.length - 1), 1.1, zf + 0.2] }));
      b.panel(1.4, 2.7, serena, { at: [dx, 0, zf], facing: '+z', depth: 0.04 });
      b.panel(1.1, 2.5, ours ? b.pick([P.doorGreen, P.oakDark, P.doorRed]) : P.oakDark, { at: [dx, 0, zf], facing: '+z', depth: 0.06 });
      b.box(1.5, 0.15, 0.25, serena, { at: [dx, 2.55, zf + 0.12] }); // cornice over the door
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
        pot(b, [cx + 2.6, 0, zb - 0.6], 1.1);
      } else {
        b.panel(1.0, 2.2, P.oakDark, { at: [cx + 1.4, 0, zb], facing: '-z' });
        b.window(0.9, 1.2, { at: [cx - 1.4, 1.0, zb], facing: '-z', frame: P.oak, glass: cloth, bars: [2, 2] });
      }
      for (const x of [-1.6, 1.6]) {
        b.window(0.9, 1.5, { at: [cx + x, g + 0.8, zb], facing: '-z', frame: P.oak, glass: cloth, bars: [2, 2] });
        b.window(0.8, 1.2, { at: [cx + x, g + f1 + 0.7, zb], facing: '-z', frame: P.oak, glass: cloth, bars: [2, 2] });
      }
    };
    house(-X / 2, true);
    house(X / 2, false);
    b.box(0.12, H, 9.04, tint(P.pietraSerena, 0.1), { at: [0, 0, 3.5] }); // the line of the party wall

    // ---- yards
    const yz = (-1.0 - 8.8) / 2;
    well(b, [-1.4, 0, -4.4], tint(P.pietraSerena, 0.08), { frame: 'iron' });
    vegBed(b, -4.6, -6.8, 3.2, 3.2, { rows: 5 });
    pot(b, [-1.6, 0, -7.8], 1.3, P.leaf); // a lemon in a pot
    b.blob(0.18, P.marbleYellow, { at: [-1.4, 1.2, -7.6], detail: 0 });
    b.tree(b.range(3.6, 4.2), { at: [4.4, 0, -6.0], kind: 'olive' });
    b.box(1.3, 2.1, 1.2, P.rubble, { at: [5.6, 0, -8.0] });
    coppiShed(b, 1.5, 1.4, 0.35, tile, { at: [5.6, 2.1, -8.0], high: '+z' });
    b.box(0.3, 2.3, 7.8, P.rubble, { at: [0, 0, yz] });
    b.sym((s) => b.box(0.3, 2.3, 7.8, P.rubble, { at: [s * (X - 0.15), 0, yz] }));
    b.box(W, 2.3, 0.3, P.rubble, { at: [0, 0, -8.65] });
  },
};
