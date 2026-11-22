import { P, mix, spread, tint, type BuildingDef } from '@ah/kit';
import {
  MON,
  MON_TOP,
  PAL,
  TWR,
  brickSquare,
  kingMonument,
  lordsColliders,
  lordsCourt,
  palaceColliders,
  palazzoPubblico,
  pave,
} from './shared';

/** The party headquarters in zone C. */
const CF = { x0: 6.8, x1: 21.3, z0: -7.5, z1: 7, g: 4.2, f: 3.5, floors: 4 };

export const casaDelFascio: BuildingDef = {
  id: 'casa-del-fascio',
  name: 'Casa del Fascio',
  style: 'Rationalist',
  date: 'c. 1934',
  summary:
    'Under Fascism elected councils are abolished: from 1926 the old palace (old) is run by a podestà appointed from Rome, and real power in the town lies with the party. ' +
    'Its local headquarters goes up on the main square beside the town hall (new): a box of white marble, its front a deep grid of frame and void on one side and a blank wall on the other, built of reinforced concrete and plate glass. ' +
    'Rationalist architects argued that this was a modern classicism, as ordered as a Roman building; the party wanted a “house of glass” where the people could see in. The row of glass doors at the bottom was meant to open together so the crowd in the square could pour into the hall.',
  materials: ['reinforced concrete', 'white marble cladding', 'plate glass', 'glass blocks'],
  lookFor: [
    { label: 'Grid of frame and void', note: 'Deep marble-faced beams and columns stand out in front of the glazing, a grid you can read as structure and as shadow.', at: [CF.x0 + 3.2, 10, CF.z1 + 0.4] },
    { label: 'Blank wall', note: 'The right-hand part of the front is a plain marble plane, meant as a surface for propaganda images.', at: [CF.x1 - 2.2, 9, CF.z1 + 0.3] },
    { label: 'Glass doors', note: 'A continuous row of glazed doors on the ground floor, to join the hall inside to the square outside.', at: [CF.x1 - 4, 1.4, CF.z1 + 0.4] },
    { label: 'Flat roof and glass-block skylight', note: 'No roof tiles and no cornice: the hall in the middle is lit from above through a ceiling of glass blocks.', at: [(CF.x0 + CF.x1) / 2, CF.g + CF.f * (CF.floors - 1) + 1.2, (CF.z0 + CF.z1) / 2] },
    { label: 'The old palace, kept', note: 'The medieval palace and its tower stand beside the new building, the podestà’s seat, with the tower’s bell still ringing the hours.', at: [TWR.x + 2.6, 26, TWR.z + 2.6] },
  ],
  modelledOn: 'Giuseppe Terragni’s Casa del Fascio, Como (1932 to 1936), much reduced and less wide',
  influences: ['rationalism'],
  build(b) {
    palazzoPubblico(b, { stage: 1934 });
    lordsCourt(b);
    brickSquare(b, -21.5, 21.5, PAL.zf, 21.5);
    kingMonument(b);

    const { x0, x1, z0, z1, g, f, floors } = CF;
    const W = x1 - x0;
    const D = z1 - z0;
    const xc = (x0 + x1) / 2;
    const zc = (z0 + z1) / 2;
    const H = g + f * (floors - 1);
    const marble = tint(P.marble, 0.02);
    const glass = mix(P.glassDark, P.glass, 0.3);
    const frameD = 1.5; // depth of the front grid
    const gridW = W * 0.6;
    const gx0 = x0;
    const gx1 = x0 + gridW;

    // the plinth: a low marble platform the whole building stands on
    b.box(W + 0.6, 0.35, D + 1.8, tint(marble, -0.04), { at: [xc, 0, zc + 0.1] });
    // the body behind the grid
    b.box(W, H + 0.5, D - frameD, marble, { at: [xc, 0.35, zc - frameD / 2] });
    // right-hand part of the front: a solid wall flush with the grid face
    b.box(W - gridW, H + 0.5 - g, frameD, marble, { at: [(gx1 + x1) / 2, 0.35 + g, z1 - frameD / 2] });
    // the glazed wall set back behind the grid (upper floors) and the ground-floor glass doors
    b.box(gridW - 0.2, H - g, 0.1, glass, { at: [(gx0 + gx1) / 2, 0.35 + g, z1 - frameD - 0.02], mat: 'glass', jitter: false });
    b.box(W - 0.4, g - 0.5, 0.1, glass, { at: [xc, 0.35, z1 - 0.9], mat: 'glass', jitter: false });
    for (const x of spread(13, x0 + 0.3, x1 - 0.3)) b.box(0.1, g - 0.5, 0.14, P.steel, { at: [x, 0.35, z1 - 0.85], jitter: false });
    // the grid: columns and beams, marble-faced, standing proud of the glazing
    const cols = 4;
    for (const x of spread(cols, gx0 + 0.25, gx1 - 0.25)) b.box(0.5, H + 0.5 - g + 0.1, frameD, marble, { at: [x, 0.35 + g - 0.1, z1 - frameD / 2] });
    for (let i = 0; i < floors; i++) {
      const y = 0.35 + g + i * f - (i === 0 ? 0.6 : 0.35);
      b.box(gridW, i === 0 ? 0.6 : 0.4, frameD, marble, { at: [(gx0 + gx1) / 2, y, z1 - frameD / 2] });
    }
    b.box(gridW, 0.5, frameD, marble, { at: [(gx0 + gx1) / 2, 0.35 + H, z1 - frameD / 2] });
    // a slim beam across the top of the ground floor, carrying the solid wall over the doors
    b.box(W, 0.6, frameD, marble, { at: [xc, 0.35 + g - 0.6, z1 - frameD / 2] });
    // parapet rails in the loggias of the grid
    for (let i = 0; i < floors - 1; i++) b.box(gridW - 0.6, 0.08, 0.06, P.steel, { at: [(gx0 + gx1) / 2, 0.35 + g + i * f + 1.0, z1 - 0.3], jitter: false });

    // side to the street (+X): ribbon windows set in the marble, and a tall slot for the stair
    for (let i = 0; i < floors - 1; i++) {
      const y = 0.35 + g + i * f + 0.8;
      b.box(0.1, 1.7, D - 6, glass, { at: [x1 + 0.02, y, zc - 2.2], mat: 'glass', jitter: false });
    }
    b.box(0.1, g - 1.2, D - 6, glass, { at: [x1 + 0.02, 1.2, zc - 2.2], mat: 'glass', jitter: false });
    b.box(0.1, H - 1.6, 1.0, glass, { at: [x1 + 0.02, 1.2, z1 - 2.4], mat: 'glass', jitter: false });
    // side toward the old palace (-X) and the back: a regular grid of windows
    for (let i = 0; i < floors; i++) {
      const y = 0.35 + (i === 0 ? 1.0 : g + (i - 1) * f + 0.8);
      for (const z of spread(4, z0 + 1.8, z1 - frameD - 1.6)) b.box(0.1, 1.8, 1.8, glass, { at: [x0 - 0.02, y, z], mat: 'glass', jitter: false });
      for (const x of spread(5, x0 + 1.6, x1 - 1.6)) b.box(1.8, 1.8, 0.1, glass, { at: [x, y, z0 - 0.02], mat: 'glass', jitter: false });
    }
    // the flat roof: a parapet, and the glass-block lantern over the central hall
    b.box(W - 1.2, 0.1, D - frameD - 1.2, tint(P.concrete, 0.05), { at: [xc, 0.35 + H + 0.5, zc - frameD / 2], jitter: false });
    b.box(6, 0.5, 6, marble, { at: [xc - 0.5, 0.35 + H + 0.5, zc - 1] });
    b.box(5.4, 0.12, 5.4, 0xcfe3e6, { at: [xc - 0.5, 0.35 + H + 1.0, zc - 1], mat: 'glass', jitter: false });
    for (const t of spread(5, -2.2, 2.2)) {
      b.box(0.05, 0.03, 5.4, P.steel, { at: [xc - 0.5 + t, 0.35 + H + 1.12, zc - 1], jitter: false });
      b.box(5.4, 0.03, 0.05, P.steel, { at: [xc - 0.5, 0.35 + H + 1.12, zc - 1 + t], jitter: false });
    }

    // behind: the party's paved yard with a flagpole
    pave(b, 15, 13.5, 14, -14.5, mix(P.paving, P.travertine, 0.4));
    b.cyl(0.08, 12, P.steel, { at: [14, 0, -12], segs: 6 });
    b.box(1.8, 1.2, 0.04, P.black, { at: [14.95, 10.6, -12], jitter: false });

    palaceColliders(b, true);
    lordsColliders(b);
    b.collider(W, D - 0.9, { at: [xc, 0, zc - 0.45] });
    void MON;
    void MON_TOP;
  },
};
