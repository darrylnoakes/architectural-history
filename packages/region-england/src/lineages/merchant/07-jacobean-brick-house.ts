import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { dutchGable } from './shared';

/** A shaped gable wall facing +Z (or -Z with flip) with a stone coping rim and a ball finial. */
function shapedGable(b: Builder, w: number, h: number, x: number, y: number, z: number, brick: number, stone: number, flip = false) {
  const pts = dutchGable(w, h);
  const s = flip ? -1 : 1;
  b.extrude(pts, 0.45, brick, { at: [x, y, z - s * 0.2] });
  const big = dutchGable(w + 0.24, h + 0.14).map(([px, py]) => [px, py] as [number, number]);
  b.extrude(big, 0.3, stone, { at: [x, y - 0.0, z - s * 0.32] });
  b.sphere(0.22, stone, { at: [x, y + h + 0.32, z - s * 0.2], segs: 8 });
  b.box(0.22, 0.14, 0.22, stone, { at: [x, y + h + 0.02, z - s * 0.2] });
}

/** Stone quoins up a corner: alternate long and short blocks on both faces. */
function quoins(b: Builder, x: number, z: number, sx: number, sz: number, h: number, stone: number) {
  const n = Math.floor(h / 0.5);
  for (let i = 0; i < n; i++) {
    const long = i % 2 === 0;
    const y = i * 0.5 + 0.05;
    b.box(long ? 0.7 : 0.4, 0.4, 0.06, stone, { at: [x - sx * (long ? 0.35 : 0.2), y, z + sz * 0.03] });
    b.box(0.06, 0.4, long ? 0.4 : 0.7, stone, { at: [x + sx * 0.03, y, z - sz * (long ? 0.2 : 0.35)] });
  }
}

export const jacobeanBrickHouse: BuildingDef = {
  id: 'jacobean-brick-house',
  name: 'Jacobean brick house',
  style: 'Jacobean',
  date: 'c. 1630',
  summary:
    'Brick, still a rarity in a town a century before, is now the fashionable material for anyone who can afford it, and timber is growing scarce. ' +
    'The front has become symmetrical, an E of two gabled wings and a central porch, and the gables are shaped into curves copied from the Low Countries. ' +
    'Columns and flat, interlaced strapwork, learned second-hand from Flemish pattern books, are applied to the porch, but the house is still tall, gabled and mullioned like its medieval forebears.',
  materials: ['red brick', 'limestone dressings', 'clay tile', 'leaded glass'],
  lookFor: [
    { label: 'Shaped (Dutch) gable', note: 'The gable wall rises above the roof in curved shoulders to a little pediment, a fashion from Flanders and Holland.', at: [6.7, 11.0, 11.9] },
    { label: 'Mullion-and-transom window', note: 'Stone uprights (mullions) and a crossbar (transom) divide the window into leaded lights. Sashes have not arrived yet.', at: [-6.7, 2.2, 11.8] },
    { label: 'Strapwork porch', note: 'Paired columns and flat, interlaced bands of carved stone like cut leather: Renaissance ornament reached England through Flemish pattern books.', at: [0, 3.8, 12.0] },
    { label: 'Diagonal chimney shafts', note: 'Square brick shafts set corner-on, grouped on a single base.', at: [-3, 12.6, 5.5] },
    { label: 'Symmetry', note: 'Wing, porch, wing: the front now mirrors about its centre, though the house behind is still a medieval plan.', at: [0, 9.2, 11.6] },
  ],
  influences: ['flemish-brick', 'italian-renaissance'],
  build(b) {
    const brick = b.pick([P.brickRed, P.brickOrange, tint(P.brickRed, 0.03)]);
    const stone = b.pick([P.limestone, P.bathStone]);
    const tile = b.pick([P.tileRed, P.tileBrown, tint(P.tileRed, -0.05)]);
    const glass = P.windowDark;
    const g = 3.4; // ground storey
    const H = 6.6; // eaves
    const zf = 11.4; // front of wings and porch
    const zr = 9; // front of the recessed centre
    const zb = 0; // back wall

    // ---- central range between the wings
    b.box(8.4, H, zr - zb, brick, { at: [0, 0, (zr + zb) / 2] });
    b.gable(8.4, zr - zb, 3.6, tile, { at: [0, H, (zr + zb) / 2], overhang: 0.25, wall: brick });
    // ---- the two wings, gable-ended front and back
    b.sym((s) => {
      const x = s * 6.7;
      b.box(5, H, zf - zb, brick, { at: [x, 0, (zf + zb) / 2] });
      b.gable(5, zf - zb, 3.6, tile, { at: [x, H, (zf + zb) / 2], ridge: 'z', overhang: 0.05, wall: brick });
      shapedGable(b, 5.3, 4.5, x, H, zf, brick, stone);
      shapedGable(b, 5.3, 4.5, x, H, zb, brick, stone, true);
      quoins(b, x + s * 2.5, zf, s, 1, H, stone);
      quoins(b, x - s * 2.5, zf, -s, 1, H, stone);
    });
    // string courses and plinth
    b.box(18.5, 0.16, zf - zb + 0.1, stone, { at: [0, g, (zf + zb) / 2] });
    b.box(18.5, 0.5, zf - zb + 0.1, tint(brick, -0.06), { at: [0, 0, (zf + zb) / 2] });
    b.box(18.5, 0.2, zf - zb + 0.12, stone, { at: [0, H - 0.2, (zf + zb) / 2] });

    // ---- windows: stone mullion-and-transom crosses with leaded lights
    const mt = (x: number, y: number, z: number, w: number, h: number, facing: '+z' | '-z' | '+x' | '-x') => {
      const cols = Math.max(2, Math.round(w / 0.6));
      b.window(w, h, { at: [x, y, z], facing, frame: stone, glass, bars: [cols, 2], border: 0.12 });
      b.panel(w + 0.3, 0.16, stone, { at: [x, y + h, z], facing, depth: 0.12 }); // hood mould
    };
    b.sym((s) => {
      mt(s * 6.7, 0.9, zf, 2.6, 2.0, '+z');
      mt(s * 6.7, g + 0.6, zf, 2.6, 2.0, '+z');
      mt(s * 6.7, H + 1.2, zf, 1.4, 1.3, '+z');
      mt(s * 3.0, 0.9, zr, 1.8, 2.0, '+z');
      mt(s * 3.0, g + 0.6, zr, 1.8, 2.0, '+z');
      // sides and back
      const f = s > 0 ? '+x' : '-x';
      mt(s * 9.2, 0.9, 3.0, 1.8, 2.0, f);
      mt(s * 9.2, g + 0.6, 3.0, 1.8, 2.0, f);
      mt(s * 9.2, 0.9, 8.0, 1.8, 2.0, f);
      mt(s * 9.2, g + 0.6, 8.0, 1.8, 2.0, f);
      mt(s * 6.7, 0.9, zb, 2.2, 2.0, '-z');
      mt(s * 6.7, g + 0.6, zb, 2.2, 2.0, '-z');
      mt(s * 6.7, H + 1.2, zb, 1.2, 1.2, '-z');
      mt(s * 2.3, g + 0.6, zb, 1.8, 2.0, '-z');
      mt(s * 2.3, 0.9, zb, 1.6, 1.8, '-z');
    });
    b.panel(1.2, 2.3, P.oakDark, { at: [0, 0.5, zb], facing: '-z' });

    // ---- the porch: three storeys, columns, strapwork and its own shaped gable
    const pw = 3.0;
    const pz = (zf + zr) / 2;
    const pH = 8.0;
    b.box(pw, pH, zf - zr, brick, { at: [0, 0, pz] });
    shapedGable(b, 3.1, 2.4, 0, pH, zf, brick, stone);
    b.gable(pw, zf - zr, 1.3, tile, { at: [0, pH, pz], ridge: 'z', overhang: 0.02, wall: brick });
    quoins(b, pw / 2, zf, 1, 1, pH, stone);
    quoins(b, -pw / 2, zf, -1, 1, pH, stone);
    // round-arched doorway framed by paired Doric columns on pedestals and an entablature
    b.panel(1.9, 2.9, stone, { at: [0, 0.3, zf], facing: '+z', shape: 'round', depth: 0.08 });
    b.panel(1.3, 2.6, P.oakDark, { at: [0, 0.3, zf], facing: '+z', shape: 'round', depth: 0.1 });
    b.stairs(2.2, 0.3, 0.6, 2, stone, { at: [0, 0, zf + 0.3] });
    b.sym((s) => {
      b.box(0.5, 0.7, 0.5, stone, { at: [s * 1.25, 0, zf + 0.25] });
      b.column(0.16, 2.5, stone, { at: [s * 1.25, 0.7, zf + 0.25], order: 'doric' });
    });
    b.box(3.2, 0.4, 0.55, stone, { at: [0, 3.2, zf + 0.22] });
    // strapwork panel over the door: a slab pierced with interlacing loops
    const strap: [number, number][] = [[-1.3, 0], [1.3, 0], [1.3, 0.55], [0.6, 0.55], [0.35, 0.95], [-0.35, 0.95], [-0.6, 0.55], [-1.3, 0.55]];
    const loop = (cx: number, cy: number, r: number): [number, number][] => {
      const out: [number, number][] = [];
      for (let i = 0; i < 10; i++) out.push([cx + Math.cos((i / 10) * Math.PI * 2) * r * 1.4, cy + Math.sin((i / 10) * Math.PI * 2) * r]);
      return out;
    };
    b.extrude(strap, 0.12, stone, { at: [0, 3.6, zf + 0.06], holes: [loop(-0.8, 0.28, 0.14), loop(0.8, 0.28, 0.14), loop(0, 0.5, 0.16), [[-0.25, 0.08], [-0.05, 0.08], [-0.15, 0.32]], [[0.05, 0.08], [0.25, 0.08], [0.15, 0.32]]] });
    b.sym((s) => b.sphere(0.13, stone, { at: [s * 1.3, 3.75 + 0.6, zf + 0.06], segs: 6 }));
    // upper stages of the porch: window with Ionic pilasters, then a small window
    mt(0, g + 1.3, zf, 1.6, 1.8, '+z');
    b.sym((s) => b.panel(0.22, 2.6, stone, { at: [s * 1.15, g + 0.9, zf], facing: '+z', depth: 0.1 }));
    b.box(3.0, 0.2, 0.2, stone, { at: [0, g + 3.55, zf + 0.06] });
    mt(0, H + 0.2, zf, 1.0, 1.0, '+z');

    // ---- tall chimney stacks with diagonal shafts
    b.sym((s) => {
      const cx = s * 3;
      const cz = 5.5;
      b.box(1.6, 3.4, 1.0, brick, { at: [cx, H + 2.4, cz] });
      b.box(1.8, 0.18, 1.2, stone, { at: [cx, H + 5.8, cz] });
      for (const dx of [-0.45, 0, 0.45]) {
        b.box(0.38, 1.6, 0.38, brick, { at: [cx + dx, H + 5.98, cz], rotY: Math.PI / 4 });
        b.box(0.5, 0.15, 0.5, tint(brick, 0.06), { at: [cx + dx, H + 7.58, cz], rotY: Math.PI / 4 });
      }
    });

    // ---- forecourt wall with gate piers and ball finials
    b.sym((s) => {
      b.box(7.2, 1.0, 0.35, brick, { at: [s * 5.2, 0, 11.75] });
      b.box(0.7, 2.0, 0.7, brick, { at: [s * 1.55, 0, 11.75] });
      b.box(0.85, 0.15, 0.85, stone, { at: [s * 1.55, 2.0, 11.75] });
      b.sphere(0.3, stone, { at: [s * 1.55, 2.45, 11.75], segs: 8 });
      b.box(0.35, 1.0, 1.4, brick, { at: [s * 8.95, 0, 11.4] });
    });
    // garden behind: a simple parterre and boundary wall
    b.box(14, 0.05, 9, P.gravel, { at: [0, 0, -6.2] });
    for (const x of [-4.5, 0, 4.5]) for (const z of [-4, -8.4]) b.box(3.6, 0.3, 3.2, P.grass, { at: [x, 0, z] });
    for (const x of [-4.5, 0, 4.5]) for (const z of [-4, -8.4]) b.blob(0.45, P.hedge, { at: [x, 0.5, z], stretch: [1, 1.4, 1] });
    b.sym((s) => b.box(0.35, 2.0, 11.4, brick, { at: [s * 9.7, 0, -6] }));
    b.box(19.7, 2.0, 0.35, brick, { at: [0, 0, -11.6] });
  },
};
