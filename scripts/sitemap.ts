// Writes build/client/sitemap.xml and robots.txt after the build: one <url> per page and language
// (the pages from src/site.config.ts, every published KPI page and every voivodeship profile, at their
// trailing-slash URL), each with its hreflang alternates. Indicator pages carry <lastmod> from the catalog
// loaded_at (the date their data last loaded); other pages have no date and get none. KPIs come from the
// gated catalog (src/licenceGate.ts): a KPI without a shown source has no page and no entry.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { publishedDir, readCatalog, type Catalog } from '../src/published';
import { VOIVODESHIP_TERYT } from '../src/regions/profile';
import { absoluteUrl } from '../src/seo';
import { pages, site } from '../src/site.config';

type Lang = 'pl' | 'en';
const out = join(import.meta.dir, '..', 'build', 'client');

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
// The same URL as the pages' canonical and hreflang tags (src/seo.ts).
const url = (path: string, lang: Lang) => escape(absoluteUrl(path, lang));

/** The sitemap's paths (Polish form) with their lastmod, from a gated catalog. Pure. */
export function sitemapPaths(catalog: Catalog): { path: string; lastmod?: string }[] {
  return [
    ...pages.map((p) => ({ path: p.path })),
    ...catalog.kpis
      .filter((k) => k.status === 'published')
      .map((k) => ({ path: `/indicators/${k.kpi_key}`, lastmod: k.loaded_at.slice(0, 10) })),
    ...VOIVODESHIP_TERYT.map((t) => ({ path: `/regions/${t}` })),
  ];
}

function main() {
  const entries = sitemapPaths(readCatalog(publishedDir())).flatMap(({ path, lastmod }) =>
    (['pl', 'en'] as const).map((lang) =>
      [
        '  <url>',
        `    <loc>${url(path, lang)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        `    <xhtml:link rel="alternate" hreflang="pl" href="${url(path, 'pl')}"/>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${url(path, 'en')}"/>`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(path, 'pl')}"/>`,
        '  </url>',
      ].join('\n'),
    ),
  );

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(join(out, 'sitemap.xml'), sitemap);
  writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
  console.log(`sitemap: ${entries.length} urls written to build/client/sitemap.xml; robots.txt written`);
}

if (import.meta.main) main();
