import { P, mix, type BuildingDef } from '@ah/kit';
import { BEL, BEL_CHAMBER, BEL_GALLERY, HALLE, civicCentre, square } from './shared';

export const belfryDef: BuildingDef = {
  id: 'belfry',
  name: 'Belfry and market hall of the commune',
  style: 'Gothic',
  date: 'c. 1260',
  summary:
    'In the twelfth century the merchants and craftsmen of the northern towns swore an oath to defend one another and bought or forced from their lord a charter: the town became a commune, governed by its own mayor and aldermen (échevins). ' +
    'The sign of a commune in Picardy and Flanders was its belfry (beffroi), a tower that the bishop did not own: its bells called the citizens to assembly, rang the hours of work and the curfew, and sounded the alarm, while a watchman in the gallery looked out for fire and enemies, and the town’s charter and seal were kept in a strongroom inside. ' +
    'Beside it stands the market hall, open below for the cloth and grain markets, with the aldermen’s room above where they met to govern and to judge.',
  materials: ['limestone ashlar', 'oak', 'flat clay tiles', 'slate', 'bronze bells'],
  lookFor: [
    { label: 'Watch gallery', note: 'A crenellated walk on a row of corbels, from which the watchman kept a lookout over the town day and night.', at: [BEL.x + BEL.w / 2 + 0.6, BEL.shaft + 1.0, BEL.z + 2] },
    { label: 'Bell chamber and louvres', note: 'Tall pointed openings fitted with sloping louvre boards (abat-sons) throw the sound of the commune’s bells down into the streets.', at: [BEL.x, BEL_GALLERY + 2.4, BEL.z + 2.9] },
    { label: 'Slate spire', note: 'An eight-sided spire covered in slate makes the belfry the tallest thing in town after the cathedral, a claim the bishop resented.', at: [BEL.x + 1.2, BEL_CHAMBER + 4, BEL.z + 1.2] },
    { label: 'Open market hall', note: 'Pointed arches on three sides leave the ground floor open for stalls; the commune drew rents and tolls from the market.', at: [(HALLE.x0 + HALLE.x1) / 2 + 1.7, 2.0, HALLE.z1 + 0.3] },
    { label: 'Aldermen’s room', note: 'The échevins met in the room upstairs, lit by paired lancet windows and reached by its own outside stair.', at: [HALLE.x1 - 2.2, HALLE.g + 2.4, HALLE.z1 + 0.3] },
  ],
  modelledOn:
    'The belfries of Picardy and Flanders, such as those of Abbeville and Boulogne-sur-Mer (thirteenth century, both much altered later); generic in its details',
  build(b) {
    square(b, -21.8, 21.8, HALLE.z1, 'earth');
    civicCentre(b, 1260);
    // market day: a few stalls under awnings, and the town well
    for (const [x, z, c] of [
      [4, 8, P.cream],
      [9, 9, 0xb05a3a],
      [14, 7.5, P.cream],
      [6, 14, 0x6f8ea6],
      [12, 15, P.cream],
    ] as [number, number, number][]) {
      b.box(2.6, 0.9, 1.4, P.oak, { at: [x, 0, z] });
      for (const s of [-1, 1]) b.box(0.12, 2.3, 0.12, P.oak, { at: [x + s * 1.2, 0, z - 0.6] });
      b.box(2.9, 0.06, 2.0, c, { at: [x, 2.3, z], rot: [0.25, 0, 0] });
      b.collider(2.6, 1.4, { at: [x, 0, z] });
    }
    b.cyl(0.9, 0.9, mix(P.pierreBlonde, P.rubble, 0.4), { at: [-8, 0, 12], segs: 8 });
    b.box(0.15, 2.2, 0.15, P.oak, { at: [-8.8, 0.9, 12] });
    b.box(0.15, 2.2, 0.15, P.oak, { at: [-7.2, 0.9, 12] });
    b.box(1.9, 0.15, 0.15, P.oak, { at: [-8, 3.0, 12] });
    b.collider(1.9, 1.9, { at: [-8, 0, 12] });
  },
};
