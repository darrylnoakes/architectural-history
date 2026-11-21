import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { hurdles, patch } from './shared';

/**
 * One oval hut of the Latial kind: a low daubed wall on a ring of posts, a thatched hipped roof with a
 * ridge pole and pairs of crossed poles along it, a door in the short end under a little porch.
 * Long axis along local Z; the door faces local +Z.
 */
function hut(b: Builder, x: number, z: number, L: number, W: number, turn: number, thatch: number): void {
  const wallH = 1.45;
  const ov = 0.45;
  b.group({ at: [x, 0, z], rotY: turn }, () => {
    // daub wall over a post ring; a ring of post feet showing where the daub has worn
    b.group({ scale: [W / 2, 1, L / 2] }, () => {
      b.cyl(1, wallH, b.pick([P.daub, tint(P.daub, -0.04), P.cob]), { segs: 14 });
      b.cyl(1.02, 0.22, P.mud, { segs: 14 });
    });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      b.cyl(0.08, wallH + 0.05, P.oakDark, { at: [Math.cos(a) * (W / 2 + 0.03), 0, Math.sin(a) * (L / 2 + 0.03)], segs: 5 });
    }
    // thatched hipped roof, ridge along Z
    const rh = 2.3;
    const ridge = L - W * 0.75;
    b.group({ at: [0, wallH - 0.15, 0], rotY: Math.PI / 2 }, () => {
      b.hip(L + ov * 2, W + ov * 2, rh, thatch, { ridge });
    });
    const top = wallH - 0.15 + rh;
    // ridge pole and crossed poles: the pairs of timbers the hut-shaped urns show along the ridge
    b.log(0.07, ridge + 0.6, P.oakDark, { at: [0, top - 0.04, 0], axis: 'z', segs: 5 });
    const pairs = 3;
    for (let i = 0; i < pairs; i++) {
      const pz = -ridge / 2 + 0.15 + ((ridge - 0.3) * i) / (pairs - 1);
      for (const s of [-1, 1]) b.beam([s * 0.55, top - 0.25, pz], [-s * 0.35, top + 0.5, pz], 0.07, 0.07, P.oakDark);
    }
    // the door and the porch: two posts carrying the thatch forward
    const zd = L / 2;
    b.panel(0.85, 1.35, P.oakDark, { at: [0, 0, zd - 0.02], facing: '+z', depth: 0.05 });
    for (const s of [-1, 1]) b.cyl(0.07, 1.6, P.oak, { at: [s * 0.65, 0, zd + 0.85], segs: 5 });
    b.box(1.6, 0.1, 0.1, P.oak, { at: [0, 1.6, zd + 0.85] });
    b.beam([0, 1.7, zd + 1.05], [0, top - 0.4, zd - 0.6], 1.9, 0.22, thatch);
  });
}

/** A sheep or goat, for scale and life. */
function beast(b: Builder, x: number, z: number, rotY: number, coat: number): void {
  b.group({ at: [x, 0, z], rotY }, () => {
    for (const [lx, lz] of [
      [0.22, 0.12],
      [0.22, -0.12],
      [-0.22, 0.12],
      [-0.22, -0.12],
    ]) {
      b.box(0.06, 0.34, 0.06, P.timberBlack, { at: [lx, 0, lz] });
    }
    b.blob(0.3, coat, { at: [0, 0.52, 0], stretch: [1.45, 0.9, 0.95], detail: 0 });
    b.box(0.17, 0.2, 0.15, tint(coat, -0.35), { at: [0.5, 0.55, 0] });
  });
}

export const hutCluster: BuildingDef = {
  id: 'hut-cluster',
  name: 'Huts on the hill',
  style: 'Iron Age Latial vernacular',
  date: 'c. 750 BC',
  summary:
    'The first town was a scatter of villages on the hilltops above the ford, and its poorest families lived as everyone else did: in small oval huts on a ring of posts, the walls of wattle daubed with clay, the roofs of straw or reed. ' +
    'We know their shape from the post-holes cut into the rock of the Palatine in Rome and from the pottery urns, made like little huts, in which the ashes of the dead were buried. ' +
    'Each hut was a single room round a hearth, with a door in one end under a porch; sheep and goats were penned close by, and grain was kept in pits and big jars dug into the ground.',
  materials: ['wattle and daub', 'oak posts', 'straw or reed thatch', 'clay'],
  modelledOn: 'The hut foundations on the Palatine, Rome (8th century BC), and the hut urns of the Latial culture',
  lookFor: [
    { label: 'Oval plan', note: 'The huts are long ovals or rounded rectangles, about five metres by three and a half, like the ones cut into the Palatine rock.', at: [-8.4, 1.0, 3.2] },
    { label: 'Crossed ridge poles', note: 'Pairs of poles crossed over the ridge held the thatch down; the hut urns show them as a row of little V shapes.', at: [-1.2, 4.4, -2.5] },
    { label: 'Porch on posts', note: 'Two posts carry the roof forward over the door, giving a sheltered place to work and cook.', at: [6.2, 1.8, 4.6] },
    { label: 'Storage pit', note: 'A pit dug into the rock and lined with clay kept grain and food; a jar or a stone slab sealed it.', at: [1.5, 0.6, 5.2] },
    { label: 'Hurdle pen', note: 'Sheep and goats were folded at night inside fences of woven hazel and oak that could be moved.', at: [-10.0, 1.2, -4.2] },
  ],
  influences: [],
  build(b) {
    const thatch = b.pick([P.thatchOld, P.reed, tint(P.thatchOld, 0.05)]);
    patch(b, 25.6, 15.6, tint(P.earth, 0.05), [0, 0]);
    // a trodden path between the huts
    patch(b, 3, 15.4, tint(P.earth, -0.03), [1.6, 0.2], 0.05);

    const tilt = b.range(-0.18, 0.18);
    hut(b, -8.4, -0.4, 5.2, 3.6, 0.1 + tilt, thatch);
    hut(b, -1.2, -3.6, 4.8, 3.4, -0.15 + tilt, tint(thatch, 0.03));
    hut(b, 6.2, -0.8, 4.6, 3.2, -0.35 + tilt, tint(thatch, -0.03));
    if (b.chance(0.6)) hut(b, 10.6, -4.6, 3.6, 2.8, -0.6 + tilt, tint(thatch, 0.06));
    else {
      // a small raised store instead of a fourth hut
      b.group({ at: [10.6, 0, -4.6] }, () => {
        for (const [px, pz] of [
          [0.7, 0.7],
          [-0.7, 0.7],
          [0.7, -0.7],
          [-0.7, -0.7],
        ]) b.cyl(0.09, 1.0, P.oak, { at: [px, 0, pz], segs: 5 });
        b.box(1.8, 0.12, 1.8, P.oak, { at: [0, 1.0, 0] });
        b.box(1.5, 0.9, 1.5, P.wattle, { at: [0, 1.12, 0] });
        b.pyramid(2.3, 2.3, 1.3, thatch, { at: [0, 2.0, 0] });
      });
    }

    // the storage pit, its clay lip, a stone lid pushed half aside, and a big storage jar beside it
    b.cyl(0.75, 0.12, P.mud, { at: [1.5, 0, 5.2], segs: 10 });
    b.cyl(0.55, 0.02, P.timberBlack, { at: [1.5, 0.12, 5.2], segs: 10 });
    b.cyl(0.6, 0.1, P.tufa, { at: [1.95, 0.08, 5.55], segs: 7, rotY: 0.4 });
    b.lathe(
      [
        [0.01, 0],
        [0.3, 0.05],
        [0.45, 0.4],
        [0.38, 0.8],
        [0.22, 0.95],
        [0.25, 1.02],
      ],
      P.terracotta,
      { at: [0.3, 0, 5.6], segs: 9 },
    );
    // outdoor hearth with a ring of stones, a pot and a woodpile
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      b.box(0.25, 0.18, 0.2, P.peperino, { at: [-3.4 + Math.cos(a) * 0.55, 0, 3.6 + Math.sin(a) * 0.55], rotY: a });
    }
    b.cyl(0.35, 0.06, P.timberBlack, { at: [-3.4, 0, 3.6], segs: 8 });
    b.lathe(
      [
        [0.01, 0],
        [0.22, 0.04],
        [0.27, 0.22],
        [0.18, 0.36],
        [0.2, 0.4],
      ],
      P.mud,
      { at: [-3.4, 0.06, 3.6], segs: 8 },
    );
    for (let i = 0; i < 5; i++) b.log(0.1, 1.4, P.bark, { at: [-5.6 + (i % 3) * 0.22, i < 3 ? 0 : 0.18, 4.4], axis: 'x', segs: 5, rotY: 0.6 });

    // pen at the back left, with sheep and goats
    const x0 = -12.4;
    const x1 = -7.4;
    const z0 = -7.4;
    const z1 = -4.2;
    hurdles(b, [x0, z0], [x1, z0]);
    hurdles(b, [x0, z0], [x0, z1]);
    hurdles(b, [x1, z0], [x1, z1]);
    hurdles(b, [x0, z1], [x1 - 1.3, z1]);
    const flock = 2 + Math.floor(b.rand() * 3);
    for (let i = 0; i < flock; i++) beast(b, x0 + 0.9 + i * 1.1, z0 + 0.9 + (i % 2) * 1.2, b.range(-1, 1), b.pick([P.cream, P.cream, P.oakDark, P.wattle]));
    // oaks at the edge of the hill
    b.tree(6.5, { at: [10.8, 0, 5.2] });
    b.tree(1.6, { at: [-11.6, 0, 6.6], kind: 'bush' });
    b.tree(1.3, { at: [-6.0, 0, 6.9], kind: 'bush' });
  },
};
