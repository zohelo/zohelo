// The /regions map spec: choroplethSpec() over the voivodeship GeoJSON, joined on geography_key and
// named in the page's language. Pure, so it is tested without a browser.
import { choroplethSpec } from '@zohelo/design/visuals';
import type { Locale } from '../i18n';

export type MapRow = { geography_key: string; value: number };

export function mapSpec(
  geo: object,
  rows: MapRow[],
  o: { valueTitle: string; locale: Locale; colors: [string, string]; noData: string },
) {
  return choroplethSpec(geo, rows, {
    key: 'geography_key',
    value: 'value',
    name: o.locale === 'pl' ? 'name_pl' : 'name_en',
    valueTitle: o.valueTitle,
    colors: o.colors,
    noData: o.noData,
  });
}
