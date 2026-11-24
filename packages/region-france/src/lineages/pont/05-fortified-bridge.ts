import { P, tint, mix, type Builder, type BuildingDef } from '@ah/kit';
import { END, FOOT, hump, band, side, bar, bodyOutline, voussoirs, layout, cutwater, cutwaterHood, parapet } from './shared';

/**
 * A square gate tower straddling the road at z, its base following the deck, with a pointed
 * gateway through it, a machicolated and battlemented top and a low roof behind.
 */
function gateTower(b: Builder, o: { z: number; base: number; tw: number; td: number; H: number; stone: number; dress: number }): void {
  const { z, base, tw, td, H, stone, dress } = o;
  b.archWall(tw, H, td, stone, { at: [0, base, z], facing: '+z', openings: 1, openW: 3.0, openH: 4.4, shape: 'pointed' });
  // a ring of dressed stone round the gateway on both faces (matching archWall's two-centred arch)
  const ringPts = (): [number, number][] => {
    const a = 1.5;
    const rise = 2.6;
    const hs = 4.4 - rise;
    const R = (a * a + rise * rise) / (2 * a);
    const Ro = R + 0.3;
    const cxL = R - a;
    const out: [number, number][] = [[-a - 0.3, 0], [-a - 0.3, hs]];
    const tApexO = Math.acos(-cxL / Ro);
    for (let i = 1; i <= 5; i++) {
      const t = Math.PI + ((tApexO - Math.PI) * i) / 5;
      out.push([cxL + Ro * Math.cos(t), hs + Ro * Math.sin(t)]);
    }
    for (let i = 4; i >= 1; i--) out.push([-out[1 + i][0], out[1 + i][1]]);
    out.push([a + 0.3, hs], [a + 0.3, 0], [a, 0], [a, hs]);
    const tApexI = Math.acos(-cxL / R);
    const inner: [number, number][] = [];
    for (let i = 1; i <= 5; i++) {
      const t = Math.PI + ((tApexI - Math.PI) * i) / 5;
      inner.push([cxL + R * Math.cos(t), hs + R * Math.sin(t)]);
    }
    for (let i = 3; i >= 0; i--) out.push([-inner[i][0], inner[i][1]]);
    out.push(inner[4]);
    for (let i = 3; i >= 0; i--) out.push(inner[i]);
    out.push([-a, hs], [-a, 0]);
    return out;
  };
  const ring = ringPts();
  b.sym((k) => b.extrude(ring, 0.12, dress, { at: [0, base, z + k * (td / 2 + 0.04)] }));
  b.sym((k) => b.box(0.05, 3.4, td - 0.1, tint(stone, -0.14), { at: [k * 1.47, base, z] }));
  // gate leaves standing open against the passage
  b.sym((k) => b.box(0.1, 3.3, 1.45, P.oakDark, { at: [k * 1.38, base, z + td / 2 - 0.85], rotY: k * 0.1 }));
  // arrow slits on every face, and a pair of windows to the guard room
  b.sym((k) => {
    for (const y of [6.4]) {
      b.panel(0.16, 1.1, P.windowDark, { at: [k * (tw / 2), base + y, z], facing: k > 0 ? '+x' : '-x' });
      b.panel(0.16, 1.1, P.windowDark, { at: [k * 1.2, base + y + 0.6, z + td / 2], facing: '+z' });
      b.panel(0.16, 1.1, P.windowDark, { at: [k * 1.2, base + y + 0.6, z - td / 2], facing: '-z' });
    }
  });
  // machicolations: corbels carrying a parapet out beyond the wall, open between them
  const top = base + H;
  const ov = 0.42;
  const corb = (len: number, place: (p: number) => [number, number], rotY: number) => {
    const n = Math.max(3, Math.round(len / 0.95));
    for (let i = 0; i <= n; i++) {
      const p = -len / 2 + (i * len) / n;
      const [x, zz] = place(p);
      b.group({ at: [x, top - 0.75, zz], rotY }, () => {
        b.box(0.28, 0.75, ov + 0.06, dress, { at: [0, 0, ov / 2] });
      });
    }
  };
  b.sym((k) => {
    corb(tw, (p) => [p, z + k * (td / 2)], k > 0 ? 0 : Math.PI);
    corb(td, (p) => [k * (tw / 2), z + p], k > 0 ? Math.PI / 2 : -Math.PI / 2);
  });
  // the shadowed slots behind the corbels, and the overhanging parapet with merlons
  b.box(tw + 0.04, 0.25, td + 0.04, tint(stone, -0.22), { at: [0, top - 0.26, z] });
  const W2 = tw + ov * 2;
  const D2 = td + ov * 2;
  b.sym((k) => {
    b.box(W2, 0.75, 0.3, stone, { at: [0, top, z + k * (D2 / 2 - 0.15)] });
    b.box(0.3, 0.75, D2 - 0.6, stone, { at: [k * (W2 / 2 - 0.15), top, z] });
  });
  b.crenel(W2, D2, stone, { at: [0, top + 0.75, z], merlonW: 0.6, merlonH: 0.8, t: 0.3 });
  b.box(tw, 0.12, td, tint(stone, -0.1), { at: [0, top - 0.05, z] });
  b.pyramid(tw - 0.4, td - 0.4, 1.5, P.tuilePlate, { at: [0, top + 0.1, z] });
}

export const fortifiedBridge: BuildingDef = {
  id: 'fortified-bridge',
  name: 'Fortified bridge with gate towers',
  style: 'Gothic',
  date: 'c. 1320',
  summary:
    'The town rebuilds its crossing as a fortress. A bridge was the weakest point in a town’s defences, so this one is closed by three tall square towers, one at each end and one in the middle, each with a gate that can be shut, arrow slits, and a battlemented top built out on corbels so that defenders can drop stones through the gaps (machicolations) onto anyone at the gate. ' +
    'The arches are pointed and the piers have long cutwaters upstream, carried right up to the road to make triangular refuges where people on foot can step aside from carts. ' +
    'In the Hundred Years’ War such bridges were fought over, as at Orléans in 1429. The model for it, the Pont Valentré at Cahors (begun in 1308 and finished about 1378), was never attacked; its tower tops were rebuilt in Paul Gout’s restoration from 1879.',
  materials: ['limestone', 'oak gates', 'flat clay tiles'],
  modelledOn: 'The Pont Valentré, Cahors (1308 to about 1378): three square towers with gates, pointed arches and upstream cutwaters rising to refuges. Here shortened to four arches',
  lookFor: [
    { label: 'Gate tower', note: 'The road passes under each tower through a pointed gateway with heavy oak gates; tolls were taken here too.', at: [1.9, 3.5, 2.3] },
    { label: 'Machicolations', note: 'The parapet is carried out on stepped corbels, leaving slots in the floor between them to drop stones or shoot down through.', at: [2.75, 14.3, -0.95] },
    { label: 'Battlements', note: 'Merlons (the solid parts) and crenels (the gaps) along the top: cover for defenders as they shoot.', at: [0, 15.9, -2.65] },
    { label: 'Pointed arch', note: 'Tall pointed arches give boats headroom while pushing less sideways on the piers than half-circles.', at: [2.6, 0.9, -3.15] },
    { label: 'Refuge', note: 'The upstream cutwater is carried up to the road and opens off it as a triangular bay where walkers can stand clear of carts.', at: [-3.7, 2.3, -6.3] },
  ],
  build(b) {
    b.noCollide();
    const crown = 2.0;
    const f = hump(crown);
    const W = 5.0;
    b.deck(W - 1.0, 34, crown, { yEnds: 0 });
    const stone = mix(P.pierreBlonde, P.limestoneWarm, 0.3);
    const dress = tint(stone, 0.06);
    const pierT = 1.8;
    const rises = [1.8, 2.35, 2.35, 1.8];
    const { ops, piers } = layout([4.5, 4.5, 4.5, 4.5], pierT, -1.0, (_s, i) => rises[i], 'pointed');
    const top = (z: number) => f(z) - 0.15;

    side(b, bodyOutline({ za: -END, zb: END, top, openings: ops, n: 26 }), W, stone);
    b.sym((k) => {
      for (const op of ops) voussoirs(b, op, { d: 0.45, width: 0.08, x: k * (W / 2 + 0.02), color: dress, blocks: 7 });
      band(b, k * (W / 2 + 0.05), 0.12, -END + 0.3, END - 0.3, (z) => f(z) - 0.42, (z) => f(z) - 0.2, dress, 20);
    });
    band(b, 0, W - 1.0, -END, END, (z) => f(z) - 0.16, (z) => f(z) + 0.01, mix(P.cobble, P.gravel, 0.4), 24);

    // cutwaters: upstream noses rise to the road and open as refuges; downstream ones are capped low
    for (const z of piers) {
      const len = 2.0;
      const yT = f(z) - 0.15;
      cutwater(b, { x: -W / 2, z, thick: pierT, len, y0: FOOT, h: yT - FOOT, color: stone });
      // the refuge's own parapet, round the point
      for (const s of [-1, 1]) {
        bar(b, [-W / 2 + 0.1, yT + 0.45, z + s * (pierT / 2 - 0.15)], [-W / 2 - len + 0.3, yT + 0.45, z], [0.35, 1.2], stone);
      }
      cutwater(b, { x: W / 2, z, thick: pierT, len: 1.0, y0: FOOT, h: -0.3 - FOOT, color: stone });
      cutwaterHood(b, { x: W / 2, z, thick: pierT, nose: 1.0, y: -0.3, h: 0.8, color: dress });
    }
    // parapets, broken at each refuge and at the towers
    const td = 4.4;
    const towersZ = [-13.4, 0, 13.4];
    b.sym((k) => {
      const cuts: [number, number][] = towersZ.map((z) => [z - td / 2, z + td / 2]);
      if (k < 0) for (const z of piers) if (z !== 0) cuts.push([z - pierT / 2 + 0.3, z + pierT / 2 - 0.3]);
      cuts.sort((p, q) => p[0] - q[0]);
      let za = -END + 0.3;
      for (const [a, c] of [...cuts, [END - 0.3, END] as [number, number]]) {
        if (a - za > 0.4) parapet(b, { x: k * (W / 2 - 0.2), za, zb: a, f, lo: -0.15, h: 1.0, t: 0.4, color: stone, cap: dress, n: Math.max(2, Math.round((a - za) / 1.5)) });
        za = Math.max(za, c);
      }
    });

    // the three towers; the end ones stand on the abutments, the middle one on the central pier
    for (const z of towersZ) {
      gateTower(b, { z, base: f(z) - 0.15, tw: W, td, H: 13.0 - Math.abs(z) * 0.08, stone, dress });
    }
  },
};
