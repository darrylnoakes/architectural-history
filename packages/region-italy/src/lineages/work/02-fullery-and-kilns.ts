import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, amphora, jar, lin, riverWall, roofRise, water } from './shared';

/** Tufa ashlar wall along X (opus quadratum): a box with faint block courses. */
function ashlarX(b: Builder, w: number, h: number, t: number, x: number, z: number, color: number) {
  b.box(w, h, t, color, { at: [x, 0, z] });
  for (let y = 0.6; y < h - 0.1; y += 0.6) {
    for (const s of [1, -1]) b.box(w + 0.02, 0.04, 0.02, tint(color, -0.08), { at: [x, y, z + (s * t) / 2], jitter: false });
  }
}

/** A Roman tiled roof (tegulae and imbrices): a low gable with imbrex ribs down the slopes. */
function romanRoof(b: Builder, w: number, d: number, x: number, y: number, z: number, wall: number, ridge: 'x' | 'z' = 'x') {
  const span = ridge === 'x' ? d : w;
  const h = roofRise(span, 20);
  b.gable(w, d, h, P.romanTile, { at: [x, y, z], ridge, overhang: 0.4, wall, thick: 0.16 });
  const run = ridge === 'x' ? w : d;
  const n = Math.floor(run / 0.9);
  for (let i = 0; i <= n; i++) {
    const p = -run / 2 + (run * i) / n;
    for (const s of [1, -1]) {
      const half = span / 2 + 0.4;
      if (ridge === 'x') b.beam([x + p, y + h + 0.17, z], [x + p, y - 0.15 + 0.15, z + s * half], 0.12, 0.08, tint(P.romanTile, -0.06));
      else b.beam([x, y + h + 0.17, z + p], [x + s * half, y, z + p], 0.08, 0.12, tint(P.romanTile, -0.06));
    }
  }
}

export const fulleryAndKilns: BuildingDef = {
  id: 'fullery-and-kilns',
  name: 'Fullery, potteries and oil press',
  style: 'Roman Republican',
  date: 'c. 250 BC',
  summary:
    'Under Rome the yard becomes a row of workshops in squared tufa, roofed with flat tiles and rounded cover tiles, each trade with its own room on the street and its work yard behind. ' +
    'In the fullery (fullonica), new woollen cloth and dirty clothes were trodden in tubs of water, urine and fuller’s earth, then rinsed in basins fed from the river. ' +
    'The potters fired the glossy black tableware the Republic used everywhere in round kilns fed through a stoke tunnel, and an oil press squeezed olive pulp under a great timber beam. ' +
    'Making things is now a business in a town of streets and contracts, but it is still done by hand, much of it by enslaved workers.',
  materials: ['tufa blocks', 'rubble', 'roof tiles (tegulae and imbrices)', 'timber', 'terracotta'],
  lookFor: [
    { label: 'Treading stalls (saltus fullonici)', note: 'Low walled tubs where workers stood and trampled the cloth in water, urine and fuller’s earth.', at: [-11.5, 1.0, -3.6] },
    { label: 'Black-gloss pottery kiln', note: 'A round firing chamber over a furnace, fed through a stoke tunnel (praefurnium) at ground level.', at: [5.0, 2.4, -6.0] },
    { label: 'Lever press (torcular)', note: 'A long beam held at its heel between two uprights and drawn down at its tip by a rope and capstan squeezes baskets of olive pulp.', at: [12.5, 2.4, 0.2] },
    { label: 'Olive crusher (trapetum)', note: 'Two half-round millstones turned in a stone basin crush the olives without breaking the bitter stones.', at: [8.0, 1.6, -0.8] },
    { label: 'Squared tufa walls (opus quadratum)', note: 'Soft volcanic tufa cut into blocks and laid without mortar, the building stone of Republican Latium and Etruria.', at: [-8, 3.0, 10.0] },
  ],
  influences: ['etruscan-legacy'],
  build(b) {
    const tufa = b.pick([P.tufa, tint(P.tufa, 0.04), P.pietraForte]);
    const plaster = b.pick([P.plaster, P.intonacoCream, P.daub]);
    const timber = P.oak;

    // ---- yard paving and river wall
    b.box(34, 0.06, 15, tint(P.earth, 0.08), { at: [0, 0, -3.5], jitter: false });
    b.box(11.5, 0.06, 6.6, tint(P.earth, 0.08), { at: [11.5, 0, 6.8], jitter: false });
    riverWall(b, -17.6, 17.6, tint(tufa, -0.05), { coping: tufa });

    // ---- the street range: three shops in a row of squared tufa, tiled, with wide openings
    const fz = 6.4;
    const fd = 7.0;
    const fh = 4.2;
    const fw = 22;
    const fx = -5.5;
    const front = fz + fd / 2;
    ashlarX(b, fw, fh, 0.6, fx, front - 0.3, tufa);
    ashlarX(b, fw, fh, 0.6, fx, fz - fd / 2 + 0.3, tufa);
    for (const x of [fx - fw / 2 + 0.3, -5.5, fx + fw / 2 - 0.3]) b.box(0.6, fh, fd, tufa, { at: [x, 0, fz] });
    romanRoof(b, fw, fd, fx, fh, fz, tufa);
    // the oil works opens on the street through a yard wall and gate
    ashlarX(b, 11, 2.4, 0.5, 11.5, front - 0.3, tufa);
    b.panel(3.0, 2.4, P.oakDark, { at: [11, 0, front - 0.04], facing: '+z' });
    b.box(0.5, 2.4, 6.6, tufa, { at: [16.75, 0, fz - 0.3] });
    // shop fronts: wide openings with timber lintels and shutters, one per trade
    for (const x of [-11, 0]) {
      b.panel(3.4, 2.8, P.timberBlack, { at: [x, 0, front], facing: '+z' });
      b.box(3.8, 0.3, 0.2, timber, { at: [x, 2.8, front + 0.08] });
      b.box(0.5, 2.8, 0.12, P.oakDark, { at: [x + 1.2, 0, front + 0.06] }); // a folded shutter
      b.box(3.4, 0.12, 0.6, tufa, { at: [x, 0, front + 0.3] }); // threshold slab with a shutter groove
    }
    // counter in the potter’s shop with stacked wares; cloth on a rail in the fuller’s
    b.box(2.0, 0.9, 0.5, plaster, { at: [0.6, 0, front - 0.7] });
    for (const x of lin(4, -0.1, 1.3)) b.cyl(0.14, 0.12, 0x2a2a2c, { at: [x, 0.9, front - 0.7], rTop: 0.2, segs: 8 });
    b.box(3.0, 0.06, 0.06, timber, { at: [-11, 2.2, front - 0.6] });
    for (const [i, c] of [P.cream, P.doorRed, P.limewash].entries()) b.box(0.7, 1.2, 0.04, c, { at: [-12 + i * 0.9, 1.0, front - 0.6] });
    // painted shop signs
    b.panel(1.4, 0.5, P.cream, { at: [-11, 3.25, front], facing: '+z' });
    b.panel(1.4, 0.5, P.cream, { at: [0, 3.25, front], facing: '+z' });
    // small windows to the yard
    for (const x of [-11, 0]) b.panel(0.6, 0.6, P.timberBlack, { at: [x - 1.8, 2.6, fz - fd / 2], facing: '-z' });
    for (const x of [-11, 0]) b.panel(1.2, 2.2, P.timberBlack, { at: [x + 1.2, 0, fz - fd / 2], facing: '-z' });

    // ---- the fullery yard (left): treading stalls under a lean-to, rinsing basins near the river
    const ux = -11.5;
    b.box(10, 1.4, 0.5, tufa, { at: [ux, 0, -9.6] }); // yard wall toward the river
    b.box(0.5, 1.4, 6.5, tufa, { at: [-16.75, 0, -6.4] });
    for (const x of [ux - 4.75, ux + 4.75]) b.box(0.5, 2.4, 0.5, tufa, { at: [x, 0, -9.6] });
    b.shed(10, 3.4, 0.9, P.romanTile, { at: [ux, 2.4, -7.6], high: '-z' });
    for (const x of lin(4, ux - 4.6, ux + 4.6)) b.cyl(0.14, 2.4, timber, { at: [x, 0, -6.1], segs: 6 });
    b.box(10, 0.16, 0.2, timber, { at: [ux, 2.3, -6.1] });
    // five treading stalls: low walls in a row with a tub in each
    for (const x of lin(5, ux - 3.6, ux + 3.6)) {
      b.box(0.2, 0.9, 1.4, plaster, { at: [x - 0.85, 0, -3.6] });
      b.cyl(0.55, 0.55, P.terracotta, { at: [x, 0, -3.6], rTop: 0.6, segs: 10 });
      water(b, 0.95, 0.95, [x, 0.5, -3.6], 0xc9c39a);
    }
    b.box(9.2, 0.9, 0.2, plaster, { at: [ux, 0, -4.4] });
    // rinsing basins: three connected tanks fed by a channel from the river
    for (const [i, x] of lin(3, ux - 3, ux + 3).entries()) {
      b.box(2.6, 0.7, 2.0, plaster, { at: [x, 0, -8.0] });
      water(b, 2.3, 1.7, [x, 0.62 - i * 0.05, -8.0]);
    }
    b.box(0.6, 0.3, 1.8, plaster, { at: [ux + 4.4, 0, -9.6] });
    // drying poles with cloth and a sulphur-bleaching cage (viminea cavea)
    for (const z of [-1.5]) {
      for (const x of [ux - 4.5, ux + 4.5]) b.box(0.12, 2.2, 0.12, timber, { at: [x, 0, z] });
      b.box(9.2, 0.08, 0.08, timber, { at: [ux, 2.1, z] });
      for (const [i, c] of [P.cream, P.limewash, P.doorRed, P.cream, P.doorBlue].entries()) b.box(1.3, 1.3, 0.04, c, { at: [ux - 3.5 + i * 1.75, 0.8, z] });
    }
    b.cone(0.6, 1.1, P.wattle, { at: [ux - 1.0, 0, 0.5], segs: 8 });

    // ---- the potters’ yard (middle): two round kilns with stoke tunnels, drying shed, sherd heap
    for (const [kx, kz, r] of [
      [5.0, -6.0, 1.6],
      [1.0, -7.0, 1.2],
    ] as const) {
      b.cyl(r + 0.3, 1.6, tint(P.mudbrick, -0.05), { at: [kx, 0, kz], segs: 14 });
      b.dome(r + 0.3, tint(P.mudbrick, -0.12), { at: [kx, 1.6, kz], squash: 0.55, segs: 12 });
      b.cyl(0.25, 0.3, tint(P.mudbrick, -0.25), { at: [kx, 1.6 + (r + 0.3) * 0.55 - 0.08, kz], segs: 8 });
      // the stoke tunnel (praefurnium) sunk in a working pit facing the yard
      b.box(0.9, 0.8, 1.6, tufa, { at: [kx, 0, kz + r + 0.9] });
      b.panel(0.5, 0.55, P.timberBlack, { at: [kx, 0.05, kz + r + 1.71], facing: '+z', shape: 'round' });
      b.box(1.4, 0.05, 1.2, P.soil, { at: [kx, 0.01, kz + r + 2.3], jitter: false });
    }
    // stacks of black-gloss bowls drying and finished
    for (const x of lin(4, -0.5, 3.0)) {
      for (let k = 0; k < 3; k++) b.cyl(0.25 - k * 0.02, 0.12, k === 2 ? P.mudbrick : 0x2a2a2c, { at: [x, 0.06 + k * 0.12, -1.6], rTop: 0.3, segs: 8 });
    }
    b.blob(1.0, tint(P.terracotta, -0.1), { at: [-1.6, 0, -9.3], stretch: [1.4, 0.45, 1] }); // waste heap of sherds
    for (let i = 0; i < 3; i++) amphora(b, [3.0 + i * 0.5, 0.05, -9.6]);

    // ---- the oil press (right): a press room with a lever beam, and a trapetum in the yard
    const ox = 12.5;
    const oz = -3.4;
    ashlarX(b, 8, 3.0, 0.5, ox, oz - 2.4, tufa);
    b.box(0.5, 3.0, 3.3, tufa, { at: [ox + 3.75, 0, oz - 0.8] });
    b.box(0.5, 3.0, 2.0, tufa, { at: [ox - 3.75, 0, oz - 1.3] });
    b.shed(8.4, 3.4, 0.7, P.romanTile, { at: [ox, 3.0, oz - 0.9], high: '-z' });
    for (const x of [ox - 3.75, ox - 1.2, ox + 1.2]) b.cyl(0.16, 3.0, timber, { at: [x, 0, oz + 0.7], segs: 6 });
    b.box(8.0, 0.2, 0.2, timber, { at: [ox, 2.85, oz + 0.7] });
    // the lever (prelum): its heel held between two uprights (arbores) at the back wall, its tip drawn down by a capstan in the yard
    b.sym((s) => b.box(0.3, 2.8, 0.3, P.oakDark, { at: [ox + s * 0.35, 0, oz - 1.9] }));
    b.box(1.0, 0.3, 0.4, P.oakDark, { at: [ox, 2.8, oz - 1.9] });
    b.beam([ox, 1.9, oz - 2.1], [ox, 0.9, oz + 4.2], 0.34, 0.34, P.oakDark);
    b.cyl(0.7, 0.25, P.peperino, { at: [ox, 0, oz - 0.2], segs: 12 }); // press bed
    for (let k = 0; k < 4; k++) b.cyl(0.45, 0.12, P.wattle, { at: [ox, 0.25 + k * 0.13, oz - 0.2], segs: 10 }); // baskets of pulp
    // capstan (sucula) between two posts, its rope to the tip of the lever, and the counterweight stone
    b.box(1.2, 0.7, 0.9, P.peperino, { at: [ox, 0, oz + 4.4] });
    b.sym((s) => b.box(0.16, 1.1, 0.16, P.oak, { at: [ox + s * 0.7, 0, oz + 4.2] }));
    b.log(0.12, 1.6, timber, { at: [ox, 0.75, oz + 4.2] });
    b.beam([ox + 0.2, 0.9, oz + 4.2], [ox + 0.2, 1.6, oz + 4.2], 0.06, 0.06, timber);
    b.beam([ox, 1.0, oz + 4.2], [ox, 0.85, oz + 4.2], 0.05, 0.05, P.wattle);
    // settling jars
    for (const z of [oz - 1.4, oz - 0.2]) jar(b, [ox + 2.7, 0, z], 1.0);
    // trapetum: stone basin with a central pillar, two half-millstones on a wooden axle
    const tx = 8.0;
    const tz = -0.8;
    b.lathe(
      [
        [1.05, 0],
        [1.05, 0.8],
        [0.9, 0.8],
        [0.85, 0.4],
        [0.35, 0.4],
        [0.3, 0.95],
        [0.0, 0.95],
      ],
      P.peperino,
      { at: [tx, 0, tz], segs: 14 },
    );
    b.log(0.06, 2.2, timber, { at: [tx, 1.05, tz] });
    b.sym((s) => b.group({ at: [tx + s * 0.55, 0.42, tz], rot: [0, 0, Math.PI / 2] }, () => b.dome(0.42, P.peperino, { squash: 0.55, segs: 10 })));
    b.beam([tx - 1.1, 1.11, tz], [tx - 2.0, 1.11, tz], 0.08, 0.08, timber);

    // ---- a cypress and an olive by the street front
    b.tree(4.5, { at: [-16.5, 0, 0.5], kind: 'olive' });

    b.collider(fw, fd, { at: [fx, 0, fz] });
    b.collider(10, 3.6, { at: [ux, 0, -8.0] });
    b.collider(8, 3.5, { at: [ox, 0, oz - 0.8] });
    b.collider(4, 4, { at: [5, 0, -6] });
  },
};
