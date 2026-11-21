import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { arcLathe, beam, lineColliders, quad, soup } from './shared';

/**
 * A hall with gently bowed long walls: the plan bulges by `bow` at mid-length. Walls of upright
 * planks, a steep shingled roof whose eaves follow the bow, gable ends with crossed bargeboards.
 */
function bowedHall(
  b: Builder,
  o: { L: number; W: number; bow: number; H: number; rise: number; wall: number; roof: number; post: number; trim: number },
) {
  const { L, W, bow, H, rise, wall, roof, post, trim } = o;
  const hw = (x: number) => W / 2 + bow * (1 - ((2 * x) / L) ** 2);
  const N = 10;
  const xs = Array.from({ length: N + 1 }, (_, i) => -L / 2 + (L * i) / N);
  // walls: the bowed plan extruded upwards
  const plan: [number, number][] = [...xs.map((x) => [x, hw(x)] as [number, number]), ...xs.slice().reverse().map((x) => [x, -hw(x)] as [number, number])];
  b.extrude(plan, H, wall, { at: [0, H / 2, 0], rot: [-Math.PI / 2, 0, 0] });
  // sill beam and wall plate
  b.extrude(plan, 0.25, tint(wall, -0.08), { at: [0, H - 0.25 + 0.125, 0], rot: [-Math.PI / 2, 0, 0] });

  // roof: eaves follow the bow, the ridge is straight
  const ov = 0.7;
  const drop = 0.5;
  const ridgeY = H + rise;
  const out: number[] = [];
  const ex = [-(L / 2 + ov), ...xs.slice(1, -1), L / 2 + ov];
  for (const s of [1, -1]) {
    for (let i = 0; i < N; i++) {
      const x0 = ex[i];
      const x1 = ex[i + 1];
      const z0 = s * (hw(Math.max(-L / 2, Math.min(L / 2, x0))) + ov);
      const z1 = s * (hw(Math.max(-L / 2, Math.min(L / 2, x1))) + ov);
      quad(out, [x0, H - drop, z0], [x1, H - drop, z1], [x1, ridgeY, 0], [x0, ridgeY, 0]);
    }
  }
  soup(b, out, roof);
  // a second skin a little above so the roof has visible thickness at the eaves
  const out2: number[] = [];
  for (const s of [1, -1]) {
    for (let i = 0; i < N; i++) {
      const x0 = ex[i];
      const x1 = ex[i + 1];
      const z0 = s * (hw(Math.max(-L / 2, Math.min(L / 2, x0))) + ov);
      const z1 = s * (hw(Math.max(-L / 2, Math.min(L / 2, x1))) + ov);
      quad(out2, [x0, H - drop, z0], [x1, H - drop, z1], [x1, H - drop + 0.22, z1], [x0, H - drop + 0.22, z0]);
    }
  }
  soup(b, out2, tint(roof, -0.1));
  b.sym((sx) => {
    // planked gable triangle
    b.extrude([[-W / 2, 0], [W / 2, 0], [0, rise]], 0.2, wall, { at: [sx * (L / 2 - 0.1), H, 0], rotY: Math.PI / 2 });
    // crossed bargeboards projecting above the ridge as carved horns
    const span = W / 2 + ov;
    const len = Math.hypot(span, rise + drop) + 1.5;
    b.sym((sz) => {
      const th = Math.atan2(-sz * span, rise + drop);
      b.box(0.16, len, 0.42, trim, { at: [sx * (L / 2 + ov + 0.05), H - drop, sz * span], rot: [th, 0, 0] });
    });
  });

  // raking buttress posts against both long walls
  for (const s of [1, -1]) {
    for (const x of spread(11, -L / 2 + 0.6, L / 2 - 0.6)) {
      if (Math.abs(x) < 1.6) continue; // the doorway
      const z = s * (hw(x) + 0.5);
      b.box(0.32, H - 0.3, 0.3, post, { at: [x, 0, z], rot: [-s * 0.14, 0, 0] });
    }
  }
}

export const saxonGreatHall: BuildingDef = {
  id: 'saxon-great-hall',
  name: "Lord's great hall",
  style: 'Anglo-Saxon',
  date: 'c. 600',
  summary:
    'After Rome left, the stone forum fell into ruin and was robbed for building stone. Power returned to timber: a king or lord ruled from a great hall where he feasted his warriors and gave out gifts, as in the poem Beowulf. ' +
    'This one follows the royal hall excavated at Yeavering in Northumberland, about 25 metres long, with slightly bowed walls of heavy planks, sloping posts propping them from outside and a steep roof of oak shingles. ' +
    'Around it stand lesser halls, a sunken hut and a timber grandstand for assemblies, all inside a fence.',
  materials: ['oak planks and posts', 'oak shingles', 'wattle fencing'],
  lookFor: [
    { label: 'Bowed walls', note: 'The long walls bulge gently outwards in the middle, so the hall is a little wider at its centre than at its ends.', at: [6, 2.2, -0.4] },
    { label: 'Raking buttress posts', note: 'Sloping posts set in the ground outside the wall help take the outward push of the heavy roof.', at: [-8, 1.5, 3.4] },
    { label: 'Shingled roof', note: 'Split oak tiles, called shingles, laid in overlapping rows on a steep roof that sheds rain fast.', at: [-4, 8.2, -3.4] },
    { label: 'Carved gable horns', note: 'The bargeboards cross at the ridge and run on into horn-like points; the hall in Beowulf is called Heorot, the hart, perhaps for such horns.', at: [-15, 11, -4] },
    { label: 'Grandstand', note: 'Tiered timber seats facing a speaker, like the one dug up at Yeavering, where the king met his people.', at: [-12, 2.4, 12] },
  ],
  modelledOn: 'The royal township of Yeavering (Ad Gefrin), Northumberland, 7th century',
  build(b) {
    const plank = mix(P.oak, P.oakSilver, 0.35);
    const post = P.oakDark;
    const HZ = -4; // hall centre line

    b.group({ at: [0, 0, HZ] }, () => {
      bowedHall(b, { L: 22, W: 10, bow: 0.55, H: 3.6, rise: 6.4, wall: plank, roof: P.shingle, post, trim: tint(P.oak, -0.05) });
      // doors in the middle of each long wall
      b.panel(1.8, 2.6, P.oakDark, { at: [0, 0, 5.56], facing: '+z' });
      b.panel(1.8, 2.6, P.oakDark, { at: [0, 0, -5.56], facing: '-z' });
      b.sym((s) => b.box(0.4, 3.2, 0.4, post, { at: [s * 1.2, 0, 5.75] }));
      // end annexes, lower and plainer
      b.sym((s) => {
        b.box(3.2, 3, 6.4, plank, { at: [s * 12.6, 0, 0] });
        b.gable(3.2, 6.4, 3.2, P.shingle, { at: [s * 12.6, 3, 0], ridge: 'x', overhang: 0.4 });
        b.panel(1.2, 2.2, P.oakDark, { at: [s * 12.6, 0, 3.2], facing: '+z' });
      });
    });

    // lesser hall (the lord's bower) at the back right
    b.group({ at: [11.5, 0, -15.2], rotY: 0.04 }, () => {
      bowedHall(b, { L: 11, W: 5.6, bow: 0.25, H: 2.8, rise: 3.8, wall: plank, roof: tint(P.shingle, 0.04), post, trim: P.oak });
      b.panel(1.3, 2.2, P.oakDark, { at: [0, 0, 3.1], facing: '+z' });
    });

    // sunken-featured building: a hut over a pit, roof almost to the ground
    b.group({ at: [12.5, 0, 10.5], rotY: -0.1 }, () => {
      b.box(4.6, 0.6, 3.6, P.wattle, {});
      b.gable(4.6, 3.6, 2.6, P.thatchOld, { at: [0, 0.6, 0], ridge: 'x', overhang: 0.3, thick: 0.35, wall: P.wattle });
      b.panel(1.0, 1.4, P.oakDark, { at: [2.3, 0, 0], facing: '+x' });
    });

    // grandstand: a wedge of tiered benches facing a speaker's post, as at Yeavering
    b.group({ at: [-12, 0, 6.5] }, () => {
      const a0 = Math.PI / 2 - 0.36;
      const a1 = Math.PI / 2 + 0.36;
      for (let i = 0; i < 6; i++) {
        const r0 = 2 + i * 1.1;
        const y = 0.35 + i * 0.4;
        arcLathe(b, [[r0, y], [r0 + 1.1, y]], a0, a1, 5, tint(P.oak, i % 2 ? 0.04 : 0));
        arcLathe(b, [[r0, y - 0.4], [r0, y]], a0, a1, 5, P.oakDark);
      }
      arcLathe(b, [[8.6, 0], [8.6, 2.75]], a0, a1, 5, P.oakDark);
      b.box(0.3, 2.6, 0.3, P.oakDark, { at: [0, 0, 0.6] });
      b.box(1.6, 0.4, 1.2, P.oak, { at: [0, 0, 1.2] });
    });

    // fence of split planks round the royal enclosure, with a gate on the front
    const fence = tint(P.oak, 0.06);
    const C = 19.6;
    const run: [number, number][] = [[2.4, C], [C, C], [C, -C], [-C, -C], [-C, C], [-2.4, C]];
    for (let i = 0; i < run.length - 1; i++) beam(b, run[i], run[i + 1], 0.12, 2.1, fence);
    for (let i = 0; i < run.length - 1; i++) {
      const [x0, z0] = run[i];
      const [x1, z1] = run[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      const n = Math.round(L / 3);
      for (let k = 0; k <= n; k++) {
        b.box(0.26, 2.4, 0.26, post, { at: [x0 + ((x1 - x0) * k) / n, 0, z0 + ((z1 - z0) * k) / n] });
      }
    }
    b.sym((s) => b.box(0.4, 3.4, 0.4, post, { at: [s * 2.5, 0, C] }));
    b.box(5.6, 0.35, 0.4, post, { at: [0, 3.2, C] });
    b.box(2.3, 2.0, 0.1, plank, { at: [-1.4, 0, C - 1.1], rotY: 1.2 });
    b.box(2.3, 2.0, 0.1, plank, { at: [1.4, 0, C - 1.1], rotY: -1.2 });
    // a track from the gate to the hall door
    b.box(3, 0.03, 13, mix(P.earth, P.grass, 0.4), { at: [0, 0, 13.2], jitter: false });

    // colliders
    b.collider(22.2, 11.4, { at: [0, 0, HZ] });
    b.sym((s) => b.collider(3.2, 6.4, { at: [s * 12.6, 0, HZ] }));
    b.collider(11.2, 6.4, { at: [11.5, 0, -15.2] });
    b.collider(4.6, 3.6, { at: [12.5, 0, 10.5] });
    const gp = (r: number, a: number): [number, number] => [-12 + r * Math.cos(a), 6.5 + r * Math.sin(a)];
    const ga = Math.PI / 2;
    lineColliders(b, [gp(2, ga - 0.36), gp(8.6, ga - 0.36), gp(8.6, ga + 0.36), gp(2, ga + 0.36), gp(2, ga - 0.36)], 0.8);
    const fenceRun = run;
    for (let i = 0; i < fenceRun.length - 1; i++) {
      const [x0, z0] = fenceRun[i];
      const [x1, z1] = fenceRun[i + 1];
      b.collider(Math.abs(x1 - x0) + 0.3, Math.abs(z1 - z0) + 0.3, { at: [(x0 + x1) / 2, 0, (z0 + z1) / 2] });
    }
  },
};
