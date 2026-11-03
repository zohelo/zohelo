import { describe, expect, test } from 'bun:test';
import { rankText, spotlightTitles } from '../src/regions/rankText';

describe('rankText (#413)', () => {
  test('16 values: the rank is shown, with the direction at the ends', () => {
    expect(rankText(1, 16, 'pl')).toBe('1. miejsce z 16 (najwyższa wartość)');
    expect(rankText(1, 16, 'en')).toBe('rank 1 of 16 (highest value)');
    expect(rankText(16, 16, 'pl')).toBe('16. miejsce z 16 (najniższa wartość)');
    expect(rankText(16, 16, 'en')).toBe('rank 16 of 16 (lowest value)');
    expect(rankText(5, 16, 'pl')).toBe('5. miejsce z 16');
    expect(rankText(5, 16, 'en')).toBe('rank 5 of 16');
  });

  test('fewer than 16 values: no rank', () => {
    expect(rankText(1, 1, 'pl')).toBeNull();
    expect(rankText(2, 15, 'en')).toBeNull();
  });
});

describe('spotlightTitles (#413)', () => {
  test('name the measure and its direction', () => {
    expect(spotlightTitles('unemployment_rate', 'Stopa bezrobocia (BAEL)', '2025', 'pl')).toEqual({
      top: 'Najwyższa stopa bezrobocia (BAEL), 2025',
      bottom: 'Najniższa stopa bezrobocia (BAEL), 2025',
    });
    expect(spotlightTitles('unemployment_rate', 'Unemployment rate (LFS)', '2025', 'en')).toEqual({
      top: 'Highest unemployment rate (LFS), 2025',
      bottom: 'Lowest unemployment rate (LFS), 2025',
    });
    expect(spotlightTitles('x', 'Ludność', '2024', 'pl').top).toBe('Najwyższe wartości: Ludność, 2024');
  });
});
