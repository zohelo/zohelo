import { describe, expect, test } from 'bun:test';
import { latestTile } from '../src/indicators/tile';
import { readCatalog, readKpiLatest, type KpiLatest, type LatestValue } from '../src/published';

const dir = 'fixtures/published';
const catalog = readCatalog(dir);
const kpi = catalog.kpis.find((k) => k.kpi_key === 'unemployment_rate')!;
const latest = readKpiLatest(dir, 'unemployment_rate');

function row(over: Partial<LatestValue>): LatestValue {
  return {
    source_key: 'eurostat',
    geography_key: 'PL',
    geography_level: 'country',
    period: '2025',
    value: 1,
    flags: [],
    checked_at: '2026-01-01T00:00:00Z',
    ...over,
  };
}

function file(values: LatestValue[]): KpiLatest {
  return { kpi_key: 'unemployment_rate', unit_key: kpi.unit_key, generated_at: '2026-01-01T00:00:00Z', values };
}

describe('latestTile', () => {
  test('fixture in Polish', () => {
    const tile = latestTile(kpi, latest, catalog.units, 'pl');
    expect(tile.label).toBe('Stopa bezrobocia (BAEL)');
    expect(tile.value).toBe(3.2);
    expect(tile.unit).toBe('%');
    expect(tile.delta).toBeCloseTo(0.3);
    expect(tile.period).toBe('2025');
    expect(tile.sourceKey).toBe('eurostat');
    expect(tile.checkedAt).toBe('2026-01-01T00:00:00Z');
    expect(tile.provisional).toBe(false);
  });

  test('fixture in English', () => {
    expect(latestTile(kpi, latest, catalog.units, 'en').label).toBe('Unemployment rate (LFS)');
  });

  test('the first source in source_keys wins', () => {
    const f = file([row({ source_key: 'world_bank_wdi', value: 9 }), row({ source_key: 'eurostat', value: 4 })]);
    expect(latestTile(kpi, f, catalog.units, 'pl').sourceKey).toBe('eurostat');
  });

  test('the smallest source_key when none is in source_keys', () => {
    const f = file([row({ source_key: 'zz' }), row({ source_key: 'aa' })]);
    expect(latestTile(kpi, f, catalog.units, 'pl').sourceKey).toBe('aa');
  });

  test('the latest period wins', () => {
    const f = file([row({ period: '2024', value: 1 }), row({ period: '2025', value: 2 })]);
    const tile = latestTile(kpi, f, catalog.units, 'pl');
    expect(tile.period).toBe('2025');
    expect(tile.value).toBe(2);
  });

  test('no previous value gives no delta; flag p is provisional', () => {
    const tile = latestTile(kpi, file([row({ flags: ['p'] })]), catalog.units, 'pl');
    expect(tile.delta).toBeNull();
    expect(tile.provisional).toBe(true);
  });

  test('regional rows are ignored; no PL row gives an empty tile', () => {
    const f = file([row({ geography_key: 'TERC:12', geography_level: 'voivodeship' })]);
    expect(latestTile(kpi, f, catalog.units, 'pl')).toEqual({
      label: 'Stopa bezrobocia (BAEL)',
      value: null,
      unit: '%',
      delta: null,
      period: kpi.last_period,
      sourceKey: null,
      checkedAt: null,
      provisional: false,
    });
  });

  test('a row with its own unit_key shows that unit', () => {
    const units = [...catalog.units, { unit_key: 'mln_eur', symbol: 'mln EUR', name_en: 'million EUR', name_pl: 'mln EUR', is_rate: false }];
    expect(latestTile(kpi, file([row({ unit_key: 'mln_eur' })]), units, 'pl').unit).toBe('mln EUR');
  });

  test('a row without unit_key shows the KPI unit', () => {
    expect(latestTile(kpi, file([row({})]), catalog.units, 'pl').unit).toBe('%');
  });

  test('a unit_key missing from units is shown as the key', () => {
    expect(latestTile(kpi, file([row({ unit_key: 'usd' })]), catalog.units, 'pl').unit).toBe('usd');
  });

  test('pure', () => {
    const before = JSON.stringify(latest);
    latestTile(kpi, latest, catalog.units, 'pl');
    expect(JSON.stringify(latest)).toBe(before);
  });
});
