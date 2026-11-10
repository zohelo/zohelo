import { describe, expect, test } from 'bun:test';
import { homeTiles } from '../src/indicators/home';
import { readCatalog, readKpiLatest } from '../src/published';

const dir = 'fixtures/published';
const catalog = readCatalog(dir);
const read = (key: string) => readKpiLatest(dir, key);

describe('homeTiles', () => {
  test('pl: the home KPIs in order', () => {
    const tiles = homeTiles(catalog, read, 'pl');
    expect(tiles.map((t) => t.kpi_key)).toEqual(['inflation', 'unemployment_rate', 'gdp_current_prices', 'population']);
    expect(tiles.find((t) => t.kpi_key === 'unemployment_rate')!.value).toBe(3.2);
  });

  test('card anatomy (#411): short name · measure, period in words, comparison, colour of meaning, benchmark, source', () => {
    const pl = Object.fromEntries(homeTiles(catalog, read, 'pl').map((t) => [t.kpi_key, t]));
    expect(pl.inflation.label).toBe('Inflacja HICP · % r/r');
    expect(pl.inflation.value).toBe(2.9);
    expect(pl.inflation.period).toBe('wrzesień 2026');
    expect(pl.inflation.goodDirection).toBe('down');
    expect(pl.inflation.notes).toEqual(['Cel NBP 2,5 % ± 1 p.p.: w celu', 'Eurostat']);
    expect(pl.unemployment_rate.label).toBe('Stopa bezrobocia (BAEL) · % aktywnych zawodowo');
    expect(pl.gdp_current_prices.period).toBe('2024, dane wstępne');
    expect(pl.gdp_current_prices.goodDirection).toBe('up');
    expect(pl.population.goodDirection).toBeUndefined();
    const en = Object.fromEntries(homeTiles(catalog, read, 'en').map((t) => [t.kpi_key, t]));
    expect(en.inflation.label).toBe('HICP inflation · % y/y');
    expect(en.inflation.period).toBe('September 2026');
    expect(en.inflation.notes![0]).toBe('NBP target 2.5% ± 1 pp: within target');
    expect(en.gdp_current_prices.period).toBe('2024, preliminary');
  });

  test('a draft KPI is left out', () => {
    const copy = structuredClone(catalog);
    copy.kpis.find((k) => k.kpi_key === 'inflation')!.status = 'draft';
    expect(homeTiles(copy, read, 'pl')).toHaveLength(3);
  });
});
