import { tint, type BuildingDef } from '@ah/kit';
import { HALF } from './shared';
import { AURELIAN, WALL_COLOURS, aurelianTower, curtain } from './curtain';
import { FOOT, FT, FW, FZ, TH, TR, TX, TZ, romanArches, romanGallery, romanGateColliders, romanPaving, romanTomb, romanTowers } from './03-roman-gate';

const WALL_T = AURELIAN.t;
const WALL_H = AURELIAN.h;
const WF = WALL_T / 2; // outer face of the curtain
const SX = FW / 2 - 0.3; // the new curtain runs from the flanks of the old gate front
const ST = { x: 13.2, ...AURELIAN.tower }; // the square interval towers nearest the gate

export const aurelianGate: BuildingDef = {
  id: 'aurelian-gate',
  name: 'Late Roman wall and gate',
  style: 'Late Roman',
  date: 'late 3rd century AD',
  summary:
    'For three centuries Italy had needed no walls, and many towns had built over theirs. Then in 270 and 271 Germanic raiders broke into northern Italy, and the emperor Aurelian began a new wall round Rome itself; other towns followed. ' +
    'Speed mattered more than show: the new wall is concrete faced in brick, often with old tombs and houses swallowed into it, and square towers project every thirty metres or so, each with a chamber whose arched windows took bolt-throwing ballistas. ' +
    'The Augustan gate is kept and taken into the new wall, as Verona kept its early imperial gates in the wall of 265. Its arches, gallery and towers still stand, but the footways are walled up in brick and the tiled roofs give way to battlements: the show front is made to be fought from.',
  materials: ['concrete faced with brick', 'the white limestone of the Augustan gate', 'oak doors'],
  modelledOn: 'The Aurelian Walls of Rome (AD 271 to 275) and their square towers; Verona, whose wall of AD 265 under Gallienus took in the early imperial gates, the Porta Borsari carrying the inscription of that year',
  influences: ['roman-concrete'],
  lookFor: [
    { label: 'Brick-faced concrete', note: 'A core of concrete poured between two skins of brick: quick to build with gangs of unskilled labour.', at: [-12.4, 4, WF + 0.2] },
    { label: 'Square interval tower', note: 'Towers stand out from the wall at regular intervals so no stretch of it is out of bowshot.', at: [-ST.x, ST.h - 1.5, WF + ST.out + 0.2] },
    { label: 'Ballista windows', note: 'Arched openings in the tower chambers, where bolt-throwing ballistas stood behind shutters.', at: [ST.x, ST.h - 3.6, WF + ST.out + 0.25] },
    { label: 'Walled-up footway', note: 'The side arches of the old gate are blocked with brick, leaving only the two carriage arches to defend.', at: [FOOT.x, 2.2, FZ + FT / 2 + 0.3] },
    { label: 'Battlements on the old gate', note: 'The roofs of the Augustan towers and gallery are replaced by brick merlons, so the guard can fight from the top.', at: [-TX, TH + 1.0, TZ + TR + 0.2] },
  ],
  build(b) {
    const brick = WALL_COLOURS.aurelian.brick;

    // the road and the tomb outside it are the Augustan ones
    romanPaving(b);
    romanTomb(b);

    // ---------------------------------------------------------------- the new curtain wall and its square towers
    b.sym((s) => {
      curtain(b, 'aurelian', s > 0 ? SX : -HALF, s > 0 ? HALF : -SX, { towers: false, detail: true });
      aurelianTower(b, s * ST.x, s);
    });

    // ---------------------------------------------------------------- the Augustan gate, taken into it
    romanArches(b);
    romanGallery(b, false);
    romanTowers(b, false);
    // the footways walled up in brick, flush with both faces
    for (const [z, f] of [[FZ + FT / 2 - 0.1, '+z'], [FZ - FT / 2 + 0.1, '-z']] as const) {
      b.sym((s) => b.panel(FOOT.w + 0.02, FOOT.h + 0.02, tint(brick, -0.04), { at: [s * FOOT.x, 0, z], facing: f, shape: 'round', depth: 0.25 }));
    }

    // ---------------------------------------------------------------- the town side: a ramp-stair to the wall-walk
    b.stairs(1.3, WALL_H, 6.5, 15, tint(brick, -0.04), { at: [-6.6, 0, -WF - 0.7], rotY: Math.PI / 2 });

    // ---------------------------------------------------------------- around it
    b.tree(6.5, { kind: 'cypress', at: [-10.6, 0, 6.0] });
    b.tree(6.5, { kind: 'cypress', at: [12.6, 0, 6.8] });

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(HALF - SX, WALL_T, { at: [s * (HALF + SX) / 2, 0, 0] });
      b.collider(ST.w, WALL_T + ST.out, { at: [s * ST.x, 0, -WF + (WALL_T + ST.out) / 2] });
      b.collider(FOOT.w, FT, { at: [s * FOOT.x, 0, FZ] });
    });
    romanGateColliders(b);
    b.collider(6.5, 1.3, { at: [-6.6, 0, -WF - 0.7] });
  },
};
