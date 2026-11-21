import type { Builder, Vec3 } from '@ah/kit';

/**
 * A vertical prism from a plan outline. `plan` is [x, z] pairs in metres (z positive toward the
 * front); the prism stands on `at` and rises h.
 */
export function prism(b: Builder, plan: [number, number][], h: number, color: number, at: Vec3): void {
  b.group({ at: [at[0], at[1] + h / 2, at[2]], rot: [-Math.PI / 2, 0, 0] }, () => {
    b.extrude(
      plan.map(([x, z]) => [x, -z] as [number, number]),
      h,
      color,
    );
  });
}

/** Plan of a canted bay: front face `fw` wide, projecting `p`, sides at 45 degrees, back edge at z 0. */
export function cantedPlan(fw: number, p: number): [number, number][] {
  const bw = fw / 2 + p;
  return [
    [-bw, 0],
    [bw, 0],
    [fw / 2, p],
    [-fw / 2, p],
  ];
}
