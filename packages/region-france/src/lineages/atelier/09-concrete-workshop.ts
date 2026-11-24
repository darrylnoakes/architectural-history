import type { BuildingDef } from '@ah/kit';
import { concreteWorks } from './shared';

export const concreteWorkshop: BuildingDef = {
  id: 'concrete-workshop',
  name: 'Reinforced-concrete workshop',
  style: 'Reconstruction: early concrete',
  date: 'c. 1921',
  summary:
    'The war left the mills of the north burnt out or stripped of their machines, and the Reconstruction paid for new works in the new material, reinforced concrete, which used far less steel than a steel frame, could be poured by unskilled hands and would not burn. ' +
    'In Paris Auguste Perret had just shown what it could do in the clothing workshop he built for Esders in 1919: a single great hall spanned by thin concrete arches, flooded with light from glazed roofs between them, its structure left bare as the whole of its architecture. ' +
    'This works follows that lead: a row of slender segmental arches springing from concrete posts, rooflights along the crown of every bay, walls that are only brick at the bottom and steel windows above, and a water tower at the corner. ' +
    'There is no chimney: power now comes by cable, to electric motors that drive the machines in groups or, more and more, one by one.',
  materials: ['reinforced concrete', 'glass', 'steel windows', 'brick'],
  modelledOn: 'The Esders clothing workshop, Paris (Auguste Perret, 1919, demolished), and the concrete arched sheds of Eugène Freyssinet; the water tower and layout are generic',
  lookFor: [
    { label: 'Thin concrete arches', note: 'Each arch is a slender rib of concrete reinforced with steel rods, spanning the whole hall with no column in the way.', at: [-9.0, 9.6, -3.2] },
    { label: 'Glazed rooflights', note: 'Glass along the crown of every bay lights the workshop floor evenly from above.', at: [5.5, 9.4, -3.2] },
    { label: 'Bare concrete frame', note: 'Posts and beams are left as they came from the formwork, with no stone dressing: the structure is the architecture.', at: [-6.0, 3.0, 4.6] },
    { label: 'Water tower', note: 'A concrete tank on a tower kept water under pressure for the works and for fighting fire.', at: [14.2, 21.0, 8.5] },
    { label: 'Concrete quay and crane', note: 'Barges were loaded at a concrete quay by a steel derrick crane.', at: [-12.0, 5.0, -14.0] },
  ],
  influences: ['reinforced-concrete'],
  build(b) {
    concreteWorks(b);
  },
};
