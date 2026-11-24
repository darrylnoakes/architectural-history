import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { END, FOOT, hump, band, side, bodyOutline, voussoirs, layout, cutwater, roundHood, balustrade, type Opening } from './shared';

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
    const crown = 0.8;
    const f = hump(crown);
    const W = 9.0;
    b.deck(W - 1.2, 34, crown, { yEnds: 0 });
    const stone = mix(P.pierreBlonde, P.craie, 0.35);
    const dress = tint(stone, 0.05);
    const deep = tint(stone, -0.09);
    const pierT = 1.0;
    const spring = -1.05;
    const { ops, piers } = layout([7.0, 7.4, 7.0], pierT, spring, (_s, i) => (i === 1 ? 1.25 : 1.05), 'ellipse');
    const top = (z: number) => f(z) - 0.3;
    // the head arches on the faces: flat segments springing higher and wider than the vault behind
    const yS = -0.55;
    const e = 0.3;
    const head = (op: Opening, t: number): Opening => ({
      z0: op.z0 - e * t,
      z1: op.z1 + e * t,
      spring: op.spring + (yS - op.spring) * t,
      rise: op.spring + op.rise - (op.spring + (yS - op.spring) * t),
      kind: t > 0.99 ? 'segmental' : 'ellipse',
    });
    const face = 0.35;
    const mid = 0.35;
    const core = W - 2 * (face + mid);
    side(b, bodyOutline({ za: -END, zb: END, top, openings: ops, n: 18 }), core, deep);
    b.sym((k) => {
      side(b, bodyOutline({ za: -END, zb: END, top, openings: ops.map((op) => head(op, 0.5)), n: 18 }), mid, tint(stone, -0.04), k * (core / 2 + mid / 2));
      side(b, bodyOutline({ za: -END, zb: END, top, openings: ops.map((op) => head(op, 1)), n: 18 }), face, stone, k * (W / 2 - face / 2));
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
