import { P, mix, type BuildingDef, type Builder } from '@ah/kit';
import { DARK, DITCH, MOTTE, flat, motte, motteY, palisade, pol, rectPts, segCollider, strip, win, type Pt } from './shared';

/** The bailey boundary, from the foot of the mound at the back round to the mound on the left. */
export const BAILEY_A: Pt[] = [[-2.5, -19], [10, -20], [17.5, -12], [18, 6], [13, 17], [6.6, 18.2]];
export const BAILEY_B: Pt[] = [[2.4, 18.2], [-8, 17], [-16.5, 9], [-18.5, -5]];
export const GATE: Pt = [4.5, 18.2];

function pushOut(pts: Pt[], d: number): Pt[] {
  return pts.map(([x, z]) => {
    const dx = x - 2;
    const dz = z;
    const L = Math.hypot(dx, dz) || 1;
    return [x + (dx / L) * d, z + (dz / L) * d] as Pt;
  });
}

/** Palisade, ditch and timber gate tower of the bailey (960, kept in 1100). */
export function baileyDefences(b: Builder) {
  const stake = mix(P.oak, P.oakSilver, 0.25);
  palisade(b, BAILEY_A, 3.4, stake, motteY);
  palisade(b, BAILEY_B, 3.4, stake, motteY);
  for (const line of [BAILEY_A, BAILEY_B]) for (let i = 0; i < line.length - 1; i++) segCollider(b, line[i], line[i + 1], 0.6);
  // the ditch outside, and the bank thrown up from it on the inside
  const ditch = pushOut([...BAILEY_A.slice(1), ...BAILEY_B.slice(0, -1)], 2.4);
  strip(b, ditch, 2.6, 0.03, DITCH);
  // gate tower: four posts, a fighting platform and a little roof over the gate
  b.group({ at: [GATE[0], 0, GATE[1]] }, () => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.4, 6.4, 0.4, P.oak, { at: [sx * 1.8, 0, sz * 1.3] });
    b.box(4.2, 2.2, 3.2, mix(P.oak, P.oakSilver, 0.2), { at: [0, 3.4, 0] });
    b.box(4.4, 0.2, 3.4, P.oakDark, { at: [0, 3.3, 0] });
    for (const x of [-1.2, 0, 1.2]) flat(b, rectPts(-0.15, 0, 0.15, 0.9), DARK, [x, 4.3, 1.6], '+z', 0.03);
    b.pyramid(5, 4, 2.2, P.shingle, { at: [0, 5.6, 0] });
    b.box(3.2, 0.25, 4, P.oak, { at: [0, 0.2, 3.4] });
  });
  b.sym((s) => b.collider(0.6, 3, { at: [GATE[0] + s * 1.8, 0, GATE[1]] }));
}

/** A timber hall with walls of planks on a frame, a shingle roof and a smoke louvre. */
export function timberHall(b: Builder, x: number, z: number) {
  b.group({ at: [x, 0, z] }, () => {
    b.box(12, 3.4, 6.4, mix(P.oak, P.oakSilver, 0.35));
    for (const f of ['+z', '-z'] as const) b.frame(12, 3.4, P.oakDark, { at: [0, 0, f === '+z' ? 3.2 : -3.2], facing: f, studs: 7, rails: 0, beam: 0.22 });
    b.gable(12, 6.4, 3.8, P.shingle, { at: [0, 3.4, 0], overhang: 0.5, wall: mix(P.oak, P.oakSilver, 0.35) });
    b.box(1, 0.8, 1, P.oakDark, { at: [1, 6.9, 0] });
    b.pyramid(1.4, 1.4, 0.6, P.shingle, { at: [1, 7.7, 0] });
    flat(b, rectPts(-0.7, 0, 0.7, 2.3), P.oakDark, [-3, 0, 3.2], '+z', 0.08);
  });
  b.collider(12, 6.4, { at: [x, 0, z] });
}

/** Stables, a well and a smithy's lean-to, the working life of the bailey. */
export function baileyYard(b: Builder) {
  b.group({ at: [14.6, 0, 3] }, () => {
    b.box(4.2, 2.6, 10, mix(P.oak, P.oakSilver, 0.3));
    b.shed(5, 10.6, 1.4, P.thatchOld, { at: [0, 2.6, 0], high: '+x' });
    for (const z of [-3.3, 0, 3.3]) flat(b, rectPts(-0.8, 0, 0.8, 2), P.oakDark, [-2.1, 0, z], '-x', 0.05);
  });
  b.collider(4.2, 10, { at: [14.6, 0, 3] });
  b.cyl(0.8, 0.8, P.rubble, { at: [3, 0, 8], segs: 8 });
  b.cyl(0.6, 0.04, P.water, { at: [3, 0.78, 8], segs: 8, mat: 'glass' });
  b.group({ at: [-6, 0, 11] }, () => {
    for (const sx of [-1, 1]) b.box(0.25, 2.4, 0.25, P.oak, { at: [sx * 1.8, 0, 1.2] });
    b.shed(4.2, 3, 0.8, P.thatchOld, { at: [0, 2.4, 0], high: '-z' });
    b.box(1.2, 0.9, 1.0, P.rubble, { at: [0, 0, -0.5] });
  });
  b.blob(1.4, P.thatch, { at: [11, 0.9, 13], stretch: [1, 1.1, 1] });
}

function build(b: Builder) {
  motte(b, mix(P.turf, P.grassDry, 0.2), true);
  const { x, z, h } = MOTTE;
  // the timber tower on the summit, with a gallery all round its top storey
  const plank = mix(P.oak, P.oakSilver, 0.3);
  b.group({ at: [x, h, z] }, () => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.45, 8.6, 0.45, P.oakDark, { at: [sx * 2.2, -0.5, sz * 2.2] });
    b.box(4.4, 6.8, 4.4, plank, { at: [0, 0, 0] });
    for (const [f, fx, fz] of [['+z', 0, 2.2], ['-z', 0, -2.2], ['+x', 2.2, 0], ['-x', -2.2, 0]] as const) {
      b.frame(4.4, 6.8, P.oakDark, { at: [fx, 0, fz], facing: f, studs: 3, rails: 1, beam: 0.18 });
    }
    b.box(6, 0.25, 6, P.oakDark, { at: [0, 6.8, 0] });
    b.box(5.8, 1.6, 5.8, plank, { at: [0, 7.05, 0] });
    for (const t of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      for (const u of [-1.6, 0, 1.6]) {
        b.group({ rotY: t }, () => flat(b, rectPts(-0.25, 0, 0.25, 0.8), DARK, [u, 7.5, 2.9], '+z', 0.03));
      }
    }
    b.pyramid(6.6, 6.6, 3.6, P.shingle, { at: [0, 8.65, 0] });
    win(b, 'rect', 1, 2, [2.2, 2.6, 1.0], '+x', { glass: P.oakDark });
  });
  // the palisade round the summit, open where the flying bridge lands
  const bt = 0.67;
  const ring: Pt[] = [];
  for (let i = 0; i <= 22; i++) ring.push(pol(x, z, MOTTE.rTop - 0.4, bt + 0.3 + (i / 22) * (Math.PI * 2 - 0.6)));
  palisade(b, ring, 2.4, mix(P.oak, P.oakSilver, 0.25), () => h);
  // the flying bridge from the bailey up to the summit, on trestles
  const top = pol(x, z, MOTTE.rTop - 0.2, bt);
  const bot = pol(x, z, 17, bt);
  b.beam([bot[0], 0.3, bot[1]], [top[0], h + 0.2, top[1]], 1.6, 0.22, P.oak);
  for (const u of [0.3, 0.62]) {
    const px = bot[0] + (top[0] - bot[0]) * u;
    const pz = bot[1] + (top[1] - bot[1]) * u;
    const py = 0.3 + (h - 0.1) * u;
    const g = motteY(px, pz);
    const [nx, nz] = [Math.cos(bt) * 0.75, -Math.sin(bt) * 0.75];
    b.beam([px + nx, g - 0.3, pz + nz], [px + nx, py, pz + nz], 0.22, 0.22, P.oakDark);
    b.beam([px - nx, g - 0.3, pz - nz], [px - nx, py, pz - nz], 0.22, 0.22, P.oakDark);
  }
  for (const s of [-1, 1]) {
    const [nx, nz] = [Math.cos(bt) * 0.8 * s, -Math.sin(bt) * 0.8 * s];
    b.beam([bot[0] + nx, 1.3, bot[1] + nz], [top[0] + nx, h + 1.2, top[1] + nz], 0.1, 0.1, P.oakDark);
  }
  b.collider(4.6, 4.6, { at: [x, 0, z] });

  baileyDefences(b);
  timberHall(b, 6, -6);
  baileyYard(b);
}

export const motteDef: BuildingDef = {
  id: 'motte',
  name: 'Motte and bailey',
  style: 'Early medieval timber castle',
  date: 'c. 960',
  summary:
    'As royal power breaks up in the tenth century, counts, viscounts and lesser lords fortify themselves against their neighbours and the raiders. ' +
    'The quickest castle is earth and timber: a mound, the motte, thrown up from a ring ditch and crowned by a timber tower and a palisade, and beside it a larger enclosure, the bailey, holding the hall, stables and stores behind its own bank, ditch and fence. ' +
    'A sloping bridge links the two, so that the tower can be held when the bailey falls. Gangs of peasants could raise one in a few weeks; the oldest known are in the Loire valley and northern France.',
  materials: ['rammed earth and turf', 'oak posts and planks', 'oak shingles', 'thatch'],
  lookFor: [
    { label: 'Motte', note: 'The earth mound, about six metres high, dug from the ditch round its foot.', at: [MOTTE.x + 8.5, 3, MOTTE.z + 5] },
    { label: 'Timber tower', note: 'The lord’s refuge and lookout, with a gallery round its top from which to shoot down.', at: [MOTTE.x, MOTTE.h + 8, MOTTE.z + 3] },
    { label: 'Flying bridge', note: 'A steep timber bridge on trestles from the bailey up to the summit, easily cut if the bailey was taken.', at: [-3, 3.4, -3.6] },
    { label: 'Bailey', note: 'The lower enclosure, where the household lived and worked: here the hall, stables, a forge and a well.', at: [6, 5, -2.6] },
    { label: 'Palisade and ditch', note: 'A fence of split oak stakes with a dry ditch outside it, the bailey’s only defence.', at: [18.5, 3.5, 0] },
  ],
  modelledOn: 'Generic. The earliest dated mottes are in the Loire valley and northern France, among them Doué-la-Fontaine (a stone hall heaped round with earth about 950) and the mottes of the counts of Anjou and Blois.',
  build,
};

