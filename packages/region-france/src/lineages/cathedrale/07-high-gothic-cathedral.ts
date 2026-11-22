import type { BuildingDef } from '@ah/kit';
import { cathedral, HIGH, AW, FZ, PZ, TX, TZC, BEL0, NW } from './shared';

export const highGothicCathedral: BuildingDef = {
  id: 'high-gothic-cathedral',
  name: 'High Gothic cathedral',
  style: 'High Gothic',
  date: 'c. 1245',
  summary:
    'The Romanesque nave has gone and a new nave and west front have been built in the manner of Chartres, Reims and Amiens. Because flying buttresses now hold the vault, the tribune is no longer needed: the nave has three storeys, an arcade, a dark triforium passage and a clerestory as tall as the arcade, filled with bar tracery (lights topped by a round light, first used at Reims about 1215). ' +
    'Its buttresses are deep piers crowned with pinnacles, whose weight helps them stand, and each carries two flyers, one above the other. ' +
    'The west front has three deep porches lined with statues, a gallery of kings (the kings of Judah, ancestors of Christ), a rose and an open gallery. Only the north tower has been finished, with a stone spire; the south stops at the foot of its belfry under a temporary roof, and stayed so for two and a half centuries. A timber spire sheathed in lead rises over the crossing. ' +
    'Survives: the choir of the 1160s with its four storeys and single flyers, and its transept, now completed with portals and rose windows.',
  materials: ['fine limestone', 'lead on oak roof frames', 'stained glass', 'painted sculpture'],
  lookFor: [
    { label: 'Sculpted portals', note: 'Three porches whose sides step back in rows of life-size saints; above the doors, the tympanum shows the Last Judgement in registers of figures.', at: [0, 3.0, PZ + 0.6] },
    { label: 'Gallery of kings', note: 'A row of crowned kings across the whole front. They are the kings of Judah, but the Revolution would take them for kings of France.', at: [-2.3, 16.6, FZ + 1.0] },
    { label: 'Rose window', note: 'A great wheel of tracery and glass over the central portal, centred on the axis of the nave.', at: [0, 21.8, FZ + 0.6] },
    { label: 'Two tiers of flying buttresses', note: 'Each pier of the nave sends two flyers to the clerestory, one under the other, and ends in a pinnacle.', at: [AW + 1.6, 22.5, 3.1] },
    { label: 'Unfinished south tower', note: 'Work stopped at the foot of the belfry and the stump was roofed over: lopsided fronts like this were normal for centuries.', at: [TX, BEL0 + 4.6, TZC + 3.4] },
  ],
  modelledOn:
    'Amiens (nave begun 1220) and Reims (begun 1211) for the nave, the two-tier flying buttresses with pinnacles, the deep sculpted portals and the gallery of kings; Senlis (stone spire about 1240) for the finished north tower. Amiens, Paris and Reims all kept flat-topped towers, the spires planned for them never built.',
  influences: ['gothic-export'],
  build(b) {
    cathedral(b, HIGH);
    void NW;
  },
};
