import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { loader } from '../src/routes/indicators';
import { prerenderPaths } from '../src/site.config';

const previous = process.env.PUBLISHED_DIR;
beforeAll(() => {
  process.env.PUBLISHED_DIR = 'fixtures/published';
});
afterAll(() => {
  if (previous === undefined) delete process.env.PUBLISHED_DIR;
  else process.env.PUBLISHED_DIR = previous;
});

const load = (url: string) => loader({ request: new Request(url) });

describe('/indicators loader', () => {
  test('groups the fixture KPIs by domain with their tiles', async () => {
    const { groups } = await load('http://x/indicators');
    expect(groups).toHaveLength(4);
    expect(groups[0].domain_key).toBe('economy');
    const unemployment = groups.flatMap((g) => g.kpis).find((k) => k.kpi_key === 'unemployment_rate')!;
    expect(unemployment.tile.value).toBe(3.2);
    expect(unemployment.href).toBe('/indicators/unemployment_rate');
  });

  test('fx_rate (NO_LATEST) has a tile without a value', async () => {
    const { groups } = await load('http://x/indicators');
    const fx = groups.flatMap((g) => g.kpis).find((k) => k.kpi_key === 'fx_rate')!;
    expect(fx.tile.value).toBeNull();
    expect(fx.tile.delta).toBeNull();
    expect(fx.tile.period).toBe('');
  });

  test('English names under /en', async () => {
    const { groups } = await load('http://x/en/indicators');
    const unemployment = groups.flatMap((g) => g.kpis).find((k) => k.kpi_key === 'unemployment_rate')!;
    expect(unemployment.name).toBe('Unemployment rate (LFS)');
    expect(unemployment.tile.label).toBe('Unemployment rate (LFS)');
    expect(unemployment.href).toBe('/en/indicators/unemployment_rate');
  });

  test('pre-rendered in both languages', () => {
    expect(prerenderPaths()).toContain('/indicators');
    expect(prerenderPaths()).toContain('/en/indicators');
  });
});
