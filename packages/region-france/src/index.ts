import type { Region } from '@ah/kit';
import { eras } from './eras';
import { influences } from './influences';
import { plots } from './plots';
import { site } from './site';
import maison from './lineages/maison';
import faubourg from './lineages/faubourg';
import hotel from './lineages/hotel';
import cathedrale from './lineages/cathedrale';
import abbaye from './lineages/abbaye';
import pouvoir from './lineages/pouvoir';
import chateau from './lineages/chateau';
import halles from './lineages/halles';
import atelier from './lineages/atelier';
import pont from './lineages/pont';
import spectacles from './lineages/spectacles';
import auberge from './lineages/auberge';
import remparts from './lineages/remparts';
import gare from './lineages/gare';

export { eras, influences, plots };

export const france: Region = {
  id: 'france',
  name: 'France',
  location: [49.4, 3.3],
  subtitle: 'A cathedral city on a river',
  intro: {
    title: 'One city, twenty-three centuries',
    text:
      'This is a cathedral city of northern France, between Paris and the Belgian border. It is burned by invaders, rebuilt in the Gothic it helped to invent, ' +
      'stripped in the Revolution, and shelled to ruins in 1914: so some plots rebuild age by age, some keep what survived, and much of the centre dates from the 1920s.',
  },
  start: -300,
  end: 2025,
  eras,
  influences,
  lineages: [maison, faubourg, hotel, cathedrale, abbaye, pouvoir, chateau, halles, atelier, pont, spectacles, auberge, remparts, gare],
  plots,
  site,
};

export default france;
