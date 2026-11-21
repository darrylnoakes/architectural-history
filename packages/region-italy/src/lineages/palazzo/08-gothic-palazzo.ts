import { P, tint, type BuildingDef } from '@ah/kit';
import { bifora, block, brackets, coppiRibs, onFace, rustic, voussoirs, win } from './shared';

export const gothicPalazzo: BuildingDef = {
  id: 'gothic-palazzo',
  name: 'Merchant-banker’s palace',
  style: 'Gothic',
  date: 'c. 1340',
  summary:
    'The great families of the commune have come down from their towers into a broad, compact town palace that is at once house, counting-house and warehouse. ' +
    'The ground floor opens to the street in wide arches for the family business, while the household lives on the floors above, lit by two-light windows with pointed heads. ' +
    'Battlements on corbels still give a fortified look, but they are now more a sign of rank than a defence. ' +
    'Behind, a small courtyard holds the well and an open stone stair with timber galleries leading to the upper rooms, and an open loggia on the roof catches the evening air.',
  materials: ['pietraforte ashlar', 'brick', 'timber floors and galleries', 'coppi roof tiles', 'wrought iron'],
  modelledOn: 'Palazzo Davanzati, Florence (built for the Davizzi family in the mid-fourteenth century); the two-light windows follow Sienese palaces',
  influences: ['cistercian-gothic'],
  lookFor: [
    { label: 'Warehouse arches', note: 'Three wide arches open the ground floor to the street: the family’s shop, store and counting-house, with the entrance passage in the middle.', at: [-6.7, 2.4, 12.6] },
    { label: 'Two-light windows (bifore)', note: 'Each window is split by a slender colonnette into two pointed lights under one pointed arch.', at: [4, 7.6, 12.4] },
    { label: 'Battlements on corbels', note: 'Square merlons crown a parapet carried forward on a row of stone corbels: a show of rank rather than a real defence.', at: [-9.5, 18.4, 12.6] },
    { label: 'Courtyard stair and gallery', note: 'An open stone stair climbs the side of the courtyard to a timber gallery (ballatoio) that gives onto the rooms of the main floor.', at: [4.2, 3.4, -2.0] },
    { label: 'Roof loggia (altana)', note: 'An open loggia under the roof of the back range, for drying cloth, keeping cool and watching the street. Davanzati’s own loggia replaced its battlements in the sixteenth century.', at: [-4, 15.4, -9.6] },
  ],
  build(b) {
    const stone = b.pick([P.pietraForte, tint(P.pietraForte, 0.04), tint(P.pietraForte, -0.03)]);
    const brickUpper = b.variant > 0 && b.chance(0.5);
    const upper = brickUpper ? b.pick([P.cotto, P.brickOrange]) : tint(stone, 0.03);
    const trim = brickUpper ? P.travertine : tint(stone, 0.08);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.05)]);
    const wood = b.pick([P.oakDark, P.oak]);
    const W = 20;
    const zf = 12;
    const zb = 3;
    const G = 5.4;
    const F1 = 4.4;
    const F2 = 4.0;
    const F3 = 3.8;
    const H = G + F1 + F2 + F3; // 17.6
    const Hr = G + F1 + F2; // the lower ranges round the court

    // ---- front block: solid ground floor either side of the entrance passage, full upper floors
    b.sym((s) => b.box(8.2, G, 8.2, stone, { at: [s * 5.9, 0, 7.1] }));
    b.box(W, H - G, zf - zb, upper, { at: [0, G, (zf + zb) / 2] });
    b.box(W, G, 0.8, stone, { at: [0, 0, 3.4] }); // back wall of the ground floor, on the court
    b.sym((s) => b.collider(8.3, 9, { at: [s * 5.85, 0, 7.5] }));
    // street wall of the ground floor, pierced by three arches
    const arches = [-6.7, 0, 6.7];
    const aw = 3.4;
    const ah = 4.6;
    b.archWall(W, G, 0.8, stone, { at: [0, 0, zf - 0.4], facing: '+z', openings: 3, openW: aw, openH: ah, shape: 'round' });
    // the passage through to the court (its back wall arched too)
    b.box(3.2, 0.06, 9, P.paving, { at: [0, 0, 7.5] });
    b.archWall(3.6, G, 0.82, stone, { at: [0, 0, 3.4], facing: '+z', openings: 1, openW: 2.6, openH: 4.0, shape: 'round' });
    b.box(3.4, 0.3, 9, tint(stone, -0.15), { at: [0, G - 0.3, 7.5] }); // passage ceiling
    // warehouse doors behind the side arches
    for (const x of [-6.7, 6.7]) {
      b.panel(aw - 0.2, ah - 0.1, wood, { at: [x, 0, 11.2], facing: '+z', shape: 'round', depth: 0.05 });
      b.panel(1.0, 2.0, tint(wood, -0.1), { at: [x - 0.5, 0, 11.2], facing: '+z', depth: 0.09 });
      b.panel(aw - 0.4, 0.08, P.iron, { at: [x, 2.6, 11.2], facing: '+z', depth: 0.1 });
    }

    onFace(b, '+z', [0, 0, zf], () => {
      // rough-hewn pietraforte on the ground floor, long voussoirs round the arches
      const skip = arches.map((x) => [x - aw / 2 - 0.05, x + aw / 2 + 0.05, 0, ah + 0.1] as [number, number, number, number]);
      rustic(b, -W / 2, W / 2, 0.0, G, stone, { course: 0.68, len: 1.5, proud: 0.05, rough: 0.05, skip, vary: 0.05 });
      for (const x of arches) voussoirs(b, x, ah - aw / 2, aw / 2, 0.75, 11, 0.08, tint(stone, 0.02), { rough: 0.04, vary: 0.05 });
      // string courses that carry the window sills
      const sills = [G, G + F1, G + F1 + F2];
      for (const y of sills) b.box(W + 0.12, 0.18, 0.2, trim, { at: [0, y + 0.55, 0.1] });
      const lights: [number, number, number][] = [
        [G + 0.75, 1.6, 2.7],
        [G + F1 + 0.75, 1.5, 2.5],
        [G + F1 + F2 + 0.75, 1.4, 2.3],
      ];
      for (const [y, w, h] of lights) {
        for (const x of [-8, -4, 0, 4, 8]) {
          bifora(b, x, y, w, h, trim, { shape: 'pointed', border: 0.16 });
          // iron rings for poles and awnings either side
          if (y < G + 1) b.sym((s) => b.box(0.08, 0.08, 0.14, P.iron, { at: [x + s * 1.25, y + 0.6, 0.06] }));
        }
      }
      // torch holder and tethering rings on the ground floor
      for (const x of [-3.6, 3.6]) {
        b.box(0.08, 0.6, 0.5, P.iron, { at: [x, 2.8, 0.25] });
        b.cyl(0.13, 0.22, P.iron, { at: [x, 3.3, 0.5], segs: 6 });
        b.cyl(0.09, 0.05, P.iron, { at: [x, 1.5, 0.1], segs: 6 });
      }
      // family arms over the entrance
      b.panel(0.8, 1.0, P.travertine, { at: [0, ah + 0.4, 0.06], shape: 'round', depth: 0.1 });
      b.panel(0.5, 0.6, P.intonacoRed, { at: [0, ah + 0.55, 0.12], depth: 0.07 });
    });

    // ---- side and back walls of the front block: plainer windows
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, 7.5], () => {
        for (const [y, w, h] of [[G + 0.8, 1.0, 2.2], [G + F1 + 0.8, 1.0, 2.0], [G + F1 + F2 + 0.7, 0.9, 1.9]] as const) {
          for (const x of [-2.2, 2.2]) win(b, x, y, w, h, trim, { shape: 'pointed', border: 0.14, n: 2 });
        }
        win(b, 0, 2.2, 0.7, 0.9, trim, { border: 0.12 });
      });
    }

    // ---- battlements: a projecting parapet on corbels, square merlons
    const pz = 0.5;
    onFace(b, '+z', [0, 0, zf], () => {
      brackets(b, -W / 2 + 0.3, W / 2 - 0.3, H, 0.9, pz, 0.8, 0.3, trim);
    });
    for (const s of [-1, 1] as const) {
      onFace(b, s > 0 ? '+x' : '-x', [s * W / 2, 0, 7.5], () => brackets(b, -4.2, 4.2, H, 0.9, pz, 0.8, 0.3, trim));
    }
    const pw = W + 2 * pz;
    const pd = zf - zb + 2 * pz;
    const pzc = (zf + zb) / 2;
    b.box(pw, 0.9, 0.35, upper, { at: [0, H, zf + pz - 0.175] });
    b.box(pw, 0.9, 0.35, upper, { at: [0, H, zb - pz + 0.175] });
    b.sym((s) => b.box(0.35, 0.9, pd, upper, { at: [s * (W / 2 + pz - 0.175), H, pzc] }));
    b.crenel(pw, pd, upper, { at: [0, H + 0.9, pzc], merlonW: 0.75, merlonH: 0.9, t: 0.35 });
    b.hip(W - 0.6, zf - zb - 0.6, 1.5, roof, { at: [0, H, pzc] });

    // ---- right-hand range down the court, and the back range with its roof loggia
    block(b, 5, Hr, 10, upper, 7.5, -2);
    b.box(5.02, G, 10.02, stone, { at: [7.5, 0, -2] });
    b.gable(5, 10, 1.1, roof, { at: [7.5, Hr, -2], ridge: 'z', overhang: 0.5, wall: upper });
    block(b, W, Hr, 5, upper, 0, -9.5);
    b.box(W + 0.02, G, 5.02, stone, { at: [0, 0, -9.5] });
    // the loggia: back wall, five stone piers on the court side, deep timber eaves
    b.sym((s) => b.box(0.4, 3.0, 4.6, upper, { at: [s * (W / 2 - 0.2), Hr, -9.7] }));
    b.box(W, 0.12, 5, P.cotto, { at: [0, Hr, -9.5] });
    for (const z of [-7.3, -11.7]) {
      for (const x of [-7.2, -2.4, 2.4, 7.2]) {
        b.cyl(0.2, 2.7, trim, { at: [x, Hr, z], segs: 8 });
        b.box(0.5, 0.2, 0.5, trim, { at: [x, Hr + 2.6, z] });
      }
      b.box(W, 0.3, 0.4, wood, { at: [0, Hr + 2.8, z] });
      b.box(W - 0.8, 1.0, 0.2, tint(wood, 0.1), { at: [0, Hr, z] }); // parapet rail
    }
    b.box(4, 2.8, 0.3, upper, { at: [-W / 2 + 2.2, Hr, -9.5], rotY: Math.PI / 2 }); // a closed room at one end
    b.gable(W, 5, 1.1, roof, { at: [0, Hr + 3.0, -9.5], overhang: 0.8 });
    coppiRibs(b, -W / 2 - 0.6, W / 2 + 0.6, -9.5, 5, Hr + 3.0, 1.1, 0.8, tint(roof, -0.06), 1.0);
    // rafter ends under the eaves of the loggia
    for (let i = 0; i < 16; i++) {
      for (const z of [-6.7, -12.3]) b.box(0.12, 0.12, 0.8, wood, { at: [-W / 2 + 0.6 + i * 1.25, Hr + 2.95, z] });
    }

    // back range: windows to the court and to the back street
    onFace(b, '-z', [0, 0, -12], () => {
      for (const x of [-7.5, -2.5, 2.5, 7.5]) {
        win(b, x, 2.0, 1.3, 1.6, trim, { shape: 'round' });
        win(b, x, G + 0.9, 1.0, 2.1, trim, { shape: 'pointed', n: 2 });
        win(b, x, G + F1 + 0.9, 1.0, 1.9, trim, { shape: 'pointed', n: 2 });
      }
      b.panel(1.6, 2.6, wood, { at: [0, 0, 0], shape: 'round', depth: 0.08 });
    });
    onFace(b, '+z', [0, 0, -7], () => {
      for (const x of [-7, -3]) {
        win(b, x, G + 0.9, 1.0, 2.1, trim, { shape: 'pointed', n: 2 });
        win(b, x, G + F1 + 0.9, 1.0, 1.9, trim, { shape: 'pointed', n: 2 });
      }
      b.panel(1.4, 2.5, wood, { at: [-5, 0, 0], shape: 'round', depth: 0.08 });
    });
    onFace(b, '+x', [W / 2, 0, -2], () => {
      for (const x of [-3, 3]) {
        win(b, x, G + 0.9, 1.0, 2.1, trim, { shape: 'pointed', n: 2 });
        win(b, x, G + F1 + 0.9, 1.0, 1.9, trim, { shape: 'pointed', n: 2 });
      }
    });
    onFace(b, '-x', [5, 0, -2], () => {
      win(b, -3, G + F1 + 0.9, 1.0, 1.9, trim, { shape: 'pointed', n: 2 });
      b.panel(1.2, 2.3, wood, { at: [-2.5, G + 0.05, 0], depth: 0.08 });
      b.panel(1.2, 2.4, wood, { at: [3.6, 0, 0], depth: 0.08 });
    });
    onFace(b, '-z', [0, 0, zb], () => {
      for (const x of [6, -6]) win(b, x, G + F1 + 0.9, 1.0, 1.9, trim, { shape: 'pointed', n: 2 });
      win(b, 6, G + F1 + F2 + 0.8, 0.9, 1.8, trim, { shape: 'pointed', n: 2 });
      win(b, -6, G + F1 + F2 + 0.8, 0.9, 1.8, trim, { shape: 'pointed', n: 2 });
      b.panel(1.2, 2.4, wood, { at: [-4.4, G + 0.05, 0], depth: 0.08 });
    });

    // ---- the court: garden wall on the left, paving, well, stair and timber gallery
    block(b, 0.6, 6.0, 10, stone, -9.7, -2);
    b.box(0.8, 0.3, 10.2, roof, { at: [-9.7, 6.0, -2] });
    b.box(14.4, 0.05, 10, P.paving, { at: [-2.2, 0, -2] });
    b.cyl(0.75, 0.9, P.travertine, { at: [-3.5, 0, -2], segs: 10 });
    b.cyl(0.6, 0.92, P.windowDark, { at: [-3.5, 0, -2], segs: 10 });
    b.sym((s) => b.box(0.12, 1.6, 0.12, P.iron, { at: [-3.5 + s * 0.6, 0.9, -2] }));
    b.box(1.3, 0.1, 0.1, P.iron, { at: [-3.5, 2.5, -2] });
    // the stair: up the side of the court on stone brackets, to a landing at the main floor
    b.stairs(1.2, G, 6.6, 18, trim, { at: [4.4, 0, -2.9], rotY: Math.PI });
    b.box(1.2, 0.3, 2.6, trim, { at: [4.4, G - 0.3, 1.7] });
    b.beam([3.8, 1.0, -6.2], [3.8, G + 1.0, 0.4], 0.12, 0.12, P.iron);
    b.box(0.08, 1.0, 2.6, P.iron, { at: [3.8, G, 1.7] });
    b.collider(1.2, 6.6, { at: [4.4, 0, -2.9] });
    // timber gallery (ballatoio) along the court face of the front block
    b.box(13.5, 0.18, 1.2, wood, { at: [-3.15, G - 0.18, 2.4] });
    for (let i = 0; i < 9; i++) {
      const x = -9.2 + i * 1.6;
      b.box(0.16, 0.24, 1.3, tint(wood, -0.1), { at: [x, G - 0.42, 2.4] });
      b.box(0.08, 1.0, 0.08, wood, { at: [x, G, 1.85] });
    }
    b.box(13.5, 0.1, 0.1, wood, { at: [-3.15, G + 0.95, 1.85] });
    b.shed(14, 1.4, 0.6, roof, { at: [-2.9, G + F1 - 0.6, 2.3], high: '+z' });
    for (const x of [-7.5, -3]) b.panel(1.1, 2.3, wood, { at: [x, G, 3], facing: '-z', depth: 0.08 });
  },
};
