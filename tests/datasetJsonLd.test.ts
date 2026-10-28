import { describe, expect, test } from 'bun:test';
import { readCatalog } from '../src/published';
import { datasetJsonLd } from '../src/seo';

const catalog = readCatalog('fixtures/published');
const kpi = (key: string) => catalog.kpis.find((k) => k.kpi_key === key)!;

describe('datasetJsonLd', () => {
  test('unemployment rate in Polish', () => {
    const ld = datasetJsonLd(kpi('unemployment_rate'), catalog, 'pl');
    expect(ld['@type']).toBe('Dataset');
    expect(ld.url).toBe('https://zohelo.com/indicators/unemployment_rate');
    expect(ld.identifier).toBe('unemployment_rate');
    expect(ld.temporalCoverage).toBe('2000/2025');
    expect((ld.isBasedOn as { name: string }[]).map((s) => s.name)).toEqual(['Eurostat', 'Bank Światowy – WDI']);
    expect(ld.license).toBe('https://creativecommons.org/licenses/by/4.0/');
    expect(String(ld.description).startsWith('Stopa bezrobocia (BAEL): dane od 2000')).toBe(true);
    expect(ld.spatialCoverage).toEqual({ '@type': 'Place', name: 'Polska' });
  });

  test('English url and place', () => {
    const ld = datasetJsonLd(kpi('unemployment_rate'), catalog, 'en');
    expect(ld.url).toBe('https://zohelo.com/en/indicators/unemployment_rate');
    expect(ld.spatialCoverage).toEqual({ '@type': 'Place', name: 'Poland' });
    expect(String(ld.description)).toContain('data from 2000 to 2025');
  });

  test('no license when the sources differ in licence', () => {
    expect('license' in datasetJsonLd(kpi('population'), catalog, 'pl')).toBe(false);
  });

  test('unknown source keys are skipped', () => {
    const k = { ...kpi('unemployment_rate'), source_keys: ['nope', 'eurostat'] };
    expect((datasetJsonLd(k, catalog, 'pl').isBasedOn as unknown[]).length).toBe(1);
  });

  test('pure and serialisable', () => {
    const before = JSON.stringify(catalog);
    const ld = datasetJsonLd(kpi('unemployment_rate'), catalog, 'pl');
    expect(JSON.stringify(catalog)).toBe(before);
    expect(JSON.parse(JSON.stringify(ld))).toEqual(ld);
    expect(datasetJsonLd(kpi('unemployment_rate'), catalog, 'pl')).toEqual(ld);
  });
});
