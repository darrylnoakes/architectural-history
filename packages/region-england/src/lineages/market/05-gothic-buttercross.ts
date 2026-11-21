import { P, tint, type BuildingDef, type Builder } from '@ah/kit';
import { goods, oct, trestle } from './shared';

const K = Math.PI / 4;

/** A slender pinnacle with a crocketed spirelet and finial. */
function pinnacle(b: Builder, x: number, y: number, z: number, h: number, w: number, color: number): void {
  b.box(w, h * 0.45, w, color, { at: [x, y, z], rotY: Math.PI / 4 });
  b.cone(w * 0.72, h * 0.55, color, { at: [x, y + h * 0.45, z], segs: 4 });
  b.sphere(0.07, color, { at: [x, y + h + 0.04, z], segs: 5 });
}

export const gothicButtercross: BuildingDef = {
  id: 'gothic-buttercross',
  name: 'Market cross (buttercross)',
  style: 'Perpendicular Gothic',
  date: 'c. 1490',
  summary:
    'The plain cross has grown into a shelter. Eight pointed arches on buttressed piers enclose a vaulted space round a central pillar, where country women sold butter, eggs and cheese out of the rain and sun. ' +
    'It was paid for by a rich town guild or a pious merchant, and it is dressed like a small church: pinnacles, panelled parapet, and flying buttresses leaping up to a lantern with a cross on top. ' +
    'Masons trained on the great Perpendicular churches brought their whole vocabulary to the market place.',
  materials: ['ashlar limestone', 'lead'],
  lookFor: [
    { label: 'Pointed arches', note: 'Each of the eight sides opens in a two-centred Gothic arch, so buyers can walk in from any direction.', at: [0, 3.0, 4.25] },
    { label: 'Buttresses', note: 'Stepped piers at each corner resist the outward push of the vault inside.', at: [2.05, 2.4, 4.75] },
    { label: 'Pinnacles', note: 'Small spires on the buttress tops. Their weight helps pin the buttress down, and they make the skyline bristle.', at: [1.9, 6.6, 4.5] },
    { label: 'Flying buttresses', note: 'Thin arched struts springing from the corner pinnacles to the central lantern, a cathedral device in miniature.', at: [1.0, 7.0, 2.6] },
    { label: 'Central pillar', note: 'One pier in the middle carries the vault; the ribs fan out from its top like the branches of a tree.', at: [0.7, 2.6, 0.7] },
  ],
  modelledOn: 'Malmesbury Market Cross (c. 1490), with touches of Chichester Cross (1501)',
  influences: ['perpendicular'],
  build(b) {
    const stone = b.pick([P.bathStone, P.limestoneWarm, P.limestone]);
    const dark = tint(stone, -0.08);
    const R = 4.4; // circumradius of the octagon (to the outer wall corners)
    const a = R * Math.cos(Math.PI / 8); // apothem
    const side = 2 * R * Math.sin(Math.PI / 8);
    const F = 0.5; // floor level on top of the steps
    const WH = 4.0; // arcade height
    const T = 0.5;

    // two octagonal steps
    oct(b, R + 1.2, 0.25, tint(stone, -0.05));
    oct(b, R + 0.6, 0.25, stone, [0, 0.25, 0]);

    // the eight arched faces
    for (let k = 0; k < 8; k++) {
      const th = k * K;
      const cx = Math.sin(th) * (a - T / 2);
      const cz = Math.cos(th) * (a - T / 2);
      b.archWall(side + 0.02, WH, T, stone, { at: [cx, F, cz], facing: th, openings: 1, openW: 2.2, openH: 3.3, shape: 'pointed' });
      // square-headed label mould round the arch, the Perpendicular way
      b.archWall(2.75, 3.65, 0.1, dark, { at: [Math.sin(th) * (a + 0.04), F, Math.cos(th) * (a + 0.04)], facing: th, openings: 1, openW: 2.2, openH: 3.3, shape: 'pointed' });
    }

    // corner buttresses with pinnacles
    for (let k = 0; k < 8; k++) {
      const th = Math.PI / 8 + k * K;
      const sx = Math.sin(th);
      const sz = Math.cos(th);
      b.box(0.55, 2.4, 1.1, stone, { at: [sx * (R + 0.05), F, sz * (R + 0.05)], rotY: th });
      b.box(0.5, 2.3, 0.75, stone, { at: [sx * (R - 0.05), F + 2.4, sz * (R - 0.05)], rotY: th });
      // sloped weathering on each stage
      b.box(0.57, 0.12, 1.14, dark, { at: [sx * (R + 0.05), F + 2.32, sz * (R + 0.05)], rotY: th });
      pinnacle(b, sx * (R - 0.05), F + 4.7, sz * (R - 0.05), 1.9, 0.42, stone);
      b.collider(1.2, 1.3, { at: [sx * R, 0, sz * R], rotY: th });
    }

    // the vault ceiling and the parapet above the arcade
    const yC = F + WH;
    oct(b, a / Math.cos(Math.PI / 8) - 0.1, 0.5, stone, [0, yC - 0.5, 0]);
    oct(b, R + 0.12, 0.18, dark, [0, yC, 0]); // string course
    oct(b, R, 0.9, stone, [0, yC + 0.18, 0]);
    oct(b, R + 0.1, 0.12, dark, [0, yC + 1.08, 0]); // coping
    // blind panelling on the parapet
    for (let k = 0; k < 8; k++) {
      const th = k * K;
      for (const off of [-0.75, 0, 0.75]) {
        const px = Math.sin(th) * a + Math.cos(th) * off;
        const pz = Math.cos(th) * a - Math.sin(th) * off;
        b.panel(0.42, 0.6, dark, { at: [px, yC + 0.32, pz], facing: th, shape: 'pointed', depth: 0.03 });
      }
    }

    // central pillar with the vault fanning out from it
    oct(b, 0.45, WH - 0.9, stone, [0, F, 0]);
    b.lathe([[0.45, 0], [0.6, 0.25], [1.4, 0.75], [2.6, 0.95], [0.01, 0.96]], stone, { at: [0, F + WH - 0.9, 0], segs: 8 });
    oct(b, 0.62, 0.3, stone, [0, F, 0]);
    b.collider(1.2, 1.2, { at: [0, 0, 0] });
    // ribs on the ceiling, radiating from the pillar to each corner
    for (let k = 0; k < 8; k++) {
      const th = Math.PI / 8 + k * K;
      b.box(0.14, 0.14, R - 1.5, dark, { at: [Math.sin(th) * (R / 2 + 0.6), yC - 0.64, Math.cos(th) * (R / 2 + 0.6)], rotY: th });
    }

    // low stone roof rising to the central lantern
    const yR = yC + 1.08;
    b.cyl(R - 0.3, 1.5, P.stoneSlate, { at: [0, yR, 0], rTop: 1.0, segs: 8, rotY: Math.PI / 8 });
    // the lantern: an octagonal turret with small pointed openings, battlements and a spirelet
    const yL = yR + 1.3;
    oct(b, 1.05, 2.0, stone, [0, yL, 0]);
    for (let k = 0; k < 8; k++) {
      const th = k * K;
      const ap = 1.05 * Math.cos(Math.PI / 8);
      b.window(0.38, 1.0, { at: [Math.sin(th) * ap, yL + 0.5, Math.cos(th) * ap], facing: th, shape: 'pointed', frame: dark, glass: P.windowDark });
    }
    oct(b, 1.15, 0.12, dark, [0, yL + 2.0, 0]);
    for (let k = 0; k < 8; k++) {
      const th = Math.PI / 8 + k * K;
      b.box(0.22, 0.3, 0.22, stone, { at: [Math.sin(th) * 1.02, yL + 2.12, Math.cos(th) * 1.02], rotY: th });
    }
    b.cyl(0.95, 2.6, stone, { at: [0, yL + 2.12, 0], rTop: 0.04, segs: 8, rotY: Math.PI / 8 });
    // gilded cross finial
    const yX = yL + 4.7;
    b.box(0.09, 0.9, 0.09, P.gold, { at: [0, yX, 0] });
    b.box(0.5, 0.09, 0.09, P.gold, { at: [0, yX + 0.55, 0] });

    // flying buttresses from each corner pinnacle to the lantern
    for (let k = 0; k < 8; k++) {
      const th = Math.PI / 8 + k * K;
      const r0 = 1.05;
      const r1 = R - 0.25;
      const top: [number, number][] = [[r1, F + 4.95], [r0, yL + 1.7]];
      const under: [number, number][] = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const r = r0 + (r1 - r0) * t;
        // underside sags in a curve below the straight top line
        const yTop = yL + 1.7 + (F + 4.95 - (yL + 1.7)) * t;
        under.push([r, yTop - 0.18 - Math.sin(t * Math.PI) * 0.4]);
      }
      b.extrude([...top, ...under], 0.14, stone, { rotY: th - Math.PI / 2 });
    }

    // a few traders under and around the cross
    goods(b, 1.6, [1.6, F, -1.4], 0.8, ['basket', 'basket', 'sack']);
    goods(b, 1.6, [-1.7, F, 1.2], 0.6, ['basket', 'pot', 'basket']);
    trestle(b, 2.2, 0.8, [-6.6, 0, 5.6], 0.5);
    goods(b, 1.8, [-6.6, 0.88, 5.6], 0.5, ['fruit', 'basket', 'fruit']);
    trestle(b, 2.2, 0.8, [7.0, 0, -5.2], -2.6);
    goods(b, 1.8, [7.0, 0.88, -5.2], -2.6, ['cloth', 'cloth', 'basket']);
  },
};
