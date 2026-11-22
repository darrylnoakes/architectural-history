import { P, car, tint, type BuildingDef } from '@ah/kit';

export const modernVilla: BuildingDef = {
  id: 'modern-villa',
  name: 'Modern villa on pilotis',
  style: 'Modern Movement (International Style)',
  date: 'c. 1930',
  summary:
    'A white box lifted on thin concrete columns, built for a family that arrives by car: the curve of the glazed ground floor follows the turning circle of the motor car, which is parked underneath. ' +
    'Le Corbusier set out five points for a new architecture, and this house shows them all: columns (pilotis) instead of walls, a free plan inside, a facade free of the structure, long ribbon windows, and a garden on the roof. ' +
    'Reinforced concrete makes it possible: the frame carries the floors, so walls and windows can go anywhere. A ramp rises from the open terrace to the sun screens on the roof.',
  materials: ['reinforced concrete frame', 'render painted white', 'steel window frames', 'glass', 'paint (dark green ground floor)'],
  modelledOn: 'The Villa Savoye, Poissy (Le Corbusier and Pierre Jeanneret, 1928 to 1931): the box on pilotis, the curved and green ground floor, the ribbon windows, the hanging garden, the outdoor ramp and the solarium screens on the roof. Simplified, and the terrace placed for the view from the street',
  influences: ['le-corbusier', 'reinforced-concrete'],
  lookFor: [
    { label: 'Pilotis', note: 'Slender round concrete columns lift the house off the ground, leaving the ground free for the car and the garden.', at: [-9.3, 1.6, 8.3] },
    { label: 'Ribbon windows (fenêtres en longueur)', note: 'One long horizontal window runs right round the house: the walls carry nothing, so the window can be any length.', at: [-4.0, 4.9, 8.6] },
    { label: 'Hanging garden', note: 'An open terrace cut into the box, glazed on its inner sides, so that living room and outdoor room are one.', at: [5.0, 4.2, 3.0] },
    { label: 'Ramp', note: 'A gentle ramp, not a stair, carries you up through the house and out onto the roof: architecture as a walk.', at: [2.2, 5.6, 2.0] },
    { label: 'Roof garden and solarium', note: 'Curved screen walls shelter a sun terrace on the roof, replacing the ground the house stands on.', at: [-4.0, 8.4, -6.0] },
  ],
  build(b) {
    const white = b.pick([P.whiteRender, P.cladWhite, tint(P.whiteRender, -0.02)]);
    const green = b.pick([0x2f4a3a, 0x33503f]);
    const frame = P.steel;
    const accent = b.pick([0xd9a3a0, 0x8fb0c8, 0xd8c08a]);
    const S = 19; // the box is S x S
    const zc = -1.0;
    const z0 = zc - S / 2; // -10.5
    const z1 = zc + S / 2; // 8.5
    const y0 = 3.2; // underside of the floor
    const yF = y0 + 0.35; // floor level
    const yR = 6.5; // roof level
    const tx0 = 1.0; // the terrace occupies x > tx0, z > tz0
    const tz0 = -2.0;

    // ---- lawn and a gravel drive under the house
    b.box(23.8, 0.04, 25.6, P.grass, { at: [0, 0, 0] });
    b.box(3.4, 0.06, 24.4, P.gravel, { at: [-7.8, 0, 0.4] });
    b.box(17.0, 0.06, 3.0, P.gravel, { at: [-1.0, 0, -11.2] });

    // ---- pilotis
    const grid = [-9.0, -4.5, 0, 4.5, 9.0];
    for (const x of grid) for (const z of grid) b.cyl(0.16, y0, P.concreteWhite, { at: [x, 0, zc + z], segs: 8 });

    // ---- the ground floor, set back: dark green walls and a glass curve on the arrival side
    const gw = 13.0;
    const gz1 = 4.0;
    const gz0 = -4.5;
    const gr = gw / 2;
    b.box(gw, y0, gz1 - gz0, green, { at: [0, 0, (gz1 + gz0) / 2] });
    b.lathe([[gr, 0], [gr, y0]], P.glassDark, { at: [0, 0, gz0], start: Math.PI / 2, sweep: Math.PI, segs: 14, mat: 'glass' });
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI / 2 + (i / 10) * Math.PI;
      b.box(0.06, y0, 0.06, frame, { at: [Math.sin(a) * (gr + 0.03), 0, gz0 + Math.cos(a) * (gr + 0.03)] });
    }
    b.collider(gw, gz1 - gz0 + gr, { at: [0, 0, (gz1 + gz0 - gr) / 2] });
    // the entrance, glazed, on the street side
    b.box(3.0, 2.6, 0.06, P.glassDark, { at: [0, 0, gz1 + 0.03], mat: 'glass' });
    for (const x of [-1.5, 0, 1.5]) b.box(0.06, 2.6, 0.1, frame, { at: [x, 0, gz1 + 0.05] });
    b.box(4.0, 0.15, 1.6, white, { at: [0, 2.8, gz1 + 0.8] });

    // ---- the floor slab and the main storey
    b.box(S, 0.35, S, white, { at: [0, y0, zc] });
    /** One outer wall with its ribbon window: parapet below, window band, fascia above. Glazed or open. */
    const wall = (x: number, z: number, len: number, alongX: boolean, glazed: boolean) => {
      const w = alongX ? len : 0.25;
      const d = alongX ? 0.25 : len;
      b.box(w, 0.85, d, white, { at: [x, yF, z] });
      b.box(w, 1.0, d, white, { at: [x, yF + 2.05, z] });
      if (glazed) {
        b.box(alongX ? len : 0.08, 1.2, alongX ? 0.08 : len, P.glassDark, { at: [x, yF + 0.85, z], mat: 'glass' });
        const n = Math.round(len / 1.2);
        for (let i = 0; i <= n; i++) {
          const t = -len / 2 + (i * len) / n;
          b.box(alongX ? 0.05 : 0.12, 1.2, alongX ? 0.12 : 0.05, frame, { at: alongX ? [x + t, yF + 0.85, z] : [x, yF + 0.85, z + t] });
        }
      } else {
        // the open band keeps its few posts
        for (const t of [-len / 2 + 0.15, 0, len / 2 - 0.15]) b.box(0.25, 1.2, 0.25, white, { at: alongX ? [x + t, yF + 0.85, z] : [x, yF + 0.85, z + t] });
      }
      // the top of the outer wall carries on to roof height either way
      b.box(w, yR - (yF + 3.05), d, white, { at: [x, yF + 3.05, z] });
    };
    const h = S / 2 - 0.125;
    // street front: interior to the left of the terrace, terrace to the right
    wall((-S / 2 + tx0) / 2, z1 - 0.125, tx0 + S / 2, true, true);
    wall((S / 2 + tx0) / 2, z1 - 0.125, S / 2 - tx0, true, false);
    // back front: all interior
    wall(0, z0 + 0.125, S, true, true);
    // left side: all interior
    wall(-h, zc, S, false, true);
    // right side: interior at the back, terrace at the front
    wall(h, (z0 + tz0) / 2, tz0 - z0, false, true);
    wall(h, (z1 + tz0) / 2, z1 - tz0, false, false);
    // the interior block (L-shaped) up to the roof
    b.box(tx0 + S / 2 - 0.25, yR - yF, S - 0.5, tint(white, -0.04), { at: [(-S / 2 + tx0) / 2, yF, zc] });
    b.box(S / 2 - tx0 - 0.25, yR - yF, tz0 - z0 - 0.25, tint(white, -0.04), { at: [(S / 2 + tx0) / 2, yF, (z0 + tz0) / 2] });
    // the glass walls between the living room and the hanging garden
    b.box(0.08, yR - yF - 0.4, z1 - tz0 - 0.3, P.glassDark, { at: [tx0 + 0.04, yF, (z1 + tz0) / 2], mat: 'glass' });
    b.box(S / 2 - tx0 - 0.3, yR - yF - 0.4, 0.08, P.glassDark, { at: [(S / 2 + tx0) / 2, yF, tz0 + 0.04], mat: 'glass' });
    for (let i = 0; i <= 6; i++) b.box(0.06, yR - yF - 0.4, 0.1, frame, { at: [tx0 + 0.6 + (i * (S / 2 - tx0 - 1.0)) / 6, yF, tz0 + 0.06] });
    // the terrace floor and a planter
    b.box(S / 2 - tx0 - 0.25, 0.05, z1 - tz0 - 0.25, P.paving, { at: [(S / 2 + tx0) / 2, yF, (z1 + tz0) / 2] });
    b.box(3.0, 0.5, 0.8, white, { at: [7.0, yF, 7.4] });
    b.box(2.8, 0.2, 0.6, P.hedge, { at: [7.0, yF + 0.5, 7.4] });
    // the roof over the interior
    b.box(tx0 + S / 2, 0.25, S, white, { at: [(-S / 2 + tx0) / 2, yR, zc] });
    b.box(S / 2 - tx0, 0.25, tz0 - z0, white, { at: [(S / 2 + tx0) / 2, yR, (z0 + tz0) / 2] });

    // ---- the ramp from the hanging garden to the roof
    const rx = tx0 + 1.0;
    const rz0 = 7.6;
    const rz1 = tz0 + 0.2;
    b.beam([rx, yF + 0.15, rz0], [rx, yR + 0.1, rz1], 1.4, 0.25, white);
    b.beam([rx + 0.72, yF + 1.15, rz0], [rx + 0.72, yR + 1.1, rz1], 0.12, 0.9, white);
    for (const z of [3.5, 0.0]) b.box(0.3, yF + 0.1 + ((rz0 - z) / (rz0 - rz1)) * (yR - yF) - yF, 0.3, white, { at: [rx, yF, z] });

    // ---- the roof garden: the solarium's curved screen walls, planters, the stair head
    const ry = yR + 0.25;
    b.lathe([[3.2, 0], [3.2, 2.4]], white, { at: [-3.8, ry, -5.2], start: Math.PI * 0.6, sweep: Math.PI * 0.9, segs: 10 });
    b.lathe([[2.0, 0], [2.0, 2.4]], accent, { at: [0.8, ry, -7.0], start: Math.PI * 0.2, sweep: Math.PI * 1.0, segs: 8 });
    b.box(5.5, 2.4, 0.2, white, { at: [-6.5, ry, -8.3] });
    b.box(1.8, 0.6, 1.0, white, { at: [-7.0, ry, 0.0] });
    b.box(1.6, 0.3, 0.8, P.hedge, { at: [-7.0, ry + 0.6, 0.0] });
    b.box(2.0, 2.6, 2.0, white, { at: [-2.0, ry, 2.5] });
    b.box(1.0, 2.0, 0.06, frame, { at: [-2.0, ry, 3.52] });

    // ---- the family car, parked under the house
    car(b, 'thirties', b.pick([P.doorBlue, P.black, P.doorRed]), [-7.8, 0, 6.0], 0);
  },
};
