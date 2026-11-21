import { P, spread, tint, type Builder, type BuildingDef } from '@ah/kit';
import { bigJar, ground, pole } from './shared';

// the hut: a rounded oblong ("stadium") plan, straight sides of length L and semicircular ends of radius R
const L = 4.8;
const R = 3.1;
const H = 1.7; // wall height
const RISE = 3.5; // roof rise above the wall top: steep, as thatch must be
const OV = 0.5; // eaves overhang
const HX = -2.6; // hut centre
const HZ = -3.6;

/** A thatched roof over a stadium plan: two half cones on the ends and a ridged prism between. */
function stadiumRoof(b: Builder, cx: number, y: number, cz: number, color: number): void {
  const drop = (OV * RISE) / R;
  const t = 0.22;
  b.extrude(
    [[-R - OV, -drop + t], [-R - OV + 0.06, -drop - 0.06], [R + OV - 0.06, -drop - 0.06], [R + OV, -drop + t], [0, RISE + t]],
    L,
    color,
    { at: [cx, y, cz], rotY: Math.PI / 2 },
  );
  for (const s of [1, -1]) {
    b.lathe([[R + OV - 0.06, -drop - 0.06], [R + OV, -drop + t], [0.02, RISE + t]], color, {
      at: [cx + (s * L) / 2, y, cz],
      start: s > 0 ? 0 : Math.PI,
      sweep: Math.PI,
      segs: 8,
    });
  }
}

export const hearthHut: BuildingDef = {
  id: 'hearth-hut',
  name: 'Communal hut and hearth',
  style: 'Latial Iron Age',
  date: 'c. 750 BC',
  summary:
    'Before there were inns there was hospitality: a stranger was taken in by a household and fed at its fire, and the bond between host and guest was held sacred. ' +
    'The village on the hill is a scatter of huts, and a larger one like this, perhaps the house of a leading family, could hold a gathering, with food for many cooked on an open hearth outside. ' +
    'It is built as the clay hut-shaped urns of the period show it: a wall of wattle and daub on a ring of posts, a steep thatched roof with crossed poles along the ridge, and a porch before the door.',
  materials: ['oak posts', 'wattle and daub', 'straw and reed thatch', 'impasto pottery'],
  modelledOn: 'The hut-shaped cinerary urns of Latium and the post-holes of the huts on the Palatine, Rome',
  lookFor: [
    { label: 'Crossed ridge poles', note: 'Pairs of crossed timbers hold the thatch down along the ridge, a detail modelled on the clay hut urns that held the ashes of the dead.', at: [HX + L / 2 + 0.3, H + RISE + 0.9, HZ] },
    { label: 'Wattle and daub', note: 'Woven branches plastered with clay between upright posts. Rows of post-holes cut in the rock of the Palatine trace walls like this one.', at: [HX + L / 2 + R + 0.15, 1.0, HZ] },
    { label: 'Porch', note: 'Two posts carry a little roof before the only door, as several of the hut urns show.', at: [HX, 2.1, HZ + R + 1.6] },
    { label: 'Open hearth', note: 'A clay floor ringed with stones, with a spit on forked posts and a clay stand for the pot: cooking for a crowd done out in the open, away from the thatch.', at: [5.2, 1.3, 4.0] },
    { label: 'Impasto jars', note: 'Big storage jars of impasto, the coarse dark pottery of the age, made by hand without a wheel.', at: [-7.2, 1.0, 1.0] },
  ],
  build(b) {
    const thatch = b.pick([P.thatch, P.thatchOld, tint(P.thatch, -0.05)]);
    const daub = b.pick([P.daub, tint(P.daub, -0.04), P.cob]);
    const post = P.oakDark;
    const impasto = b.pick([0x5a463a, 0x4e3f36]);

    // trodden earth round the hut and hearth
    ground(b, 19, 17, P.earth, [0, -0.5], 0.03);
    ground(b, 5.5, 5, tint(P.earth, -0.04), [5, 3.6], 0.05);

    // ---------------- the hut
    // low stone footing, then the daub wall
    b.group({ at: [HX, 0, HZ] }, () => {
      for (const s of [1, -1]) {
        b.lathe([[R + 0.12, 0], [R + 0.12, 0.25], [R, 0.3]], tint(P.tufa, -0.1), { at: [(s * L) / 2, 0, 0], start: s > 0 ? 0 : Math.PI, sweep: Math.PI, segs: 10 });
        b.lathe([[R, 0], [R, H]], daub, { at: [(s * L) / 2, 0, 0], start: s > 0 ? 0 : Math.PI, sweep: Math.PI, segs: 10 });
        b.box(L, 0.3, 0.28, tint(P.tufa, -0.1), { at: [0, 0, s * (R - 0.02)] });
        b.box(L, H, 0.2, daub, { at: [0, 0, s * (R - 0.1)] });
        // the wall posts, showing through the daub
        for (const x of spread(4, -L / 2, L / 2)) b.box(0.16, H, 0.08, post, { at: [x, 0, s * R] });
        for (const a of spread(5, 0, Math.PI)) {
          b.group({ at: [(s * L) / 2 + s * Math.sin(a) * R, 0, Math.cos(a) * R], rotY: s * a }, () => b.box(0.16, H, 0.08, post));
        }
      }
      // door and porch on the long front side
      b.panel(1.0, 1.55, P.timberBlack, { at: [0, 0.05, R], facing: '+z', depth: 0.04 });
      b.panel(1.25, 0.14, post, { at: [0, 1.6, R], facing: '+z', depth: 0.08 });
      b.sym((s) => {
        b.box(0.14, 1.75, 0.14, post, { at: [s * 0.9, 0, R + 1.4] });
        b.box(0.14, 1.75, 0.14, post, { at: [s * 0.8, 0, R + 0.05] });
      });
      b.box(2.0, 0.12, 1.6, post, { at: [0, 1.75, R + 0.7] });
      b.gable(2.4, 1.9, 0.95, thatch, { at: [0, 1.85, R + 0.75], ridge: 'z', overhang: 0.2, thick: 0.18 });
      // porch threshold of beaten clay
      b.box(2.2, 0.08, 1.6, tint(P.mud, 0.06), { at: [0, 0, R + 0.75], jitter: false });
    });
    stadiumRoof(b, HX, H, HZ, thatch);
    // ridge pole and crossed poles (as on the hut urns)
    const top = H + RISE + 0.22;
    pole(b, [HX - L / 2 - 0.5, top + 0.08, HZ], [HX + L / 2 + 0.5, top + 0.08, HZ], 0.1, post);
    for (const x of [HX - L / 2 - 0.1, HX - L / 6, HX + L / 6, HX + L / 2 + 0.1]) {
      b.beam([x, top - 0.55, HZ - 0.75], [x, top + 0.75, HZ + 0.55], 0.1, 0.1, post);
      b.beam([x, top - 0.55, HZ + 0.75], [x, top + 0.75, HZ - 0.55], 0.1, 0.1, post);
    }

    // ---------------- the outdoor hearth
    const hx = 5;
    const hz = 3.6;
    b.cyl(1.05, 0.1, tint(P.mud, 0.08), { at: [hx, 0, hz], segs: 10 });
    for (const a of spread(11, 0, Math.PI * 2)) {
      b.blob(0.2, b.pick([P.rubble, P.tufa, P.peperino]), { at: [hx + Math.sin(a) * 1.1, 0.1, hz + Math.cos(a) * 1.1], stretch: [1, 0.7, 1], detail: 0 });
    }
    // embers and ash
    b.blob(0.35, 0x8a8178, { at: [hx, 0.08, hz], stretch: [1.4, 0.3, 1.2], detail: 0 });
    b.blob(0.18, P.cladRed, { at: [hx + 0.1, 0.13, hz - 0.1], stretch: [1.4, 0.5, 1], detail: 0 });
    b.blob(0.12, P.doorYellow, { at: [hx - 0.15, 0.15, hz + 0.1], detail: 0 });
    // spit on two forked posts, with a joint on it
    b.sym((s) => {
      pole(b, [hx + s * 0.95, 0, hz], [hx + s * 0.95, 1.05, hz], 0.05, post);
      b.beam([hx + s * 0.95, 0.95, hz], [hx + s * 1.1, 1.2, hz], 0.05, 0.05, post);
      b.beam([hx + s * 0.95, 0.95, hz], [hx + s * 0.8, 1.2, hz], 0.05, 0.05, post);
    });
    pole(b, [hx - 1.25, 1.08, hz], [hx + 1.25, 1.08, hz], 0.035, P.oakDark);
    b.blob(0.22, 0x8c4a3a, { at: [hx, 0.98, hz], stretch: [1.5, 0.8, 0.9], detail: 0 });
    // a clay cooking stand (fornello) with a pot on it
    b.cyl(0.32, 0.5, tint(impasto, 0.12), { at: [hx + 1.2, 0, hz + 1.5], rTop: 0.28, segs: 8 });
    b.panel(0.22, 0.2, P.timberBlack, { at: [hx + 1.2, 0.05, hz + 1.5 + 0.31], facing: '+z', depth: 0.03 });
    b.lathe([[0.0, 0], [0.18, 0.02], [0.3, 0.2], [0.26, 0.4], [0.28, 0.44], [0.0, 0.44]], impasto, { at: [hx + 1.2, 0.5, hz + 1.5], segs: 8 });
    // log benches round the fire, and a pile of firewood
    for (const [x, z, r] of [[hx - 2.3, hz + 0.3, 0.2], [hx + 0.3, hz - 2.2, 1.6], [hx - 0.4, hz + 2.3, 1.5]] as const) {
      b.log(0.18, 1.9, P.bark, { at: [x, 0, z], rotY: r, segs: 6 });
    }
    for (let i = 0; i < 6; i++) {
      b.log(0.09, 1.3, tint(P.bark, (i % 3) * 0.04), { at: [hx + 2.6 + (i % 3) * 0.2, (i > 2 ? 0.17 : 0), hz - 1.6 + (i % 3) * 0.18], axis: 'z', segs: 5 });
    }

    // ---------------- storage: jars beside the hut, a pit, a raised granary
    bigJar(b, [-7.2, 0, 0.4], 1.0, impasto);
    bigJar(b, [-6.4, 0, 1.0], 0.8, tint(impasto, 0.06));
    bigJar(b, [-7.4, 0, 1.4], 0.65, impasto);
    b.cyl(0.6, 0.04, P.timberBlack, { at: [-4.6, 0.02, 3.2], segs: 9 });
    b.cyl(0.66, 0.1, P.rubble, { at: [-4.3, 0.02, 3.4], segs: 7, rot: [0.15, 0, 0.1] });
    // granary on posts, out of reach of damp and mice
    const gx = 6.2;
    const gz = -6.2;
    for (const [x, z] of [[-1, -0.9], [1, -0.9], [-1, 0.9], [1, 0.9]] as const) {
      b.box(0.16, 1.2, 0.16, post, { at: [gx + x, 0, gz + z] });
      b.cyl(0.22, 0.08, P.rubble, { at: [gx + x, 1.1, gz + z], segs: 6 });
    }
    b.box(2.5, 0.12, 2.3, post, { at: [gx, 1.18, gz] });
    b.box(2.1, 1.1, 1.9, daub, { at: [gx, 1.3, gz] });
    b.panel(0.6, 0.8, P.timberBlack, { at: [gx, 1.35, gz + 0.95], facing: '+z', depth: 0.04 });
    b.gable(2.1, 1.9, 1.25, thatch, { at: [gx, 2.4, gz], overhang: 0.3, thick: 0.18, wall: daub });
    b.beam([gx - 0.3, 0, gz + 2.1], [gx - 0.3, 1.2, gz + 1.15], 0.4, 0.06, P.oak);

    // ---------------- a wattle fence behind, and oaks
    for (const x of spread(14, -10, 9.5)) {
      b.box(0.1, 1.2, 0.1, post, { at: [x, 0, -9.8] });
    }
    b.box(19.5, 0.7, 0.08, P.wattle, { at: [-0.25, 0.3, -9.8] });
    b.sym((s) => b.box(0.08, 0.7, 6, P.wattle, { at: [s * 9.9, 0.3, -6.8] }));
    b.tree(7.5, { at: [-7.6, 0, -8.0], kind: 'round' });
    b.tree(6.5, { at: [8.4, 0, 0.2], kind: 'round' });

    b.collider(L + 2 * R + 0.4, 2 * R + 0.4, { at: [HX, 0, HZ] });
    b.collider(2.5, 2.3, { at: [gx, 0, gz] });
  },
};
