import { describe, expect, test } from 'bun:test';
import { EDITORIAL, benchmarkLine, benchmarkVerdict, comparisonLine, goodDirection, periodInWords, tileLabel } from '../src/indicators/editorial';

describe('periodInWords (#411)', () => {
  test('monthly, quarterly, annual and daily periods in PL and EN', () => {
    expect(periodInWords('2026-09', 'pl')).toBe('wrzesień 2026');
    expect(periodInWords('2026-09', 'en')).toBe('September 2026');
    expect(periodInWords('2026-01', 'pl')).toBe('styczeń 2026');
    expect(periodInWords('2026-12', 'en')).toBe('December 2026');
    expect(periodInWords('2026-Q2', 'pl')).toBe('II kw. 2026');
    expect(periodInWords('2026-Q4', 'en')).toBe('Q4 2026');
    expect(periodInWords('2025', 'pl')).toBe('2025');
    expect(periodInWords('2025', 'en')).toBe('2025');
    expect(periodInWords('2026-09-15', 'pl')).toBe('15 września 2026');
    expect(periodInWords('2026-09-15', 'en')).toBe('15 September 2026');
  });

  test('unknown forms come back as is', () => {
    for (const p of ['2026-H1', '2026-13', '', 'x']) expect(periodInWords(p, 'pl')).toBe(p);
  });

  test('comparison names the previous period', () => {
    expect(comparisonLine('2026-08', 'pl')).toBe('vs sierpień 2026');
    expect(comparisonLine('2024', 'en')).toBe('vs 2024');
    expect(comparisonLine(null, 'pl')).toBeUndefined();
  });
});

describe('benchmark (#411)', () => {
  const nbp = EDITORIAL.inflation.benchmark!;
  test('1.4 below, 2.9 within, 3.6 above; bounds are within', () => {
    expect(benchmarkVerdict(1.4, nbp)).toBe('below');
    expect(benchmarkVerdict(2.9, nbp)).toBe('within');
    expect(benchmarkVerdict(3.6, nbp)).toBe('above');
    expect(benchmarkVerdict(1.5, nbp)).toBe('within');
    expect(benchmarkVerdict(3.5, nbp)).toBe('within');
  });

  test('the line names the benchmark and the verdict in each language', () => {
    expect(benchmarkLine('inflation', 1.4, 'pl')).toBe('Cel NBP 2,5 % ± 1 p.p.: poniżej celu');
    expect(benchmarkLine('inflation', 2.9, 'pl')).toBe('Cel NBP 2,5 % ± 1 p.p.: w celu');
    expect(benchmarkLine('inflation', 3.6, 'en')).toBe('NBP target 2.5% ± 1 pp: above target');
    expect(benchmarkLine('inflation', null, 'pl')).toBeNull();
    expect(benchmarkLine('population', 37, 'pl')).toBeNull();
  });
});

describe('labels and colour of meaning (#411)', () => {
  test('short name · measure; the catalogue name for KPIs without an entry', () => {
    expect(tileLabel('inflation', 'Inflacja (ceny konsumpcyjne)', 'pl')).toBe('Inflacja HICP · % r/r');
    expect(tileLabel('gdp_current_prices', 'x', 'en')).toBe('GDP, current prices · EUR bn, nominal');
    expect(tileLabel('fx_rate', 'Kurs walut', 'pl')).toBe('Kurs walut');
  });

  test('higher_is maps to the good direction; neutral and unknown get no colour', () => {
    expect(goodDirection('inflation')).toBe('down');
    expect(goodDirection('unemployment_rate')).toBe('down');
    expect(goodDirection('gdp_current_prices')).toBe('up');
    expect(goodDirection('population')).toBeUndefined();
    expect(goodDirection('fx_rate')).toBeUndefined();
  });
});
