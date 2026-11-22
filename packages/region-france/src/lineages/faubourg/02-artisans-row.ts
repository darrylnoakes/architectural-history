import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { heap, patch, tileRoof } from './shared';

const ZF = 5.9; // gable front of the strip houses
const ZB = -4.6; // back wall
const D = ZF - ZB;
const ZC = (ZF + ZB) / 2;
const WALL = 3.1; // eaves height
const SILL = 0.5; // stone sill under the timber frame
const PITCH = 6.5; // one strip house every 6.5 m
const XS = [-9.75, -3.25, 3.25, 9.75];

type Trade = 'potter' | 'bronze' | 'baker' | 'weaver';

/** A pot: a little lathe, cheap. */
function pot(b: Builder, x: number, y: number, z: number, s: number, color: number): void {
  b.lathe([[0.01, 0], [0.12 * s, 0.02], [0.17 * s, 0.14 * s], [0.12 * s, 0.28 * s], [0.08 * s, 0.32 * s], [0.1 * s, 0.35 * s]], color, { at: [x, y, z], segs: 6 });
}

/** A round updraught pottery kiln of clay and brick, with its stoke-hole facing `turn`. */
function kiln(b: Builder, x: number, z: number, turn: number): void {
  b.group({ at: [x, 0, z], rotY: turn }, () => {
    b.cyl(1.0, 1.1, mix(P.cob, P.brickOrange, 0.4), { segs: 10, rTop: 0.95 });
    b.dome(0.95, mix(P.cob, P.brickOrange, 0.25), { at: [0, 1.1, 0], squash: 0.65, segs: 10 });
    b.cyl(0.22, 0.3, P.timberBlack, { at: [0, 1.65, 0], segs: 6 });
    // the stoke-hole and its little sunken working pit
    b.panel(0.55, 0.5, P.timberBlack, { at: [0, 0.05, 0.98], facing: '+z', shape: 'round', depth: 0.05 });
    b.box(1.0, 0.04, 1.0, P.soil, { at: [0, 0, 1.55], jitter: false });
  });
}

/** A domed bread oven on a masonry base, its mouth facing `turn`. */
function oven(b: Builder, x: number, z: number, turn: number): void {
  b.group({ at: [x, 0, z], rotY: turn }, () => {
    b.box(2.0, 0.9, 2.0, P.rubble);
    b.dome(0.9, mix(P.cob, P.romanTile, 0.35), { at: [0, 0.9, 0], squash: 0.7, segs: 10 });
    b.panel(0.5, 0.4, P.timberBlack, { at: [0, 0.92, 1.0], facing: '+z', shape: 'round', depth: 0.04 });
    // a lean-to of tiles over it
    b.box(0.12, 2.0, 0.12, P.oak, { at: [-1.1, 0, 1.2] });
    b.box(0.12, 2.0, 0.12, P.oak, { at: [1.1, 0, 1.2] });
    b.shed(2.6, 2.8, 0.6, P.romanTile, { at: [0, 2.0, 0.1], high: '-z' });
  });
}

export const artisansRow: BuildingDef = {
  id: 'artisans-row',
  name: 'Row of workshop-houses',
  style: 'Gallo-Roman vernacular',
  date: 'c. AD 40',
  summary:
    'Under Rome the town spread out beyond its old rampart, and the roads in were lined with narrow plots, each with a workshop-house standing gable end to the street: a vicus, as such suburbs were called. ' +
    'They were built the Gaulish way, a timber frame filled with cob, but on a footing of mortared stone and under a Roman roof of flat tiles (tegulae) with round cover tiles (imbrices) over the joints. ' +
    'At the front was the shop, open to the street under a shared timber portico; behind it the family lived, and the yard held the kiln, the furnace or the oven. Potters, bronze-workers and bakers were pushed out here because their fires were a danger to the town.',
  materials: ['oak frame', 'cob (torchis)', 'mortared rubble footings', 'fired clay tile', 'gravel street'],
  influences: ['roman-conquest'],
  lookFor: [
    { label: 'Gable to the street', note: 'Each house is a long narrow strip with its short end on the road, so that as many shops as possible share the frontage.', at: [XS[1], 4.2, ZF + 0.2] },
    { label: 'Street portico', note: 'A covered timber walkway along the fronts keeps customers dry and serves as the pavement.', at: [XS[2] + 2.0, 2.6, 7.4] },
    { label: 'Tegulae and imbrices', note: 'Flat flanged tiles with round tiles over the joints: the Roman roof, here laid on a Gaulish timber house.', at: [XS[3], 4.3, 0.5] },
    { label: 'Stone sill', note: 'A low wall of mortared stone keeps the timber frame and the cob off the damp ground, a Roman improvement.', at: [XS[0] - 2.9, 0.3, 2.0] },
    { label: 'Pottery kiln', note: 'A round updraught kiln in the back yard: the fire is fed through the stoke-hole and the pots are stacked in the dome above.', at: [-9.5, 1.9, -6.2] },
  ],
  build(b) {
    const roofCol = b.pick([P.romanTile, tint(P.romanTile, -0.04), P.tileRed]);
    const stone = b.pick([P.rubble, P.pierreBlonde, P.limestone]);
    const oak = P.oak;
    // the trades along the row: the potter always at the left end (his kiln needs the corner yard)
    const rest: Trade[] = b.pick([
      ['bronze', 'baker', 'weaver'],
      ['baker', 'bronze', 'weaver'],
      ['weaver', 'bronze', 'baker'],
    ] as Trade[][]);
    const trades: Trade[] = ['potter', ...rest];

    // the gravel street with a gutter, the yards behind
    patch(b, 25.8, 1.6, mix(P.gravel, P.earth, 0.3), [0, 7.15], 0.06);
    patch(b, 25.8, 0.3, tint(P.paving, -0.1), [0, 6.3], 0.08);
    patch(b, 25.8, 3.3, tint(P.earth, 0.03), [0, -6.3], 0.03);

    XS.forEach((x, i) => {
      const trade = trades[i];
      const w = i === 2 ? 5.3 + b.range(-0.2, 0.3) : 5.6;
      const cob = b.pick([P.torchis, tint(P.torchis, 0.03), P.daub, mix(P.torchis, P.limewash, 0.4)]);
      // footing, walls
      b.box(w + 0.12, SILL, D + 0.12, stone, { at: [x, 0, ZC] });
      b.box(w, WALL - SILL, D, cob, { at: [x, SILL, ZC] });
      // the frame: posts and a middle rail on the long walls, and on the front gable
      for (const s of [-1, 1]) {
        b.frame(D, WALL - SILL, oak, { at: [x + (s * w) / 2, SILL, ZC], facing: s > 0 ? '+x' : '-x', studs: 5, rails: 1, beam: 0.15, depth: 0.05 });
      }
      tileRoof(b, w, D, 24, roofCol, { at: [x, WALL, ZC], ridge: 'z', ov: 0.35, wall: cob, ribs: 0.42 });
      // the open shop front: a wide opening with its shutters taken down, a counter, the goods
      b.box(w, 0.2, 0.2, oak, { at: [x, 2.55, ZF + 0.08] });
      b.panel(w - 1.4, 2.25, tint(P.windowDark, 0.12), { at: [x - 0.2, 0.3, ZF], facing: '+z', depth: 0.03 });
      b.panel(0.9, 2.0, P.oakDark, { at: [x + w / 2 - 0.55, SILL, ZF], facing: '+z', depth: 0.05 });
      b.box(w - 1.6, 0.85, 0.5, tint(oak, 0.05), { at: [x - 0.2, 0, ZF + 0.25] }); // counter
      // the shutter boards stacked beside the opening
      b.box(0.6, 2.0, 0.08, tint(oak, -0.05), { at: [x - w / 2 + 0.45, 0.1, ZF + 0.55], rot: [-0.15, 0, 0] });
      // back: a door to the yard and a small window with a grille
      b.panel(0.9, 1.9, P.oakDark, { at: [x + 1.2, SILL, ZB], facing: '-z', depth: 0.05 });
      b.window(0.6, 0.5, { at: [x - 1.2, 1.8, ZB], facing: '-z', frame: oak, glass: P.windowDark, bars: [3, 1], border: 0.06 });
      // a gable vent under the ridge, front and back (no chimney: the hearth smokes out through it)
      for (const [z, f] of [[ZF, '+z'], [ZB, '-z']] as const) b.panel(0.5, 0.35, P.timberBlack, { at: [x, WALL + 0.35, z], facing: f, depth: 0.04 });

      const cz = ZF + 0.25;
      if (trade === 'potter') {
        for (let k = 0; k < 5; k++) pot(b, x - 2.0 + k * 0.6, 0.85, cz, b.range(0.9, 1.3), b.pick([P.terracottaPainted, P.romanTile, P.brickOrange]));
        kiln(b, x + 0.2, -6.4, Math.PI / 2 + 0.2);
        // a stack of pots waiting to be fired, and a drying rack
        for (let k = 0; k < 6; k++) pot(b, x + 2.0 + (k % 3) * 0.45, k < 3 ? 0 : 0.35, -6.3 + (k % 2) * 0.1, 1.0, mix(P.cob, P.romanTile, 0.3));
        b.box(2.0, 0.08, 0.5, oak, { at: [x - 2.0, 0.9, -5.4] });
        for (let k = 0; k < 4; k++) pot(b, x - 2.7 + k * 0.45, 0.98, -5.4, 0.9, mix(P.cob, P.romanTile, 0.2));
      } else if (trade === 'bronze') {
        // brooches and pans on the counter, a small furnace and bellows in the yard
        for (let k = 0; k < 3; k++) b.cyl(0.18, 0.06, P.bronze, { at: [x - 1.6 + k * 0.7, 0.85, cz], segs: 8 });
        b.box(1.2, 0.8, 1.0, P.rubble, { at: [x - 0.8, 0, -6.2] });
        b.cyl(0.32, 0.1, P.timberBlack, { at: [x - 0.8, 0.8, -6.2], segs: 8 });
        b.cyl(0.13, 0.18, P.brickOrange, { at: [x - 0.8, 0.85, -6.2], segs: 6 }); // the crucible in the coals
        b.blob(0.35, P.oakDark, { at: [x + 0.1, 0.55, -6.2], stretch: [1.3, 0.5, 0.9], detail: 0 }); // bellows
        heap(b, x + 1.7, -6.5, 0.6, P.timberBlack); // charcoal
      } else if (trade === 'baker') {
        for (let k = 0; k < 6; k++) b.sphere(0.14, P.ochreWash, { at: [x - 1.8 + k * 0.5, 0.92, cz], segs: 6 });
        oven(b, x, -6.2, 0);
        // a rotary quern on a block
        b.box(0.7, 0.6, 0.7, stone, { at: [x + 2.0, 0, -5.4] });
        b.cyl(0.32, 0.16, P.granite, { at: [x + 2.0, 0.6, -5.4], segs: 8 });
        b.cyl(0.3, 0.16, P.granite, { at: [x + 2.0, 0.76, -5.4], segs: 8 });
      } else {
        // a weaver: lengths of cloth on the counter, a warp-weighted loom in the yard under a lean-to
        for (let k = 0; k < 3; k++) b.box(0.9, 0.12, 0.4, b.pick([P.limewash, P.ochreWash, P.voletBleu, P.terracottaPainted]), { at: [x - 1.6 + k * 1.0, 0.85, cz] });
        b.group({ at: [x - 0.6, 0, -5.4] }, () => {
          b.beam([-0.9, 0, -0.3], [-0.9, 2.1, 0], 0.08, 0.08, oak);
          b.beam([0.9, 0, -0.3], [0.9, 2.1, 0], 0.08, 0.08, oak);
          b.box(2.0, 0.08, 0.08, oak, { at: [0, 2.05, 0] });
          b.box(1.6, 1.6, 0.02, P.limewash, { at: [0, 0.4, -0.12], rot: [-0.14, 0, 0] });
          for (let k = 0; k < 8; k++) b.cyl(0.06, 0.1, P.cob, { at: [-0.7 + k * 0.2, 0.25, -0.33], segs: 5 }); // loom weights
        });
      }
    });

    // the street portico: posts along the kerb, a beam and a lean-to of tiles back to the fronts
    const L = 25.6;
    const zp = 7.5;
    for (let k = 0; k <= 10; k++) {
      const x = -L / 2 + 0.15 + ((L - 0.3) * k) / 10;
      b.box(0.3, 0.25, 0.3, stone, { at: [x, 0, zp] });
      b.box(0.18, 2.3, 0.18, oak, { at: [x, 0.25, zp] });
    }
    b.box(L, 0.22, 0.22, oak, { at: [0, 2.55, zp] });
    b.group({ at: [0, 2.77, (ZF + zp) / 2 + 0.05] }, () => {
      const run = zp - ZF + 0.5;
      const rise = 0.45;
      b.beam([0, rise / 2 + 0.05, -run / 2], [0, -rise / 2 + 0.05, run / 2], L, 0.1, roofCol);
    });

    // the yard fences between plots and a shared well
    for (let k = 0; k < 3; k++) {
      const x = (XS[k] + XS[k + 1]) / 2;
      b.box(0.1, 1.2, 3.2, P.wattle, { at: [x, 0, -6.4] });
    }
    b.cyl(0.6, 0.7, stone, { at: [XS[2] + (XS[3] - XS[2]) / 2 + 0.9, 0, -7.3], segs: 8 });

    for (const x of XS) b.collider(5.8, D + 0.2, { at: [x, 0, ZC] });
  },
};
