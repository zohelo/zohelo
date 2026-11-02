// The home page's chart of the day at build time: the pick over every required latest.json, with its
// source name and file date. Server only (reads files through src/published.ts), so it lives outside
// src/routes and the client imports only its type.
import type { Locale } from '../i18n';
import { readKpiLatest, requiredLatest, type Catalog } from '../published';
import { chartOfDay, type ChartOfDay } from './chartOfDay';

export type HomeChartOfDay = {
  pick: ChartOfDay;
  sourceName: string;
  date: string;
};

/** The chart of the day with its source name in the locale and the file's date; null when there is no pick. */
export function homeChartOfDay(
  dir: string,
  catalog: Catalog,
  locale: Locale,
): HomeChartOfDay | null {
  const files = requiredLatest(catalog).map((k) => readKpiLatest(dir, k));
  const names = Object.fromEntries(
    catalog.kpis.map((k) => [
      k.kpi_key,
      { name_pl: k.name_pl, name_en: k.name_en },
    ]),
  );
  const pick = chartOfDay(files, names);
  if (!pick) return null;
  const source = catalog.sources.find((s) => s.source_key === pick.source_key);
  const sourceName = source
    ? locale === 'pl'
      ? source.name_pl
      : source.name_en
    : pick.source_key;
  const file = files.find((f) => f.kpi_key === pick.kpi_key)!;
  return { pick, sourceName, date: file.generated_at.slice(0, 10) };
}
