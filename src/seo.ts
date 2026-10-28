import type { MetaDescriptor } from 'react-router';
import { localizedPath, type Locale } from './i18n';
import type { Catalog, CatalogKpi } from './published';
import { site } from './site.config';

export type PageMetaInput = { path: string; locale: Locale; title: string; description: string };

const ogLocale: Record<Locale, string> = { pl: 'pl_PL', en: 'en_GB' };

/**
 * The absolute address of a page in a language, with a trailing slash: https://zohelo.com + '/x/' or
 * '/en/x/'. Every page is pre-rendered to <path>/index.html, and Cloudflare Pages answers such a page
 * only at the slash URL (the bare one redirects), so canonical, hreflang and sitemap use that form.
 */
export function absoluteUrl(path: string, locale: Locale): string {
  const local = localizedPath(path, locale);
  return site.url + (local.endsWith('/') ? local : `${local}/`);
}

/**
 * Every head tag a page needs from its title and description: title, description, canonical,
 * hreflang alternates (pl, en, x-default → pl), Open Graph and the Twitter card.
 */
export function pageMeta({ path, locale, title, description }: PageMetaInput): MetaDescriptor[] {
  const url = absoluteUrl(path, locale);
  // React Router writes link descriptors' keys verbatim, so the attribute is spelled 'hreflang'.
  const fullTitle = `${title} · ${site.name}`;
  return [
    { title: fullTitle },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { tagName: 'link', rel: 'alternate', hreflang: 'pl', href: absoluteUrl(path, 'pl') },
    { tagName: 'link', rel: 'alternate', hreflang: 'en', href: absoluteUrl(path, 'en') },
    { tagName: 'link', rel: 'alternate', hreflang: 'x-default', href: absoluteUrl(path, 'pl') },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: ogLocale[locale] },
    { name: 'twitter:card', content: 'summary' },
  ];
}

/**
 * schema.org Dataset JSON-LD for an indicator page. Pure; only types come from published.ts,
 * which reads files with node:fs and must stay out of the client bundle.
 */
export function datasetJsonLd(kpi: CatalogKpi, catalog: Catalog, locale: Locale): Record<string, unknown> {
  const sources = kpi.source_keys.flatMap((key) => catalog.sources.filter((s) => s.source_key === key));
  const unit = catalog.units.find((u) => u.unit_key === kpi.unit_key);
  const names = sources.map((s) => (locale === 'pl' ? s.name_pl : s.name_en)).join(', ');
  const name = locale === 'pl' ? kpi.name_pl : kpi.name_en;
  const unitName = unit ? (locale === 'pl' ? unit.name_pl : unit.name_en) : kpi.unit_key;
  const description =
    locale === 'pl'
      ? `${name}: dane od ${kpi.first_period} do ${kpi.last_period}. Źródła: ${names}. Jednostka: ${unitName}.`
      : `${name}: data from ${kpi.first_period} to ${kpi.last_period}. Sources: ${names}. Unit: ${unitName}.`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: absoluteUrl(`/indicators/${kpi.kpi_key}`, locale),
    identifier: kpi.kpi_key,
    inLanguage: locale,
    temporalCoverage: `${kpi.first_period}/${kpi.last_period}`,
    dateModified: kpi.loaded_at,
    spatialCoverage: { '@type': 'Place', name: locale === 'pl' ? 'Polska' : 'Poland' },
    creator: { '@type': 'Organization', name: site.name, url: site.url },
    isBasedOn: sources.map((s) => ({ '@type': 'CreativeWork', name: locale === 'pl' ? s.name_pl : s.name_en })),
  };

  // One licence only when every source shares it.
  const licenceKeys = new Set(sources.map((s) => s.licence_key));
  const licence = licenceKeys.size === 1 ? catalog.licences.find((l) => licenceKeys.has(l.licence_key)) : undefined;
  if (licence) jsonLd.license = licence.url;
  return jsonLd;
}
