import type { BuildingDef } from '@ah/kit';
import { cathedral, RESTORED, FZ, CZ, RIDGE, BEL0, AW } from './shared';

export const restoredCathedral: BuildingDef = {
  id: 'restored-cathedral',
  name: 'Restored cathedral',
  style: 'Gothic Revival restoration',
  date: 'c. 1850 to 1870',
  summary:
    'Victor Hugo’s novel Notre-Dame de Paris (1831) made the Middle Ages fashionable, and the new Commission of Historic Monuments (1837) set architects to repair the great churches. The most famous, Eugène Viollet-le-Duc, held that to restore a building was to bring it to a completeness that may never have existed. ' +
    'The houses against the walls were cleared away to show the building alone on its square. The kings and the portal statues were carved anew, damaged stone was cut out and replaced, and a new spire of oak and lead rose over the crossing, taller than the old, with copper apostles stepping down the roofs (as at Notre-Dame de Paris, 1859 to 1860). ' +
    'Some additions were pure invention: the chimeras, half-animal figures leaning over the gallery between the towers, had no medieval models in that form. ' +
    'Survives: the medieval building entire, but much of what the visitor sees, especially the sculpture, is now nineteenth-century work.',
  materials: ['limestone, much of it new', 'lead on an oak spire', 'copper statues', 'stained glass'],
  lookFor: [
    { label: 'New crossing spire', note: 'A design of the restorers, not a copy of the lost one: taller, richer, with two stages of openings under the needle.', at: [0, RIDGE + 7.0, CZ + 2.0] },
    { label: 'Apostles on the roofs', note: 'Twelve copper figures, three on each arm of the roof, gazing out from the foot of the spire.', at: [0, RIDGE + 1.0, CZ + 3.8] },
    { label: 'Chimeras', note: 'Monsters perched on the gallery and tower parapets: an invention of the restorers that became a symbol of the Gothic.', at: [1.9, BEL0 + 5.8, FZ + 0.1] },
    { label: 'Recut kings', note: 'New kings in fresh white stone fill the gallery, carved from drawings and from surviving fragments.', at: [-2.3, 16.6, FZ + 1.0] },
    { label: 'Cleared north side', note: 'The houses that leaned against the nave are gone, leaving the chapels and buttresses free.', at: [-(AW + 2.6), 4.0, 6.0] },
  ],
  modelledOn:
    'Lassus and Viollet-le-Duc at Notre-Dame de Paris (from 1844): the spire of 1859 with the apostles of Geoffroy-Dechaume, the gallery of chimeras and the recarved kings; Viollet-le-Duc’s work at Amiens. Combining them in one building is a composite.',
  build(b) {
    cathedral(b, RESTORED);
  },
};
