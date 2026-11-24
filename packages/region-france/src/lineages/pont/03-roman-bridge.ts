import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { END, FOOT, hump, band, side, bodyOutline, voussoirs, layout, cutwater, cutwaterHood, roundHood, parapet, type ZY, type Opening } from './shared';

export const romanBridge: BuildingDef = {
  id: 'roman-bridge',
  name: 'Roman stone arch bridge',
  style: 'Gallo-Roman',
  date: 'c. AD 120',
  summary:
    'The road that the Romans laid across Gaul, straight and gravelled, now crosses the river on stone. Five round arches of large blocks laid without mortar spring from piers about half as thick as the arches are wide, so the roadway rises only a little over the river. ' +
    'Each pier has a pointed cutwater upstream to split the current and a small arch through it above the water so that floods can pass instead of pushing the bridge over, as on the Pont Julien in Provence. ' +
    'Stone arches on this scale were costly, and in the north many Roman bridges kept a timber road on stone piers, as at Trier (about 150); only a rich tribal capital could afford arches throughout, and few are known so far north. ' +
    'Built of good stone on sound piers, a bridge like this could outlast the Empire by a thousand years.',
  materials: ['limestone in large blocks', 'rubble and mortar core', 'gravel road'],
  modelledOn: 'The Pont Julien, Bonnieux (about 3 BC): its flood openings through the piers and pointed cutwaters; the round arches and level road are generic',
  lookFor: [
    { label: 'Round arch', note: 'Every arch is a full half-circle, the shape Roman engineers used for bridges, aqueducts and gates.', at: [3.5, -0.3, 0] },
    { label: 'Voussoirs', note: 'The wedge-shaped blocks of the arch ring press against each other, turning the weight of the road into a thrust along the curve and down into the piers.', at: [3.55, 0.55, -1.2] },
    { label: 'Flood opening', note: 'A small arch through the top of each pier lets a flood through when the main arches are full.', at: [3.55, -0.1, 2.55] },
    { label: 'Cutwater', note: 'The pointed upstream end of each pier splits the current and stops branches and ice piling up against the masonry.', at: [-4.2, -0.9, -2.55] },
    { label: 'Milestone', note: 'A stone column at the bridgehead gives the distance along the road and the name of the emperor who repaired it.', at: [4.6, 1.2, 15.4] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    b.noCollide();
    const crown = 1.15;
    const f = hump(crown);
    const W = 6.0;
    b.deck(W - 0.9, 34, crown, { yEnds: 0 });
    const stone = mix(P.pierreBlonde, P.limestone, 0.4);
    const ring = tint(stone, 0.07);
    const core = tint(stone, -0.05);
    const pierT = 1.5;
    const { ops, piers } = layout([3.2, 3.4, 3.6, 3.4, 3.2], pierT, -1.2, (s) => s / 2, 'round');
    const top = (z: number) => f(z) - 0.16;

    // flood openings through the pier spandrels
    const flood = (z: number): ZY[] => {
      const w = 0.66;
      const y0 = -0.55;
      const hs = 0.45;
      const pts: ZY[] = [[z - w / 2, y0], [z + w / 2, y0]];
      for (let i = 0; i <= 8; i++) {
        const t = (Math.PI * i) / 8;
        pts.push([z + (w / 2) * Math.cos(t), y0 + hs + (w / 2) * Math.sin(t)]);
      }
      return pts;
    };
    const pts = bodyOutline({ za: -END, zb: END, top, openings: ops });
    side(b, pts, W, core, 0, piers.map(flood));

    // voussoir rings on both faces, and rings round the flood openings
    b.sym((k) => {
      const x = k * (W / 2 + 0.02);
      for (const op of ops) {
        const d = Math.min(0.42, top((op.z0 + op.z1) / 2) - 0.2 - (op.spring + op.rise));
        voussoirs(b, op, { d, width: 0.08, x, color: ring, blocks: 9 });
      }
      for (const z of piers) {
        const fo: Opening = { z0: z - 0.33, z1: z + 0.33, spring: -0.1, rise: 0.33, kind: 'round' };
        voussoirs(b, fo, { d: 0.18, width: 0.07, x, color: ring, blocks: 5 });
      }
    });

    // cutwaters: pointed upstream (-X), rounded downstream, capped just above flood level
    const capY = -0.85;
    for (const z of piers) {
      cutwater(b, { x: -W / 2, z, thick: pierT, len: 1.2, y0: FOOT, h: capY - FOOT, color: stone, kind: 'point' });
      cutwaterHood(b, { x: -W / 2, z, thick: pierT, nose: 1.2, y: capY, h: 0.7, color: ring });
      cutwater(b, { x: W / 2, z, thick: pierT, len: pierT / 2, y0: FOOT, h: capY - FOOT, color: stone, kind: 'round' });
      roundHood(b, { x: W / 2, z, r: pierT / 2, y: capY, h: 0.45, color: ring });
    }

    // cornice, gravel road, low parapets with a rounded coping
    const road = mix(P.gravel, P.chalk, 0.2);
    band(b, 0, W - 0.9, -END, END, (z) => f(z) - 0.17, (z) => f(z) + 0.01, road, 18);
    b.sym((k) => {
      band(b, k * (W / 2 + 0.04), 0.12, -END + 0.3, END - 0.3, (z) => f(z) - 0.36, (z) => f(z) - 0.18, ring, 18);
      parapet(b, { x: k * (W / 2 - 0.22), za: -END + 0.4, zb: END - 0.4, f, lo: -0.17, h: 0.8, t: 0.44, color: stone, cap: ring, n: 18 });
    });

    // a milestone at the north bridgehead
    b.group({ at: [4.6, 0, 15.4] }, () => {
      b.box(0.8, 0.3, 0.8, ring);
      b.cyl(0.3, 1.7, stone, { at: [0, 0.3, 0], segs: 10 });
      b.panel(0.4, 0.6, tint(stone, -0.12), { at: [-0.29, 1.05, 0], facing: '-x', depth: 0.02 });
    });
    b.tree(6.5, { kind: 'poplar', at: [-5.4, 0, -16.0] });
    b.tree(5.5, { kind: 'round', at: [5.8, 0, -16.6] });
  },
};
