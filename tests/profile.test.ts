import { describe, expect, test } from 'bun:test';
import { geographyKeyOf, regionPath, regionProfile, terytOf, VOIVODESHIP_TERYT } from '../src/regions/profile';
import { rankRegions, type RegionalLatest, type RegionRanking } from '../src/regions/ranking';

type Row = RegionalLatest['values'][number];
const row = (geography_key: string, value: number): Row => ({
  source_key: 'gus_bdl',
  geography_key,
  geography_level: geography_key === 'PL' ? 'country' : 'voivodeship',
  period: '2025',
  value,
  flags: [],
});
const ranking = (kpi_key: string, values: Row[]): RegionRanking => rankRegions({ kpi_key, values })!;

const unemployment = ranking('unemployment_rate', [row('TERC:02', 7), row('TERC:12', 5), row('TERC:30', 9), row('PL', 6.1)]);

describe('TERYT helpers', () => {
  test('16 voivodeships', () => {
    expect(VOIVODESHIP_TERYT).toHaveLength(16);
  });

  test('geography keys', () => {
    expect(geographyKeyOf('12')).toBe('TERC:12');
    expect(terytOf('TERC:12')).toBe('12');
    expect(terytOf('TERC:1261')).toBeNull();
    expect(terytOf('PL')).toBeNull();
  });

  test('region paths', () => {
    expect(regionPath('12', 'en')).toBe('/en/regions/12');
    expect(regionPath('12', 'pl')).toBe('/regions/12');
  });
});

describe('regionProfile', () => {
  test('the region in one ranking', () => {
    expect(regionProfile('TERC:12', [unemployment])).toEqual([
      { kpi_key: 'unemployment_rate', source_key: 'gus_bdl', period: '2025', value: 5, rank: 3, of: 3, national: 6.1, provisional: false },
    ]);
  });

  test('one row per ranking that has the region, in input order; others skipped', () => {
    const population = ranking('population', [row('TERC:12', 3400), row('TERC:14', 5500)]);
    const without = ranking('wages', [row('TERC:02', 8000)]);
    const rows = regionProfile('TERC:12', [unemployment, without, population]);
    expect(rows.map((r) => [r.kpi_key, r.rank, r.of, r.national])).toEqual([
      ['unemployment_rate', 3, 3, 6.1],
      ['population', 2, 2, null],
    ]);
  });

  test('inputs are not mutated', () => {
    const input = [unemployment];
    const before = structuredClone(input);
    regionProfile('TERC:12', input);
    expect(input).toEqual(before);
  });
});
