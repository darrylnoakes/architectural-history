import { P, mix, tint, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';

/** A trapezoidal Etruscan doorway (narrower at the top) with a dark opening, on the drum face. */
function etruscanDoor(b: Builder, at: Vec3, ang: number, stone: number): void {
  b.group({ at, rotY: ang }, () => {
    b.extrude([[-0.95, 0], [0.95, 0], [0.72, 2.3], [-0.72, 2.3]], 0.12, tint(stone, -0.08), { at: [0, 0, 0.02] });
    b.extrude([[-0.7, 0], [0.7, 0], [0.52, 1.95], [-0.52, 1.95]], 0.14, P.windowDark, { at: [0, 0, 0.06] });
  });
}

/** A cippus, the grave marker: a turned column with a knob for a man, a little house with a pitched roof for a woman. */
function cippus(b: Builder, at: Vec3, kind: 'column' | 'house', stone: number): void {
  if (kind === 'column') {
    b.cyl(0.2, 0.12, stone, { at, segs: 7 });
    b.cyl(0.16, 0.55, stone, { at: [at[0], at[1] + 0.12, at[2]], rTop: 0.13, segs: 7 });
    b.sphere(0.13, stone, { at: [at[0], at[1] + 0.72, at[2]], segs: 6 });
  } else {
    b.box(0.5, 0.42, 0.32, stone, { at, rotY: 0.2 });
    b.gable(0.5, 0.32, 0.2, stone, { at: [at[0], at[1] + 0.42, at[2]], rotY: 0.2, ridge: 'x' });
  }
}

const MOUND: [number, number][] = [
  [13.5, 3.05],
  [12.2, 4.3],
  [10.2, 6.1],
  [7.8, 7.6],
  [5.0, 8.7],
  [2.4, 9.3],
  [0, 9.5],
];

/** Height of the mound surface at radius r. */
function moundY(r: number): number {
  for (let i = 0; i < MOUND.length - 1; i++) {
    const [r0, y0] = MOUND[i];
    const [r1, y1] = MOUND[i + 1];
    if (r <= r0 && r >= r1) return y0 + ((r0 - r) / (r0 - r1)) * (y1 - y0);
  }
  return MOUND[MOUND.length - 1][1];
}

export const tumulus: BuildingDef = {
  id: 'tumulus',
  name: 'Etruscan tumulus tomb',
  style: 'Etruscan Orientalising',
  date: 'c. 650 BC',
  summary:
    'Outside the town, along the road to its cemetery, the leading Etruscan families raised great round tombs. ' +
    'A drum of soft volcanic tufa, partly carved from the bedrock and partly built of squared blocks, carries a mound of heaped earth. ' +
    'Inside, reached by short sloping passages, are several tomb chambers cut in the rock to look like the rooms of a house, with carved roof beams, doors and beds, ' +
    'used for burials of the same family over generations. The wealth to build them came from trade in metals with Greeks and Phoenicians.',
  materials: ['tufa (local volcanic stone)', 'heaped earth and turf'],
  modelledOn: 'The tumuli of the Banditaccia necropolis, Cerveteri (ancient Caere), 7th and 6th centuries BC',
  influences: ['etruscan-legacy'],
  lookFor: [
    {
      label: 'Drum',
      note: 'The round base of cut tufa with a moulded plinth and cornice. At Cerveteri the lower part is often the living rock, carved where it stood.',
      at: [-9.6, 2.2, 9.6],
    },
    {
      label: 'Earth mound',
      note: 'Heaped earth and turf over the chambers. The biggest tumuli at Cerveteri are around 40 m across; this one is about 28 m.',
      at: [0, 9.8, 0],
    },
    {
      label: 'Dromos',
      note: 'The entrance passage, walled in tufa, leading down to a tomb door. A large tumulus held several tombs, each with its own dromos.',
      at: [0, 1.6, 15.2],
    },
    {
      label: 'Cippi',
      note: 'Stone grave markers set at the tomb entrances: a small column for a man, a little house for a woman. Most at Cerveteri were set up in later centuries.',
      at: [2.4, 1.0, 16.0],
    },
    {
      label: 'Steps to the top',
      note: 'Some tumuli at Cerveteri have a stair or ramp built against the drum, probably for ceremonies held on top of the mound.',
      at: [-12.6, 2.6, 7.6],
    },
  ],
  build(b) {
    const tufa = tint(P.tufa, b.range(-0.03, 0.02));
    const tufaDark = tint(tufa, -0.08);
    const grass = tint(P.grassDry, b.range(-0.03, 0.02));
    const segs = 32;
    const R = 13.6;

    // a skirt of trodden tufa round the foot of the drum, and the road of tombs in front
    b.lathe([[R, 0.04], [R + 1.8, 0.02], [R + 2.4, 0]], mix(tufa, P.earth, 0.5), { segs });
    b.box(40, 0.05, 2.2, mix(tufa, P.gravel, 0.4), { at: [0, 0, 16.7] });
    for (const x of [-0.75, 0.75]) b.box(40, 0.02, 0.22, tint(tufa, -0.15), { at: [0, 0.05, 16.7 + x] });

    // the drum: plinth, wall, a torus moulding and a sloping cornice
    b.lathe(
      [
        [R + 0.4, 0],
        [R + 0.4, 0.35],
        [R + 0.05, 0.42],
        [R, 0.45],
        [R, 2.2],
        [R + 0.2, 2.28],
        [R + 0.32, 2.42],
        [R + 0.2, 2.56],
        [R + 0.05, 2.62],
        [R + 0.45, 2.95],
        [R - 0.1, 3.05],
      ],
      tufa,
      { segs },
    );
    // courses of the squared blocks
    for (const y of [1.0, 1.6]) b.lathe([[R + 0.02, y], [R + 0.02, y + 0.06]], tufaDark, { segs });

    // the earth mound, turfed
    b.lathe(
      [
        ...MOUND,
      ],
      grass,
      { segs },
    );
    // scrub on the mound
    for (const [r, a, h] of [[9.5, 0.6, 1.3], [6, 2.4, 1.1], [10.5, 3.6, 1.5], [4, 4.6, 1.0], [8.4, 5.5, 1.2]]) {
      b.tree(h, { at: [r * Math.sin(a), moundY(r) - 0.15, r * Math.cos(a)], kind: 'bush', color: tint(P.hedge, -0.03) });
    }

    // ------------------------------------------------ the main dromos, on the front
    const zf = Math.sqrt(R * R - 1.3 * 1.3);
    b.sym((s) => {
      b.box(0.7, 2.8, 2.2, tufa, { at: [s * 1.45, 0, zf + 1.0] });
      b.box(0.7, 1.7, 1.2, tufa, { at: [s * 1.45, 0, zf + 2.7] });
      b.box(0.86, 0.12, 3.3, tufaDark, { at: [s * 1.45, 1.7, zf + 1.6] });
    });
    // the passage floor steps down toward the door (shown by darkening treads)
    for (let i = 0; i < 4; i++) b.box(2.2, 0.04, 0.7, tint(tufa, -0.06 - i * 0.04), { at: [0, 0.02, zf + 2.9 - i * 0.7] });
    etruscanDoor(b, [0, 0, zf - 0.05], 0, tufa);

    // ------------------------------------------------ a second tomb, round the side, with its own short dromos
    const a2 = -2.2;
    const r2 = R;
    const d2: Vec3 = [r2 * Math.sin(a2), 0, r2 * Math.cos(a2)];
    etruscanDoor(b, [d2[0] + Math.sin(a2) * 0.02, 0, d2[2] + Math.cos(a2) * 0.02], a2, tufa);
    b.group({ at: d2, rotY: a2 }, () => {
      b.sym((s) => b.box(0.6, 2.2, 2.0, tufa, { at: [s * 1.35, 0, 0.9] }));
    });

    // ------------------------------------------------ stair up the side of the drum to the top
    const sa = -1.05;
    b.group({ at: [(R + 0.9) * Math.sin(sa), 0, (R + 0.9) * Math.cos(sa)], rotY: sa - Math.PI / 2 }, () => {
      b.stairs(1.4, 3.0, 4.4, 8, tufa, { rotY: 0 });
      b.box(0.3, 1.2, 4.4, tufaDark, { at: [0.85, 0, 0] });
    });

    // ------------------------------------------------ cippi at the entrance
    cippus(b, [2.4, 0, zf + 2.4], 'column', tint(P.tufa, 0.06));
    cippus(b, [3.1, 0, zf + 1.6], 'column', tint(P.tufa, 0.04));
    cippus(b, [-2.6, 0, zf + 2.2], 'house', tint(P.tufa, 0.05));

    // trees of the necropolis
    b.tree(6.5, { at: [-16.5, 0, 13.5], color: P.leafDark });
    b.tree(5.2, { at: [17.0, 0, -13.0], color: P.leafDark });
    b.tree(7.5, { at: [16.5, 0, 12.0], kind: 'pine' });
    for (const [x, z] of [[-17.5, -10], [-15, -15.5], [18, 2], [12.5, -16]]) b.tree(b.range(1.0, 1.6), { at: [x, 0, z], kind: 'bush', color: P.hedge });

    // ------------------------------------------------ walk collisions: the drum and the dromos walls
    const n = 18;
    const cw = 2 * (R + 0.3) * Math.sin(Math.PI / n) + 0.2;
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * Math.PI * 2;
      b.collider(cw, 1.6, { at: [(R - 0.5) * Math.sin(a), 0, (R - 0.5) * Math.cos(a)], rotY: a });
    }
    b.sym((s) => b.collider(0.7, 3.4, { at: [s * 1.45, 0, zf + 1.6] }));
  },
};
