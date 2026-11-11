// Writes the synthetic kpi/<kpi_key>/series.parquet fixtures (zohelo-data docs/published.md) into
// fixtures/published. Values are illustrative, like every file there. Run: bun scripts/series-fixture.ts
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parquetWriteFile } from 'hyparquet-writer';

// source_key, measure_key, geography_key, geography_level, period, period_start, frequency, value, flags, dimension member
type Row = [string, string, string, string, string, string, string, number, string, string?];
type Fixture = { unit: string; dim?: string; rows: Row[] };

const fixtures: Record<string, Fixture> = {
  population: {
    unit: 'persons',
    rows: [
      ['gus_bdl', 'P2137', 'PL', 'country', '2023', '2023-01-01', 'A', 37640000, ''],
      ['gus_bdl', 'P2137', 'PL', 'country', '2024', '2024-01-01', 'A', 37490000, ''],
      ['gus_bdl', 'P2137', 'TERC:12', 'voivodeship', '2023', '2023-01-01', 'A', 3440000, ''],
      ['gus_bdl', 'P2137', 'TERC:12', 'voivodeship', '2024', '2024-01-01', 'A', 3430000, ''],
      ['gus_bdl', 'P2137', 'TERC:14', 'voivodeship', '2023', '2023-01-01', 'A', 5500000, ''],
      ['gus_bdl', 'P2137', 'TERC:14', 'voivodeship', '2024', '2024-01-01', 'A', 5510000, ''],
    ],
  },
  gdp_current_prices: {
    unit: 'mln_ncu',
    rows: [
      ['eurostat', 'nama_10_gdp', 'PL', 'country', '2023', '2023-01-01', 'A', 750000, ''],
      ['eurostat', 'nama_10_gdp', 'PL', 'country', '2024', '2024-01-01', 'A', 845000, 'p'],
    ],
  },
  inflation: {
    unit: 'pct',
    rows: [
      ['eurostat', 'prc_hicp_manr', 'PL', 'country', '2026-07', '2026-07-01', 'M', 3.1, ''],
      ['eurostat', 'prc_hicp_manr', 'PL', 'country', '2026-08', '2026-08-01', 'M', 3.0, ''],
      ['eurostat', 'prc_hicp_manr', 'PL', 'country', '2026-09', '2026-09-01', 'M', 2.9, ''],
    ],
  },
  unemployment_rate: {
    unit: 'pct_labour_force',
    rows: [
      ['eurostat', 'une_rt_a', 'PL', 'country', '2023', '2023-01-01', 'A', 2.8, ''],
      ['eurostat', 'une_rt_a', 'PL', 'country', '2024', '2024-01-01', 'A', 2.9, ''],
      ['eurostat', 'une_rt_a', 'PL', 'country', '2025', '2025-01-01', 'A', 3.2, ''],
      ['eurostat', 'une_rt_a', 'TERC:12', 'voivodeship', '2025', '2025-01-01', 'A', 2.6, 'p'],
    ],
  },
  fx_rate: {
    unit: 'pln_per_unit',
    dim: 'dim_currency',
    rows: [
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-26', '2026-10-26', 'D', 4.2531, '', 'EUR'],
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-27', '2026-10-27', 'D', 4.2618, '', 'EUR'],
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-26', '2026-10-26', 'D', 3.6642, '', 'USD'],
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-27', '2026-10-27', 'D', 3.6519, '', 'USD'],
    ],
  },
};

const DAY_MS = 86_400_000;
const text = (name: string) => ({ name, type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' }) as const;

for (const [kpiKey, f] of Object.entries(fixtures)) {
  const at = (i: number) => f.rows.map((r) => r[i] as string);
  const columnData = [
    { name: 'kpi_key', data: f.rows.map(() => kpiKey) },
    { name: 'source_key', data: at(0) },
    { name: 'measure_key', data: at(1) },
    { name: 'geography_key', data: at(2) },
    { name: 'geography_level', data: at(3) },
    { name: 'period', data: at(4) },
    // Parquet DATE = days since 1970-01-01.
    { name: 'period_start', data: f.rows.map((r) => Date.parse(`${r[5]}T00:00:00Z`) / DAY_MS) },
    { name: 'frequency', data: at(6) },
    { name: 'value', data: f.rows.map((r) => r[7]) },
    { name: 'unit_key', data: f.rows.map(() => f.unit) },
    { name: 'flags', data: at(8) },
    ...(f.dim ? [{ name: f.dim, data: at(9) }] : []),
  ];
  const schema = [
    { name: 'root', num_children: columnData.length },
    ...columnData.map((c) =>
      c.name === 'period_start'
        ? ({ name: c.name, type: 'INT32', converted_type: 'DATE', repetition_type: 'REQUIRED' } as const)
        : c.name === 'value'
          ? ({ name: c.name, type: 'DOUBLE', repetition_type: 'REQUIRED' } as const)
          : text(c.name),
    ),
  ];
  const dir = join(import.meta.dir, '..', 'fixtures', 'published', 'kpi', kpiKey);
  mkdirSync(dir, { recursive: true });
  parquetWriteFile({ filename: join(dir, 'series.parquet'), columnData, schema });
  console.log(`series-fixture: ${f.rows.length} rows written to fixtures/published/kpi/${kpiKey}/series.parquet`);
}
