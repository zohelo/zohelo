// The /regions map spec: choroplethSpec() over the voivodeship GeoJSON, joined on geography_key and
// named in the page's language; a click on a region opens its profile. Pure, so it is tested without a
// browser.
import { choroplethSpec } from '@zohelo/design/visuals';
import type { Locale } from '../i18n';

export type MapRow = { geography_key: string; value: number };

export function mapSpec(
  geo: object,
  rows: MapRow[],
  o: { valueTitle: string; locale: Locale; colors: [string, string]; noData: string },
) {
  const s = choroplethSpec(geo, rows, {
    key: 'geography_key',
    value: 'value',
    name: o.locale === 'pl' ? 'name_pl' : 'name_en',
    valueTitle: o.valueTitle,
    colors: o.colors,
    noData: o.noData,
  });
  const c: Record<string, any> = s;
  const prefix = o.locale === 'pl' ? '/regions/' : '/en/regions/';
  return {
    ...c,
    transform: [...c.transform, { calculate: `'${prefix}' + substring(datum.properties.geography_key, 5)`, as: 'href' }],
    mark: { ...c.mark, cursor: 'pointer' },
    encoding: { ...c.encoding, href: { field: 'href', type: 'nominal' } },
  } as typeof s;
}
