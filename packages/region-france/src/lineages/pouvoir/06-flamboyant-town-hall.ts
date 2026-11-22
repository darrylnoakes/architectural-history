import { P, mix, type BuildingDef } from '@ah/kit';
import { BAYS, BEL, BUTTS, EAVES, HALL, civicCentre, square } from './shared';

export const flamboyantTownHall: BuildingDef = {
  id: 'flamboyant-town-hall',
  name: 'Town hall (hôtel de ville)',
  style: 'Flamboyant Gothic',
  date: 'c. 1510',
  summary:
    'With peace after the Hundred Years’ War and trade recovering, the commune pulls down its old market hall and builds a proper town hall against the belfry, as Saint-Quentin (front finished 1509), Compiègne and Arras did in the same years. ' +
    'The new hall is all show: an arcade where merchants can trade under cover, a great hall upstairs for the council and the town’s feasts, tall windows, saints and kings in canopied niches, an openwork parapet and a roof of slate crowded with stone dormers in the Flamboyant manner. ' +
    'The belfry (old) keeps its bells and gains corner turrets and a public clock. By now the king’s officers watch the town closely, but the mayor and aldermen still run its markets, walls, watch and taxes.',
  materials: ['limestone ashlar', 'slate', 'lead', 'oak'],
  lookFor: [
    { label: 'Arcade on the square', note: 'Five pointed arches carry the front wall, leaving a covered walk where merchants could trade in the rain.', at: [BAYS[1], 2.6, HALL.z1 + 0.3] },
    { label: 'Statues in niches', note: 'Figures of saints and rulers stand in canopied niches on the buttresses between the windows.', at: [BUTTS[2], HALL.g + 2.4, HALL.z1 + 1.1] },
    { label: 'Flamboyant dormers', note: 'Stone dormers (lucarnes) rise from the parapet, each with a mullioned window, a pointed gable with a finial, and pinnacles either side.', at: [BAYS[3], EAVES + 3.4, HALL.z1 + 0.1] },
    { label: 'Openwork parapet', note: 'The stone parapet along the eaves is pierced with a row of small pointed lights like a lace edging.', at: [BAYS[0] + 2, EAVES + 0.6, HALL.z1 + 0.3] },
    { label: 'Clock and corner turrets', note: 'The belfry is brought up to date with a public clock on its face to the square (a dial of this date had only an hour hand; minute hands came in about 1700) and four turrets with conical slate roofs at the gallery.', at: [BEL.x, 25.2 + 1.3, BEL.z + BEL.w / 2 + 0.3] },
  ],
  modelledOn:
    'The hôtels de ville of Saint-Quentin (Flamboyant front finished 1509), Compiègne (about 1505 to 1530) and Arras (1502 to 1517, its belfry 1463 to 1554, both rebuilt after 1918), combined and reduced; the arrangement of hall in front of belfry follows Arras',
  build(b) {
    square(b, -21.8, 21.8, HALL.z1, 'cobble');
    civicCentre(b, 1510);
    // the town well with its stone curb, and a stone market cross
    b.cyl(1.0, 0.9, mix(P.pierreBlonde, P.rubble, 0.3), { at: [8, 0, 13], segs: 8 });
    b.box(0.15, 2.2, 0.15, P.iron, { at: [7.1, 0.9, 13] });
    b.box(0.15, 2.2, 0.15, P.iron, { at: [8.9, 0.9, 13] });
    b.box(2.0, 0.15, 0.15, P.iron, { at: [8, 3.0, 13] });
    b.collider(2.1, 2.1, { at: [8, 0, 13] });
  },
};
