import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fetchPublished, seriesPaths } from '../scripts/fetch-published';
import { isFixtureLayer, NO_LATEST, readCatalog, readCatalogUngated, requiredLatest } from '../src/published';

const dirs: string[] = [];
function tempOut(): string {
  const dir = mkdtempSync(join(tmpdir(), 'published-'));
  dirs.push(dir);
  return join(dir, 'out');
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('fetchPublished without credentials', () => {
  test('copies the fixture files and the fixture marker', async () => {
    const out = tempOut();
    const written = await fetchPublished(out, {}, { require: false });
    expect(written.map((p) => relative(out, p)).sort()).toEqual([
      'FIXTURE.txt',
      'catalog/catalog.json',
      'feed/calendar.ics',
      'feed/changes.json',
      'geo/voivodeship.geojson',
      'kpi/fx_rate/series.parquet',
      'kpi/gdp_current_prices/latest.json',
      'kpi/gdp_current_prices/series.parquet',
      'kpi/inflation/latest.json',
      'kpi/inflation/series.parquet',
      'kpi/population/latest.json',
      'kpi/population/series.parquet',
      'kpi/unemployment_rate/latest.json',
      'kpi/unemployment_rate/series.parquet',
      'manifest.json',
    ]);
    expect(existsSync(join(out, 'catalog', 'catalog.json'))).toBe(true);
    expect(isFixtureLayer(out)).toBe(true);
  });

  test('a partial key counts as missing', async () => {
    const out = tempOut();
    const written = await fetchPublished(out, { STORAGE_ENDPOINT_URL: 'https://example.invalid' }, { require: false });
    expect(written).toHaveLength(15);
  });

  test('with require it rejects', async () => {
    const out = tempOut();
    await expect(fetchPublished(out, {}, { require: true })).rejects.toThrow(/credentials missing/);
    expect(existsSync(out)).toBe(false);
  });
});

describe('seriesPaths', () => {
  test('every published KPI in catalog order', () => {
    expect(seriesPaths(readCatalogUngated('fixtures/published'))).toEqual([
      'kpi/population/series.parquet',
      'kpi/gdp_current_prices/series.parquet',
      'kpi/inflation/series.parquet',
      'kpi/unemployment_rate/series.parquet',
      'kpi/fx_rate/series.parquet',
    ]);
  });

  test('a KPI the licence gate drops is not fetched (#469)', () => {
    expect(seriesPaths(readCatalog('fixtures/published'))).not.toContain('kpi/fx_rate/series.parquet');
  });

  test('a draft KPI has no series path', () => {
    const catalog = structuredClone(readCatalog('fixtures/published'));
    catalog.kpis.find((k) => k.kpi_key === 'inflation')!.status = 'draft';
    expect(seriesPaths(catalog)).not.toContain('kpi/inflation/series.parquet');
  });
});

describe('requiredLatest', () => {
  test('every published fixture KPI except fx_rate', () => {
    const catalog = readCatalogUngated('fixtures/published');
    const published = catalog.kpis.filter((k) => k.status === 'published').map((k) => k.kpi_key);
    expect(published).toContain('fx_rate');
    expect(requiredLatest(catalog)).toEqual(published.filter((k) => k !== 'fx_rate'));
    expect(NO_LATEST).toEqual(['fx_rate']);
  });

  test('draft KPIs are not required', () => {
    const catalog = structuredClone(readCatalog('fixtures/published'));
    catalog.kpis.find((k) => k.kpi_key === 'population')!.status = 'draft';
    expect(requiredLatest(catalog)).not.toContain('population');
  });
});
