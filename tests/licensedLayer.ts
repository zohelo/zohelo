// A copy of fixtures/published in a temp directory where NBP's licence row has changed as it will
// in zohelo-data once NBP answers (zohelo#469): the source points at an established licence with
// commercial_ok. Only the catalog's licence table differs from the fixtures.
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Catalog } from '../src/published';

export const FIXTURES = 'fixtures/published';

/** The new directory; `rmSync` it when done. */
export function licensedLayer(): string {
  const dir = mkdtempSync(join(tmpdir(), 'published-licensed-'));
  cpSync(FIXTURES, dir, { recursive: true });
  const path = join(dir, 'catalog', 'catalog.json');
  const catalog = JSON.parse(readFileSync(path, 'utf8')) as Catalog;
  catalog.licences.push({
    licence_key: 'nbp_reuse',
    name: 'NBP reuse terms (illustrative)',
    url: 'https://example.invalid/nbp',
    attribution_text: 'Źródło: NBP (illustrative)',
    commercial_ok: true,
  });
  catalog.sources.find((s) => s.source_key === 'nbp')!.licence_key = 'nbp_reuse';
  writeFileSync(path, JSON.stringify(catalog, null, 2));
  return dir;
}
