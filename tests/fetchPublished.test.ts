import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fetchPublished } from '../scripts/fetch-published';
import { isFixtureLayer, NO_LATEST, readCatalog, requiredLatest } from '../src/published';

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
      'feed/changes.json',
      'geo/voivodeship.geojson',
      'kpi/gdp_current_prices/latest.json',
      'kpi/inflation/latest.json',
      'kpi/population/latest.json',
      'kpi/unemployment_rate/latest.json',
      'manifest.json',
    ]);
    expect(existsSync(join(out, 'catalog', 'catalog.json'))).toBe(true);
    expect(isFixtureLayer(out)).toBe(true);
  });

  test('a partial key counts as missing', async () => {
    const out = tempOut();
    const written = await fetchPublished(out, { STORAGE_ENDPOINT_URL: 'https://example.invalid' }, { require: false });
    expect(written).toHaveLength(9);
  });

  test('with require it rejects', async () => {
    const out = tempOut();
    await expect(fetchPublished(out, {}, { require: true })).rejects.toThrow(/credentials missing/);
    expect(existsSync(out)).toBe(false);
  });
});

describe('requiredLatest', () => {
  test('every published fixture KPI except fx_rate', () => {
    const catalog = readCatalog('fixtures/published');
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
