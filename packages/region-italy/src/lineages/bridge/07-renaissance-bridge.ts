import { type BuildingDef } from '@ah/kit';
import { trinitaBridge } from './shared';

export const renaissanceBridge: BuildingDef = {
  id: 'renaissance-bridge',
  name: 'Renaissance bridge of three flattened arches',
  style: 'Renaissance (Mannerist)',
  date: '1569, statues 1608',
  summary:
    'When a flood wrecks one of the town’s bridges the duke has it rebuilt as a work of art. At Florence, after the flood of 1557, Cosimo I de’ Medici had Bartolomeo Ammannati build the Ponte Santa Trinita (1567 to 1569), and this bridge follows it. ' +
    'Its three arches are startlingly flat: each rises almost vertically from the pier, then sweeps out nearly level, and the two halves meet at a faint point hidden behind a carved cartouche. Nobody is sure how Ammannati drew the curve, and some have suggested advice from Michelangelo. ' +
    'Slim piers with long pointed cutwaters, a plain cornice and a level parapet make it look weightless. The statues of the Four Seasons on the corners were added in 1608 for a Medici wedding.',
  materials: ['pietra forte', 'marble statues'],
  modelledOn: 'The Ponte Santa Trinita, Florence (Bartolomeo Ammannati, 1567 to 1569)',
  lookFor: [
    { label: 'Flattened arch', note: 'The arch starts almost upright at the pier and then runs very flat: far wider and lower than a Roman half-circle.', at: [3.9, -0.4, 0] },
    { label: 'Cartouche', note: 'A carved shield on the keystone hides the point where the two halves of the curve meet.', at: [3.9, 0.3, 0] },
    { label: 'Pointed cutwater', note: 'Long, sharp cutwaters capped with sloping stone throw the current aside; the piers are slimmer than Roman ones.', at: [-5.2, -0.6, -4.3] },
    { label: 'Statues of the Seasons', note: 'Four marble figures, one on each corner of the parapets, added in 1608: Spring, Summer, Autumn and Winter.', at: [2.8, 3.2, 16.3] },
    { label: 'Cornice', note: 'A single moulded band runs the length of the bridge, drawing one clean, almost level line over the river.', at: [3.9, 0.9, -8.0] },
  ],
  influences: ['renaissance-birth'],
  build(b) {
    b.noCollide();
    const L = trinitaBridge(b);
    b.deck(L.W - 1.0, 34, 1.15, { yEnds: 0 });
  },
};
