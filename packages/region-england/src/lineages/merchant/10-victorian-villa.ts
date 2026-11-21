import { P, linspace, tint, type Builder, type BuildingDef, type Facing } from '@ah/kit';
import { bargeboard, cantedBay } from './shared';

/** A Gothic window: pointed head, plate glass, a polychrome arch of contrasting brick above. */
function gothicWin(b: Builder, x: number, y: number, z: number, facing: Facing, w: number, h: number, arch: number, stone: number) {
  b.panel(w + 0.36, h + 0.2, arch, { at: [x, y, z], facing, shape: 'pointed', depth: 0.04 });
  b.window(w, h, { at: [x, y, z], facing, shape: 'pointed', frame: P.white, bars: [2, 1], border: 0.07 });
  b.panel(w + 0.3, 0.14, stone, { at: [x, y - 0.12, z], facing, depth: 0.12 });
}

export const victorianVilla: BuildingDef = {
  id: 'victorian-villa',
  name: 'Victorian Gothic villa',
  style: 'High Victorian Gothic',
  date: 'c. 1865',
  summary:
    'The railways now bring machine-made brick, Welsh slate and plate glass to every town, and the mill owner’s villa uses all three. ' +
    'Following Ruskin and the Gothic Revival it is deliberately irregular: steep roofs, pointed arches and stripes of coloured brick, with a tower, a bay window and a cast-iron conservatory to show off. ' +
    'The calm, symmetrical Georgian box has been thrown over for the picturesque and the medieval.',
  materials: ['red, yellow and blue brick', 'Welsh slate', 'plate glass', 'cast iron', 'stone dressings'],
  lookFor: [
    { label: 'Tower', note: 'A tall entrance tower with a steep pyramid roof and an iron finial, there for show rather than use.', at: [3.5, 15.2, 11.4] },
    { label: 'Polychrome brickwork', note: 'Bands and arches of yellow and blue brick against red: the ‘structural polychromy’ that Ruskin admired in Italy.', at: [-1.0, 4.6, 10.2] },
    { label: 'Canted bay window', note: 'A bay with angled sides rising through two storeys, letting light into the best rooms.', at: [-3.75, 2.4, 12.6] },
    { label: 'Bargeboards', note: 'Shaped boards along the gable edge, by now often machine-cut and bought from catalogues.', at: [-3.75, 10.9, 12.2] },
    { label: 'Conservatory', note: 'A glasshouse of cast iron and plate glass for ferns and palms, made affordable once the glass tax was abolished in 1845.', at: [7.0, 3.6, 4.0] },
  ],
  influences: ['gothic-revival-export', 'industrial-export'],
  build(b) {
    const brick = b.pick([P.brickRed, tint(P.brickRed, -0.03), P.brickOrange]);
    const band = P.brickYellow;
    const blue = P.brickBlue;
    const stone = b.pick([P.bathStone, P.limestone]);
    const slate = b.pick([P.slate, P.slateBlue]);
    const glazing = P.white;
    const base = 0.6;
    const g = 3.5;
    const H = base + g + 3.3; // 7.4

    const bands = (w: number, d: number, x: number, z: number, top: number) => {
      for (let y = base + 1.2; y < top - 0.4; y += 1.4) {
        b.box(w + 0.04, 0.16, d + 0.04, band, { at: [x, y, z], jitter: false });
        b.box(w + 0.04, 0.1, d + 0.04, blue, { at: [x, y + 0.16, z], jitter: false });
      }
      b.box(w + 0.08, base, d + 0.08, blue, { at: [x, 0, z] });
    };

    // ---- main block, ridge along the street
    b.box(11, H, 9, brick, { at: [-0.5, 0, 5.5] });
    bands(11, 9, -0.5, 5.5, H);
    b.gable(11, 9, 4.4, slate, { at: [-0.5, H, 5.5], overhang: 0.45, wall: brick });
    b.box(10, 0.3, 0.06, P.castIron, { at: [0.6, H + 4.55, 5.5] });
    for (const x of linspace(14, -4.4, 5.6)) b.cone(0.08, 0.35, P.castIron, { at: [x, H + 4.85, 5.5], segs: 4 });
    // tall chimneys on the gable ends
    b.sym((s) => b.chimney(1.0, 3.2, 0.8, brick, { at: [-0.5 + s * 5.0, H + 2.6, 5.5], pots: 3 }));

    // ---- gabled cross-wing on the left with a two-storey canted bay
    const wx = -3.75;
    b.box(4.5, H, 10.5, brick, { at: [wx, 0, 6.25] });
    bands(4.5, 10.5, wx, 6.25, H);
    b.gable(4.5, 10.5, 4.8, slate, { at: [wx, H, 6.25], ridge: 'z', overhang: 0.45, wall: brick });
    bargeboard(b, 2.25, 4.8, 0.45, wx, H, 11.5 + 0.45, P.white);
    gothicWin(b, wx, H + 1.0, 11.5, '+z', 1.0, 2.0, band, stone);
    const faces = cantedBay(b, wx, 11.5, 0, H - 0.4, 3.2, 1.8, 0.95, brick);
    b.extrude([[-1.75, 0.02], [1.75, 0.02], [1.0, -1.15], [-1.0, -1.15]], 0.25, stone, { at: [wx, H - 0.4 + 0.125, 11.5], rot: [-Math.PI / 2, 0, 0] });
    b.extrude([[-1.7, 0.02], [1.7, 0.02], [0.95, -1.05], [-0.95, -1.05]], 0.2, stone, { at: [wx, base + g + 0.1, 11.5], rot: [-Math.PI / 2, 0, 0] });
    for (const fc of faces) {
      const ww = Math.min(1.05, fc.w - 0.3);
      for (const y of [base + 0.5, base + g + 0.5]) {
        b.window(ww, 2.2, { at: [fc.at[0], y, fc.at[1]], facing: fc.facing, frame: stone, bars: [1, 2], border: 0.1 });
      }
    }

    // ---- entrance tower at the right-hand front corner
    const tx = 3.5;
    const tz = 9.6;
    const tH = 11.2;
    b.box(3.2, tH, 3.2, brick, { at: [tx, 0, tz] });
    bands(3.2, 3.2, tx, tz, tH);
    b.box(3.5, 0.3, 3.5, stone, { at: [tx, tH - 0.3, tz] });
    b.pyramid(3.2, 3.2, 5.0, slate, { at: [tx, tH, tz], overhang: 0.35 });
    b.cyl(0.05, 1.4, P.castIron, { at: [tx, tH + 4.9, tz], segs: 4 });
    b.sphere(0.12, P.castIron, { at: [tx, tH + 5.6, tz], segs: 6 });
    // pointed doorway with alternating voussoirs, steps
    b.panel(2.0, 3.1, band, { at: [tx, base, tz + 1.6], facing: '+z', shape: 'pointed', depth: 0.04 });
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.1 + (0.8 * i) / 8);
      b.panel(0.22, 0.3, i % 2 ? blue : stone, { at: [tx + Math.cos(a) * 0.88, base + 2.1 + Math.sin(a) * 0.75, tz + 1.6], facing: '+z', depth: 0.07 });
    }
    b.panel(1.3, 2.8, P.doorRed, { at: [tx, base, tz + 1.6], facing: '+z', shape: 'pointed', depth: 0.09 });
    b.stairs(2.0, base, 0.9, 3, stone, { at: [tx, 0, tz + 2.05] });
    gothicWin(b, tx, base + g + 0.6, tz + 1.6, '+z', 0.9, 2.0, band, stone);
    gothicWin(b, tx, H + 0.9, tz + 1.6, '+z', 0.8, 1.8, band, stone);
    gothicWin(b, tx + 1.6, H + 0.9, tz, '+x', 0.8, 1.8, band, stone);
    gothicWin(b, tx + 1.6, base + g + 0.6, tz, '+x', 0.9, 2.0, band, stone);

    // ---- main front between wing and tower
    gothicWin(b, 0, base + 0.6, 10, '+z', 1.1, 2.5, band, stone);
    gothicWin(b, 0, base + g + 0.6, 10, '+z', 1.1, 2.2, band, stone);
    // dormer-gable on the main roof
    b.box(1.8, 1.8, 1.6, brick, { at: [0, H - 0.1, 9.2] });
    b.gable(1.8, 1.6, 1.4, slate, { at: [0, H + 1.7, 9.2], ridge: 'z', overhang: 0.2, wall: brick });
    gothicWin(b, 0, H + 0.1, 10, '+z', 0.7, 1.3, band, stone);

    // ---- sides and back
    for (const y of [base + 0.6, base + g + 0.6]) {
      gothicWin(b, -6, y, 3.5, '-x', 1.1, 2.2, band, stone);
      gothicWin(b, -6, y, 8.5, '-x', 1.1, 2.2, band, stone);
      for (const x of [-3.75, 0.5]) gothicWin(b, x, y, 1, '-z', 1.1, 2.2, band, stone);
      gothicWin(b, 5, y, 7.5, '+x', 1.0, 2.2, band, stone);
    }
    // back kitchen wing
    b.box(4.4, 5.6, 4.6, brick, { at: [2.2, 0, -1.3] });
    bands(4.4, 4.6, 2.2, -1.3, 5.6);
    b.gable(4.4, 4.6, 2.6, slate, { at: [2.2, 5.6, -1.3], ridge: 'z', overhang: 0.3, wall: brick });
    gothicWin(b, 2.2, base + 0.6, -3.6, '-z', 1.0, 2.0, band, stone);
    b.chimney(0.8, 2.6, 0.8, brick, { at: [3.4, 6.4, -1.3], pots: 2 });

    // ---- cast-iron and glass conservatory on the right side
    const cx = 7.1;
    const cz = 4.0;
    const cw = 4.2;
    const cd = 5.4;
    b.box(cw, 0.6, cd, blue, { at: [cx, 0, cz] });
    b.box(cw - 0.1, 2.6, cd - 0.1, P.glass, { at: [cx, 0.6, cz], mat: 'glass' });
    b.gable(cw, cd, 1.6, tint(P.glass, 0.05), { at: [cx, 3.2, cz], ridge: 'x', overhang: 0.1, mat: 'glass' });
    for (const z of linspace(6, cz - cd / 2, cz + cd / 2)) {
      b.box(0.07, 2.6, 0.07, glazing, { at: [cx + cw / 2, 0.6, z] });
    }
    for (const x of linspace(5, cx - cw / 2, cx + cw / 2)) {
      for (const s of [1, -1]) b.box(0.07, 2.6, 0.07, glazing, { at: [x, 0.6, cz + s * cd / 2] });
    }
    b.box(cw + 0.1, 0.1, cd + 0.1, glazing, { at: [cx, 3.15, cz] });
    b.box(0.12, 0.1, cd + 0.3, glazing, { at: [cx, 4.8, cz] });
    for (const z of linspace(7, cz - cd / 2, cz + cd / 2)) b.cone(0.07, 0.3, P.castIron, { at: [cx, 4.88, z], segs: 4 });
    for (const z of [cz - 1.5, cz + 0.2, cz + 1.8]) b.blob(0.6, P.leafDark, { at: [cx, 1.4, z], stretch: [1, 1.3, 1] });

    // ---- garden: front wall and gate piers, shrubs, a monkey puzzle
    b.sym((s) => b.box(7.6, 0.9, 0.4, brick, { at: [s * 5.8, 0, 11.8] }));
    for (const x of [-1.8, 1.8]) {
      b.box(0.6, 1.6, 0.6, brick, { at: [x, 0, 11.8] });
      b.pyramid(0.7, 0.7, 0.5, stone, { at: [x, 1.6, 11.8] });
    }
    b.box(1.8, 0.04, 2.0, P.gravel, { at: [3.5, 0, 11.0] });
    b.tree(8, { at: [-6.5, 0, -7], kind: 'conifer', color: tint(P.leafDark, -0.05) });
    b.tree(6, { at: [6, 0, -8], kind: 'round' });
    b.box(18, 0.04, 9, P.grass, { at: [0, 0, -7.2] });
  },
};
