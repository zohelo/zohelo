import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { loader } from '../src/routes/indicator';

const previous = process.env.PUBLISHED_DIR;
beforeAll(() => {
  process.env.PUBLISHED_DIR = 'fixtures/published';
});
afterAll(() => {
  if (previous === undefined) delete process.env.PUBLISHED_DIR;
  else process.env.PUBLISHED_DIR = previous;
});

const load = (path: string, kpi: string) => loader({ request: new Request(`http://x${path}`), params: { kpi } });

describe('/indicators/:kpi loader', () => {
  test('unemployment_rate has its tile and a ranking', async () => {
    const data = await load('/indicators/unemployment_rate', 'unemployment_rate');
    expect(data.tile.value).toBe(3.2);
    expect(data.ranking).not.toBeNull();
    expect(data.geo).not.toBeNull();
    expect(data.jsonLd['@type']).toBe('Dataset');
    expect(data.name).toBe('Stopa bezrobocia (BAEL)');
    expect(data.description).toBe('Stopa bezrobocia (BAEL): 3,2 % (2025). Źródła: Eurostat, Bank Światowy – WDI.');
  });

  test('inflation (#412): the definition, only the drawn source with its dataset, and the NBP band', async () => {
    const pl = await load('/indicators/inflation', 'inflation');
    expect(pl.definition).toStartWith('Zharmonizowany wskaźnik cen konsumpcyjnych (HICP, Eurostat)');
    expect(pl.definition).toContain('Cel inflacyjny NBP: 2,5 % ± 1 p.p. (dla CPI).');
    expect(pl.sources.sources).toEqual([{ name: 'Eurostat', code: 'prc_hicp_manr' }]);
    expect(JSON.stringify(pl.sources)).not.toContain('WDI');
    expect(pl.band).toEqual({ low: 1.5, high: 3.5, label: 'Cel NBP' });
    const en = await load('/en/indicators/inflation', 'inflation');
    expect(en.definition).toStartWith('Harmonised index of consumer prices (HICP, Eurostat)');
    expect(en.band).toEqual({ low: 1.5, high: 3.5, label: 'NBP target' });
  });

  test('a KPI without a note has no definition and no band; its chart source is the drawn one', async () => {
    const data = await load('/indicators/unemployment_rate', 'unemployment_rate');
    expect(data.definition).toBeNull();
    expect(data.band).toBeNull();
    expect(data.sources.sources).toEqual([{ name: 'Eurostat' }]);
  });

  test('English name under /en', async () => {
    const data = await load('/en/indicators/unemployment_rate', 'unemployment_rate');
    expect(data.name).toBe('Unemployment rate (LFS)');
  });

  test('fx_rate (NO_LATEST) has a tile without value, no ranking and no geo', async () => {
    const data = await load('/indicators/fx_rate', 'fx_rate');
    expect(data.tile.value).toBeNull();
    expect(data.tile.delta).toBeNull();
    expect(data.ranking).toBeNull();
    expect(data.geo).toBeNull();
    expect(data.sources.sources.length).toBeGreaterThan(0);
  });

  test('an unknown KPI throws a 404 Response', async () => {
    let thrown: unknown;
    try {
      await load('/indicators/nope', 'nope');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });
});
