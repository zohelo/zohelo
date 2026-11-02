import type { SeriesRow } from '../published';

// The headline series of a KPI for the line chart: the national (PL) total of one source and one
// measure, one point per period, oldest first. Pure; the caller reads the rows (readKpiSeries).

export type SeriesPoint = {
  /** 'YYYY-MM-DD', the first day of the period: the chart's x. */
  date: string;
  /** The period as published ('2026-09', '2025'): the table's label. */
  period: string;
  value: number;
};

export type HeadlineSeries = {
  source_key: string;
  measure_key: string;
  unit_key: string;
  frequency: string;
  points: SeriesPoint[];
};

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function mostFrequent(values: string[]): string | undefined {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]))[0]?.[0];
}

/**
 * The PL total rows of `sourceKey` (or, without one, of the source with the most PL rows), in the
 * measure that source publishes most, sorted by period_start with one point per period (the last row
 * wins). Null when there is no such row: the page then renders without the chart (#389).
 */
export function headlineSeries(rows: SeriesRow[], sourceKey?: string | null): HeadlineSeries | null {
  const national = rows.filter(
    (r) => r.geography_key === 'PL' && Object.values(r.dims).every((d) => d === '_T') && Number.isFinite(r.value),
  );
  const source = sourceKey && national.some((r) => r.source_key === sourceKey) ? sourceKey : mostFrequent(national.map((r) => r.source_key));
  if (!source) return null;
  const ofSource = national.filter((r) => r.source_key === source);
  const measure = mostFrequent(ofSource.map((r) => r.measure_key))!;
  const ofMeasure = ofSource.filter((r) => r.measure_key === measure).sort((a, b) => cmp(a.period_start, b.period_start) || cmp(a.period, b.period));
  const byPeriod = new Map<string, SeriesPoint>();
  for (const r of ofMeasure) byPeriod.set(r.period, { date: r.period_start, period: r.period, value: r.value });
  const points = [...byPeriod.values()];
  if (points.length === 0) return null;
  const first = ofMeasure[0];
  return { source_key: source, measure_key: measure, unit_key: first.unit_key, frequency: first.frequency, points };
}

/** The rows the accessible table shows: all points up to `max`, else the first and last `max / 2`. */
export function tablePoints(points: SeriesPoint[], max = 24): { rows: SeriesPoint[]; truncated: boolean } {
  if (points.length <= max) return { rows: points, truncated: false };
  const half = Math.floor(max / 2);
  return { rows: [...points.slice(0, half), ...points.slice(-half)], truncated: true };
}

/**
 * The decimals the source publishes (the most among the points, at most 4): the precision of the
 * y-axis, the tooltip and the data table. A value is rounded to 4 decimals before its decimals are
 * counted, so a float artefact of a derived value (0.1 + 0.2 = 0.30000000000000004) counts as one
 * decimal, not four (Architect review of zohelo#408).
 */
export type Decimals = 0 | 1 | 2 | 3 | 4;

export function seriesDecimals(points: SeriesPoint[]): Decimals {
  let max = 0;
  for (const p of points) {
    if (!Number.isFinite(p.value)) continue;
    const text = String(Number(p.value.toFixed(4)));
    if (text.includes('e')) continue;
    const i = text.indexOf('.');
    if (i >= 0) max = Math.max(max, text.length - i - 1);
  }
  return Math.min(max, 4) as Decimals;
}

export type TickInterval = 'year' | 'quarter' | 'month' | 'day';

/**
 * x ticks for a series of `frequency` ('A', 'Q', 'M', 'D'/'W') over `points`: the interval of the frequency,
 * stepping so that at most `maxLabels` labels show (3–4 at 390 px, 7–8 at 1440 px), and the label format.
 */
export function xTicks(frequency: string, points: SeriesPoint[], maxLabels: number): { interval: TickInterval; step: number; format: string } {
  const interval: TickInterval = frequency === 'A' ? 'year' : frequency === 'Q' ? 'quarter' : frequency === 'M' ? 'month' : 'day';
  const format = interval === 'year' ? '%Y' : interval === 'day' ? '%d %b %Y' : '%b %Y';
  const n = Math.max(points.length, 1);
  return { interval, step: Math.max(1, Math.ceil(n / Math.max(maxLabels, 1))), format };
}
