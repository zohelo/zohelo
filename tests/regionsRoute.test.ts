import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { loader } from '../src/routes/regions';
import { prerenderPaths } from '../src/site.config';

const previous = process.env.PUBLISHED_DIR;
beforeAll(() => {
  process.env.PUBLISHED_DIR = 'fixtures/published';
});
afterAll(() => {
  if (previous === undefined) delete process.env.PUBLISHED_DIR;
  else process.env.PUBLISHED_DIR = previous;
});

describe('/regions loader', () => {
  test('lists unemployment_rate with a ranking and leaves out inflation', async () => {
    const { geo, kpis } = await loader({ request: new Request('http://x/regions') });
    const keys = kpis.map((k) => k.kpi_key);
    expect(keys).toContain('unemployment_rate');
    expect(keys).not.toContain('inflation');
    const unemployment = kpis.find((k) => k.kpi_key === 'unemployment_rate')!;
    expect(unemployment.ranking.regions.length).toBeGreaterThan(0);
    expect(geo.features.length).toBeGreaterThan(0);
  });

  test('population ranks its two fixture voivodeships', async () => {
    const { kpis } = await loader({ request: new Request('http://x/regions') });
    const population = kpis.find((k) => k.kpi_key === 'population')!;
    expect(population.ranking.regions.map((r) => r.geography_key)).toEqual(['TERC:14', 'TERC:12']);
  });

  test('pre-rendered in both languages', () => {
    expect(prerenderPaths()).toContain('/regions');
    expect(prerenderPaths()).toContain('/en/regions');
  });
});
