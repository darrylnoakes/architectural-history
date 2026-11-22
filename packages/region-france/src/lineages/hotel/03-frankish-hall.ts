import { P, tint, type BuildingDef } from '@ah/kit';
import { archPts, onFace, palisade, plate, type Pt } from './shared';

export const frankishHall: BuildingDef = {
  id: 'frankish-hall',
  name: 'Frankish noble’s hall',
  style: 'Merovingian',
  date: 'c. 600',
  summary:
    'The town has shrunk inside its late Roman wall, and the great family now lives in a long timber hall within it, where the lord and his armed following eat, drink and sleep. ' +
    'The hall is post-built of oak on a low stone footing under a roof of oak shingles, with a smoke louvre instead of a chimney; the ruins of the Roman town are a quarry close at hand. ' +
    'Beside it stands the family’s own small chapel, built of reused Roman stone and tile with a round apse: a sign of rank in a newly Christian aristocracy.',
  materials: ['oak posts and planks', 'oak shingles', 'reused Roman stone and brick', 'thatch', 'wattle'],
  modelledOn: 'Generic; the hall follows excavated Merovingian and Carolingian elite halls of northern Gaul, and the chapel the small private oratories mentioned by Gregory of Tours',
  lookFor: [
    { label: 'Long hall', note: 'One great room under one roof, where the lord kept his household and feasted his followers.', at: [-1.5, 4.8, -2.8] },
    { label: 'Private chapel', note: 'A little stone church with a round apse, built for the family from Roman stone and tile.', at: [-8.0, 3.6, 7.2] },
    { label: 'Late Roman wall', note: 'The town wall of about 290, small squared stones with bands of red brick, now the back of the yard.', at: [3.5, 3.6, -11.0] },
    { label: 'Smoke louvre', note: 'A little hood on the ridge lets out the smoke of the open hearth: there are no chimneys yet.', at: [-1.5, 7.2, -5.0] },
    { label: 'Sunken hut (fond de cabane)', note: 'A hut over a pit, its roof down to the ground, where the women of the household wove at upright looms.', at: [7.2, 2.4, 3.6] },
  ],
  build(b) {
    const oak = b.pick([P.oak, tint(P.oak, 0.04), tint(P.oak, -0.03)]);
    const shingle = b.pick([P.shingle, tint(P.shingle, -0.05), P.oakSilver]);
    const thatch = b.pick([P.thatch, P.thatchOld]);
    const rstone = P.rubble;

    // ---- the late Roman town wall across the back, its top broken, brick bands showing
    const wz = -11.6;
    const top: Pt[] = [];
    const hs = [5.4, 5.6, 4.9, 5.6, 5.6, 4.3, 5.2, 5.6, 5.6, 4.7, 5.5, 5.0];
    for (let i = 0; i < 12; i++) {
      const x = -12 + i * 2;
      top.push([x, hs[i]], [x + 2, hs[i]]);
    }
    b.extrude([[12, 0], ...top.reverse(), [-12, 0]], 1.6, P.ragstone, { at: [0, 0, wz], jitter: false });
    for (const y of [1.1, 2.3, 3.5]) b.box(24.02, 0.3, 1.62, P.brickRed, { at: [0, y, wz], jitter: false });
    // a base course of big reused blocks
    for (let i = 0; i < 8; i++) b.box(2.8, 0.8, 1.8, i % 2 ? P.limestone : tint(P.limestone, -0.05), { at: [-10.5 + i * 3.0, 0, wz] });
    b.collider(24, 1.8, { at: [0, 0, wz] });

    // ---- palisade round the other three sides, a gate in front
    const X = 11.3;
    const Zf = 11.6;
    palisade(b, -X, Zf, 2.2, Zf, 2.6, oak);
    palisade(b, 5.8, Zf, X, Zf, 2.6, oak);
    palisade(b, -X, wz + 0.8, -X, Zf, 2.6, oak);
    palisade(b, X, wz + 0.8, X, Zf, 2.6, oak);
    b.collider(13.5, 0.4, { at: [(-X + 2.2) / 2, 0, Zf] });
    b.collider(X - 5.8, 0.4, { at: [(X + 5.8) / 2, 0, Zf] });
    for (const s of [-1, 1]) b.collider(0.4, Zf - wz, { at: [s * X, 0, (Zf + wz) / 2] });
    // the gate: two posts, a lintel and a little shingled roof
    for (const x of [2.2, 5.8]) b.box(0.35, 3.4, 0.35, oak, { at: [x, 0, Zf] });
    b.box(4.2, 0.3, 0.5, oak, { at: [4.0, 3.1, Zf] });
    b.gable(4.4, 1.3, 0.7, shingle, { at: [4.0, 3.4, Zf], overhang: 0.15 });
    b.box(0.1, 2.5, 1.6, tint(oak, -0.1), { at: [2.4, 0, Zf - 0.8] });

    // ---- the hall
    const hx = -1.5;
    const hz = -5.0;
    const hw = 15;
    const hd = 7.4;
    const wallH = 3.0;
    b.box(hw + 0.4, 0.4, hd + 0.4, rstone, { at: [hx, 0, hz] });
    b.box(hw, wallH, hd, tint(oak, 0.06), { at: [hx, 0.4, hz] });
    b.collider(hw + 0.4, hd + 0.4, { at: [hx, 0, hz] });
    // posts and plank joints on the long walls
    for (const sz of [-1, 1]) {
      for (let i = 0; i <= 7; i++) b.box(0.3, wallH, 0.12, tint(oak, -0.12), { at: [hx - hw / 2 + 0.15 + (i * (hw - 0.3)) / 7, 0.4, hz + sz * (hd / 2 + 0.04)], jitter: false });
      b.box(hw, 0.18, 0.12, tint(oak, -0.12), { at: [hx, 0.4 + wallH - 0.18, hz + sz * (hd / 2 + 0.05)], jitter: false });
    }
    for (const sx of [-1, 1]) for (let i = 0; i <= 3; i++) b.box(0.12, wallH, 0.3, tint(oak, -0.12), { at: [hx + sx * (hw / 2 + 0.04), 0.4, hz - hd / 2 + 0.15 + (i * (hd - 0.3)) / 3], jitter: false });
    // the shingle roof: steep, hipped, with a smoke louvre on the ridge
    const ry = 0.4 + wallH;
    b.hip(hw, hd, 3.9, shingle, { at: [hx, ry, hz], overhang: 0.6, ridge: hw - 3 });
    b.box(1.2, 0.6, 1.0, tint(oak, -0.15), { at: [hx, ry + 3.6, hz] });
    b.gable(1.6, 1.4, 0.5, shingle, { at: [hx, ry + 4.2, hz], overhang: 0.1 });
    // doors, small shuttered windows, a porch
    onFace(b, '+z', [hx, 0, hz + hd / 2 + 0.06], () => {
      b.box(1.8, 2.4, 0.1, P.oakDark, { at: [0, 0.4, 0] });
      for (const x of [-5.2, -2.8, 2.8, 5.2]) {
        b.box(0.8, 0.6, 0.08, P.windowDark, { at: [x, 2.0, 0] });
        b.box(0.45, 0.65, 0.06, P.oakDark, { at: [x - 0.65, 1.98, 0.06] });
      }
    });
    for (const x of [-1.3, 1.3]) b.box(0.28, 2.8, 0.28, oak, { at: [hx + x, 0, hz + hd / 2 + 1.6] });
    b.gable(3.2, 2.0, 1.0, shingle, { at: [hx, 2.8, hz + hd / 2 + 1.0], ridge: 'z', overhang: 0.15, wall: oak });
    onFace(b, '-z', [hx, 0, hz - hd / 2 - 0.06], () => {
      b.box(1.2, 2.2, 0.1, P.oakDark, { at: [3.0, 0.4, 0] });
      for (const x of [-4, 0]) b.box(0.8, 0.6, 0.08, P.windowDark, { at: [x, 2.0, 0] });
    });

    // ---- the chapel: reused stone, brick bands, a round apse, a tiled roof, a cross on the gable
    const cx = -6.8;
    const cz = 6.4;
    const cw = 6.0; // along X
    const cd = 4.4;
    const ch = 3.9;
    b.box(cw, ch, cd, P.ragstone, { at: [cx, 0, cz] });
    for (const y of [1.0, 2.2]) b.box(cw + 0.02, 0.22, cd + 0.02, P.brickRed, { at: [cx, y, cz], jitter: false });
    b.gable(cw, cd, 1.6, P.romanTile, { at: [cx, ch, cz], overhang: 0.25, wall: P.ragstone });
    // the apse on the -X end (the east, in this little enclosure)
    const ar = 1.7;
    b.lathe([[ar, 0], [ar, ch - 0.6]], P.ragstone, { at: [cx - cw / 2, 0, cz], start: Math.PI, sweep: Math.PI, segs: 8 });
    b.lathe([[ar + 0.2, 0], [ar + 0.2, 0.01], [0.05, 1.3]], P.romanTile, { at: [cx - cw / 2, ch - 0.6, cz], start: Math.PI, sweep: Math.PI, segs: 8 });
    b.box(0.2, ch - 0.6, 2 * ar, P.ragstone, { at: [cx - cw / 2 - 0.05, 0, cz] });
    b.collider(cw + ar, cd, { at: [cx - ar / 2, 0, cz] });
    // door and cross on the west gable (+X), small round-headed windows
    onFace(b, '+x', [cx + cw / 2, 0, cz], () => {
      plate(b, archPts(0, 0, 1.5, 2.6, 'round', 6), 0.08, P.brickRed);
      plate(b, archPts(0, 0, 1.1, 2.3, 'round', 6), 0.12, P.oakDark);
      plate(b, archPts(0, 3.0, 0.4, 0.8, 'round', 4), 0.08, P.windowDark);
    });
    b.box(0.12, 0.9, 0.12, P.limestone, { at: [cx + cw / 2 + 0.05, ch + 1.55, cz] });
    b.box(0.12, 0.12, 0.6, P.limestone, { at: [cx + cw / 2 + 0.05, ch + 2.05, cz] });
    for (const sz of [-1, 1]) {
      onFace(b, sz > 0 ? '+z' : '-z', [cx, 0, cz + sz * (cd / 2)], () => {
        for (const x of [-1.4, 1.4]) plate(b, archPts(x, 2.3, 0.4, 0.9, 'round', 4), 0.08, P.windowDark);
      });
    }

    // ---- the sunken weaving hut: a roof to the ground over a pit
    b.box(4.2, 0.05, 3.2, P.soil, { at: [7.2, 0, 3.6] });
    b.gable(3.6, 4.0, 2.4, thatch, { at: [7.2, 0.0, 3.6], ridge: 'z', overhang: 0.3, thick: 0.35, wall: P.wattle });
    b.box(1.0, 1.3, 0.1, P.oakDark, { at: [7.2, 0, 5.62] });
    b.collider(4.0, 4.2, { at: [7.2, 0, 3.6] });
    // ---- a stable lean-to against the palisade, a well, a woodpile
    b.box(5.0, 2.2, 3.0, tint(oak, 0.05), { at: [8.4, 0, -6.5] });
    b.shed(5.4, 3.4, 1.0, thatch, { at: [8.4, 2.2, -6.5], high: '+x' });
    b.box(4.0, 1.8, 0.1, P.oakDark, { at: [8.4, 0, -4.98] });
    b.collider(5.0, 3.0, { at: [8.4, 0, -6.5] });
    b.cyl(0.7, 0.8, P.rubble, { at: [1.5, 0, 4.5], segs: 8 });
    b.cyl(0.55, 0.82, 0x2a3036, { at: [1.5, 0.0, 4.5], segs: 8 });
    for (const s of [-1, 1]) b.box(0.15, 2.0, 0.15, oak, { at: [1.5 + s * 0.8, 0, 4.5] });
    b.box(1.8, 0.15, 0.15, oak, { at: [1.5, 1.9, 4.5] });
    b.box(2.4, 0.9, 0.8, P.oakDark, { at: [-9.6, 0, -0.2] });
  },
};
