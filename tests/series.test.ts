import { describe, expect, test } from 'bun:test';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readKpiSeries, readKpiSeriesUngated } from '../src/published';

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

  test('fx_rate has the currency dimension (before the gate)', async () => {
    const rows = await readKpiSeriesUngated(dir, 'fx_rate');
    expect(rows.map((r) => r.dims.currency)).toEqual(['EUR', 'EUR', 'USD', 'USD']);
    expect(rows[1].period_start).toBe('2026-10-27');
  });

  test('fx_rate (NBP, licence unresolved) has no rows after the gate (#469)', async () => {
    expect(await readKpiSeries(dir, 'fx_rate')).toEqual([]);
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
