import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { latheCap, polar, statue, type Pt } from './shared';

// A sixteen-sided drum centred on (0, CZ): a flat face on the front (+Z) for the entrance.
const N = 16;
const CZ = -1.6;
const RC = 15.6; // radius to the corners
const AP = RC * Math.cos(Math.PI / N); // to the middle of a face
const FACE = 2 * RC * Math.sin(Math.PI / N);
const WALL_T = 0.6;
const WH = 12.0; // wall top
const BAND = 5.6; // stone band between the storeys
const RING = 6.5; // the ring is 13 m across
const START = -Math.PI / N; // lathe start, so that a face is centred on +Z
const ROOF: Pt[] = [
  [RC + 0.6, WH - 0.3],
  [RC - 2.6, WH + 1.7],
  [10.5, WH + 3.6],
  [6.5, WH + 5.6],
  [3.4, WH + 7.0],
];
const LANTERN_R = 3.4;

/** The stepped section of the stalls and the upper gallery, [r, y]. */
function seats(): Pt[] {
  const p: Pt[] = [[RING + 0.9, 0.05], [RING + 0.9, 0.9]];
  let r = RING + 0.9;
  let y = 0.9;
  for (let i = 0; i < 8; i++) {
    r += 0.55;
    p.push([r, y]);
    y += 0.4;
    p.push([r, y]);
  }
  // the promenade at the top of the stalls, then the gallery
  r += 0.9;
  p.push([r, y]);
  y += 1.2;
  p.push([r, y]);
  for (let i = 0; i < 3; i++) {
    r += 0.55;
    p.push([r, y]);
    y += 0.55;
    p.push([r, y]);
  }
  p.push([RC * 0.97 - WALL_T, y]);
  return p;
}
const SEATS = seats();
const GAL_R = SEATS[19][0];
const GAL_Y = SEATS[19][1];
/** Half the angle left open in the seating for the ring entrance at -Z. */
const GAP = 0.3;

const C: [number, number, number] = [0, 0, CZ];
const onPlan = (r: number, a: number, y: number): [number, number, number] => {
  const [x, z] = polar(r, a, [0, CZ]);
  return [x, y, z];
};

export const cirque: BuildingDef = {
  id: 'cirque',
  name: 'Cirque',
  style: 'Third Republic eclectic, iron frame',
  date: '1889',
  summary:
    'In the later nineteenth century the circus was the most popular show in France, and towns of any size built it a permanent home. ' +
    'The form follows the act: horses cantering round a ring about 13 m across, the size that lets a rider stand on a horse’s back, with every seat close to the ring and none blocked by a pillar. ' +
    'So the building is round, or many-sided, under a tent-like roof carried on iron trusses that meet at a ventilating lantern; the walls are brick with stone dressings, and only the entrance is grand. ' +
    'Select it to see inside: the roof comes off to show the ring, the stalls, the gallery and the iron frame.',
  materials: ['red brick with stone dressings', 'iron trusses and columns', 'zinc roof', 'timber seating', 'sawdust ring'],
  modelledOn:
    'The Cirque d’Amiens by Émile Ricquier, opened in June 1889 with a speech by Jules Verne, then a town councillor (now the Cirque Jules Verne); also the circus of Reims (1865). ' +
    'The many-sided brick drum, tent roof, lantern and grand entrance follow them; the number of sides and the details are simplified.',
  influences: ['iron-and-rail'],
  lookFor: [
    {
      label: 'The ring (piste)',
      note: 'A circle of sawdust and earth inside a low padded kerb. Its size has hardly changed since the first circuses of the 1770s.',
      at: [0, 0.6, CZ + 2],
    },
    {
      label: 'Polygonal drum',
      note: 'Sixteen brick faces between stone pilasters, each with a tall round-headed window: a cheap way to build something nearly round.',
      at: onPlan(AP + 0.2, (3 * 2 * Math.PI) / N, 4.2),
    },
    {
      label: 'Tent-like roof and lantern',
      note: 'The zinc roof sweeps up like a big top to a glazed lantern, which lets out the heat and smoke of a full house.',
      at: [0, WH + 7.8, CZ + 3.4],
    },
    {
      label: 'Iron trusses and columns',
      note: 'Iron ribs span from the walls to a ring at the top, and slim cast-iron columns carry the gallery, so nothing blocks the view of the ring.',
      at: onPlan(11.5, (5 * 2 * Math.PI) / N, WH + 2.5),
    },
    {
      label: 'Ring entrance and band box',
      note: 'Opposite the public, a curtained passage leads from the stables to the ring; the orchestra played on a balcony above it.',
      at: [0, 5.2, CZ - RING - 3.6],
    },
  ],
  build(b) {
    const cutaway = b.cutaway;
    const brick = tint(P.briqueNord, b.range(-0.03, 0.03));
    const stone = tint(P.pierreBlonde, b.range(-0.02, 0.01));
    const stoneDk = tint(stone, -0.08);
    const zinc = tint(P.zincParis, b.range(-0.03, 0.02));
    const iron = P.castIron;
    const red = tint(P.doorRed, 0.06);
    const sawdust = mix(P.sand, P.pine, 0.4);
    const timber = tint(P.oak, 0.06);
    const gold = tint(P.gold, -0.08);

    // ------------------------------------------------ the drum
    b.group({ at: C }, () => {
      b.lathe([[RC, 0], [RC, WH]], brick, { segs: N, start: START, jitter: false });
      b.lathe([[RC - WALL_T, 0], [RC - WALL_T, WH]], tint(P.plaster, -0.08), { segs: N, start: START, jitter: false });
      b.lathe([[RC - WALL_T, WH], [RC + 0.35, WH], [RC + 0.35, WH - 0.6], [RC, WH - 0.6]], stoneDk, { segs: N, start: START, jitter: false });
      b.lathe([[RC + 0.12, BAND], [RC + 0.12, BAND + 0.45]], stone, { segs: N, start: START, jitter: false });
      b.lathe([[RC + 0.2, 0], [RC + 0.2, 0.7]], stoneDk, { segs: N, start: START, jitter: false });
    });
    for (let k = 0; k < N; k++) {
      // pilasters at the corners
      const ac = START + (k * 2 * Math.PI) / N;
      const [px, pz] = polar(RC + 0.05, ac, [0, CZ]);
      b.box(0.9, WH - 0.6, 0.4, stone, { at: [px, 0, pz], rotY: ac });
      if (k === 0) continue; // the entrance face
      const af = (k * 2 * Math.PI) / N;
      const [x, z] = polar(AP, af, [0, CZ]);
      const behind = k === N / 2;
      b.window(2.2, 4.2, { at: [x, BAND + 1.0, z], facing: af, frame: stone, shape: 'round', bars: [3, 1], glass: tint(P.windowDark, 0.05) });
      if (behind) b.panel(3.0, 3.6, timber, { at: [x, 0.3, z], facing: af }); // the stable door
      else b.window(1.6, 2.4, { at: [x, 1.4, z], facing: af, frame: stone });
      b.panel(FACE - 1.0, 0.3, stone, { at: [x, WH - 1.6, z], facing: af, depth: 0.08 });
    }

    // ------------------------------------------------ the roof: zinc tent and lantern, lifted off when selected
    if (!cutaway) {
      b.group({ at: C }, () => {
        b.lathe(ROOF, zinc, { segs: N, start: START, jitter: false });
        b.lathe([[LANTERN_R, WH + 7.0], [LANTERN_R, WH + 8.9]], tint(P.windowDark, 0.1), { segs: 8, start: -Math.PI / 8, mat: 'glass', jitter: false });
        b.lathe([[LANTERN_R + 0.4, WH + 8.9], [1.2, WH + 10.2], [0.01, WH + 10.6]], zinc, { segs: 8, start: -Math.PI / 8, jitter: false });
        b.cyl(0.06, 2.2, iron, { at: [0, WH + 10.5, 0], segs: 4 });
        b.box(1.2, 0.7, 0.04, tint(P.postRed, 0.05), { at: [0.62, WH + 11.9, 0] });
      });
      // the hip ribs, and mullions on the lantern
      for (let k = 0; k < N; k++) {
        const a = START + (k * 2 * Math.PI) / N;
        for (let i = 0; i < ROOF.length - 1; i++) {
          const p0 = polar(ROOF[i][0], a, [0, CZ]);
          const p1 = polar(ROOF[i + 1][0], a, [0, CZ]);
          b.beam([p0[0], ROOF[i][1] + 0.08, p0[1]], [p1[0], ROOF[i + 1][1] + 0.08, p1[1]], 0.16, 0.12, tint(zinc, -0.08));
        }
      }
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI / 8 + (k * 2 * Math.PI) / 8;
        const [x, z] = polar(LANTERN_R, a, [0, CZ]);
        b.box(0.14, 1.9, 0.14, tint(zinc, -0.1), { at: [x, WH + 7.0, z] });
      }
    } else {
      // the ring at the top that the lantern stood on
      b.group({ at: C }, () => {
        b.lathe([[LANTERN_R, WH + 6.85], [LANTERN_R, WH + 7.15], [LANTERN_R - 0.3, WH + 7.15], [LANTERN_R - 0.3, WH + 6.85]], iron, { segs: N, start: START, jitter: false });
      });
    }
    // the iron trusses under the roof (seen only when it is off)
    for (let k = 0; k < N; k++) {
      const a = START + (k * 2 * Math.PI) / N;
      const pts = ROOF.map(([r, y]) => {
        const [x, z] = polar(Math.min(r, RC - WALL_T), a, [0, CZ]);
        return [x, y - 0.25, z] as [number, number, number];
      });
      for (let i = 0; i < pts.length - 1; i++) b.beam(pts[i], pts[i + 1], 0.14, 0.22, iron);
      // the bottom chord and struts
      const [bx0, bz0] = polar(RC - WALL_T, a, [0, CZ]);
      const [bx1, bz1] = polar(LANTERN_R + 0.2, a, [0, CZ]);
      b.beam([bx0, WH - 0.5, bz0], [bx1, WH + 4.6, bz1], 0.08, 0.1, iron);
      for (const i of [2]) {
        const u = (RC - WALL_T - ROOF[i][0]) / (RC - WALL_T - LANTERN_R - 0.2);
        const yb = WH - 0.5 + u * 5.1;
        const [sx, sz] = polar(ROOF[i][0], a, [0, CZ]);
        b.beam([sx, yb, sz], pts[i], 0.07, 0.07, iron);
      }
    }

    // ------------------------------------------------ inside: the ring, stalls, gallery, columns, ring entrance
    b.group({ at: C }, () => {
      b.lathe([[0, 0.04], [RING, 0.04]], sawdust, { segs: 24, jitter: false });
      b.lathe([[RING, 0], [RING, 0.45], [RING + 0.45, 0.45], [RING + 0.45, 0]], red, { segs: 24, jitter: false });
      b.lathe([[RING + 0.45, 0.02], [RING + 0.9, 0.02]], timber, { segs: 24, jitter: false });
      b.lathe(SEATS, red, { segs: 24, start: Math.PI + GAP, sweep: 2 * Math.PI - 2 * GAP, jitter: false });
      // the seat backs, in timber, along the stalls
      for (let i = 3; i < 17; i += 4) {
        const [r, y] = SEATS[i];
        b.lathe([[r - 0.04, y], [r - 0.04, y + 0.35]], timber, { segs: 24, start: Math.PI + GAP, sweep: 2 * Math.PI - 2 * GAP, jitter: false });
      }
    });
    const cap: Pt[] = [[RING + 0.9, 0], ...SEATS.slice(1), [SEATS[SEATS.length - 1][0], 0]];
    latheCap(b, cap, Math.PI + GAP, tint(P.plaster, -0.12), C);
    latheCap(b, cap, Math.PI - GAP, tint(P.plaster, -0.12), C);
    // cast-iron columns carrying the gallery front and the trusses
    for (let k = 0; k < N; k++) {
      const a = (k * 2 * Math.PI) / N;
      if (Math.abs(a - Math.PI) < GAP + 0.05) continue;
      const [x, z] = polar(GAL_R - 0.15, a, [0, CZ]);
      b.cyl(0.13, WH + 0.5 - GAL_Y + 3.0, iron, { at: [x, GAL_Y - 3.0, z], segs: 6 });
    }
    // the ring entrance with its curtain and, above, the band box
    const ez = CZ - RING - 1.2;
    b.sym((s) => b.box(0.5, 4.2, 6.0, tint(P.plaster, -0.12), { at: [s * 2.3, 0, ez - 3.2] }));
    b.panel(4.2, 3.6, red, { at: [0, 0, CZ - AP + WALL_T + 0.1], facing: '+z', depth: 0.1 });
    b.box(5.4, 0.35, 4.0, tint(P.plaster, -0.12), { at: [0, 4.2, ez - 2.6] });
    b.box(5.4, 0.9, 0.2, gold, { at: [0, 4.55, ez - 0.7] });
    b.panel(4.8, 1.3, red, { at: [0, 5.3, CZ - AP + WALL_T + 0.1], facing: '+z', shape: 'segmental', depth: 0.1 });

    // ------------------------------------------------ the entrance front
    const fz = CZ + AP;
    const FW = 11;
    const FH = 12.0;
    const FD = 3.4;
    b.box(FW, FH, FD, stone, { at: [0, 0, fz + FD / 2 - 0.6] });
    const ff = fz + FD - 0.6;
    b.panel(5.2, 9.4, stoneDk, { at: [0, 0, ff], shape: 'round', depth: 0.05 });
    b.panel(4.6, 8.9, P.windowDark, { at: [0, 0.1, ff + 0.03], shape: 'round', depth: 0.06 });
    // the doors and the glazed fanlight above them
    for (const x of [-1.5, 0, 1.5]) b.panel(1.2, 2.9, timber, { at: [x, 0.1, ff + 0.08], depth: 0.04 });
    b.panel(4.6, 0.25, stone, { at: [0, 3.2, ff + 0.08], depth: 0.06 });
    for (const x of [-1.15, 0, 1.15]) b.panel(0.1, 5.4, stone, { at: [x, 3.45, ff + 0.08], depth: 0.04 });
    b.sym((s) => {
      for (const dx of [0, 1.15]) b.column(0.3, 10.2, stone, { at: [s * (3.45 + dx), 0.6, ff + 0.32], order: 'ionic', segs: 8 });
      b.box(1.8, 0.6, 0.9, stoneDk, { at: [s * 4.0, 0, ff + 0.3] });
      b.panel(0.9, 1.9, stoneDk, { at: [s * 4.0, 1.6, ff], shape: 'round', depth: 0.02 }); // statue niche below
    });
    b.box(FW + 0.4, 1.2, FD + 0.3, stoneDk, { at: [0, 10.8, fz + FD / 2 - 0.55] }); // entablature
    b.panel(6.2, 0.7, mix(P.gold, stone, 0.4), { at: [0, 11.05, ff + 0.15], depth: 0.04 }); // the name board
    b.extrude([[-FW / 2 - 0.2, 0], [FW / 2 + 0.2, 0], [0, 3.0]], FD + 0.3, stoneDk, { at: [0, FH, fz + FD / 2 - 0.55] });
    b.extrude([[-FW / 2 + 0.7, 0.3], [FW / 2 - 0.7, 0.3], [0, 2.55]], 0.4, stone, { at: [0, FH, ff + 0.0] });
    b.panel(1.4, 1.4, P.white, { at: [0, FH + 0.55, ff + 0.2], shape: 'circle', depth: 0.06 }); // clock
    statue(b, [0, FH + 2.9, fz + FD / 2 - 0.4], 2.2, tint(stone, 0.04));
    b.sym((s) => {
      b.box(0.9, 0.8, 0.9, stone, { at: [s * (FW / 2 - 0.2), FH, ff - 0.3] });
      statue(b, [s * (FW / 2 - 0.2), FH + 0.8, ff - 0.3], 1.9, tint(stone, 0.04));
    });
    // gas lamps
    b.sym((s) => {
      b.cyl(0.08, 3.6, iron, { at: [s * 6.6, 0, ff + 1.2], segs: 5 });
      b.box(0.4, 0.55, 0.4, mix(P.windowLit, P.glass, 0.5), { at: [s * 6.6, 3.6, ff + 1.2] });
    });

    // ------------------------------------------------ walk collisions: the drum as an octagon, and the front
    b.collider(AP * 2, AP * 2, { at: C });
    b.collider(AP * 2, AP * 2, { at: C, rotY: Math.PI / 4 });
    b.collider(FW, FD, { at: [0, 0, fz + FD / 2 - 0.6] });
  },
};
