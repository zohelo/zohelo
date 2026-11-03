import { describe, expect, test } from 'bun:test';
import { bandOf, datasetOf, definitionOf } from '../src/indicators/definition';

describe('indicator notes (#412)', () => {
  test('inflation: definition PL/EN verbatim from the Bug', () => {
    expect(definitionOf('inflation', 'pl')).toBe(
      'Zharmonizowany wskaźnik cen konsumpcyjnych (HICP, Eurostat): zmiana cen w porównaniu z tym samym miesiącem poprzedniego roku. HICP służy do porównań w UE i może różnić się o kilka dziesiątych punktu od wskaźnika CPI publikowanego przez GUS. Cel inflacyjny NBP: 2,5 % ± 1 p.p. (dla CPI).',
    );
    expect(definitionOf('inflation', 'en')).toBe(
      'Harmonised index of consumer prices (HICP, Eurostat): change in prices on the same month a year earlier. HICP is the EU-comparable measure and can differ by a few tenths of a point from the CPI published by Statistics Poland (GUS). NBP inflation target: 2.5% ± 1 pp (for CPI).',
    );
    expect(definitionOf('population', 'pl')).toBeNull();
  });

  test('the band only for inflation drawn from Eurostat', () => {
    expect(bandOf('inflation', 'eurostat', 'pl')).toEqual({ low: 1.5, high: 3.5, label: 'Cel NBP' });
    expect(bandOf('inflation', 'eurostat', 'en')).toEqual({ low: 1.5, high: 3.5, label: 'NBP target' });
    expect(bandOf('inflation', 'world_bank_wdi', 'pl')).toBeNull();
    expect(bandOf('unemployment_rate', 'eurostat', 'pl')).toBeNull();
    expect(bandOf('inflation', null, 'pl')).toBeNull();
  });

  test('dataset codes', () => {
    expect(datasetOf('inflation', 'eurostat')).toBe('prc_hicp_manr');
    expect(datasetOf('inflation', 'world_bank_wdi')).toBeUndefined();
  });
});
