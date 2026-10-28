import { describe, expect, test } from 'bun:test';
import { rankRegions, type RegionalLatest, type RegionRanking } from '../src/regions/ranking';
import { spotlight } from '../src/regions/spotlight';

type Row = RegionalLatest['values'][number];
const row = (geography_key: string, value: number): Row => ({
  source_key: 'gus_bdl',
  geography_key,
  geography_level: 'voivodeship',
  period: '2025',
  value,
  flags: [],
});
const teryt = Array.from({ length: 16 }, (_, i) => String(2 * (i + 1)).padStart(2, '0'));
// The first `count` voivodeships, TERC:02 highest.
const ranking = (count: number): RegionRanking =>
  rankRegions({ kpi_key: 'unemployment_rate', values: teryt.slice(0, count).map((t, i) => row(`TERC:${t}`, 16 - i)) })!;
const ranks = (regions: { rank: number }[]) => regions.map((r) => r.rank);

describe('spotlight', () => {
  test('16 regions: top 3 and bottom 3', () => {
    const s = spotlight(ranking(16));
    expect(ranks(s.top)).toEqual([1, 2, 3]);
    expect(ranks(s.bottom)).toEqual([14, 15, 16]);
    expect(s.top[0].geography_key).toBe('TERC:02');
    expect(s.bottom[2].geography_key).toBe('TERC:32');
  });

  test('n = 1', () => {
    const s = spotlight(ranking(16), 1);
    expect(ranks(s.top)).toEqual([1]);
    expect(ranks(s.bottom)).toEqual([16]);
  });

  test('fewer than 2n regions never repeat a region', () => {
    expect(ranks(spotlight(ranking(4)).top)).toEqual([1, 2, 3]);
    expect(ranks(spotlight(ranking(4)).bottom)).toEqual([4]);
    expect(ranks(spotlight(ranking(2)).top)).toEqual([1, 2]);
    expect(spotlight(ranking(2)).bottom).toEqual([]);
  });

  test('the ranking is not mutated', () => {
    const r = ranking(16);
    const before = structuredClone(r);
    const s = spotlight(r);
    s.top.pop();
    expect(r).toEqual(before);
  });
});
