import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { lin, opening } from './shared';

const ZC = -3; // centre of the temple
const G = 8.7; // half side of the gallery
const C = 4.5; // half side of the cella
const CH = 15; // height of the cella walls
const WALL = mix(P.pierreBlonde, P.rubble, 0.35);
const BRICK = P.brickRed;
const PLASTER = mix(P.plaster, P.ochreWash, 0.15);
const ROOF = P.romanTile;

export const fanum: BuildingDef = {
  id: 'fanum',
  name: 'Romano-Celtic temple (fanum)',
  style: 'Gallo-Roman',
  date: 'c. AD 40',
  summary:
    'Under Rome the gods of the tribe were given a temple in mortared stone, but not a Roman one. The fanum keeps the square Celtic shrine: a tall cella, the room of the god, rising like a tower out of a lower gallery that runs round all four sides, where worshippers walked and left offerings. ' +
    'It is built the Roman way, in small squared stones with bands of brick, under tiled roofs, and stands in a walled precinct entered through a gate, with an altar in front. Temples of this kind are found almost only in Gaul, the Rhineland and Britain. ' +
    'Nothing of the Gaulish sanctuary survives above ground, though the precinct keeps its place and its square shape.',
  materials: ['small squared limestone (petit appareil)', 'brick courses', 'lime mortar and plaster', 'Roman roof tiles'],
  lookFor: [
    { label: 'Cella tower', note: 'The tall square room of the god, lit by high windows above the gallery roof; the Temple of Janus at Autun still stands over twenty metres high. Most fana faced east, with the door and altar on that side.', at: [C + 0.3, 11.0, ZC] },
    { label: 'Gallery', note: 'A lower covered walk on all four sides, its roof on a ring of columns standing on a low wall.', at: [G + 0.3, 3.0, ZC + 4] },
    { label: 'Brick bands', note: 'Courses of flat brick laid through the stone walls, a Roman habit that levelled and bonded the work.', at: [-C - 0.2, 7.6, ZC + 2] },
    { label: 'Precinct wall', note: 'The sacred enclosure (temenos), as in the Gaulish sanctuary before it, now walled in stone.', at: [-14.3, 2.0, 4.0] },
    { label: 'Altar', note: 'Sacrifice took place in the open, at the altar in front of the temple, not inside it.', at: [0, 1.4, 9.0] },
  ],
  modelledOn:
    'The Temple of Janus at Autun (first century AD) for the tall square cella; the gallery, the precinct and its gate follow the plans of excavated fana in northern Gaul, such as those of the Forêt d’Halatte and Genainville. Proportions are generic.',
  influences: ['roman-conquest', 'romano-celtic-temple'],
  build(b) {
    b.box(32, 0.03, 50, P.grass, { at: [0, 0, 0], jitter: false });
    b.box(29.4, 0.05, 37.4, mix(P.gravel, P.grassDry, 0.35), { at: [0, 0, -1], jitter: false });
    // precinct wall with a tile coping and a gate
    const coping = tint(ROOF, -0.05);
    for (const [w, d, x, z] of [[30, 0.7, 0, -19.65], [0.7, 38, 14.65, -1], [0.7, 38, -14.65, -1]] as const) {
      b.box(w, 2.8, d, WALL, { at: [x, 0, z] });
      b.box(w + (w > 1 ? 0.2 : 0.3), 0.25, d + (d > 1 ? 0.2 : 0.3), coping, { at: [x, 2.8, z], jitter: false });
    }
    for (const s of [-1, 1]) {
      b.box(12.2, 2.8, 0.7, WALL, { at: [s * 8.9, 0, 17.65] });
      b.box(12.4, 0.25, 0.9, coping, { at: [s * 8.9, 2.8, 17.65], jitter: false });
    }
    b.archWall(5.6, 4.4, 2.4, WALL, { at: [0, 0, 17.65], openings: 1, openW: 2.6, openH: 3.6, shape: 'round' });
    b.gable(5.8, 2.8, 1.3, ROOF, { at: [0, 4.4, 17.65], overhang: 0.3, wall: WALL });
    // the temple: podium, gallery, cella
    b.box(2 * G + 0.6, 0.5, 2 * G + 0.6, tint(WALL, 0.05), { at: [0, 0, ZC] });
    b.stairs(3.0, 0.5, 1.2, 2, tint(WALL, 0.05), { at: [0, 0, ZC + G + 0.9] });
    const colH = 3.9;
    const cols = lin(8, -G + 0.3, G - 0.3);
    for (const u of cols) {
      for (const [x, z] of [[u, ZC + G - 0.3], [u, ZC - G + 0.3], [G - 0.3, ZC + u], [-G + 0.3, ZC + u]] as const) {
        b.cyl(0.24, colH, PLASTER, { at: [x, 0.5, z], segs: 6, jitter: false });
        b.box(0.6, 0.2, 0.6, PLASTER, { at: [x, 0.5 + colH - 0.2, z], jitter: false });
      }
    }
    // low wall between the columns, open at the front
    for (const [w, d, x, z] of [[2 * G - 0.6, 0.3, 0, ZC - G + 0.3], [0.3, 2 * G - 0.6, G - 0.3, ZC], [0.3, 2 * G - 0.6, -G + 0.3, ZC]] as const) {
      b.box(w, 0.9, d, PLASTER, { at: [x, 0.5, z] });
    }
    for (const s of [-1, 1]) b.box(G - 1.5, 0.9, 0.3, PLASTER, { at: [(s * (G + 1.5 - 0.6)) / 2, 0.5, ZC + G - 0.3] });
    b.box(2 * G, 0.45, 2 * G, PLASTER, { at: [0, 0.5 + colH, ZC] });
    b.box(2 * G - 1.2, 0.2, 2 * G - 1.2, tint(PLASTER, -0.2), { at: [0, 0.5 + colH - 0.02, ZC], jitter: false });
    const gy = 0.5 + colH + 0.45;
    b.pyramid(2 * G + 0.8, 2 * G + 0.8, 4.4, ROOF, { at: [0, gy, ZC], overhang: 0 });
    // the cella, with brick bands, high windows and a tall door
    b.box(2 * C, CH, 2 * C, WALL, { at: [0, 0.5, ZC] });
    for (const y of [7.6, 10.9, 14.0]) b.box(2 * C + 0.06, 0.24, 2 * C + 0.06, BRICK, { at: [0, y, ZC], jitter: false });
    for (const [x, z, r] of [[0, ZC + C, 0], [0, ZC - C, Math.PI], [C, ZC, Math.PI / 2], [-C, ZC, -Math.PI / 2]] as const) {
      opening(b, 'round', 1.6, 2.8, [x, 11.2, z], r, P.windowDark, tint(BRICK, 0.05), 0.22);
    }
    opening(b, 'round', 2.0, 4.0, [0, 0.5, ZC + C], 0, P.oakDark, tint(BRICK, 0.05), 0.24);
    b.box(2 * C + 0.4, 0.35, 2 * C + 0.4, PLASTER, { at: [0, CH + 0.5, ZC] });
    b.pyramid(2 * C + 1.0, 2 * C + 1.0, 3.2, ROOF, { at: [0, CH + 0.85, ZC], overhang: 0 });
    // the altar and a few offerings
    b.box(2.0, 1.0, 1.4, tint(WALL, 0.08), { at: [0, 0, 9.0] });
    b.box(2.3, 0.2, 1.7, tint(WALL, 0.12), { at: [0, 1.0, 9.0] });
    b.cyl(0.35, 1.4, tint(WALL, 0.1), { at: [-4.5, 0, 9.5], segs: 8 });
    b.cyl(0.35, 1.4, tint(WALL, 0.1), { at: [4.5, 0, 9.5], segs: 8 });
    b.tree(8, { at: [-10.5, 0, 12.5], kind: 'round' });
    b.tree(9, { at: [11.0, 0, -15.0], kind: 'round' });
    b.collider(2 * G + 0.6, 2 * G + 0.6, { at: [0, 0, ZC] });
    b.collider(30, 0.7, { at: [0, 0, -19.65] });
    b.collider(0.7, 38, { at: [14.65, 0, -1] });
    b.collider(0.7, 38, { at: [-14.65, 0, -1] });
    for (const s of [-1, 1]) b.collider(12.2, 2.4, { at: [s * 8.9, 0, 17.65] });
    b.collider(2.4, 1.6, { at: [0, 0, 9.0] });
  },
};
