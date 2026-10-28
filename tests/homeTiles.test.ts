import { describe, expect, test } from 'bun:test';
import { homeTiles } from '../src/indicators/home';
import { readCatalog, readKpiLatest } from '../src/published';

const dir = 'fixtures/published';
const catalog = readCatalog(dir);
const read = (key: string) => readKpiLatest(dir, key);

describe('homeTiles', () => {
  test('pl: the home KPIs in order', () => {
    const tiles = homeTiles(catalog, read, 'pl');
    expect(tiles.map((t) => t.kpi_key)).toEqual(['inflation', 'unemployment_rate', 'gdp_current_prices', 'population']);
    expect(tiles.find((t) => t.kpi_key === 'unemployment_rate')!.value).toBe(3.2);
  });

  test('en labels are the catalog name_en', () => {
    for (const tile of homeTiles(catalog, read, 'en')) {
      expect(tile.label).toBe(catalog.kpis.find((k) => k.kpi_key === tile.kpi_key)!.name_en);
    }
  });

  test('a draft KPI is left out', () => {
    const copy = structuredClone(catalog);
    copy.kpis.find((k) => k.kpi_key === 'inflation')!.status = 'draft';
    expect(homeTiles(copy, read, 'pl')).toHaveLength(3);
  });
});
