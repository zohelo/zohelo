import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { rmSync } from 'node:fs';
import { loader } from '../src/routes/indicators';
import { licensedLayer } from './licensedLayer';
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
    // economy, labour, population; finance held only fx_rate, which the licence gate drops (#469)
    expect(groups.map((g) => g.domain_key)).toEqual(['economy', 'labour', 'population']);
    expect(groups[0].domain_key).toBe('economy');
    const unemployment = groups.flatMap((g) => g.kpis).find((k) => k.kpi_key === 'unemployment_rate')!;
    expect(unemployment.tile.value).toBe(3.2);
    expect(unemployment.href).toBe('/indicators/unemployment_rate');
  });

  test('fx_rate (NBP, licence unresolved) is not listed (#469)', async () => {
    const { groups } = await load('http://x/indicators');
    expect(groups.flatMap((g) => g.kpis).map((k) => k.kpi_key)).not.toContain('fx_rate');
  });

  test('fx_rate with an established NBP licence (NO_LATEST) is listed with a tile without a value', async () => {
    const layer = licensedLayer();
    process.env.PUBLISHED_DIR = layer;
    try {
      const { groups } = await load('http://x/indicators');
      const fx = groups.flatMap((g) => g.kpis).find((k) => k.kpi_key === 'fx_rate')!;
      expect(fx.tile.value).toBeNull();
      expect(fx.tile.delta).toBeNull();
      expect(fx.tile.period).toBe('');
    } finally {
      process.env.PUBLISHED_DIR = 'fixtures/published';
      rmSync(layer, { recursive: true, force: true });
    }
  });

  test('English names under /en', async () => {
    const { groups } = await load('http://x/en/indicators');
    const unemployment = groups.flatMap((g) => g.kpis).find((k) => k.kpi_key === 'unemployment_rate')!;
    expect(unemployment.name).toBe('Unemployment rate (LFS)');
    expect(unemployment.tile.label).toBe('Unemployment rate (LFS) · % of labour force');
    expect(unemployment.href).toBe('/en/indicators/unemployment_rate');
  });

  test('pre-rendered in both languages', () => {
    expect(prerenderPaths()).toContain('/indicators');
    expect(prerenderPaths()).toContain('/en/indicators');
  });
});
