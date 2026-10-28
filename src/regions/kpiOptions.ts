// The KPIs a reader can colour the /regions map with: published KPIs that have voivodeship data.
// Types only from published.ts (it imports node:fs), so this stays usable in the browser.
import type { Locale } from '../i18n';
import type { Catalog } from '../published';

export type KpiOption = { kpi_key: string; name: string; unit: string };

/** Published KPIs with voivodeship data, named in the locale and sorted by name. Pure. */
export function regionalKpis(catalog: Catalog, locale: Locale): KpiOption[] {
  const symbols = new Map(catalog.units.map((u) => [u.unit_key, u.symbol]));
  return catalog.kpis
    .filter((k) => k.status === 'published' && k.geo_levels.includes('voivodeship'))
    .map((k) => ({
      kpi_key: k.kpi_key,
      name: locale === 'pl' ? k.name_pl : k.name_en,
      unit: symbols.get(k.unit_key) ?? k.unit_key,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
