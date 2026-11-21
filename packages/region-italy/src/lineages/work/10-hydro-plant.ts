import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { BANK, WATER, lin, water } from './shared';

/** A simple steel lattice pylon of height h on `at`, with cross-arms and insulators. */
function pylon(b: Builder, x: number, z: number, h: number) {
  const base = 1.4;
  const top = 0.5;
  const steel = P.steel;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) b.beam([x + sx * base, 0, z + sz * base], [x + sx * top, h, z + sz * top], 0.12, 0.12, steel);
  }
  for (const f of [0.25, 0.5, 0.75]) {
    const w = base + (top - base) * f;
    const y = h * f;
    for (const s of [-1, 1]) {
      b.beam([x - w, y, z + s * w], [x + w, y, z + s * w], 0.06, 0.06, steel);
      b.beam([x + s * w, y, z - w], [x + s * w, y, z + w], 0.06, 0.06, steel);
    }
    const w2 = base + (top - base) * (f - 0.25);
    b.beam([x - w2, y - h * 0.25, z + w2], [x + w, y, z + w], 0.05, 0.05, steel);
    b.beam([x - w2, y - h * 0.25, z - w2], [x + w, y, z - w], 0.05, 0.05, steel);
  }
  for (const y of [h - 0.4, h - 2.2]) {
    b.box(5.0, 0.18, 0.18, steel, { at: [x, y, z] });
    for (const dx of [-2.3, 2.3]) b.cyl(0.12, 0.55, P.white, { at: [x + dx, y - 0.55, z], segs: 6 });
  }
}

export const hydroPlant: BuildingDef = {
  id: 'hydro-plant',
  name: 'Hydroelectric power station',
  style: 'Eclectic (neo-medieval)',
  date: 'c. 1905',
  summary:
    'Italy had little coal, but it had rivers and Alpine and Apennine streams, and from the 1890s it became one of Europe’s leaders in hydroelectric power: Italians called it white coal (carbone bianco). ' +
    'Water from a canal upstream drops through steel penstocks onto turbines, which spin the generators in the great hall, and the current goes out by overhead lines to factories, trams and street lights. ' +
    'Because a power station was a proud civic monument, its architects dressed it as a castle, with towers, battlements and rows of tall arched windows, in stone and brick to match the old town. ' +
    'For the first time the plot’s power does not have to be used on the spot: it can be sent miles away.',
  materials: ['stone', 'brick', 'steel penstocks', 'iron roof trusses', 'glass'],
  modelledOn: 'The Taccani power station at Trezzo sull’Adda (Gaetano Moretti, 1906), much reduced',
  lookFor: [
    { label: 'Penstocks', note: 'Steel pipes carry the water down from the forebay to the turbines, building up pressure as they fall.', at: [6.8, 5.0, -4.0] },
    { label: 'Forebay', note: 'A basin at the end of the canal where the water settles, with screens and sluice gates to control the flow.', at: [13.0, 7.8, -6.0] },
    { label: 'Turbine hall', note: 'Tall arched windows light the hall where the turbines turn the generators.', at: [-6, 7.0, 0.4] },
    { label: 'Battlements and towers', note: 'Castle dress for a machine: at Trezzo the architect echoed the ruined Visconti castle on the cliff above the plant.', at: [-15.5, 15.4, 1.8] },
    { label: 'Tailrace arches', note: 'The spent water leaves the turbines through arches in the river wall and rejoins the river.', at: [-6, -0.6, -11.4] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.peperino, tint(P.peperino, 0.06), P.pietraSerena]);
    const ashlar = tint(stone, 0.1);
    const brick = b.pick([P.brickRed, P.cotto]);
    const glass = P.glassDark;

    // ---- the river wall with the tailrace outlets
    b.box(36, 0.3 - WATER + 0.6, 1.0, stone, { at: [0, WATER - 0.6, BANK + 0.3] });
    b.box(36.1, 0.2, 1.1, ashlar, { at: [0, 0.3, BANK + 0.3] });
    for (const x of [-11, -6, -1]) {
      b.panel(2.8, 1.3, P.timberBlack, { at: [x, WATER - 0.2, BANK - 0.2], facing: '-z', shape: 'segmental' });
      b.panel(3.2, 1.5, ashlar, { at: [x, WATER - 0.25, BANK - 0.21], facing: '-z', shape: 'segmental', depth: 0.03 });
      b.beam([x, WATER + 0.03, BANK - 0.5], [x, WATER + 0.01, BANK - 2.6], 2.2, 0.03, 0xdcecf0, { mat: 'glass' }); // the outflow
    }
    b.box(34, 0.04, 20, tint(P.gravel, 0.02), { at: [0, 0, 0], jitter: false });

    // ---- the turbine hall: rusticated stone base, brick above, tall arched windows, battlements
    const hx = -6;
    const hz = -4.6;
    const HW = 20;
    const HD = 10;
    const base = 3.0;
    const H = 12;
    b.box(HW, base, HD, stone, { at: [hx, 0, hz] });
    for (let y = 0.5; y < base; y += 0.5) b.box(HW + 0.08, 0.06, HD + 0.08, tint(stone, -0.1), { at: [hx, y, hz], jitter: false });
    b.box(HW, H - base, HD, brick, { at: [hx, base, hz] });
    b.box(HW + 0.2, 0.3, HD + 0.2, ashlar, { at: [hx, base, hz] });
    // corbel table and battlements
    for (const x of lin(16, hx - HW / 2 + 0.4, hx + HW / 2 - 0.4)) {
      b.box(0.3, 0.4, 0.3, ashlar, { at: [x, H - 0.4, hz + HD / 2 + 0.15] });
      b.box(0.3, 0.4, 0.3, ashlar, { at: [x, H - 0.4, hz - HD / 2 - 0.15] });
    }
    b.box(HW + 0.6, 0.5, HD + 0.6, brick, { at: [hx, H, hz] });
    b.crenel(HW + 0.6, HD + 0.6, brick, { at: [hx, H + 0.5, hz], merlonW: 0.7, merlonH: 0.9, t: 0.4 });
    // low glazed roof behind the battlements (iron trusses carry it)
    b.gable(HW - 0.4, HD - 0.4, 1.4, P.zinc, { at: [hx, H + 0.2, hz] });
    b.gable(HW - 6, 2.0, 0.5, P.glass, { at: [hx, H + 1.1, hz], mat: 'glass' });
    // tall arched windows, front and back, with stone surrounds and iron glazing
    for (const x of lin(6, hx - HW / 2 + 1.8, hx + HW / 2 - 1.8)) {
      for (const [z, f] of [
        [hz + HD / 2, '+z'],
        [hz - HD / 2, '-z'],
      ] as const) {
        b.panel(2.2, 7.2, ashlar, { at: [x, base + 0.6, z], facing: f, shape: 'round', depth: 0.05 });
        b.window(1.8, 6.8, { at: [x, base + 0.8, z], facing: f, shape: 'round', frame: P.castIron, glass, bars: f === '+z' ? [2, 4] : [2, 2] });
        b.panel(0.9, 1.4, P.timberBlack, { at: [x, 0.9, z], facing: f, shape: 'round' }); // base windows
      }
    }
    // corner towers on the street side, taller, with machicolations and a pyramid roof
    b.sym((s) => {
      const tx = hx + s * (HW / 2 + 0.6);
      const tz = hz + HD / 2 - 1.0;
      const TH = 15;
      b.box(3.6, TH, 3.6, brick, { at: [tx, 0, tz] });
      b.box(3.7, base, 3.7, stone, { at: [tx, 0, tz] });
      b.box(4.4, 0.6, 4.4, ashlar, { at: [tx, TH - 0.6, tz] });
      b.box(4.4, 0.9, 4.4, brick, { at: [tx, TH, tz] });
      b.crenel(4.4, 4.4, brick, { at: [tx, TH + 0.9, tz], merlonW: 0.6, merlonH: 0.8, t: 0.35 });
      b.pyramid(3.4, 3.4, 2.2, P.coppi, { at: [tx, TH + 0.9, tz] });
      for (const y of [5, 9, 12]) b.window(0.7, 1.6, { at: [tx, y, tz + 1.8], facing: '+z', shape: 'round', frame: ashlar, glass });
      b.window(0.7, 1.6, { at: [tx + s * 1.8, 9, tz], facing: s > 0 ? '+x' : '-x', shape: 'round', frame: ashlar, glass });
    });
    // the entrance: a projecting gate with a great arch and a shield
    const ez = hz + HD / 2;
    b.box(5.2, H + 1.2, 0.8, brick, { at: [hx, 0, ez + 0.4] });
    b.box(5.3, base, 0.85, stone, { at: [hx, 0, ez + 0.4] });
    b.crenel(5.2, 0.8, brick, { at: [hx, H + 1.2, ez + 0.4], merlonW: 0.6, merlonH: 0.8, t: 0.3 });
    b.panel(3.2, 4.6, ashlar, { at: [hx, 0, ez + 0.8], facing: '+z', shape: 'round', depth: 0.05 });
    b.panel(2.6, 4.2, P.doorGreen, { at: [hx, 0, ez + 0.82], facing: '+z', shape: 'round' });
    b.window(2.0, 3.8, { at: [hx, 6.0, ez + 0.8], facing: '+z', shape: 'round', frame: P.castIron, glass, bars: [2, 4] });
    b.panel(1.3, 1.6, P.white, { at: [hx, 10.2, ez + 0.8], facing: '+z', depth: 0.08 });
    b.panel(0.9, 1.0, P.doorBlue, { at: [hx, 10.5, ez + 0.86], facing: '+z', depth: 0.06 });
    b.panel(4.6, 0.6, ashlar, { at: [hx, 4.9, ez + 0.8], facing: '+z' }); // name band

    // ---- the forebay on its masonry platform, fed by the canal from upstream
    const fx = 13.0;
    const fz = -6.0;
    const FW = 8.0;
    const FD = 7.0;
    const fy = 7.0;
    b.box(FW, fy, FD, stone, { at: [fx, 0, fz] });
    for (let y = 1; y < fy; y += 1) b.box(FW + 0.06, 0.06, FD + 0.06, tint(stone, -0.1), { at: [fx, y, fz], jitter: false });
    b.box(FW, 0.9, 0.4, ashlar, { at: [fx, fy, fz + FD / 2 - 0.2] });
    b.box(FW, 0.9, 0.4, ashlar, { at: [fx, fy, fz - FD / 2 + 0.2] });
    b.box(0.4, 0.9, FD, ashlar, { at: [fx - FW / 2 + 0.2, fy, fz] });
    water(b, FW - 0.4, FD - 0.8, [fx, fy + 0.6, fz]);
    // the canal arriving from upstream (+X), on its embankment
    b.box(1.6, fy + 0.9, 4.4, stone, { at: [fx + FW / 2 + 0.8, 0, fz] });
    water(b, 1.6, 3.6, [fx + FW / 2 + 0.8, fy + 0.6, fz]);
    // screen and sluice gates with their lifting gear over the penstock mouths
    const ex = fx - FW / 2;
    b.box(0.3, 2.6, FD - 1.0, P.castIron, { at: [ex + 0.9, fy, fz] });
    for (const z of [fz - 2.0, fz, fz + 2.0]) {
      b.box(0.5, 2.8, 0.2, P.castIron, { at: [ex + 0.4, fy + 0.9, z - 0.8] });
      b.box(0.5, 2.8, 0.2, P.castIron, { at: [ex + 0.4, fy + 0.9, z + 0.8] });
      b.box(0.6, 0.3, 1.8, P.castIron, { at: [ex + 0.4, fy + 3.7, z] });
      b.cyl(0.25, 0.3, P.doorRed, { at: [ex + 0.4, fy + 4.0, z], segs: 8 });
    }
    // the penstocks: three steel pipes falling from the forebay wall into the end of the hall
    for (const z of [fz - 2.0, fz, fz + 2.0]) {
      b.beam([ex - 0.2, fy - 0.4, z], [hx + HW / 2 + 0.2, 1.6, z], 1.0, 1.0, tint(P.iron, 0.12));
      for (const f of [0.3, 0.65]) {
        const x = ex - 0.2 + (hx + HW / 2 - ex + 0.4) * f;
        const y = fy - 0.4 + (1.6 - fy + 0.4) * f;
        b.box(0.5, y - 0.5, 0.5, stone, { at: [x, 0, z] }); // saddle piers
        b.beam([x, y - 0.6, z], [x, y + 0.6, z], 1.4, 0.25, P.castIron); // joint ring
      }
    }
    b.box(0.6, 3.6, FD - 0.4, stone, { at: [hx + HW / 2 + 0.3, 0, fz] }); // anchor block where the pipes enter

    // ---- the transformer house and the line out over a lattice pylon
    const ox = -14.5;
    const oz = 6.0;
    b.box(4.4, 7.0, 4.0, brick, { at: [ox, 0, oz] });
    b.box(4.5, 1.6, 4.1, stone, { at: [ox, 0, oz] });
    b.box(4.9, 0.4, 4.5, ashlar, { at: [ox, 7.0, oz] });
    b.crenel(4.9, 4.5, brick, { at: [ox, 7.4, oz], merlonW: 0.5, merlonH: 0.6, t: 0.3 });
    b.panel(1.4, 2.4, P.doorGreen, { at: [ox, 0, oz + 2.0], facing: '+z', shape: 'round' });
    for (const x of [ox - 1.3, ox, ox + 1.3]) {
      b.cyl(0.14, 0.9, P.white, { at: [x, 7.4, oz - 1.4], segs: 6 }); // roof bushings
      b.beam([x, 8.3, oz - 1.4], [x + 13.5, 13.4, oz + 3.0], 0.03, 0.03, P.black);
    }
    pylon(b, 0.5, 9.2, 13.8);
    for (const dx of [-2.3, 2.3]) b.beam([0.5 + dx, 13.0, 9.2], [0.5 + dx + 4, 12.0, 14], 0.03, 0.03, P.black);
    b.sym((s) => b.beam([hx + s * 4, 12.0, hz + 2], [ox, 7.4, oz], 0.03, 0.03, P.black));

    // ---- a stone gateway, a lawn and a pair of cypresses
    b.box(14, 0.04, 6, P.grass, { at: [5, 0, 7.5], jitter: false });
    b.tree(10, { at: [-17, 0, -7.5], kind: 'cypress' });
    b.tree(10, { at: [10, 0, 9], kind: 'cypress' });

    b.collider(HW + 2, HD, { at: [hx, 0, hz] });
    b.collider(FW + 1.6, FD, { at: [fx + 0.8, 0, fz] });
    b.collider(4.4, 4.0, { at: [ox, 0, oz] });
  },
};
