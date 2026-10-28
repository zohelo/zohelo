// Ranking of the 16 voivodeships for one KPI, from kpi/<kpi_key>/latest.json (zohelo-data
// docs/published.md). Pure: computed at build, never mutates its input.

export type RegionalLatest = {
  kpi_key: string;
  values: {
    source_key: string;
    geography_key: string;
    geography_level: string;
    period: string;
    value: number;
    flags: string[];
  }[];
};

export type RankedRegion = { geography_key: string; value: number; rank: number; provisional: boolean };

export type RegionRanking = {
  kpi_key: string;
  source_key: string;
  period: string;
  national: number | null;
  regions: RankedRegion[];
};

/** The source with the most voivodeship rows; ties go to the smaller source_key. */
function busiestSource(rows: RegionalLatest['values']): string | undefined {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.source_key, (counts.get(r.source_key) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))[0]?.[0];
}

/**
 * Ranks the voivodeships of one source in its latest period: value descending, ties by
 * geography_key; equal values share a rank (1, 2, 2, 4). Null when the source has no voivodeship row.
 */
export function rankRegions(file: RegionalLatest, sourceKey?: string): RegionRanking | null {
  const regional = file.values.filter((v) => v.geography_level === 'voivodeship');
  const source = sourceKey ?? busiestSource(regional);
  const rows = regional.filter((v) => v.source_key === source);
  if (source === undefined || rows.length === 0) return null;

  const period = rows.reduce((max, r) => (r.period > max ? r.period : max), rows[0].period);
  const kept = rows
    .filter((r) => r.period === period)
    .sort((a, b) => b.value - a.value || (a.geography_key < b.geography_key ? -1 : a.geography_key > b.geography_key ? 1 : 0));

  const regions = kept.map((r) => ({
    geography_key: r.geography_key,
    value: r.value,
    rank: 1 + kept.filter((o) => o.value > r.value).length,
    provisional: r.flags.includes('p'),
  }));

  const pl = file.values.find((v) => v.geography_key === 'PL' && v.source_key === source && v.period === period);
  return { kpi_key: file.kpi_key, source_key: source, period, national: pl ? pl.value : null, regions };
}
