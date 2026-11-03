import { describe, expect, test } from 'bun:test';
import { regionProfile } from '../src/regions/profile';
import { rankRegions } from '../src/regions/ranking';
import { rankText, spotlightTitles } from '../src/regions/rankText';

describe('rankText (#413)', () => {
  test('16 values: the rank is shown, with the direction at the ends', () => {
    expect(rankText(1, 16, false, 'pl')).toBe('1. miejsce z 16 (najwyższa wartość)');
    expect(rankText(1, 16, false, 'en')).toBe('rank 1 of 16 (highest value)');
    expect(rankText(16, 16, true, 'pl')).toBe('16. miejsce z 16 (najniższa wartość)');
    expect(rankText(16, 16, true, 'en')).toBe('rank 16 of 16 (lowest value)');
    expect(rankText(5, 16, false, 'pl')).toBe('5. miejsce z 16');
    expect(rankText(5, 16, false, 'en')).toBe('rank 5 of 16');
  });

  test('a tied minimum: every region with the lowest value says so (shared ranks never reach 16)', () => {
    // 16 values, the two lowest tied at 2.0: both rank 15.
    const values = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 2];
    const keys = values.map((_, i) => `TERC:${String(i * 2 + 2).padStart(2, '0')}`);
    const ranking = rankRegions({
      kpi_key: 'unemployment_rate',
      values: values.map((value, i) => ({ source_key: 'gus_bdl', geography_key: keys[i], geography_level: 'voivodeship', period: '2025', value, flags: [] })),
    })!;
    const texts = keys.map((key) => regionProfile(key, [ranking])[0]).map((p) => rankText(p.rank, p.of, p.lowest, 'pl'));
    expect(texts[0]).toBe('1. miejsce z 16 (najwyższa wartość)');
    expect(texts.slice(-2)).toEqual(['15. miejsce z 16 (najniższa wartość)', '15. miejsce z 16 (najniższa wartość)']);
    expect(texts.filter((t) => t?.includes('najniższa'))).toHaveLength(2);
    expect(rankText(15, 16, true, 'en')).toBe('rank 15 of 16 (lowest value)');
  });

  test('fewer than 16 values: no rank', () => {
    expect(rankText(1, 1, true, 'pl')).toBeNull();
    expect(rankText(2, 15, false, 'en')).toBeNull();
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
