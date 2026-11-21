import type { BuildingDef } from '@ah/kit';
import { ostiaBlock } from './shared-block';

export const houseInRuins: BuildingDef = {
  id: 'house-in-ruins',
  name: 'Living in the ruins',
  style: 'Late Antique',
  date: 'c. AD 480 to 600',
  summary:
    'As the western empire broke up, the town shrank, trade fell away and nobody could afford to repair a tall block of flats. ' +
    'The upper floors were abandoned and their roofs and floors fell in, but the concrete vault over the ground floor still kept the ' +
    'rain off, so a family lives there. Doors and shop fronts are walled up or narrowed with whatever stone lay to hand, the old garden ' +
    'is dug for vegetables, and a lean-to of salvaged timber and tiles serves as kitchen and store. At Ostia and in Rome archaeologists ' +
    'find just this: blocked openings, hearths on old floors and layers of dark earth where gardens and middens spread over the streets.',
  materials: ['the old brick-faced concrete', 'reused blocks of tufa, travertine and marble', 'salvaged roof tiles and timber'],
  lookFor: [
    {
      label: 'Blocked openings',
      note: 'The shop fronts are walled up with reused stone of every kind, leaving only a small window or a narrow door; it was safer and warmer.',
      at: [-4.3, 1.5, 7.75],
    },
    {
      label: 'Roofless upper floors',
      note: 'With the roof gone the upper storeys stand open to the sky, their window openings empty and the sockets of the floor beams showing.',
      at: [-2.5, 9.4, 7.65],
    },
    {
      label: 'Surviving floor',
      note: 'The concrete floor of the first storey, overgrown and heaped with rubble, still roofs the rooms below, and that is where the family lives.',
      at: [-5.0, 4.7, 2.0],
    },
    {
      label: 'Lean-to',
      note: 'A shelter of salvaged posts and old roof tiles against the back wall, over a clay bread oven and the firewood.',
      at: [4.0, 2.6, -2.4],
    },
    {
      label: 'Vegetable patch',
      note: 'The ornamental garden is dug for beans and cabbages and the fountain basin is filled with earth.',
      at: [-3.4, 0.45, -5.1],
    },
  ],
  build(b) {
    ostiaBlock(b, true);
  },
};
