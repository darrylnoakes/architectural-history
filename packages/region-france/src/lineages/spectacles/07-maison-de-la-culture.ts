import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import { strip, type Pt } from './shared';

// Plan (front at +Z): one great concrete roof over a glazed foyer, in which stand a fan-shaped large
// hall (left) and a six-sided small hall (right); the fly tower and the workshops behind.
const RX = 18.4; // half width of the roof slab
const RZ0 = -7.0; // its back edge, against the fly tower
const RZ1 = 13.4; // its front edge
const ROOF_Y = 11.0; // underside
const ROOF_T = 1.4;
const GX = 16.6; // the glass wall, set back under the roof
const GZ0 = -7.0;
const GZ1 = 11.4;
// the large hall: proscenium at z = PZ, back wall at z = BZ, fanning out between them
const HCX = -5.2;
const PZ = -7.0;
const BZ = 6.0;
const PW = 13.0;
const BW = 19.0;
const HALL_H = 10.4;
// the small hall
const SCX = 10.2;
const SCZ = -1.2;
const SR = 6.2;
const SMALL_H = 8.2;
// fly tower
const FT_Z0 = -15.0;
const FT_H = 21.0;

/** Board-marked concrete: horizontal lines on a wall face from x0 to x1 (along the facing's right). */
function boards(b: Builder, at: [number, number, number], w: number, h: number, facing: number, color: number, pitch = 1.2): void {
  for (let y = pitch; y < h - 0.2; y += pitch) b.panel(w, 0.06, color, { at: [at[0], at[1] + y, at[2]], facing, depth: 0.03 });
}

export const maisonDeLaCulture: BuildingDef = {
  id: 'maison-de-la-culture',
  name: 'Maison de la Culture',
  style: 'Modernist (béton brut)',
  date: '1966',
  summary:
    'André Malraux, de Gaulle’s minister of culture, wanted a house of culture in every region, where theatre, music, film and exhibitions would reach people who had never set foot in the old municipal theatre. ' +
    'The state and the town share the bill, and the building says the opposite of the horseshoe theatre: no grand stair and no boxes for rank, but one open glazed foyer under a single great concrete roof, shared by two halls of different shapes. ' +
    'The large hall is a fan of steeply raked seats, every one facing the stage; the small hall can be rearranged for experimental work. Behind rises the fly tower, in rough concrete still showing the grain of its timber formwork.',
  materials: ['reinforced concrete left rough from the boards (béton brut)', 'plate glass in aluminium frames', 'timber and fabric seating', 'steel'],
  modelledOn:
    'The Maison de la Culture, Amiens, opened by André Malraux in March 1966 (architects Pierre Sonrel, with Jean Duthilleul and Marcel Gogois): the programme of two halls round a shared foyer is taken from it; the forms here are simplified and partly generic.',
  influences: ['reinforced-concrete', 'le-corbusier'],
  lookFor: [
    {
      label: 'One great concrete roof',
      note: 'A deep slab of concrete shelters everything: the foyer, both halls and the café, so the building reads as a single house open to all.',
      at: [-12, ROOF_Y + ROOF_T + 0.2, RZ1 - 1],
    },
    {
      label: 'Glazed foyer',
      note: 'Walls of plate glass, set back under the roof, show the life inside to the street; the foyer doubled as exhibition space.',
      at: [7.0, 3.0, GZ1 + 0.2],
    },
    {
      label: 'Fan-shaped large hall',
      note: 'The seats rise steeply in one fan with no balconies and no boxes: the democratic theatre, in which every seat faces the stage.',
      at: [HCX, 5.2, 2.0],
    },
    {
      label: 'Six-sided small hall',
      note: 'A smaller, more flexible room for chamber music, debate and experimental theatre, with seats round three sides of the stage.',
      at: [SCX, SMALL_H + 0.4, SCZ],
    },
    {
      label: 'Fly tower in béton brut',
      note: 'The tall block over the stage, where scenery is hoisted out of sight, in concrete left as it came from the formwork.',
      at: [HCX + 8.2, 17.0, -11.0],
    },
  ],
  build(b) {
    const cutaway = b.cutaway;
    const conc = tint(P.concrete, b.range(-0.03, 0.02));
    const concDk = tint(conc, -0.1);
    const glass = mix(P.glassDark, P.glass, 0.25);
    const alu = P.aluminium;
    const seat = tint(b.pick([P.cladRed, mix(P.cladRed, P.cladYellow, 0.35)]), -0.04);
    const floor = tint(P.paving, -0.05);
    const timber = tint(P.pine, -0.05);

    // ------------------------------------------------ the fly tower and the workshops behind
    const ftW = PW + 3.4;
    b.box(ftW, FT_H, PZ - FT_Z0, conc, { at: [HCX, 0, (PZ + FT_Z0) / 2] });
    b.box(ftW + 0.4, 0.6, PZ - FT_Z0 + 0.4, concDk, { at: [HCX, FT_H - 0.6, (PZ + FT_Z0) / 2] });
    for (const s of [1, -1]) boards(b, [HCX + (s * ftW) / 2, 0, (PZ + FT_Z0) / 2], PZ - FT_Z0, FT_H, s > 0 ? Math.PI / 2 : -Math.PI / 2, concDk, 1.5);
    boards(b, [HCX, ROOF_Y + ROOF_T, PZ], ftW, FT_H - ROOF_Y - ROOF_T, 0, concDk, 1.5);
    boards(b, [HCX, 0, FT_Z0], ftW, FT_H, Math.PI, concDk, 1.5);
    b.box(RX * 2 - 1.2, 9.0, 3.0, conc, { at: [0, 0, -16.4] }); // workshops and dressing rooms
    b.box(8.4, 9.0, FT_Z0 - RZ0 + 1.6, conc, { at: [SCX + 2.4, 0, (FT_Z0 + RZ0) / 2] });
    b.box(4.2, 9.0, FT_Z0 - RZ0 + 1.6, conc, { at: [-RX + 2.7, 0, (FT_Z0 + RZ0) / 2] });
    for (const x of [-12, -1, 9, 14]) b.window(2.6, 1.2, { at: [x, 4.6, -17.9], facing: '-z', frame: alu });
    b.panel(4.0, 5.0, tint(P.steel, -0.1), { at: [HCX, 0, -17.9], facing: '-z' }); // scenery door
    b.sym((s) => {
      for (const z of [-15.6, -11.6, -9]) b.window(2.0, 1.2, { at: [s * (RX - 0.6), 4.6, z], facing: s > 0 ? '+x' : '-x', frame: alu });
    });

    // ------------------------------------------------ the foyer floor and its glass walls
    b.box(GX * 2, 0.3, GZ1 - GZ0, floor, { at: [0, 0, (GZ0 + GZ1) / 2] });
    const gh = ROOF_Y - 0.3;
    b.box(GX * 2, gh, 0.12, glass, { at: [0, 0.3, GZ1], mat: 'glass' });
    b.sym((s) => b.box(0.12, gh, GZ1 - GZ0, glass, { at: [s * GX, 0.3, (GZ0 + GZ1) / 2], mat: 'glass' }));
    for (let x = -GX; x <= GX + 0.01; x += 1.85) b.box(0.12, gh, 0.25, alu, { at: [x, 0.3, GZ1 + 0.05] });
    for (const y of [3.4, 7.2]) b.box(GX * 2, 0.14, 0.24, alu, { at: [0, y, GZ1 + 0.05] });
    b.sym((s) => {
      for (let z = GZ0 + 1.85; z <= GZ1 + 0.01; z += 1.85) b.box(0.25, gh, 0.12, alu, { at: [s * (GX + 0.05), 0.3, z] });
      for (const y of [3.4, 7.2]) b.box(0.24, 0.14, GZ1 - GZ0, alu, { at: [s * (GX + 0.05), y, (GZ0 + GZ1) / 2] });
    });
    // entrance doors and a canopy of steps
    b.box(8.0, 2.6, 0.2, tint(P.glassDark, -0.05), { at: [4.0, 0.3, GZ1 + 0.1] });
    b.stairs(12, 0.3, 1.2, 2, concDk, { at: [4.0, 0, GZ1 + 0.7] });

    // ------------------------------------------------ the large hall: a fan of seats
    const halfW = (z: number) => (PW + ((z - PZ) / (BZ - PZ)) * (BW - PW)) / 2;
    const left: Pt[] = [[HCX - PW / 2, PZ], [HCX - BW / 2, BZ]];
    const right: Pt[] = [[HCX + PW / 2, PZ], [HCX + BW / 2, BZ]];
    strip(b, left.map(([x, z]) => [x, z, 0.3, HALL_H] as [number, number, number, number]), conc);
    strip(b, right.map(([x, z]) => [x, z, 0.3, HALL_H] as [number, number, number, number]), conc);
    strip(b, [[HCX - BW / 2, BZ, 0.3, HALL_H], [HCX + BW / 2, BZ, 0.3, HALL_H]], conc);
    // the outer faces, thickened and marked by their boards
    b.sym((s) => {
      const p0 = s > 0 ? right[0] : left[0];
      const p1 = s > 0 ? right[1] : left[1];
      const a = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
      b.box(0.5, HALL_H, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), conc, { at: [(p0[0] + p1[0]) / 2 + s * 0.25, 0.3, (p0[1] + p1[1]) / 2], rotY: a });
    });
    b.box(BW + 1.0, HALL_H, 0.5, conc, { at: [HCX, 0.3, BZ + 0.25] });
    boards(b, [HCX, 0.3, BZ + 0.5], BW + 1.0, HALL_H, 0, concDk);
    b.panel(2.0, 2.4, P.doorBlack, { at: [HCX - 5.5, 0.3, BZ + 0.5] });
    b.panel(2.0, 2.4, P.doorBlack, { at: [HCX + 5.5, 0.3, BZ + 0.5] });
    // seats: raked rows, every one facing the stage
    const rows = 14;
    for (let i = 0; i < rows; i++) {
      const z0 = -3.4 + i * 0.66;
      const top = 0.6 + i * 0.42;
      const hw = halfW(z0 + 0.33) - 0.9;
      b.box(hw * 2, top, 0.66, i % 2 ? seat : tint(seat, -0.06), { at: [HCX, 0.3, z0 + 0.33] });
    }
    b.box(halfW(BZ - 0.6) * 2 - 1.2, 0.6 + rows * 0.42, BZ - (-3.4 + rows * 0.66), tint(seat, -0.1), { at: [HCX, 0.3, (BZ + (-3.4 + rows * 0.66)) / 2] });
    b.box(PW - 0.6, 1.2, 3.0, timber, { at: [HCX, 0.3, PZ + 1.5] }); // forestage
    b.panel(PW - 2.0, 7.0, P.windowDark, { at: [HCX, 1.5, PZ + 0.02] }); // proscenium opening
    b.panel(PW - 2.4, 6.4, tint(P.doorRed, -0.05), { at: [HCX, 1.5, PZ + 0.06], depth: 0.04 }); // curtain
    // acoustic panels hanging over the hall (the ceiling, seen when the roof is lifted)
    for (let i = 0; i < 4; i++) {
      const z = -4.6 + i * 2.8;
      b.box(halfW(z) * 2 - 1.6, 0.15, 1.6, tint(P.cladWhite, -0.05), { at: [HCX, HALL_H - 1.0 + i * 0.15, z], rot: [0.15, 0, 0] });
    }

    // ------------------------------------------------ the small hall: six-sided, seats on three sides
    b.group({ at: [SCX, 0.3, SCZ] }, () => {
      b.lathe([[SR, 0], [SR, SMALL_H - 0.3]], conc, { segs: 6, start: Math.PI / 6, jitter: false });
      b.lathe([[SR - 0.4, 0], [SR - 0.4, SMALL_H - 0.3]], tint(P.pine, -0.15), { segs: 6, start: Math.PI / 6, jitter: false });
      b.lathe([[SR - 0.4, SMALL_H - 0.3], [SR + 0.2, SMALL_H - 0.3], [SR + 0.2, SMALL_H - 0.9]], concDk, { segs: 6, start: Math.PI / 6, jitter: false });
      // seats on three sides: a stepped ring broken toward the stage at -Z
      const prof: Pt[] = [[2.6, 0.02]];
      let r = 2.6;
      let y = 0.02;
      for (let i = 0; i < 6; i++) {
        y += 0.45;
        prof.push([r, y]);
        r += 0.5;
        prof.push([r, y]);
      }
      b.lathe(prof, seat, { segs: 12, start: -Math.PI / 2 - 0.5, sweep: Math.PI + 1.0, jitter: false });
      b.cyl(2.2, 0.6, timber, { at: [0, 0, -1.6], segs: 6 }); // the stage
    });
    b.panel(2.0, 2.4, P.doorBlack, { at: [SCX + SR * Math.sin(Math.PI / 6) * 0.0, 0.3, SCZ + SR * Math.cos(Math.PI / 6)], depth: 0.1 });
    boards(b, [SCX, 0.3, SCZ + SR * Math.cos(Math.PI / 6)], SR, SMALL_H - 0.3, 0, concDk);

    // a free-standing stair to the gallery and the café
    b.stairs(1.6, 3.6, 5.0, 12, concDk, { at: [-12.6, 0.3, 9.0], rotY: Math.PI / 2 });
    b.box(6.0, 0.3, 3.6, concDk, { at: [-14.0, 3.6, 9.0] });

    // ------------------------------------------------ the great roof on its columns: whole in the town, opened when selected
    const rw = RX * 2;
    const rd = RZ1 - RZ0;
    const rzm = (RZ0 + RZ1) / 2;
    const fascia = 2.2;
    // the deep fascia all round stays in both forms
    b.box(rw, ROOF_T, fascia, conc, { at: [0, ROOF_Y, RZ1 - fascia / 2] });
    b.box(rw, ROOF_T, fascia, conc, { at: [0, ROOF_Y, RZ0 + fascia / 2] });
    b.sym((s) => b.box(fascia, ROOF_T, rd - 2 * fascia, conc, { at: [s * (RX - fascia / 2), ROOF_Y, rzm] }));
    boards(b, [0, ROOF_Y, RZ1], rw, ROOF_T, 0, concDk, 0.45);
    b.sym((s) => boards(b, [s * RX, ROOF_Y, rzm], rd, ROOF_T, s > 0 ? Math.PI / 2 : -Math.PI / 2, concDk, 0.45));
    // the cross beams under the roof
    for (let x = -RX + 6; x < RX - 1; x += 6) b.box(0.5, 0.9, rd - 0.4, concDk, { at: [x, ROOF_Y - 0.9, rzm] });
    if (!cutaway) {
      b.box(rw - 2 * fascia + 0.02, ROOF_T * 0.5, rd - 2 * fascia + 0.02, conc, { at: [0, ROOF_Y + ROOF_T * 0.5, rzm] });
      b.box(rw - 2 * fascia, 0.06, rd - 2 * fascia, tint(conc, -0.04), { at: [0, ROOF_Y + ROOF_T, rzm] });
      // rooflights over the foyer
      for (const x of [-12, 0, 12]) b.box(3.0, 0.5, 2.4, mix(P.glass, P.white, 0.2), { at: [x, ROOF_Y + ROOF_T, 9.0], mat: 'glass' });
    }
    // the columns along the front, outside the glass
    for (let x = -RX + 1.4; x <= RX - 1.3; x += 5.6) b.cyl(0.32, ROOF_Y, concDk, { at: [x, 0, RZ1 - 1.0], segs: 8 });

    // ------------------------------------------------ walk collisions: back blocks, halls, glass, columns
    b.collider(ftW, PZ - FT_Z0, { at: [HCX, 0, (PZ + FT_Z0) / 2] });
    b.collider(RX * 2 - 1.2, 3.0, { at: [0, 0, -16.4] });
    b.collider(8.4, FT_Z0 - RZ0 + 1.6, { at: [SCX + 2.4, 0, (FT_Z0 + RZ0) / 2] });
    b.collider(4.2, FT_Z0 - RZ0 + 1.6, { at: [-RX + 2.7, 0, (FT_Z0 + RZ0) / 2] });
    b.collider(BW + 1, BZ - PZ, { at: [HCX, 0, (BZ + PZ) / 2] });
    b.collider(SR * 2, SR * 2, { at: [SCX, 0, SCZ] });
    b.collider(GX, 0.3, { at: [-GX / 2, 0, GZ1] });
    b.collider(GX - 8.0, 0.3, { at: [(GX + 8.0) / 2, 0, GZ1] });
    b.sym((s) => b.collider(0.3, GZ1 - GZ0, { at: [s * GX, 0, (GZ0 + GZ1) / 2] }));
    for (let x = -RX + 1.4; x <= RX - 1.3; x += 5.6) b.collider(0.7, 0.7, { at: [x, 0, RZ1 - 1.0] });
  },
};
