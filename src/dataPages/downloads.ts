import type { SeriesRow } from '../published';

/** Largest file the site build serves under /downloads/; bigger extracts are left to zohelo-bi. */
export const DOWNLOAD_LIMIT = 200_000;

const COLUMNS = ['kpi_key', 'source_key', 'measure_key', 'geography_key', 'geography_level', 'period', 'period_start', 'frequency', 'value', 'unit_key', 'flags'] as const;

function field(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** CSV (RFC 4180 quoting, '\n' line ends, trailing newline) of series.parquet rows; dim columns sorted, as dim_<key>. Pure. */
export function seriesCsv(rows: SeriesRow[]): string {
  const dims = [...new Set(rows.flatMap((r) => Object.keys(r.dims)))].sort();
  const header = [...COLUMNS, ...dims.map((d) => `dim_${d}`)];
  const lines = rows.map((r) =>
    [...COLUMNS.map((c) => String(r[c])), ...dims.map((d) => r.dims[d] ?? '_T')].map(field).join(','),
  );
  return [header.join(','), ...lines].join('\n') + '\n';
}
