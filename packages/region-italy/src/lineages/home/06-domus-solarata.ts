import { P, tint, spread, type BuildingDef } from '@ah/kit';
import { coppiRoof, coppiShed, gardenWalls, gardenWallsTo, vegBed, well, WELL } from './shared';

export const domusSolarata: BuildingDef = {
  id: 'domus-solarata',
  name: 'Domus solarata',
  style: 'Early medieval',
  date: 'c. AD 800',
  summary:
    'By the ninth century the town had shrunk to clusters of houses among ruins, gardens and vineyards. Documents of the ninth and tenth centuries call ' +
    'a house like this a domus solarata, a house with an upper floor (the solarium), as against the single-storey houses most people ' +
    'lived in. The family lives upstairs, reached by an outside stair; below, behind an arcaded portico, are the stores, the animals and ' +
    'the work. It is built with care from blocks and bricks taken from the ruins, like the houses excavated in the Forum of Nerva in Rome, ' +
    'two-storey houses with a portico on the ground floor, built of the forum’s own stones in the 800s.',
  materials: ['reused peperino and tufa blocks', 'reused Roman brick', 'timber floor and roof', 'terracotta roof tiles'],
  modelledOn: 'The Carolingian houses in the Forum of Nerva, Rome (ninth century)',
  lookFor: [
    {
      label: 'Outside stair',
      note: 'A masonry stair against the front climbs to a landing at the door of the upper floor, where the family lived.',
      at: [4.4, 2.2, 8.3],
    },
    {
      label: 'Portico',
      note: 'An arcade of round arches on square piers shelters the ground floor, a dry place to work, store carts and tie up animals.',
      at: [-3.2, 2.9, 7.4],
    },
    {
      label: 'Reused stone',
      note: 'Big squared blocks of grey peperino, prised from a ruined Roman building, make the ground floor; the upper walls mix tufa with old Roman bricks.',
      at: [-6.0, 1.0, 7.3],
    },
    {
      label: 'Solarium',
      note: 'The upper floor that gives the house its name: a timber floor over the ground storey, with the family’s hall and chamber, small windows and wooden shutters.',
      at: [-1.9, 5.1, 7.3],
    },
    {
      label: 'Garden and well',
      note: 'Behind the house a garden of vegetables, vines and a fig, with a well, still closed at the back by the brick walls of a Roman garden: the early medieval town was half countryside.',
      at: [-4.6, 1.3, -3.6],
    },
  ],
  build(b) {
    const W = 13.6;
    const X = W / 2;
    const zf = 7.2;
    const zb = 0.7;
    const D = zf - zb;
    const zc = (zf + zb) / 2;
    const g = 3.6; // ground storey
    const u = 3.0; // upper storey
    const H = g + u;
    const pep = tint(P.peperino, b.range(-0.03, 0.03));
    const tufa = tint(P.tufa, b.range(-0.03, 0.03));
    const brick = tint(P.brickOrange, -0.05);
    const tile = tint(P.coppi, b.range(-0.05, 0.02));
    const shut = b.pick([P.oak, P.oakDark, P.oakSilver]);
    const xp = 0.4; // right end of the portico

    // ---- ground storey of big reused peperino blocks
    const lz = 4.9; // back wall of the portico
    b.box(X + xp, g, lz - zb, pep, { at: [(-X + xp) / 2, 0, (lz + zb) / 2] });
    b.box(X - xp, g, D, pep, { at: [(X + xp) / 2, 0, zc] });
    // the portico arcade, its piers capped with reused stone imposts
    const pw = X + xp;
    b.archWall(pw, g, 0.6, pep, { at: [(-X + xp) / 2, 0, zf - 0.3], facing: '+z', openings: 3, openW: 1.75, openH: 2.95, shape: 'round' });
    for (let i = 0; i <= 3; i++) {
      const x = -X + (i * pw) / 3;
      const cx = Math.max(-X + 0.35, Math.min(xp - 0.35, x));
      b.box(0.8, 0.22, 0.72, P.travertine, { at: [cx, 2.08, zf - 0.3] });
    }
    b.box(pw - 0.2, 0.04, zf - lz, P.earth, { at: [(-X + xp) / 2, 0, (zf + lz) / 2] });
    // doors and a window in the back of the portico
    b.panel(1.2, 2.3, P.oakDark, { at: [-4.4, 0, lz], facing: '+z', shape: 'round' });
    b.panel(1.3, 2.4, P.oak, { at: [-0.6, 0, lz], facing: '+z', shape: 'round' });
    b.window(0.6, 0.6, { at: [-2.4, 1.4, lz], facing: '+z', frame: shut });
    // stone courses and vertical joints of the big blocks
    for (const y of [0.9, 1.8, 2.7]) {
      b.box(X - xp + 0.02, 0.04, D + 0.02, tint(pep, -0.15), { at: [(X + xp) / 2, y, zc] });
      b.box(X + xp, 0.04, lz - zb + 0.02, tint(pep, -0.15), { at: [(-X + xp) / 2, y, (lz + zb) / 2] });
    }
    for (const [x, y] of [[1.6, 0], [3.3, 0.9], [5.1, 0], [2.4, 1.8], [4.4, 2.7], [6.0, 1.8], [2.0, 2.7]] as [number, number][]) {
      b.box(0.04, 0.9, 0.02, tint(pep, -0.15), { at: [x, y, zf + 0.01] });
    }

    // ---- upper storey of tufa blocks and old brick in bands
    b.box(W, u, D, tufa, { at: [0, g, zc] });
    for (const y of [g + 0.05, g + 1.2, g + 2.3]) b.box(W + 0.02, 0.24, D + 0.02, brick, { at: [0, y, zc] });
    b.box(W + 0.1, 0.18, D + 0.1, tint(tufa, 0.05), { at: [0, g - 0.08, zc] }); // floor line
    coppiRoof(b, W, D, 1.35, tile, { at: [0, H, zc], overhang: 0.5, ends: 0, wall: tufa, thick: 0.13 });
    b.box(W, 0.22, 0.3, P.oakDark, { at: [0, H - 0.2, zf + 0.12] }); // wall plate under the eaves
    for (const x of spread(15, -X + 0.3, X - 0.3)) b.box(0.12, 0.12, 0.5, P.oakDark, { at: [x, H - 0.12, zf + 0.25] }); // rafter feet

    // upper windows: small round-headed openings with board shutters
    const upWin = (x: number, z: number, facing: '+z' | '-z') => {
      const s = facing === '+z' ? 1 : -1;
      b.panel(0.95, 1.4, tint(tufa, 0.06), { at: [x, g + 0.95, z], facing, shape: 'round', depth: 0.03 });
      b.panel(0.65, 1.15, P.timberBlack, { at: [x, g + 1.05, z], facing, shape: 'round', depth: 0.05 });
      b.panel(0.36, 1.0, shut, { at: [x - s * 0.62, g + 1.05, z], facing, depth: 0.07 });
      b.box(0.9, 0.08, 0.18, P.travertine, { at: [x, g + 0.95, z + s * 0.08] });
    };
    for (const x of [-5.6, -3.2, -0.8, 4.2]) upWin(x, zf, '+z');
    for (const x of [-4.2, 0.4, 4.4]) upWin(x, zb, '-z');

    // ---- the outside stair to a landing at the upper door
    const sz = zf + 0.55;
    b.stairs(1.0, g, 4.0, 14, tint(tufa, -0.04), { at: [4.2, 0, sz], rotY: Math.PI / 2 });
    b.box(1.8, 0.25, 1.15, P.travertine, { at: [1.3, g - 0.25, sz + 0.02] }); // landing slab
    b.archWall(1.8, g - 0.25, 1.0, tint(tufa, -0.04), { at: [1.3, 0, sz], facing: '+z', openings: 1, openW: 1.1, openH: 2.3, shape: 'round' });
    // low parapet following the stair
    b.beam([6.2, 0.55, sz + 0.44], [2.2, g + 0.35, sz + 0.44], 0.14, 0.4, tint(tufa, -0.08));
    b.box(1.8, 0.75, 0.16, tint(tufa, -0.08), { at: [1.3, g, sz + 0.5] });
    // the upper door
    b.panel(1.15, 2.2, tint(tufa, 0.06), { at: [1.3, g, zf], facing: '+z', shape: 'round', depth: 0.03 });
    b.panel(0.9, 2.0, P.oak, { at: [1.3, g, zf], facing: '+z', shape: 'round', depth: 0.05 });
    // a store door under the landing
    b.panel(1.0, 2.0, P.oakDark, { at: [1.3, 0, zf], facing: '+z' });

    // back: a door to the garden, and a lean-to for the hens
    b.panel(1.1, 2.2, P.oakDark, { at: [-2.0, 0, zb], facing: '-z', shape: 'round' });
    for (const x of [3.0, 6.3]) b.box(0.14, 1.9, 0.14, P.oakSilver, { at: [x, 0, zb - 1.6] });
    coppiShed(b, 3.8, 1.7, 0.55, tint(tile, -0.05), { at: [4.65, 1.9, zb - 0.85], high: '+z' });
    b.box(3.2, 0.8, 1.3, P.wattle, { at: [4.65, 0, zb - 0.85] });

    // ---- the garden: beds, vines on a pergola, a fig, a well; the plot is still closed at the back by
    // the walls of the Roman garden, carried on with a low wall of tufa to the house
    gardenWalls(b, tint(P.brickOrange, -0.05));
    gardenWallsTo(b, zb, tint(tufa, -0.05), { h: 1.4 });
    vegBed(b, 2.0, -3.4, 4.6, 3.0, { rows: 6 });
    vegBed(b, 3.8, -7.2, 4.2, 2.4, { rows: 5, color: P.leafDark });
    well(b, WELL, tint(P.marble, -0.08), { frame: 'wood' });
    // vine pergola
    for (const [x, z] of [[-6.0, -6.0], [-1.2, -6.0], [-6.0, -7.4], [-1.2, -7.4]] as [number, number][]) b.box(0.12, 2.2, 0.12, P.oak, { at: [x, 0, z] });
    for (const z of [-6.0, -7.4]) b.box(5.0, 0.1, 0.1, P.oak, { at: [-3.6, 2.2, z] });
    b.box(5.2, 0.25, 1.9, P.leaf, { at: [-3.6, 2.3, -6.7] });
    b.tree(b.range(3.6, 4.2), { at: [5.6, 0, -1.6], kind: 'round', color: P.leafDark }); // fig
    b.log(0.3, 0.9, P.marble, { at: [-5.6, 0, -1.4], segs: 9, rotY: 0.5 }); // a column drum
  },
};
