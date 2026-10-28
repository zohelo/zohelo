// The chart of the day: the national KPI with the largest relative change in its latest period,
// from kpi/<kpi_key>/latest.json files (zohelo-data docs/published.md). Pure function.
import { formatNumber } from '@zohelo/design';

export type LatestFile = {
  kpi_key: string;
  values: {
    source_key: string;
    geography_key: string;
    period: string;
    value: number;
    previous_value?: number;
    flags: string[];
  }[];
};

export type KpiNames = Record<string, { name_pl: string; name_en: string }>;

export type ChartOfDay = {
  kpi_key: string;
  source_key: string;
  period: string;
  headline_pl: string;
  headline_en: string;
  change_pct: number;
};

type Row = LatestFile['values'][number] & { previous_value: number };

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** The latest final national row with a non-zero previous value: greatest period, ties by source_key. */
function latestNationalRow(file: LatestFile): Row | undefined {
  const rows = file.values.filter(
    (v): v is Row =>
      v.geography_key === 'PL' && v.previous_value !== undefined && v.previous_value !== 0 && !v.flags.includes('p'),
  );
  return [...rows].sort((a, b) => cmp(b.period, a.period) || cmp(a.source_key, b.source_key))[0];
}

function headlines(name: KpiNames[string], row: Row, change: number) {
  const [prevPl, valPl] = [formatNumber(row.previous_value, 'pl'), formatNumber(row.value, 'pl')];
  const [prevEn, valEn] = [formatNumber(row.previous_value, 'en'), formatNumber(row.value, 'en')];
  const p = row.period;
  if (change === 0)
    return {
      headline_pl: `${name.name_pl}: bez zmian, ${valPl} (${p})`,
      headline_en: `${name.name_en}: unchanged at ${valEn} (${p})`,
    };
  return change > 0
    ? {
        headline_pl: `${name.name_pl}: wzrost z ${prevPl} do ${valPl} (${p})`,
        headline_en: `${name.name_en}: up from ${prevEn} to ${valEn} (${p})`,
      }
    : {
        headline_pl: `${name.name_pl}: spadek z ${prevPl} do ${valPl} (${p})`,
        headline_en: `${name.name_en}: down from ${prevEn} to ${valEn} (${p})`,
      };
}

export function chartOfDay(files: LatestFile[], names: KpiNames): ChartOfDay | null {
  const candidates: ChartOfDay[] = [];
  for (const file of files) {
    const name = names[file.kpi_key];
    const row = name ? latestNationalRow(file) : undefined;
    if (!name || !row) continue;
    const change = ((row.value - row.previous_value) / Math.abs(row.previous_value)) * 100;
    candidates.push({
      kpi_key: file.kpi_key,
      source_key: row.source_key,
      period: row.period,
      ...headlines(name, row, change),
      change_pct: change,
    });
  }
  candidates.sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct) || cmp(a.kpi_key, b.kpi_key));
  return candidates[0] ?? null;
}
