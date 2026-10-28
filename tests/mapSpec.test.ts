import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { mapSpec, type MapRow } from '../src/regions/mapSpec';

// The .client module is never imported here: bun has no getComputedStyle.
const geo = JSON.parse(readFileSync('fixtures/published/geo/voivodeship.geojson', 'utf8'));
const rows: MapRow[] = [{ geography_key: 'TERC:12', value: 2.6 }];
const options = (locale: 'pl' | 'en') => ({
  valueTitle: '%',
  locale,
  colors: ['#aaaaaa', '#bbbbbb'] as [string, string],
  noData: '#cccccc',
});
const spec = (locale: 'pl' | 'en') => mapSpec(geo, rows, options(locale)) as Record<string, any>;

describe('mapSpec', () => {
  test('region names follow the locale', () => {
    expect(spec('pl').encoding.tooltip[0].field).toBe('properties.name_pl');
    expect(spec('en').encoding.tooltip[0].field).toBe('properties.name_en');
  });

  test('geometry is the GeoJSON and the rows are joined in', () => {
    const s = spec('pl');
    expect(s.data.values).toBe(geo);
    expect(s.transform[0].from.data.values).toEqual(rows);
  });

  test('colours and the no-data colour', () => {
    const s = spec('en');
    expect(s.encoding.color.scale.range).toEqual(['#aaaaaa', '#bbbbbb']);
    expect(s.encoding.color.condition.value).toBe('#cccccc');
  });
});
