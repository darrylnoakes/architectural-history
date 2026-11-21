import * as THREE from 'three';
import { P, tint, type Builder, type BuildingDef } from '@ah/kit';
import { END, FOOT, hump, band, steps } from './shared';

/**
 * One bay of the shell between two feet at za and zb (heights ya, yb), rising to touch the deck
 * underside (yc) at mid-bay. It is wide where it lands and narrow at the crest, arched across as
 * well as along, and opened by an oval hole on each flank near each foot.
 */
function shellBay(b: Builder, o: { za: number; zb: number; ya: number; yb: number; yc: number; wFoot: number; wCrest: number; color: number }): void {
  const NU = 40;
  const c = 0.56;
  const h0 = 0.26;
  const uHalf = 0.14;
  const holeH = (u: number) => Math.max(...[0.24, 0.76].map((uc) => h0 * Math.sqrt(Math.max(0, 1 - ((u - uc) / uHalf) ** 2))));
  const vSamples = (u: number): { v: number; hole: boolean }[] => {
    const h = holeH(u);
    const out: { v: number; hole: boolean }[] = [];
    const seg = (a: number, z: number, n: number, hole: boolean) => {
      for (let i = 0; i < n; i++) out.push({ v: a + ((z - a) * i) / n, hole });
    };
    seg(-1, -c - h, 2, false);
    seg(-c - h, -c + h, 3, true);
    seg(-c + h, c - h, 4, false);
    seg(c - h, c + h, 3, true);
    seg(c + h, 1, 2, false);
    out.push({ v: 1, hole: false });
    return out;
  };
  const point = (u: number, v: number): [number, number, number] => {
    const z = o.za + (o.zb - o.za) * u;
    const yBase = o.ya + (o.yb - o.ya) * u;
    const s = Math.sin(Math.PI * u);
    const Y = u <= 0.5 ? o.ya + (o.yc - o.ya) * s : o.yb + (o.yc - o.yb) * s;
    const half = o.wCrest + (o.wFoot - o.wCrest) * Math.cos(Math.PI * u) ** 2;
    const y = yBase + (Y - yBase) * (1 - 0.3 * v * v);
    return [v * half, y, z];
  };
  // sample u more finely near the ends of the holes
  const us: number[] = [];
  for (let i = 0; i <= NU; i++) {
    const t = i / NU;
    us.push(t);
  }
  const pos: number[] = [];
  for (let i = 0; i < us.length - 1; i++) {
    const ua = us[i];
    const ub = us[i + 1];
    const A = vSamples(ua);
    const B = vSamples(ub);
    const open = holeH(ua) > 1e-4 && holeH(ub) > 1e-4;
    for (let j = 0; j < A.length - 1; j++) {
      if (A[j].hole && open) continue;
      const p00 = point(ua, A[j].v);
      const p01 = point(ua, A[j + 1].v);
      const p10 = point(ub, B[j].v);
      const p11 = point(ub, B[j + 1].v);
      pos.push(...p00, ...p10, ...p11, ...p00, ...p11, ...p01);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.computeVertexNormals();
  b.add(g, o.color);
}

export const concreteBridge: BuildingDef = {
  id: 'concrete-bridge',
  name: 'Sculpted concrete shell bridge',
  style: 'Structural expressionism',
  date: 'c. 1972',
  summary:
    'Downstream, a new road bridge for the traffic of the boom years is carried not on arches or beams but on one continuous shell of reinforced concrete, about 30 cm thick, that rises from the ground in curved sheets and touches the underside of the road only at a few points. ' +
    'Its shape was not drawn but found: the engineer Sergio Musmeci worked it out with mathematics and with models of stretched rubber, looking for the form in which the concrete is everywhere in compression, as in an arch, so it can be as thin as possible. ' +
    'Italian engineers such as Nervi, Morandi and Musmeci made reinforced concrete expressive in these years; Musmeci’s bridge over the Basento at Potenza, designed in 1967 and built from 1971 to 1976, is among the most daring of them.',
  materials: ['reinforced concrete', 'prestressed concrete deck', 'asphalt', 'steel railings'],
  modelledOn: 'Sergio Musmeci’s bridge over the Basento, Potenza (designed 1967, built 1971 to 1976)',
  lookFor: [
    { label: 'Concrete membrane', note: 'A single thin curved sheet carries the whole road, shaped so it works in compression everywhere.', at: [2.6, 0.4, -1.8] },
    { label: 'Point supports', note: 'The shell rises to meet the deck at only a few crests, so the road seems to float on it.', at: [1.2, 1.45, 6.6] },
    { label: 'Oval openings', note: 'Where the material is not needed the shell opens, which makes it lighter and lets you see through it.', at: [2.6, 0.8, -10.0] },
    { label: 'Splayed feet', note: 'The shell spreads wide where it lands on its foundations, gathering the load into the ground.', at: [4.8, -0.9, 0] },
    { label: 'Box-girder deck', note: 'A hollow concrete beam carries the roadway from crest to crest.', at: [3.8, 1.1, 11.5] },
  ],
  build(b) {
    b.noCollide();
    const crown = 2.6;
    const f = hump(crown);
    const W = 7.4;
    b.deck(W - 0.8, 34, crown, { yEnds: 0 });
    const shell = P.concreteWhite;
    const conc = P.concrete;
    const dD = 0.75;
    const under = (z: number) => f(z) - dD;

    // the shell in two bays: from the south bank to a foundation in the river, and on to the north bank
    const zFoot = 13.2;
    const yBank = -0.15;
    const yRiver = -1.0;
    shellBay(b, { za: -zFoot, zb: 0, ya: yBank, yb: yRiver, yc: under(-zFoot / 2) + 0.02, wFoot: 5.2, wCrest: 2.3, color: shell });
    shellBay(b, { za: 0, zb: zFoot, ya: yRiver, yb: yBank, yc: under(zFoot / 2) + 0.02, wFoot: 5.2, wCrest: 2.3, color: shell });
    // foundation in the river and on the banks
    b.box(10.8, yRiver - FOOT, 2.0, tint(conc, -0.05), { at: [0, FOOT, 0] });
    for (const s of [-1, 1]) b.box(10.8, 0.6, 2.0, tint(conc, -0.05), { at: [0, -0.6, s * zFoot] });
    // bearings where the crests meet the deck
    for (const z of [-zFoot / 2, zFoot / 2]) b.box(3.4, 0.08, 1.2, P.castIron, { at: [0, under(z) - 0.02, z] });

    // hollow box-girder deck, a thin cantilevered slab edge, asphalt and pavements
    band(b, 0, W - 2.0, -END + 0.4, END - 0.4, under, (z) => f(z) - 0.2, conc, 34);
    band(b, 0, W, -END, END, (z) => f(z) - 0.32, (z) => f(z) - 0.06, tint(shell, -0.02), 34);
    band(b, 0, W - 2.4, -END, END, (z) => f(z) - 0.08, (z) => f(z) + 0.01, P.asphalt, 34);
    b.sym((k) => {
      band(b, k * (W / 2 - 0.65), 1.3, -END, END, (z) => f(z) - 0.08, (z) => f(z) + 0.14, P.paving, 34);
      // slim steel railing
      const x = k * (W / 2 - 0.08);
      for (const z of steps(28, -END + 0.5, END - 0.5)) b.box(0.05, 1.0, 0.05, P.steel, { at: [x, f(z) + 0.12, z], jitter: false });
      band(b, x, 0.07, -END + 0.5, END - 0.5, (z) => f(z) + 1.08, (z) => f(z) + 1.14, P.steel, 34);
      band(b, x, 0.04, -END + 0.5, END - 0.5, (z) => f(z) + 0.55, (z) => f(z) + 0.6, P.steel, 34);
      // lamp standards
      for (const z of [-9, 3]) {
        const zz = k > 0 ? z : -z;
        b.cyl(0.07, 6.0, P.steel, { at: [x, f(zz) + 0.14, zz], rTop: 0.05, segs: 6 });
        b.beam([x, f(zz) + 6.1, zz], [x - k * 1.4, f(zz) + 6.25, zz], 0.08, 0.06, P.steel);
        b.box(0.5, 0.12, 0.25, P.steel, { at: [x - k * 1.5, f(zz) + 6.1, zz] });
      }
    });
  },
};
