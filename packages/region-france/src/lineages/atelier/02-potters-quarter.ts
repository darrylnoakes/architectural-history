import { P, tint, type BuildingDef, type Builder, type Vec3 } from '@ah/kit';
import { boat, heap, lin, rise, riverWall, water } from './shared';

const SAMIAN = 0xb4553a; // the glossy red of terra sigillata
const GREEN = 0xc9b48e; // unfired, leather-hard clay

/** A Gallo-Roman tiled roof (tegulae and imbrices) at about 24 degrees. */
function tileRoof(b: Builder, w: number, d: number, at: Vec3, wall?: number) {
  b.gable(w, d, rise(d, 24), P.romanTile, { at, overhang: 0.5, wall, thick: 0.18 });
  // the cover tiles (imbrices) as ribs down the slopes, a few of them
  const h = rise(d, 24);
  for (const x of lin(Math.round(w / 1.5), -w / 2 + 0.4, w / 2 - 0.4)) {
    for (const s of [-1, 1]) b.beam([at[0] + x, at[1] + 0.12 - 0.15, at[2] + s * (d / 2 + 0.4)], [at[0] + x, at[1] + h + 0.12, at[2]], 0.12, 0.08, tint(P.romanTile, -0.06), { jitter: false });
  }
  b.box(w + 1, 0.16, 0.24, tint(P.romanTile, -0.08), { at: [at[0], at[1] + h + 0.1, at[2]] });
}

/** A stack of red bowls and plates: a squat column of discs. */
function potStack(b: Builder, at: Vec3, n: number, color = SAMIAN) {
  for (let i = 0; i < n; i++) b.cyl(0.2, 0.09, color, { at: [at[0], at[1] + i * 0.09, at[2]], rTop: 0.24, segs: 6, jitter: i === 0 });
}

/** A round updraught kiln: a firing chamber of clay and brick, its stoke-hole tunnel toward `dir`. */
function kiln(b: Builder, at: Vec3, r: number, h: number, open: boolean, dir: 1 | -1, brick: number) {
  const [x, , z] = at;
  // the earth bank packed round the lower part of the kiln to hold the heat
  b.cyl(r + 1.3, 0.9, tint(P.earth, -0.04), { at: [x, 0, z], rTop: r + 0.4, segs: 12 });
  if (open) {
    // an open ring wall, so the ware inside can be seen
    b.lathe([[r - 0.2, 0], [r + 0.25, 0], [r + 0.1, h], [r - 0.2, h], [r - 0.2, 0]], brick, { at: [x, 0, z], segs: 12 });
    b.cyl(r - 0.2, h - 0.9, tint(brick, -0.1), { at: [x, 0, z], segs: 12 });
    // being loaded: the top open, the ware stacked inside on the perforated floor
    b.cyl(r - 0.1, 0.05, P.timberBlack, { at: [x, h - 0.9, z], segs: 12, jitter: false });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      b.cyl(0.24, 0.6, GREEN, { at: [x + Math.cos(a) * r * 0.55, h - 0.85, z + Math.sin(a) * r * 0.55], segs: 6 });
    }
    b.cyl(0.24, 0.7, GREEN, { at: [x, h - 0.85, z], segs: 6 });
    // a ladder for the loaders
    b.beam([x + r + 0.9, 0, z + 0.6], [x + r + 0.1, h + 0.4, z + 0.6], 0.08, 0.08, P.oak);
    b.beam([x + r + 0.9, 0, z - 0.1], [x + r + 0.1, h + 0.4, z - 0.1], 0.08, 0.08, P.oak);
  } else {
    b.cyl(r + 0.25, h, brick, { at: [x, 0, z], rTop: r + 0.1, segs: 12 });
    // fired: a temporary dome of clay and broken pots, with a vent at the top
    b.dome(r + 0.1, tint(brick, 0.06), { at: [x, h, z], squash: 0.6, segs: 12 });
    b.cyl(0.35, 0.4, tint(brick, -0.1), { at: [x, h + (r + 0.1) * 0.6 - 0.15, z], segs: 8 });
  }
  // the stoke-hole (praefurnium): an arched tunnel to a sunken stoking pit
  b.box(1.4, 1.3, 2.2, tint(brick, -0.05), { at: [x, 0, z + dir * (r + 1.0)] });
  b.panel(0.8, 1.0, P.timberBlack, { at: [x, 0, z + dir * (r + 2.1)], facing: dir > 0 ? '+z' : '-z', shape: 'round' });
  b.box(2.0, 0.04, 1.8, tint(P.soil, -0.06), { at: [x, 0, z + dir * (r + 3.0)], jitter: false });
}

export const pottersQuarter: BuildingDef = {
  id: 'potters-quarter',
  name: 'Potteries',
  style: 'Gallo-Roman',
  date: 'c. AD 60 to 270',
  summary:
    'Under Roman rule the riverside becomes a potters’ quarter. Gaulish workshops at La Graufesenque in the south and Lezoux in the Auvergne learned to make the glossy red tableware of Italy, terra sigillata, and sold it across the empire by the million; smaller towns of the north, such as this one, made the everyday grey and cream wares and their own copies of the red. ' +
    'The potters throw on kick wheels in an open-fronted workshop, dry the ware on shelves under long tiled sheds, and fire it in big round kilns built half into the ground, stoked through a tunnel from a pit. ' +
    'Everything is new to the region: fired tile on the roofs, mortared stone, and a stone quay where crates of pots packed in straw are loaded onto river boats.',
  materials: ['fired brick and clay', 'tegula and imbrex roof tiles', 'timber frame and cob', 'limestone rubble'],
  modelledOn: 'The potters’ quarters of La Graufesenque (Millau) and Lezoux (Puy-de-Dôme), where excavations have found the kilns, drying sheds and great dumps of broken ware; the layout here is generic',
  lookFor: [
    { label: 'Round kilns', note: 'The ware was stacked in a round chamber over a perforated floor, sealed under a temporary dome and fired for days.', at: [-2.0, 4.4, -3.5] },
    { label: 'Stoke-hole and pit', note: 'The fire was fed with wood through an arched tunnel from a sunken pit beside each kiln.', at: [-2.0, 1.4, 0.2] },
    { label: 'Drying sheds', note: 'New pots dried slowly on shelves in the shade for days before firing, or they would crack in the kiln.', at: [10.5, 3.0, -2.0] },
    { label: 'Red tableware', note: 'Terra sigillata, the glossy red ware of the Roman table, here stacked in crates for shipping.', at: [5.0, 1.4, -9.4] },
    { label: 'Stone quay', note: 'A mortared stone quay along the river, where boats took the crates downstream.', at: [-8.0, 0.6, -11.2] },
  ],
  influences: ['roman-conquest'],
  build(b) {
    const brick = b.pick([P.romanTile, tint(P.brickOrange, -0.04), P.terracotta]);
    const stone = P.limestone;
    const cob = b.pick([P.torchis, P.cob]);
    const timber = P.oak;

    b.box(35, 0.04, 21.6, tint(P.gravel, -0.04), { at: [0, 0, 0], jitter: false });
    riverWall(b, -17.6, 17.6, tint(stone, -0.06), { coping: stone, top: 0.3 });

    // ---- the workshop: timber and cob on a stone sill, open on the street side, wheels inside
    const wx = -10.5;
    const wz = 4.6;
    const WW = 12;
    const WD = 5.4;
    b.box(WW, 0.5, WD, stone, { at: [wx, 0, wz] }); // sill wall
    b.box(WW, 2.4, 0.25, cob, { at: [wx, 0.5, wz - WD / 2 + 0.125] });
    b.sym((s) => b.box(0.25, 2.4, WD, cob, { at: [wx + s * (WW / 2 - 0.125), 0.5, wz] }));
    for (const x of lin(5, wx - WW / 2 + 0.15, wx + WW / 2 - 0.15)) b.box(0.22, 2.4, 0.22, timber, { at: [x, 0.5, wz + WD / 2 - 0.12] });
    b.box(WW, 0.25, 0.25, timber, { at: [wx, 2.65, wz + WD / 2 - 0.12] });
    b.frame(WD, 2.4, timber, { at: [wx - WW / 2, 0.5, wz], facing: '-x', studs: 2, rails: 1 });
    tileRoof(b, WW, WD, [wx, 2.9, wz], cob);
    b.box(WW - 0.5, 0.06, WD - 0.5, tint(P.earth, 0.04), { at: [wx, 0.5, wz], jitter: false });
    // kick wheels: a heavy flywheel below, the wheel head above, the potter's bench
    for (const x of [wx - 3.5, wx, wx + 3.5]) {
      b.cyl(0.55, 0.15, P.oakDark, { at: [x, 0.55, wz + 0.2], segs: 10 });
      b.cyl(0.06, 0.6, P.oak, { at: [x, 0.7, wz + 0.2], segs: 5 });
      b.cyl(0.3, 0.08, P.oak, { at: [x, 1.3, wz + 0.2], segs: 10 });
      b.cyl(0.15, 0.25, GREEN, { at: [x, 1.38, wz + 0.2], rTop: 0.2, segs: 7 });
      b.box(0.9, 0.45, 0.4, P.oak, { at: [x, 0.5, wz - 0.7] });
    }
    // shelves of fresh pots along the back wall
    for (const y of [1.2, 1.9]) {
      b.box(WW - 1, 0.06, 0.45, P.oak, { at: [wx, y, wz - WD / 2 + 0.5] });
      for (const x of lin(10, wx - WW / 2 + 1, wx + WW / 2 - 1)) b.cyl(0.14, 0.26, GREEN, { at: [x, y + 0.06, wz - WD / 2 + 0.5], rTop: 0.18, segs: 6 });
    }

    // ---- clay preparation: settling tanks lined with tile, and heaps of raw clay
    for (const [x, z] of [
      [-14.2, -2.0],
      [-11.4, -2.0],
    ]) {
      b.box(2.4, 0.6, 2.2, tint(brick, 0.05), { at: [x, 0, z] });
      water(b, 2.0, 1.8, [x, 0.59, z], 0x9d8a6a);
    }
    heap(b, [-14.6, 0, -6.4], 1.5, 1.0, 0xb7a17c);
    heap(b, [-12.4, 0, -7.0], 1.1, 0.8, 0xa89270);

    // ---- the kilns: one sealed and fired, one open and being loaded, under a light roof
    kiln(b, [-2.0, 0, -3.5], 2.3, 2.6, false, 1, brick);
    kiln(b, [4.2, 0, -5.0], 2.0, 2.4, true, 1, brick);
    // a woodpile for the firing
    for (let i = 0; i < 3; i++) b.box(3.2, 0.32, 1.2, tint(P.bark, i * 0.03), { at: [-6.6, i * 0.32, -6.4] });
    for (const x of lin(4, -8.0, -5.2)) b.box(0.12, 1.2, 0.12, P.oakDark, { at: [x, 0, -5.7] });

    // ---- the drying shed: a long tiled roof on posts with shelves of ware
    const dx = 11.2;
    const dz = -1.6;
    const DW = 11;
    const DD = 4.8;
    for (const x of lin(5, dx - DW / 2 + 0.15, dx + DW / 2 - 0.15)) for (const z of [dz - DD / 2 + 0.15, dz + DD / 2 - 0.15]) b.box(0.24, 2.5, 0.24, timber, { at: [x, 0, z] });
    for (const z of [dz - DD / 2 + 0.15, dz + DD / 2 - 0.15]) b.box(DW, 0.24, 0.26, timber, { at: [dx, 2.5, z] });
    tileRoof(b, DW, DD, [dx, 2.74, dz]);
    for (const z of [dz - 0.7, dz + 0.7]) {
      for (const y of [0.5, 1.2, 1.9]) {
        b.box(DW - 1.2, 0.06, 0.55, P.pine, { at: [dx, y, z] });
        for (const x of lin(7, dx - DW / 2 + 1.2, dx + DW / 2 - 1.2)) b.cyl(0.15, 0.22, y > 1.5 ? GREEN : tint(GREEN, -0.05), { at: [x, y + 0.06, z], rTop: 0.2, segs: 5 });
      }
      for (const x of lin(4, dx - DW / 2 + 0.7, dx + DW / 2 - 0.7)) b.box(0.1, 2.1, 0.1, P.pine, { at: [x, 0, z] });
    }

    // ---- the store and packing yard on the quay: crates of red ware, amphorae, the waste heap
    for (let i = 0; i < 6; i++) {
      const x = 2.0 + (i % 3) * 1.4;
      const y = Math.floor(i / 3) * 0.75;
      b.box(1.2, 0.7, 0.9, P.pine, { at: [x, y + 0.3, -9.4] });
      b.box(1.0, 0.08, 0.7, 0xd8c48a, { at: [x, y + 1.0, -9.4], jitter: false }); // straw
    }
    for (const x of lin(4, 8.2, 11.0)) potStack(b, [x, 0.3, -9.2], 8);
    for (const x of lin(4, 8.2, 11.0)) potStack(b, [x, 0.3, -8.4], 6);
    // the dump of misfired and broken ware
    heap(b, [15.2, 0, -7.2], 2.0, 1.2, tint(SAMIAN, 0.04));
    heap(b, [14.0, 0, -5.6], 1.3, 0.7, tint(SAMIAN, -0.04));
    // a timber crane at the quay edge and a river boat taking on crates
    b.box(0.35, 4.5, 0.35, timber, { at: [-4.5, 0.3, -10.4] });
    b.beam([-4.5, 4.4, -10.4], [-4.5, 3.8, -13.6], 0.25, 0.25, timber);
    b.beam([-4.5, 2.2, -10.4], [-4.5, 4.0, -12.6], 0.18, 0.18, timber);
    b.beam([-4.5, 3.8, -13.6], [-4.5, 1.2, -13.6], 0.04, 0.04, P.bark);
    b.box(0.8, 0.5, 0.6, P.pine, { at: [-4.5, 0.7, -13.6] });
    boat(b, [-6.0, 0, -14.0], 9, 2.6, P.oak, 0, P.pine);
    // the street front: a low stone wall with the yard gate
    b.box(13, 1.2, 0.5, stone, { at: [8.5, 0, 10.4] });
    b.sym((s) => b.box(0.7, 2.0, 0.7, stone, { at: [1.0 + s * 1.6, 0, 10.4] }));
    b.box(4.0, 0.3, 0.7, stone, { at: [1.0, 2.0, 10.4] });

    b.collider(WW, WD, { at: [wx, 0, wz] });
    b.collider(5.5, 5.5, { at: [-2.0, 0, -3.5] });
    b.collider(5.0, 5.0, { at: [4.2, 0, -5.0] });
    b.collider(DW, DD, { at: [dx, 0, dz] });
    b.collider(13, 0.5, { at: [8.5, 0, 10.4] });
  },
};
