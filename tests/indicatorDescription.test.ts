import { describe, expect, test } from 'bun:test';
import { indicatorDescription } from '../src/indicators/description';

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
