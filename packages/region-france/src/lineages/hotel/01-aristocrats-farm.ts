import { P, tint, type BuildingDef } from '@ah/kit';
import { granary, palisade, thatchedHall } from './shared';

export const aristocratsFarm: BuildingDef = {
  id: 'aristocrats-farm',
  name: 'Gaulish noble’s enclosure',
  style: 'Late Iron Age (La Tène)',
  date: 'c. 300 BC',
  summary:
    'The richest family of the tribe lives apart from the rest, inside its own bank, ditch and palisade. Within stand a great aisled house of oak posts, wattle and daub under a thick thatch, raised granaries for the grain the household’s dependants owed it, and storage pits. ' +
    'Everything is built of wood, earth and straw, but on a scale no one else could command, and the gate is a statement of power: a timber tower hung with captured weapons and, as Greek writers describe, the heads of enemies. ' +
    'Excavated enclosures of this kind show feasting, imported wine jars and finely carved stone stelae.',
  materials: ['oak posts', 'wattle and daub', 'wheat-straw thatch', 'earth bank', 'stone (stele)'],
  modelledOn: 'The fortified aristocratic residence of Paule, Côtes-d’Armor (5th to 1st century BC, excavated by Yves Menez): reduced to a single enclosure; the layout here is generic',
  lookFor: [
    { label: 'Gate tower with trophies', note: 'A timber tower over the only way in, hung with captured shields and spears: a display of the family’s victories.', at: [0, 4.6, 11.2] },
    { label: 'Aisled house', note: 'Two rows of inner posts carry the roof so the house can be wide: a hall for the household, its guests and its feasts.', at: [0, 4.4, -4.0] },
    { label: 'Granaries on posts', note: 'Grain stored off the ground, out of reach of damp and rats; full granaries were wealth.', at: [7.0, 3.0, 4.0] },
    { label: 'Bank, ditch and palisade', note: 'An earth bank thrown up from the ditch outside, topped with a fence of pointed stakes.', at: [-10.6, 2.4, 0] },
    { label: 'Carved stele', note: 'A standing stone, rounded and fluted in the Armorican manner, set up in the yard.', at: [-4.6, 1.8, 3.4] },
  ],
  build(b) {
    const thatch = b.pick([P.thatch, P.thatchOld, tint(P.thatch, -0.04)]);
    const daub = b.pick([P.daub, P.cob, tint(P.daub, 0.03)]);
    const wood = b.pick([P.oak, tint(P.oak, 0.05)]);
    const X = 10.6; // palisade half-width
    const Zf = 10.6; // palisade line at the front
    const Zb = -11.4; // and at the back

    // ---- the ditch outside and the bank inside it
    const earth = tint(P.earth, -0.04);
    const ditch = P.soil;
    b.box(23.6, 0.04, 0.9, ditch, { at: [0, 0, Zf + 1.3] });
    b.box(23.6, 0.04, 0.9, ditch, { at: [0, 0, Zb - 1.2] });
    for (const s of [-1, 1]) b.box(0.9, 0.04, 25.4, ditch, { at: [s * (X + 0.9), 0, -0.4] });
    const bankH = 0.7;
    const bank = (w: number, d: number, x: number, z: number) => {
      b.box(w, bankH, d, earth, { at: [x, 0, z] });
      b.box(w - 0.4, 0.12, d - 0.4, P.turf, { at: [x, bankH, z] });
    };
    bank(9.0, 1.6, -6.2, Zf);
    bank(9.0, 1.6, 6.2, Zf);
    bank(2 * X + 1.6, 1.6, 0, Zb);
    for (const s of [-1, 1]) bank(1.6, Zf - Zb, s * X, (Zf + Zb) / 2);
    // the palisade on top
    b.group({ at: [0, bankH, 0] }, () => {
      palisade(b, -X, Zf, -1.8, Zf, 2.4, wood);
      palisade(b, 1.8, Zf, X, Zf, 2.4, wood);
      palisade(b, -X, Zb, X, Zb, 2.4, wood);
      palisade(b, -X, Zb, -X, Zf, 2.4, wood);
      palisade(b, X, Zb, X, Zf, 2.4, wood);
    });
    b.collider(X - 1.6, 1.8, { at: [-(X + 1.6) / 2, 0, Zf] });
    b.collider(X - 1.6, 1.8, { at: [(X + 1.6) / 2, 0, Zf] });
    b.collider(2 * X + 1.8, 1.8, { at: [0, 0, Zb] });
    for (const s of [-1, 1]) b.collider(1.8, Zf - Zb, { at: [s * X, 0, (Zf + Zb) / 2] });

    // ---- the gate tower: four great posts, a fighting platform, a little roof, the trophies
    const gz = Zf;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) b.box(0.4, 5.2, 0.4, tint(wood, -0.05), { at: [sx * 1.6, 0, gz + sz * 1.0] });
      // the bank ends revetted with planks
      b.box(0.15, 1.0, 1.8, wood, { at: [sx * 1.85, 0, gz] });
    }
    b.box(3.8, 0.25, 2.6, wood, { at: [0, 3.2, gz] });
    for (const sz of [-1, 1]) b.box(3.6, 1.0, 0.12, wood, { at: [0, 3.45, gz + sz * 1.2] });
    b.pyramid(4.0, 2.8, 1.5, thatch, { at: [0, 5.2, gz], overhang: 0.35 });
    // gate leaves, open inward
    for (const s of [-1, 1]) b.box(0.12, 2.6, 1.5, tint(wood, -0.1), { at: [s * 1.4, 0, gz - 1.6] });
    b.box(3.4, 0.06, 2.0, P.gravel, { at: [0, 0, gz] });
    // trophies: shields, crossed spears and skulls on the front of the tower
    for (const x of [-1.2, 0, 1.2]) {
      b.cyl(0.42, 0.08, b.pick([P.doorRed, P.oak, P.bronze]), { at: [x, 3.75, gz + 1.28], rot: [Math.PI / 2, 0, 0], segs: 8 });
      b.box(0.08, 0.8, 0.12, P.bronze, { at: [x, 3.37, gz + 1.36], jitter: false });
    }
    for (const s of [-1, 1]) {
      b.beam([s * 0.3, 2.0, gz + 1.25], [s * 1.6, 4.6, gz + 1.25], 0.05, 0.05, P.oakDark);
      b.box(0.08, 0.35, 0.03, P.iron, { at: [s * 1.6, 4.55, gz + 1.25], rotY: 0 });
    }
    for (const x of [-1.5, 1.5]) {
      b.cyl(0.04, 0.8, P.oakDark, { at: [x, 5.2, gz + 1.0], segs: 4 });
      b.sphere(0.14, P.limewash, { at: [x, 6.05, gz + 1.0], segs: 6 });
    }

    // ---- the great aisled house at the back of the yard
    thatchedHall(b, { at: [0, 0, -5.0], w: 13, d: 7.5, wall: 2.2, roof: 4.4, daub, thatch });
    b.collider(13.4, 7.9, { at: [0, 0, -5.0] });
    // the inner posts of the aisles, glimpsed through the door, and a porch
    for (const x of [-0.9, 0.9]) b.cyl(0.13, 2.3, wood, { at: [x, 0, -5.0 + 3.75 + 1.1], segs: 5 });
    b.shed(2.4, 1.3, 0.5, thatch, { at: [0, 2.3, -5.0 + 3.75 + 0.6], high: '-z' });
    // ---- a kitchen and workshop house to one side
    thatchedHall(b, { at: [-7.0, 0, 2.6], w: 4.8, d: 4.0, wall: 1.8, roof: 2.8, daub, thatch, rotY: Math.PI / 2, posts: false });
    b.collider(4.2, 5.0, { at: [-7.0, 0, 2.6] });
    // ---- granaries on posts
    granary(b, 6.0, 4.2, 2.2, thatch);
    granary(b, 8.2, 1.0, 2.0, thatch, 0.1);
    b.collider(2.4, 2.4, { at: [6.0, 0, 4.2] });
    b.collider(2.2, 2.2, { at: [8.2, 0, 1.0] });
    // storage pits sealed with clay, and a covered one
    for (const [x, z] of [[3.4, 6.6], [4.6, 7.6], [2.4, 7.8]] as [number, number][]) b.cyl(0.55, 0.12, tint(P.mud, 0.06), { at: [x, 0, z], segs: 8 });
    b.cone(0.75, 0.6, thatch, { at: [3.4, 0.1, 6.6], segs: 8 });
    // a pen for the horses and cattle
    for (let i = 0; i <= 4; i++) b.cyl(0.07, 1.2, wood, { at: [-9.2 + i * 1.1, 0, -0.4], segs: 4 });
    for (const y of [0.5, 1.0]) b.box(4.4, 0.08, 0.08, wood, { at: [-7.0, y, -0.4] });
    // the carved stele
    b.box(0.8, 0.2, 0.8, P.granite, { at: [-4.6, 0, 3.4] });
    b.cyl(0.32, 1.5, P.granite, { at: [-4.6, 0.2, 3.4], segs: 8, rTop: 0.22 });
    b.sphere(0.22, P.granite, { at: [-4.6, 1.72, 3.4], segs: 6 });
    // firewood stack and a cart
    b.box(1.6, 0.8, 0.7, P.oakDark, { at: [-4.0, 0, -0.2] });
    b.box(1.2, 0.3, 2.0, wood, { at: [4.0, 0.5, -0.4] });
    for (const s of [-1, 1]) b.cyl(0.5, 0.08, P.oakDark, { at: [4.0 + s * 0.68, 0.5, -0.4], rot: [0, 0, Math.PI / 2], segs: 8 });
    b.beam([4.0, 0.6, 0.6], [4.0, 0.4, 2.2], 0.1, 0.1, wood);
  },
};
