import { describe, expect, test } from 'bun:test';
import { readCatalog, readCatalogUngated, readChanges, readGeo, readKpiLatest } from '../src/published';

const dir = 'fixtures/published';

describe('published readers', () => {
  test('catalog has 4 shown KPIs (fx_rate gated, #469) and the unemployment rate in Polish', () => {
    const catalog = readCatalog(dir);
    expect(catalog.kpis).toHaveLength(4);
    expect(readCatalogUngated(dir).kpis).toHaveLength(5);
    expect(catalog.kpis.find((k) => k.kpi_key === 'unemployment_rate')?.name_pl).toBe('Stopa bezrobocia (BAEL)');
  });

  test('latest unemployment rate starts with 3.2', () => {
    expect(readKpiLatest(dir, 'unemployment_rate').values[0].value).toBe(3.2);
  });

  test('changes has 1 shown item of 2 (the NBP item is gated, #469)', () => {
    expect(readChanges(dir).items.map((i) => i.source_key)).toEqual(['eurostat']);
  });

  test('voivodeship geo has 1 feature named Małopolskie', () => {
    const geo = readGeo(dir, 'voivodeship');
    expect(geo.features).toHaveLength(1);
    expect(geo.features[0].properties.name_pl).toBe('Małopolskie');
  });

  test('missing files throw an error naming the path', () => {
    expect(() => readKpiLatest(dir, 'nope')).toThrow(/published file missing/);
    expect(() => readCatalog('fixtures')).toThrow(/published file missing/);
  });
});
