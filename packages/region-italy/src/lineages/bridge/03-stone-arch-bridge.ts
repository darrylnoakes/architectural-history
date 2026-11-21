import { type BuildingDef } from '@ah/kit';
import { romanBridge } from './shared';

export const stoneArchBridge: BuildingDef = {
  id: 'stone-arch-bridge',
  name: 'Roman stone arch bridge',
  style: 'Roman Republican',
  date: 'c. 140 BC',
  summary:
    'The town replaces its timber bridge with one of stone, as Rome did with the Pons Aemilius in the 2nd century BC and the Pons Fabricius in 62 BC. ' +
    'Each arch is a true semicircle of wedge-shaped stones, which turns the weight of the road into a push along the curve and down into the piers; the core is soft, light tufa and the faces are hard travertine. ' +
    'The piers are thick, about a third of the span, with pointed cutwaters, and each has a small arch through it above the water so that floods can pass instead of pushing the bridge over. ' +
    'It was built to last for ever, and in Rome the Pons Fabricius still carries people across the Tiber.',
  materials: ['travertine facing', 'tufa core', 'peperino paving'],
  modelledOn: 'The Pons Fabricius, Rome (62 BC); the Ponte di Tiberio, Rimini (AD 14 to 21)',
  lookFor: [
    { label: 'Round arch', note: 'Every arch is a full half-circle, the shape Roman builders used for bridges, aqueducts and gates.', at: [3.1, 0.2, 0] },
    { label: 'Voussoirs', note: 'The wedge-shaped stones of the arch ring; they lock together and push outward and down, so no mortar is needed to hold them.', at: [3.3, 0.55, -1.1] },
    { label: 'Flood opening', note: 'A small arch through the pier lets flood water through high up, easing the pressure on the bridge; the Pons Fabricius has one in its central pier.', at: [3.3, 0.1, 2.65] },
    { label: 'Cutwater', note: 'The pointed end of each pier splits the current and stops debris piling up against the masonry.', at: [-4.6, -0.6, -2.65] },
    { label: 'Travertine facing', note: 'Hard, pale travertine on the faces protects a core of soft tufa, a volcanic stone that is easy to cut but weathers badly.', at: [3.2, -0.3, 8.0] },
  ],
  influences: ['etruscan-legacy', 'roman-concrete'],
  build(b) {
    b.noCollide();
    const L = romanBridge(b);
    b.deck(L.W - 0.9, 34, 1.15, { yEnds: 0 });
  },
};
