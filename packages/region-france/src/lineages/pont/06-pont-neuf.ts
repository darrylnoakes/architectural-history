import { P, tint, mix, type Builder, type BuildingDef } from '@ah/kit';
import { END, FOOT, hump, band, side, bar, bodyOutline, voussoirs, layout, cutwater, cutwaterHood, parapet } from './shared';

/** A bronze king on horseback on a pedestal, the horse along local Z, facing +Z. */
function equestrian(b: Builder, at: [number, number, number], bronze: number, plinth: number): void {
  b.group({ at }, () => {
    b.box(1.3, 0.25, 2.7, tint(plinth, -0.05));
    b.box(1.1, 1.7, 2.5, plinth, { at: [0, 0.25, 0] });
    b.box(1.3, 0.2, 2.7, tint(plinth, 0.04), { at: [0, 1.95, 0] });
    b.panel(0.7, 0.5, bronze, { at: [0.56, 0.9, 0], facing: '+x', depth: 0.03 });
    b.group({ at: [0, 2.15, 0] }, () => {
      // horse: legs, barrel, neck, head, tail
      for (const [x, z, lift] of [[-0.2, 0.75, 0.25], [0.2, 0.6, 0], [-0.2, -0.65, 0], [0.2, -0.75, 0]] as [number, number, number][]) {
        bar(b, [x, lift, z], [x, 1.05, z * 0.85], 0.13, bronze);
      }
      b.box(0.62, 0.65, 1.75, bronze, { at: [0, 0.95, 0] });
      bar(b, [0, 1.35, 0.7], [0, 2.05, 1.15], [0.32, 0.4], bronze);
      b.box(0.24, 0.3, 0.62, bronze, { at: [0, 1.88, 1.35], rot: [0.5, 0, 0] });
      bar(b, [0, 1.45, -0.85], [0, 0.7, -1.15], [0.12, 0.18], bronze);
      // rider: legs astride, body, head with a hat, the baton held forward
      b.sym((k) => bar(b, [k * 0.33, 0.95, 0.15], [k * 0.36, 1.5, -0.05], 0.14, bronze));
      b.cyl(0.24, 0.85, bronze, { at: [0, 1.6, -0.05], rTop: 0.19, segs: 6 });
      b.sphere(0.15, bronze, { at: [0, 2.6, 0], segs: 6 });
      b.cyl(0.24, 0.06, bronze, { at: [0, 2.7, 0], segs: 8 });
      bar(b, [0.22, 2.25, 0.05], [0.35, 2.35, 0.65], 0.07, bronze);
    });
  });
}

export const pontNeuf: BuildingDef = {
  id: 'pont-neuf',
  name: 'Pont Neuf type bridge',
  style: 'Henri IV and Louis XIII',
  date: 'c. 1630',
  summary:
    'A new kind of bridge, on the model of the Pont Neuf in Paris (1578 to 1607), the first bridge in the capital built without houses: Henri IV wanted it kept open so that people could see the river and the palace. ' +
    'It is wide and almost level, with raised pavements either side of the carriageway, so that people on foot are kept out of the way of coaches; at every pier the cutwater is carried up as a half-round bay where they can stop to look at the river. ' +
    'Under the cornice runs a frieze of carved stone masks on brackets, and in the middle a bronze king on horseback watches over the crossing, a luxury few provincial towns could afford: the bridge has become a public place and a royal monument. ' +
    'In Paris the king’s statue, begun by Giambologna and finished by Pietro Tacca, was set up in 1614 on the island where the two arms of the bridge meet; here a statue stands in the central bay.',
  materials: ['limestone', 'stone setts', 'bronze'],
  modelledOn: 'The Pont Neuf, Paris (1578 to 1607): its pavements, half-round bays over the piers, mask frieze and the equestrian Henri IV of 1614. Shortened to four arches and much narrower',
  lookFor: [
    { label: 'Raised pavement', note: 'A walkway raised above the carriageway either side, one of the first in Paris since Roman times: people on foot are kept apart from horses and coaches.', at: [3.3, 1.1, 9.0] },
    { label: 'Half-moon bay', note: 'A half-round bay (demi-lune) over each pier, where walkers could sit on the stone bench; later small shops were built in them.', at: [5.8, 1.9, 6.2] },
    { label: 'Mascarons', note: 'Carved masks on the brackets under the cornice: grotesque faces of satyrs and river gods, all different.', at: [4.8, 0.25, -9.4] },
    { label: 'Equestrian statue', note: 'A bronze king on horseback set up on the bridge: the bridge has become a place for royal display.', at: [-5.35, 5.0, 0] },
    { label: 'Nearly round arch', note: 'The arches are still close to Roman half-circles on thick piers; flatter arches would come in the next century.', at: [4.55, 0.3, 3.1] },
  ],
  build(b) {
    b.noCollide();
    const crown = 1.2;
    const f = hump(crown);
    const W = 9.0;
    const roadW = 5.2;
    b.deck(W - 1.2, 34, crown, { yEnds: 0 });
    const stone = mix(P.pierreBlonde, P.craie, 0.2);
    const dress = tint(stone, 0.05);
    const shade = tint(stone, -0.08);
    const pierT = 2.2;
    const { ops, piers } = layout([4.0, 4.0, 4.0, 4.0], pierT, [-1.15, -1.1, -1.1, -1.15], (_s, i) => (i === 0 || i === 3 ? 1.45 : 1.75), 'ellipse');
    const top = (z: number) => f(z) - 0.42;

    side(b, bodyOutline({ za: -END, zb: END, top, openings: ops, n: 22 }), W, stone);
    b.sym((k) => {
      for (const op of ops) voussoirs(b, op, { d: 0.36, width: 0.08, x: k * (W / 2 + 0.02), color: dress, blocks: 9 });
    });

    // cutwaters, pointed both ways, rising to half-round bays carried up to the parapet
    const r = 1.3;
    for (const z of piers) {
      b.sym((k) => {
        const big = Math.abs(z) < 0.01 && k < 0;
        const R = big ? 1.9 : r;
        cutwater(b, { x: k * (W / 2), z, thick: pierT, len: 1.4, y0: FOOT, h: -0.75 - FOOT, color: stone });
        cutwaterHood(b, { x: k * (W / 2), z, thick: pierT, nose: 1.4, y: -0.75, h: 0.35, color: dress });
        // the turret: a half-round of masonry from above the cutwater to the deck, corbelled out at its foot
        b.lathe([[0.9, 0], [R, 0.45], [R, f(z) - 0.42 + 0.4]], stone, { at: [k * (W / 2 - 0.05), -0.4, z], start: k > 0 ? 0 : Math.PI, sweep: Math.PI, segs: 8 });
        // the bay's floor, parapet and stone bench
        const y = f(z) - 0.02;
        b.lathe([[R, 0], [R, 1.0], [R - 0.38, 1.0], [R - 0.38, 0.02]], stone, { at: [k * (W / 2 - 0.05), y - 0.05, z], start: k > 0 ? 0 : Math.PI, sweep: Math.PI, segs: 8 });
        b.lathe([[R + 0.06, 0], [R + 0.06, 0.12]], dress, { at: [k * (W / 2 - 0.05), y - 0.45, z], start: k > 0 ? 0 : Math.PI, sweep: Math.PI, segs: 8 });
        if (!big) b.lathe([[R - 0.38, 0], [R - 0.38, 0.42], [R - 0.8, 0.42], [R - 0.8, 0]], shade, { at: [k * (W / 2 - 0.05), y, z], start: k > 0 ? 0 : Math.PI, sweep: Math.PI, segs: 6 });
        else equestrian(b, [k * (W / 2 + 0.85), y, z], mix(P.bronze, P.castIron, 0.45), dress);
      });
    }

    // cornice on brackets, every other one carved with a mask
    b.sym((k) => {
      const xf = k * (W / 2);
      band(b, xf + k * 0.12, 0.3, -END + 0.2, END - 0.2, (z) => f(z) - 0.42, (z) => f(z) - 0.2, dress, 20);
      let i = 0;
      for (let z = -11.4; z <= 11.4; z += 1.0) {
        if (piers.some((p) => Math.abs(p - z) < r + 0.2)) continue;
        const y = f(z) - 0.42;
        b.box(0.24, 0.42, 0.3, dress, { at: [xf + k * 0.12, y - 0.42, z] });
        if (i++ % 2 === 0) b.blob(0.16, shade, { at: [xf + k * 0.27, y - 0.24, z], stretch: [0.6, 1.1, 1], detail: 0 });
      }
    });

    // carriageway of setts, raised pavements with kerbs, and solid parapets
    band(b, 0, roadW, -END, END, (z) => f(z) - 0.2, (z) => f(z) - 0.05, mix(P.cobble, P.gravel, 0.2), 20);
    b.sym((k) => {
      const pw = (W - roadW) / 2 - 0.45;
      band(b, k * (roadW / 2 + pw / 2), pw, -END + 0.3, END - 0.3, (z) => f(z) - 0.2, (z) => f(z) + 0.12, P.paving, 20);
      band(b, k * (roadW / 2 + 0.08), 0.16, -END + 0.3, END - 0.3, (z) => f(z) - 0.2, (z) => f(z) + 0.13, dress, 20);
      // parapet, opening into each bay
      let za = -END + 0.3;
      for (const p of [...piers, END - 0.3 + r]) {
        const rr = Math.abs(p) < 0.01 && k < 0 ? 1.9 : r;
        const zb = p - rr + 0.05;
        if (zb - za > 0.4) parapet(b, { x: k * (W / 2 - 0.22), za, zb, f, lo: -0.2, h: 1.05, t: 0.45, color: stone, cap: dress, n: Math.max(2, Math.round((zb - za) / 1.5)) });
        za = p + rr - 0.05;
      }
    });
  },
};
