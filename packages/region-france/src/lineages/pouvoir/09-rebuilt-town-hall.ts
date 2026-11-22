import { P, mix, type BuildingDef, type Builder } from '@ah/kit';
import { BEL, HALL, WING, ZC, civicCentre, gasLamp, square, warMemorial } from './shared';

/** Where the war memorial stands in the square, in front of the hall. */
export const MEMORIAL = { x: -11.5, z: 14 };
/** The bandstand in the square. */
const KIOSK = { x: 11, z: 6, r: 3.6 };

/** An octagonal bandstand (kiosque à musique): a stone base, iron columns, a zinc roof. */
function bandstand(b: Builder): void {
  const { x, z, r } = KIOSK;
  b.cyl(r, 1.2, mix(P.pierreBlonde, P.granite, 0.2), { at: [x, 0, z], segs: 8 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.cyl(0.08, 3.0, P.castIron, { at: [x + Math.cos(a) * (r - 0.3), 1.2, z + Math.sin(a) * (r - 0.3)], segs: 4 });
  }
  b.cyl(r - 0.2, 0.1, P.castIron, { at: [x, 2.1, z], segs: 8 });
  b.cone(r + 0.4, 2.0, P.zincParis, { at: [x, 4.2, z], segs: 8 });
  b.cone(0.3, 1.0, P.castIron, { at: [x, 6.1, z], segs: 4 });
  b.stairs(1.6, 1.2, 1.4, 4, mix(P.pierreBlonde, P.granite, 0.2), { at: [x, 0, z + r + 0.6] });
  b.collider(r * 2, r * 2, { at: [x, 0, z] });
}

export const rebuiltTownHall: BuildingDef = {
  id: 'rebuilt-town-hall',
  name: 'Town hall rebuilt after the Great War',
  style: 'Reconstruction: Flamboyant restored, Art Deco wing',
  date: 'c. 1928',
  summary:
    'From 1914 the front lay a few kilometres away, and shellfire left the belfry and town hall burnt-out shells. After much debate the town decides, as Arras did, to rebuild them as they were, stone by stone from photographs and drawings, but around a hidden frame of reinforced concrete, under new slate roofs. ' +
    'Behind the hall it adds what the old building lacked, a council chamber wing in the modern manner of the 1920s, Art Deco: pale artificial stone, tall narrow windows between fluted piers, a stepped attic, a frieze of zigzags and bronze doors. ' +
    'The Third Republic’s town hall is now the centre of a busy commune with an elected council and mayor, and in the square in front stands the war memorial with the names of the town’s dead.',
  materials: ['limestone ashlar', 'reinforced concrete', 'artificial stone', 'slate', 'bronze'],
  lookFor: [
    { label: 'Belfry rebuilt as it was', note: 'The belfry looks medieval, but it was rebuilt in the 1920s round a core of reinforced concrete, in clean new stone.', at: [BEL.x + BEL.w / 2 + 0.3, 18, BEL.z + 1] },
    { label: 'Art Deco council chamber', note: 'Tall narrow windows between fluted piers light the new council chamber, with geometric glazing bars at their heads.', at: [WING.x1 + 0.3, 6.5, WING.z0 + 4] },
    { label: 'Stepped attic and zigzag frieze', note: 'The entrance bay rises in stepped blocks over a gilt frieze of zigzags, the hallmarks of Art Deco.', at: [WING.x1 + 0.2, WING.h + 3.5, (WING.z0 + WING.z1) / 2 - 2.5] },
    { label: 'Monument aux morts', note: 'Almost every commune in France raised a war memorial in the early 1920s; here a bronze soldier (poilu) stands before a stone stele carved with the names of the dead.', at: [MEMORIAL.x + 0.6, 3.0, MEMORIAL.z + 1.4] },
    { label: 'Bandstand', note: 'An iron bandstand (kiosque à musique) where the town band played on Sundays.', at: [KIOSK.x + KIOSK.r, 3.2, KIOSK.z] },
  ],
  modelledOn:
    'Arras, whose hôtel de ville and belfry were destroyed in October 1914 and rebuilt as they had been under the architect Pierre Paquet in the 1920s and early 1930s; the Art Deco wing is generic, after the town halls of the Reconstruction in the Aisne and the Somme',
  influences: ['reinforced-concrete', 'art-deco'],
  build(b) {
    square(b, -21.8, 21.8, HALL.z1, 'setts');
    civicCentre(b, 1928);
    warMemorial(b, MEMORIAL.x, MEMORIAL.z);
    bandstand(b);
    // plane trees and lamps along the square's edge, benches
    for (const x of [ZC.x0 + 2, ZC.x1 - 2]) b.tree(8, { kind: 'round', at: [x, 0, 18.5] });
    for (const x of [-19, -4]) gasLamp(b, x, 9.5);
    for (const x of [4, 18]) {
      b.box(2.0, 0.45, 0.5, P.doorGreen, { at: [x, 0, 13] });
      b.collider(2.0, 0.5, { at: [x, 0, 13] });
    }
  },
};
