import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { church, win, saxonCross, graveMounds, DOOR_Z, type WinSpec } from './shared';

const WALL = mix(P.sandstone, P.rubble, 0.55);
const DRESS = tint(P.limestoneWarm, -0.02);

/** Small, high, round-headed window, splayed so only a slit shows outside. */
const saxonWin: WinSpec = { kind: 'round', w: 0.42, h: 1.05, sill: 4.7, splay: 0.16 };

export const saxonChurch: BuildingDef = {
  id: 'saxon-church',
  name: 'Anglo-Saxon church',
  style: 'Anglo-Saxon',
  date: 'c. 680, altered before 1066',
  summary:
    'After the conversion, a monastery or a royal patron built a small stone church on the old sacred site, partly from blocks robbed out of the ruined Roman temple. ' +
    'It is tall and narrow, the proportion early Saxon builders favoured, perhaps because a narrow nave was easy to roof with timber. ' +
    'Windows are tiny and high, and the only way into the box-like chancel is through a narrow arch. ' +
    'Later Saxon builders added the thin stone strips on the walls; the big corner stones, laid alternately upright and flat, are the clearest Saxon mark.',
  materials: ['reused Roman stone', 'sandstone rubble', 'stone slate'],
  lookFor: [
    { label: 'Long-and-short quoins', note: 'Corner stones set alternately upright and flat: a technique found almost only in Anglo-Saxon work.', at: [3.1, 3.0, 10.7] },
    { label: 'Tall, narrow nave', note: 'The walls are higher than the nave is wide: Saxon churches are strikingly lofty for their size.', at: [-3.1, 6.8, 4] },
    { label: 'Tiny high windows', note: 'Small round-headed openings, splayed on the inside, set well above head height.', at: [3.0, 5.2, 0.3] },
    { label: 'Pilaster strips', note: 'Thin upright strips of stone on the wall face, a late Saxon fashion seen at its richest at Earls Barton.', at: [3.1, 2.0, 2.6] },
    { label: 'Sundial', note: 'A carved stone dial on the south wall, its lines marking the times of the daily services.', at: [3.1, 4.7, DOOR_Z] },
  ],
  modelledOn: 'St John the Evangelist, Escomb, County Durham (late 7th century), with late Saxon pilaster strips added',
  influences: ['roman-christianity'],
  build(b) {
    church(b, {
      wall: WALL,
      dress: DRESS,
      nave: {
        hw: 2.9,
        z0: -3,
        z1: 10.6,
        h: 7.2,
        roof: { rise: 4.2, color: P.stoneSlate, overhang: 0.2 },
        windows: { z: [0.3, 4.45], spec: saxonWin },
        quoins: true,
        pilasters: [-1.9, 2.6, 6.3],
      },
      chancel: {
        hw: 2.1,
        len: 4.5,
        h: 5.0,
        roof: { rise: 3.0, color: P.stoneSlate, overhang: 0.2 },
        windows: { z: [-5.3], spec: { ...saxonWin, sill: 2.8 } },
        quoins: true,
        east: (bb, [x, , z]) => win(bb, { kind: 'round', w: 0.42, h: 1.0, at: [x, 2.6, z], facing: '-z', frame: DRESS, splay: 0.16 }),
      },
      southDoor: 'saxon',
    });
    // a small flat-headed window high in the west gable
    win(b, { kind: 'rect', w: 0.38, h: 0.75, at: [0, 7.8, 10.6], facing: '+z', frame: DRESS, splay: 0.12 });
    // sundial: a half-disc of stone with incised lines
    b.group({ at: [2.9, 4.9, DOOR_Z], rotY: Math.PI / 2 }, () => {
      b.extrude([[-0.45, 0.5], [0.45, 0.5], [0.4, 0.25], [0.25, 0.08], [0, 0], [-0.25, 0.08], [-0.4, 0.25]], 0.08, DRESS, { at: [0, -0.5, 0.06] });
      for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) b.box(0.03, 0.42, 0.04, P.oakDark, { at: [0, -0.02, 0.11], rot: [0, 0, Math.PI + a] });
    });
    saxonCross(b, [7.5, 0, 2.5], tint(P.sandstone, 0.02));
    graveMounds(b, [[7.5, -3], [9.5, -1.5], [9.0, -6], [-7, -1], [-8.5, -5], [6.5, -8.5]], tint(P.grass, -0.06));
  },
};
