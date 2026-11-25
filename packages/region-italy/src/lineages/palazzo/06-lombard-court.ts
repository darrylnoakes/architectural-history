import { P, tint, type BuildingDef } from '@ah/kit';
import { APSE, lateApse } from './05-late-antique-domus';
import { block, compoundWalls, onFace, WELL_AT, wellHead, win } from './shared';

export const lombardCourt: BuildingDef = {
  id: 'lombard-court',
  name: 'Lombard noble compound',
  style: 'Early medieval (Lombard)',
  date: 'c. AD 750',
  summary:
    'Two centuries after the Gothic War the town is small and the leading family belongs to the Lombard nobility that rules it. ' +
    'Its hall stands among the ruins and is built from them: Roman brick, tufa blocks and the odd column drum or inscribed stone set in the walls, carrying a timber upper storey with an outside stair. ' +
    'A wall closes the compound, with a stable, a bread oven, a well and a small private chapel for the family’s own priest, its nave built against the apse of the ruined Roman hall that once stood here. ' +
    'Nobody now builds in concrete or makes new roof tiles on the Roman scale: tiles are reused, and timber and shingle do the rest.',
  materials: ['reused Roman brick and tufa', 'spolia', 'timber frame and planking', 'wooden shingles', 'reused roof tiles'],
  lookFor: [
    { label: 'Reused Roman masonry (spolia)', note: 'Patches of Roman brick, tufa blocks and a marble column drum laid sideways in the wall: the ruins are the quarry.', at: [-3.0, 1.2, 4.6] },
    { label: 'Timber upper storey', note: 'The living rooms sit on a planked timber storey over the stone ground floor, reached by an outside stair.', at: [2.0, 5.2, 4.8] },
    { label: 'Private chapel', note: 'A small single-cell chapel built by the family for its own use; its sanctuary is the apse of a late Roman reception hall, still standing to its full height among the ruins.', at: [-1, 3.6, -12.4] },
    { label: 'Enclosing wall and gate', note: 'A rubble wall with a timber gate closes the compound off from the street.', at: [0, 3.6, 12.0] },
  ],
  build(b) {
    const rubble = b.pick([P.rubble, tint(P.rubble, -0.05), P.tufa]);
    const wood = b.pick([P.oak, P.oakDark]);
    const shingle = b.pick([P.shingle, tint(P.shingle, -0.05)]);
    const roof = b.pick([P.coppi, P.romanTile]);

    // ---- the enclosing wall, with a gate
    const Hw = 3.0;
    b.sym((s) => block(b, 9.6, Hw, 0.6, rubble, s * 6.6, 11.7));
    compoundWalls(b, rubble);
    b.sym((s) => b.box(0.8, 4.0, 0.9, rubble, { at: [s * 1.9, 0, 11.7] }));
    b.box(4.6, 0.4, 1.0, wood, { at: [0, 4.0, 11.7] });
    b.gable(4.8, 1.6, 0.6, shingle, { at: [0, 4.4, 11.7], overhang: 0.1 });
    b.panel(1.5, 3.0, wood, { at: [-0.75, 0, 11.4], facing: 0.9, depth: 0.08 });
    b.panel(1.5, 3.0, wood, { at: [0.75, 0, 11.4], facing: -0.9, depth: 0.08 });
    // patches of Roman brick in the wall
    for (const x of [-9, -5, 6, 9.5]) b.box(1.4, 0.8, 0.64, P.brickRed, { at: [x, 0.8, 11.7] });

    // ---- the hall: stone ground floor of reused materials, timber upper storey
    const G = 3.2;
    block(b, 12, G, 7, rubble, -2, 1);
    for (const [x, y, w, h] of [[-6, 0.4, 2.2, 1.2], [1.5, 1.4, 2.6, 1.0], [-2.5, 2.2, 1.6, 0.8]]) b.box(w, h, 7.06, P.brickRed, { at: [x, y, 1] });
    b.box(1.6, 0.6, 7.06, P.tufa, { at: [3, 0.3, 1] });
    b.log(0.35, 1.4, P.marble, { at: [-3.0, 0.75, 4.55] });
    b.box(1.6, 0.35, 0.2, P.marble, { at: [-6.5, 2.4, 4.56] });
    b.box(12.8, 0.25, 7.8, wood, { at: [-2, G, 1] });
    b.box(12.6, 2.8, 7.6, tint(wood, 0.12), { at: [-2, G + 0.25, 1] });
    b.frame(12.6, 2.8, wood, { at: [-2, G + 0.25, 4.8], facing: '+z', studs: 6, rails: 1, brace: 'corner' });
    b.frame(12.6, 2.8, wood, { at: [-2, G + 0.25, -2.8], facing: '-z', studs: 6, rails: 1, brace: 'corner' });
    for (let i = 0; i < 9; i++) b.box(0.2, 0.2, 8.4, wood, { at: [-7.8 + i * 1.45, G - 0.2, 1] });
    b.gable(12.6, 7.6, 2.4, shingle, { at: [-2, G + 3.05, 1], overhang: 0.6, wall: tint(wood, 0.12), thick: 0.2 });
    onFace(b, '+z', [-2, 0, 4.5], () => {
      b.panel(1.4, 2.4, wood, { at: [-1.5, 0, 0], shape: 'round', depth: 0.08 });
      win(b, -5, 1.4, 0.5, 0.8, P.brickRed, { shape: 'round', border: 0.1 });
      for (const x of [-4, 0.5, 4]) b.panel(0.7, 0.8, P.windowDark, { at: [x, G + 1.2, 0.35], depth: 0.04 });
      b.panel(1.0, 2.0, wood, { at: [2.6, G + 0.3, 0.33], depth: 0.06 });
    });
    // outside stair to the upper floor, with a landing
    b.stairs(1.1, G, 4.2, 11, rubble, { at: [3.4, 0, 5.1], rotY: Math.PI / 2 });
    b.box(1.4, 0.25, 1.2, wood, { at: [0.6, G - 0.25, 5.1] });
    b.collider(4.2, 1.2, { at: [3.4, 0, 5.1] });

    // ---- the chapel: a plain nave built against the apse of the ruined Roman hall, which stands
    // to its old height and serves as the sanctuary
    const { x: ax, z: az } = APSE;
    const nz0 = WELL_AT[1] - 1.0; // the front of the nave, clear of the well
    const nd = nz0 - az;
    const cz = (nz0 + az) / 2;
    lateApse(b, tint(P.brickRed, -0.05), P.tufa, roof);
    block(b, 5.4, 4.6, nd, P.plaster, ax, cz);
    b.gable(5.4, nd, 1.6, roof, { at: [ax, 4.6, cz], ridge: 'z', overhang: 0.3, wall: P.plaster });
    b.panel(1.1, 2.3, wood, { at: [ax, 0, nz0], facing: '+z', shape: 'round', depth: 0.08 });
    b.panel(0.3, 0.8, P.windowDark, { at: [ax, 3.0, nz0], facing: '+z', shape: 'round', depth: 0.05 });
    b.box(0.2, 0.9, 0.08, wood, { at: [ax, 6.2, nz0 - 0.1] });
    b.box(0.6, 0.18, 0.08, wood, { at: [ax, 6.75, nz0 - 0.1] });
    for (const z of [cz - 1.2, cz + 1.2]) b.panel(0.3, 0.8, P.windowDark, { at: [ax + 2.7, 2.6, z], facing: '+x', shape: 'round', depth: 0.05 });

    // ---- stable with a thatched roof, oven, well, garden
    block(b, 5.5, 2.4, 4, wood, -7.6, -8.4);
    b.gable(5.5, 4, 1.8, P.thatch, { at: [-7.6, 2.4, -8.4], overhang: 0.4, thick: 0.35 });
    b.panel(1.6, 2.0, P.oakDark, { at: [-7.6, 0, -6.4], facing: '+z', depth: 0.05 });
    b.box(1.8, 0.8, 1.8, rubble, { at: [6.5, 0, -9.6] });
    b.dome(0.9, P.daub, { at: [6.5, 0.8, -9.6], segs: 8 });
    wellHead(b, rubble, 'wood', wood);
    b.box(6, 0.12, 4.5, P.soil, { at: [-6.5, 0, 7.8] });
    for (let i = 0; i < 4; i++) b.box(5.6, 0.25, 0.3, P.leaf, { at: [-6.5, 0.1, 6.2 + i * 1.0] });
    b.box(21.8, 0.04, 23, P.earth, { at: [0, 0, -0.3] });
    // a fallen Roman column in the yard
    b.log(0.35, 2.6, P.marble, { at: [5.0, 0, 4.0], rotY: 0.4 });
    b.tree(5, { kind: 'olive', at: [-3.5, 0, 8.5] });
  },
};
