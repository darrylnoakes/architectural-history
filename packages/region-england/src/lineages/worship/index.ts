import type { Lineage } from '@ah/kit';
import { ironAgeShrine } from './01-iron-age-shrine';
import { romanoCelticTemple } from './02-romano-celtic-temple';
import { ruinedTemple } from './03-ruined-temple';
import { saxonChurch } from './04-saxon-church';
import { normanChurch } from './05-norman-church';
import { earlyEnglishChurch } from './06-early-english-church';
import { decoratedChurch } from './07-decorated-church';
import { perpendicularChurch } from './08-perpendicular-church';
import { victorianRestoration } from './09-victorian-restoration';

const lineage: Lineage = {
  id: 'worship',
  name: 'The Church',
  role: 'The sacred site: an Iron Age shrine, then a Roman temple, then one parish church enlarged and altered for twelve centuries.',
  plotSize: [26, 46],
  stages: [
    { from: -500, def: ironAgeShrine },
    { from: 120, def: romanoCelticTemple },
    { from: 410, def: ruinedTemple },
    { from: 680, def: saxonChurch },
    { from: 1090, def: normanChurch },
    { from: 1240, def: earlyEnglishChurch },
    { from: 1340, def: decoratedChurch },
    { from: 1470, def: perpendicularChurch },
    { from: 1868, def: victorianRestoration },
  ],
};

export default lineage;
