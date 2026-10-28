import { localizedPath, type Locale } from '../i18n';
import type { Catalog } from '../published';

// Published KPIs of the catalog grouped by their top-level domain, for the /indicators index.
// Pure; only types come from published.ts, which reads files with node:fs.

export type IndicatorLink = { kpi_key: string; name: string; unit: string; last_period: string; href: string };

export type IndicatorGroup = { domain_key: string; name: string; kpis: IndicatorLink[] };

export function indicatorGroups(catalog: Catalog, locale: Locale): IndicatorGroup[] {
  const domains = catalog.domains.filter((d) => d.level === 'domain');
  const units = new Map(catalog.units.map((u) => [u.unit_key, u.symbol]));
  const groups = new Map<string, IndicatorGroup>();

  for (const kpi of catalog.kpis) {
    if (kpi.status !== 'published') continue;
    const domain = domains.find((d) => d.domain_key === kpi.domain_path[0]);
    if (!domain) continue;
    let group = groups.get(domain.domain_key);
    if (!group) {
      group = { domain_key: domain.domain_key, name: locale === 'pl' ? domain.name_pl : domain.name_en, kpis: [] };
      groups.set(domain.domain_key, group);
    }
    group.kpis.push({
      kpi_key: kpi.kpi_key,
      name: locale === 'pl' ? kpi.name_pl : kpi.name_en,
      unit: units.get(kpi.unit_key) ?? kpi.unit_key,
      last_period: kpi.last_period,
      href: localizedPath(`/indicators/${kpi.kpi_key}`, locale),
    });
  }

  const sortOf = (key: string) => domains.find((d) => d.domain_key === key)!.sort;
  const result = [...groups.values()].sort(
    (a, b) => sortOf(a.domain_key) - sortOf(b.domain_key) || (a.domain_key < b.domain_key ? -1 : a.domain_key > b.domain_key ? 1 : 0),
  );
  for (const g of result) g.kpis.sort((a, b) => a.name.localeCompare(b.name, locale));
  return result;
}
