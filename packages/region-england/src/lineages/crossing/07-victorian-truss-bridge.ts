import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, BED, END, hump, band, bar, side, steps, cutwaterPier, type ZY } from './shared';

/** An ornate cast-iron lamp standard: moulded base, fluted shaft, scrolled bracket arms, lanterns. */
function lamp(b: Builder, x: number, y: number, z: number, iron: number): void {
  b.group({ at: [x, y, z] }, () => {
    b.lathe(
      [[0.3, 0], [0.3, 0.25], [0.22, 0.3], [0.2, 0.7], [0.13, 0.78], [0.09, 0.9], [0.075, 3.1], [0.12, 3.2], [0.08, 3.35], [0.0001, 3.4]],
      iron,
      { segs: 8 },
    );
    // crossarm with two lanterns, along the bridge
    b.box(0.08, 0.08, 1.3, iron, { at: [0, 3.05, 0] });
    b.sym((s) => {
      b.group({ at: [0, 2.7, s * 0.62] }, () => {
        b.cyl(0.05, 0.36, iron, { segs: 6 });
        b.cyl(0.16, 0.42, P.windowLit, { at: [0, 0.0, 0], rTop: 0.2, segs: 6, mat: 'glass' });
        b.cone(0.26, 0.22, iron, { at: [0, 0.42, 0], segs: 6 });
        b.sphere(0.05, iron, { at: [0, 0.68, 0], segs: 5 });
      });
      // scroll brace under the arm
      bar(b, [0, 2.6, 0], [0, 3.05, s * 0.5], 0.05, iron);
    });
  });
}

export const victorianTrussBridge: BuildingDef = {
  id: 'victorian-truss-bridge',
  name: 'Lattice girder bridge',
  style: 'Victorian engineering',
  date: '1885',
  summary:
    'The growing town needed a crossing wide and level enough for heavy carts, buses and a horse tram, so the narrow humped stone bridge was pulled down. ' +
    'Two wrought-iron lattice girders, made of flat bars riveted into a criss-cross web between top and bottom booms, span from the abutments to stone piers in the river. ' +
    'Wrought iron is strong in tension as well as compression, which cast iron is not, so a straight beam can now do the work of an arch; the railways had built thousands of bridges like this. ' +
    'Gas lamps and cast-iron railings give the engineering a civic face.',
  materials: ['wrought iron', 'cast iron', 'granite and sandstone', 'granite setts'],
  lookFor: [
    { label: 'Lattice girder', note: 'Two sets of diagonal flat bars crossing each other between the top and bottom booms, riveted at every crossing.', at: [-4.2, 2.0, -6.0] },
    { label: 'Stone pier', note: 'Rusticated masonry piers with cutwaters carry the girders mid-river, so each span is short and the girders shallow.', at: [-6.9, -0.3, 3.8] },
    { label: 'Tram rails', note: 'Rails set flush in the setts for a horse tram; electric trams would follow around 1900.', at: [0, 1.3, 2.0] },
    { label: 'Lamp standard', note: 'Ornate cast-iron gas lamp with a fluted shaft and two lanterns, made by a foundry that sold them from a catalogue.', at: [6.0, 4.9, -9.0] },
    { label: 'Cantilevered footway', note: 'Pavements carried outside the girders on iron brackets, keeping walkers away from the traffic.', at: [5.2, 0.6, 6.2] },
  ],
  influences: ['industrial-export'],
  build(b) {
    b.noCollide();
    const crown = 1.0;
    const f = hump(crown);
    const W = 12.4; // overall width including footways
    const gx = 4.0; // girder centre lines
    b.deck(W - 0.6, 26, crown, { yEnds: 0 });
    const iron = b.pick([P.iron, tint(P.doorGreen, -0.12), tint(P.doorBlue, -0.1)]);
    const cast = P.castIron;
    const stone = b.pick([P.sandstone, P.gritstone, tint(P.granite, 0.04)]);
    const piers = [-3.8, 3.8];
    const gLo = (z: number) => f(z) - 0.55; // bottom of girders
    const gHi = (z: number) => f(z) + 1.65; // top of girders
    const gEnd = BANK + 0.9;

    // abutments with rusticated faces, carrying the approaches
    b.sym((s) => {
      const pts: ZY[] = [];
      for (const z of steps(6, BANK, END)) pts.push([s * z, f(z) - 0.32]);
      pts.push([s * END, -0.4], [s * (BANK + 0.01), -0.4], [s * (BANK + 0.01), BED - 0.1], [s * (BANK - 0.5), BED - 0.1], [s * (BANK - 0.5), gLo(BANK) - 0.05]);
      side(b, pts, W + 0.4, stone);
      for (const y of [-1.7, -1.1, -0.5]) b.box(W + 0.44, 0.06, 0.06, tint(stone, -0.1), { at: [0, y, s * (BANK - 0.52)], jitter: false });
      b.box(W + 0.6, 0.25, 0.7, tint(stone, 0.05), { at: [0, gLo(BANK) - 0.2, s * (BANK - 0.3)] }); // bed stone
    });

    // river piers with cutwaters and a moulded cap
    for (const z of piers) {
      cutwaterPier(b, { z, len: W - 1.0, thick: 1.5, nose: 1.0, y0: BED - 0.1, h: gLo(z) - 0.25 - BED + 0.1, color: stone, cap: 0.12, capColor: tint(stone, 0.06) });
      for (const y of [-1.4, -0.8, -0.2]) b.box(W - 0.96, 0.05, 1.54, tint(stone, -0.1), { at: [0, y, z], jitter: false });
    }

    // the two lattice girders
    const boom = 0.26;
    b.sym((s) => {
      const x = s * gx;
      band(b, x, 0.42, -gEnd, gEnd, (z) => gLo(z), (z) => gLo(z) + boom, iron, 24); // bottom boom
      band(b, x, 0.46, -gEnd, gEnd, (z) => gHi(z) - boom, (z) => gHi(z), iron, 24); // top boom
      band(b, x + s * 0.02, 0.52, -gEnd, gEnd, (z) => gHi(z), (z) => gHi(z) + 0.06, tint(iron, 0.06), 24); // capping plate
      // lattice web: two families of diagonals at about 45 degrees
      const h = 1.65 + 0.55 - boom * 2;
      for (let z = -gEnd + 0.15; z <= gEnd - h - 0.1; z += 0.55) {
        bar(b, [x, gLo(z) + boom, z], [x, gHi(z + h) - boom, z + h], [0.08, 0.15], iron);
        bar(b, [x, gHi(z) - boom, z], [x, gLo(z + h) + boom, z + h], [0.08, 0.15], iron);
      }
      // vertical stiffeners at the ends and over the piers
      for (const z of [-gEnd + 0.12, ...piers, gEnd - 0.12]) b.box(0.48, gHi(z) - gLo(z), 0.22, tint(iron, -0.04), { at: [x, gLo(z), z] });
    });

    // roadway: setts between kerbs, with a tram track
    band(b, 0, 2 * gx - 0.4, -END, END, (z) => f(z) - 0.32, (z) => f(z) - 0.02, tint(P.iron, 0.1), 26); // cross girders and buckle plates
    band(b, 0, 2 * gx - 0.4, -END, END, (z) => f(z) - 0.05, (z) => f(z), P.cobble, 26);
    b.sym((s) => band(b, s * 0.72, 0.08, -END, END, (z) => f(z) - 0.02, (z) => f(z) + 0.025, P.steel, 26));

    // footways on cantilever brackets outside the girders, with railings and lamps
    b.sym((s) => {
      const fx = s * (gx + 1.15);
      band(b, fx, 1.9, -END, END, (z) => f(z) - 0.22, (z) => f(z) + 0.12, P.paving, 26);
      for (const z of steps(10, -gEnd + 0.4, gEnd - 0.4)) {
        bar(b, [s * (gx + 0.2), gLo(z) + 0.1, z], [s * (gx + 2.0), f(z) - 0.2, z], [0.1, 0.12], iron);
      }
      // outer cast-iron railing
      const rx = s * (W / 2 - 0.12);
      for (const z of steps(56, -END + 0.8, END - 0.8)) b.box(0.04, 1.0, 0.04, cast, { at: [rx, f(z) + 0.1, z], jitter: false });
      band(b, rx, 0.09, -END + 0.8, END - 0.8, (z) => f(z) + 1.05, (z) => f(z) + 1.15, cast, 26);
      band(b, rx, 0.06, -END + 0.8, END - 0.8, (z) => f(z) + 0.25, (z) => f(z) + 0.3, cast, 26);
      // granite end pedestals carrying lamps, and lamps over the piers
      b.sym((t) => {
        const z = t * (gEnd + 0.15);
        b.box(0.8, 1.4, 0.8, tint(stone, 0.05), { at: [rx, f(z), z] });
        b.box(0.95, 0.15, 0.95, tint(stone, 0.08), { at: [rx, f(z) + 1.4, z] });
        lamp(b, rx, f(z) + 1.55, z, cast);
        b.box(0.5, 0.4, 0.5, tint(stone, 0.05), { at: [rx, f(t * END) , t * (END - 0.4)] });
      });
      for (const z of piers) lamp(b, rx, f(z) + 0.12, z, cast);
    });
  },
};
