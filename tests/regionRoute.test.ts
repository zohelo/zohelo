import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { loader } from '../src/routes/region';
import { regionPaths } from '../src/site.config';

const previous = process.env.PUBLISHED_DIR;
beforeAll(() => {
  process.env.PUBLISHED_DIR = 'fixtures/published';
});
afterAll(() => {
  if (previous === undefined) delete process.env.PUBLISHED_DIR;
  else process.env.PUBLISHED_DIR = previous;
});

const load = (path: string, teryt: string) => loader({ params: { teryt }, request: new Request(`http://x${path}`) });

describe('/regions/:teryt loader', () => {
  test('12 in Polish: name and rows', async () => {
    const data = await load('/regions/12', '12');
    expect(data.name).toBe('Małopolskie');
    const unemployment = data.rows.find((r) => r.kpi_key === 'unemployment_rate')!;
    expect(unemployment.value).toBe(2.6);
    expect([unemployment.rank, unemployment.of]).toEqual([1, 1]);
    const population = data.rows.find((r) => r.kpi_key === 'population')!;
    expect([population.rank, population.of]).toEqual([2, 2]);
  });

  test('12 in English', async () => {
    expect((await load('/en/regions/12', '12')).name).toBe('Lesser Poland');
  });

  test('14 falls back to the Polish name', async () => {
    expect((await load('/regions/14', '14')).name).toBe('Mazowieckie');
  });

  test('99 throws a 404 Response', async () => {
    let thrown: unknown;
    try {
      await load('/regions/99', '99');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });
});

describe('regionPaths', () => {
  test('32 paths including /en/regions/32', () => {
    expect(regionPaths()).toHaveLength(32);
    expect(regionPaths()).toContain('/en/regions/32');
  });
});
