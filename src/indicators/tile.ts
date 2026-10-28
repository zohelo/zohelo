import type { Locale } from '../i18n';
import type { CatalogKpi, KpiLatest, Unit } from '../published';

// The national (PL) value of a KPI as KpiTile props, from kpi/<kpi_key>/latest.json.
// Pure; only types come from published.ts, which reads files with node:fs.

export type LatestTile = {
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  period: string;
  sourceKey: string | null;
  checkedAt: string | null;
  provisional: boolean;
};

/**
 * The PL row of the first source in kpi.source_keys that has one (else the smallest source_key),
 * in its latest period.
 */
export function latestTile(kpi: CatalogKpi, latest: KpiLatest, units: Unit[], locale: Locale): LatestTile {
  const label = locale === 'pl' ? kpi.name_pl : kpi.name_en;
  const unit = units.find((u) => u.unit_key === kpi.unit_key)?.symbol ?? kpi.unit_key;
  const rows = latest.values.filter((v) => v.geography_key === 'PL');
  if (rows.length === 0) {
    return { label, value: null, unit, delta: null, period: kpi.last_period, sourceKey: null, checkedAt: null, provisional: false };
  }

  const present = new Set(rows.map((r) => r.source_key));
  const source =
    kpi.source_keys.find((k) => present.has(k)) ?? [...present].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))[0];
  const row = rows
    .filter((r) => r.source_key === source)
    .reduce((best, r) => (r.period > best.period ? r : best));

  return {
    label,
    value: row.value,
    unit,
    delta: row.previous_value !== undefined && row.previous_value !== null ? row.value - row.previous_value : null,
    period: row.period,
    sourceKey: row.source_key,
    checkedAt: row.checked_at,
    provisional: row.flags.includes('p'),
  };
}
