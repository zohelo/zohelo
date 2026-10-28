import { describe, expect, test } from 'bun:test';
import { footerProps, kpiSources } from '../src/indicators/sources';
import { readCatalog } from '../src/published';

const catalog = readCatalog('fixtures/published');

describe('kpiSources', () => {
  test('unemployment rate in Polish', () => {
    const sources = kpiSources(catalog, 'unemployment_rate', 'pl');
    expect(sources.map((s) => s.name)).toEqual(['Eurostat', 'Bank Światowy – WDI']);
    expect(sources.map((s) => s.licence?.name)).toEqual(['Creative Commons Attribution 4.0', 'Creative Commons Attribution 4.0']);
    expect(footerProps(sources)).toEqual({
      sources: [{ name: 'Eurostat' }, { name: 'Bank Światowy – WDI' }],
      licence: 'Creative Commons Attribution 4.0',
    });
  });

  test('population in English with two licences', () => {
    const sources = kpiSources(catalog, 'population', 'en');
    expect(sources.map((s) => s.name)).toEqual(['Eurostat', 'World Bank – WDI', 'Statistics Poland – Local Data Bank']);
    expect(footerProps(sources).licence).toBe('Creative Commons Attribution 4.0 · GUS terms of use (illustrative)');
  });

  test('an unknown source_key is skipped', () => {
    const copy = structuredClone(catalog);
    copy.kpis.find((k) => k.kpi_key === 'fx_rate')!.source_keys = ['nope', 'nbp'];
    expect(kpiSources(copy, 'fx_rate', 'pl').map((s) => s.source_key)).toEqual(['nbp']);
  });

  test('no licences', () => {
    const sources = kpiSources({ ...catalog, licences: [] }, 'unemployment_rate', 'pl');
    expect(sources.every((s) => s.licence === null)).toBe(true);
    expect('licence' in footerProps(sources)).toBe(false);
  });

  test('an unknown KPI throws', () => {
    expect(() => kpiSources(catalog, 'nope', 'pl')).toThrow(/not in the catalog/);
  });

  test('the catalog is not mutated', () => {
    const before = JSON.stringify(catalog);
    footerProps(kpiSources(catalog, 'population', 'pl'));
    expect(JSON.stringify(catalog)).toBe(before);
  });
});
