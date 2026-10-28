// The home regional spotlight: the top and bottom voivodeships of one KPI ranking. Pure.
import type { RankedRegion, RegionRanking } from './ranking';

/**
 * The first n and the last n regions of a ranking, both in ranking order (highest value first).
 * With fewer than 2n regions the bottom list shrinks, so no region is in both lists.
 */
export function spotlight(ranking: RegionRanking, n = 3): { top: RankedRegion[]; bottom: RankedRegion[] } {
  const regions = ranking.regions;
  return {
    top: regions.slice(0, n),
    bottom: regions.slice(Math.max(n, regions.length - n)),
  };
}
