import type { BuildingDef } from '@ah/kit';
import { ostiaBlock } from './shared-block';

export const gardenApartment: BuildingDef = {
  id: 'garden-apartment',
  name: 'Garden apartments',
  style: 'Roman Imperial',
  date: 'early second century AD',
  summary:
    'By the second century a comfortable family in a busy town rented a flat rather than owning a house. Investors replaced the old ' +
    'atrium houses with blocks of brick-faced concrete three or four storeys high, which would not burn like timber and could rise as ' +
    'high as the law allowed. The best flats, like those of the Garden Houses at Ostia, have a long living room lit by a row of large ' +
    'windows, with the other rooms opening off it, and look over a shared garden behind; shops line the street, and a balcony on stone ' +
    'brackets runs along the first floor.',
  materials: ['concrete faced with brick', 'travertine brackets and sills', 'terracotta roof tiles', 'timber shutters and glazed windows'],
  modelledOn: 'The Garden Houses (Case a Giardino) and the House of Diana, Ostia',
  influences: ['roman-concrete'],
  lookFor: [
    {
      label: 'Brick-faced concrete',
      note: 'A core of concrete, rubble set in lime and volcanic sand, faced on both sides with neat brick; bands of brick mark each floor.',
      at: [-3.75, 6.5, 7.65],
    },
    {
      label: 'Balcony on travertine brackets',
      note: 'Stone brackets built into the wall carry a balcony along the first floor; at Ostia the brackets still stick out of the ruined fronts.',
      at: [-5.49, 4.1, 8.1],
    },
    {
      label: 'Living-room windows',
      note: 'Each flat has a long main room (the medianum) lit by a row of big windows, glazed or closed with wooden shutters.',
      at: [0, 9.4, 7.75],
    },
    {
      label: 'Shop with mezzanine',
      note: 'A wide street opening under a flat brick arch; the little window above lights a mezzanine where the shopkeeper stored goods or slept.',
      at: [4.3, 1.5, 7.9],
    },
    {
      label: 'Stair door',
      note: 'A separate street door framed by brick pilasters and a pediment leads straight to the stairs of the flats above.',
      at: [0, 3.5, 7.95],
    },
  ],
  build(b) {
    ostiaBlock(b, false);
  },
};
