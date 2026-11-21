import { P, mix, spread, tint, type Builder, type BuildingDef } from '@ah/kit';

/** A tall concrete box with board-marked bands, standing on `at`, turned by rotY. */
function boardMarked(b: Builder, w: number, h: number, d: number, color: number, at: [number, number, number], rotY = 0): void {
  b.box(w, h, d, color, { at, rotY });
  const line = tint(color, -0.07);
  for (let y = 1.2; y < h - 0.3; y += 1.2) {
    b.box(w + 0.05, 0.07, d + 0.05, line, { at: [at[0], at[1] + y, at[2]], rotY, jitter: false });
  }
}

/** A terrace: a deep concrete slab with an upstand parapet round its edge. */
function terrace(b: Builder, x0: number, x1: number, z0: number, z1: number, y: number, color: number): void {
  const w = x1 - x0;
  const d = z1 - z0;
  const x = (x0 + x1) / 2;
  const z = (z0 + z1) / 2;
  b.box(w, 0.7, d, color, { at: [x, y, z] });
  b.box(w + 0.02, 0.06, d + 0.02, tint(color, -0.1), { at: [x, y + 0.3, z], jitter: false });
  const p = 0.9;
  const t = 0.3;
  b.box(w, p, t, color, { at: [x, y + 0.7, z1 - t / 2] });
  b.box(w, p, t, color, { at: [x, y + 0.7, z0 + t / 2] });
  b.box(t, p, d, color, { at: [x0 + t / 2, y + 0.7, z] });
  b.box(t, p, d, color, { at: [x1 - t / 2, y + 0.7, z] });
}

export const brutalistArtsCentre: BuildingDef = {
  id: 'brutalist-arts-centre',
  name: 'Arts centre and theatre',
  style: 'Brutalist',
  date: 'c. 1972',
  summary:
    'Television emptied the cinemas, and this one closed in the 1960s. In its place the council and the Arts Council built an arts centre with two theatres, ' +
    'a gallery and cafés, part of the post-war belief that culture should be paid for by the public and open to everyone. ' +
    'It is built in raw, board-marked concrete: wide terraces stacked like geological strata and cantilevered out over glazed foyers, ' +
    'with the two fly towers of the stages rising above. The terraces are meant as public outdoor rooms, open whether or not there is a show.',
  materials: ['board-marked in-situ concrete', 'precast concrete', 'bronze-tinted glass'],
  modelledOn: 'National Theatre, South Bank, London (Denys Lasdun, designed from 1967, built 1969-76)',
  lookFor: [
    { label: 'Strata', note: 'Deep horizontal terraces at different levels, stepping back like layers of rock. Lasdun called them his strata.', at: [-13.5, 6, 9.6] },
    { label: 'Fly towers', note: 'The tall blind boxes above each stage, high enough to lift whole sets out of sight of the audience.', at: [-4, 27.4, -7] },
    { label: 'Board-marked concrete', note: 'Concrete poured into timber shuttering keeps the grain and joints of the boards on its face.', at: [11.2, 12, -4.4] },
    { label: 'Cantilever', note: 'The terraces reach out beyond the glass beneath them, carried by the concrete frame on only a few slim piers.', at: [10, 3.3, 9.4] },
    { label: 'Glazed foyers', note: 'Glass walls set well back under the terraces, so the foyers open to the town but stay in shadow.', at: [-6, 2, 8.0] },
  ],
  influences: ['corbusian-brutalism'],
  build(b) {
    const conc = tint(P.concrete, b.range(-0.03, 0.02));
    const glass = mix(P.glassDark, P.bronze, 0.25);
    const G = { mat: 'glass' as const };

    // podium
    b.box(31, 0.5, 23, tint(conc, -0.04), { at: [0, 0, -1.5] });
    b.stairs(10, 0.5, 1.5, 3, tint(conc, -0.04), { at: [-3, 0, 10.7] });

    // level 0: glazed foyer behind concrete piers
    b.box(26, 3.1, 13.8, glass, { at: [0, 0.5, 0.9], ...G });
    for (const x of spread(9, -13, 13)) b.box(0.22, 3.1, 0.06, P.castIron, { at: [x, 0.5, 7.82] });
    for (const x of [-10, 0, 10]) b.box(1.0, 3.1, 1.0, conc, { at: [x, 0.5, 8.6] });
    terrace(b, -15.5, 15, -9, 9.8, 3.6, conc);

    // level 1
    b.box(23.5, 3.2, 13.4, glass, { at: [-0.75, 4.3, 0.7], ...G });
    for (const x of spread(8, -12.5, 11)) b.box(0.2, 3.2, 0.06, P.castIron, { at: [x, 4.3, 7.42] });
    terrace(b, -14.5, 12.5, -8, 8.8, 7.5, conc);

    // level 2
    b.box(18, 3.0, 11, glass, { at: [-1, 8.2, 0.5], ...G });
    terrace(b, -12.5, 10, -7, 7.6, 11.2, conc);
    // level 3: a small top foyer under a deep roof slab
    b.box(8, 2.6, 8.6, glass, { at: [-3, 11.9, 0.3], ...G });
    b.box(12, 1.2, 10.6, conc, { at: [-3, 14.5, 0.3] });

    // the stair and lift towers that tie the strata together
    boardMarked(b, 3.6, 16, 3.6, conc, [12.6, 0.5, -6.2]);
    boardMarked(b, 3, 14, 3, conc, [-14, 0.5, -5]);

    // two fly towers over the two stages
    boardMarked(b, 10, 26.5, 9, conc, [-4, 0.5, -7]);
    boardMarked(b, 7.5, 21, 7, conc, [7.6, 0.5, -8]);
    b.box(10.4, 0.5, 9.4, tint(conc, 0.05), { at: [-4, 27, -7] });
    b.box(7.9, 0.5, 7.4, tint(conc, 0.05), { at: [7.6, 21.5, -8] });
    // scenery dock at the back
    b.box(10, 6.5, 3.6, tint(conc, -0.03), { at: [5, 0.5, -12.6] });
    b.panel(4.5, 5, P.cladGrey, { at: [5, 0.5, -14.4], facing: '-z' });

    // planters and benches on the terraces
    for (const [x, z, y] of [[-12, 8.2, 4.3], [10, 8.4, 4.3], [-11, 6.8, 8.2]] as const) {
      b.box(1.8, 0.6, 1.0, conc, { at: [x, y, z] });
      b.blob(0.7, P.hedge, { at: [x, y + 0.7, z], stretch: [1.2, 0.6, 0.7], detail: 0 });
    }
    // lettered fascia sign
    b.box(9, 0.9, 0.12, P.black, { at: [2, 4.0, 9.86] });
    for (const x of spread(12, -2, 6)) b.box(0.45, 0.5, 0.05, P.windowLit, { at: [x, 4.2, 9.94] });

    b.collider(26, 13.8, { at: [0, 0, 0.9] });
    b.collider(10, 9, { at: [-4, 0, -7] });
    b.collider(7.5, 7, { at: [7.6, 0, -8] });
    b.collider(10, 3.6, { at: [5, 0, -12.6] });
    b.collider(3.6, 3.6, { at: [12.6, 0, -6.2] });
    b.collider(3, 3, { at: [-14, 0, -5] });
  },
};
