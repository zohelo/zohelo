// The chart of the day: the national KPI with the largest relative change in its latest period,
// from kpi/<kpi_key>/latest.json files (zohelo-data docs/published.md). Pure function. A rate (unit
// '%', unit_key 'pct…') is described by its change in percentage points (zohelo#388), a level by the
// change from the previous value.
import { formatNumber, isRateUnit } from '@zohelo/design';

export type LatestFile = {
  kpi_key: string;
  values: {
    source_key: string;
    geography_key: string;
    period: string;
    value: number;
    previous_value?: number;
    unit_key?: string;
    flags: string[];
  }[];
};

/** Names per KPI; the unit symbols per language ('%', 'mln EUR') when the caller has them. */
export type KpiNames = Record<string, { name_pl: string; name_en: string; unit_pl?: string; unit_en?: string }>;

export type ChartOfDay = {
  kpi_key: string;
  source_key: string;
  period: string;
  headline_pl: string;
  headline_en: string;
  /** The relative change, % of the previous value (the pick is by its size). */
  change_pct: number;
  /** value − previous_value: percentage points for a rate, the unit for a level. */
  change: number;
  /** A rate: the change is shown in p.p., never as a relative %. */
  rate: boolean;
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

function headlines(name: KpiNames[string], row: Row, change: number, rate: boolean) {
  const unitPl = name.unit_pl ? ` ${name.unit_pl}` : '';
  const unitEn = name.unit_en ? ` ${name.unit_en}` : '';
  const [prevPl, valPl] = [formatNumber(row.previous_value, 'pl'), `${formatNumber(row.value, 'pl')}${unitPl}`];
  const [prevEn, valEn] = [formatNumber(row.previous_value, 'en'), `${formatNumber(row.value, 'en')}${unitEn}`];
  const p = row.period;
  if (change === 0)
    return {
      headline_pl: `${name.name_pl}: bez zmian, ${valPl} (${p})`,
      headline_en: `${name.name_en}: unchanged at ${valEn} (${p})`,
    };
  if (rate) {
    // A rate changes by points: 'wzrost o 0,3 p.p. do 3,2 %' (number rules, zohelo#388).
    const pp = Math.abs(row.value - row.previous_value);
    const [ppPl, ppEn] = [formatNumber(pp, 'pl'), formatNumber(pp, 'en')];
    return change > 0
      ? {
          headline_pl: `${name.name_pl}: wzrost o ${ppPl} p.p. do ${valPl} (${p})`,
          headline_en: `${name.name_en}: up ${ppEn} pp to ${valEn} (${p})`,
        }
      : {
          headline_pl: `${name.name_pl}: spadek o ${ppPl} p.p. do ${valPl} (${p})`,
          headline_en: `${name.name_en}: down ${ppEn} pp to ${valEn} (${p})`,
        };
  }
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
    const rate = name.unit_pl ? isRateUnit(name.unit_pl) : (row.unit_key ?? '').startsWith('pct');
    candidates.push({
      kpi_key: file.kpi_key,
      source_key: row.source_key,
      period: row.period,
      ...headlines(name, row, change, rate),
      change_pct: change,
      change: row.value - row.previous_value,
      rate,
    });
  }
  candidates.sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct) || cmp(a.kpi_key, b.kpi_key));
  return candidates[0] ?? null;
}
