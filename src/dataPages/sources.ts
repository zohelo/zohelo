import { localizedPath, type Locale } from '../i18n';
import type { Catalog } from '../published';

// The /sources page model: every catalog source with its licence, the KPIs it feeds and its last
// load. Pure; only types come from published.ts, which reads files with node:fs.

export type SourceRow = {
  source_key: string;
  name: string;
  register_id: string;
  licence: { name: string; url: string; attribution: string; commercial_ok: boolean } | null;
  kpis: { kpi_key: string; name: string; href: string }[];
  last_loaded: string | null;
};

export function sourceRows(catalog: Catalog, locale: Locale): SourceRow[] {
  const published = catalog.kpis.filter((k) => k.status === 'published');
  const rows = catalog.sources.map((source): SourceRow => {
    const licence = catalog.licences.find((l) => l.licence_key === source.licence_key);
    const fed = published.filter((k) => k.source_keys.includes(source.source_key));
    const kpis = fed
      .map((k) => ({
        kpi_key: k.kpi_key,
        name: locale === 'pl' ? k.name_pl : k.name_en,
        href: localizedPath(`/indicators/${k.kpi_key}`, locale),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
    const last_loaded = fed.reduce<string | null>((max, k) => (max === null || k.loaded_at > max ? k.loaded_at : max), null);
    return {
      source_key: source.source_key,
      name: locale === 'pl' ? source.name_pl : source.name_en,
      register_id: source.register_id,
      licence: licence
        ? { name: licence.name, url: licence.url, attribution: licence.attribution_text, commercial_ok: licence.commercial_ok }
        : null,
      kpis,
      last_loaded,
    };
  });
  return rows.sort((a, b) => a.name.localeCompare(b.name, locale));
}
