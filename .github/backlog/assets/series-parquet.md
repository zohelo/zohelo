# series.parquet at build: fixtures, reader, downloads (product owner, 2 Nov 2026)

Source for Tasks `com/site/indicators/pages/series-fixtures`, `com/site/indicators/pages/series-reader` and
`com/site/data-pages/data/downloads`. Contract: zohelo-data `docs/published.md`, section `kpi/<kpi_key>/series.parquet`.
gold.publish writes the file with zstd compression; the fixtures use snappy (hyparquet-writer's default). The reader
reads both (`hyparquet-compressors`). Everything below was run against main of 2 Nov 2026 (lint, tests, build).

## scripts/series-fixture.ts (Task series-fixtures)

Values are illustrative (D26); population is GUS-only (zohelo-data #2286), fx_rate has the `currency` dimension
like its catalog entry. Re-running the script writes byte-identical files.

```ts
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
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-26', '2026-10-26', 'D', 4.25, '', 'EUR'],
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-27', '2026-10-27', 'D', 4.26, '', 'EUR'],
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-26', '2026-10-26', 'D', 3.66, '', 'USD'],
      ['nbp', 'nbp_table_a', '_Z', '_Z', '2026-10-27', '2026-10-27', 'D', 3.65, '', 'USD'],
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
```

## src/published.ts additions (Task series-reader)

1. Imports, directly under `import { join } from 'node:path';`:

```ts
import { parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
```

2. Directly above `export type ChangeItem = {`:

```ts
/** One row of kpi/<kpi_key>/series.parquet; `dims` holds the dim_<dimension_key> columns ('_T' = total). */
export type SeriesRow = {
  kpi_key: string;
  source_key: string;
  measure_key: string;
  geography_key: string;
  geography_level: string;
  period: string;
  // first day of the period, 'YYYY-MM-DD'
  period_start: string;
  frequency: string;
  value: number;
  unit_key: string;
  flags: string;
  dims: Record<string, string>;
};
```

3. At the end of the file:

```ts
const SERIES_COLUMNS = ['kpi_key', 'source_key', 'measure_key', 'geography_key', 'geography_level', 'period', 'period_start', 'frequency', 'value', 'unit_key', 'flags'] as const;

/** Rows of kpi/<kpiKey>/series.parquet (zstd as gold.publish writes it, or snappy as the fixtures). */
export async function readKpiSeries(dir: string, kpiKey: string): Promise<SeriesRow[]> {
  const path = join(dir, 'kpi', kpiKey, 'series.parquet');
  if (!existsSync(path)) throw new Error(`published file missing: ${path}`);
  const bytes = readFileSync(path);
  const file = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  let records: Record<string, unknown>[];
  try {
    records = await parquetReadObjects({ file, compressors });
  } catch {
    throw invalid(path);
  }
  return records.map((r) => {
    if (r.kpi_key !== kpiKey || SERIES_COLUMNS.some((c) => r[c] === undefined || r[c] === null)) throw invalid(path);
    const start = r.period_start instanceof Date ? r.period_start.toISOString().slice(0, 10) : String(r.period_start);
    const dims: Record<string, string> = {};
    for (const [key, value] of Object.entries(r)) if (key.startsWith('dim_')) dims[key.slice(4)] = String(value);
    return {
      kpi_key: kpiKey,
      source_key: String(r.source_key),
      measure_key: String(r.measure_key),
      geography_key: String(r.geography_key),
      geography_level: String(r.geography_level),
      period: String(r.period),
      period_start: start,
      frequency: String(r.frequency),
      value: Number(r.value),
      unit_key: String(r.unit_key),
      flags: String(r.flags),
      dims,
    };
  });
}
```

## tests/series.test.ts (Task series-reader)

```ts
import { describe, expect, test } from 'bun:test';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readKpiSeries } from '../src/published';

const dir = 'fixtures/published';

describe('readKpiSeries', () => {
  test('unemployment_rate rows', async () => {
    const rows = await readKpiSeries(dir, 'unemployment_rate');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual({
      kpi_key: 'unemployment_rate',
      source_key: 'eurostat',
      measure_key: 'une_rt_a',
      geography_key: 'PL',
      geography_level: 'country',
      period: '2023',
      period_start: '2023-01-01',
      frequency: 'A',
      value: 2.8,
      unit_key: 'pct_labour_force',
      flags: '',
      dims: {},
    });
    expect(rows.find((r) => r.geography_key === 'TERC:12')!.flags).toBe('p');
  });

  test('fx_rate has the currency dimension', async () => {
    const rows = await readKpiSeries(dir, 'fx_rate');
    expect(rows.map((r) => r.dims.currency)).toEqual(['EUR', 'EUR', 'USD', 'USD']);
    expect(rows[1].period_start).toBe('2026-10-27');
  });

  test('a missing file names its path', async () => {
    await expect(readKpiSeries(dir, 'nope')).rejects.toThrow(/published file missing: .*kpi\/nope\/series.parquet/);
  });

  test('another KPI or a non-Parquet file is invalid', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'series-'));
    mkdirSync(join(tmp, 'kpi', 'inflation'), { recursive: true });
    writeFileSync(join(tmp, 'kpi', 'inflation', 'series.parquet'), 'hello');
    await expect(readKpiSeries(tmp, 'inflation')).rejects.toThrow(/published file invalid/);
    mkdirSync(join(tmp, 'kpi', 'other'), { recursive: true });
    copyFileSync(join(dir, 'kpi', 'inflation', 'series.parquet'), join(tmp, 'kpi', 'other', 'series.parquet'));
    await expect(readKpiSeries(tmp, 'other')).rejects.toThrow(/published file invalid/);
  });
});
```

## src/dataPages/downloads.ts (Task downloads)

```ts
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
```

## scripts/downloads.ts (Task downloads)

```ts
// Writes build/client/downloads/<kpi_key>.parquet (the published series.parquet, exact bytes) and
// <kpi_key>.csv for every published KPI after the build; a file over DOWNLOAD_LIMIT is skipped.
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOWNLOAD_LIMIT, seriesCsv } from '../src/dataPages/downloads';
import { publishedDir, readCatalog, readKpiSeries } from '../src/published';

const dir = publishedDir();
const out = join(import.meta.dir, '..', 'build', 'client', 'downloads');
mkdirSync(out, { recursive: true });
let written = 0;
for (const kpi of readCatalog(dir).kpis.filter((k) => k.status === 'published')) {
  const src = join(dir, 'kpi', kpi.kpi_key, 'series.parquet');
  if (!existsSync(src)) {
    console.log(`downloads: kpi/${kpi.kpi_key}/series.parquet missing, skipped`);
    continue;
  }
  if (statSync(src).size > DOWNLOAD_LIMIT) {
    console.log(`downloads: kpi/${kpi.kpi_key}/series.parquet over ${DOWNLOAD_LIMIT} bytes, skipped`);
    continue;
  }
  copyFileSync(src, join(out, `${kpi.kpi_key}.parquet`));
  written += 1;
  const csv = seriesCsv(await readKpiSeries(dir, kpi.kpi_key));
  if (Buffer.byteLength(csv) > DOWNLOAD_LIMIT) {
    console.log(`downloads: ${kpi.kpi_key}.csv over ${DOWNLOAD_LIMIT} bytes, skipped`);
    continue;
  }
  writeFileSync(join(out, `${kpi.kpi_key}.csv`), csv);
  written += 1;
}
console.log(`downloads: ${written} files written to build/client/downloads`);
```

## tests/downloads.test.ts (Task downloads)

```ts
import { describe, expect, test } from 'bun:test';
import { seriesCsv } from '../src/dataPages/downloads';
import { readKpiSeries, type SeriesRow } from '../src/published';

const dir = 'fixtures/published';
const HEADER = 'kpi_key,source_key,measure_key,geography_key,geography_level,period,period_start,frequency,value,unit_key,flags';
const row = (over: Partial<SeriesRow>): SeriesRow => ({
  kpi_key: 'k',
  source_key: 's',
  measure_key: 'm',
  geography_key: 'PL',
  geography_level: 'country',
  period: '2025',
  period_start: '2025-01-01',
  frequency: 'A',
  value: 1.5,
  unit_key: 'pct',
  flags: '',
  dims: {},
  ...over,
});

describe('seriesCsv', () => {
  test('unemployment_rate fixture', async () => {
    const lines = seriesCsv(await readKpiSeries(dir, 'unemployment_rate')).split('\n');
    expect(lines[0]).toBe(HEADER);
    expect(lines[1]).toBe('unemployment_rate,eurostat,une_rt_a,PL,country,2023,2023-01-01,A,2.8,pct_labour_force,');
    expect(lines).toHaveLength(6);
    expect(lines[5]).toBe('');
  });

  test('fx_rate has a dim_currency column', async () => {
    const lines = seriesCsv(await readKpiSeries(dir, 'fx_rate')).split('\n');
    expect(lines[0]).toBe(`${HEADER},dim_currency`);
    expect(lines[1].endsWith(',EUR')).toBe(true);
  });

  test('quoting and missing dimension members', () => {
    const csv = seriesCsv([row({ measure_key: 'a,b', flags: 'say "x"', dims: { sex: 'F' } }), row({})]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe(`${HEADER},dim_sex`);
    expect(lines[1]).toBe('k,s,"a,b",PL,country,2025,2025-01-01,A,1.5,pct,"say ""x""",F');
    expect(lines[2].endsWith(',_T')).toBe(true);
  });

  test('no rows gives the header only', () => {
    expect(seriesCsv([])).toBe(`${HEADER}\n`);
  });
});
```
