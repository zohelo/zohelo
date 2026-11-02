import { describe, expect, test } from 'bun:test';
import { indicatorDescription, indicatorTakeaway } from '../src/indicators/description';

describe('indicatorDescription', () => {
  test('Polish with value and sources', () => {
    expect(
      indicatorDescription('Stopa bezrobocia (BAEL)', { value: 3.2, unit: '%', period: '2025' }, ['Eurostat', 'Bank Światowy – WDI'], 'pl'),
    ).toBe('Stopa bezrobocia (BAEL): 3,2 % (2025). Źródła: Eurostat, Bank Światowy – WDI.');
  });

  test('English with value and one source', () => {
    expect(indicatorDescription('Unemployment rate (LFS)', { value: 3.2, unit: '%', period: '2025' }, ['Eurostat'], 'en')).toBe(
      'Unemployment rate (LFS): 3.2 % (2025). Sources: Eurostat.',
    );
  });

  test('no value and no sources', () => {
    expect(indicatorDescription('X', { value: null, unit: 'PLN', period: '' }, [], 'pl')).toBe('X: najnowsze dane i źródła.');
  });
});

describe('indicatorTakeaway (#389)', () => {
  test('keeps the period after a unit that ends with a dot', () => {
    expect(indicatorTakeaway('Ludność', { value: 37490000, unit: 'os.', period: '2025' }, 'pl')).toBe('Ludność: 37 490 000 os. (2025)');
    expect(indicatorTakeaway('Population', { value: 37490000, unit: 'persons', period: '2025' }, 'en')).toBe('Population: 37,490,000 persons (2025)');
  });

  test('is the first sentence of the description; no value gives the fallback', () => {
    const tile = { value: 3.2, unit: '%', period: '2025' };
    expect(indicatorDescription('X', tile, ['Eurostat'], 'pl')).toBe(`${indicatorTakeaway('X', tile, 'pl')}. Źródła: Eurostat.`);
    expect(indicatorTakeaway('X', { value: null, unit: '%', period: '' }, 'en')).toBe('X: latest data and sources');
  });
});
