import type { BuildingDef } from '@ah/kit';
import { cathedral, SHELLED, FZ, PZ, NW, H, TX, TZC, BEL0, BEL } from './shared';

export const shelledCathedral: BuildingDef = {
  id: 'shelled-cathedral',
  name: 'Shelled cathedral',
  style: 'First World War',
  date: '1914',
  summary:
    'In September 1914 the front came to rest a few kilometres away. As at Reims on 19 September, German shells set fire to scaffolding on the north tower; the fire spread to straw laid in the nave for wounded prisoners, then to the oak roof frames, which burned out entirely while their lead ran molten from the gutters. ' +
    'The heat cracked and blackened the statues of the west front, which had been recarved only fifty years before. Over the next four years shells holed the vaults, but the stone vaults held, protecting the inside from the burning roof as their builders meant them to. Sandbags were piled against the portals and the glass was taken out or shattered. ' +
    'Survives: the walls, towers, spire, flying buttresses and most of the vaults. Lost: the roofs, the restorers’ spire and much of the sculpture.',
  materials: ['calcined limestone', 'exposed stone vaults', 'charred oak', 'sandbags'],
  lookFor: [
    { label: 'Vaults open to the sky', note: 'With the roof burned away, the backs of the stone vaults are exposed to the weather.', at: [NW - 1.0, H + 2.2, 6.0] },
    { label: 'Shell holes', note: 'Dark holes where shells broke through the vaults into the nave.', at: [0.2, H + 1.6, 2.2] },
    { label: 'Calcined statues', note: 'Fire turned the surface of the limestone to lime: the kings and portal figures are cracked, blackened and some have lost their heads.', at: [2.3, 16.4, FZ + 1.0] },
    { label: 'Sandbags', note: 'Walls of sandbags piled in the porches to save the lower sculpture from blast and splinters.', at: [0, 3.0, PZ + 0.6] },
    { label: 'Burnt scaffolding', note: 'The charred poles of the scaffolding on the north tower, where the fire began.', at: [-TX - BEL / 2 - 1.0, BEL0 + 7.0, TZC + BEL / 2 + 1.0] },
  ],
  modelledOn:
    'Reims Cathedral, set on fire on 19 September 1914 and shelled through the war: the burning of the scaffolding, the straw and the roof, the calcined west front and the sandbagged portals. The spire and the exact damage are this cathedral’s own.',
  build(b) {
    cathedral(b, SHELLED);
  },
};
