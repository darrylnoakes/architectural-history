import { P, mix, tint, type Builder, type BuildingDef } from '@ah/kit';
import type { Pt } from './shared';

interface Lobe {
  x: number;
  z: number;
  rx: number;
  rz: number;
  ry: number;
}

/** A curved rib following the lobe's surface in the plane x = lobe.x + f·rx. */
function rib(b: Builder, l: Lobe, y0: number, f: number, color: number): void {
  const k = Math.sqrt(1 - f * f);
  const a = l.rz * k + 0.08;
  const c = l.ry * k + 0.08;
  const t = 0.16;
  const segs = 12;
  const pts: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const u = (i / segs) * Math.PI;
    pts.push([a * Math.cos(u), c * Math.sin(u)]);
  }
  for (let i = segs; i >= 0; i--) {
    const u = (i / segs) * Math.PI;
    pts.push([(a - t) * Math.cos(u), (c - t) * Math.sin(u)]);
  }
  b.extrude(pts, 0.22, color, { at: [l.x + f * l.rx, y0, l.z], rotY: Math.PI / 2, mat: 'glass' });
}

export const concertHall: BuildingDef = {
  id: 'concert-hall',
  name: 'Concert hall',
  style: 'Contemporary (High-Tech)',
  date: 'c. 2010',
  summary:
    'The concrete arts centre, leaking and out of favour, was pulled down, and National Lottery and regeneration money paid for a music centre meant to put the town on the map. ' +
    'Three halls, each a separate box built for its own acoustics, sit under one curving shell of stainless steel and glass that was designed and cut by computer. ' +
    'Between the halls and the glass is a public concourse with cafés, open all day. After 2,500 years the plot is once again a place simply to gather.',
  materials: ['stainless steel panels', 'glass', 'steel arches', 'concrete hall boxes'],
  modelledOn: 'Sage Gateshead (Foster + Partners, 2004), renamed The Glasshouse International Centre for Music in 2023',
  lookFor: [
    { label: 'Curved shell', note: 'A single roof of stainless-steel panels, curved in two directions, wrapping all three halls like a blanket.', at: [-6.2, 18.4, -1] },
    { label: 'Three lobes', note: 'Each hump of the shell covers one hall, so you can count the halls from outside.', at: [12, 12.6, -2.6] },
    { label: 'Stainless-steel panels', note: 'Stainless steel covers the shell, with glass only where light is wanted; at Gateshead there are some 3,000 steel panels.', at: [0.5, 13.2, 5.5] },
    { label: 'Glazed concourse', note: 'A full-height glass wall under the shell\'s overhanging edge, so the foyers face the town and the river.', at: [-6.2, 3, 11.0] },
  ],
  influences: ['high-tech-export'],
  build(b) {
    const steel = tint(P.aluminium, 0.04);
    const ribC = tint(P.steel, -0.05);
    const glass = mix(P.glass, P.white, 0.1);
    const y0 = 5.6;
    const lobes: Lobe[] = [
      { x: -6.2, z: -1, rx: 10.4, rz: 13.2, ry: 12.6 },
      { x: 4.8, z: -1.6, rx: 8.4, rz: 11.8, ry: 9.6 },
      { x: 12.0, z: -2.6, rx: 4.9, rz: 9.6, ry: 6.8 },
    ];

    // plaza and steps down to the street
    b.box(34, 0.3, 28, tint(P.paving, 0.03), { at: [0, 0, -1] });
    b.stairs(34, 0.3, 1.6, 2, tint(P.paving, -0.02), { at: [0, 0, 13.8] });

    for (const l of lobes) {
      // glazed concourse wall set back under the rim, so the shell overhangs it
      b.group({ at: [l.x, 0.3, l.z], scale: [l.rx * 0.9, 1, l.rz * 0.9] }, () => {
        b.cyl(1, y0 - 0.3, glass, { segs: 20, mat: 'glass' });
      });
      // the shell
      b.group({ at: [l.x, y0, l.z], scale: [l.rx, l.ry, l.rz] }, () => {
        b.dome(1, steel, { segs: 22, mat: 'glass' });
      });
      // a dark soffit under the overhang
      b.group({ at: [l.x, y0 - 0.05, l.z], scale: [l.rx, 1, l.rz] }, () => {
        b.cyl(1, 0.05, P.cladGrey, { segs: 22 });
      });
      for (const f of [-0.5, 0, 0.5]) rib(b, l, y0, f, ribC);
    }
    // the concourse glazing runs on between the lobes
    b.box(30, y0 - 0.3, 12, glass, { at: [-0.5, 0.3, 0.4], mat: 'glass' });
    // mullions on the concourse glass, along the street front
    for (let i = -7; i <= 7; i++) {
      const x = i * 2.1;
      const l = lobes.reduce((best, c) => (Math.abs(x - c.x) / c.rx < Math.abs(x - best.x) / best.rx ? c : best));
      const f = (x - l.x) / (l.rx * 0.9);
      if (Math.abs(f) >= 0.98) continue;
      const z = l.z + l.rz * 0.9 * Math.sqrt(1 - f * f);
      b.box(0.12, y0 - 0.3, 0.12, ribC, { at: [x, 0.3, z + 0.04] });
    }
    // the halls themselves show at the back as solid boxes, with a service yard
    b.box(26, y0 + 1, 5, tint(P.concrete, 0.02), { at: [-1, 0, -12.2] });
    b.panel(4, 3.4, P.cladGrey, { at: [3, 0.3, -14.7], facing: '-z' });
    b.panel(4, 3.4, P.cladGrey, { at: [-8, 0.3, -14.7], facing: '-z' });
    // entrance canopy and doors at the front of the big lobe
    b.panel(4.5, 2.8, P.glassDark, { at: [-6.5, 0.3, l0front(lobes[0]) + 0.05], facing: '+z', mat: 'glass' });
    // trees on the plaza
    for (const [x, z] of [[-14.5, 12.6], [14.8, 9.5]]) b.tree(6, { at: [x, 0.3, z], kind: 'round' });

    for (const l of lobes) b.collider(l.rx * 1.6, l.rz * 1.8, { at: [l.x, 0, l.z] });
    b.collider(26, 5, { at: [-1, 0, -12.2] });
    b.collider(30, 12, { at: [-0.5, 0, 0.4] });
  },
};

function l0front(l: Lobe): number {
  return l.z + l.rz * 0.9;
}
