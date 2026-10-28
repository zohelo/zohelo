import { describe, expect, test } from 'bun:test';
import { sourceRows } from '../src/dataPages/sources';
import { readCatalog } from '../src/published';

const catalog = readCatalog('fixtures/published');
const row = (locale: 'pl' | 'en', key: string, c = catalog) => sourceRows(c, locale).find((r) => r.source_key === key)!;

describe('sourceRows', () => {
  test('sorted by name in each language', () => {
    expect(sourceRows(catalog, 'pl').map((r) => r.name)).toEqual([
      'Bank Światowy – WDI',
      'Eurostat',
      'GUS – Bank Danych Lokalnych',
      'Narodowy Bank Polski',
    ]);
    expect(sourceRows(catalog, 'en').map((r) => r.name)).toEqual([
      'Eurostat',
      'National Bank of Poland',
      'Statistics Poland – Local Data Bank',
      'World Bank – WDI',
    ]);
  });

  test('KPIs fed by each source', () => {
    expect(row('pl', 'gus_bdl').kpis.map((k) => k.kpi_key)).toEqual(['population']);
    expect(row('en', 'nbp').kpis).toEqual([{ kpi_key: 'fx_rate', name: expect.any(String), href: '/en/indicators/fx_rate' }]);
    expect(row('pl', 'eurostat').kpis).toHaveLength(4);
    expect(row('pl', 'eurostat').licence?.name).toBe('Creative Commons Attribution 4.0');
  });

  test('last_loaded is the latest loaded_at of the fed KPIs', () => {
    const fed = catalog.kpis.filter((k) => k.source_keys.includes('eurostat')).map((k) => k.loaded_at).sort();
    expect(row('pl', 'eurostat').last_loaded).toBe(fed[fed.length - 1]);
    const copy = structuredClone(catalog);
    copy.kpis.find((k) => k.kpi_key === 'inflation')!.loaded_at = '2026-10-28T06:00:00Z';
    expect(row('pl', 'eurostat', copy).last_loaded).toBe('2026-10-28T06:00:00Z');
    expect(row('pl', 'nbp', copy).last_loaded).toBe('2026-01-01T00:00:00Z');
  });

  test('unknown licence gives null', () => {
    const copy = structuredClone(catalog);
    copy.sources.find((s) => s.source_key === 'nbp')!.licence_key = 'nope';
    expect(row('pl', 'nbp', copy).licence).toBeNull();
  });

  test('a source no published KPI uses has no KPIs and no last load', () => {
    const copy = structuredClone(catalog);
    copy.kpis.find((k) => k.kpi_key === 'fx_rate')!.status = 'draft';
    expect(row('pl', 'nbp', copy).kpis).toEqual([]);
    expect(row('pl', 'nbp', copy).last_loaded).toBeNull();
  });

  test('the catalog is not mutated', () => {
    const before = JSON.stringify(catalog);
    sourceRows(catalog, 'en');
    expect(JSON.stringify(catalog)).toBe(before);
  });
});
