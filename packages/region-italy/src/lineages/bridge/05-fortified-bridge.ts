import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { romanBridge } from './shared';

export const fortifiedBridge: BuildingDef = {
  id: 'fortified-bridge',
  name: 'Fortified bridge with gate tower',
  style: 'Romanesque',
  date: 'c. 1100',
  summary:
    'With trade reviving, the broken arch is rebuilt in stone: in rubble and brick, rougher than the Roman work either side, but again a round arch. ' +
    'Bridges were the gateways of a town and the places where tolls were taken, so a tower is raised over the roadway with a gate that can be shut and a fighting platform on top behind a plain parapet of merlons, built flush with the walls; the projecting machicolated galleries seen on later Italian towers became common only from the 13th century. ' +
    'At the bridgehead a small chapel lets travellers give thanks for a safe crossing and leave alms for the bridge’s upkeep. ' +
    'The Roman piers and arches are kept: medieval builders patched what they had rather than start again.',
  materials: ['Roman travertine and tufa', 'rubble and brick', 'clay roof tiles (coppi)'],
  modelledOn: 'The Ponte Nomentano over the Aniene, Rome: a Roman bridge cut by Totila and rebuilt by Narses in the 550s, with towers and a fortified superstructure built up through the Middle Ages and largely remade under Pope Nicholas V (1447 to 1455)',
  lookFor: [
    { label: 'Gate tower', note: 'The road passes through an arch under the tower, which could be closed with a gate; tolls were collected here.', at: [3.7, 5.5, -7.65] },
    { label: 'Battlements', note: 'Square merlons rise straight from the face of the tower, with gaps (crenels) between them for defenders to shoot through; there is no projecting gallery yet.', at: [2.4, 8.7, -5.95] },
    { label: 'Rebuilt arch', note: 'The arch broken in the Gothic War, rebuilt in rubble with a ring of brick: a patch that still shows.', at: [3.3, 0.2, 5.15] },
    { label: 'Wayside chapel', note: 'A little chapel at the bridgehead where travellers prayed and gave money towards the bridge.', at: [5.0, 4.0, 14.4] },
  ],
  build(b) {
    b.noCollide();
    const L = romanBridge(b, { repaired: 3, aged: 0.5 });
    const { f, W, piers } = L;
    b.deck(W - 0.9, 34, 1.15, { yEnds: 0 });

    // ---- gate tower over the second pier, corbelled out beyond the bridge faces
    const tz = piers[0];
    const base = f(tz) - 0.25;
    const tw = W + 1.0;
    const td = 3.4;
    const stone = mix(P.rubble, P.tufa, 0.35);
    const quoin = tint(P.travertine, -0.03);
    const H = 7.6;
    // corbels carrying the overhang on each face
    b.sym((k) => {
      for (const dz of [-1.3, -0.45, 0.45, 1.3]) b.box(0.55, 0.3, 0.3, quoin, { at: [k * (W / 2 + 0.2), base - 0.55, tz + dz] });
    });
    b.archWall(tw, H, td, stone, { at: [0, base, tz], facing: '+z', openings: 1, openW: 3.1, openH: 3.9, shape: 'round' });
    // a ring of dressed voussoirs round the gateway on both faces
    b.sym((k) => {
      const ring: [number, number][] = [];
      const hole: [number, number][] = [];
      for (let i = 0; i <= 12; i++) {
        const t = (Math.PI * i) / 12;
        ring.push([1.95 * Math.cos(t), 2.35 + 1.95 * Math.sin(t)]);
      }
      for (let i = 12; i >= 0; i--) {
        const t = (Math.PI * i) / 12;
        hole.push([1.55 * Math.cos(t), 2.35 + 1.55 * Math.sin(t)]);
      }
      b.extrude([...ring, ...hole], 0.12, quoin, { at: [0, base, tz + k * (td / 2 + 0.04)] });
    });
    // the passage itself is left open: line it with darker soffit faces so it reads as a tunnel
    b.sym((k) => b.box(0.06, 2.6, td - 0.1, tint(stone, -0.12), { at: [k * 1.52, base, tz] }));
    // gate leaves standing open against the passage walls
    b.sym((k) => b.box(0.12, 3.0, 1.5, P.oakDark, { at: [k * 1.45, base, tz + 1.0], rotY: k * 0.12 }));
    // quoins up the corners
    b.sym((k) => b.sym((t) => {
      for (let i = 0; i < 7; i++) b.box(0.5, 0.5, 0.5, quoin, { at: [k * (tw / 2 - 0.22), base + 0.3 + i * 1.05, tz + t * (td / 2 - 0.22)] });
    }));
    // slit windows and a small arched window over the gate
    b.sym((k) => {
      b.window(0.7, 1.1, { at: [0, base + 5.0, tz + k * (td / 2)], facing: k > 0 ? '+z' : '-z', shape: 'round', frame: quoin });
      b.panel(0.18, 1.0, P.windowDark, { at: [k * (tw / 2), base + 4.6, tz], facing: k > 0 ? '+x' : '-x' });
    });
    // a plain battlemented top: a thin string course, then merlons flush with the wall faces
    const topY = base + H;
    b.box(tw + 0.08, 0.15, td + 0.08, quoin, { at: [0, topY - 0.15, tz] });
    b.crenel(tw, td, stone, { at: [0, topY, tz], merlonW: 0.6, merlonH: 0.9, t: 0.4 });
    // a low tiled roof over the guard chamber, set back behind the battlements
    b.hip(tw - 1.2, td - 1.0, 0.9, P.coppi, { at: [0, topY, tz] });

    // ---- the wayside chapel on the north bank, beside the road
    const cx = 5.0;
    const cz = 14.4;
    const cw = 3.0;
    const cl = 4.2;
    const plaster = b.pick([P.intonacoCream, P.intonacoOchre]);
    b.box(cw, 3.4, cl, plaster, { at: [cx, 0, cz] });
    b.box(cw + 0.1, 0.3, cl + 0.1, quoin, { at: [cx, 0, cz] });
    b.gable(cw, cl, 1.1, P.coppi, { at: [cx, 3.4, cz], ridge: 'z', overhang: 0.25, wall: plaster });
    // little apse at the back
    b.lathe([[1.0, 0], [1.0, 2.8], [0.01, 3.4]], plaster, { at: [cx, 0, cz + cl / 2], start: -Math.PI / 2, sweep: Math.PI, segs: 8 });
    // door facing the road with a painted lunette over it
    b.panel(1.1, 2.2, P.oakDark, { at: [cx - cw / 2, 0, cz - 0.2], facing: '-x', shape: 'round' });
    b.panel(1.4, 2.5, quoin, { at: [cx - cw / 2, 0, cz - 0.2], facing: '-x', shape: 'round', depth: 0.03 });
    b.panel(0.9, 0.7, P.doorBlue, { at: [cx - cw / 2, 2.65, cz - 0.2], facing: '-x', shape: 'segmental' });
    // bell gable on the front
    b.group({ at: [cx, 3.4, cz - cl / 2 + 0.2] }, () => {
      b.box(1.0, 1.6, 0.35, plaster, { at: [0, 0.6, 0] });
      b.panel(0.5, 0.8, P.windowDark, { at: [0, 1.1, -0.18], facing: '-z', shape: 'round' });
      b.gable(1.0, 0.35, 0.35, P.coppi, { at: [0, 2.2, 0], ridge: 'z' });
    });
    b.window(0.4, 1.0, { at: [cx + cw / 2, 1.4, cz], facing: '+x', shape: 'round', frame: quoin });
    b.tree(8.5, { kind: 'cypress', at: [cx + 1.6, 0, cz - 3.4] });
  },
};
