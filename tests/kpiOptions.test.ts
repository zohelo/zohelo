import { describe, expect, test } from 'bun:test';
import { readCatalog } from '../src/published';
import { regionalKpis } from '../src/regions/kpiOptions';

const catalog = readCatalog('fixtures/published');

describe('regionalKpis', () => {
  test('Polish options, sorted by name, with unit symbols', () => {
    expect(regionalKpis(catalog, 'pl')).toEqual([
      { kpi_key: 'population', name: 'Ludność', unit: 'os.' },
      { kpi_key: 'unemployment_rate', name: 'Stopa bezrobocia (BAEL)', unit: '%' },
    ]);
  });

  test('English names', () => {
    expect(regionalKpis(catalog, 'en').map((o) => o.name)).toEqual(['Population', 'Unemployment rate (LFS)']);
  });

  test('KPIs without voivodeship data are left out', () => {
    expect(catalog.kpis.find((k) => k.kpi_key === 'inflation')?.geo_levels).toEqual(['country']);
    expect(regionalKpis(catalog, 'pl').map((o) => o.kpi_key)).not.toContain('inflation');
  });

  test('only published KPIs', () => {
    const draft = structuredClone(catalog);
    draft.kpis.find((k) => k.kpi_key === 'population')!.status = 'draft';
    expect(regionalKpis(draft, 'pl').map((o) => o.kpi_key)).toEqual(['unemployment_rate']);
  });

  test('unit falls back to the unit_key', () => {
    const noUnits = { ...structuredClone(catalog), units: [] };
    expect(regionalKpis(noUnits, 'pl').find((o) => o.kpi_key === 'unemployment_rate')?.unit).toBe('pct_labour_force');
  });

  test('does not mutate the catalog', () => {
    const before = structuredClone(catalog);
    regionalKpis(catalog, 'pl');
    regionalKpis(catalog, 'en');
    expect(catalog).toEqual(before);
  });
});
