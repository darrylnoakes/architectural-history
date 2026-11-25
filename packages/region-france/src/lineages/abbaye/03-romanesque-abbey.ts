import type { BuildingDef, Builder } from '@ah/kit';
import { AW, CX, GARTH, RH, ROM, TOWER, abbey, garden } from './shared';

function build(b: Builder) {
  abbey(b, ROM);
  garden(b);
}

export const romanesqueAbbey: BuildingDef = {
  id: 'romanesque-abbey',
  name: 'Romanesque abbey',
  style: 'Romanesque',
  date: 'c. 1090',
  summary:
    'After the Viking raids and the troubles of the tenth century the great abbeys, many of them now in the family of Cluny, rebuild in stone on a scale not seen since Rome. ' +
    'The church is vaulted in stone, so its walls are thick, its windows round-headed and modest, and flat buttresses stiffen it bay by bay. ' +
    'Towers multiply: two over a deep entrance porch, the narthex, and an eight-sided one over the crossing. At the east end an ambulatory lets pilgrims walk round behind the altar past radiating chapels, each with its own altar for the monks’ daily masses. The cloister and ranges are rebuilt in stone on the old plan, and the saint’s crypt is kept under the new choir.',
  materials: ['limestone ashlar', 'rubble core', 'flat clay tiles', 'stone spires'],
  lookFor: [
    { label: 'Narthex', note: 'A deep two-storey porch before the nave, where processions formed; at Cluny it was a church in its own right.', at: [CX, 7, 17.2] },
    { label: 'Twin west towers', note: 'A pair of towers framing the entrance, the westwork turned into a façade.', at: [CX + TOWER.dx, 19, TOWER.z + TOWER.w / 2 + 0.1] },
    { label: 'Crossing tower', note: 'An eight-sided tower with a stone spire over the meeting of nave and transept.', at: [CX, 24, -5] },
    { label: 'Ambulatory and radiating chapels', note: 'A walkway round the apse with small semicircular chapels opening off it, the French way of ending a church.', at: [CX, 4, RH - AW - 2.2] },
    { label: 'Cloister arcade', note: 'Round arches on little columns, standing on a low wall round the garth.', at: [GARTH.x0, 2.2, 3] },
  ],
  modelledOn:
    'Generic, after the great churches of the Cluniac family: the third church of Cluny (begun 1088), very much reduced, and Paray-le-Monial (about 1090 to 1130), a smaller cousin of Cluny III, with a twin-towered narthex older than the rest of the church, an octagonal crossing tower and a stepped east end.',
  influences: ['cluny'],
  build,
};
