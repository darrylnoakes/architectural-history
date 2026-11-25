import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { cart, dormer, ground, horse, innPavement, innStables, innWell, shutteredWindow, word } from './shared';

const XO = 10.2;
const ZF = 9.6; // street face
const ZFI = 3.8; // yard face of the front range
const G = 3.4;
const F1 = 3.0;
const TOP = G + F1;
const AW = 3.8; // carriage gate
const AH = 3.9;
// stables down the west side, coach houses down the east, a barn across the back
const XW = -5.2; // yard face of the stables
const XE = 5.4; // yard face of the coach houses
const ZBI = -5.6; // yard face of the barn
const ZB = -10.2;
const SH = 3.4;

/** Stone quoins: alternate long and short blocks up a brick corner, on two faces. */
function quoins(b: Builder, x: number, z: number, sx: 1 | -1, sz: 1 | -1, h: number, stone: number): void {
  for (let y = 0.6, i = 0; y < h - 0.3; y += 0.55, i++) {
    const w = i % 2 ? 0.45 : 0.8;
    b.box(w, 0.5, 0.06, stone, { at: [x - sx * w / 2, y, z + sz * 0.03], jitter: false });
    b.box(0.06, 0.5, i % 2 ? 0.8 : 0.45, stone, { at: [x + sx * 0.03, y, z - sz * (i % 2 ? 0.4 : 0.225)], jitter: false });
  }
}

/** A coach horse-drawn carriage of the late seventeenth century, facing local +Z. */
function coach(b: Builder, at: [number, number, number], rotY: number): void {
  b.group({ at, rotY }, () => {
    b.box(1.5, 1.4, 2.1, P.doorGreen, { at: [0, 1.0, 0] });
    b.box(1.6, 0.12, 2.2, P.black, { at: [0, 2.4, 0] });
    b.sym((s) => b.window(0.8, 0.6, { at: [s * 0.76, 1.5, 0], facing: s > 0 ? '+x' : '-x', frame: P.gold, border: 0.05 }));
    b.box(1.2, 0.12, 0.9, P.black, { at: [0, 1.35, 1.5] });
    b.box(0.1, 0.1, 4.4, P.oakDark, { at: [0, 0.6, 0.6] });
    b.sym((s) => {
      b.log(0.65, 0.08, P.oakDark, { at: [s * 0.85, 0, -0.75], segs: 10 });
      b.log(0.45, 0.08, P.oakDark, { at: [s * 0.85, 0, 0.9], segs: 10 });
    });
  });
}

export const relaisDePoste: BuildingDef = {
  id: 'relais-de-poste',
  name: 'Relais de poste (posting inn)',
  style: 'Louis XIV, brick and stone',
  date: 'c. 1690',
  summary:
    'The king’s posts, begun for royal messengers in the later fifteenth century, are by now open to anyone who can pay. Along each main road stands a relay every few leagues, run by a postmaster (maître de poste) holding the king’s commission, who must keep horses ready day and night for couriers and for travellers riding post; many, like this one, also keep an inn. ' +
    'The building is northern classical: red brick with stone quoins and bands, tall windows of small panes, a steep tiled roof with dormers, and a carriage gate wide enough for a coach. ' +
    'It is the old inn of 1380 rebuilt rather than a new one: the jettied timber street range, out of fashion and long discouraged by town ordinances for fear of fire, is replaced by this brick front, but the medieval stone stables across the back of the yard and the well are kept. ' +
    'Round the yard is a horse factory: a new range of stables for dozens of post horses, coach houses, the old stables and their loft for hay and oats, a trough, a dung heap, and a dovecote, a right tied to lordship and land (the droit de colombier) that the Revolution abolished in August 1789.',
  materials: ['red brick', 'limestone dressings', 'flat clay tiles', 'oak', 'wrought iron'],
  lookFor: [
    { label: 'Carriage gate', note: 'The porte charretière: a broad arch with a keystone, its oak leaves folded back by day so coaches could swing straight in off the road.', at: [0, AH + 0.4, ZF + 0.3] },
    { label: 'Brick and stone', note: 'Red brick walls dressed with pale stone at the corners, round the openings and in bands: the cheap, handsome manner of northern France under Henri IV and Louis XIII, still current here.', at: [-XO + 0.3, G + 1.6, ZF + 0.2] },
    { label: 'Stables', note: 'A new long range of stalls for the post horses down the west side, besides the medieval stone stables kept across the back, with hay pitched up through doors in the roofs to the lofts.', at: [XW + 0.2, 2.0, -1.0] },
    { label: 'Coach houses', note: 'Remises with wide arched doors, where travellers’ carriages stood overnight and the postmaster kept his own chaises for hire.', at: [XE - 0.2, 2.4, 1.0] },
    { label: 'Dovecote', note: 'A square brick tower for pigeons, kept for meat and for their droppings as manure. Owning one was a mark of rank before 1789.', at: [-7.8, 6.4, -6.6] },
  ],
  revisions: [
    { year: 1873, note: 'The railways had taken the traffic of the roads, and in 1873 the state ended the post-horse service. The house carried on as a hotel, and its sign was repainted HOTEL DE LA POSTE, the name of so many old posting inns in France today.' },
    { year: 1930, note: 'The motor car brought travellers back to the road: the stables and coach houses became garages, the dung heap went, and a petrol pump was set up at the gate, as at many country hotels between the wars.' },
  ],
  build(b) {
    const brick = b.pick([P.briqueNord, tint(P.briqueNord, -0.04), P.brickRed]);
    const stone = b.pick([P.pierreBlonde, P.craie]);
    const tile = b.pick([P.tuilePlate, tint(P.tuilePlate, -0.05)]);
    const shutter = b.pick([P.voletGris, P.voletVert, P.oak]);
    const wood = P.oakDark;

    innPavement(b);
    ground(b, XE - XW, ZFI - ZBI, tint(P.cobble, 0.06), [(XE + XW) / 2, (ZFI + ZBI) / 2], 0.04);

    // ---------------- the front range on the royal road
    const fz = (ZF + ZFI) / 2;
    const fd = ZF - ZFI;
    const fw = XO - AW / 2;
    b.sym((s) => b.box(fw, G, fd, brick, { at: [s * (AW / 2 + fw / 2), 0, fz] }));
    b.box(2 * XO, F1, fd, brick, { at: [0, G, fz] });
    b.box(AW, G - AH, fd, brick, { at: [0, AH, fz] });
    b.box(AW, 0.06, fd, P.cobble, { at: [0, 0, fz], jitter: false });
    b.box(2 * XO + 0.06, 0.6, fd + 0.06, stone, { at: [0, 0, fz] });
    b.box(2 * XO + 0.08, 0.22, fd + 0.08, stone, { at: [0, G - 0.1, fz] });
    b.box(2 * XO + 0.3, 0.3, fd + 0.3, stone, { at: [0, TOP - 0.3, fz] });
    b.sym((s) => quoins(b, s * XO, ZF, s, 1, TOP, stone));
    // the gate: a segmental arch in stone with a keystone, at both faces
    for (const [z, f] of [[ZF, '+z'], [ZFI, '-z']] as const) {
      b.archWall(AW + 1.0, AH + 0.6, 0.22, stone, { at: [0, 0, z + (f === '+z' ? 0.11 : -0.11)], facing: f, openings: 1, openW: AW, openH: AH, shape: 'segmental' });
    }
    b.panel(0.55, 0.75, stone, { at: [0, AH - 0.15, ZF + 0.22], facing: '+z', depth: 0.1 });
    b.sym((s) => {
      b.box(0.1, AH - 0.6, AW / 2, wood, { at: [s * (AW / 2 - 0.08), 0, ZF - 1.1] });
      b.box(0.04, AH - 0.8, AW / 2 - 0.2, tint(wood, 0.08), { at: [s * (AW / 2 - 0.15), 0.1, ZF - 1.1] });
    });
    // stone kerbs to guard the gate jambs from wheel hubs
    b.sym((s) => b.cyl(0.25, 0.8, stone, { at: [s * (AW / 2 + 0.4), 0, ZF + 0.35], segs: 6, rTop: 0.15 }));
    // windows: tall casements of small panes with plank shutters, in stone surrounds
    const xs = [-8.2, -5.4, 5.4, 8.2];
    for (const x of xs) {
      shutteredWindow(b, 1.1, 2.0, { at: [x, 0.95, ZF], facing: '+z', frame: P.white, shutter, surround: stone, bars: [2, 4] });
      shutteredWindow(b, 1.1, 2.0, { at: [x, G + 0.55, ZF], facing: '+z', frame: P.white, shutter, surround: stone, bars: [2, 4] });
      shutteredWindow(b, 1.0, 1.8, { at: [x, G + 0.65, ZFI], facing: '-z', frame: P.white, shutter, surround: stone, bars: [2, 4] });
    }
    // the inn door and the postmaster’s door in the yard
    b.panel(1.3, 2.6, wood, { at: [-3.0, 0.05, ZF], facing: '+z' });
    b.panel(1.7, 2.85, stone, { at: [-3.0, 0.05, ZF], facing: '+z', depth: 0.04 });
    b.stairs(1.8, 0.3, 0.5, 2, stone, { at: [-3.0, 0, ZF + 0.3] });
    for (const x of [-6.8, 6.8]) b.panel(1.1, 2.3, wood, { at: [x, 0, ZFI], facing: '-z' });
    // the steep tiled roof with dormers, a chimney at each end
    const rise = (fd / 2) * 1.15;
    b.gable(2 * XO, fd, rise, tile, { at: [0, TOP, fz], overhang: 0.4, wall: brick });
    for (const x of [-6.8, -2.8, 2.8, 6.8]) dormer(b, 1.0, 1.35, tile, stone, { at: [x, TOP - 0.1, ZF - 0.5], facing: '+z', back: 1.4, rise: 0.75, frame: P.white, bars: [2, 2] });
    b.sym((s) => b.chimney(1.0, rise + 1.3, 0.7, brick, { at: [s * (XO - 1.0), TOP + 0.5, fz] }));

    // ---------------- the stables down the west side
    const sl = ZFI - ZBI;
    const sz = (ZFI + ZBI) / 2;
    const sw = XW + XO;
    b.box(sw, SH, sl, brick, { at: [(XW - XO) / 2, 0, sz] });
    b.box(sw + 0.06, 0.5, sl + 0.06, stone, { at: [(XW - XO) / 2, 0, sz] });
    for (const z of spread(4, ZBI + 0.8, ZFI - 0.9)) {
      b.panel(1.3, 2.4, wood, { at: [XW, 0, z], facing: '+x', shape: 'segmental' });
      b.panel(1.6, 2.65, stone, { at: [XW, 0, z], facing: '+x', shape: 'segmental', depth: 0.04 });
      b.panel(0.6, 0.6, P.windowDark, { at: [-XO, 2.0, z], facing: '-x' });
    }
    for (const z of [-2.0, 1.8]) {
      dormer(b, 1.2, 1.3, tile, brick, { at: [XW + 0.1, SH - 0.1, z], facing: '+x', back: 1.4, rise: 0.8, frame: wood, glass: P.timberBlack });
    }
    b.gable(sw, sl, (sw / 2) * 1.1, tile, { at: [(XW - XO) / 2, SH, sz], ridge: 'z', overhang: 0.35, wall: brick });

    // ---------------- the coach houses down the east side
    const cw = XO - XE;
    const cl = ZFI - ZBI;
    const cz = (ZFI + ZBI) / 2;
    b.box(cw, SH + 0.4, cl, brick, { at: [(XE + XO) / 2, 0, cz] });
    b.box(cw + 0.06, 0.5, cl + 0.06, stone, { at: [(XE + XO) / 2, 0, cz] });
    for (const z of spread(3, ZBI + 1.6, ZFI - 1.6)) {
      b.panel(2.4, 3.0, wood, { at: [XE, 0, z], facing: '-x', shape: 'segmental' });
      b.panel(0.06, 2.9, P.timberBlack, { at: [XE, 0, z], facing: '-x', depth: 0.09 });
      b.panel(2.8, 3.3, stone, { at: [XE, 0, z], facing: '-x', shape: 'segmental', depth: 0.04 });
      b.panel(0.6, 0.6, P.windowDark, { at: [XO, 2.3, z], facing: '+x' });
    }
    b.gable(cw, cl, (cw / 2) * 1.1, tile, { at: [(XE + XO) / 2, SH + 0.4, cz], ridge: 'z', overhang: 0.35, wall: brick });

    // ---------------- the old inn's stone stables across the back, kept as stables and hayloft;
    // the dovecote tower in the corner beside them
    innStables(b, stone, wood, tile);
    innWell(b, stone, wood);
    b.group({ at: [-7.8, 0, -7.8] }, () => {
      const dh = 7.6;
      b.box(3.4, dh, 3.4, brick);
      b.box(3.5, 0.6, 3.5, stone);
      b.box(3.6, 0.25, 3.6, stone, { at: [0, 4.6, 0] }); // the rat ledge, which stopped rats climbing to the holes
      b.box(3.7, 0.25, 3.7, stone, { at: [0, dh - 0.25, 0] });
      for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.box(0.5, dh - 0.6, 0.5, stone, { at: [x * 1.55, 0.6, z * 1.55] });
      b.panel(0.9, 2.0, wood, { at: [0, 0, 1.7], facing: '+z' });
      for (const f of ['+z', '+x', '-x', '-z'] as const) {
        const a = { '+z': [0, 1.7], '-z': [0, -1.7], '+x': [1.7, 0], '-x': [-1.7, 0] }[f];
        for (const d of [-0.5, 0, 0.5]) {
          const off = f === '+z' || f === '-z' ? [d, 0] : [0, d];
          b.panel(0.18, 0.25, P.timberBlack, { at: [a[0] + off[0], 5.4, a[1] + off[1]], facing: f, shape: 'round' });
        }
      }
      b.pyramid(3.7, 3.7, 3.0, tile, { at: [0, dh, 0], overhang: 0.25 });
      b.box(0.9, 0.8, 0.9, wood, { at: [0, dh + 2.4, 0] });
      b.pyramid(1.2, 1.2, 0.8, tile, { at: [0, dh + 3.2, 0] });
      b.cyl(0.03, 0.8, P.iron, { at: [0, dh + 4.0, 0], segs: 4 });
    });

    // ---------------- in the yard: a trough, and until the motor age a dung heap, the coach and the post horses
    b.box(3.0, 0.75, 0.9, stone, { at: [-2.6, 0, ZBI + 1.2] });
    b.box(2.8, 0.04, 0.7, P.water, { at: [-2.6, 0.73, ZBI + 1.2], mat: 'glass', jitter: false });
    b.cyl(0.18, 1.4, P.iron, { at: [-4.2, 0, ZBI + 1.2], segs: 6 });

    // ---------------- colliders: one per range; the gate passage and the yard stay open
    b.sym((s) => b.collider(fw, fd, { at: [s * (AW / 2 + fw / 2), 0, fz] }));
    b.collider(sw, sl, { at: [(XW - XO) / 2, 0, sz] });
    b.collider(cw, cl, { at: [(XE + XO) / 2, 0, cz] });
    b.collider(3.5, 3.5, { at: [-7.8, 0, -7.8] });

    // ---------------- what the revisions change, built last
    // the sign: the post-horse service until 1873, a hotel after it
    b.panel(5.6, 0.75, P.cream, { at: [0, TOP - 1.55, ZF], facing: '+z', depth: 0.04, jitter: false });
    word(b, b.since(1873) ? 'HOTEL DE LA POSTE' : 'POSTE AUX CHEVAUX', 0.075, P.doorBlue, { at: [0, TOP - 1.42, ZF + 0.05], facing: '+z', depth: 0.03 });
    if (!b.since(1930)) {
      b.blob(1.3, 0x6a5a3c, { at: [3.4, 0, ZBI + 1.4], stretch: [1.3, 0.45, 1.0], detail: 0, jitter: false });
      coach(b, [1.4, 0, 0.4], 0.35);
      horse(b, [-1.0, 0, 2.6], 1.6, 0x6b4a32);
      horse(b, [-3.0, 0, -1.6], -1.3, 0x3d2c22);
      horse(b, [-1.0, 0, -2.6], 2.8, 0x8a6a4a);
      cart(b, [3.6, 0, 2.4], -1.4, P.oak);
    } else {
      // a petrol pump at the gate; the coach and the post horses are gone
      b.group({ at: [3.4, 0.1, 10.5] }, () => {
        b.box(0.5, 0.15, 0.5, P.concrete, { jitter: false });
        b.cyl(0.2, 1.9, P.doorRed, { at: [0, 0.15, 0], segs: 8, jitter: false });
        b.sphere(0.22, P.white, { at: [0, 2.3, 0], segs: 8, jitter: false });
        b.beam([0.2, 1.4, 0], [0.35, 0.9, 0.1], 0.04, 0.04, P.timberBlack, { jitter: false });
      });
      b.collider(0.5, 0.5, { at: [3.4, 0, 10.5] });
    }
  },
};
