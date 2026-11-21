import * as THREE from 'three';
import { P, tint, mix, type Builder, type BuildingDef, type Vec3 } from '@ah/kit';
import { END, hump, band, steps } from './shared';

/** A round tube of radius r from p0 to p1. */
function tube(b: Builder, p0: Vec3, p1: Vec3, r: number, color: number): void {
  const a = new THREE.Vector3(...p0);
  const c = new THREE.Vector3(...p1);
  const d = c.clone().sub(a);
  const len = d.length();
  if (len < 1e-4) return;
  const g = new THREE.CylinderGeometry(r, r, len, 8);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  const m = a.clone().add(c).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  b.add(g, color);
}

export const footbridge: BuildingDef = {
  id: 'footbridge',
  name: 'Steel and glass arched footbridge',
  style: 'Contemporary',
  date: '2008',
  summary:
    'The newest crossing is for people on foot only: one very flat steel arch leaps from bank to bank with no pier in the water. ' +
    'Like Santiago Calatrava’s Ponte della Costituzione in Venice (2008), it is built like the skeleton of a fish: a central box-section spine and two side tubes, tied together by curved ribs, all painted red. ' +
    'The walking surface is a shallow flight of steps of alternating stone and glass between glass parapets with a bronze handrail lit from inside. ' +
    'In Venice the glass steps proved slippery and fragile and the bridge had no step-free access, problems that took years and much money to deal with.',
  materials: ['painted steel', 'toughened glass', 'Istrian stone', 'bronze'],
  modelledOn: 'The Ponte della Costituzione, Venice (Santiago Calatrava, 2008)',
  lookFor: [
    { label: 'Flat steel arch', note: 'One very shallow arch, its span about sixteen times its rise, crosses the whole river with no pier.', at: [3.3, 1.9, 0] },
    { label: 'Spine and ribs', note: 'Curved ribs branch from a central steel box like the bones of a fish and carry the two side tubes.', at: [1.8, 1.2, -6.0] },
    { label: 'Glass steps', note: 'Treads of glass alternate with stone: beautiful, but slippery when wet.', at: [0, 2.45, 3.0] },
    { label: 'Glass parapet', note: 'Clear glass panels keep the view open, with a bronze handrail that lights up at night.', at: [-3.1, 3.0, 0] },
    { label: 'Stone abutment', note: 'Each end lands on a stone platform that takes the thrust of the arch into the ground.', at: [3.7, 0.3, -14.0] },
  ],
  influences: ['star-architects'],
  build(b) {
    b.noCollide();
    const crown = 2.4;
    const f = hump(crown);
    b.deck(4.2, 34, crown, { yEnds: 0 });
    const red = mix(P.cladRed, P.terracottaPainted, 0.4);
    const redD = tint(red, -0.08);
    const stone = P.limestone;
    const span = 13.6;
    const half = (z: number) => 2.25 + 1.05 * (1 - (z / END) ** 2);
    const under = (z: number) => f(z) - 0.28;
    const spineD = (z: number) => 0.7 + 1.1 * (z / span) ** 2;

    // stone abutments on both banks
    b.sym((s) => {
      b.box(7.2, 0.6 + f(s * 14.2), 3.0, stone, { at: [0, -0.6, s * 14.0] });
      b.box(7.6, 0.12, 3.2, tint(stone, 0.05), { at: [0, f(s * 14.2), s * 14.0] });
    });

    // the central spine: a box arch, deeper toward the springings
    band(b, 0, 1.3, -span, span, (z) => under(z) - spineD(z), under, red, 30);
    band(b, 0, 1.0, -span, span, (z) => under(z) - spineD(z) - 0.06, (z) => under(z) - spineD(z), redD, 30);
    // the side tubes, following the edge of the walkway
    const zs = steps(24, -span, span);
    b.sym((k) => {
      for (let i = 0; i < zs.length - 1; i++) {
        const za = zs[i];
        const zb = zs[i + 1];
        tube(b, [k * (half(za) - 0.15), under(za) - 0.12, za], [k * (half(zb) - 0.15), under(zb) - 0.12, zb], 0.17, red);
      }
      // curved ribs from the bottom of the spine out to the tubes
      for (const z of steps(16, -span + 0.6, span - 0.6)) {
        const y0 = under(z) - spineD(z) + 0.1;
        const y1 = under(z) - 0.12;
        const x1 = k * (half(z) - 0.15);
        const mid: Vec3 = [x1 * 0.55, y0 + (y1 - y0) * 0.35 - 0.12, z];
        tube(b, [k * 0.6, y0, z], mid, 0.07, redD);
        tube(b, mid, [x1, y1, z], 0.07, redD);
      }
    });

    // the walkway: shallow steps of stone with a band of glass in each
    const n = 44;
    const L = END * 2 - 0.4;
    for (let i = 0; i < n; i++) {
      const z0 = -END + 0.2 + (i * L) / n;
      const z1 = z0 + L / n;
      const zc = (z0 + z1) / 2;
      const y = f(zc);
      const w = half(zc) * 2 - 0.3;
      b.box(w, 0.12, z1 - z0, tint(stone, i % 2 ? 0.03 : -0.01), { at: [0, y - 0.12, zc] });
      b.box(w - 0.6, 0.02, (z1 - z0) * 0.4, P.glassGreen, { at: [0, y - 0.005, zc + (z1 - z0) * 0.15], mat: 'glass' });
    }
    // underside plate between the tubes, so the steps sit on something
    band(b, 0, 4.2, -span, span, (z) => under(z) - 0.06, (z) => f(z) - 0.12, tint(red, 0.05), 30);

    // glass parapets with a bronze handrail
    b.sym((k) => {
      const zs2 = steps(20, -END + 0.6, END - 0.6);
      for (let i = 0; i < zs2.length - 1; i++) {
        const za = zs2[i];
        const zb = zs2[i + 1];
        const xa = k * (half(za) - 0.2);
        const xb = k * (half(zb) - 0.2);
        const xm = (xa + xb) / 2;
        const zm = (za + zb) / 2;
        b.box(0.03, 1.05, zb - za - 0.04, P.glass, { at: [xm, f(zm) - 0.02, zm], rot: [Math.atan2(f(za) - f(zb), zb - za), Math.atan2(xb - xa, zb - za), 0], mat: 'glass' });
        tube(b, [xa, f(za) + 1.08, za], [xb, f(zb) + 1.08, zb], 0.05, P.bronze);
        tube(b, [xa, f(za) + 1.03, za], [xb, f(zb) + 1.03, zb], 0.025, P.windowLit);
      }
    });
  },
};
