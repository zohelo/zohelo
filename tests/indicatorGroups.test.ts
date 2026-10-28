import { describe, expect, test } from 'bun:test';
import { indicatorGroups } from '../src/indicators/groups';
import { readCatalog } from '../src/published';

const catalog = readCatalog('fixtures/published');
const link = (locale: 'pl' | 'en', key: string) =>
  indicatorGroups(catalog, locale)
    .flatMap((g) => g.kpis)
    .find((k) => k.kpi_key === key)!;

describe('indicatorGroups', () => {
  test('groups in domain order', () => {
    expect(indicatorGroups(catalog, 'pl').map((g) => g.domain_key)).toEqual(['economy', 'finance', 'labour', 'population']);
  });

  test('KPIs sorted by name in each language', () => {
    const economy = (locale: 'pl' | 'en') => indicatorGroups(catalog, locale).find((g) => g.domain_key === 'economy')!;
    expect(economy('pl').kpis.map((k) => k.name)).toEqual(['Inflacja (ceny konsumpcyjne)', 'PKB w cenach bieżących']);
    expect(economy('en').kpis.map((k) => k.name)).toEqual(['GDP, current prices', 'Inflation, consumer prices']);
  });

  test('localized hrefs and unit symbols', () => {
    expect(link('en', 'fx_rate').href).toBe('/en/indicators/fx_rate');
    expect(link('pl', 'fx_rate').href).toBe('/indicators/fx_rate');
    expect(link('pl', 'unemployment_rate').unit).toBe('%');
  });

  test('unpublished KPIs and empty groups are left out', () => {
    const draft = structuredClone(catalog);
    draft.kpis.find((k) => k.kpi_key === 'fx_rate')!.status = 'draft';
    expect(indicatorGroups(draft, 'pl').map((g) => g.domain_key)).not.toContain('finance');
  });

  test('a KPI without a known domain is left out', () => {
    const odd = structuredClone(catalog);
    odd.kpis.find((k) => k.kpi_key === 'population')!.domain_path = ['nope'];
    const keys = indicatorGroups(odd, 'pl').flatMap((g) => g.kpis.map((k) => k.kpi_key));
    expect(keys).not.toContain('population');
    expect(keys).toHaveLength(4);
  });

  test('the catalog is not mutated', () => {
    const before = JSON.stringify(catalog);
    indicatorGroups(catalog, 'en');
    expect(JSON.stringify(catalog)).toBe(before);
  });
});
