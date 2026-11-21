import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, END, FOOT, hump, band, bar, steps, cutwaterPier } from './shared';

export const ironBridge: BuildingDef = {
  id: 'iron-bridge',
  name: 'Wrought-iron girder bridge',
  style: 'Engineering of united Italy',
  date: 'c. 1880',
  summary:
    'The new quarters beyond the river need a wide, level bridge for carriages, carts and the horse tram, and an engineer gives it to them in iron. ' +
    'Straight lattice girders, riveted together from wrought-iron plates and bars, are laid across stone piers: no arches to build on centring, no hump in the road, and the parts arrive by railway ready to bolt up. ' +
    'The roadway carries tram rails, with pavements carried out on brackets either side behind cast-iron railings, and gas lamps over each pier. ' +
    'Bridges like this crossed rivers all over Italy after unification, and many of them were blown up in the Second World War.',
  materials: ['wrought iron', 'cast iron', 'rusticated stone', 'stone setts'],
  lookFor: [
    { label: 'Lattice girder', note: 'Crossing diagonal bars riveted between top and bottom flanges: a beam made light by leaving out everything that does not carry load.', at: [4.7, 0.2, -8.0] },
    { label: 'Rivets', note: 'Heads of red-hot rivets hammered over, joining every plate and bar; the girders were assembled this way on site.', at: [4.7, -0.15, 1.0] },
    { label: 'Masonry pier', note: 'Stone piers with cutwaters carry the iron; the girders sit on bearings on top so they can expand in the sun.', at: [-5.4, -0.6, 4.2] },
    { label: 'Tram rails', note: 'Rails set in the stone setts for the horse tram to the new quarters; electric trams followed from the 1890s.', at: [0.7, 1.2, 6.0] },
    { label: 'Gas lamp', note: 'Cast-iron lamp standards over the piers light the bridge at night.', at: [4.3, 4.4, -4.2] },
  ],
  influences: ['iron-and-glass'],
  build(b) {
    b.noCollide();
    const crown = 0.9;
    const f = hump(crown);
    const W = 9.0;
    const roadW = 6.0;
    b.deck(W - 0.4, 34, crown, { yEnds: 0 });
    const iron = mix(P.iron, P.slateBlue, 0.25);
    const ironL = tint(iron, 0.1);
    const stone = b.pick([P.travertine, tint(P.peperino, 0.12)]);
    const rust = tint(stone, -0.05);
    const piers = [-4.2, 4.2];
    const depth = 1.15;
    const gTop = (z: number) => f(z) - 0.16;
    const gBot = (z: number) => gTop(z) - depth;
    const girders = [-3.9, -1.3, 1.3, 3.9];

    // stone piers with cutwaters, banded rustication, and bed stones under the girders
    for (const z of piers) {
      const top = gBot(z) - 0.05;
      cutwaterPier(b, { z, len: W - 1.4, thick: 1.4, nose: 1.1, y0: FOOT, h: top - FOOT, color: stone, cap: 0.08, capColor: rust });
      for (const y of [-1.0, -0.6]) b.box(W - 1.3, 0.12, 1.46, rust, { at: [0, y, z] });
      for (const x of girders) b.box(0.5, 0.06, 0.6, P.castIron, { at: [x, top + 0.2, z] });
    }
    // abutments on each bank, with a pedestal at each corner
    b.sym((s) => {
      const z0 = s * (BANK - 0.6);
      const z1 = s * END;
      const pts: [number, number][] = [];
      for (const z of steps(6, BANK - 0.6, END)) pts.push([s * z, gBot(z) - 0.05]);
      pts.push([z1, -0.6], [s * BANK, -0.6], [s * BANK, FOOT], [z0, FOOT]);
      b.extrude((s > 0 ? pts : pts.reverse()).map(([z, y]) => [-z, y] as [number, number]), W - 0.6, stone, { rotY: Math.PI / 2 });
      b.sym((k) => {
        const z = s * (BANK + 0.4);
        b.box(0.9, f(z) + 1.4, 0.9, stone, { at: [k * (W / 2 - 0.2), -0.3, z] });
        b.box(1.05, 0.18, 1.05, rust, { at: [k * (W / 2 - 0.2), f(z) + 1.1, z] });
        b.sphere(0.28, rust, { at: [k * (W / 2 - 0.2), f(z) + 1.5, z], segs: 8 });
      });
    });

    // the girders: flanges, end and pier stiffeners, and the lattice web on the outer faces
    const za = -(BANK - 0.4);
    const zb = BANK - 0.4;
    for (const x of girders) {
      band(b, x, 0.36, za, zb, (z) => gBot(z), (z) => gBot(z) + 0.1, ironL, 24);
      // a thin web plate on the inner girders, the open lattice on the outer ones
      if (Math.abs(x) < 3) band(b, x, 0.04, za, zb, (z) => gBot(z) + 0.1, (z) => gTop(z) - 0.1, iron, 24);
    }
    // top flanges
    for (const x of girders) band(b, x, 0.36, za, zb, (z) => gTop(z) - 0.1, (z) => gTop(z), ironL, 24);
    // lattice on the outer girders: two sets of diagonals at 45 degrees
    const pitch = 0.95;
    for (const x of [girders[0], girders[3]]) {
      const n = Math.round((zb - za) / pitch);
      for (let i = 0; i < n; i++) {
        const z0 = za + i * pitch;
        const z1 = z0 + pitch;
        bar(b, [x, gBot(z0) + 0.1, z0], [x, gTop(z1) - 0.1, z1], [0.05, 0.12], iron);
        bar(b, [x, gTop(z0) - 0.1, z0], [x, gBot(z1) + 0.1, z1], [0.05, 0.12], iron);
      }
      // stiffeners over the supports and at the ends
      for (const z of [za, ...piers, zb]) b.box(0.12, depth - 0.2, 0.3, ironL, { at: [x, gBot(z) + 0.1, z] });
      // rows of rivet heads along the flanges
      for (const z of steps(Math.round((zb - za) / 0.5), za, zb)) {
        for (const y of [gTop(z) - 0.05, gBot(z) + 0.05]) b.box(0.42, 0.04, 0.04, tint(iron, 0.2), { at: [x, y - 0.02, z], jitter: false });
      }
    }
    // cross girders under the road
    for (const z of steps(12, za + 0.4, zb - 0.4)) b.box(W - 1.0, 0.3, 0.2, iron, { at: [0, gTop(z) - 0.32, z] });

    // roadway of stone setts with tram rails; raised pavements on cantilever brackets
    band(b, 0, roadW, -END, END, (z) => f(z) - 0.16, (z) => f(z) + 0.01, P.cobble, 30);
    for (const x of [-1.2, -0.2, 0.2, 1.2]) band(b, x, 0.08, -END, END, (z) => f(z), (z) => f(z) + 0.04, P.steel, 30);
    b.sym((k) => {
      const xp = k * (roadW / 2 + (W - roadW) / 4);
      band(b, xp, (W - roadW) / 2, -END + 0.4, END - 0.4, (z) => f(z) - 0.05, (z) => f(z) + 0.15, P.paving, 30);
      band(b, k * (roadW / 2 + 0.05), 0.1, -END + 0.4, END - 0.4, (z) => f(z) - 0.05, (z) => f(z) + 0.16, rust, 30);
      for (const z of steps(14, za + 0.4, zb - 0.4)) bar(b, [k * 3.95, gBot(z) + 0.2, z], [k * (W / 2), f(z) - 0.08, z], [0.08, 0.14], iron);
      // cast-iron railings: posts, balusters and a handrail
      const x = k * (W / 2 - 0.05);
      const zs = steps(56, -END + 1.2, END - 1.2);
      zs.forEach((z, i) => {
        const tall = i % 4 === 0;
        b.box(tall ? 0.1 : 0.035, tall ? 1.1 : 0.95, tall ? 0.1 : 0.035, P.castIron, { at: [x, f(z) + 0.12, z], jitter: false });
      });
      band(b, x, 0.08, -END + 1.2, END - 1.2, (z) => f(z) + 1.07, (z) => f(z) + 1.15, P.castIron, 30);
      band(b, x, 0.05, -END + 1.2, END - 1.2, (z) => f(z) + 0.3, (z) => f(z) + 0.35, P.castIron, 30);
      // gas lamps over the piers
      for (const z of piers) {
        const y = f(z) + 0.15;
        b.cyl(0.14, 0.5, P.castIron, { at: [x, y, z], segs: 8 });
        b.cyl(0.06, 3.0, P.castIron, { at: [x, y + 0.5, z], rTop: 0.045, segs: 6 });
        b.cyl(0.18, 0.5, P.glass, { at: [x, y + 3.5, z], rTop: 0.25, segs: 6, mat: 'glass' });
        b.cone(0.3, 0.3, P.castIron, { at: [x, y + 4.0, z], segs: 6 });
      }
    });
  },
};
