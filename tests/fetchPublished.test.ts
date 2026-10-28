import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fetchPublished } from '../scripts/fetch-published';

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
  test('copies the five fixture files', async () => {
    const out = tempOut();
    const written = await fetchPublished(out, {}, { require: false });
    expect(written.map((p) => relative(out, p)).sort()).toEqual([
      'catalog/catalog.json',
      'feed/changes.json',
      'geo/voivodeship.geojson',
      'kpi/unemployment_rate/latest.json',
      'manifest.json',
    ]);
    expect(existsSync(join(out, 'catalog', 'catalog.json'))).toBe(true);
  });

  test('a partial key counts as missing', async () => {
    const out = tempOut();
    const written = await fetchPublished(out, { STORAGE_ENDPOINT_URL: 'https://example.invalid' }, { require: false });
    expect(written).toHaveLength(5);
  });

  test('with require it rejects', async () => {
    const out = tempOut();
    await expect(fetchPublished(out, {}, { require: true })).rejects.toThrow(/credentials missing/);
    expect(existsSync(out)).toBe(false);
  });
});
