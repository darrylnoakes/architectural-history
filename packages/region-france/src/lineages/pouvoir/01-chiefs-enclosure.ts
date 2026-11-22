import { P, mix, spread, tint, type BuildingDef, type Builder } from '@ah/kit';
import { type XZ, lineColliders, pave, quad, soup, wallSeg } from './shared';

/** The palisade line: x ±E, z from -E to F (the gate is in the front side, at x 0). */
const E = 20.5;
const F = 19.5;
const GATE = 1.8; // half-width of the gateway
const PH = 3.0; // palisade height

/** A palisade of split oak stakes from p to q: one wall slab and a row of sharpened tips as a soup. */
function palisade(b: Builder, p: XZ, q: XZ): void {
  wallSeg(b, p, q, 0.35, PH, P.oakSilver);
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const ux = (q[0] - p[0]) / L;
  const uz = (q[1] - p[1]) / L;
  const nx = -uz * 0.18;
  const nz = ux * 0.18;
  const n = Math.round(L / 0.55);
  const tips: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * L;
    const c = ((i + 0.5) / n) * L;
    const e = ((i + 1) / n) * L;
    for (const s of [1, -1]) {
      const A = [p[0] + ux * a + nx * s, PH, p[1] + uz * a + nz * s];
      const C = [p[0] + ux * c, PH + 0.45, p[1] + uz * c];
      const Ee = [p[0] + ux * e + nx * s, PH, p[1] + uz * e + nz * s];
      tips.push(...(s > 0 ? [...A, ...Ee, ...C] : [...Ee, ...A, ...C]));
    }
  }
  soup(b, tips, tint(P.oakSilver, -0.05), { jitter: false });
  // the joints between stakes, as faint vertical lines on both faces
  const lines: number[] = [];
  for (let i = 1; i < n; i += 2) {
    const a = (i / n) * L;
    for (const s of [1.05, -1.05]) {
      const x = p[0] + ux * a + nx * s;
      const z = p[1] + uz * a + nz * s;
      quad(lines, [x - ux * 0.03, 0, z - uz * 0.03], [x + ux * 0.03, 0, z + uz * 0.03], [x + ux * 0.03, PH, z + uz * 0.03], [x - ux * 0.03, PH, z - uz * 0.03]);
    }
  }
  soup(b, lines, tint(P.oakSilver, -0.18), { jitter: false });
}

/**
 * A rectangular Gaulish house: a post-built frame with wattle-and-daub walls and a steep thatch
 * hipped at the ends, door in the long side facing +Z (before rotation).
 */
function house(b: Builder, at: [number, number, number], w: number, d: number, wallH: number, roofH: number, o?: { rotY?: number; porch?: boolean }): void {
  b.group({ at, rotY: o?.rotY ?? 0 }, () => {
    b.box(w, wallH, d, P.daub);
    // the posts of the frame show in the walls
    for (const x of spread(Math.max(3, Math.round(w / 2.4)), -w / 2 + 0.15, w / 2 - 0.15))
      for (const s of [-1, 1]) b.box(0.28, wallH, 0.12, P.oak, { at: [x, 0, s * (d / 2 + 0.02)], jitter: false });
    b.hip(w + 1.4, d + 1.6, roofH, P.thatch, { at: [0, wallH - 0.25, 0], ridge: Math.max(0.5, w - d * 0.8) });
    b.panel(1.2, 1.9, P.oakDark, { at: [0, 0, d / 2], facing: '+z' });
    if (o?.porch) {
      for (const s of [-1, 1]) b.box(0.25, wallH + 0.3, 0.25, P.oak, { at: [s * 1.3, 0, d / 2 + 2.2] });
      b.gable(3.2, 2.6, 1.4, P.thatch, { at: [0, wallH + 0.2, d / 2 + 1.2], ridge: 'z', thick: 0.35 });
    }
  });
}

/** A granary raised on four posts against damp and rats, its floor reached by a notched log. */
function granary(b: Builder, x: number, z: number, rot: number): void {
  b.group({ at: [x, 0, z], rotY: rot }, () => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.3, 1.6, 0.3, P.oak, { at: [sx * 1.2, 0, sz * 1.2] });
    b.box(3.0, 0.2, 3.0, P.oak, { at: [0, 1.6, 0] });
    b.box(2.6, 1.8, 2.6, P.wattle, { at: [0, 1.8, 0] });
    b.pyramid(3.4, 3.4, 2.2, P.thatch, { at: [0, 3.5, 0] });
    b.beam([0, 0, 2.4], [0, 1.7, 1.3], 0.25, 0.2, P.oakDark);
  });
  b.collider(3.0, 3.0, { at: [x, 0, z] });
}

export const chiefsEnclosure: BuildingDef = {
  id: 'chiefs-enclosure',
  name: 'Chief’s enclosure',
  style: 'Iron Age (La Tène)',
  date: 'c. 300 BC',
  summary:
    'Before Rome, power in the oppidum belongs to the chief and the great families of the tribe; Caesar names a king of the Suessiones, Galba, and describes councils of nobles and assemblies of armed men. ' +
    'The chief lives in a palisaded enclosure with the biggest house in the settlement, a timber-framed hall with walls of wattle and daub under a steep thatch, with granaries on posts to hold the grain his clients owe him. ' +
    'In front of the hall is open ground where men gather and feast, and the gate has a platform over it from which the enclosure is watched and defended. Nothing here is of stone or mortar.',
  materials: ['oak posts', 'wattle and daub', 'thatch', 'split oak stakes'],
  lookFor: [
    { label: 'Chief’s house', note: 'A big rectangular hall of oak posts and wattle and daub, its thatch hipped at the ends and coming low over the walls.', at: [-2, 5.5, -4.2] },
    { label: 'Gate with a platform', note: 'Four stout posts carry a fighting platform over the gateway, the only way in through the palisade.', at: [GATE + 0.6, 5.2, F + 0.6] },
    { label: 'Palisade', note: 'A close fence of split oak stakes, sharpened at the top, marks off the chief’s ground from the rest of the oppidum.', at: [E - 0.2, PH, 6] },
    { label: 'Granaries on posts', note: 'Grain was kept off the damp ground in small raised stores on four posts, the wealth of the household in a bad year.', at: [13, 4.5, 5] },
    { label: 'Assembly ground', note: 'The open ground in front of the hall, with its hearth and log seats, where the chief’s men gathered to hold council and feast.', at: [0, 0.8, 7] },
  ],
  build(b) {
    pave(b, -E, E, -E, F, mix(P.earth, P.grassDry, 0.35));
    // a ditch round the outside, shown as darker trodden earth
    pave(b, -21.8, 21.8, F + 0.4, 21.8, mix(P.earth, P.soil, 0.5), -0.02);
    // the palisade, open at the gate
    const line: XZ[] = [[-GATE, F], [-E, F], [-E, -E], [E, -E], [E, F], [GATE, F]];
    for (let i = 0; i < line.length - 1; i++) palisade(b, line[i], line[i + 1]);
    lineColliders(b, line, 0.6);
    // the gate: four big posts, a platform with a rail, doors folded back
    for (const sx of [-1, 1]) for (const dz of [-1.2, 1.2]) b.box(0.45, 5.2, 0.45, P.oak, { at: [sx * GATE, 0, F + dz] });
    b.box(GATE * 2 + 0.8, 0.25, 3.2, P.oak, { at: [0, 4.0, F] });
    for (const dz of [-1.5, 1.5]) b.box(GATE * 2 + 0.6, 0.15, 0.12, P.oakDark, { at: [0, 5.0, F + dz], jitter: false });
    for (const sx of [-1, 1]) b.box(0.12, 0.15, 3.0, P.oakDark, { at: [sx * (GATE + 0.3), 5.0, F], jitter: false });
    for (const sx of [-1, 1]) b.box(0.12, 2.6, 1.7, P.oakDark, { at: [sx * (GATE - 0.1), 0, F - 2.0] });
    b.stairs(0.9, 4.0, 3.4, 8, P.oakDark, { at: [GATE + 1.0, 0, F - 3.4], rotY: 0 });
    // the chief's house, with a porch to the assembly ground
    house(b, [-2, 0, -10], 20, 10, 2.6, 7.0, { porch: true });
    b.collider(21, 11, { at: [-2, 0, -10] });
    // lesser houses for kin and servants, a workshop shelter
    house(b, [-14.5, 0, 6], 8, 6, 2.2, 4.6, { rotY: Math.PI / 2 });
    b.collider(6.6, 8.6, { at: [-14.5, 0, 6] });
    house(b, [14.5, 0, -11], 7, 5.5, 2.2, 4.2, { rotY: -Math.PI / 2 });
    b.collider(6, 7.6, { at: [14.5, 0, -11] });
    granary(b, 13, 4, 0.1);
    granary(b, 16.5, 9.5, -0.15);
    granary(b, 12.5, 13.5, 0.2);
    // the assembly ground: a hearth ringed with log seats
    b.cyl(1.2, 0.25, P.rubble, { at: [0, 0, 7], segs: 8 });
    b.cyl(0.7, 0.3, P.soil, { at: [0, 0, 7], segs: 8 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      b.log(0.25, 2.6, P.oak, { at: [Math.cos(a) * 4, 0, 7 + Math.sin(a) * 4], rotY: -a + Math.PI / 2, segs: 6 });
    }
    // a cattle pen and storage pits with their lids
    const pen: XZ[] = [[-19.5, -6], [-11, -6], [-11, -2], [-19.5, -2]];
    for (let i = 0; i < pen.length - 1; i++) wallSeg(b, pen[i], pen[i + 1], 0.12, 1.1, P.oakDark);
    lineColliders(b, pen, 0.3);
    for (const [x, z] of [[6, -1.5], [8.5, -2.5], [7.5, 0.6]] as XZ[]) b.cyl(0.9, 0.25, mix(P.earth, P.thatch, 0.3), { at: [x, 0, z], rTop: 0.6, segs: 7 });
    // a few trees left standing inside the enclosure
    b.tree(9, { kind: 'round', at: [-16, 0, 15] });
    b.tree(8, { kind: 'round', at: [17, 0, -2] });
  },
};
