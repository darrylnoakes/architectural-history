import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { sheep } from './shared';

export const roundBarrow: BuildingDef = {
  id: 'round-barrow',
  name: 'Round barrow',
  style: 'Bronze Age funerary monument',
  date: 'c. 2000 BC',
  summary:
    'A bowl barrow: an earth mound heaped over a burial or cremation, with the ditch round its foot dug to supply the soil. ' +
    'It was raised around 2000 BC, so to the Iron Age farmers who grazed sheep on this common it was already some fifteen centuries old, ' +
    'a monument of the ancestors that nobody living had built. The standing stone near it is older still, or about as old. ' +
    'Nothing here is a building in the later sense, but it is the first deliberate, lasting mark on the plot.',
  materials: ['earth and turf', 'chalk rubble', 'sarsen stone'],
  lookFor: [
    { label: 'Bowl barrow', note: 'The commonest kind of round barrow: a smooth, upturned-bowl mound, here about 20 m across.', at: [0, 2.9, 0] },
    { label: 'Ring ditch', note: 'The quarry ditch round the mound. Long after a barrow is ploughed flat, the silted ditch still shows as a ring in crops seen from the air.', at: [0, 0.4, 11.2] },
    { label: 'Standing stone', note: 'A single upright stone, or menhir, set up as a marker. Its exact purpose is unknown.', at: [11.8, 3.2, 8.6] },
    { label: 'Common grazing', note: 'Barrows survived where land was grazed rather than ploughed, which is why so many stand on downs and commons.', at: [-12.5, 1.2, -6] },
  ],
  build(b) {
    b.noCollide();
    const grass = tint(P.grass, b.range(-0.02, 0.02));
    // low swelling of the common the barrow sits on, with the ring ditch cut into it
    b.lathe([[12.4, 0.48], [13.2, 0.38], [14.4, 0.12], [14.8, 0]], tint(grass, -0.02), { segs: 28 });
    b.lathe([[10.1, 0.5], [10.5, 0.18], [11.6, 0.1], [12.4, 0.48]], mix(P.hedge, P.soil, 0.35), { segs: 28 });
    // the mound itself
    b.lathe(
      [[0, 2.85], [2.5, 2.78], [4.6, 2.5], [6.4, 2.0], [7.9, 1.4], [9.2, 0.85], [10.1, 0.52], [10.2, 0.4]],
      grass,
      { segs: 24 },
    );

    // the standing stone, leaning a little
    b.extrude(
      [[-0.55, 0], [0.5, 0], [0.42, 1.6], [0.3, 2.7], [0.05, 3.15], [-0.35, 2.9], [-0.5, 1.8]],
      0.55,
      P.granite,
      { at: [11.8, 0, 8.6], rotY: 0.6, rot: [0, 0, -0.07] },
    );
    b.blob(0.35, tint(P.granite, -0.06), { at: [12.6, 0.1, 9.4], stretch: [1.2, 0.5, 0.9], detail: 0 });

    // hawthorn and gorse on the common
    b.tree(4.2, { at: [-13.5, 0, 9.5], color: P.leafDark });
    for (const [x, z] of [[13.5, -9], [-14.5, -11], [9, -12.5], [-6, 13]]) {
      b.tree(b.range(1.0, 1.5), { at: [x, 0, z], kind: 'bush', color: P.hedge });
    }
    // sheep
    const flock: [number, number, number][] = [[-12.5, -6, 0.6], [-10.6, -8.8, 2.4], [13, 1.5, -1.2], [5, 13.4, 1.9], [-3, -13.2, -2.7]];
    const groundY = (r: number) => (r < 12.4 ? 0.45 : r > 14.8 ? 0 : Math.max(0, 0.45 - ((r - 12.4) / 2.4) * 0.45));
    for (const [x, z, r] of flock) sheep(b, [x, groundY(Math.hypot(x, z)) - 0.03, z], r);
  },
};
