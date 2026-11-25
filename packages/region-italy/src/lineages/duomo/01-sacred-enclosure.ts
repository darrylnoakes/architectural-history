import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { ALTAR_Z, oldAltar } from './shared';

const EARTH = mix(P.earth, P.grassDry, 0.35);
const TUFA = P.tufa;
const HOLM = tint(P.leafDark, -0.06);
/** The sanctuary sits towards the front of the plot, so that its altar is the one the temples later face. */
const OZ = ALTAR_Z - 1.2;

export const sacredEnclosure: BuildingDef = {
  id: 'sacred-enclosure',
  name: 'Open-air sanctuary',
  style: 'Early Iron Age (Latial and Villanovan)',
  date: 'c. 750 BC',
  summary:
    'Before there were temples, the gods of central Italy were worshipped in the open: in a grove, at a spring or on a hilltop marked off as sacred. ' +
    'Here a ring of boundary stones sets the place apart, a low altar of tufa blocks takes burnt offerings, and a pit beside it receives gifts for the gods below: small pots of food and drink, miniature vessels and bronze trinkets. ' +
    'The grove of holm oaks behind is itself holy (a lucus, the Romans would later say) and may not be cut. The site is chosen; little is built, but the spot will stay sacred for nearly three thousand years.',
  materials: ['tufa blocks', 'earth and turf', 'living trees'],
  lookFor: [
    { label: 'Altar', note: 'A low block of tufa where offerings were burnt; worship happened outside, around it.', at: [0, 1.3, OZ + 2.0] },
    { label: 'Votive pit', note: 'A pit for offerings to the gods of the earth. Archaeologists find such deposits full of miniature pots and figurines.', at: [4.6, 0.6, OZ + 4.4] },
    { label: 'Boundary stones', note: 'Upright stones (cippi) mark where the sacred ground begins; inside it, special rules applied.', at: [-9.0, 1.3, OZ + 13.0] },
    { label: 'Sacred grove', note: 'Holm oaks that were themselves holy; cutting them was forbidden or needed a sacrifice of atonement.', at: [-5.0, 7.0, OZ - 14.0] },
  ],
  influences: [],
  build(b) {
    b.noCollide();
    b.group({ at: [0, 0, OZ] }, () => {
      // beaten earth of the sacred ground
      b.box(19, 0.04, 28, EARTH, { at: [0, 0, 0], jitter: false });
      b.box(4, 0.05, 4.6, tint(EARTH, 0.06), { at: [0, 0, 16.3], jitter: false });

      // boundary stones round the rectangle
      const hw = 9.5;
      const hd = 14;
      const ring: [number, number][] = [];
      for (let i = 0; i <= 6; i++) ring.push([-hw + (2 * hw * i) / 6, hd], [-hw + (2 * hw * i) / 6, -hd]);
      for (let i = 1; i < 8; i++) ring.push([-hw, -hd + (2 * hd * i) / 8], [hw, -hd + (2 * hd * i) / 8]);
      for (const [x, z] of ring) {
        if (z > 0 && Math.abs(x) < 2) continue; // the way in
        const h = b.range(0.9, 1.4);
        b.box(b.range(0.4, 0.55), h, b.range(0.3, 0.4), tint(TUFA, b.range(-0.06, 0.04)), { at: [x, 0, z], rotY: b.range(-0.3, 0.3) });
      }
      // two taller stones at the entrance
      b.sym((s) => b.box(0.6, 1.8, 0.5, tint(TUFA, -0.03), { at: [s * 2.2, 0, hd] }));

      // the altar: stacked tufa blocks with ash and a fire on top
      b.group({ at: [0, 0, -OZ] }, () => oldAltar(b, TUFA));
      b.box(1.2, 0.08, 0.8, P.soil, { at: [0, 1.2, 1.2], jitter: false });
      for (let i = 0; i < 4; i++) b.log(0.06, 0.9, P.oakDark, { at: [b.range(-0.4, 0.4), 1.25, 1.2 + b.range(-0.2, 0.2)], rotY: b.range(0, 3) });
      b.cone(0.3, 0.6, 0xe0883a, { at: [0, 1.3, 1.2], segs: 5 });

      // the votive pit: a ring of stones round a dark hole, with offerings beside it
      b.cyl(1.0, 0.03, P.soil, { at: [4.6, 0.02, 4.0], segs: 8, jitter: false });
      b.cyl(0.75, 0.04, 0x2a2420, { at: [4.6, 0.04, 4.0], segs: 8, jitter: false });
      for (let i = 0; i < 9; i++) {
        const t = (i / 9) * Math.PI * 2;
        b.blob(0.22, tint(TUFA, -0.1), { at: [4.6 + Math.cos(t) * 1.05, 0.1, 4.0 + Math.sin(t) * 1.05], stretch: [1, 0.6, 1], detail: 0 });
      }
      for (const [x, z, r, h] of [[5.9, 5.2, 0.18, 0.35], [6.2, 4.7, 0.13, 0.25], [3.4, 5.5, 0.15, 0.3], [5.6, 2.8, 0.1, 0.2]] as const) {
        b.cyl(r, h, P.mud, { at: [x, 0, z], rTop: r * 0.7, segs: 6 });
      }

      // a wooden post for hanging gifts, and a cut-turf seat for the priest
      b.cyl(0.12, 2.4, P.oak, { at: [-3.2, 0, 2.4], segs: 5 });
      b.beam([-3.2, 2.1, 2.4], [-2.4, 2.3, 2.4], 0.08, 0.08, P.oak);
      b.box(1.6, 0.45, 0.8, P.turf, { at: [-4.6, 0, -1.5] });

      // the sacred grove of holm oaks behind, and a few outside the stones
      const grove: [number, number, number][] = [
        [-6, -6, 9], [-2.5, -9, 10], [2, -7, 8.5], [6, -10, 9.5], [-6.5, -12, 8], [0, -12.5, 10.5], [5, -4.5, 7.5],
        [-3, -3.5, 7], [-11.5, -20, 9], [-4, -20, 10], [3.5, -19, 9.5], [10, -18, 8.5], [-12, -8, 7], [12, -6, 7.5],
        [-8, -27, 9], [1.5, -29, 10], [9, -27, 8.5], [-13.5, -33, 8], [5, -36, 9],
      ];
      for (const [x, z, h] of grove) b.tree(h * b.range(0.9, 1.1), { at: [x, 0, z], kind: 'round', color: HOLM });
      b.tree(5, { at: [-11, 0, 9], kind: 'olive' });
      b.tree(4.5, { at: [11, 0, 14], kind: 'olive' });
      // a spring rising at the foot of the grove
      b.cyl(1.4, 0.03, P.water, { at: [-7.0, 0.02, -1.0], segs: 9, mat: 'glass', jitter: false });
    });
  },
};
