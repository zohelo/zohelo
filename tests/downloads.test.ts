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
