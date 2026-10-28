import type { Locale } from '../i18n';
import type { Catalog } from '../published';

// A KPI's sources with their licences, for the source footer of an indicator page.
// Pure; only types come from published.ts, which reads files with node:fs.

export type KpiSource = {
  source_key: string;
  name: string;
  register_id: string;
  licence: { name: string; url: string; attribution: string } | null;
};

export function kpiSources(catalog: Catalog, kpiKey: string, locale: Locale): KpiSource[] {
  const kpi = catalog.kpis.find((k) => k.kpi_key === kpiKey);
  if (!kpi) throw new Error(`KPI ${kpiKey} is not in the catalog`);
  return kpi.source_keys.flatMap((key) => {
    const source = catalog.sources.find((s) => s.source_key === key);
    if (!source) return [];
    const licence = catalog.licences.find((l) => l.licence_key === source.licence_key);
    return [
      {
        source_key: source.source_key,
        name: locale === 'pl' ? source.name_pl : source.name_en,
        register_id: source.register_id,
        licence: licence ? { name: licence.name, url: licence.url, attribution: licence.attribution_text } : null,
      },
    ];
  });
}

/** SourceFooter props: the source names and the distinct licence names joined by ' · '. */
export function footerProps(sources: KpiSource[]): { sources: { name: string }[]; licence?: string } {
  const licences = [...new Set(sources.flatMap((s) => (s.licence ? [s.licence.name] : [])))];
  const props: { sources: { name: string }[]; licence?: string } = { sources: sources.map((s) => ({ name: s.name })) };
  if (licences.length > 0) props.licence = licences.join(' · ');
  return props;
}
