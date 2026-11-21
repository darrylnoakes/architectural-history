import { P, mix, tint, type BuildingDef, type Builder } from '@ah/kit';
import { lineColliders, quad, soup, type V3, type XZ } from './shared';

/** The rampart line, clockwise from the right of the gate round to its left. */
const RING: XZ[] = [];
for (let i = 0; i <= 22; i++) {
  // an oval round the hilltop, the gap for the gate at the front (+Z, angle PI/2)
  const a = Math.PI / 2 + 0.2 + (i / 22) * (Math.PI * 2 - 0.4);
  RING.push([Math.cos(a) * 18.2, Math.sin(a) * 17.6]);
}

/** An earth bank of triangular section along a polyline. */
function bank(b: Builder, pts: XZ[], w: number, h: number, color: number): void {
  const out: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = (-(z1 - z0) / L) * (w / 2);
    const nz = ((x1 - x0) / L) * (w / 2);
    quad(out, [x0 + nx, 0, z0 + nz], [x1 + nx, 0, z1 + nz], [x1, h, z1], [x0, h, z0]);
    quad(out, [x0 - nx, 0, z0 - nz], [x0, h, z0], [x1, h, z1], [x1 - nx, 0, z1 - nz]);
  }
  soup(b, out, color);
}

/** A stockade of split stakes with pointed tops standing on the crest of the bank. */
function stockade(b: Builder, pts: XZ[], y0: number, h: number, color: number): void {
  const s = 0.4;
  const out: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(L / s));
    for (let k = 0; k < n; k++) {
      const ax = x0 + ((x1 - x0) * k) / n;
      const az = z0 + ((z1 - z0) * k) / n;
      const bx = x0 + ((x1 - x0) * (k + 1)) / n;
      const bz = z0 + ((z1 - z0) * (k + 1)) / n;
      const top = y0 + h * (0.93 + 0.07 * (((k * 7 + i) % 5) / 4));
      quad(out, [ax, y0 - 0.4, az], [bx, y0 - 0.4, bz], [bx, top, bz], [ax, top, az]);
      out.push(ax, top, az, bx, top, bz, (ax + bx) / 2, top + 0.45, (az + bz) / 2);
    }
  }
  soup(b, out, color);
}

/**
 * An oval hut with a hipped thatched roof along a ridge, the crossed timbers the hut urns show
 * along its ridge, and a porch on the +Z end.
 */
function ovalHut(b: Builder, at: V3, rx: number, rz: number, wallH: number, roofH: number, o?: { rotY?: number; porch?: boolean; big?: boolean }): void {
  b.group({ at, rotY: o?.rotY ?? 0 }, () => {
    b.group({ scale: [rx, 1, rz] }, () => b.cyl(1, wallH, P.daub, { segs: 12 }));
    // thatch: an oval eave ring drawn up to a short ridge along Z
    const N = 16;
    const ex = rx + 0.45;
    const ez = rz + 0.45;
    const rr = rz * 0.42;
    const eave = wallH - 0.25;
    const top = wallH + roofH;
    const out: number[] = [];
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2;
      const a1 = ((i + 1) / N) * Math.PI * 2;
      const p0 = [Math.cos(a0) * ex, eave, Math.sin(a0) * ez];
      const p1 = [Math.cos(a1) * ex, eave, Math.sin(a1) * ez];
      const r0 = [0, top, Math.max(-rr, Math.min(rr, Math.sin(a0) * ez))];
      const r1 = [0, top, Math.max(-rr, Math.min(rr, Math.sin(a1) * ez))];
      quad(out, p0, p1, r1, r0);
    }
    soup(b, out, P.thatch);
    // ridge pole and pairs of crossed timbers along it
    b.beam([0, top + 0.05, -rr - 0.4], [0, top + 0.05, rr + 0.4], 0.2, 0.2, P.oakDark);
    const pairs = o?.big ? [-1, -0.5, 0, 0.5, 1] : [-1, 0, 1];
    for (const k of pairs) {
      const z = k * rr;
      b.beam([-0.7, top - 0.45, z], [0.55, top + 0.75, z], 0.1, 0.1, P.oakDark);
      b.beam([0.7, top - 0.45, z], [-0.55, top + 0.75, z], 0.1, 0.1, P.oakDark);
    }
    // doorway, and a porch on two posts
    b.box(1.0, 1.8, 0.25, P.oakDark, { at: [0, 0, rz - 0.05], jitter: false });
    if (o?.porch !== false) {
      const pd = o?.big ? 2.0 : 1.4;
      const pw = o?.big ? 3.2 : 2.2;
      b.box(pw, 0.14, pd + 0.4, P.thatch, { at: [0, wallH - 0.35, rz + pd / 2], rot: [0.22, 0, 0] });
      for (const sx of [-1, 1]) b.cyl(0.09, wallH - 0.3, P.oak, { at: [sx * (pw / 2 - 0.2), 0, rz + pd], segs: 5 });
    }
  });
}

export const arx: BuildingDef = {
  id: 'arx',
  name: 'Hilltop stronghold',
  style: 'Early Iron Age',
  date: 'c. 750 BC',
  summary:
    'The first village stands on a hill above the ford, and its people make the hilltop their refuge: an earth rampart topped with a stockade of split oak, a ditch in front, and one timber gate. ' +
    'Inside lives the chief, head of the leading family, in the largest of the oval huts: wattle and daub on a frame of posts, a thatched roof with crossed timbers along the ridge, and a porch, exactly as the hut-shaped urns of the period show. ' +
    'Power here belongs to a person, not an office: the chief leads in war, keeps the grain and makes the sacrifices for the community.',
  materials: ['earth', 'oak stakes', 'wattle and daub', 'thatch'],
  lookFor: [
    { label: 'Rampart and stockade', note: 'A bank of rammed earth from the ditch in front, crowned with a fence of pointed oak stakes.', at: [16, 3.2, 6] },
    { label: 'Gate tower', note: 'The only way in: a timber tower over the gateway where the bank is cut through.', at: [3.4, 5.5, 18.5] },
    { label: 'Chief’s hut', note: 'The largest hut, with a deep porch on posts facing the open ground where people gathered.', at: [-2.6, 2.6, -3.2] },
    { label: 'Crossed ridge timbers', note: 'Pairs of crossed poles pin the thatch along the ridge, as the clay hut-urns of Latium and Etruria show.', at: [0, 6.8, -8.5] },
    { label: 'Raised granary', note: 'The community’s grain kept on posts off the damp and away from rats, under the chief’s eye.', at: [9.5, 3.5, -7] },
  ],
  modelledOn: 'The post-built huts of the Palatine in Rome and the hut-urns of Latium and Etruria',
  build(b) {
    // the hilltop: a low rise of trodden earth with grass round its foot
    b.lathe([[21.8, 0], [20, 0.3], [15, 0.55], [0, 0.6]], mix(P.earth, P.grassDry, 0.35), { segs: 20 });
    // the ditch outside the rampart
    const ditch: XZ[] = RING.map(([x, z]) => [x * 1.12, z * 1.12]);
    const dout: number[] = [];
    for (let i = 0; i < ditch.length - 1; i++) {
      const [x0, z0] = ditch[i];
      const [x1, z1] = ditch[i + 1];
      quad(dout, [x0 * 0.96, 0.08, z0 * 0.96], [x1 * 0.96, 0.08, z1 * 0.96], [x1 * 1.04, 0.08, z1 * 1.04], [x0 * 1.04, 0.08, z0 * 1.04]);
    }
    soup(b, dout, tint(P.soil, -0.05), { jitter: false });
    // rampart and stockade
    bank(b, RING, 4.2, 2.0, mix(P.earth, P.turf, 0.45));
    stockade(b, RING.map(([x, z]) => [x * 1.01, z * 1.01] as XZ), 2.0, 2.4, P.oakSilver);

    // the gate: two heavy posts each side, a fighting platform and a little roof
    const [gx0, gz0] = RING[RING.length - 1];
    const [gx1, gz1] = RING[0];
    b.group({ at: [(gx0 + gx1) / 2, 0, (gz0 + gz1) / 2] }, () => {
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) b.cyl(0.22, 6.2, P.oak, { at: [sx * 2.4, 0, sz * 1.3], segs: 6 });
      b.box(5.6, 0.3, 3.2, P.oakDark, { at: [0, 4.0, 0] });
      for (const sz of [-1, 1]) b.box(5.6, 1.1, 0.12, P.oak, { at: [0, 4.3, sz * 1.5] });
      b.gable(6.0, 3.6, 1.6, P.thatch, { at: [0, 6.2, 0], overhang: 0.2, thick: 0.35 });
      // the gate leaves, standing open
      for (const sx of [-1, 1]) b.box(0.15, 3.0, 2.0, P.oakDark, { at: [sx * 2.0, 0, 2.2], rotY: sx * 0.2 });
    });

    // the chief's hut, facing the gathering ground, and the hearth before it
    ovalHut(b, [-1, 0.6, -8.5], 3.6, 5.2, 2.2, 4.0, { big: true });
    b.cyl(0.9, 0.25, P.rubble, { at: [-1, 0.6, 1.5], segs: 8 });
    b.cyl(0.6, 0.3, tint(P.soil, -0.15), { at: [-1, 0.62, 1.5], segs: 8 });
    // the households of the chief's kin and dependants
    ovalHut(b, [-11, 0.55, -1], 2.2, 3.2, 1.8, 2.8, { rotY: 0.9 });
    ovalHut(b, [-9.5, 0.5, 8.5], 2.0, 2.9, 1.7, 2.6, { rotY: 1.9 });
    ovalHut(b, [11.5, 0.5, -0.5], 2.0, 3.0, 1.7, 2.6, { rotY: -1.5, porch: false });
    // raised granary on posts
    b.group({ at: [9.5, 0.55, -7] }, () => {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.13, 1.4, P.oak, { at: [sx * 1.1, 0, sz * 1.1], segs: 5 });
      b.box(2.8, 0.2, 2.8, P.oakDark, { at: [0, 1.4, 0] });
      b.box(2.4, 1.6, 2.4, P.wattle, { at: [0, 1.6, 0] });
      b.pyramid(3.2, 3.2, 1.8, P.thatch, { at: [0, 3.2, 0], overhang: 0.2 });
    });
    // a wattle pen for the animals, and a few sheep
    const pen: XZ[] = [[4, 11], [11, 11], [12, 2.5], [4.5, 2]];
    for (let i = 0; i < pen.length; i++) {
      const [x0, z0] = pen[i];
      const [x1, z1] = pen[(i + 1) % pen.length];
      if (i === 3) continue;
      b.beam([x0, 1.4, z0], [x1, 1.4, z1], 0.12, 0.9, P.wattle);
    }
    for (const [x, z] of [[7, 6], [8.6, 7.5], [9.6, 5], [6.5, 9]] as const) {
      b.box(0.5, 0.45, 0.9, P.limewash, { at: [x, 0.85, z], rotY: x });
      b.box(0.22, 0.25, 0.3, P.doorBlack, { at: [x + Math.sin(x) * 0.5, 1.05, z + Math.cos(x) * 0.5], rotY: x });
    }

    // colliders: the rampart all round except the gateway; the huts and granary
    lineColliders(b, RING, 3.6);
    b.collider(7.6, 10.8, { at: [-1, 0, -8.5] });
    b.collider(4.4, 6.4, { at: [-11, 0, -1], rotY: 0.9 });
    b.collider(4.0, 5.8, { at: [-9.5, 0, 8.5], rotY: 1.9 });
    b.collider(4.0, 6.0, { at: [11.5, 0, -0.5], rotY: -1.5 });
    b.collider(3.0, 3.0, { at: [9.5, 0, -7] });
  },
};
