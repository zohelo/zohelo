import { afterAll, describe, expect, test } from 'bun:test';
import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readCatalog } from '../src/published';
import { loader } from '../src/routes/changes';
import { prerenderPaths } from '../src/site.config';

const fixtures = 'fixtures/published';
const noFeed = mkdtempSync(join(tmpdir(), 'published-nofeed-'));
mkdirSync(join(noFeed, 'catalog'));
cpSync(join(fixtures, 'catalog', 'catalog.json'), join(noFeed, 'catalog', 'catalog.json'));

const previous = process.env.PUBLISHED_DIR;
afterAll(() => {
  if (previous === undefined) delete process.env.PUBLISHED_DIR;
  else process.env.PUBLISHED_DIR = previous;
  rmSync(noFeed, { recursive: true, force: true });
});

describe('/changes route', () => {
  test('pre-rendered in both languages', () => {
    expect(prerenderPaths()).toContain('/changes');
    expect(prerenderPaths()).toContain('/en/changes');
  });

  test('loader reads the feed and the catalog sources', async () => {
    process.env.PUBLISHED_DIR = fixtures;
    const data = await loader();
    expect(data.items).toHaveLength(2);
    expect(data.sources).toEqual(readCatalog(fixtures).sources);
  });

  test('no feed gives no items', async () => {
    process.env.PUBLISHED_DIR = noFeed;
    expect((await loader()).items).toEqual([]);
  });
});
