import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, archPanel, gateMass, merlonsX, road, voussoirs } from './shared';

const WALL_T = 3.4;
const WALL_H = 8.0;
const WF = WALL_T / 2; // outer face of the curtain
const OW = 3.8; // gate opening
const OH = 6.0;
const GX = 3.6; // half-width of the gate block
const GH = 11.2;
const GF = WF + 0.5; // the gate front stands a little forward
const RT = { x: 5.9, r: 2.8, h: 14.2, z: WF + 0.6 }; // round-fronted gate towers
const ST = { x: 13.2, w: 3.6, h: 11.2, out: 3.0 }; // square interval towers

/** A crenellated parapet round the top of a w × d rectangle with brick merlons. */
function battlements(b: Builder, w: number, d: number, y: number, color: number, at: [number, number]) {
  b.crenel(w, d, color, { at: [at[0], y, at[1]], merlonW: 0.8, merlonH: 1.1, t: 0.5 });
  b.box(w, 0.5, d, color, { at: [at[0], y - 0.5, at[1]] });
}

export const aurelianGate: BuildingDef = {
  id: 'aurelian-gate',
  name: 'Late Roman wall and gate',
  style: 'Late Roman',
  date: 'late 3rd century AD',
  summary:
    'For three centuries Italy had needed no walls, and many towns had built over theirs. Then in 270 and 271 Germanic raiders broke into northern Italy, and the emperor Aurelian began a new wall round Rome itself; other towns followed. ' +
    'Speed mattered more than show: the wall is concrete faced in brick, often with old tombs and houses swallowed into it, and square towers project every thirty metres or so, each with a chamber whose arched windows took bolt-throwing ballistas. ' +
    'The gate is a single arch faced in stone between two towers with rounded fronts, and a chamber with a row of windows above the passage. Where the Augustan gate was a show front, this one is made to be fought from.',
  materials: ['concrete faced with brick', 'travertine blocks round the arch', 'clay roof tiles', 'oak doors'],
  modelledOn: 'The Aurelian Walls of Rome (AD 271 to 275) and their gates: the Porta Latina, and the Porta San Sebastiano (the old Porta Appia, built with two arches and given its single arch when Honorius rebuilt the gates about 401 to 403)',
  influences: ['roman-concrete'],
  lookFor: [
    { label: 'Brick-faced concrete', note: 'A core of concrete poured between two skins of brick: quick to build with gangs of unskilled labour.', at: [-10, 4, WF + 0.2] },
    { label: 'Round-fronted towers', note: 'Their rounded fronts give no corner for a battering ram and let defenders shoot along the wall face.', at: [RT.x, 10, RT.z + RT.r + 0.3] },
    { label: 'Square interval tower', note: 'Towers stand out from the wall at regular intervals so no stretch of it is out of bowshot.', at: [-ST.x, ST.h - 1.5, WF + ST.out + 0.2] },
    { label: 'Ballista windows', note: 'Arched openings in the tower chambers, where bolt-throwing ballistas stood behind shutters.', at: [ST.x, ST.h - 3.6, WF + ST.out + 0.25] },
    { label: 'Gate chamber', note: 'A room over the arch, lit by a row of windows, from which the guard watched the road and defended the gate.', at: [0, 9.2, GF + 0.3] },
  ],
  build(b) {
    const brick = tint(mix(mix(P.brickRed, P.brickDark, 0.3), P.brickBuff, 0.28), b.range(-0.03, 0.02));
    const band = tint(brick, -0.08);
    const stone = P.travertine;
    const roof = P.coppi;

    road(b, 5.2, mix(P.peperino, P.cobble, 0.4));
    for (let z = -7.5; z < 8; z += 1.1) b.box(5.2, 0.01, 0.05, tint(P.peperino, -0.12), { at: [0, 0.04, z], jitter: false });

    // ---------------------------------------------------------------- the curtain wall
    b.sym((s) => {
      const x0 = GX;
      const xc = s * (x0 + HALF) / 2;
      const L = HALF - x0;
      b.box(L, WALL_H, WALL_T, brick, { at: [xc, 0, 0] });
      // levelling courses where the gangs stopped, and putlog holes for their scaffolding
      for (const y of [1.9, 3.9, 5.9]) b.box(L, 0.08, WALL_T + 0.04, band, { at: [xc, y, 0], jitter: false });
      for (let x = x0 + 1; x < HALF; x += 1.6) for (const y of [2.5, 4.5]) b.panel(0.18, 0.18, P.black, { at: [s * x, y, WF], depth: 0.02 });
      // parapet with merlons on the outer edge and a low wall on the inner edge
      b.box(L, 0.25, WALL_T + 0.15, tint(brick, 0.03), { at: [xc, WALL_H - 0.25, 0] });
      merlonsX(b, s > 0 ? x0 : -HALF, s > 0 ? HALF : -x0, WALL_H, WF - 0.3, brick, { w: 0.85, h: 1.3, t: 0.6, gap: 0.75 });
      b.box(L, 0.4, 0.35, brick, { at: [xc, WALL_H, -WF + 0.18] });
    });

    // ---------------------------------------------------------------- square interval towers
    b.sym((s) => {
      b.group({ at: [s * ST.x, 0, 0] }, () => {
        const d = WALL_T + ST.out;
        const zc = -WF + d / 2;
        b.box(ST.w, ST.h, d, brick, { at: [0, 0, zc] });
        for (const y of [1.9, 3.9, 5.9]) b.box(ST.w + 0.04, 0.08, d + 0.04, band, { at: [0, y, zc], jitter: false });
        battlements(b, ST.w, d, ST.h, brick, [0, zc]);
        // the chamber: two ballista windows to the field, one to each side
        const zf = WF + ST.out;
        for (const x of [-0.75, 0.75]) {
          archPanel(b, 1.0, 1.7, stone, { at: [x, ST.h - 4.2, zf], depth: 0.04 });
          archPanel(b, 0.8, 1.55, P.windowDark, { at: [x, ST.h - 4.15, zf], depth: 0.07 });
        }
        archPanel(b, 0.8, 1.55, P.windowDark, { at: [-s * ST.w / 2, ST.h - 4.15, WF + ST.out / 2], facing: s > 0 ? '-x' : '+x', depth: 0.07 });
        b.panel(0.18, 1.1, P.black, { at: [0, 3.2, zf], depth: 0.04 });
        // the door into the tower from the wall-walk, on the town side
        b.panel(0.9, 1.9, P.oakDark, { at: [-s * 0.6, WALL_H, -WF], facing: '-z', shape: 'round' });
      });
    });

    // ---------------------------------------------------------------- the gate block
    const gd = GF + WF; // depth from the inner face of the wall to the gate front
    const gz = (GF - WF) / 2;
    gateMass(b, GX * 2, GH, gd, brick, { at: [0, 0, gz], xs: [0], openW: OW, openH: OH });
    for (const y of [1.9, 3.9]) b.sym((s) => b.box(GX - OW / 2, 0.08, gd + 0.04, band, { at: [s * (GX + OW / 2) / 2, y, gz], jitter: false }));
    // travertine facing round the arch on the field side: jambs, voussoirs, a cornice
    b.sym((s) => b.box(0.7, OH - OW / 2, 0.3, stone, { at: [s * (OW / 2 + 0.35), 0, GF + 0.1] }));
    voussoirs(b, OW, OH - OW / 2, 0.7, stone, { at: [0, 0, GF], n: 9, proud: 0.2, vary: 0.03 });
    b.box(GX * 2 + 0.2, 0.3, 0.5, stone, { at: [0, 7.6, GF + 0.1] });
    // the gate chamber: a row of arched windows
    for (const x of [-2.4, -1.2, 0, 1.2, 2.4]) {
      archPanel(b, 0.8, 1.6, stone, { at: [x, 8.3, GF], depth: 0.04 });
      archPanel(b, 0.62, 1.48, P.windowDark, { at: [x, 8.35, GF], depth: 0.07 });
      archPanel(b, 0.62, 1.48, P.windowDark, { at: [x, 8.35, -WF], facing: '-z', depth: 0.07 });
    }
    // brick relieving arch on the town side and the doors folded back in the passage
    voussoirs(b, OW, OH - OW / 2, 0.5, band, { at: [0, 0, -WF], facing: '-z', n: 11, proud: 0.06, vary: 0.02 });
    b.vault(OW, gd - 0.05, tint(brick, -0.2), { at: [0, OH - OW / 2, gz], segs: 8 });
    b.sym((s) => b.box(0.14, OH - OW / 2 + 0.6, OW / 2, P.oakDark, { at: [s * (OW / 2 - 0.1), 0, -WF + OW / 4 + 0.3] }));
    // a tiled roof over the chamber, behind a parapet
    b.box(GX * 2, 0.6, 0.4, brick, { at: [0, GH, GF - 0.2] });
    b.gable(GX * 2 - 0.2, gd - 0.6, 1.2, roof, { at: [0, GH, gz - 0.2], overhang: 0.2, wall: brick });

    // ---------------------------------------------------------------- round-fronted gate towers
    b.sym((s) => {
      b.group({ at: [s * RT.x, 0, 0] }, () => {
        const back = -WF;
        const d = RT.z - back;
        b.box(RT.r * 2, RT.h, d, brick, { at: [0, 0, back + d / 2] });
        b.cyl(RT.r, RT.h, brick, { at: [0, 0, RT.z], segs: 16 });
        b.cyl(RT.r + 0.25, 1.2, tint(stone, -0.05), { at: [0, 0, RT.z], segs: 16, rTop: RT.r + 0.05 }); // stone plinth
        for (const y of [1.9, 3.9, 5.9, 7.9]) b.cyl(RT.r + 0.03, 0.08, band, { at: [0, y, RT.z], segs: 16, jitter: false });
        // top: merlons round the drum and along the back
        b.cyl(RT.r + 0.15, 0.3, tint(brick, 0.03), { at: [0, RT.h - 0.3, RT.z], segs: 16 });
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI / 2 + (i / 8) * Math.PI;
          b.box(0.8, 1.1, 0.5, brick, { at: [Math.sin(a) * (RT.r - 0.2), RT.h, RT.z + Math.cos(a) * (RT.r - 0.2)], rotY: a, jitter: false });
        }
        b.box(RT.r * 2, 1.1, 0.5, brick, { at: [0, RT.h, back + 0.25] });
        // two tiers of arched windows round the front, slits low down
        for (const a of [-1.0, 0, 1.0]) {
          const at = (r: number, y: number): [number, number, number] => [Math.sin(a) * r, y, RT.z + Math.cos(a) * r];
          archPanel(b, 0.95, 1.7, stone, { at: at(RT.r - 0.03, RT.h - 4.2), facing: a, depth: 0.04 });
          archPanel(b, 0.78, 1.6, P.windowDark, { at: at(RT.r - 0.02, RT.h - 4.15), facing: a, depth: 0.08 });
          archPanel(b, 0.6, 1.3, P.windowDark, { at: at(RT.r - 0.02, 8.5), facing: a, depth: 0.08 });
          b.panel(0.18, 1.1, P.black, { at: at(RT.r - 0.02, 4.0), facing: a, depth: 0.06 });
        }
      });
    });

    // ---------------------------------------------------------------- the town side: a ramp-stair to the wall-walk
    b.stairs(1.3, WALL_H, 6.5, 15, tint(brick, -0.04), { at: [-6.6, 0, -WF - 0.7], rotY: Math.PI / 2 });

    // ---------------------------------------------------------------- around it
    b.tree(6.5, { kind: 'pine', at: [-9.8, 0, 5.4] });
    b.tree(6.5, { kind: 'cypress', at: [9.6, 0, 6.8] });

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(HALF - GX, WALL_T, { at: [s * (HALF + GX) / 2, 0, 0] });
      b.collider(GX - OW / 2 + 0.2, gd, { at: [s * (GX + OW / 2) / 2, 0, gz] });
      b.collider(RT.r * 2, RT.z + RT.r + WF, { at: [s * RT.x, 0, (RT.z + RT.r - WF) / 2] });
      b.collider(ST.w, WALL_T + ST.out, { at: [s * ST.x, 0, -WF + (WALL_T + ST.out) / 2] });
    });
    b.collider(6.5, 1.3, { at: [-6.6, 0, -WF - 0.7] });
  },
};
