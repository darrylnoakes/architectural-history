import { P, tint, mix, type BuildingDef } from '@ah/kit';
import { BANK, END, FOOT, WATER, hump, band, bar, steps, tilt, cutwaterPier, trinitaLayout } from './shared';

export const baileyBridge: BuildingDef = {
  id: 'bailey-bridge',
  name: 'Bailey bridge on the stumps of the old piers',
  style: 'Military engineering',
  date: '1944',
  summary:
    'In the summer of 1944 the retreating German army blew up the town’s bridges to slow the Allied advance; in Florence, on the night of 3 to 4 August, every bridge over the Arno was destroyed except the Ponte Vecchio. ' +
    'Allied engineers put the road back across within days using a Bailey bridge, a British invention of 1940 to 1941 by Donald Bailey: a kit of steel panels, each light enough for six soldiers to carry, pinned together into trusses with no welding or special tools. ' +
    'It rests on timber cribs built up on the broken stumps of the Renaissance piers, while the rest of the old bridge lies in the river. It carries one lane of traffic over a deck of timber planks.',
  materials: ['steel panels', 'steel pins', 'timber decking', 'timber cribs', 'stones of the old bridge'],
  modelledOn: 'The Bailey bridges built across the Arno at Florence in 1944',
  lookFor: [
    { label: 'Bailey panel', note: 'Standard welded steel panels about 3 m long and 1.5 m high, pinned end to end to make the side trusses.', at: [2.3, 0.5, -6.0] },
    { label: 'Panel pins', note: 'Each panel is joined to the next by steel pins driven through lugs at the corners: no rivets, no welding.', at: [2.1, -0.25, 0] },
    { label: 'Timber crib', note: 'A stack of crossed timbers built up on the stump of a blown pier as a temporary support.', at: [2.6, -0.4, 4.4] },
    { label: 'Ruins of the old bridge', note: 'Blocks of the Renaissance arches lie in the river where they fell; many were later dredged up and reused.', at: [-4.4, -1.0, -8.0] },
    { label: 'Timber deck', note: 'Planks (chesses) laid across steel cross-beams, held down by timber kerbs; one lane, one vehicle at a time.', at: [0, 0.35, 9.0] },
  ],
  build(b) {
    b.noCollide();
    const crown = 0.35;
    const f = hump(crown);
    const roadW = 3.3;
    b.deck(roadW, 34, crown, { yEnds: 0 });
    const T = trinitaLayout();
    const stone = P.pietraForte;
    const steel = mix(P.iron, P.hedge, 0.35);
    const steelL = tint(steel, 0.08);
    const timber = mix(P.oak, P.oakSilver, 0.35);

    // ---- what is left of the Renaissance bridge
    for (const z of T.piers) {
      const top = -0.55 + b.range(-0.1, 0.1);
      cutwaterPier(b, { z, len: T.W, thick: T.pierT, nose: 1.5, y0: FOOT, h: top - FOOT, color: stone });
      // broken masonry on the stump
      for (let i = 0; i < 4; i++) {
        b.blob(b.range(0.35, 0.55), tint(stone, b.range(-0.1, 0)), { at: [b.range(-2.6, 2.6), top - 0.1, z + b.range(-0.6, 0.6)], stretch: [1.2, 0.7, 1], detail: 0 });
      }
    }
    // blasted abutments at the banks: ragged masonry ends
    b.sym((s) => {
      b.box(T.W, 0.9, 1.4, tint(stone, -0.04), { at: [0, -1.0, s * (BANK - 0.5)] });
      for (let i = 0; i < 4; i++) b.blob(b.range(0.4, 0.6), tint(stone, b.range(-0.1, 0)), { at: [b.range(-3, 3), -0.2, s * (BANK - b.range(0.3, 1.1))], stretch: [1.2, 0.7, 1], detail: 0 });
    });
    // fallen blocks and arch fragments in the water
    for (const op of T.ops) {
      for (let i = 0; i < 7; i++) {
        b.box(b.range(0.7, 1.3), b.range(0.4, 0.6), b.range(0.5, 0.9), tint(stone, b.range(-0.12, 0.0)), {
          at: [b.range(-3.8, 3.8), WATER - 0.35, b.range(op.z0 + 0.4, op.z1 - 0.4)],
          rot: [b.range(-0.3, 0.3), b.range(0, 3), b.range(-0.3, 0.3)],
        });
      }
    }

    // ---- timber cribs on the pier stumps and bank seats
    const bot = (z: number) => f(z) - 0.62; // underside of the bottom chord
    for (const z of [...T.piers]) {
      const top = bot(z);
      const y0 = -0.6;
      const n = Math.max(2, Math.round((top - y0) / 0.25));
      const h = (top - y0) / n;
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0) for (const dz of [-0.55, 0.55]) b.box(roadW + 1.6, h, 0.25, tint(timber, b.range(-0.05, 0.03)), { at: [0, y0 + i * h, z + dz] });
        else for (const x of [-2.2, -1.1, 0, 1.1, 2.2]) b.box(0.25, h, 1.4, tint(timber, b.range(-0.05, 0.03)), { at: [x, y0 + i * h, z] });
      }
    }
    b.sym((s) => {
      const z = s * (BANK + 1.2);
      b.box(roadW + 1.6, bot(z) + 0.3, 1.4, timber, { at: [0, -0.3, z] });
    });

    // ---- the Bailey trusses: panels about 3.05 m long and 1.45 m high, pinned end to end
    const panelL = 3.05;
    const nP = 10;
    const len = nP * panelL;
    const z0 = -len / 2;
    const H = 1.45;
    const trussX = roadW / 2 + 0.35;
    b.sym((k) => {
      for (const dx of [0, 0.22]) {
        const x = k * (trussX + dx);
        // chords
        band(b, x, 0.12, z0, z0 + len, (z) => bot(z), (z) => bot(z) + 0.14, steelL, 20);
        band(b, x, 0.12, z0, z0 + len, (z) => bot(z) + H - 0.14, (z) => bot(z) + H, steelL, 20);
        for (let i = 0; i < nP; i++) {
          const za = z0 + i * panelL;
          const zm = za + panelL / 2;
          const zb = za + panelL;
          // end posts, a centre post and the diagonals of each panel
          for (const z of [za + 0.06, zm, zb - 0.06]) b.box(0.1, H - 0.2, 0.1, steel, { at: [x, bot(z) + 0.1, z] });
          bar(b, [x, bot(za) + 0.12, za + 0.08], [x, bot(zm) + H - 0.12, zm], [0.08, 0.08], steel);
          bar(b, [x, bot(zm) + H - 0.12, zm], [x, bot(zb) + 0.12, zb - 0.08], [0.08, 0.08], steel);
          // pinned joints at the panel ends
          if (i > 0) for (const y of [0.07, H - 0.07]) b.cyl(0.07, 0.34, P.steel, { at: [x - k * 0.17, bot(za) + y, za], rot: [0, 0, Math.PI / 2], segs: 6 });
        }
      }
      // rakers bracing the trusses from the transom ends
      for (let i = 0; i <= nP; i++) {
        const z = z0 + i * panelL;
        bar(b, [k * (roadW / 2 + 0.05), bot(z) + 0.2, z], [k * trussX, bot(z) + H - 0.1, z], [0.06, 0.06], steel);
      }
    });
    // transoms under the deck, timber chesses and ribands (kerbs)
    for (let i = 0; i <= nP * 2; i++) {
      const z = z0 + (i * panelL) / 2;
      b.box(trussX * 2 + 0.6, 0.3, 0.18, steel, { at: [0, bot(z) - 0.02, z] });
    }
    for (const x of [-1.2, -0.4, 0.4, 1.2]) band(b, x, 0.12, z0, z0 + len, (z) => bot(z) + 0.28, (z) => bot(z) + 0.46, steel, 20);
    const nC = Math.round((END * 2 - 0.6) / 0.32);
    for (let i = 0; i < nC; i++) {
      const z = -END + 0.3 + (i + 0.5) * ((END * 2 - 0.6) / nC);
      b.box(roadW + 0.2, 0.09, 0.28, tint(timber, b.range(-0.08, 0.04)), { at: [0, f(z) - 0.09, z], rot: [tilt(f, z), 0, 0] });
    }
    b.sym((k) => band(b, k * (roadW / 2 - 0.08), 0.18, -END + 0.3, END - 0.3, (z) => f(z), (z) => f(z) + 0.18, timber, 24));
    // end ramps resting on the ground beyond the trusses
    b.sym((s) => {
      const za = s * (len / 2);
      for (const x of [-1.2, 1.2]) bar(b, [x, bot(za) + 0.3, za], [x, -0.1, s * (END - 0.3)], [0.14, 0.2], steel);
    });
    // a military sign at the approach
    b.group({ at: [roadW / 2 + 1.3, 0, -END + 1.0] }, () => {
      b.box(0.08, 1.4, 0.08, timber);
      b.box(0.06, 0.6, 0.9, P.cladYellow, { at: [0, 1.4, 0] });
      b.box(0.07, 0.24, 0.6, P.black, { at: [0, 1.58, 0] });
    });
    void steps;
  },
};
