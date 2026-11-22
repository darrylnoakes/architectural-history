import type { BuildingDef } from '@ah/kit';
import { concreteWorks } from './shared';

export const reusedWorks: BuildingDef = {
  id: 'reused-works',
  name: 'The works reused',
  style: 'Contemporary reuse',
  date: 'c. 2010',
  summary:
    'The textile industry of the north collapsed between the 1960s and the 1990s, and the riverside works stood empty. ' +
    'Instead of clearing it, the town bought it and turned it into a cultural centre, as Nantes did with the LU biscuit factory (the Lieu Unique, 2000) and Roubaix with La Condition Publique, its wool-conditioning house (2004). ' +
    'The concrete arches and rooflights of 1921 are kept and cleaned; a concert hall in a dark metal box rises through two bays, artists’ studios fill the others, a glass foyer and café open onto the old yard, and the quay becomes a riverside walk. ' +
    'The water tower, useless now, is kept as the landmark that tells people where the old works was, and given a glass lantern that lights up at night.',
  materials: ['reinforced concrete of 1921', 'glass', 'profiled metal cladding', 'larch decking'],
  modelledOn: 'The Lieu Unique, Nantes (the LU factory, reused by Patrick Bouchain, 2000), whose tower was kept as a landmark, and La Condition Publique, Roubaix (reused 2004). The building itself is this plot’s concrete workshop of 1921',
  lookFor: [
    { label: 'Concert hall box', note: 'A new hall in dark cladding is built inside the old shed and rises through its roof, plainly new against the old concrete.', at: [-12.5, 13.0, -3.2] },
    { label: 'Glass foyer and café', note: 'A light glass box on the old yard gives the building a public front, with tables outside.', at: [-1.0, 3.0, 6.6] },
    { label: 'Tower kept as a landmark', note: 'The water tower no longer serves the works but is kept, with a glass lantern on top, as the sign of the place.', at: [14.2, 24.5, 7.6] },
    { label: 'Concrete arches of 1921', note: 'The thin arches and rooflights of the Reconstruction are kept, cleaned and repaired.', at: [5.5, 9.6, -3.2] },
    { label: 'Riverside walk', note: 'Where barges were loaded, the quay is decked in larch and given benches and a railing as a public promenade.', at: [0, 1.1, -12.3] },
  ],
  influences: [],
  build(b) {
    concreteWorks(b, { reused: true });
  },
};
