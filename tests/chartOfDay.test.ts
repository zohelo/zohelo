import { describe, expect, test } from 'bun:test';
import { chartOfDay, type KpiNames, type LatestFile } from '../src/growth/chartOfDay';

const names: KpiNames = {
  unemployment_rate: { name_pl: 'Stopa bezrobocia (BAEL)', name_en: 'Unemployment rate (LFS)' },
  inflation: { name_pl: 'Inflacja (ceny konsumpcyjne)', name_en: 'Inflation, consumer prices' },
};
type Row = LatestFile['values'][number];
const row = (extra: Partial<Row> = {}): Row => ({
  source_key: 'eurostat',
  geography_key: 'PL',
  period: '2025',
  value: 3.2,
  previous_value: 2.9,
  flags: [],
  ...extra,
});
const unemployment = (rows: Row[] = [row()]): LatestFile => ({ kpi_key: 'unemployment_rate', values: rows });
const inflation: LatestFile = {
  kpi_key: 'inflation',
  values: [row({ source_key: 'gus_bdl', period: '2026-09', value: 2.8, previous_value: 2.9 })],
};

describe('chartOfDay', () => {
  test('the largest relative change wins, with headlines in both languages', () => {
    const c = chartOfDay([inflation, unemployment()], names)!;
    expect(c.kpi_key).toBe('unemployment_rate');
    expect(c.source_key).toBe('eurostat');
    expect(c.period).toBe('2025');
    expect(c.change_pct).toBeCloseTo(((3.2 - 2.9) / 2.9) * 100, 10);
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): wzrost z 2,9 do 3,2 (2025)');
    expect(c.headline_en).toBe('Unemployment rate (LFS): up from 2.9 to 3.2 (2025)');
  });

  test('a fall reads spadek / down', () => {
    const c = chartOfDay([inflation], names)!;
    expect(c.headline_pl).toBe('Inflacja (ceny konsumpcyjne): spadek z 2,9 do 2,8 (2026-09)');
    expect(c.headline_en).toBe('Inflation, consumer prices: down from 2.9 to 2.8 (2026-09)');
  });

  test("provisional rows (flags ['p']) are skipped", () => {
    expect(chartOfDay([inflation, unemployment([row({ flags: ['p'] })])], names)!.kpi_key).toBe('inflation');
  });

  test('equal changes pick the lower kpi_key', () => {
    const same = { ...unemployment(), kpi_key: 'a_kpi' };
    const c = chartOfDay([unemployment(), same], { ...names, a_kpi: names.unemployment_rate })!;
    expect(c.kpi_key).toBe('a_kpi');
  });

  test('no change reads bez zmian / unchanged', () => {
    const c = chartOfDay([unemployment([row({ previous_value: 3.2 })])], names)!;
    expect(c.change_pct).toBe(0);
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): bez zmian, 3,2 (2025)');
    expect(c.headline_en).toBe('Unemployment rate (LFS): unchanged at 3.2 (2025)');
  });

  test('the latest period wins over an older source row', () => {
    const rows = [row({ source_key: 'world_bank_wdi', period: '2024', value: 9, previous_value: 1 }), row()];
    const c = chartOfDay([unemployment(rows)], names)!;
    expect(c.source_key).toBe('eurostat');
    expect(c.period).toBe('2025');
  });

  test('same period: the smaller source_key wins', () => {
    const rows = [row({ source_key: 'world_bank_wdi', value: 9, previous_value: 1 }), row({ source_key: 'gus_bdl' })];
    expect(chartOfDay([unemployment(rows)], names)!.source_key).toBe('gus_bdl');
  });

  test('a KPI without a name is skipped', () => {
    expect(chartOfDay([{ ...unemployment(), kpi_key: 'unknown' }], names)).toBeNull();
  });

  test('only regional rows or a zero previous value give null', () => {
    expect(chartOfDay([unemployment([row({ geography_key: 'TERC:12' })])], names)).toBeNull();
    expect(chartOfDay([unemployment([row({ previous_value: 0 })])], names)).toBeNull();
    expect(chartOfDay([unemployment([row({ previous_value: undefined })])], names)).toBeNull();
    expect(chartOfDay([], names)).toBeNull();
  });

  test('does not mutate its input', () => {
    const input = [inflation, unemployment([row({ period: '2024' }), row()])];
    const copy = structuredClone(input);
    chartOfDay(input, names);
    expect(input).toEqual(copy);
  });
});

describe('chartOfDay rates (#388)', () => {
  const withUnits: KpiNames = {
    unemployment_rate: { ...names.unemployment_rate, unit_pl: '%', unit_en: '%' },
    gdp: { name_pl: 'PKB w cenach bieżących', name_en: 'GDP at current prices', unit_pl: 'mln EUR', unit_en: 'mln EUR' },
  };

  test('a rate is described by its change in percentage points, with the unit', () => {
    const c = chartOfDay([unemployment()], withUnits)!;
    expect(c.rate).toBe(true);
    expect(c.change).toBeCloseTo(0.3, 10);
    expect(c.change_pct).toBeCloseTo(((3.2 - 2.9) / 2.9) * 100, 10);
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): wzrost o 0,3 p.p. do 3,2 % (2025)');
    expect(c.headline_en).toBe('Unemployment rate (LFS): up 0.3 pp to 3.2 % (2025)');
    const down = chartOfDay([unemployment([row({ value: 2.8, previous_value: 2.9 })])], withUnits)!;
    expect(down.headline_pl).toBe('Stopa bezrobocia (BAEL): spadek o 0,1 p.p. do 2,8 % (2025)');
    expect(down.headline_en).toBe('Unemployment rate (LFS): down 0.1 pp to 2.8 % (2025)');
  });

  test('a rate is also recognised from the row unit_key when no unit symbol is known', () => {
    const c = chartOfDay([unemployment([row({ unit_key: 'pct_labour_force' })])], names)!;
    expect(c.rate).toBe(true);
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): wzrost o 0,3 p.p. do 3,2 (2025)');
  });

  test('a level keeps the from–to headline with its unit', () => {
    const gdp: LatestFile = { kpi_key: 'gdp', values: [row({ period: '2024', value: 845000, previous_value: 750000 })] };
    const c = chartOfDay([gdp], withUnits)!;
    expect(c.rate).toBe(false);
    expect(c.change).toBe(95000);
    expect(c.headline_pl).toBe('PKB w cenach bieżących: wzrost z 750 000 do 845 000 mln EUR (2024)');
    expect(c.headline_en).toBe('GDP at current prices: up from 750,000 to 845,000 mln EUR (2024)');
  });
});
