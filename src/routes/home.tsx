import { useLoaderData } from 'react-router';
import App from '../App';
import { localeOf, useLocale, type Locale } from '../i18n';
import { homeTiles } from '../indicators/home';
import { publishedDir, readCatalog, readChanges, readGeo, readKpiLatest, type Catalog } from '../published';
import type { SpotlightData, SpotRow } from '../regions/HomeSpotlight';
import { regionalKpis } from '../regions/kpiOptions';
import { regionName, terytOf } from '../regions/profile';
import { rankRegions } from '../regions/ranking';
import { spotlight } from '../regions/spotlight';
import { absoluteUrl, pageMeta } from '../seo';
import { pages, site } from '../site.config';

const page = pages.find((p) => p.path === '/')!;

// Build time only (ssr: false): the today strip's tiles, the change feed and the regional spotlight from
// the published layer.
export async function loader({ request }: { request: Request }) {
  const locale = localeOf(new URL(request.url).pathname);
  const dir = publishedDir();
  const catalog = readCatalog(dir);
  const tiles = homeTiles(catalog, (k) => readKpiLatest(dir, k), locale);
  return { tiles, items: readItems(dir), sources: catalog.sources, spotlight: homeSpotlight(dir, catalog, locale) };
}

// No feed yet is a normal state; any other problem (an invalid feed) fails the build, as on /changes.
function readItems(dir: string) {
  try {
    return readChanges(dir).items;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('published file missing')) return [];
    throw error;
  }
}

/** The unemployment_rate spotlight, or null when the KPI has no voivodeship ranking. */
function homeSpotlight(dir: string, catalog: Catalog, locale: Locale): SpotlightData | null {
  const option = regionalKpis(catalog, locale).find((o) => o.kpi_key === 'unemployment_rate');
  if (!option) return null;
  const ranking = rankRegions(readKpiLatest(dir, 'unemployment_rate'));
  if (!ranking) return null;
  const geo = readGeo(dir, 'voivodeship');
  const rows = (regions: { geography_key: string; value: number; rank: number }[]): SpotRow[] =>
    regions.flatMap((r) => {
      const teryt = terytOf(r.geography_key);
      return teryt ? [{ teryt, name: regionName(geo, teryt, locale), value: r.value, rank: r.rank }] : [];
    });
  const { top, bottom } = spotlight(ranking);
  return { kpi_key: option.kpi_key, name: option.name, unit: option.unit, period: ranking.period, top: rows(top), bottom: rows(bottom) };
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Home() {
  const { tiles, items, sources, spotlight } = useLoaderData<typeof loader>();
  const locale = useLocale();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: absoluteUrl('/', locale),
    inLanguage: locale,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <App tiles={tiles} items={items} sources={sources} spotlight={spotlight} locale={locale} />
    </>
  );
}
