import { P, tint, type Builder } from '@ah/kit';
import { coppiShed, gardenWalls, gardenWallsTo, pave, well, WELL } from './shared';

/**
 * The pair of medieval row houses of stage 7 and what the later stages keep of them. Each house is
 * 6.8 m wide; the stone ground storey and its two openings, the walls of the upper floors once they
 * are rebuilt flush (stage 8), and the yards behind are built here and called with the same numbers
 * by every stage that keeps them, so in the town only the alterations change.
 */
export const ROW = {
  W: 13.6,
  uw: 6.8, // width of each house
  zf: 7.6, // street front of the ground storey (and, from the Renaissance, of the whole front)
  zb: -1.0, // back wall
  g: 4.0, // the stone ground storey
  ld: 2.2, // depth of the back bay of our house, opened as a loggia in the Renaissance
  up: 6.4, // the two upper floors as rebuilt flush with the ground storey in the Renaissance
};

/** x of our house (on the left as you face it) and of the neighbour's. */
export const OURS = -ROW.uw / 2;
export const THEIRS = ROW.uw / 2;

/**
 * The stone ground storey of one house. Ours is built in two parts, the back bay separately, so the
 * Renaissance can open that bay as a loggia (`loggia`) and leave the rest standing.
 */
export function rowGround(b: Builder, cx: number, ours: boolean, color: number, o: { loggia?: boolean; jitter?: boolean } = {}): void {
  const { uw, zf, zb, g, ld } = ROW;
  if (!ours) {
    b.box(uw, g, zf - zb, color, { at: [cx, 0, (zf + zb) / 2], jitter: o.jitter });
    return;
  }
  b.box(uw, g, zf - zb - ld, color, { at: [cx, 0, (zf + zb + ld) / 2], jitter: o.jitter });
  if (!o.loggia) b.box(uw, g, ld, color, { at: [cx, 0, zb + ld / 2], jitter: o.jitter });
}

/** The medieval shop arch and the round-headed street door beside it, kept through the Renaissance. */
export function rowOpenings(b: Builder, cx: number, surround: number, door: number): void {
  const { zf } = ROW;
  const sx = cx - 0.8;
  const dx = cx + 2.75;
  b.panel(3.4, 3.4, surround, { at: [sx, 0, zf], facing: '+z', shape: 'round', depth: 0.03 });
  b.panel(3.0, 3.2, P.windowDark, { at: [sx, 0, zf], facing: '+z', shape: 'round', depth: 0.05 });
  b.panel(1.25, 2.5, surround, { at: [dx, 0, zf], facing: '+z', shape: 'round', depth: 0.03 });
  b.panel(0.95, 2.3, door, { at: [dx, 0, zf], facing: '+z', shape: 'round', depth: 0.05 });
  b.box(1.3, 0.15, 0.35, P.travertine, { at: [dx, 0, zf + 0.17] });
}

/** The two upper floors of one house once the front is rebuilt flat (stage 8); the palazzetto keeps them and builds on top. */
export function rowUpper(b: Builder, cx: number, color: number, o: { jitter?: boolean } = {}): void {
  const { uw, zf, zb, g, up } = ROW;
  b.box(uw, up, zf - zb, color, { at: [cx, g, (zf + zb) / 2], jitter: o.jitter });
}

/**
 * The yards behind: the old Roman garden walls carried on to the houses, the well, a strip of cobbles
 * at each back door, a privy in the far corner of each yard and the wall dividing them (both left out
 * once the two houses are one, `merged`).
 */
export function rowYards(b: Builder, wall: number, wellStone: number, tile: number, o: { merged?: boolean; jitter?: boolean } = {}): void {
  const { uw, zb } = ROW;
  gardenWalls(b, wall, { jitter: o.jitter });
  gardenWallsTo(b, zb, wall, { jitter: o.jitter });
  well(b, WELL, wellStone, { frame: 'iron' });
  if (o.merged) return;
  b.box(0.3, 2.2, zb + 8.4, tint(P.rubble, -0.04), { at: [0, 0, (zb - 8.4) / 2] });
  for (const cx of [OURS, THEIRS]) {
    pave(b, uw - 0.4, 1.6, P.cobble, [cx, 0, zb - 0.8]);
    b.box(1.3, 2.1, 1.2, P.rubble, { at: [cx + 2.4, 0, -7.8] });
    coppiShed(b, 1.5, 1.4, 0.35, tile, { at: [cx + 2.4, 2.1, -7.8], high: '+z' });
    b.panel(0.65, 1.7, P.oak, { at: [cx + 2.4, 0, -7.2], facing: '+z' });
  }
}
