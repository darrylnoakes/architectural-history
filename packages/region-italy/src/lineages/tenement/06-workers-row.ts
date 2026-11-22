import { P, mix, tint, type BuildingDef } from '@ah/kit';
import { PW, ROW, coppiRoof, medievalRow, patch, rowX, tenter, wellHead } from './shared';

export const workersRow: BuildingDef = {
  id: 'workers-row',
  name: 'Row of rented houses',
  style: 'Medieval communal vernacular',
  date: 'c. 1250',
  summary:
    'In the boom years of the communes, cloth-making drew thousands of spinners, weavers and dyers into the towns. Monasteries, hospitals and rich citizens bought land on the edge of the built-up area and laid out rows of identical narrow houses to let to them. ' +
    'Each house is one room deep on two floors: a ground-floor room for work or storage, and the family’s rooms above, reached by an outside stone stair, the profferlo, with a landing on an arch. ' +
    'They are built of the local stone with small round-headed windows, and the owner’s arms on every front showed whose rent was due. Behind, each house has a strip of yard for a tenter frame or a few vegetables.',
  materials: ['peperino, tufa or pietra forte rubble and squared stone', 'coppi roof tiles', 'oak doors and floors'],
  modelledOn: 'The profferli of the San Pellegrino quarter, Viterbo, and the rows of houses built to let in the new suburbs of the communes',
  lookFor: [
    { label: 'Profferlo', note: 'An outside stair of stone rising along the front to a landing carried on an arch: the upper floor had its own door.', at: [rowX(1) + 0.4, 2.2, ROW.zf + 1.1] },
    { label: 'Identical houses', note: 'Five houses of exactly the same width and plan, built in one campaign by one landlord to let.', at: [rowX(3), 4.6, ROW.zf + 0.2] },
    { label: 'Owner’s arms', note: 'A small carved shield on each front named the landlord, often a monastery, a hospital or a guild.', at: [rowX(2) - 0.05, ROW.g + 1.7, ROW.zf + 0.15] },
    { label: 'Pan-and-cover tiles', note: 'A low roof of curved clay tiles (coppi), laid alternately face up and face down.', at: [rowX(0), 7.4, 1.0] },
    { label: 'Tenter frame', note: 'Woven cloth was stretched on hooks along a wooden frame to dry to the right width and length.', at: [5.0, 1.6, -5.6] },
  ],
  influences: [],
  build(b) {
    const stone = b.pick([P.peperino, tint(P.peperino, 0.05), P.tufa, P.pietraForte]);
    const roof = b.pick([P.coppi, tint(P.coppi, -0.04), tint(P.coppi, 0.03)]);
    const L = ROW.n * ROW.hw;
    const zc = (ROW.zf + ROW.zb) / 2;
    const D = ROW.zf - ROW.zb;
    const shield = b.pick([P.terracottaPainted, P.doorBlue, P.marbleGreen]);

    // street of brick laid on edge in front, earth yards behind
    patch(b, PW, 8 - ROW.zf, mix(P.brickRed, P.paving, 0.45), [0, (ROW.zf + 8) / 2], 0.05);
    patch(b, PW, 8 + ROW.zb, tint(P.earth, 0.05), [0, (ROW.zb - 8) / 2], 0.03);

    medievalRow(b, stone, { shield });
    // one roof over the whole row, on timber eaves brackets
    coppiRoof(b, L, D, 21, roof, { at: [0, ROW.top, zc], ov: 0.6, wall: stone, rib: 0.55 });
    for (let x = -L / 2 + 0.3; x < L / 2; x += 0.8) {
      b.box(0.12, 0.14, 0.6, P.oakDark, { at: [x, ROW.top - 0.2, ROW.zf + 0.3] });
      b.box(0.12, 0.14, 0.6, P.oakDark, { at: [x, ROW.top - 0.2, ROW.zb - 0.3] });
    }

    // yards: low stone walls between the strips, a tenter frame, a privy, a shared well
    for (let i = 1; i < ROW.n; i++) {
      const x = -L / 2 + i * ROW.hw;
      b.box(0.35, 1.1, 8 + ROW.zb - 0.4, stone, { at: [x, 0, (ROW.zb - 8) / 2 - 0.2] });
    }
    b.box(L, 1.1, 0.35, stone, { at: [0, 0, -7.75] });
    tenter(b, 5.0, -5.6, 3.8, b.pick([P.doorBlue, P.cream, P.cladRed, P.intonacoSienna]));
    tenter(b, -9.8, -5.0, 3.4, b.pick([P.cream, P.white, P.doorGreen]));
    wellHead(b, rowX(2), -5.4, stone);
    for (let k = 0; k < 3; k++) patch(b, 3.6, 0.5, P.soil, [rowX(1), -3.8 - k * 1.1], 0.1);
    for (let k = 0; k < 6; k++) b.blob(0.22, P.leaf, { at: [rowX(1) - 1.4 + (k % 3) * 1.4, 0.2, -3.8 - Math.floor(k / 3) * 1.1], detail: 0 });
    b.box(1.2, 2.0, 1.1, stone, { at: [rowX(4) + 1.4, 0, -6.9] });
    b.shed(1.4, 1.3, 0.35, roof, { at: [rowX(4) + 1.4, 2.0, -6.9], high: '-z' });
    b.panel(0.7, 1.6, P.oakDark, { at: [rowX(4) + 1.4, 0.02, -6.35], facing: '+z' });
    if (b.chance(0.6)) b.tree(4.0, { at: [rowX(3), 0, -5.6], kind: 'olive' });

    b.collider(L, D, { at: [0, 0, zc] });
    b.collider(L, 1.3, { at: [0, 0, ROW.zf + 0.62] });
  },
};
