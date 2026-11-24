import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, NJ, WALL_COLOURS, road, ruts } from './shared';
import { GAULISH, curtain, gaulishStretch } from './curtain';

/*
 * The funnel entrance: the rampart's stone face turns inward either side of the road and runs back to
 * the gate, so that anyone coming at the gate is walled in on three sides. Each wing's face runs from
 * the mouth (±MOUTH, FACE) to the gate (±GATE_X, GATE_Z).
 */
const FACE = GAULISH.face;
const MOUTH = 9;
const GATE_X = 3.4;
const GATE_Z = -4.2;
const GATE_D = 2.8; // depth of the gate tower along the road
const WING_TOP = -0.9; // the wings are less deep than the curtain, to stay inside the plot
const WING_TOE = -3.8;

/** Plan geometry of the wing on side s. */
function wing(s: 1 | -1) {
  const dx = MOUTH - GATE_X;
  const dz = FACE - GATE_Z;
  const L = Math.hypot(dx, dz);
  const rotY = Math.atan2(-s * dz, dx);
  const n: [number, number] = [Math.sin(rotY), Math.cos(rotY)]; // outward, toward the road
  const mid: [number, number] = [(s * (MOUTH + GATE_X)) / 2, (FACE + GATE_Z) / 2];
  return { L, rotY, n, mid };
}

/** The timber grid inside the rampart, seen where the plot cuts it off (only when the model is opened up). */
function section(b: Builder, x: number): void {
  const c = WALL_COLOURS.gaulish;
  const { rows, h } = GAULISH;
  const back = GAULISH.top;
  b.group({ at: [x - 0.012, 0, 0], rotY: -Math.PI / 2 }, () => {
    // local +x is world +z here; local panels face world -x
    rows.forEach((y, i) => {
      // a cross-beam running back from the face into the core, cut along its length
      b.panel(FACE - back - 0.5, 0.24, c.beam, { at: [(FACE + back) / 2 - 0.15, y, 0], depth: 0.03 });
      // the long beams running along the wall, cut across: square ends, with the iron spike that pins each crossing
      for (const z of i % 2 ? [-0.35, -1.55] : [0.15, -0.95]) {
        b.panel(0.24, 0.24, tint(c.beam, 0.1), { at: [z, y + 0.24, 0], depth: 0.05 });
        b.panel(0.06, 0.06, P.iron, { at: [z, y + 0.33, 0], depth: 0.08 });
      }
    });
    // rubble and earth packed between the timbers, darker than the ramp
    b.panel(FACE - back - 0.68, h - 0.1, mix(c.earth, c.stone, 0.4), { at: [(FACE - 0.68 + back) / 2, 0.05, 0], depth: 0.01 });
  });
}

export const murusGallicus: BuildingDef = {
  id: 'murus-gallicus',
  name: 'Gaulish rampart and gate',
  style: 'Late Iron Age (La Tène)',
  date: 'c. 120 to 50 BC',
  summary:
    'In the last century before the Roman conquest the tribes of Gaul gathered in large fortified towns, the oppida, and walled them with a rampart Caesar described when he besieged Bourges in 52 BC: the murus gallicus, the Gaulish wall. ' +
    'Inside it is a grid of timbers laid in layers, the beams crossing at right angles and pinned with long iron spikes, filled with earth and rubble; the front is a face of dry stone in which the ends of the cross-beams show in rows. Caesar admired it: the stone protected the timber from fire, and the timber held the stones together against the battering ram. ' +
    'At the gate the rampart turns inward to make a long funnel, so that attackers are walled in on three sides before they reach the timber gate tower at its far end. ' +
    'Many oppida of the Belgic north made do with a huge bank of earth and a broad ditch instead; this town is imagined with the Gaulish wall of the centre and east, as at Bibracte.',
  materials: ['oak beams and iron spikes', 'dry-laid limestone', 'earth and rubble', 'wattle', 'shingles'],
  modelledOn:
    'The Porte du Rebout at Bibracte (Mont Beuvray, Burgundy), the main gate of the oppidum of the Aedui, with its inturned rampart and timber gate as excavated and reconstructed on the site; the rampart follows Caesar’s description (Gallic War VII.23). Proportions are compressed to fit the plot.',
  lookFor: [
    { label: 'Murus gallicus', note: 'A vertical face of dry stone with the ends of the timber beams showing in rows: Caesar found it not unsightly as well as strong.', at: [-11.5, 2.2, FACE + 0.3] },
    { label: 'Timber grid and iron spikes', note: 'Inside, layers of beams cross at right angles and are pinned with iron spikes 20 to 30 cm long, packed with earth and stone.', at: [-HALF - 0.2, 2.7, -0.6] },
    { label: 'Funnel entrance', note: 'The rampart turns inward along the road, so an enemy at the gate is under fire from both sides and from above.', at: [5.4, 3.0, -1.6] },
    { label: 'Gate tower', note: 'A timber tower over the passage, set back at the inner end of the funnel, with a fighting platform level with the rampart walk.', at: [0, 8.0, GATE_Z + 0.2] },
    { label: 'Ditch', note: 'Dug outside the rampart and kept clear, so attackers had to cross open ground under the wall.', at: [12.5, -GAULISH.depth + 0.5, 4.7] },
  ],
  build(b) {
    const c = WALL_COLOURS.gaulish;
    const timber = c.timber;

    // ---------------------------------------------------------------- the road, rutted earth
    road(b, 5.4, mix(P.earth, P.chalk, 0.25));
    ruts(b, 1.5, tint(P.mud, -0.04));

    // ---------------------------------------------------------------- the rampart, its wings and the ditch
    b.sym((s) => {
      curtain(b, 'gaulish', s > 0 ? MOUTH : -HALF, s > 0 ? HALF : -MOUTH);
      const w = wing(s);
      b.group({ at: [w.mid[0] - w.n[0] * FACE, 0, w.mid[1] - w.n[1] * FACE], rotY: w.rotY }, () => {
        gaulishStretch(b, -w.L / 2, w.L / 2, { ditch: false, top: WING_TOP, toe: WING_TOE });
      });
      // the end of the bank beside the gate, held back by a revetment of planks between posts
            b.box(0.16, GAULISH.h, 3.0, tint(timber, -0.05), { at: [s * (GATE_X + 0.08), 0, GATE_Z - 1.5], ...NJ });
      for (const z of [GATE_Z - 0.2, GATE_Z - 1.5, GATE_Z - 2.8]) b.box(0.26, GAULISH.h + 0.3, 0.26, timber, { at: [s * (GATE_X + 0.2), 0, z], ...NJ });
      // a slope of earth closing the bank behind the revetment
      b.group({ at: [s * GATE_X, 0, GATE_Z - 3.0] }, () => {
        b.extrude([[0, 0], [s * 4.6, 0], [0, GAULISH.h]], 3.0, c.earth, { at: [0, 0, 1.5], ...NJ });
      });
      // the ditch stops short of the road: its end slopes up beside the mouth of the funnel (the
      // edge toward the rampart's own ditch is open, so the two run together)
      const [d0, d1] = GAULISH.ditch;
      b.dig([[s * MOUTH, d0], [s * (MOUTH - 2.4), d0], [s * (MOUTH - 2.4), d1], [s * MOUTH, d1]], GAULISH.depth, { slope: GAULISH.slope, color: c.ditch, open: [3] });
    });

    // ---------------------------------------------------------------- the gate tower
    const zf = GATE_Z - 0.2;
    const zb = GATE_Z - GATE_D;
    const zc = (zf + zb) / 2;
    const deck = GAULISH.h + 0.2;
    // posts: the two outer rows against the revetments and a middle row splitting the way in two
    for (const x of [-GATE_X + 0.15, 0, GATE_X - 0.15]) {
      for (const z of [zf, zb]) b.box(x === 0 ? 0.36 : 0.42, GAULISH.h + 2.9, x === 0 ? 0.36 : 0.42, timber, { at: [x, 0, z] });
    }
    // the floor of the fighting platform, joists and planks, level with the walk on the rampart
    b.box(GATE_X * 2 + 1.4, 0.32, GATE_D + 0.6, tint(timber, -0.07), { at: [0, deck - 0.32, zc] });
    for (const x of [-2.2, -1.1, 1.1, 2.2]) b.box(0.24, 0.26, GATE_D + 0.8, timber, { at: [x, deck - 0.58, zc], ...NJ });
    // the tower room: plank walls with a band of openings for archers and slingers, all round
    const rw = GATE_X * 2 + 0.6;
    const rd = GATE_D + 0.4;
    const ry = deck;
    const rh = 2.7;
    b.box(rw, 1.2, rd, tint(c.wattle, -0.02), { at: [0, ry, zc] });
    for (const [x, z, w, d] of [[0, zc + rd / 2 - 0.06, rw, 0.12], [0, zc - rd / 2 + 0.06, rw, 0.12], [rw / 2 - 0.06, zc, 0.12, rd], [-rw / 2 + 0.06, zc, 0.12, rd]] as const) {
      b.box(w, 0.6, d, tint(timber, 0.04), { at: [x, ry + rh - 0.6, z] });
    }
    for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) for (const z of [zc + rd / 2, zc - rd / 2]) b.box(0.22, rh - 1.2, 0.22, timber, { at: [x, ry + 1.2, z], ...NJ });
    for (const z of [zc - 0.8, zc + 0.8]) for (const s of [1, -1]) b.box(0.22, rh - 1.2, 0.22, timber, { at: [s * (rw / 2), ry + 1.2, z], ...NJ });
    // a hipped roof of oak shingles
    b.hip(rw + 0.2, rd + 0.2, 2.4, P.shingle, { at: [0, ry + rh, zc], overhang: 0.5 });
    // a breastwork across the front of the deck where it meets the wings
    b.sym((s) => b.box(1.2, 1.1, 0.12, c.wattle, { at: [s * (GATE_X + 0.4), deck, zf + 0.3] }));
    // the gates: two pairs of plank leaves, swung back
    b.sym((s) => {
      b.group({ at: [s * 1.7, 0, 0] }, () => {
        for (const side of [1, -1] as const) {
          b.group({ at: [side * 1.5, 0, zf - 0.3], rotY: side * 1.4 }, () => {
            b.box(1.45, 3.4, 0.12, tint(timber, 0.04), { at: [-side * 0.73, 0, 0] });
            for (const y of [0.4, 1.7, 3.0]) b.box(1.35, 0.14, 0.05, tint(timber, -0.12), { at: [-side * 0.73, y, -0.08], ...NJ });
          });
        }
      });
    });
    b.box(GATE_X * 2, 0.05, 0.3, timber, { at: [0, 0, zf - 0.3] }); // sill beam, laid flush with the road

    // ---------------------------------------------------------------- the inside of the rampart, where the plot cuts it
    if (b.cutaway) section(b, -HALF);

    // ---------------------------------------------------------------- around it
    b.tree(1.3, { kind: 'bush', at: [-12.6, 0, 7.5] });
    b.tree(1.0, { kind: 'bush', at: [13.4, 0, 7.6] });

    // ---------------------------------------------------------------- walking: either side of the road, none across it
    b.sym((s) => {
      b.collider(HALF - MOUTH, 8.6, { at: [s * (HALF + MOUTH) / 2, 0, GAULISH.toe + 4.3] });
      const w = wing(s);
      b.collider(w.L, 3.4, { at: [w.mid[0] - w.n[0] * 1.6, 0, w.mid[1] - w.n[1] * 1.6], rotY: w.rotY });
      b.collider(3.2, 3.4, { at: [s * (GATE_X + 1.7), 0, GATE_Z - 2.6] });
    });
  },
};
