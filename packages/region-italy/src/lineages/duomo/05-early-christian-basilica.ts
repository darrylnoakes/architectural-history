import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { baptistery, framed, precinctPaving, BRICK, SELENITE, ROOF, DOORWOOD, FZ, NW, AW, NAVE_RISE, BAPT, BASILICA } from './shared';

const Z1 = -14; // the apse wall; the nave and aisles run from FZ to here
const NAVE_H = 13;
const AISLE_H = 6.5;
const LEN = FZ - Z1;
const ZC = (FZ + Z1) / 2;
const NZ = FZ + 3.2; // front of the narthex
const AZ = 26.2; // front wall of the forecourt
const AX = 8.5; // forecourt side walls
const DRESS = tint(BRICK, 0.12);

/** The reused columns do not match: white marble, grey granite, green-veined cipollino, yellow giallo antico. */
const SPOLIA = [P.marble, P.granite, mix(P.marbleGreen, P.marble, 0.55), P.marble, mix(P.marbleYellow, P.marble, 0.4), P.granite];

export const earlyChristianBasilica: BuildingDef = {
  id: 'early-christian-basilica',
  name: 'Early Christian basilica',
  style: 'Late Antique (Early Christian)',
  date: 'c. 400',
  summary:
    'After the emperor Theodosius banned pagan sacrifice in 391 and 392 the temple was closed, and within a generation the bishop built his church on the site, on the paving of the temple precinct, using its marble columns and those of other buildings. ' +
    'The plan is the Roman basilica, the hall of law courts and markets: a tall nave lit by big clerestory windows above lower side aisles, and a semicircular apse at the far end for the bishop’s throne and the altar. ' +
    'The outside is plain brick and the roofs are timber and tile; the richness (marble, mosaic, hangings) was all inside. ' +
    'In front lies a colonnaded forecourt (atrium) with a fountain for washing, and beside it an eight-sided baptistery, eight being the number of the Resurrection.',
  materials: ['brick-faced concrete and brick', 'reused marble and granite columns', 'timber roof trusses', 'clay tiles', 'selenite or glass window panes'],
  lookFor: [
    { label: 'Clerestory', note: 'The row of large windows high in the nave walls, above the aisle roofs, flooding the nave with light.', at: [NW + 0.2, 10.4, 2.3] },
    { label: 'Apse', note: 'The half-round end where the bishop sat among his clergy behind the altar.', at: [0, 6.0, Z1 - 5.3] },
    { label: 'Atrium', note: 'A forecourt ringed by colonnades, with a fountain (cantharus) in the middle for washing before entering.', at: [0, 1.2, 20.7] },
    { label: 'Spolia', note: 'Columns taken from older buildings and reused; here, as in many smaller churches, they do not match in colour or stone.', at: [-5.6, 3.0, 19.0] },
    { label: 'Baptistery', note: 'An eight-sided building for baptism, apart from the church: converts were baptised here, usually at Easter, and then led into the church to take communion for the first time.', at: [BAPT.x + 2.4, 5.0, BAPT.z + 2.4] },
  ],
  modelledOn: 'Santa Sabina, Rome (c. 422 to 432), whose 24 reused columns are, unusually, a matching set; the Lateran Baptistery, Rome, for the octagon',
  influences: ['christian-basilica'],
  build(b) {
    // the body: nave and aisles as solid brick blocks on a low plinth
    b.box(AW * 2 + 0.4, 0.3, LEN + 0.2, P.travertine, { at: [0, 0, ZC] });
    b.box(AW * 2, AISLE_H, LEN, BRICK, { at: [0, 0, ZC] });
    b.box(NW * 2, NAVE_H, LEN, BRICK, { at: [0, 0, ZC] });
    b.box(NW * 2 + 0.3, 0.3, LEN + 0.2, tint(BRICK, -0.08), { at: [0, NAVE_H - 0.3, ZC], jitter: false });
    b.box(AW * 2 + 0.3, 0.25, LEN + 0.2, tint(BRICK, -0.08), { at: [0, AISLE_H - 0.25, ZC], jitter: false });
    b.gable(NW * 2, LEN, NAVE_RISE, ROOF, { ridge: 'z', at: [0, NAVE_H, ZC], overhang: 0.35, wall: BRICK });
    b.sym((s) => b.shed(4.6, LEN + 0.3, 1.6, ROOF, { at: [s * 7.6, AISLE_H, ZC], high: s > 0 ? '-x' : '+x' }));

    // eight bays: a big clerestory window and a smaller aisle window in each
    for (let i = 0; i < 8; i++) {
      const z = FZ - (LEN / 8) * (i + 0.5);
      b.sym((s) => {
        const f = s > 0 ? '+x' : '-x';
        framed(b, 'round', 1.8, 3.4, [s * NW, 8.6, z], f, DRESS, SELENITE, 0.14);
        framed(b, 'round', 1.1, 2.0, [s * AW, 2.6, z], f, DRESS, SELENITE, 0.12);
      });
    }

    // the apse with three windows and a half-cone roof
    const ar = 5.0;
    const ah = 9.2;
    const half = { start: Math.PI / 2, sweep: Math.PI, segs: 9 };
    b.lathe([[ar + 0.25, 0], [ar + 0.25, 0.3], [ar, 0.3], [ar, ah]], BRICK, { ...half, at: [0, 0, Z1] });
    b.lathe([[ar + 0.15, ah - 0.25], [ar + 0.15, ah]], tint(BRICK, -0.08), { ...half, at: [0, 0, Z1] });
    b.lathe([[ar + 0.45, ah - 0.1], [0, ah + 2.0]], ROOF, { ...half, at: [0, 0, Z1] });
    const ap = ar * Math.cos(Math.PI / 18);
    for (const k of [2, 4, 6]) {
      const phi = Math.PI / 2 + ((k + 0.5) * Math.PI) / 9;
      framed(b, 'round', 1.0, 2.8, [ap * Math.sin(phi), 4.2, Z1 + ap * Math.cos(phi)], phi, DRESS, SELENITE, 0.12);
    }
    // the aisles end in flat walls either side of the apse
    b.sym((s) => framed(b, 'round', 0.9, 1.8, [s * 7.5, 2.8, Z1], '-z', DRESS, SELENITE, 0.12));

    // the entrance wall: three windows above the narthex roof
    for (const x of [-3.0, 0, 3.0]) framed(b, 'round', 1.5, 3.2, [x, 7.4, FZ], '+z', DRESS, SELENITE, 0.14);

    // the narthex: a porch across the front, on reused columns
    b.shed(AW * 2 + 0.4, 3.6, 1.2, ROOF, { at: [0, 5.2, FZ + 1.7], high: '-z' });
    b.box(AW * 2 + 0.2, 0.7, 0.6, BRICK, { at: [0, 4.5, NZ - 0.3] });
    b.sym((s) => b.box(0.6, 4.5, 3.2, BRICK, { at: [s * (AW - 0.2), 0, FZ + 1.6] }));
    const nx = [-6.6, -4.0, -1.35, 1.35, 4.0, 6.6];
    nx.forEach((x, i) => b.column(0.26, 4.2, SPOLIA[i % SPOLIA.length], { at: [x, 0.3, NZ - 0.3], order: 'corinthian', segs: 7 }));
    b.box(AW * 2, 0.3, 3.2, P.travertine, { at: [0, 0, FZ + 1.6] });
    // doors in the entrance wall: carved wooden doors, as the cypress doors at Santa Sabina
    b.box(2.4, 4.0, 0.1, DOORWOOD, { at: [0, 0.3, FZ + 0.05], jitter: false });
    b.box(2.9, 4.3, 0.06, P.marble, { at: [0, 0.3, FZ + 0.02], jitter: false });
    b.sym((s) => b.box(1.4, 3.0, 0.1, DOORWOOD, { at: [s * 3.6, 0.3, FZ + 0.05], jitter: false }));

    // the atrium: brick walls, colonnades on three sides with lean-to roofs, a fountain in the middle
    const az0 = NZ;
    const alen = AZ - az0;
    b.sym((s) => {
      b.box(0.6, 4.4, alen + 0.3, BRICK, { at: [s * AX, 0, az0 + alen / 2] });
      b.shed(3.6, alen - 0.2, 1.0, ROOF, { at: [s * (AX - 1.6), 4.4, az0 + alen / 2 - 0.1], high: s > 0 ? '+x' : '-x' });
      b.box(0.45, 0.4, alen - 3.1, tint(BRICK, -0.05), { at: [s * 5.6, 4.0, az0 + (alen - 3.1) / 2] });
    });
    [17.4, 20.0].forEach((z, i) => b.sym((s) => b.column(0.24, 4.0, SPOLIA[(i * 2 + (s > 0 ? 1 : 0) + 2) % SPOLIA.length], { at: [s * 5.6, 0, z], order: 'corinthian', segs: 7 })));
    // the front range, with the gateway in the middle
    b.sym((s) => b.box(AX - 1.6, 4.4, 0.6, BRICK, { at: [s * (AX + 1.6) / 2, 0, AZ] }));
    b.box(3.2, 1.2, 0.6, BRICK, { at: [0, 3.2, AZ] });
    b.gable(4.0, 1.4, 0.9, ROOF, { at: [0, 4.4, AZ], overhang: 0.2, wall: BRICK });
    b.shed(AX * 2 - 0.6, 3.2, 1.0, ROOF, { at: [0, 4.4, AZ - 1.6], high: '+z' });
    b.box(AX * 2 - 1.0, 0.4, 0.45, tint(BRICK, -0.05), { at: [0, 4.0, AZ - 3.1] });
    [-3.9, -1.3, 1.3, 3.9].forEach((x, i) => b.column(0.24, 4.0, SPOLIA[(i + 3) % SPOLIA.length], { at: [x, 0, AZ - 3.1], order: 'corinthian', segs: 7 }));
    b.sym((s) => b.column(0.24, 4.0, SPOLIA[s > 0 ? 0 : 1], { at: [s * 5.6, 0, AZ - 3.1], order: 'corinthian', segs: 7 }));
    // the cantharus fountain
    const fz = az0 + 4.6;
    b.cyl(1.3, 0.55, P.marble, { at: [0, 0, fz], segs: 10 });
    b.cyl(1.1, 0.05, P.water, { at: [0, 0.5, fz], segs: 10, mat: 'glass', jitter: false });
    b.cyl(0.18, 1.1, P.marble, { at: [0, 0.5, fz], segs: 6 });
    b.cone(0.38, 0.75, P.bronze, { at: [0, 1.55, fz], segs: 7 });

    baptistery(b, BASILICA);

    // it all stands on the paving of the old temple precinct; around it, a few cypresses
    precinctPaving(b);
    b.tree(9, { at: [13.0, 0, -6], kind: 'cypress' });
    b.tree(8.5, { at: [13.0, 0, -11], kind: 'cypress' });
    b.tree(6, { at: [-13.5, 0, -20], kind: 'olive' });

    b.collider(AW * 2, LEN + 3.2, { at: [0, 0, ZC + 1.6] });
    b.collider(ar * 2, ar, { at: [0, 0, Z1 - ar / 2] });
    b.sym((s) => b.collider(0.8, alen, { at: [s * AX, 0, az0 + alen / 2] }));
    b.sym((s) => b.collider(AX - 1.6, 0.8, { at: [s * (AX + 1.6) / 2, 0, AZ] }));
    b.collider(7, 7, { at: [BAPT.x, 0, BAPT.z] });
  },
};
