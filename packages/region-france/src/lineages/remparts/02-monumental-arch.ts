import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { HALF, NJ, archPanel, gateMass, merlonsX, road, voussoirs } from './shared';

/*
 * The triple arch, after the Porte de Mars at Reims. One model serves two stages: standing free
 * across the road (monumental-arch), and built into the late Roman wall as its gate (castrum-wall),
 * with the side arches blocked and battlements on top.
 */
export const ARCH = {
  w: 22,
  d: 5,
  h: 10.0, // to the top of the cornice
  attic: 1.5,
  central: { w: 5.0, h: 7.7 },
  side: { x: 7.0, w: 3.0, h: 5.8 },
  /** x ranges of the four piers */
  piers: [[-11, -8.5], [-5.5, -2.5], [2.5, 5.5], [8.5, 11]] as [number, number][],
  /** engaged Corinthian columns on each face, and the niches between each pair */
  cols: [-10.55, -8.95, -4.95, -3.05, 3.05, 4.95, 8.95, 10.55],
  niches: [-9.75, -4.0, 4.0, 9.75],
};

export const ARCH_STONE = mix(P.pierreBlonde, P.limestone, 0.4);

/** The triple arch, centred on the origin, front (field side) at z = +d/2. */
export function porteDeMars(b: Builder, o?: { blocked?: boolean; parapet?: boolean }): void {
  const { w, d, h, attic, central, side } = ARCH;
  const stone = ARCH_STONE;
  const shade = tint(stone, -0.07);
  const deep = tint(stone, -0.28);
  const spring = central.h - central.w / 2;
  const sSpring = side.h - side.w / 2;

  // the body, pierced by the three passages, on a plinth
  gateMass(b, w, h - 0.45, d, stone, { xs: [-side.x, 0, side.x], openW: [side.w, central.w, side.w], openH: [side.h, central.h, side.h] });
  for (const [x0, x1] of ARCH.piers) b.box(x1 - x0 + 0.4 * (Math.abs(x0) > 10 || Math.abs(x1) > 10 ? 1 : 0) + 0.02, 0.55, d + 0.4, shade, { at: [(x0 + x1) / 2 + (x0 < -10 ? -0.2 : x1 > 10 ? 0.2 : 0), 0, 0], ...NJ });
  // entablature: architrave, frieze and a cornice that runs round all four sides
  b.box(w + 0.1, 0.55, d + 0.25, tint(stone, 0.02), { at: [0, h - 1.6, 0] });
  b.box(w, 0.6, d + 0.1, stone, { at: [0, h - 1.05, 0] });
  b.box(w + 0.7, 0.45, d + 0.9, tint(stone, 0.04), { at: [0, h - 0.45, 0] });
  // the attic
  b.box(w - 0.8, attic, d - 0.4, stone, { at: [0, h, 0] });
  b.box(w - 0.5, 0.25, d - 0.1, tint(stone, 0.04), { at: [0, h + attic, 0] });

  for (const f of [1, -1] as const) {
    const z = (f * d) / 2;
    const facing = f > 0 ? '+z' : '-z';
    // paired Corinthian columns on tall pedestals, standing proud of the piers
    for (const x of ARCH.cols) {
      b.box(0.95, 1.55, 0.55, shade, { at: [x, 0.55, z + f * 0.2], ...NJ });
      b.box(1.05, 0.18, 0.65, tint(stone, 0.03), { at: [x, 1.95, z + f * 0.22], ...NJ });
      b.column(0.29, h - 1.6 - 2.13, stone, { order: 'corinthian', at: [x, 2.13, z + f * 0.25], segs: 8 });
    }
    // niches between each pair: an arched one below, a square one above
    for (const x of ARCH.niches) {
      archPanel(b, 0.72, 2.1, deep, { at: [x, 2.4, z], facing, depth: 0.03 });
      b.panel(0.62, 0.95, deep, { at: [x, 5.6, z], facing, depth: 0.03 });
      b.panel(0.9, 0.12, tint(stone, 0.05), { at: [x, 5.45, z], facing, depth: 0.08 });
    }
    // archivolts round the three arches, and imposts at the springing
    voussoirs(b, central.w, spring, 0.55, tint(stone, 0.03), { at: [0, 0, z], facing, n: 11, proud: 0.12, vary: 0.03, keyExtra: 0.25 });
    for (const sx of [-1, 1]) {
      voussoirs(b, side.w, sSpring, 0.42, tint(stone, 0.03), { at: [sx * side.x, 0, z], facing, n: 9, proud: 0.1, vary: 0.03 });
      b.panel(0.5, 0.22, tint(stone, 0.05), { at: [sx * (central.w / 2 + 0.25), spring - 0.22, z], facing, depth: 0.1 });
      for (const ex of [-1, 1]) b.panel(0.4, 0.2, tint(stone, 0.05), { at: [sx * side.x + ex * (side.w / 2 + 0.2), sSpring - 0.2, z], facing, depth: 0.1 });
      // a round shield (clipeus) carved in the space over each side arch
      b.panel(0.95, 0.95, tint(stone, 0.06), { at: [sx * side.x, side.h + 0.75, z], facing, shape: 'circle', depth: 0.1 });
    }
    // an inscription panel on the attic
    b.panel(7.0, 0.95, tint(stone, 0.05), { at: [0, h + 0.28, z - f * 0.2], facing, depth: 0.06 });
    for (const y of [h + 0.5, h + 0.85]) b.panel(5.8, 0.06, deep, { at: [0, y, z - f * 0.2], facing, depth: 0.08 });
  }

  // the carved vaults: the labours of the months in coffers under the central arch, a single great panel
  // under each side arch (the she-wolf with Romulus and Remus on one side, Leda and the swan on the other)
  const a = central.w / 2;
  const relief = tint(stone, 0.06);
  for (const t of [Math.PI / 2 - 0.62, Math.PI / 2, Math.PI / 2 + 0.62]) {
    for (const z of [-1.65, -0.55, 0.55, 1.65]) {
      const at = (r: number): [number, number, number] => [r * Math.cos(t), spring + r * Math.sin(t), z];
      b.box(1.2, 0.05, 0.9, deep, { at: at(a - 0.05), rot: [0, 0, t - Math.PI / 2], ...NJ });
      b.box(0.5, 0.1, 0.45, relief, { at: at(a - 0.14), rot: [0, 0, t - Math.PI / 2], ...NJ });
    }
  }
  for (const sx of [-1, 1]) {
    const sa = side.w / 2;
    b.box(1.6, 0.05, d - 1.2, deep, { at: [sx * side.x, sSpring + sa - 0.05, 0], ...NJ });
    b.box(0.8, 0.1, 1.4, relief, { at: [sx * side.x, sSpring + sa - 0.15, 0], ...NJ });
  }

  if (o?.blocked) {
    // the side passages walled up in rubble, leaving only the middle one as the gate
    const fill = mix(P.rubble, P.flint, 0.25);
    for (const sx of [-1, 1]) {
      b.group({ at: [sx * side.x, 0, 0] }, () => {
        const pts: [number, number][] = [[-side.w / 2, 0], [side.w / 2, 0]];
        for (let i = 0; i <= 10; i++) pts.push([(side.w / 2) * Math.cos((i / 10) * Math.PI), sSpring + (side.w / 2) * Math.sin((i / 10) * Math.PI)]);
        b.extrude(pts, d - 0.9, fill, NJ);
      });
    }
  }
  if (o?.parapet) {
    // a fighting parapet set up on the attic
    const y = h + attic + 0.25;
    merlonsX(b, -w / 2 + 0.6, w / 2 - 0.6, y, d / 2 - 0.5, stone, { w: 1.0, h: 1.5, t: 0.55, gap: 0.85 });
    b.box(w - 1.2, 0.9, 0.45, stone, { at: [0, y, -d / 2 + 0.55] });
  }
}

/** Colliders for the four piers. */
export function archColliders(b: Builder): void {
  for (const [x0, x1] of ARCH.piers) b.collider(x1 - x0 + 0.4, ARCH.d + 0.6, { at: [(x0 + x1) / 2, 0, 0] });
}

export const monumentalArch: BuildingDef = {
  id: 'monumental-arch',
  name: 'Triumphal arch at the town’s entrance',
  style: 'Gallo-Roman',
  date: 'late 2nd or early 3rd century AD',
  summary:
    'Under the Roman peace most towns of northern Gaul had no walls. Instead the main road into town passed under a monumental arch that marked where the town began, much as a city gate would, but built for show. There is one on each of the main roads. ' +
    'This one has three passages, a wide one for wheeled traffic and two narrow ones for people on foot, between piers dressed with Corinthian columns and niches, and the undersides of its arches are carved: the labours of the twelve months in the middle, Romulus and Remus with the she-wolf, and Leda and the swan, in the side arches. ' +
    'The Gaulish rampart had kept people out; the arch invites them in, and tells them that this is a Roman town.',
  materials: ['limestone ashlar', 'mortared rubble core'],
  modelledOn:
    'The Porte de Mars at Reims, the ancient Durocortorum, capital of the province of Gallia Belgica: an arch over 30 m long with three bays, usually dated to the late 2nd or early 3rd century. The calendar, the she-wolf and Leda are its real vault reliefs. Here it is made shorter to fit the plot and given back its attic, now lost.',
  influences: ['roman-conquest'],
  lookFor: [
    { label: 'Triple arch', note: 'A wide middle arch for carts and two narrow side arches for people on foot.', at: [0, ARCH.central.h + 0.9, ARCH.d / 2 + 0.3] },
    { label: 'Corinthian columns', note: 'Paired columns with leafy capitals on tall pedestals frame each pier: the grandest of the classical orders.', at: [-4.95, 6.0, ARCH.d / 2 + 0.6] },
    { label: 'Carved vaults', note: 'Look up inside the arches: coffers with the farmer’s work in each month of the year, and myths of Rome’s founding in the side arches.', at: [0, 7.4, 1.8] },
    { label: 'No wall', note: 'The arch stands on its own astride the road. In the second century the town was open, and its limit was marked rather than defended.', at: [12.2, 3.5, 0] },
  ],
  build(b) {
    const stone = ARCH_STONE;
    // the paved road through the middle arch, gravel paths through the side ones
    road(b, 5.2, mix(P.cobble, P.limestone, 0.35));
    for (let z = -7.6; z < 8; z += 1.2) b.box(5.2, 0.01, 0.05, tint(P.cobble, -0.15), { at: [0, 0.04, z], ...NJ });
    b.sym((s) => road(b, 2.2, mix(P.gravel, P.limestone, 0.3), { x: s * ARCH.side.x, y: 0.03 }));
    // kerbs along the carriageway
    b.sym((s) => b.box(0.3, 0.16, 16, tint(P.limestone, -0.05), { at: [s * 2.75, 0, 0], ...NJ }));

    porteDeMars(b);

    // outside the town: a tomb by the road, as Roman custom required the dead to be buried beyond the town limit
    b.group({ at: [-11.5, 0, 5.6] }, () => {
      b.box(2.0, 0.45, 1.6, tint(stone, -0.06));
      b.box(1.5, 1.9, 1.1, stone, { at: [0, 0.45, 0] });
      b.box(1.7, 0.25, 1.3, tint(stone, 0.04), { at: [0, 2.35, 0] });
      b.extrude([[-0.85, 0], [0.85, 0], [0, 0.45]], 1.3, tint(stone, 0.02), { at: [0, 2.6, 0] });
      b.panel(0.9, 1.1, tint(stone, 0.06), { at: [0, 0.8, 0.55], depth: 0.05, shape: 'round' });
    });
    b.tree(7.5, { kind: 'poplar', at: [13.4, 0, -6.4] });
    b.tree(6.5, { kind: 'round', at: [-12.6, 0, -5.8] });

    archColliders(b);
    b.collider(2.0, 1.6, { at: [-11.5, 0, 5.6] });
  },
};
