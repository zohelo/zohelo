import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router';
import App from '../App';
import { MapChoropleth } from '../components/MapChoropleth.client';
import { SeriesChart } from '../components/SeriesChart.client';
import { homeChartOfDay } from '../growth/homeChartOfDay';
import { localeOf, useLocale, type Locale } from '../i18n';
import { homeTiles } from '../indicators/home';
import { readHeadlineSeries } from '../indicators/readHeadline';
import { SeriesTable } from '../indicators/SeriesTable';
import { calendarEvents, publishedDir, readCalendar, readCatalog, readChanges, readGeo, readKpiLatest, type Catalog, type GeoCollection } from '../published';
import type { SpotlightData, SpotRow } from '../regions/HomeSpotlight';
import { regionalKpis } from '../regions/kpiOptions';
import type { MapRow } from '../regions/mapSpec';
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
  const result = homeSpotlight(dir, catalog, locale);
  const chartOfDay = homeChartOfDay(dir, catalog, locale);
  // The picked KPI's headline series for the chart (#389); null when the KPI has no series.parquet.
  const chartSeries = chartOfDay
    ? await readHeadlineSeries(dir, chartOfDay.pick.kpi_key, chartOfDay.pick.source_key, catalog.units, locale)
    : null;
  return {
    tiles,
    items: readItems(dir),
    sources: catalog.sources,
    spotlight: result?.data ?? null,
    spotlightMap: result?.map ?? null,
    chartOfDay,
    chartSeries,
    // The subscribe links only while the gated calendar has events (zohelo#469).
    calendar: calendarEvents(readCalendar(dir)) > 0,
  };
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

type HomeSpotlightResult = { data: SpotlightData; map: { geo: GeoCollection; rows: MapRow[] } };

/** The unemployment_rate spotlight and its map, or null when the KPI has no voivodeship ranking. */
function homeSpotlight(dir: string, catalog: Catalog, locale: Locale): HomeSpotlightResult | null {
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
  return {
    data: { kpi_key: option.kpi_key, name: option.name, unit: option.unit, period: ranking.period, of: ranking.regions.length, top: rows(top), bottom: rows(bottom) },
    map: { geo, rows: ranking.regions },
  };
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Home() {
  const { tiles, items, sources, spotlight, spotlightMap, chartOfDay, chartSeries, calendar } = useLoaderData<typeof loader>();
  const locale = useLocale();
  // The map is client-only (D25): rendered after hydration, like on /regions.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const map =
    mounted && spotlight && spotlightMap ? (
      <MapChoropleth geo={spotlightMap.geo} rows={spotlightMap.rows} valueTitle={spotlight.unit} locale={locale} label={spotlight.name} />
    ) : null;
  // The chart of the day: the headline is the chart's title and aria-label; the table is the accessible alternative.
  const headline = chartOfDay ? (locale === 'pl' ? chartOfDay.pick.headline_pl : chartOfDay.pick.headline_en) : '';
  const chart =
    chartOfDay && chartSeries ? (
      <>
        {mounted ? <SeriesChart points={chartSeries.points} unit={chartSeries.unit} frequency={chartSeries.frequency} label={headline} locale={locale} /> : null}
        <SeriesTable points={chartSeries.points} unit={chartSeries.unit} caption={headline} locale={locale} />
      </>
    ) : null;
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
      <App
        tiles={tiles}
        items={items}
        sources={sources}
        spotlight={spotlight}
        spotlightMap={map}
        chartOfDay={chartOfDay}
        chartOfDayChart={chart}
        calendar={calendar}
        locale={locale}
      />
    </>
  );
}
