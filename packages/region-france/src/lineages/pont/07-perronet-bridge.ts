import { P, tint, mix, type Builder, type BuildingDef } from '@ah/kit';
import { END, FOOT, hump, band, side, bodyOutline, voussoirs, layout, cutwater, roundHood, balustrade, type Opening } from './shared';

const W = 9.0;
const f = hump(0.8);
const pierT = 1.0;
const yS = -0.55; // where the head arches spring on the faces
const stoneOf = () => mix(P.pierreBlonde, P.craie, 0.35);
const { ops, piers } = layout([7.0, 7.4, 7.0], pierT, -1.05, (_s, i) => (i === 1 ? 1.25 : 1.05), 'ellipse');
/** The head arches on the faces: flat segments springing higher and wider than the vault behind. */
function head(op: Opening, t: number): Opening {
  const e = 0.3;
  return {
    z0: op.z0 - e * t,
    z1: op.z1 + e * t,
    spring: op.spring + (yS - op.spring) * t,
    rise: op.spring + op.rise - (op.spring + (yS - op.spring) * t),
    kind: t > 0.99 ? 'segmental' : 'ellipse',
  };
}
const face = 0.35;
const mid = 0.35;
const core = W - 2 * (face + mid);
/** Where the masonry over the river ends and the abutments on the banks begin. */
const AB = 12.0;

/**
 * The masonry body in three layers (the core, and the splayed and face rings each side), in three
 * lengths: the abutments on the banks beyond ±AB, and the arches between. The bridge of 1947 kept
 * the abutments. No random numbers are drawn here.
 */
function masonry(b: Builder, which: 'abutments' | 'river'): void {
  const stone = stoneOf();
  const deep = tint(stone, -0.09);
  const top = (z: number) => f(z) - 0.3;
  const runs: [number, number, number][] = which === 'abutments' ? [[-END, -AB, 3], [AB, END, 3]] : [[-AB, AB, 12]];
  for (const [za, zb, n] of runs) {
    side(b, bodyOutline({ za, zb, top, openings: ops, n }), core, deep);
    b.sym((k) => {
      side(b, bodyOutline({ za, zb, top, openings: ops.map((op) => head(op, 0.5)), n }), mid, tint(stone, -0.04), k * (core / 2 + mid / 2));
      side(b, bodyOutline({ za, zb, top, openings: ops.map((op) => head(op, 1)), n }), face, stone, k * (W / 2 - face / 2));
    });
  }
}

/** The abutments of Perronet's bridge, as the bridge of 1947 kept them. */
export function perronetAbutments(b: Builder): void {
  masonry(b, 'abutments');
}

export const perronetBridge: BuildingDef = {
  id: 'perronet-bridge',
  name: 'Flat-arched bridge of the Ponts et Chaussées',
  style: 'Louis XV and Louis XVI',
  date: 'c. 1775',
  summary:
    'The royal road is rebuilt by the engineers of the Ponts et Chaussées, trained at the school in Paris that Jean-Rodolphe Perronet ran from 1747, often called the first school of civil engineering anywhere. ' +
    'Perronet saw that the arches of a bridge lean on one another: if they are all built together and their timber centring struck at the same time, each pier only has to carry weight, not resist a thrust, and can be made as thin as a ninth or a tenth of the span. ' +
    'Thin piers block less of the river, so floods rise less, and very flat arches carry a level road. At the faces the arch edges are cut back in a curved bevel, the corne de vache, which makes the arches look flatter still and lets flood water in more easily. ' +
    'Perronet’s own bridges included Neuilly on the Seine (1768 to 1774), Sainte-Maxence on the Oise (1774 to 1786) and the Pont de la Concorde in Paris (1787 to 1791).',
  materials: ['dressed limestone', 'stone setts', 'stone balustrade'],
  modelledOn: 'Perronet’s bridges at Neuilly (1768 to 1774) and the Concorde, Paris (1787 to 1791): the cornes de vache from Neuilly, the balustrade from the Concorde; spans and number of arches generic',
  lookFor: [
    { label: 'Flat arch', note: 'A shallow curve that rises only a small part of its span, as on Perronet’s bridges at Pont-Sainte-Maxence and the Concorde, so the road can run level.', at: [4.6, 0.0, 0] },
    { label: 'Thin pier', note: 'About a ninth of the span: the arches each side push against each other, so the pier only has to carry their weight.', at: [4.6, -0.9, 4.2] },
    { label: 'Corne de vache', note: 'The edge of the arch is bevelled back at each face, a curved splay shaped like a cow’s horn, so the arch looks flatter and floods enter it more easily.', at: [4.5, -0.4, -3.4] },
    { label: 'Balustrade', note: 'Turned stone balusters between pedestals: the vocabulary of classical architecture on an engineer’s bridge.', at: [4.3, 1.4, -8.0] },
    { label: 'Level road', note: 'No hump any more: carriages and heavy wagons cross on the level, with a raised pavement either side.', at: [0, 0.75, 12.0] },
  ],
  influences: ['neoclassicism'],
  build(b) {
    b.noCollide();
    b.deck(W - 1.2, 34, 0.8, { yEnds: 0 });
    const stone = stoneOf();
    const dress = tint(stone, 0.05);
    masonry(b, 'abutments');
    masonry(b, 'river');
    b.sym((k) => {
      // the pier faces below the head springing, full width
      for (const z of piers) b.box(face + mid, yS - FOOT, pierT, stone, { at: [k * (W / 2 - (face + mid) / 2), FOOT, z] });
      for (const op of ops) voussoirs(b, head(op, 1), { d: 0.28, width: 0.06, x: k * (W / 2 + 0.01), color: dress, blocks: 9 });
    });
    // rounded cutwaters both ways, capped at the head springing
    for (const z of piers) {
      b.sym((k) => {
        cutwater(b, { x: k * (W / 2), z, thick: pierT, len: pierT / 2, y0: FOOT, h: yS - FOOT, color: stone, kind: 'round' });
        roundHood(b, { x: k * (W / 2), z, r: pierT / 2 + 0.02, y: yS, h: 0.35, color: dress });
      });
    }

    // a bold cornice, the carriageway, raised pavements, and the balustrade
    const roadW = 5.6;
    b.sym((k) => band(b, k * (W / 2 + 0.1), 0.25, -END + 0.2, END - 0.2, (z) => f(z) - 0.3, (z) => f(z) - 0.08, dress, 12));
    band(b, 0, roadW, -END, END, (z) => f(z) - 0.12, (z) => f(z) + 0.0, mix(P.cobble, P.gravel, 0.15), 12);
    b.sym((k) => {
      const pw = (W - roadW) / 2 - 0.25;
      band(b, k * (roadW / 2 + pw / 2), pw, -END + 0.3, END - 0.3, (z) => f(z) - 0.12, (z) => f(z) + 0.15, P.paving, 12);
      band(b, k * (roadW / 2 + 0.07), 0.14, -END + 0.3, END - 0.3, (z) => f(z) - 0.12, (z) => f(z) + 0.16, dress, 12);
      balustrade(b, { x: k * (W / 2 - 0.2), za: -END + 0.4, zb: END - 0.4, f: (z) => f(z) + 0.1, color: dress, pitch: 0.62, every: 9, h: 1.0 });
    });
  },
};
