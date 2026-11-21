import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { beam, hurdleFence, roundedRing } from './shared';

/**
 * A plank-walled timber building, ridge along X, with a steep shingled roof.
 * Doors in the middle of the long walls. Returns nothing; everything is centred on the group origin.
 */
function plankBuilding(
  b: Builder,
  L: number,
  W: number,
  wallH: number,
  roofH: number,
  o: { plank: number; shingle: number; doors: 'both' | 'front'; louvre?: boolean; buttresses?: boolean },
) {
  const { plank, shingle } = o;
  b.box(L, wallH, W, plank);
  // vertical plank joints: alternate boards a shade darker, on all four walls
  const dark = tint(plank, -0.05);
  const strips = (len: number, facing: '+z' | '-z' | '+x' | '-x', off: number) => {
    const n = Math.floor(len / 0.34);
    for (const u of spread(n, -len / 2, len / 2).filter((_, i) => i % 2 === 0)) {
      const at: [number, number, number] =
        facing === '+z' ? [u, 0, off] : facing === '-z' ? [u, 0, -off] : facing === '+x' ? [off, 0, u] : [-off, 0, u];
      b.panel(0.17, wallH, dark, { at, facing, depth: 0.02 });
    }
  };
  strips(L, '+z', W / 2);
  strips(L, '-z', W / 2);
  strips(W, '+x', L / 2);
  strips(W, '-x', L / 2);
  // wall plate and the roof
  b.box(L + 0.1, 0.18, W + 0.1, P.oakDark, { at: [0, wallH - 0.1, 0] });
  const ov = 0.5;
  b.gable(L, W, roofH, shingle, { at: [0, wallH, 0], overhang: ov, wall: plank, thick: 0.18 });
  // shingle courses: thin strips along each slope
  const half = W / 2 + ov;
  const drop = (ov * roofH) / (W / 2);
  const t = 0.18 * Math.hypot(W / 2, roofH) / (W / 2);
  for (const sz of [1, -1]) {
    for (let i = 1; i <= 6; i++) {
      const f = i / 7.2;
      const z = sz * half * (1 - f);
      const y = wallH - drop + (roofH + drop) * f + t;
      beam(b, [-L / 2 - ov, y, z], [L / 2 + ov, y, z], 0.05, tint(shingle, -0.08), 0.05);
    }
  }
  b.box(L + ov * 2, 0.16, 0.3, tint(shingle, -0.12), { at: [0, wallH + roofH + t - 0.05, 0] });
  // smoke louvre over the hearth
  if (o.louvre) {
    b.box(1.0, 0.55, 0.8, plank, { at: [0, wallH + roofH + t - 0.35, 0] });
    b.gable(1.0, 0.8, 0.45, shingle, { at: [0, wallH + roofH + t + 0.2, 0], overhang: 0.15 });
  }
  // doorways with heavy jamb posts
  const sides: (1 | -1)[] = o.doors === 'both' ? [1, -1] : [1];
  for (const s of sides) {
    const f = s > 0 ? '+z' : '-z';
    b.panel(1.3, 2.1, 0x2a211b, { at: [0, 0, s * W / 2], facing: f, depth: 0.06 });
    b.sym((k) => b.box(0.24, 2.4, 0.24, P.oakDark, { at: [k * 0.78, 0, s * (W / 2 + 0.06)] }));
    b.box(1.8, 0.24, 0.24, P.oakDark, { at: [0, 2.2, s * (W / 2 + 0.06)] });
  }
  // raking buttresses: angled posts propping the long walls
  if (o.buttresses) {
    for (const s of [1, -1]) {
      for (const x of spread(6, -L / 2, L / 2)) {
        if (Math.abs(x) < 1.4) continue;
        beam(b, [x, 0, s * (W / 2 + 0.95)], [x, wallH - 0.3, s * (W / 2 + 0.08)], 0.2, P.oak);
      }
    }
  }
}

export const saxonThegnsHall: BuildingDef = {
  id: 'saxon-thegns-hall',
  name: "Thegn's hall",
  style: 'Anglo-Saxon',
  date: 'c. 600 to 1050',
  summary:
    'When the Roman towns emptied, building in mortar and tile was forgotten and the leading household went back to timber. ' +
    'Its home was a long rectangular hall of split oak planks set upright in trenches, under a steep roof of oak shingles with a louvre over the central hearth. ' +
    'The hall was for feasting, business and sleeping; the lord’s family withdrew to a separate bower. ' +
    'By the 10th century a landholder of this rank was called a thegn.',
  materials: ['split oak planks', 'oak shingles', 'earth-fast posts', 'wattle fencing'],
  lookFor: [
    { label: 'Opposed doorways', note: 'A door in the middle of each long wall, facing each other: the classic Anglo-Saxon hall plan.', at: [0, 2.7, 5.0] },
    { label: 'Plank walls', note: 'Oak trunks split into planks and set upright, side by side, in a trench in the ground.', at: [-4.5, 1.4, 5.0] },
    { label: 'Shingled roof and louvre', note: 'Oak shingles laid in overlapping courses; the little hooded louvre on the ridge let out the hearth smoke.', at: [0, 7.6, 1.5] },
    { label: 'Raking buttresses', note: 'Angled posts outside the wall, propping it against the outward push of the heavy roof.', at: [5.6, 1.4, 5.9] },
    { label: 'Bower', note: 'A smaller detached building for the lord’s family: the ‘bur’ of Old English poems, a place for privacy.', at: [5.6, 4.6, -7.4] },
  ],
  build(b) {
    const plank = b.pick([P.oak, tint(P.oak, 0.04), mixOak()]);
    const shingle = b.pick([P.shingle, tint(P.shingle, 0.04), P.oakSilver]);
    const L = b.variant === 0 ? 14 : b.pick([13, 14, 15]);

    // the hall
    b.group({ at: [0, 0, 1.5] }, () =>
      plankBuilding(b, L, 6.6, 2.6, 4.0, { plank, shingle, doors: 'both', louvre: true, buttresses: true }),
    );
    b.box(1.6, 0.12, 0.9, P.gravel, { at: [0, 0, 5.3] });

    // the bower behind, its door facing the hall
    const bs = b.variant === 0 ? 1 : b.pick([1, -1] as const);
    b.group({ at: [5.6 * bs, 0, -7.4], rotY: Math.PI }, () =>
      plankBuilding(b, 5.6, 4.2, 2.3, 2.6, { plank: tint(plank, 0.03), shingle, doors: 'front' }),
    );

    // a sunken-floored workshop hut: roof almost to the ground over a pit
    b.group({ at: [-5.8 * bs, 0, -7.8] }, () => {
      b.box(4.2, 0.45, 3.2, P.wattle);
      b.gable(4.2, 3.2, 2.3, P.thatchOld, { at: [0, 0.45, 0], overhang: 0.3, wall: P.wattle, thick: 0.3 });
      b.panel(0.9, 1.3, 0x2a211b, { at: [2.1, 0, 0], facing: '+x' });
    });

    // palisade round the yard with a gateway
    const ring = roundedRing(9.4, 11.4, 30, 4);
    hurdleFence(b, ring, 1.6, { closed: true, gaps: [0], color: tint(P.oak, 0.06), post: P.oakDark });
    const [g0, g1] = [ring[0], ring[1]];
    for (const [x, z] of [g0, g1]) b.box(0.3, 2.7, 0.3, P.oakDark, { at: [x, 0, z] });
    b.box(Math.hypot(g1[0] - g0[0], g1[1] - g0[1]) + 0.4, 0.25, 0.35, P.oakDark, { at: [(g0[0] + g1[0]) / 2, 2.6, (g0[1] + g1[1]) / 2], rotY: Math.atan2(g1[0] - g0[0], g1[1] - g0[1]) - Math.PI / 2 });
  },
};

function mixOak(): number {
  return tint(P.oakSilver, -0.12);
}
