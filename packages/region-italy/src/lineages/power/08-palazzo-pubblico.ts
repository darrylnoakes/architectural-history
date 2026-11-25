import { P, mix, type BuildingDef } from '@ah/kit';
import { CENTRE_TOP, PAL, PORTAL_X, TWR, TWR_TOP, WING_TOP, brickSquare, palaceColliders, palazzoPubblico, pave, squareWell } from './shared';

export const palazzoPubblicoDef: BuildingDef = {
  id: 'palazzo-pubblico',
  name: 'Palazzo Pubblico',
  style: 'Italian Gothic civic',
  date: 'c. 1300 to 1340',
  summary:
    'The commune outgrows its broletto and builds a palace fit for a city-state: a closed, defensible block where the priors who governed the town lived shut in during their short terms of office, ' +
    'with a council hall, offices, a prison and the treasury. ' +
    'A stone ground floor carries storeys of brick lit by three-light windows, and the whole is crowned by a battlemented parapet on corbels, as much a sign of power as a defence. ' +
    'The tall, slender tower, built to outdo every private family tower, carries the bell that called the citizens together; from here on the palace and its tower are never pulled down.',
  materials: ['brick', 'travertine', 'clay roof tiles (coppi)', 'bronze bell'],
  lookFor: [
    { label: 'Civic tower', note: 'A slender brick tower far taller than any family tower, its stone crown carrying the bell chamber.', at: [TWR.x + TWR.w / 2 + 0.6, TWR_TOP - 6, TWR.z + TWR.w / 2 + 0.6] },
    { label: 'Machicolated battlements', note: 'A parapet of square merlons carried out on stone corbels, with gaps through which the defenders could drop missiles.', at: [PORTAL_X, CENTRE_TOP + 1.2, PAL.zf + 1.2] },
    { label: 'Three-light windows', note: 'Trifore: pointed arches of white stone holding three lights on slender colonnettes, set in the brick of the upper floors.', at: [-0.5, PAL.g + 2, PAL.zf + 0.4] },
    { label: 'Sienese arch', note: 'A pointed arch over a flat stone lintel, the typical doorway of the Tuscan Gothic palace.', at: [PORTAL_X + 4, 2.5, PAL.zf + 0.6] },
    { label: 'Ringhiera', note: 'A raised stone platform in front of the palace from which laws and sentences were proclaimed to the square.', at: [PORTAL_X - 3, 1.4, PAL.zf + 2.4] },
  ],
  modelledOn: 'The Palazzo Pubblico of Siena (1297 to 1310, tower 1325 to 1348) and the Palazzo Vecchio of Florence (from 1299), much reduced',
  influences: ['cistercian-gothic'],
  build(b) {
    palazzoPubblico(b, { stage: 1300 });
    // the square in front, laid in brick between travertine strips, running round the right side
    brickSquare(b, -21.5, 21.5, PAL.zf, 21.5);
    pave(b, 14.5, 28, 14.25, -7, mix(P.cotto, P.paving, 0.45));
    // the old stone wellhead in the square, and a low wall closing the yard behind
    squareWell(b);
    b.box(0.4, 2.6, 18, P.cotto, { at: [5.8, 0, -12] });
    b.box(25.8, 2.6, 0.4, P.cotto, { at: [-7.2, 0, -21] });
    b.box(0.4, 2.6, 18, P.cotto, { at: [-20, 0, -12] });
    palaceColliders(b, false);
    b.collider(0.6, 18, { at: [5.8, 0, -12] });
    b.collider(25.8, 0.6, { at: [-7.2, 0, -21] });
    b.collider(0.6, 18, { at: [-20, 0, -12] });
    void WING_TOP;
  },
};
