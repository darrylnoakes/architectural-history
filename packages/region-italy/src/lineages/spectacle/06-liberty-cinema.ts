import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';

/** Bar glyphs on a 3 × 5 grid for the sign: [x0, y0, x1, y1]. */
const GLYPHS: Record<string, number[][]> = {
  C: [[0, 0, 3, 1], [0, 4, 3, 5], [0, 0, 1, 5]],
  I: [[1, 0, 2, 5]],
  N: [[0, 0, 1, 5], [2, 0, 3, 5]],
  E: [[0, 0, 3, 1], [0, 2, 2.4, 3], [0, 4, 3, 5], [0, 0, 1, 5]],
  M: [[0, 0, 0.8, 5], [2.2, 0, 3, 5], [0, 4.2, 3, 5], [1.1, 2, 1.9, 5]],
  A: [[0, 0, 1, 5], [2, 0, 3, 5], [0, 4, 3, 5], [0, 2, 3, 3]],
};

function sign(b: Builder, text: string, size: number, color: number, at: [number, number, number]): void {
  const u = size / 5;
  const adv = 4 * u;
  const total = text.length * adv - u;
  [...text].forEach((ch, i) => {
    const x0 = at[0] - total / 2 + i * adv;
    for (const [a, c, d, e] of GLYPHS[ch] ?? []) {
      b.box((d - a) * u, (e - c) * u, 0.12, color, { at: [x0 + ((a + d) / 2) * u, at[1] + c * u, at[2]], jitter: false });
    }
    if (ch === 'N') b.box(u * 0.9, 5.1 * u, 0.1, color, { at: [x0 + 1.5 * u, at[1], at[2]], rot: [0, 0, 0.45], jitter: false });
  });
}

const FZ = 9.5; // the street front
const W = 26;

export const libertyCinema: BuildingDef = {
  id: 'liberty-cinema',
  name: 'Cinema and variety theatre',
  style: 'Stile Liberty (Italian Art Nouveau)',
  date: '1911',
  summary:
    'Moving pictures reached Italy in 1896, and by 1910 Turin, Rome and Milan were making films for the world. Towns built their first purpose-made cinemas, often doubling as variety theatres with a small stage for singers and comics between the reels. ' +
    'The front is the advertisement: a curving gable, a great arched window of iron and glass, bands of coloured ceramic flowers and an iron canopy over the doors, all in Stile Liberty. ' +
    'Behind it is a plain hall under a vaulted roof, no longer the horseshoe of boxes of the opera house but one sloping floor and a balcony, where everyone pays much the same.',
  materials: ['stucco over brick', 'reinforced concrete frame', 'wrought iron and glass', 'majolica tiles'],
  influences: ['liberty-style'],
  lookFor: [
    {
      label: 'Iron and glass canopy',
      note: 'A pensilina: glass on a frame of wrought iron, carried on brackets that curl like plant stems, to keep the queue dry.',
      at: [0, 4.6, FZ + 3.2],
    },
    {
      label: 'Curving gable',
      note: 'The roofline swells and dips in a whiplash curve, a favourite Liberty outline, hiding the plain vault behind.',
      at: [0, 17.6, FZ + 0.2],
    },
    {
      label: 'Ceramic frieze',
      note: 'A band of glazed tiles painted with flowers and leaves runs across the front, colour that survives the weather.',
      at: [-8.0, 12.6, FZ + 0.3],
    },
    {
      label: 'Arched window',
      note: 'The big iron-framed window lights the foyer and the stair to the balcony; at night it glowed over the street.',
      at: [0, 8.5, FZ + 0.3],
    },
    {
      label: 'Vaulted auditorium',
      note: 'The hall behind is a long box under a shallow barrel vault, with exit doors down the sides as new safety rules required.',
      at: [12.6, 10.5, -4.0],
    },
  ],
  build(b) {
    const stucco = tint(b.pick([P.intonacoCream, mix(P.intonacoCream, P.pinkWash, 0.4), mix(P.intonacoCream, P.cladGreen, 0.12)]), b.range(-0.03, 0.02));
    const trim = tint(stucco, -0.1);
    const iron = P.castIron;
    const green = tint(P.cladGreen, -0.05);
    const roof = tint(P.zinc, -0.05);

    // ------------------------------------------------ auditorium and stage house
    const az0 = -15.5;
    const ad = FZ - 1.0 - az0;
    b.box(22, 10, ad, stucco, { at: [0, 0, az0 + ad / 2] });
    b.vault(22.4, ad, roof, { at: [0, 10, az0 + ad / 2], squash: 0.32, segs: 10 });
    b.sym((s) => {
      for (let i = 0; i < 5; i++) {
        const z = az0 + 3 + i * 4.4;
        b.panel(0.6, 10, trim, { at: [s * 11, 0, z - 2.2], facing: s > 0 ? '+x' : '-x', depth: 0.12 });
        if (i % 2) b.panel(1.6, 2.4, P.doorGreen, { at: [s * 11, 0, z], facing: s > 0 ? '+x' : '-x' });
        else b.window(1.2, 2.2, { at: [s * 11, 6.0, z], facing: s > 0 ? '+x' : '-x', shape: 'round', frame: trim });
      }
    });
    b.box(16, 15, 5.5, stucco, { at: [0, 0, az0 + 2.75] });
    b.gable(16, 5.5, 2.2, P.coppi, { at: [0, 15, az0 + 2.75], overhang: 0.3, wall: stucco });
    b.panel(3.2, 3.6, P.doorGreen, { at: [0, 0, az0], facing: '-z' });

    // ------------------------------------------------ the front block
    const fd = 4.5;
    const fz0 = FZ - fd;
    const H = 13.5;
    b.box(W, H, fd, stucco, { at: [0, 0, fz0 + fd / 2] });
    // the whiplash gable over the centre
    const gable: [number, number][] = [[-9, 0]];
    for (let i = 0; i <= 16; i++) {
      const u = -1 + (i / 16) * 2;
      const y = 2.0 * Math.pow(Math.cos((u * Math.PI) / 2), 1.6) + 1.3 * Math.exp(-Math.pow(u * 3.2, 2)) - 0.25 * Math.sin(Math.abs(u) * Math.PI);
      gable.push([u * 9, Math.max(0, y) + 0.2]);
    }
    gable.push([9, 0]);
    b.extrude(gable, 0.6, stucco, { at: [0, H, FZ - 0.3] });
    b.extrude(gable.map(([x, y]) => [x * 1.03, y * 1.06 + (y > 0 ? 0.25 : 0)] as [number, number]), 0.4, trim, { at: [0, H, FZ - 0.4] });
    b.box(W + 0.6, 0.5, fd + 0.6, trim, { at: [0, H - 0.5, fz0 + fd / 2] }); // cornice
    // corner piers rising to little domed lanterns
    b.sym((s) => {
      b.box(2.4, H + 2.2, fd + 0.4, tint(stucco, 0.03), { at: [s * (W / 2 - 1.2), 0, fz0 + fd / 2] });
      b.cyl(0.9, 1.0, trim, { at: [s * (W / 2 - 1.2), H + 2.2, FZ - 2.2], segs: 8 });
      b.dome(0.95, green, { at: [s * (W / 2 - 1.2), H + 3.2, FZ - 2.2], squash: 1.3, segs: 8 });
      b.cyl(0.05, 0.9, iron, { at: [s * (W / 2 - 1.2), H + 4.4, FZ - 2.2], segs: 4 });
      for (const y of [3, 6.5, 10]) b.window(0.8, 1.8, { at: [s * (W / 2 - 1.2), y, FZ + 0.2], frame: trim, shape: 'round' });
      // side bays: windows with flowing heads
      b.window(2.0, 2.6, { at: [s * 7.5, 5.8, FZ], frame: trim, shape: 'segmental', bars: [3, 2] });
      b.window(2.0, 2.2, { at: [s * 7.5, 9.4, FZ], frame: trim, shape: 'round', bars: [3, 2] });
      b.panel(2.6, 3.6, mix(stucco, P.white, 0.5), { at: [s * 7.5, 0.9, FZ], depth: 0.05 }); // poster frames
      b.panel(2.2, 3.2, b.pick([P.cladRed, P.cladYellow, P.cladBlue]), { at: [s * 7.5, 1.1, FZ], depth: 0.08 });
    });
    // the big arched window of iron and glass
    b.window(7.0, 7.6, { at: [0, 5.0, FZ], shape: 'round', frame: iron, glass: P.glassDark, mat: 'glass', bars: [5, 4], border: 0.25 });
    b.panel(7.8, 8.0, trim, { at: [0, 4.8, FZ - 0.02], shape: 'round', depth: 0.08 });
    // ceramic frieze of flowers
    b.panel(W - 5, 1.0, tint(P.faience, -0.02), { at: [0, 12.1, FZ], depth: 0.1 });
    const flowers = [P.cladYellow, P.pinkWash, P.cladBlue, P.cladGreen];
    for (let i = 0; i < 20; i++) {
      const x = -10 + i * (20 / 19);
      if (Math.abs(x) < 4.0) continue;
      b.panel(0.55, 0.55, flowers[i % 4], { at: [x, 12.3, FZ + 0.06], shape: 'circle', depth: 0.08 });
    }
    b.sym((s) => b.panel(1.4, 1.4, P.cladGreen, { at: [s * 4.6, 14.0, FZ + 0.1], shape: 'circle', depth: 0.08 }));
    // the name in iron letters on the gable
    sign(b, 'CINEMA', 1.2, iron, [0, 14.9, FZ + 0.25]);

    // entrance doors and the canopy
    for (const x of [-2.4, 0, 2.4]) b.panel(1.8, 3.2, P.doorGreen, { at: [x, 0, FZ], depth: 0.08 });
    for (const x of [-2.4, 0, 2.4]) b.panel(1.4, 1.4, P.glassDark, { at: [x, 1.5, FZ + 0.03], depth: 0.08 });
    const cy = 4.2;
    const cd = 3.4;
    b.box(11, 0.08, cd, P.glassGreen, { at: [0, cy + 0.15, FZ + cd / 2], mat: 'glass', rot: [-0.08, 0, 0] });
    b.box(11.2, 0.22, 0.12, iron, { at: [0, cy, FZ + cd] });
    b.box(0.12, 0.22, cd, iron, { at: [-5.55, cy + 0.05, FZ + cd / 2] });
    b.box(0.12, 0.22, cd, iron, { at: [5.55, cy + 0.05, FZ + cd / 2] });
    for (const x of [-5.4, -1.8, 1.8, 5.4]) {
      // whiplash brackets: a curled strut and a tie rod
      b.beam([x, cy - 1.6, FZ], [x, cy - 0.6, FZ + 0.9], 0.1, 0.1, iron);
      b.beam([x, cy - 0.6, FZ + 0.9], [x, cy, FZ + 2.4], 0.1, 0.1, iron);
      b.beam([x, cy + 2.0, FZ], [x, cy + 0.25, FZ + cd], 0.05, 0.05, iron);
      b.sphere(0.12, iron, { at: [x, cy - 1.65, FZ + 0.05], segs: 5 });
    }
    // two iron lamps
    b.sym((s) => {
      b.cyl(0.06, 3.4, iron, { at: [s * 6.6, 0, FZ + 3.8], segs: 5 });
      b.sphere(0.25, P.windowLit, { at: [s * 6.6, 3.6, FZ + 3.8], segs: 6 });
    });

    // ------------------------------------------------ walk collisions
    b.collider(W, fd + 0.4, { at: [0, 0, fz0 + fd / 2] });
    b.collider(22, ad, { at: [0, 0, az0 + ad / 2] });
  },
};
