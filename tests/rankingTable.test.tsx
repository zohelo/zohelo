import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { readGeo, readKpiLatest } from '../src/published';
import { RankingTable, rankingRows } from '../src/regions/RankingTable';
import { rankRegions } from '../src/regions/ranking';

const dir = 'fixtures/published';
const ranking = rankRegions(readKpiLatest(dir, 'unemployment_rate'))!;
const geo = readGeo(dir, 'voivodeship');

describe('rankingRows', () => {
  test('Polish names and notes', () => {
    expect(rankingRows(ranking, geo, 'pl')).toEqual([{ rank: 1, region: 'Małopolskie', value: 2.6, note: 'dane wstępne', href: '/regions/12' }]);
  });

  test('English names and notes', () => {
    expect(rankingRows(ranking, geo, 'en')).toEqual([{ rank: 1, region: 'Lesser Poland', value: 2.6, note: 'provisional', href: '/en/regions/12' }]);
  });

  test('an unknown geography_key is shown as the key', () => {
    const unknown = { ...ranking, regions: [{ geography_key: 'TERC:99', value: 1, rank: 1, provisional: false }] };
    expect(rankingRows(unknown, geo, 'pl')[0]).toEqual({ rank: 1, region: 'TERC:99', value: 1, note: '', href: null });
  });
});

describe('RankingTable', () => {
  test('Polish markup has the formatted value and the national line', () => {
    const html = renderToStaticMarkup(<RankingTable ranking={ranking} geo={geo} unit="%" locale="pl" />);
    expect(html).toContain('2,6');
    expect(html).toContain('Polska: 3,2 %');
    expect(html).toContain('Ranking województw');
  });

  test('region names link to their profiles', () => {
    const pl = renderToStaticMarkup(<RankingTable ranking={ranking} geo={geo} unit="%" locale="pl" />);
    const en = renderToStaticMarkup(<RankingTable ranking={ranking} geo={geo} unit="%" locale="en" />);
    expect(pl).toContain('href="/regions/12"');
    expect(en).toContain('href="/en/regions/12"');
  });

  test('no national line when the national value is missing', () => {
    const html = renderToStaticMarkup(<RankingTable ranking={{ ...ranking, national: null }} geo={geo} unit="%" locale="pl" />);
    expect(html).not.toContain('Polska:');
  });
});
