import { describe, expect, test } from 'bun:test';
import { rankRegions, type RegionalLatest } from '../src/regions/ranking';

type Row = RegionalLatest['values'][number];
const row = (geography_key: string, value: number, extra: Partial<Row> = {}): Row => ({
  source_key: 'gus_bdl',
  geography_key,
  geography_level: geography_key === 'PL' ? 'country' : 'voivodeship',
  period: '2025',
  value,
  flags: [],
  ...extra,
});
const file = (values: Row[]): RegionalLatest => ({ kpi_key: 'unemployment_rate', values });

describe('rankRegions', () => {
  test('ties share a rank and sort by geography_key', () => {
    const r = rankRegions(file([row('TERC:30', 5), row('TERC:12', 7), row('TERC:02', 7)]))!;
    expect(r.regions.map((x) => [x.geography_key, x.rank])).toEqual([
      ['TERC:02', 1],
      ['TERC:12', 1],
      ['TERC:30', 3],
    ]);
    expect(r.period).toBe('2025');
    expect(r.source_key).toBe('gus_bdl');
  });

  test('national comes from the PL row of the same source and period', () => {
    expect(rankRegions(file([row('TERC:02', 7), row('PL', 6.1)]))!.national).toBe(6.1);
    expect(rankRegions(file([row('TERC:02', 7), row('PL', 6.1, { period: '2024' })]))!.national).toBeNull();
    expect(rankRegions(file([row('TERC:02', 7), row('PL', 6.1, { source_key: 'eurostat' })]))!.national).toBeNull();
  });

  test('a region with an older period is left out', () => {
    const r = rankRegions(file([row('TERC:02', 7), row('TERC:12', 9, { period: '2024' })]))!;
    expect(r.regions.map((x) => x.geography_key)).toEqual(['TERC:02']);
  });

  test('the source with more rows wins; sourceKey overrides it; ties go to the smaller key', () => {
    const values = [row('TERC:02', 7), row('TERC:12', 5), row('TERC:02', 1, { source_key: 'eurostat' })];
    expect(rankRegions(file(values))!.source_key).toBe('gus_bdl');
    const e = rankRegions(file(values), 'eurostat')!;
    expect(e.source_key).toBe('eurostat');
    expect(e.regions).toEqual([{ geography_key: 'TERC:02', value: 1, rank: 1, provisional: false }]);
    const tie = [row('TERC:02', 7), row('TERC:02', 1, { source_key: 'eurostat' })];
    expect(rankRegions(file(tie))!.source_key).toBe('eurostat');
  });

  test("flags ['p'] give provisional true", () => {
    const r = rankRegions(file([row('TERC:02', 7, { flags: ['p'] }), row('TERC:12', 5)]))!;
    expect(r.regions.map((x) => x.provisional)).toEqual([true, false]);
  });

  test('no voivodeship rows give null', () => {
    expect(rankRegions(file([row('PL', 6)]))).toBeNull();
    expect(rankRegions(file([row('TERC:02', 7)]), 'eurostat')).toBeNull();
  });

  test('does not mutate its input', () => {
    const input = file([row('TERC:30', 5), row('TERC:12', 7), row('TERC:02', 7)]);
    const copy = structuredClone(input);
    rankRegions(input);
    expect(input).toEqual(copy);
  });
});
