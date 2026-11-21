import { REGIONS, scaleOf } from '../regions';
import { useApp } from '../state';

/** The region whose town is showing, and its timeline. */
export function useRegion() {
  const id = useApp((s) => s.regionId);
  const region = REGIONS[id];
  return { region, timeScale: scaleOf(region) };
}
