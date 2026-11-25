import { P, spread, type BuildingDef } from '@ah/kit';
import { cafeTable, umbrella, word } from './shared';
import { BTOP, BZI, G, GX, SX, TOP, XO, ZB, ZBI, ZF, ZFI, buildRenaissanceInn } from './07-renaissance-inn';

export const boutiqueHotel: BuildingDef = {
  id: 'boutique-hotel',
  name: 'Boutique hotel and wine bar',
  style: 'Restoration and reuse',
  date: '2016',
  summary:
    'The old inn has come back into its own. The fifteenth-century building, which had served in turn as an inn, flats and offices, is restored as a small hotel of a dozen rooms, with a wine bar (enoteca) in the old tavern and its portico. ' +
    'Italian law protects such buildings closely, so the changes are of the kind the heritage authority, the Soprintendenza, will allow: the corner loggia, walled in since the seventeenth century, opened again, glass set into the old openings, a lift in a glass shaft in a corner of the yard, a roof terrace on the low stable wing, and the wiring and bathrooms hidden inside. ' +
    'Meanwhile the 1950s bar stands on in the new quarter, and holiday lets are emptying the old centre of the people who once lived above the shops.',
  materials: ['restored lime plaster', 'travertine', 'terracotta', 'frameless glass', 'weathering steel'],
  lookFor: [
    { label: 'Glazed arches', note: 'The portico doors and the old stable openings are filled with frameless glass, so the historic arches still read clearly.', at: [5.4, 2.2, ZF - 2.6] },
    { label: 'Glass lift', note: 'A lift in a glass shaft in a corner of the yard: plainly new, as the Venice Charter of 1964 asks of additions, and removable, as later conservation practice prefers.', at: [SX - 1.0, 6.0, ZFI - 1.0] },
    { label: 'Roof terrace', note: 'The stable roof replaced by a terrace with a pergola, for breakfast and sundowners above the yard.', at: [-6.0, BTOP + 1.4, (ZB + ZBI) / 2] },
    { label: 'Dehors', note: 'Tables under the portico and out on the street, for which the wine bar pays the commune a fee for the public space.', at: [3.2, 1.0, ZF + 1.0] },
    { label: 'Restored front', note: 'Plaster renewed in lime and tinted to match traces of the old colour; the travertine and terracotta cleaned, not replaced.', at: [-5.6, G + 2.5, ZF + 0.2] },
  ],
  build(b) {
    buildRenaissanceInn(b, true);

    // signs: a small bronze name over the gate and the enoteca's letters in the portico
    word(b, 'HOTEL', 0.09, P.bronze, { at: [GX, 4.25, ZF + 0.1], facing: '+z' });
    word(b, 'ENOTECA', 0.07, P.bronze, { at: [5.4, 3.15, ZF - 2.75], facing: '+z' });
    b.box(0.6, 0.9, 0.06, 0x6e3b22, { at: [-1.4, 1.2, ZF + 0.04] });

    // the glass lift in the corner of the yard
    const lx = SX - 1.0;
    const lz = ZFI - 1.0;
    const lh = TOP - 0.4;
    b.box(1.8, lh, 1.8, P.glass, { at: [lx, 0, lz], mat: 'glass' });
    for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]] as const) b.box(0.08, lh, 0.08, P.steel, { at: [lx + x, 0, lz + z] });
    for (const y of [G, G + 4]) b.box(1.9, 0.1, 1.9, P.steel, { at: [lx, y, lz] });
    b.box(2.0, 0.12, 2.0, P.steel, { at: [lx, lh, lz] });

    // street tables, planters and umbrellas; tables under the portico
    for (const x of [0.6, 4.2, 7.8]) {
      cafeTable(b, [x, 0.1, ZF + 0.9], P.white, P.castIron, 2, Math.PI / 2);
    }
    for (const x of [2.4, 6.0]) umbrella(b, [x, 0.1, ZF + 0.95], 2.2, P.cream);
    for (const x of spread(3, 1.0, 8.6)) cafeTable(b, [x, 0.1, 7.9], P.white, P.castIron, 2);
    for (const x of [-0.6, 9.6]) {
      b.box(0.8, 0.6, 0.8, P.cladGrey, { at: [x, 0.1, ZF + 0.9] });
      b.blob(0.5, P.leafDark, { at: [x, 0.99, ZF + 0.9], detail: 0 });
    }

    // the yard: tables, olives in big pots, festoon lights
    for (const [x, z] of [[-6.4, 0.6], [-3.6, -3.2], [0.8, -2.6], [-7.2, -3.0]] as const) cafeTable(b, [x, 0.04, z], P.white, P.castIron, 3);
    for (const [x, z] of [[-8.6, 2.6], [2.6, 2.4], [3.6, -2.4]] as const) {
      b.cyl(0.6, 0.8, P.cotto, { at: [x, 0.04, z], rTop: 0.7, segs: 8 });
      b.tree(3.4, { at: [x, 0.8, z], kind: 'olive' });
    }
    for (let i = 0; i < 7; i++) {
      b.beam([-XO + 0.5 + i * 2.2, 4.0, ZFI - 0.1], [-XO + 1.6 + i * 2.2, 3.5, BZI + 0.2 + (i % 2) * 0.3], 0.03, 0.03, P.windowLit);
    }
    b.collider(1.8, 1.8, { at: [lx, 0, lz] });
  },
};
