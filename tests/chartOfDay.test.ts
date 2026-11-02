import { describe, expect, test } from 'bun:test';
import {
  chartOfDay,
  HEADLINE_ORDER,
  parseCalendar,
  periodEnd,
  type KpiNames,
  type LatestFile,
} from '../src/growth/chartOfDay';

const now = new Date('2026-11-03T00:00:00Z');
const names: KpiNames = {
  unemployment_rate: { name_pl: 'Stopa bezrobocia (BAEL)', name_en: 'Unemployment rate (LFS)' },
  inflation: { name_pl: 'Inflacja HICP', name_en: 'HICP inflation' },
  gdp_volume_growth: { name_pl: 'PKB realnie', name_en: 'Real GDP' },
  population: { name_pl: 'Ludność', name_en: 'Population' },
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
const file = (kpi_key: string, rows: Row[]): LatestFile => ({ kpi_key, values: rows });
// The bug's case: annual LFS 2.9 → 3.2 (+10.3 %) against monthly HICP 3.0 → 2.9 (−3.3 %).
const unemployment = (rows: Row[] = [row()]) => file('unemployment_rate', rows);
const inflation = (rows: Row[] = [row({ period: '2026-09', value: 2.9, previous_value: 3.0 })]) => file('inflation', rows);

describe('chartOfDay picks the newest release, not the largest change (#410)', () => {
  test('monthly beats annual when both are eligible, whatever the size of the change', () => {
    const c = chartOfDay([unemployment(), inflation()], names, now)!;
    expect(c.kpi_key).toBe('inflation');
    expect(c.period).toBe('2026-09');
    expect(c.headline_pl).toBe('Inflacja HICP: spadek z 3 do 2,9 (2026-09)');
    expect(c.headline_en).toBe('HICP inflation: down from 3 to 2.9 (2026-09)');
  });

  test('a provisional newest row is chosen and its headline says so', () => {
    const rows = [row({ period: '2026-08' }), row({ period: '2026-09', value: 3.4, flags: ['p'] })];
    const c = chartOfDay([unemployment(), inflation(rows)], names, now)!;
    expect(c.kpi_key).toBe('inflation');
    expect(c.period).toBe('2026-09');
    expect(c.provisional).toBe(true);
    expect(c.headline_pl).toBe('Inflacja HICP: wzrost z 2,9 do 3,4 (2026-09, dane wstępne)');
    expect(c.headline_en).toBe('HICP inflation: up from 2.9 to 3.4 (2026-09, preliminary)');
  });

  test('freshness: annual ≤ 18 months, quarterly ≤ 6, monthly ≤ 3 after the end of the period', () => {
    // 2024 ended 1 Jan 2025: 18 months later is 1 Jul 2026, before 3 Nov 2026.
    expect(chartOfDay([unemployment([row({ period: '2024' })])], names, now)).toBeNull();
    expect(chartOfDay([unemployment([row({ period: '2024' })])], names, new Date('2026-07-01T00:00:00Z'))).not.toBeNull();
    // 2026-Q1 ended 1 Apr 2026: 6 months later is 1 Oct 2026.
    expect(chartOfDay([unemployment([row({ period: '2026-Q1' })])], names, now)).toBeNull();
    expect(chartOfDay([unemployment([row({ period: '2026-Q2' })])], names, now)).not.toBeNull();
    // 2026-07 ended 1 Aug 2026: 3 months later is 1 Nov 2026.
    expect(chartOfDay([inflation([row({ period: '2026-07' })])], names, now)).toBeNull();
    expect(chartOfDay([inflation([row({ period: '2026-08' })])], names, now)).not.toBeNull();
  });

  test('a stale annual KPI is not chosen even when it is the only one with a big change', () => {
    const c = chartOfDay([file('population', [row({ period: '2024', value: 9, previous_value: 1 })]), unemployment()], names, now)!;
    expect(c.kpi_key).toBe('unemployment_rate');
  });

  test('a calendar release in the last 7 days beats the changes feed and the frequency', () => {
    const signals = {
      calendar: [{ kpi_key: 'unemployment_rate', at: '2026-11-02T10:00:00Z' }],
      changes: [{ at: '2026-11-02T23:00:00Z', kpi_keys: ['inflation'] }],
    };
    expect(chartOfDay([unemployment(), inflation()], names, now, signals)!.kpi_key).toBe('unemployment_rate');
  });

  test('the newest calendar release wins among several', () => {
    const signals = {
      calendar: [
        { kpi_key: 'inflation', at: '2026-10-30T10:00:00Z' },
        { kpi_key: 'unemployment_rate', at: '2026-11-01T10:00:00Z' },
      ],
    };
    expect(chartOfDay([inflation(), unemployment()], names, now, signals)!.kpi_key).toBe('unemployment_rate');
  });

  test('calendar events older than 7 days or in the future do not count; the changes feed decides', () => {
    const signals = {
      calendar: [
        { kpi_key: 'unemployment_rate', at: '2026-10-20T10:00:00Z' },
        { kpi_key: 'unemployment_rate', at: '2026-11-05T10:00:00Z' },
      ],
      changes: [{ at: '2026-11-01T08:00:00Z', kpi_keys: ['unemployment_rate', 'population'] }],
    };
    const c = chartOfDay([inflation(), unemployment()], names, now, signals)!;
    expect(c.kpi_key).toBe('unemployment_rate');
    const old = { changes: [{ at: '2026-01-01T00:00:00Z', kpi_keys: ['unemployment_rate'] }] };
    expect(chartOfDay([inflation(), unemployment()], names, now, old)!.kpi_key).toBe('inflation');
  });

  test('ties go by the headline order, then kpi_key', () => {
    expect(HEADLINE_ORDER[0]).toBe('inflation');
    const same = [row({ period: '2026-09' })];
    const sig = { calendar: ['inflation', 'gdp_volume_growth'].map((k) => ({ kpi_key: k, at: '2026-11-01T10:00:00Z' })) };
    expect(chartOfDay([file('gdp_volume_growth', same), file('inflation', same)], names, now, sig)!.kpi_key).toBe('inflation');
    expect(chartOfDay([file('gdp_volume_growth', same), file('inflation', same)], names, now)!.kpi_key).toBe('inflation');
    const unknown = { ...names, a_kpi: names.population, z_kpi: names.population };
    expect(chartOfDay([file('z_kpi', same), file('a_kpi', same), file('gdp_volume_growth', same)], unknown, now)!.kpi_key).toBe(
      'gdp_volume_growth',
    );
    expect(chartOfDay([file('z_kpi', same), file('a_kpi', same)], unknown, now)!.kpi_key).toBe('a_kpi');
  });

  test('same frequency: the latest period wins', () => {
    const c = chartOfDay([file('gdp_volume_growth', [row({ period: '2026-Q2' })]), unemployment([row({ period: '2026-Q3' })])], names, now)!;
    expect(c.kpi_key).toBe('unemployment_rate');
  });
});

describe('chartOfDay rows and headlines', () => {
  test('within a KPI the latest period wins over an older source row, ties by frequency then source_key', () => {
    const rows = [row({ source_key: 'world_bank_wdi', period: '2025', value: 3.6 }), row({ period: '2026-09' })];
    expect(chartOfDay([inflation(rows)], names, now)!.source_key).toBe('eurostat');
    const same = [row({ source_key: 'world_bank_wdi' }), row({ source_key: 'gus_bdl' })];
    expect(chartOfDay([unemployment(same)], names, now)!.source_key).toBe('gus_bdl');
  });

  test('no change reads bez zmian / unchanged', () => {
    const c = chartOfDay([unemployment([row({ previous_value: 3.2 })])], names, now)!;
    expect(c.change).toBe(0);
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): bez zmian, 3,2 (2025)');
    expect(c.headline_en).toBe('Unemployment rate (LFS): unchanged at 3.2 (2025)');
  });

  test('without a previous value the headline gives the value only', () => {
    const c = chartOfDay([unemployment([row({ previous_value: undefined })])], names, now)!;
    expect(c.change).toBeNull();
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): 3,2 (2025)');
    expect(c.headline_en).toBe('Unemployment rate (LFS): 3.2 (2025)');
  });

  test('a KPI without a name, regional rows only, an unknown period form or no files give null', () => {
    expect(chartOfDay([{ ...unemployment(), kpi_key: 'unknown' }], names, now)).toBeNull();
    expect(chartOfDay([unemployment([row({ geography_key: 'TERC:12' })])], names, now)).toBeNull();
    expect(chartOfDay([unemployment([row({ period: '2025-H1' })])], names, now)).toBeNull();
    expect(chartOfDay([], names, now)).toBeNull();
  });

  test('does not mutate its input', () => {
    const input = [inflation(), unemployment([row({ period: '2024' }), row()])];
    const copy = structuredClone(input);
    chartOfDay(input, names, now, { calendar: [{ kpi_key: 'inflation', at: '2026-11-01T00:00:00Z' }] });
    expect(input).toEqual(copy);
  });
});

describe('chartOfDay rates (#388)', () => {
  const withUnits: KpiNames = {
    unemployment_rate: { ...names.unemployment_rate, unit_pl: '%', unit_en: '%' },
    gdp: { name_pl: 'PKB w cenach bieżących', name_en: 'GDP at current prices', unit_pl: 'mln EUR', unit_en: 'mln EUR' },
  };

  test('a rate is described by its change in percentage points, with the unit', () => {
    const c = chartOfDay([unemployment()], withUnits, now)!;
    expect(c.rate).toBe(true);
    expect(c.change).toBeCloseTo(0.3, 10);
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): wzrost o 0,3 p.p. do 3,2 % (2025)');
    expect(c.headline_en).toBe('Unemployment rate (LFS): up 0.3 pp to 3.2 % (2025)');
    const down = chartOfDay([unemployment([row({ value: 2.8, previous_value: 2.9 })])], withUnits, now)!;
    expect(down.headline_pl).toBe('Stopa bezrobocia (BAEL): spadek o 0,1 p.p. do 2,8 % (2025)');
    expect(down.headline_en).toBe('Unemployment rate (LFS): down 0.1 pp to 2.8 % (2025)');
  });

  test('a rate is also recognised from the row unit_key when no unit symbol is known', () => {
    const c = chartOfDay([unemployment([row({ unit_key: 'pct_labour_force' })])], names, now)!;
    expect(c.rate).toBe(true);
    expect(c.headline_pl).toBe('Stopa bezrobocia (BAEL): wzrost o 0,3 p.p. do 3,2 (2025)');
  });

  test('a level keeps the from–to headline with its unit', () => {
    const gdp: LatestFile = { kpi_key: 'gdp', values: [row({ period: '2025', value: 845000, previous_value: 750000 })] };
    const c = chartOfDay([gdp], withUnits, now)!;
    expect(c.rate).toBe(false);
    expect(c.change).toBe(95000);
    expect(c.headline_pl).toBe('PKB w cenach bieżących: wzrost z 750 000 do 845 000 mln EUR (2025)');
    expect(c.headline_en).toBe('GDP at current prices: up from 750,000 to 845,000 mln EUR (2025)');
  });
});

describe('periodEnd and parseCalendar', () => {
  test('period forms give the frequency and the first instant after the period', () => {
    expect(periodEnd('2025')).toEqual({ frequency: 'A', end: new Date('2026-01-01T00:00:00Z') });
    expect(periodEnd('2026-Q3')).toEqual({ frequency: 'Q', end: new Date('2026-10-01T00:00:00Z') });
    expect(periodEnd('2026-12')).toEqual({ frequency: 'M', end: new Date('2027-01-01T00:00:00Z') });
    expect(periodEnd('2026-02-28')).toEqual({ frequency: 'D', end: new Date('2026-03-01T00:00:00Z') });
    expect(periodEnd('2026-H1')).toBeNull();
  });

  test('the KPI comes from the UID and the time from DTSTART (zohelo-data calendar_ics)', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'UID:20261109T111500Z-nbp-fx_rate@zohelo.com',
      'DTSTAMP:20261102T000000Z',
      'DTSTART:20261109T111500Z',
      'SUMMARY:NBP: tabela A',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:20261117T100000Z-world_bank_wdi-gdp_current_prices@zohelo.com',
      'DTSTART:20261117T100000Z',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:no uid',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    expect(parseCalendar(ics)).toEqual([
      { kpi_key: 'fx_rate', at: '2026-11-09T11:15:00Z' },
      { kpi_key: 'gdp_current_prices', at: '2026-11-17T10:00:00Z' },
    ]);
  });
});
