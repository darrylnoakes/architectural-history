import type { BuildingDef } from '@ah/kit';
import { cathedral, FLAMBOYANT, AW, TW, CZ, TX, TZC, BEL1, H } from './shared';

export const flamboyantCathedral: BuildingDef = {
  id: 'flamboyant-cathedral',
  name: 'Flamboyant cathedral',
  style: 'Late Gothic (Flamboyant)',
  date: 'c. 1500',
  summary:
    'After the Hundred Years’ War the money came back, and the cathedral was finished in the last French Gothic, called Flamboyant after the flame shapes of its tracery: curving bars that make daggers (soufflets) and curling flames (mouchettes), and arches with an S-curve to their sides (ogees). ' +
    'The south tower was at last given its belfry and an openwork octagonal crown of slender piers and pinnacles, like the Tour de Beurre at Rouen. The south transept was refronted with an ogee gable over the door and a rose whose bars curve both ways into flames. ' +
    'Between the nave buttresses, chapels founded by guilds and families now fill the spaces, each with its own window and gable, and houses and shops lean against the north side. ' +
    'Survives: the choir of the 1160s, the nave, front and north tower of the thirteenth century, and the crossing spire.',
  materials: ['fine limestone', 'lead', 'stained glass', 'timber-framed houses with clay tile roofs'],
  lookFor: [
    { label: 'Openwork crown', note: 'The south tower finished with an eight-sided lantern of thin piers, ogee arches and pinnacles, open to the sky.', at: [TX, BEL1 + 5.0, TZC + 2.9] },
    { label: 'Flamboyant rose', note: 'In the new south transept front the tracery bars curve one way and the other, crossing into flame-shaped lights.', at: [TW + 0.5, 14.9, CZ] },
    { label: 'Ogee gable', note: 'The gable over the transept door has an S-curved outline, with knobs of foliage (crockets) on its edges and a finial on top.', at: [TW + 1.3, 9.8, CZ] },
    { label: 'Side chapels', note: 'Chapels built out between the buttresses of the nave, each under its own small gable with a flamboyant window.', at: [AW + 2.4, 6.0, 5.0] },
    { label: 'Houses against the walls', note: 'Timber-framed houses and shops built against the north side, between and beyond the buttresses.', at: [-14.6, 5.0, 6.1] },
  ],
  modelledOn:
    'The Tour de Beurre at Rouen (1485 to 1506) for the crown; Martin Chambiges’s transept fronts at Sens (from 1490) and Beauvais (from 1500) for the rose and the ogee gable; the chapels between the buttresses as at Amiens and Paris.',
  build(b) {
    cathedral(b, FLAMBOYANT);
    void H;
  },
};
