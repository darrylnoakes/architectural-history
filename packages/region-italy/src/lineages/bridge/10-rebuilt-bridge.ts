import { P, type BuildingDef } from '@ah/kit';
import { SPRING_HEAD, trinitaBridge } from './shared';

export const rebuiltBridge: BuildingDef = {
  id: 'rebuilt-bridge',
  name: 'The bridge rebuilt as it was',
  style: 'Reconstruction',
  date: '1958',
  summary:
    'After the war the town chooses to rebuild its Renaissance bridge “com’era, dov’era”, as it was and where it was, rather than put up a modern one. ' +
    'At Florence the Ponte Santa Trinita was rebuilt from 1955 to 1958 under the architect Riccardo Gizdulich and the engineer Emilio Brizzi: stones were dredged from the Arno and put back, new pietra forte was cut from the old quarry in the Boboli Gardens, and the curves were worked out again from old photographs and surveys. ' +
    'The statues were fished out of the river too, all but the head of Spring, which turned up only in 1961. ' +
    'The bridge looks almost exactly as before; only the asphalt, the pavements and the lamps give away the date.',
  materials: ['pietra forte, old and new', 'marble statues', 'asphalt'],
  modelledOn: 'The Ponte Santa Trinita, Florence, as rebuilt 1955 to 1958',
  revisions: [{ year: SPRING_HEAD, note: 'The missing head of Spring was found in the river in 1961 and put back on the statue.' }],
  lookFor: [
    { label: 'Recovered stones', note: 'Weathered blocks dredged from the river sit among the new ones, a shade darker.', at: [3.9, 0.0, -10.4] },
    { label: 'Flattened arch', note: 'Ammannati’s curve, recovered from photographs and measurements, recut stone by stone.', at: [3.9, -0.4, 0] },
    { label: 'Statue of Spring', note: 'The statues were recovered from the river and set back on their pedestals; Spring’s head was found only in 1961.', at: [3.55, 3.0, 16.3] },
    { label: 'Modern roadway', note: 'Asphalt, kerbed pavements and electric lamps: the only signs that this is a post-war bridge.', at: [0, 1.4, 4.0] },
  ],
  build(b) {
    b.noCollide();
    const L = trinitaBridge(b, { rebuilt: true });
    const { f, W } = L;
    b.deck(W - 1.0, 34, 1.15, { yEnds: 0 });
    // simple electric lamps on the parapets
    b.sym((k) => {
      for (const z of [-8.5, 0, 8.5]) {
        const x = k * (W / 2 - 0.25);
        b.cyl(0.06, 3.0, P.castIron, { at: [x, f(z) + 1.04, z], segs: 6 });
        b.beam([x, f(z) + 3.9, z], [x - k * 0.6, f(z) + 3.95, z], 0.06, 0.06, P.castIron);
        b.sphere(0.2, P.cream, { at: [x - k * 0.62, f(z) + 3.8, z], segs: 7 });
      }
    });
  },
};
