// Build time only (reads files through src/published.ts): the headline series of a KPI for the
// chart on the home card and the indicator page (#389). A KPI without series.parquet gives null and
// the page renders without the chart; an invalid file fails the build, as everywhere else.
import type { Locale } from '../i18n';
import { readKpiSeries, type Unit } from '../published';
import { headlineSeries, type SeriesPoint } from './series';
import { unitLabel } from './unitLabel';

export type ChartSeries = { points: SeriesPoint[]; unit: string };

export async function readHeadlineSeries(
  dir: string,
  kpiKey: string,
  sourceKey: string | null | undefined,
  units: Unit[],
  locale: Locale,
): Promise<ChartSeries | null> {
  let rows;
  try {
    rows = await readKpiSeries(dir, kpiKey);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('published file missing')) return null;
    throw error;
  }
  const series = headlineSeries(rows, sourceKey);
  if (!series || series.points.length < 2) return null;
  return { points: series.points, unit: unitLabel(units, series.unit_key, locale) };
}
