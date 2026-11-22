import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { HALF, archPanel, gateMass, road, voussoirs } from './shared';
import { COMMUNAL, WALL_COLOURS, curtain } from './curtain';

const WALL_T = COMMUNAL.t;
const WALL_H = COMMUNAL.h;
const TW = 9.4; // tower width (X)
const TF = 3.4; // tower front face (z)
const TB = -4.6; // back edge of the side walls: the tower is open on the town side
const TH = 25.5; // to the top of the parapet walk
const FT = 2.2; // front wall thickness
const ST = 1.5; // side wall thickness
const OW = 4.4; // gate arch
const OH = 7.6;

export const communalGate: BuildingDef = {
  id: 'communal-gate',
  name: 'Communal gate-tower',
  style: 'Medieval communal',
  date: '12th to 14th century',
  summary:
    'The self-governing commune outgrew the old Roman circuit and built a longer wall round its new suburbs, with a tall gate-tower on every main road, usually named after the place the road led to or the church nearby. ' +
    'The tower let the guard see far down the road and showed the commune’s pride to every arrival. Its back is left open to the town, so an enemy who took it would have no cover from the defenders inside. ' +
    'At the gate the commune’s officials collected the gabella, the toll on goods coming in to market, and over the arch a painting of the Virgin and saints put the gate under heaven’s protection.',
  materials: ['rubble and squared stone (pietraforte)', 'oak floors and gates', 'fresco on lime plaster', 'clay roof tiles on the customs post'],
  modelledOn: 'The Porta San Niccolò, Florence (1324), and the gate-towers of the communal walls of Florence and Siena',
  lookFor: [
    { label: 'Gate-tower', note: 'A tall square tower over the gate passage, the guard’s lookout and a show of the commune’s power.', at: [-TW / 2 - 0.2, 18, TF + 0.3] },
    { label: 'Fresco of the Virgin', note: 'A painted lunette over the arch putting the gate and the town under the protection of the Virgin and saints.', at: [0, OH + 1.6, TF + 0.3] },
    { label: 'Corbelled parapet', note: 'The battlements are carried out on stone brackets, with holes between them for dropping stones on attackers at the foot of the wall.', at: [TW / 2 + 0.6, TH - 0.6, TF + 0.6] },
    { label: 'Open back', note: 'The tower is open on the town side, its floors and ladders exposed, so it could never be held against the town.', at: [0, 14, TB - 0.3] },
    { label: 'Customs post', note: 'Where officials weighed carts and collected the gabella, the commune’s toll on goods entering the town.', at: [6.8, 3.2, -5.4] },
  ],
  build(b) {
    const { stone, dress } = WALL_COLOURS.communal;
    const shade = tint(stone, -0.1);
    const oak = mix(P.oak, P.oakDark, 0.3);

    road(b, 5.0, mix(P.cobble, P.pietraForte, 0.35));

    // ---------------------------------------------------------------- the curtain wall
    b.sym((s) => curtain(b, 'communal', s > 0 ? TW / 2 : -HALF, s > 0 ? HALF : -TW / 2, { towers: false }));

    // ---------------------------------------------------------------- the tower: front wall
    gateMass(b, TW, TH, FT, stone, { at: [0, 0, TF - FT / 2], xs: [0], openW: OW, openH: OH });
    b.box(TW + 0.5, 1.4, FT + 0.5, shade, { at: [0, 0, TF - FT / 2] });
    // the side walls, running back past the curtain and stopping, open, on the town side
    b.sym((s) => {
      const d = TF - FT - TB;
      b.box(ST, TH, d, stone, { at: [s * (TW / 2 - ST / 2), 0, TB + d / 2] });
      b.box(ST + 0.3, 1.4, d, shade, { at: [s * (TW / 2 - ST / 2), 0, TB + d / 2] });
    });
    // dressed stone quoins at the corners
    for (const sx of [-1, 1]) for (let y = 1.4; y < TH - 1; y += 1.3) {
      b.box(0.9, 0.62, 0.9, dress, { at: [sx * (TW / 2 - 0.4), y, TF - 0.42], jitter: false });
      b.box(0.9, 0.62, 0.9, dress, { at: [sx * (TW / 2 - 0.4), y + 0.65, TB + 0.42], jitter: false });
    }
    // course lines
    for (const y of [10.5, 15, 19.5]) {
      b.box(TW + 0.04, 0.07, FT + 0.04, tint(stone, -0.14), { at: [0, y, TF - FT / 2], jitter: false });
      b.sym((s) => b.box(ST + 0.04, 0.07, TF - TB, tint(stone, -0.14), { at: [s * (TW / 2 - ST / 2), y, (TF + TB) / 2], jitter: false }));
    }

    // the gate arch in dressed stone, and a taller recessed arch framing the painted lunette
    voussoirs(b, OW, OH - OW / 2, 0.7, dress, { at: [0, 0, TF], n: 11, proud: 0.1, vary: 0.03 });
    b.sym((s) => b.box(0.6, OH - OW / 2, 0.16, dress, { at: [s * (OW / 2 + 0.3), 0, TF + 0.05] }));
    voussoirs(b, OW + 1.8, OH + 4.2 - (OW + 1.8) / 2 - 0.4, 0.45, dress, { at: [0, 0, TF], n: 13, proud: 0.12, vary: 0.03 });
    // the fresco: Virgin and Child between two saints on a blue ground
    const lunY = OH + 0.75;
    const lunR = (OW + 1.8) / 2 - 0.05;
    b.group({ at: [0, lunY, TF + 0.04] }, () => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 10; i++) pts.push([lunR * Math.cos((i / 10) * Math.PI), lunR * Math.sin((i / 10) * Math.PI)]);
      b.extrude(pts, 0.04, mix(P.glassDark, P.doorBlue, 0.6), { jitter: false });
      b.box(OW + 1.8, 0.15, 0.06, P.plaster, { at: [0, -0.05, 0], jitter: false });
      // the Virgin, enthroned, in a blue mantle with a gold halo
      b.panel(1.0, 2.1, P.doorBlue, { at: [0, 0.15, 0], depth: 0.04, shape: 'round' });
      b.panel(0.42, 0.42, 0xe0b89a, { at: [0, 2.0, 0.02], depth: 0.04, shape: 'circle' });
      b.panel(0.75, 0.75, P.gold, { at: [0, 1.85, 0.0], depth: 0.03, shape: 'circle' });
      b.panel(0.4, 0.6, P.doorRed, { at: [0.15, 0.9, 0.04], depth: 0.04 }); // the Child
      for (const x of [-1.6, 1.6]) {
        b.panel(0.6, 1.5, x < 0 ? P.doorRed : P.doorGreen, { at: [x, 0.15, 0], depth: 0.04 });
        b.panel(0.48, 0.48, P.gold, { at: [x, 1.6, 0.0], depth: 0.03, shape: 'circle' });
      }
    });
    // the commune's arms on shields either side, high up
    b.sym((s) => {
      b.panel(0.9, 1.1, P.white, { at: [s * 2.6, OH + 6.2, TF], depth: 0.06, shape: 'round' });
      b.panel(0.22, 0.9, P.postRed, { at: [s * 2.6, OH + 6.3, TF + 0.02], depth: 0.06 });
      b.panel(0.75, 0.22, P.postRed, { at: [s * 2.6, OH + 6.75, TF + 0.02], depth: 0.06 });
    });
    // narrow windows up the front
    for (const y of [15.6, 20.2]) archPanel(b, 0.7, 1.6, P.windowDark, { at: [0, y, TF], depth: 0.06 });

    // ---------------------------------------------------------------- the corbelled parapet
    const py = TH - 1.2;
    for (const [len, at, rot] of [
      [TW, [0, TF + 0.35], 0],
      [TF - TB, [TW / 2 + 0.35, (TF + TB) / 2], Math.PI / 2],
      [TF - TB, [-TW / 2 - 0.35, (TF + TB) / 2], Math.PI / 2],
    ] as const) {
      b.group({ at: [at[0], 0, at[1]], rotY: rot }, () => {
        const n = Math.round(len / 0.95);
        for (let i = 0; i < n; i++) {
          const x = -len / 2 + (i + 0.5) * (len / n);
          b.box(0.32, 0.4, 0.7, dress, { at: [x, py - 0.75, 0], jitter: false });
          b.box(0.32, 0.5, 0.5, dress, { at: [x, py - 1.2, -0.1], jitter: false });
        }
        // small arches between the corbels, then the parapet wall
        b.box(len + 0.7, 0.4, 0.8, dress, { at: [0, py - 0.35, 0.05] });
        b.box(len + 0.7, 1.25, 0.45, stone, { at: [0, py + 0.05, 0.22] });
      });
    }
    // square merlons along the top of the parapet
    for (let i = 0; i < 6; i++) b.box(0.95, 1.3, 0.45, stone, { at: [-TW / 2 - 0.1 + (i + 0.5) * ((TW + 0.2) / 6), TH + 0.1, TF + 0.57], jitter: false });
    b.sym((s) => {
      for (let i = 0; i < 5; i++) b.box(0.45, 1.3, 0.95, stone, { at: [s * (TW / 2 + 0.57), TH + 0.1, TB + 0.3 + (i + 0.5) * ((TF - TB - 0.3) / 5)], jitter: false });
    });

    // ---------------------------------------------------------------- inside: the open back, floors and ladders
    const inner = TW - ST * 2;
    const fd = TF - FT - TB;
    for (const y of [OH + 1.4, 13.2, 18.2, 22.6]) {
      b.box(inner, 0.25, fd, oak, { at: [0, y, TB + fd / 2] });
      // joist ends showing on the open side
      for (let x = -inner / 2 + 0.4; x < inner / 2; x += 0.8) b.box(0.18, 0.22, 0.15, tint(oak, -0.1), { at: [x, y - 0.22, TB + 0.08], jitter: false });
    }
    b.box(inner, 0.25, fd, oak, { at: [0, TH - 0.4, TB + fd / 2] });
    b.sym((s) => {
      for (const [y0, y1] of [[OH + 1.65, 13.2], [13.45, 18.2]] as const) {
        b.beam([s * 1.6, y0, TB + 1.4], [s * 1.6, y1, TB + 2.4], 0.5, 0.08, tint(oak, 0.05));
      }
    });
    // the gate leaves, folded back inside the passage
    b.sym((s) => b.box(0.18, OH - 0.8, OW / 2, oak, { at: [s * (OW / 2 - 0.15), 0, TF - FT - OW / 4 - 0.1] }));
    b.box(OW, 0.12, FT + 0.6, tint(P.cobble, -0.06), { at: [0, 0, TF - FT / 2], jitter: false });

    // ---------------------------------------------------------------- the customs post (casotto della gabella)
    b.group({ at: [6.9, 0, -5.6] }, () => {
      b.box(4.4, 3.0, 3.2, P.intonacoCream);
      b.shed(4.9, 3.7, 0.9, P.coppi, { at: [0, 3.0, 0], high: '+z' });
      b.panel(0.9, 2.0, P.oakDark, { at: [1.2, 0, -1.6], facing: '-z' });
      b.window(1.1, 1.0, { at: [-2.2, 1.1, 0], facing: '-x', frame: P.pietraSerena });
      b.window(1.1, 1.0, { at: [-0.6, 1.1, -1.6], facing: '-z', frame: P.pietraSerena });
      // a counter under a lean-to on the road side, with a steelyard for weighing
      b.box(0.5, 1.0, 2.4, P.pietraForte, { at: [-2.55, 0, 0] });
      b.cyl(0.04, 1.0, P.iron, { at: [-2.6, 1.0, 0.8], segs: 4 });
      b.box(0.9, 0.05, 0.05, P.iron, { at: [-2.6, 1.95, 0.8], jitter: false });
    });
    b.tree(7, { kind: 'cypress', at: [-12.5, 0, 6.2] });
    b.tree(4.4, { kind: 'olive', at: [11.6, 0, 5.4] });

    // ---------------------------------------------------------------- walking
    b.sym((s) => {
      b.collider(HALF - TW / 2, WALL_T + 0.6, { at: [s * (HALF + TW / 2) / 2, 0, 0.3] });
      b.collider((TW - OW) / 2, FT + 0.5, { at: [s * (TW + OW) / 4, 0, TF - FT / 2] });
      b.collider(ST + 0.3, TF - FT - TB, { at: [s * (TW / 2 - ST / 2), 0, (TF - FT + TB) / 2] });
    });
    b.collider(5.2, 3.4, { at: [6.7, 0, -5.6] });
  },
};
