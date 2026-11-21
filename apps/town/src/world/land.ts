import { smoothstep, type Road, type Site, type StreetSurface } from '@ah/kit';

export const WATER_Y = -1.2;

export interface StreetStyle {
  color: number;
  main: number;
  lane: number;
  /** Width of a raised pavement each side, 0 for none. */
  pavement: number;
  pavementColor: number;
  /** Painted centre line. */
  lines: boolean;
}

export const STREET_STYLES: Record<StreetSurface, StreetStyle> = {
  track: { color: 0x8b7658, main: 3.4, lane: 2.2, pavement: 0, pavementColor: 0, lines: false },
  paved: { color: 0xb3ab98, main: 6, lane: 3.6, pavement: 0.5, pavementColor: 0xcfc8b6, lines: false },
  mud: { color: 0x7d6a50, main: 4.2, lane: 2.6, pavement: 0, pavementColor: 0, lines: false },
  cobble: { color: 0x8f897c, main: 5.4, lane: 3.4, pavement: 0, pavementColor: 0, lines: false },
  setts: { color: 0x74726c, main: 6.4, lane: 4.2, pavement: 1.6, pavementColor: 0xb7b2a6, lines: false },
  macadam: { color: 0x6f6b64, main: 6.8, lane: 4.6, pavement: 1.6, pavementColor: 0xbab6ab, lines: false },
  tarmac: { color: 0x4c4e52, main: 7, lane: 5, pavement: 1.7, pavementColor: 0xbfbcb3, lines: true },
};

/**
 * A region's site turned into the questions the renderer and the walker ask: how high is the
 * ground here, where is the river, how far is the nearest road. Everything is a pure function of
 * position, so terrain, roads, trees and the walker all agree.
 */
export class Land {
  readonly riverHalf: number;

  constructor(readonly site: Site) {
    this.riverHalf = site.river?.half ?? 0;
  }

  /** z of the river's centre line at x, or NaN if the site has no river. */
  riverZ(x: number): number {
    return this.site.river ? this.site.river.z(x) : NaN;
  }

  /** Distance from the river's centre line (Infinity without a river). */
  riverDist(x: number, z: number): number {
    return this.site.river ? Math.abs(z - this.site.river.z(x)) : Infinity;
  }

  /** Height of the ground: the site's relief with the river channel cut into it. */
  height = (x: number, z: number): number => {
    let h = this.site.relief(x, z);
    if (this.site.river) {
      const d = Math.abs(z - this.site.river.z(x));
      const half = this.riverHalf;
      // level the banks, then cut the channel
      h *= smoothstep(half + 2, half + 30, d);
      h -= 2.4 * (1 - smoothstep(half - 1.8, half + 2.5, d));
    }
    return h;
  };

  roadsAt(year: number): Road[] {
    return this.site.roads.filter((r) => (r.since ?? -Infinity) <= year && (r.until ?? Infinity) > year);
  }

  /** Distance from (x, z) to the nearest road centre line, whenever it was laid. */
  distToRoad(x: number, z: number): number {
    let best = Infinity;
    for (const r of this.site.roads) {
      for (let i = 0; i < r.pts.length - 1; i++) {
        const [ax, az] = r.pts[i];
        const [bx, bz] = r.pts[i + 1];
        const dx = bx - ax;
        const dz = bz - az;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
        const d = Math.hypot(x - (ax + t * dx), z - (az + t * dz));
        if (d < best) best = d;
      }
    }
    return best;
  }

  inSquare(x: number, z: number, margin = 0): boolean {
    return this.site.squares.some((q) => x > q.x0 - margin && x < q.x1 + margin && z > q.z0 - margin && z < q.z1 + margin);
  }
}
